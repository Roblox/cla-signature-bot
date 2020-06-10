import { IInputSettings } from "./inputSettings";
import { AuthorMap } from "./authorMap";
import { SignEvent } from "./signEvent";

export class PullComments {
    readonly settings: IInputSettings;

    readonly BotName = "CLA Signature Action";
    readonly BotNameRegex = new RegExp(`.*${this.BotName}.*`);

    constructor(settings: IInputSettings) {
        this.settings = settings
    }

    // NOTE: This has been removed because it is no longer necessary with the
    // implementation of PullCheckRunner. The PullCheckRunner will re-run any blocking
    // PR checks, while this was used to add an empty commit and re-fire any blocking
    // PR checks but didn't work for forks.
    // This code is kept juuuuuust in case but should probably be removed if you're
    // reading it in the future.
    // /**
    //  * Adds an empty commit when an author signs the CLA.
    //  * @param authorName The name of the author who signed the CLA.
    //  */
    // public async addEmptyCommit(authorName: string) {
    //     core.info(`Adding empty commit to record that ${authorName} signed the CLA.`)
    //     try {
    //         const owner = this.settings.localRepositoryOwner;
    //         const repo = this.settings.localRepositoryName;
    //         const octokit = this.settings.octokitLocal;

    //         // Get the pull request attached to this issue
    //         const pullRequestResponse = await octokit.pulls.get({
    //             owner: owner,
    //             repo: repo,
    //             pull_number: this.settings.pullRequestNumber
    //         });

    //         // ..which gets us the latest commit SHA..
    //         const baseCommit = await octokit.git.getCommit({
    //             owner: owner,
    //             repo: repo,
    //             commit_sha: pullRequestResponse.data.head.sha
    //         });

    //         // ..which we use to build an identical git tree..
    //         const tree = await octokit.git.getTree({
    //             owner: owner,
    //             repo: repo,
    //             tree_sha: baseCommit.data.tree.sha
    //         });

    //         // ..which we can use to construct a new commit..
    //         const newCommit = await octokit.git.createCommit(
    //             {
    //                 owner: owner,
    //                 repo: repo,
    //                 message: `${authorName} signed the CLA.`,
    //                 tree: tree.data.sha,
    //                 parents: [pullRequestResponse.data.head.sha]
    //             }
    //         );

    //         // ..which we push on to the PR's branch.
    //         return octokit.git.updateRef({
    //             owner: owner,
    //             repo: repo,
    //             ref: `heads/${pullRequestResponse.data.head.ref}`,
    //             sha: newCommit.data.sha
    //         });
    //         // Whew!
    //     } catch (error) {
    //         core.error(`Failed to add empty commit with contributor's signature name.`);
    //     }
    // }

    public async setClaComment(authorMap: AuthorMap): Promise<string> {
        const commentContent = this.getCommentContent(authorMap);
        const existingComment = await this.getExistingComment();
        if (!existingComment) {
            let result = await this.settings.octokitLocal.issues.createComment({
                owner: this.settings.localRepositoryOwner,
                repo: this.settings.localRepositoryName,
                issue_number: this.settings.pullRequestNumber,
                body: commentContent
            });
            return result.data.body;
        } else {
            let result = await this.settings.octokitLocal.issues.updateComment({
                owner: this.settings.localRepositoryOwner,
                repo: this.settings.localRepositoryName,
                comment_id: existingComment.id,
                body: commentContent
            });
            return result.data.body;
        }
    }

    private async getExistingComment() {
        try {
            const response = await this.settings.octokitLocal.issues.listComments({
                owner: this.settings.localRepositoryOwner,
                repo: this.settings.localRepositoryName,
                issue_number: this.settings.pullRequestNumber
            });
            return response.data.find(c => c.body.match(this.BotNameRegex));
        } catch (error) {
            throw new Error(`Failed to get PR comments: ${error.message}. Details: ${JSON.stringify(error)}`);
        }
    }

    private getCommentContent(authorMap: AuthorMap): string {
        if (authorMap.allSigned()) {
            return `**${this.BotName}:** All authors have signed the CLA. You may need to manually re-run the blocking PR check if it doesn't pass in a few minutes.`;
        }

        const subjectString = (authorMap.count > 1) ? "you all" : "you";
        const claUrl = this.settings.claDocUrl;
        const signatureString = this.settings.signatureText;

        // Build out the list of author signing status
        let authorText = "";
        const signed = authorMap.getSigned();
        const unsigned = authorMap.getUnsigned();

        authorText += `**${signed.length}** out of **${authorMap.count}** committers have signed the CLA.\n`;
        signed.forEach(a => authorText += `:white_check_mark: @${a.name}\n`);
        unsigned.forEach(a => authorText += `:x: @${a.name}\n`);

        let noAccount = authorMap.getNonGithubAccounts();
        if (noAccount.length > 0) {
            authorText += "---\n";
            authorText += `GitHub can't find an account for **${noAccount.map(a => a.name).join(', ')}**.\n`
            authorText += "You need a GitHub account to be able to sign the CLA. If you have already a GitHub account, please [add the email address used for this commit to your account](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user)."
        }

        return `**${this.BotName}:**

Thank you for your submission, we really appreciate it. Like many open-source projects, we ask that ${subjectString} read and sign our [Contributor License Agreement](${claUrl}) before we can accept your contribution. You can sign the CLA by just by adding a comment to this pull request with this exact sentence:

> ***${signatureString}***

By commenting with the above message you are agreeing to the terms of the CLA. Your account will be recorded as agreeing to our CLA so you don't need to sign it again for future contributions to our company's repositories.

${authorText}
`;
    }

    public async getNewSignatures(authorMap: AuthorMap): Promise<SignEvent[]> {
        const unsigned = authorMap.getUnsigned();
        if (unsigned.length == 0) {
            return [];
        }

        const [commentList, repoId] = await Promise.all([
            this.settings.octokitLocal.issues.listComments({
                owner: this.settings.localRepositoryOwner,
                repo: this.settings.localRepositoryName,
                issue_number: this.settings.pullRequestNumber
            }),
            this.getRepoId()]);

        // Limit the search space to comments actually made by the people who haven't
        // signed yet, we only want new signatures.
        return commentList.data
            .filter(c => unsigned.some(a => a.id === c.user.id)
                && c.body.toUpperCase().match(this.settings.signatureRegex))
            .map(comment => ({
                id: comment.user.id,
                name: comment.user.login,
                pullRequestNo: this.settings.pullRequestNumber,
                comment_id: comment.id,
                created_at: comment.created_at,
                repoId: repoId,
            } as SignEvent));
    }

    private async getRepoId(): Promise<number> {
        return (await this.settings.octokitLocal.repos.get({
            owner: this.settings.localRepositoryOwner,
            repo: this.settings.localRepositoryName
        })).data.id;
    }
}