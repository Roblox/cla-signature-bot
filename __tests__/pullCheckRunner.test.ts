import { IInputSettings } from "../src/inputSettings";
import * as github from '@actions/github';
import { PullCheckRunner } from "../src/pullCheckRunner";

const mockGitHub = github.getOctokit("1234567890123456789012345678901234567890");

const settings = {
    localRepositoryOwner: "some-owner",
    localRepositoryName: "repo-name",
    claFilePath: "path/to/cla.json",
    branch: "master",
    octokitLocal: mockGitHub,
    workflowName: "WorkflowName"
} as IInputSettings;

const workflowRun = {
    "id": 154,
    "node_id": "MDExO4NDc3",
    "head_branch": "master",
    "head_sha": "d4ffbc49d428723242470c447d544918c4bd9f7e",
    "run_number": 21,
    "event": "issue_comment",
    "status": "completed",
    "conclusion": "success",
    "workflow_id": 1403,
    "url": "https://api.github.com/repos/owner/reponame/actions/runs/154864",
    "html_url": "https://github.com/owner/reponame/actions/runs/154864",
    "pull_requests": [],
    "created_at": "2020-06-04T22:45:26Z",
    "updated_at": "2020-06-04T22:45:42Z",
    "jobs_url": "https://api.github.com/repos/owner/reponame/actions/runs/154864/jobs",
    "logs_url": "https://api.github.com/repos/owner/reponame/actions/runs/154864/logs",
    "check_suite_url": "https://api.github.com/repos/owner/reponame/check-suites/757428205",
    "artifacts_url": "https://api.github.com/repos/owner/reponame/actions/runs/154864/artifacts",
    "cancel_url": "https://api.github.com/repos/owner/reponame/actions/runs/154864/cancel",
    "rerun_url": "https://api.github.com/repos/owner/reponame/actions/runs/154864/rerun",
    "workflow_url": "https://api.github.com/repos/owner/reponame/actions/workflows/1703",
    "head_commit": {
        "id": "d4ffbc49d428723242470c447d544918c4bd9f7e",
        "tree_id": "8dbce61624331ecb223a99245299c88f1267d19e",
        "message": "Merge pull request #4 from someuser/someuser-patch-3\n\nUpdate README.md",
        "timestamp": "2020-06-04T22:44:47Z",
        "author": {
            "name": "someuser",
            "email": "47404136+someuser@users.noreply.github.com"
        },
        "committer": {
            "name": "GitHub",
            "email": "noreply@github.com"
        }
    },
    "repository": {
        "id": 2682,
        "node_id": "MDEwOzU4ODI=",
        "name": "TestRepo",
        "full_name": "owner/reponame",
        "private": false,
        "owner": {
            "login": "someuser",
            "id": 4736,
            "node_id": "MDQ6MTM2",
            "avatar_url": "https://avatars2.githubusercontent.com/u/476?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/someuser",
            "html_url": "https://github.com/someuser",
            "followers_url": "https://api.github.com/users/someuser/followers",
            "following_url": "https://api.github.com/users/someuser/following{/other_user}",
            "gists_url": "https://api.github.com/users/someuser/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/someuser/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/someuser/subscriptions",
            "organizations_url": "https://api.github.com/users/someuser/orgs",
            "repos_url": "https://api.github.com/users/someuser/repos",
            "events_url": "https://api.github.com/users/someuser/events{/privacy}",
            "received_events_url": "https://api.github.com/users/someuser/received_events",
            "type": "User",
            "site_admin": false
        },
        "git_url": "",
        "ssh_url": "",
        "html_url": "https://github.com/owner/reponame",
        "description": "Test repo to check out CLA github action",
        "fork": false,
        "url": "https://api.github.com/repos/owner/reponame",
        "forks_url": "https://api.github.com/repos/owner/reponame/forks",
        "keys_url": "https://api.github.com/repos/owner/reponame/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/owner/reponame/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/owner/reponame/teams",
        "hooks_url": "https://api.github.com/repos/owner/reponame/hooks",
        "issue_events_url": "https://api.github.com/repos/owner/reponame/issues/events{/number}",
        "events_url": "https://api.github.com/repos/owner/reponame/events",
        "assignees_url": "https://api.github.com/repos/owner/reponame/assignees{/user}",
        "branches_url": "https://api.github.com/repos/owner/reponame/branches{/branch}",
        "tags_url": "https://api.github.com/repos/owner/reponame/tags",
        "blobs_url": "https://api.github.com/repos/owner/reponame/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/owner/reponame/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/owner/reponame/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/owner/reponame/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/owner/reponame/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/owner/reponame/languages",
        "stargazers_url": "https://api.github.com/repos/owner/reponame/stargazers",
        "contributors_url": "https://api.github.com/repos/owner/reponame/contributors",
        "subscribers_url": "https://api.github.com/repos/owner/reponame/subscribers",
        "subscription_url": "https://api.github.com/repos/owner/reponame/subscription",
        "commits_url": "https://api.github.com/repos/owner/reponame/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/owner/reponame/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/owner/reponame/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/owner/reponame/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/owner/reponame/contents/{+path}",
        "compare_url": "https://api.github.com/repos/owner/reponame/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/owner/reponame/merges",
        "archive_url": "https://api.github.com/repos/owner/reponame/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/owner/reponame/downloads",
        "issues_url": "https://api.github.com/repos/owner/reponame/issues{/number}",
        "pulls_url": "https://api.github.com/repos/owner/reponame/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/owner/reponame/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/owner/reponame/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/owner/reponame/labels{/name}",
        "releases_url": "https://api.github.com/repos/owner/reponame/releases{/id}",
        "deployments_url": "https://api.github.com/repos/owner/reponame/deployments"
    },
    "head_repository": {
        "id": 26882,
        "node_id": "MDEwOlJlcG9kyMzU4ODI=",
        "name": "TestRepo",
        "full_name": "owner/reponame",
        "private": false,
        "owner": {
            "login": "someuser",
            "id": 47136,
            "node_id": "MDQ6VXA0MTM2",
            "avatar_url": "https://avatars2.githubusercontent.com/u/47404136?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/someuser",
            "html_url": "https://github.com/someuser",
            "followers_url": "https://api.github.com/users/someuser/followers",
            "following_url": "https://api.github.com/users/someuser/following{/other_user}",
            "gists_url": "https://api.github.com/users/someuser/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/someuser/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/someuser/subscriptions",
            "organizations_url": "https://api.github.com/users/someuser/orgs",
            "repos_url": "https://api.github.com/users/someuser/repos",
            "events_url": "https://api.github.com/users/someuser/events{/privacy}",
            "received_events_url": "https://api.github.com/users/someuser/received_events",
            "type": "User",
            "site_admin": false
        },
        "html_url": "https://github.com/owner/reponame",
        "description": "Test repo to check out CLA github action",
        "fork": false,
        "url": "https://api.github.com/repos/owner/reponame",
        "forks_url": "https://api.github.com/repos/owner/reponame/forks",
        "keys_url": "https://api.github.com/repos/owner/reponame/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/owner/reponame/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/owner/reponame/teams",
        "hooks_url": "https://api.github.com/repos/owner/reponame/hooks",
        "issue_events_url": "https://api.github.com/repos/owner/reponame/issues/events{/number}",
        "events_url": "https://api.github.com/repos/owner/reponame/events",
        "assignees_url": "https://api.github.com/repos/owner/reponame/assignees{/user}",
        "branches_url": "https://api.github.com/repos/owner/reponame/branches{/branch}",
        "tags_url": "https://api.github.com/repos/owner/reponame/tags",
        "blobs_url": "https://api.github.com/repos/owner/reponame/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/owner/reponame/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/owner/reponame/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/owner/reponame/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/owner/reponame/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/owner/reponame/languages",
        "stargazers_url": "https://api.github.com/repos/owner/reponame/stargazers",
        "contributors_url": "https://api.github.com/repos/owner/reponame/contributors",
        "subscribers_url": "https://api.github.com/repos/owner/reponame/subscribers",
        "subscription_url": "https://api.github.com/repos/owner/reponame/subscription",
        "commits_url": "https://api.github.com/repos/owner/reponame/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/owner/reponame/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/owner/reponame/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/owner/reponame/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/owner/reponame/contents/{+path}",
        "compare_url": "https://api.github.com/repos/owner/reponame/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/owner/reponame/merges",
        "archive_url": "https://api.github.com/repos/owner/reponame/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/owner/reponame/downloads",
        "issues_url": "https://api.github.com/repos/owner/reponame/issues{/number}",
        "pulls_url": "https://api.github.com/repos/owner/reponame/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/owner/reponame/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/owner/reponame/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/owner/reponame/labels{/name}",
        "releases_url": "https://api.github.com/repos/owner/reponame/releases{/id}",
        "deployments_url": "https://api.github.com/repos/owner/reponame/deployments"
    }
}

