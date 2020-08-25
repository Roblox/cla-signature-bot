import * as core from "@actions/core";
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

    public async setClaComment(authorMap: AuthorMap): Promise<string> {
        const commentContent = this.getCommentContent(authorMap);
        const existingComment = await this.getExistingComment();
        try{
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
        } catch (error) {
            if (error.status === 403) {
                // No permissions to write a comment usually indicates this is running from a fork, so give up
                // attempting to add or modify the comment.
                core.warning("Can't add PR comment because this action executed from a fork. Have anyone add a comment to the PR to execute the action from the primary repository context instead of a fork to add the PR comment.");
                return "";
            }

            throw (error);
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

Thank you for your submission, we really appreciate it. We ask that ${subjectString} read and sign our [Contributor License Agreement](${claUrl}) before we can accept your contribution. You can sign the CLA by just by adding a comment to this pull request with this exact sentence:

> ***${signatureString}***

By commenting with the above message you are agreeing to the terms of the CLA. Your account will be recorded as agreeing to our CLA so you don't need to sign it again for future contributions to this repository.

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