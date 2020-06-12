import { GitHub } from "@actions/github/lib/utils";

export interface IInputSettings {
    /**
     * The payload action triggering the action run.
     */
    payloadAction: string | undefined;

    /**
     * The pull request number for this execution.
     */
    pullRequestNumber: number;

    /**
     * This workflow's name.
     */
    workflowName: string;

    /**
     * Whether the repository is remote or not.
     */
    isRemoteRepo: boolean

    /**
     * Whether to treat the remote repository as readonly.
     */
    isRemoteRepoReadonly: boolean

    /**
     * The name of the repository where the CLA file is stored.
     */
    remoteRepositoryName: string

    /**
     * The owner account of the repository where the CLA file is stored.
     */
    remoteRepositoryOwner: string

    /**
     * The name of the repository where the CLA file is stored.
     */
    localRepositoryName: string

    /**
     * The owner account of the repository where the CLA file is stored.
     */
    localRepositoryOwner: string

    /**
     * The PAT for accessing the repository where the CLA file is stored.
     */
    repositoryAccessToken: string

    /**
     * The access token for accessing this repository's details, such as PR comments.
     */
    localAccessToken: string

    /**
     * The path in the repo where the CLA file is stored.
     */
    claFilePath: string

    /**
     * The branch of the repo where the CLA file is stored.
     */
    branch: string

    /**
     * The whitelist of accounts which should not be prompted to sign the CLA.
     */
    whitelist: string

    /**
     * The regex to search PR comments for as a signature.
     */
    signatureRegex: RegExp

    /**
     * The text to treat as the signature for the CLA.
     */
    signatureText: string

    /**
     * Whether to store signature events in the blockchain.
     */
    blockchainStorageFlag: boolean

    /**
     * The blockchain webhook endpoint to call with signature details.
     */
    blockchainWebhookEndpoint: string

    /**
     * Whether to add an empty commit when a signature is detected.
     */
    emptyCommitFlag: boolean

    /**
     * The URL of the CLA document to link to when asking for signatures.
     */
    claDocUrl: string

    /**
     * The octokit instance for interacting with the CLA file's repository.
     */
    octokitRemote: InstanceType<typeof GitHub>

    /**
     * The octokit instance for interacting with this repository.
     */
    octokitLocal: InstanceType<typeof GitHub>
}
