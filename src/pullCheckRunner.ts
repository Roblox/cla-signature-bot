import { IInputSettings } from "./inputSettings";

export class PullCheckRunner {
    readonly settings: IInputSettings;

    constructor(settings: IInputSettings) {
        this.settings = settings
    }

    public async rerunLastCheck() {
        const workflowId = await this.getSelfWorkflowId();
        const runs = await this.settings.octokitLocal.actions.listWorkflowRuns({
            owner: this.settings.localRepositoryOwner,
            repo: this.settings.localRepositoryName,
            workflow_id: workflowId,
            branch: this.settings.pullRequestBranch,
            event: "pull_request"
        });

        if (runs.data.total_count > 0) {
            // Workflows are listed in reverse chronological order, so the first
            // one should be the latest run that we can re-run.
            // In theory it doesn't actually matter which one we run since we get
            // the CLA file and set of comments every time.
            const runUrl = runs.data.workflow_runs[0].rerun_url;
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
}
