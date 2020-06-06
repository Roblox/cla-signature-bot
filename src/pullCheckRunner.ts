import * as core from '@actions/core';
import { IInputSettings } from "./inputSettings";

export class PullCheckRunner {
    readonly settings: IInputSettings;

    constructor(settings: IInputSettings) {
        this.settings = settings
    }

    public async rerunLastCheck() {
        if (this.settings.payloadAction === "pull_request") {
            // We don't want to re-run ourselves in an infinite loop.
            return;
        }

        core.info("Re-running blocking commit check.");
        const [workflowId, prBranch] = await Promise.all([
            await this.getSelfWorkflowId(),
            await this.getBranchOfPullRequest(),
        ]);
        core.debug(`Self workflow ID  is ${workflowId}`);
        core.debug(`PR branch is ${prBranch}`)

        const runs = await this.settings.octokitLocal.actions.listWorkflowRuns({
            owner: this.settings.localRepositoryOwner,
            repo: this.settings.localRepositoryName,
            branch: prBranch,
            workflow_id: workflowId,
            event: "pull_request"
        });
        core.debug(`Found ${runs.data.total_count} previous runs.`);

        if (runs.data.total_count > 0) {
            // Workflows are listed in reverse chronological order, so the first
            // one should be the latest run that we can re-run.
            // In theory it doesn't actually matter which one we run since we get
            // the CLA file and set of comments every time.
            const runUrl = runs.data.workflow_runs[0].rerun_url;
            core.debug(`Running build using URL ${runUrl}`);
            await this.settings.octokitLocal.request(runUrl);
        }
    }

    private async getSelfWorkflowId(): Promise<number> {
        const workflowList = await this.settings.octokitLocal.actions.listRepoWorkflows({
            owner: this.settings.localRepositoryOwner,
            repo: this.settings.localRepositoryName,
        });

        const workflow = workflowList.data.workflows
            .find(w => w.name == this.settings.workflowName);

        if (!workflow) {
            throw new Error("Unable to locate this workflow's ID in this repository, can't retrigger job..");
        }

        return workflow.id;
    }

    private async getBranchOfPullRequest(): Promise<string> {
        const pr = await this.settings.octokitLocal.pulls.get({
            owner: this.settings.localRepositoryOwner,
            repo: this.settings.localRepositoryName,
            pull_number: this.settings.pullRequestNumber
        });

        return pr.data.head.ref;
    }
}
