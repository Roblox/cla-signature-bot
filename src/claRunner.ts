import * as core from '@actions/core';
import { Author } from "./authorMap";
import { BlockchainPoster } from "./blockchainPoster";
import { ClaFileRepository } from "./claFileRepository";
import { Allowlist } from "./claAllowlist";
import { IInputSettings } from "./inputSettings";
import { PullComments } from './pullComments';
import { PullAuthors } from './pullAuthors';
import { PullCheckRunner } from './pullCheckRunner';

export class ClaRunner {
    readonly settings: IInputSettings;
    readonly claFileRepository: ClaFileRepository;
    readonly allowlist: Allowlist;
    readonly pullComments: PullComments;
    readonly pullAuthors: PullAuthors;
    readonly blockchainPoster: BlockchainPoster;
    readonly pullCheckRunner: PullCheckRunner;

    constructor({
        inputSettings,
        claRepo,
        claAllowlist,
        pullComments,
        pullAuthors,
        blockchainPoster,
        pullCheckRunner }: {
            inputSettings: IInputSettings;
            claRepo?: ClaFileRepository;
            claAllowlist?: Allowlist;
            pullComments?: PullComments;
            pullAuthors?: PullAuthors;
            blockchainPoster?: BlockchainPoster;
            pullCheckRunner?: PullCheckRunner;
        }) {
        this.settings = inputSettings;
        this.claFileRepository = (!claRepo) ? new ClaFileRepository(this.settings) : claRepo;
        this.allowlist = (!claAllowlist) ? new Allowlist(this.settings.allowlist) : claAllowlist;
        this.pullComments = (!pullComments) ? new PullComments(this.settings) : pullComments
        this.pullAuthors = (!pullAuthors) ? new PullAuthors(this.settings) : pullAuthors
        this.blockchainPoster = (!blockchainPoster) ? new BlockchainPoster(this.settings) : blockchainPoster
        this.pullCheckRunner = (!pullCheckRunner) ? new PullCheckRunner(this.settings) : pullCheckRunner;
    }

    public async execute(): Promise<boolean> {
        if (this.settings.payloadAction === "closed") {
            // PR is closed and should be locked to preserve signatures.
            await this.lockPullRequest();
            return true;
        }

        // Just drop allowlisted authors entirely, no sense in processing them.
        let rawAuthors: Author[] = await this.pullAuthors.getAuthors();
        rawAuthors = rawAuthors.filter(a => !this.allowlist.isUserAllowlisted(a));

        if (rawAuthors.length === 0) {
            core.info("No committers left after allowlisting. Approving pull request.");
            return true;
        }

        core.debug(`Found a total of ${rawAuthors.length} authors after allowlisting.`);
        core.debug(`Authors: ${rawAuthors.map(n => n.name).join(', ')}`);

        const claFile = await this.claFileRepository.getClaFile();
        let authorMap = claFile.mapSignedAuthors(rawAuthors);

        let newSignature = claFile.addSignature(await this.pullComments.getNewSignatures(authorMap));
        if (newSignature.length > 0) {
            const newNames = newSignature.map(s => s.name).join(', ');
            core.debug(`Found new signatures: ${newNames}.`)
            authorMap = claFile.mapSignedAuthors(rawAuthors);
            await Promise.all([
                this.claFileRepository.commitClaFile(`Add ${newNames}.`),
                this.blockchainPoster.postToBlockchain(newSignature),
                this.pullComments.setClaComment(authorMap),
                this.pullCheckRunner.rerunLastCheck()
            ]);
        } else {
            await this.pullComments.setClaComment(authorMap);
        }

        if (!authorMap.allSigned()) {
            core.setFailed("Waiting on additional CLA signatures.");
            return false;
        }

        return true;
    }

    private async lockPullRequest(): Promise<any> {
        core.info(`Locking pull request #${this.settings.pullRequestNumber} to safe guard the pull request's CLA signatures.`);
        try {
            await this.settings.octokitLocal.issues.lock({
                owner: this.settings.localRepositoryOwner,
                repo: this.settings.localRepositoryName,
                issue_number: this.settings.pullRequestNumber
            });
            core.info(`Successfully locked pull request #${this.settings.pullRequestNumber}.`);
        } catch (error) {
            core.error(`Failed to lock pull request #${this.settings.pullRequestNumber}.`);
        }
    }
}