function mockWith(hasRuns = false): [PullCheckRunner, any, any, any] {
    const pullCheckRunner = new PullCheckRunner(settings);

    const listWorkflowRunsSpy = jest.spyOn(mockGitHub.actions, 'listWorkflowRuns')
        .mockImplementation(async (params) => ({
            headers: {
                date: "",
                "x-Octokit-media-type": "",
                "x-Octokit-request-id": "",
                "x-ratelimit-limit": "",
                "x-ratelimit-remaining": "",
                "x-ratelimit-reset": "",
                link: "",
                "last-modified": "",
                etag: "",
                status: "200",},
            status: 200,
            url: "",
            data: {
                total_count: hasRuns ? 1 : 0,
                workflow_runs: hasRuns ? [workflowRun] : []
            },
        }));

    const listRepoWorkflowsSpy = jest.spyOn(mockGitHub.actions, 'listRepoWorkflows')
        .mockImplementation(async (params) => ({
            headers: {
                date: "",
                "x-Octokit-media-type": "",
                "x-Octokit-request-id": "",
                "x-ratelimit-limit": "",
                "x-ratelimit-remaining": "",
                "x-ratelimit-reset": "",
                link: "",
                "last-modified": "",
                etag: "",
                status: "200",},
            status: 200,
            url: "",
            data: {
                total_count: 1,
                workflows: [{
                    badge_url: "",
                    created_at: "",
                    html_url: "",
                    id: 12345,
                    name: settings.workflowName,
                    node_id: "lakrjg",
                    path: ".github/workflows/clabot.yml",
                    state: "active",
                    updated_at: "",
                    url: "",
                }]
            },
        }));

    const requestSpy = jest.spyOn(mockGitHub, 'request')
        .mockImplementation(async (params) => ({
            headers: {
                date: "",
                "x-Octokit-media-type": "",
                "x-Octokit-request-id": "",
                "x-ratelimit-limit": "",
                "x-ratelimit-remaining": "",
                "x-ratelimit-reset": "",
                link: "",
                "last-modified": "",
                etag: "",
                status: "200",},
            status: 200,
            url: "",
            data: {}}));

    return [pullCheckRunner, listWorkflowRunsSpy, listRepoWorkflowsSpy, requestSpy];
}

it("Doesn't fail if it can't find an old run", async () => {
    const [pullCheckRunner, listWorkflowRunsSpy, listRepoWorkflowsSpy, requestSpy] = mockWith(false);

    await pullCheckRunner.rerunLastCheck();

    expect(listRepoWorkflowsSpy).toHaveBeenCalledTimes(1);
    expect(listWorkflowRunsSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(0);
});

it("Works if it does find an old run", async () => {
    const [pullCheckRunner, listWorkflowRunsSpy, listRepoWorkflowsSpy, requestSpy] = mockWith(true);

    await pullCheckRunner.rerunLastCheck();

    expect(listRepoWorkflowsSpy).toHaveBeenCalledTimes(1);
    expect(listWorkflowRunsSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(1);
});
