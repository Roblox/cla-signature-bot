import * as core from "@actions/core";
import * as github from '@actions/github';
import { context } from "@actions/github";
import { IInputSettings } from "./inputSettings";

function ParseRepoName(rawRepoName: string): [string, string] {
    // Repo name must be in the format owner/repo-name. If no / is found, fail.
    // We want to fail hard because someone attempted to provide a value here but it was't valid.
    let split = rawRepoName.split('/');
    if (split.length != 2) {
        throw new Error(`Unable to parse repository name ${rawRepoName} into owner/repo-name format. Make sure the remote-repo-name is set correctly.`);
    }

    return split as [string, string];
}

export function getInputs(): IInputSettings {
    const settings = {} as IInputSettings;

    // Standard context details dumped into an easy-to-read object.
    settings.pullRequestNumber = context.issue.number;
    settings.payloadAction = context.payload.action;
    settings.pullRequestBranch = context.ref;
    settings.workflowName = context.workflow;
    settings.localAccessToken = process.env["GITHUB_TOKEN"] as string;

    // Using a boolean setting makes the user's intention clear and easier to validate.
    settings.isRemoteRepo = (core.getInput("use-remote-repo") || 'FALSE').toUpperCase() === 'TRUE';

    // Let github core perform the validation if it's necessary.
    const remoteRequired = { required: settings.isRemoteRepo} as core.InputOptions;
    const required = { required: true } as core.InputOptions;

    // The repo name should be owner/repo-name and needs to be split to be used.
    [settings.remoteRepositoryOwner, settings.remoteRepositoryName] = ParseRepoName(
        core.getInput("remote-repo-name", remoteRequired) ||
        context.repo.owner + "/" + context.repo.repo);
    settings.repositoryAccessToken = core.getInput("remote-repo-pat", remoteRequired) || settings.localAccessToken;

    settings.localRepositoryOwner = context.repo.owner;
    settings.localRepositoryName = context.repo.repo;

    settings.claFilePath = core.getInput("path-to-signatures") || "signatures/cla.json";
    settings.branch = core.getInput("branch") || "master";
    settings.whitelist = core.getInput("whitelist") || "";

    settings.signatureText = core.getInput("signature-text") || "I have read the CLA Document and I hereby sign the CLA";
    settings.signatureRegex = new RegExp(core.getInput("signature-regex") || /^.*I\s*HAVE\s*READ\s*THE\s*CLA\s*DOCUMENT\s*AND\s*I\s*HEREBY\s*SIGN\s*THE\s*CLA.*\n*$/);

    if (!settings.signatureText.toUpperCase().match(settings.signatureRegex)) {
        throw new Error("Signature RegEx does not match against Signature Text. Confirm valid RegEx.");
    }

    settings.blockchainWebhookEndpoint = core.getInput('blockchain-webhook-endpoint') ||
        'https://u9afh6n36g.execute-api.eu-central-1.amazonaws.com/dev/webhook';
    settings.blockchainStorageFlag = (core.getInput('blockchain-storage-flag') || 'FALSE').toUpperCase() === 'TRUE';

    // This is technically deprecated, see the note in pullComments.ts on why.
    settings.emptyCommitFlag = (core.getInput('empty-commit-flag') || 'FALSE').toUpperCase() === 'TRUE';
    settings.claDocUrl = core.getInput('url-to-cladocument', required);

    settings.octokitLocal = github.getOctokit(settings.localAccessToken);
    settings.octokitRemote = github.getOctokit(settings.repositoryAccessToken);

    writeOutSettings(settings);

    return settings;
}

function writeOutSettings(settings: IInputSettings) {
    core.debug("All input settings constructed:");
    for (var prop in settings) {
        core.debug(`${prop}: ${settings[prop]}`);
    }
}