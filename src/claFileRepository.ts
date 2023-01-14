import * as core from '@actions/core';
import { ClaFile } from "./claFile";
import { IInputSettings } from "./inputSettings";

export class ClaFileRepository {
    readonly settings: IInputSettings;

    private _file?: ClaFile;
    private _fileSha?: string;

    constructor(settings: IInputSettings) {
        this.settings = settings;
    }

    public async getClaFile(): Promise<ClaFile> {
        if (!this._file) {
            [this._file, this._fileSha] = await this.getOrCreateClaFile();
        }

        return this._file;
    }

    public async commitClaFile(commitMessage = "Updating CLA Signature File"): Promise<ClaFile> {
        // Ensure the SHA is up to date before proceeding
        if (!this._file) {
            [this._file, this._fileSha] = await this.getOrCreateClaFile();
        }

        core.debug("Committing CLA file back to source repository.");
        const updateResult = await this.updateClaFile(commitMessage, this._file, this._fileSha);
        this._fileSha = updateResult.data.commit.sha;
        return this._file;
    }

    private async getOrCreateClaFile(): Promise<[ClaFile, string]> {
        core.debug("Getting CLA file from source repository.");
        try {
            const fileResult = await this.settings.octokitRemote.repos.getContents({
                owner: this.settings.remoteRepositoryOwner,
                repo: this.settings.remoteRepositoryName,
                path: this.settings.claFilePath,
                ref: this.settings.branch,
            });

            // We shouldn't get back an array for this, if we do it's a config problem.
            if (Array.isArray(fileResult.data)) {
                throw new Error("More than one file was found for the CLA file path. Make sure the CLA file path setting references a single file, not a path.");
            }

            // Cache the Sha in case we need to add commits to the operation.
            return [new ClaFile(fileResult.data.content), fileResult.data.sha];
        } catch (error) {
            // Only want to catch if the result is a response with a 404 error code, indicating no file was found.
            if (error.status === 404) {
                core.debug("Creating CLA file as it does not currently exist.");
                const claFile = new ClaFile();
                const createResult = await this.updateClaFile("Creating CLA signature file", claFile);

                return [claFile, createResult.data.commit.sha];
            } else {
                throw new Error(`Failed to get CLA file contents: ${error.message}. Details: ${JSON.stringify(error)}`);
            }
        }
    }

    private async updateClaFile(
        commitMessage: string,
        claFile: ClaFile,
        fileSha?: string): Promise<any> {
        if (this.settings.isRemoteRepoReadonly) {
            throw new Error(`Cannot write to remote repo as no remote-repo-pat was provided. This usually means this check was run in a pull request from a fork. Initialize the CLA file manually, or open a PR from a branch in the protected repository, not a fork, and using an account that is not allowlisted.`);
        }

        return await this.settings.octokitRemote.repos.createOrUpdateFile({
            owner: this.settings.remoteRepositoryOwner,
            repo: this.settings.remoteRepositoryName,
            path: this.settings.claFilePath,
            branch: this.settings.branch,
            message: commitMessage,
            content: claFile.toBase64(),
            sha: fileSha,
        });
    }
}
