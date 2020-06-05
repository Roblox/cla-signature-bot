import { IInputSettings } from "../src/inputSettings"
import * as github from "@actions/github";
import { AuthorMap } from "../src/authorMap";
import { PullComments } from "../src/pullComments";
import { sign } from "crypto";

const mockGitHub = github.getOctokit("1234567890123456789012345678901234567890");

const settings = {
    localRepositoryOwner: "repoOwner",
    localRepositoryName: "repoName",
    pullRequestNumber: 5,
    claDocUrl: "https://example.com",
    signatureText: "I have read the CLA Document and I hereby sign the CLA",
    signatureRegex: /^.*I \s*HAVE \s*READ \s*THE \s*CLA \s*DOCUMENT \s*AND \s*I \s*HEREBY \s*SIGN \s*THE \s*CLA.*$/,
    octokitLocal: mockGitHub,
} as IInputSettings

const okHeader = {
    date: "",
    "x-Octokit-media-type": "",
    "x-Octokit-request-id": "",
    "x-ratelimit-limit": "",
    "x-ratelimit-remaining": "",
    "x-ratelimit-reset": "",
    link: "",
    "last-modified": "",
    etag: "",
    status: "200",
};

// I just wanted the ID..
const repoInfo = {
    "id": 123456789,
    "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
    "name": "Hello-World",
    "full_name": "octocat/Hello-World",
    "owner": {
        "login": "octocat",
        "id": 1,
        "node_id": "MDQ6VXNlcjE=",
        "avatar_url": "https://github.com/images/error/octocat_happy.gif",
        "gravatar_id": "",
        "url": "https://api.github.com/users/octocat",
        "html_url": "https://github.com/octocat",
        "followers_url": "https://api.github.com/users/octocat/followers",
        "following_url": "https://api.github.com/users/octocat/following{/other_user}",
        "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
        "organizations_url": "https://api.github.com/users/octocat/orgs",
        "repos_url": "https://api.github.com/users/octocat/repos",
        "events_url": "https://api.github.com/users/octocat/events{/privacy}",
        "received_events_url": "https://api.github.com/users/octocat/received_events",
        "type": "User",
        "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/octocat/Hello-World",
    "description": "This your first repo!",
    "fork": false,
    "url": "https://api.github.com/repos/octocat/Hello-World",
    "archive_url": "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
    "assignees_url": "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
    "blobs_url": "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
    "branches_url": "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
    "collaborators_url": "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
    "comments_url": "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
    "commits_url": "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
    "compare_url": "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
    "contents_url": "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
    "contributors_url": "http://api.github.com/repos/octocat/Hello-World/contributors",
    "deployments_url": "http://api.github.com/repos/octocat/Hello-World/deployments",
    "downloads_url": "http://api.github.com/repos/octocat/Hello-World/downloads",
    "events_url": "http://api.github.com/repos/octocat/Hello-World/events",
    "forks_url": "http://api.github.com/repos/octocat/Hello-World/forks",
    "git_commits_url": "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
    "git_refs_url": "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
    "git_tags_url": "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
    "git_url": "git:github.com/octocat/Hello-World.git",
    "issue_comment_url": "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
    "issue_events_url": "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
    "issues_url": "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
    "keys_url": "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
    "labels_url": "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
    "languages_url": "http://api.github.com/repos/octocat/Hello-World/languages",
    "merges_url": "http://api.github.com/repos/octocat/Hello-World/merges",
    "milestones_url": "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
    "notifications_url": "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
    "pulls_url": "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
    "releases_url": "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
    "ssh_url": "git@github.com:octocat/Hello-World.git",
    "stargazers_url": "http://api.github.com/repos/octocat/Hello-World/stargazers",
    "statuses_url": "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
    "subscribers_url": "http://api.github.com/repos/octocat/Hello-World/subscribers",
    "subscription_url": "http://api.github.com/repos/octocat/Hello-World/subscription",
    "tags_url": "http://api.github.com/repos/octocat/Hello-World/tags",
    "teams_url": "http://api.github.com/repos/octocat/Hello-World/teams",
    "trees_url": "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
    "clone_url": "https://github.com/octocat/Hello-World.git",
    "mirror_url": "git:git.example.com/octocat/Hello-World",
    "hooks_url": "http://api.github.com/repos/octocat/Hello-World/hooks",
    "svn_url": "https://svn.github.com/octocat/Hello-World",
    "homepage": "https://github.com",
    "language": "en",
    "forks_count": 9,
    "stargazers_count": 80,
    "watchers_count": 80,
    "size": 108,
    "default_branch": "master",
    "open_issues_count": 0,
    "is_template": true,
    "topics": [
        "octocat",
        "atom",
        "electron",
        "api"
    ],
    "has_issues": true,
    "has_projects": true,
    "has_wiki": true,
    "has_pages": false,
    "has_downloads": true,
    "archived": false,
    "disabled": false,
    "visibility": "public",
    "pushed_at": "2011-01-26T19:06:43Z",
    "created_at": "2011-01-26T19:01:12Z",
    "updated_at": "2011-01-26T19:14:43Z",
    "permissions": {
        "pull": true,
        "triage": true,
        "push": false,
        "maintain": false,
        "admin": false
    },
    "allow_rebase_merge": true,
    "template_repository": "",
    "temp_clone_token": "ABTLWHOULUVAXGTRYU7OC2876QJ2O",
    "allow_squash_merge": true,
    "allow_merge_commit": true,
    "subscribers_count": 42,
    "network_count": 0,
    "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZW1pdA=="
    },
    "organization": {
        "login": "octocat",
        "id": 1,
        "node_id": "MDQ6VXNlcjE=",
        "avatar_url": "https://github.com/images/error/octocat_happy.gif",
        "gravatar_id": "",
        "url": "https://api.github.com/users/octocat",
        "html_url": "https://github.com/octocat",
        "followers_url": "https://api.github.com/users/octocat/followers",
        "following_url": "https://api.github.com/users/octocat/following{/other_user}",
        "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
        "organizations_url": "https://api.github.com/users/octocat/orgs",
        "repos_url": "https://api.github.com/users/octocat/repos",
        "events_url": "https://api.github.com/users/octocat/events{/privacy}",
        "received_events_url": "https://api.github.com/users/octocat/received_events",
        "type": "Organization",
        "site_admin": false
    },
    "parent": {
        "id": 1296269,
        "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
        "name": "Hello-World",
        "full_name": "octocat/Hello-World",
        "owner": {
            "login": "octocat",
            "id": 1,
            "node_id": "MDQ6VXNlcjE=",
            "avatar_url": "https://github.com/images/error/octocat_happy.gif",
            "gravatar_id": "",
            "url": "https://api.github.com/users/octocat",
            "html_url": "https://github.com/octocat",
            "followers_url": "https://api.github.com/users/octocat/followers",
            "following_url": "https://api.github.com/users/octocat/following{/other_user}",
            "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
            "organizations_url": "https://api.github.com/users/octocat/orgs",
            "repos_url": "https://api.github.com/users/octocat/repos",
            "events_url": "https://api.github.com/users/octocat/events{/privacy}",
            "received_events_url": "https://api.github.com/users/octocat/received_events",
            "type": "User",
            "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/octocat/Hello-World",
        "description": "This your first repo!",
        "fork": false,
        "url": "https://api.github.com/repos/octocat/Hello-World",
        "archive_url": "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
        "assignees_url": "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
        "blobs_url": "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
        "branches_url": "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
        "collaborators_url": "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
        "comments_url": "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
        "commits_url": "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
        "compare_url": "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
        "contents_url": "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
        "contributors_url": "http://api.github.com/repos/octocat/Hello-World/contributors",
        "deployments_url": "http://api.github.com/repos/octocat/Hello-World/deployments",
        "downloads_url": "http://api.github.com/repos/octocat/Hello-World/downloads",
        "events_url": "http://api.github.com/repos/octocat/Hello-World/events",
        "forks_url": "http://api.github.com/repos/octocat/Hello-World/forks",
        "git_commits_url": "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
        "git_refs_url": "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
        "git_tags_url": "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
        "git_url": "git:github.com/octocat/Hello-World.git",
        "issue_comment_url": "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
        "issue_events_url": "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
        "issues_url": "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
        "keys_url": "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
        "labels_url": "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
        "languages_url": "http://api.github.com/repos/octocat/Hello-World/languages",
        "merges_url": "http://api.github.com/repos/octocat/Hello-World/merges",
        "milestones_url": "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
        "notifications_url": "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
        "pulls_url": "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
        "releases_url": "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
        "ssh_url": "git@github.com:octocat/Hello-World.git",
        "stargazers_url": "http://api.github.com/repos/octocat/Hello-World/stargazers",
        "statuses_url": "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
        "subscribers_url": "http://api.github.com/repos/octocat/Hello-World/subscribers",
        "subscription_url": "http://api.github.com/repos/octocat/Hello-World/subscription",
        "tags_url": "http://api.github.com/repos/octocat/Hello-World/tags",
        "teams_url": "http://api.github.com/repos/octocat/Hello-World/teams",
        "trees_url": "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
        "clone_url": "https://github.com/octocat/Hello-World.git",
        "mirror_url": "git:git.example.com/octocat/Hello-World",
        "hooks_url": "http://api.github.com/repos/octocat/Hello-World/hooks",
        "svn_url": "https://svn.github.com/octocat/Hello-World",
        "homepage": "https://github.com",
        "language": "null",
        "forks_count": 9,
        "stargazers_count": 80,
        "watchers_count": 80,
        "size": 108,
        "default_branch": "master",
        "open_issues_count": 0,
        "is_template": true,
        "topics": [
            "octocat",
            "atom",
            "electron",
            "api"
        ],
        "has_issues": true,
        "has_projects": true,
        "has_wiki": true,
        "has_pages": false,
        "has_downloads": true,
        "archived": false,
        "disabled": false,
        "visibility": "public",
        "pushed_at": "2011-01-26T19:06:43Z",
        "created_at": "2011-01-26T19:01:12Z",
        "updated_at": "2011-01-26T19:14:43Z",
        "permissions": {
            "admin": false,
            "push": false,
            "pull": true
        },
        "allow_rebase_merge": true,
        "template_repository": "null",
        "temp_clone_token": "ABTLWHOULUVAXGTRYU7OC2876QJ2O",
        "allow_squash_merge": true,
        "allow_merge_commit": true,
        "subscribers_count": 42,
        "network_count": 0
    },
    "source": {
        "id": 1296269,
        "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
        "name": "Hello-World",
        "full_name": "octocat/Hello-World",
        "owner": {
            "login": "octocat",
            "id": 1,
            "node_id": "MDQ6VXNlcjE=",
            "avatar_url": "https://github.com/images/error/octocat_happy.gif",
            "gravatar_id": "",
            "url": "https://api.github.com/users/octocat",
            "html_url": "https://github.com/octocat",
            "followers_url": "https://api.github.com/users/octocat/followers",
            "following_url": "https://api.github.com/users/octocat/following{/other_user}",
            "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
            "organizations_url": "https://api.github.com/users/octocat/orgs",
            "repos_url": "https://api.github.com/users/octocat/repos",
            "events_url": "https://api.github.com/users/octocat/events{/privacy}",
            "received_events_url": "https://api.github.com/users/octocat/received_events",
            "type": "User",
            "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/octocat/Hello-World",
        "description": "This your first repo!",
        "fork": false,
        "url": "https://api.github.com/repos/octocat/Hello-World",
        "archive_url": "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
        "assignees_url": "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
        "blobs_url": "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
        "branches_url": "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
        "collaborators_url": "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
        "comments_url": "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
        "commits_url": "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
        "compare_url": "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
        "contents_url": "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
        "contributors_url": "http://api.github.com/repos/octocat/Hello-World/contributors",
        "deployments_url": "http://api.github.com/repos/octocat/Hello-World/deployments",
        "downloads_url": "http://api.github.com/repos/octocat/Hello-World/downloads",
        "events_url": "http://api.github.com/repos/octocat/Hello-World/events",
        "forks_url": "http://api.github.com/repos/octocat/Hello-World/forks",
        "git_commits_url": "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
        "git_refs_url": "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
        "git_tags_url": "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
        "git_url": "git:github.com/octocat/Hello-World.git",
        "issue_comment_url": "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
        "issue_events_url": "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
        "issues_url": "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
        "keys_url": "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
        "labels_url": "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
        "languages_url": "http://api.github.com/repos/octocat/Hello-World/languages",
        "merges_url": "http://api.github.com/repos/octocat/Hello-World/merges",
        "milestones_url": "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
        "notifications_url": "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
        "pulls_url": "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
        "releases_url": "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
        "ssh_url": "git@github.com:octocat/Hello-World.git",
        "stargazers_url": "http://api.github.com/repos/octocat/Hello-World/stargazers",
        "statuses_url": "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
        "subscribers_url": "http://api.github.com/repos/octocat/Hello-World/subscribers",
        "subscription_url": "http://api.github.com/repos/octocat/Hello-World/subscription",
        "tags_url": "http://api.github.com/repos/octocat/Hello-World/tags",
        "teams_url": "http://api.github.com/repos/octocat/Hello-World/teams",
        "trees_url": "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
        "clone_url": "https://github.com/octocat/Hello-World.git",
        "mirror_url": "git:git.example.com/octocat/Hello-World",
        "hooks_url": "http://api.github.com/repos/octocat/Hello-World/hooks",
        "svn_url": "https://svn.github.com/octocat/Hello-World",
        "homepage": "https://github.com",
        "language": "null",
        "forks_count": 9,
        "stargazers_count": 80,
        "watchers_count": 80,
        "size": 108,
        "default_branch": "master",
        "open_issues_count": 0,
        "is_template": true,
        "topics": [
            "octocat",
            "atom",
            "electron",
            "api"
        ],
        "has_issues": true,
        "has_projects": true,
        "has_wiki": true,
        "has_pages": false,
        "has_downloads": true,
        "archived": false,
        "disabled": false,
        "visibility": "public",
        "pushed_at": "2011-01-26T19:06:43Z",
        "created_at": "2011-01-26T19:01:12Z",
        "updated_at": "2011-01-26T19:14:43Z",
        "permissions": {
            "admin": false,
            "push": false,
            "pull": true
        },
        "allow_rebase_merge": true,
        "template_repository": "null",
        "temp_clone_token": "ABTLWHOULUVAXGTRYU7OC2876QJ2O",
        "allow_squash_merge": true,
        "allow_merge_commit": true,
        "subscribers_count": 42,
        "network_count": 0
    }
};


function getUser(id = 12345, username = "someusername") {
    return ({
        avatar_url: "",
        events_url: "",
        followers_url: "",
        following_url: "",
        gists_url: "",
        gravatar_id: "",
        html_url: "",
        id: id,
        login: username,
        node_id: "",
        organizations_url: "",
        received_events_url: "",
        repos_url: "",
        site_admin: false,
        starred_url: "",
        subscriptions_url: "",
        type: "",
        url: "",
    });
}

function getRandomComment() {
    const randomId = Math.floor(Math.random() * Math.floor(10000));
    return ({
        body: "This is a random comment that has text that should be ignored!",
        created_at: "",
        html_url: "",
        id: 1,
        node_id: "",
        updated_at: "",
        url: "",
        user: getUser(randomId, `SomeUser${randomId}`)
    });
}

function getSignatureComment() {
    return ({
        body: settings.signatureText,
        created_at: "Creation time.",
        html_url: "",
        id: 123,
        node_id: "",
        updated_at: "",
        url: "",
        user: getUser(12345, "CommentingUser")
    });
}

function getClaComment(body = "The text 'CLA Assistant Lite' is required to find this comment.") {
    return ({
        body: body,
        created_at: "",
        html_url: "",
        id: 1,
        node_id: "",
        updated_at: "",
        url: "",
        user: getUser(54321, "CLABotUser")
    });
}

function mockWith(hasExistingComment = true, hasGitHubAccount = true) {
    const signatureComment = getSignatureComment();

    const createCommentSpy = jest.spyOn(mockGitHub.issues, 'createComment')
        .mockImplementation(async (params) => ({
            url: "",
            data: getClaComment(params!.body!),
            headers: okHeader,
            status: 200,
            [Symbol.iterator]: () => ({ next: () => { return { value: null, done: true } } }),
        }));
    const updateCommentSpy = jest.spyOn(mockGitHub.issues, 'updateComment')
        .mockImplementation(async (params) => ({
            url: "",
            data: getClaComment(params!.body!),
            headers: okHeader,
            status: 200,
            [Symbol.iterator]: () => ({ next: () => { return { value: null, done: true } } }),
        }));

    const listCommentsSpy = jest.spyOn(mockGitHub.issues, 'listComments')
        .mockImplementation(async (params) => ({
            url: "",
            data: [
                hasExistingComment ? getClaComment() : getRandomComment(),
                getRandomComment(),
                getRandomComment(),
                getRandomComment(),
                signatureComment,
            ],
            headers: okHeader,
            status: 200,
            [Symbol.iterator]: () => ({ next: () => { return { value: null, done: true } } }),
        }));
    const reposGetSpy = jest.spyOn(mockGitHub.repos, 'get')
        .mockImplementation(async (params) => ({
            url: "",
            data: repoInfo,
            headers: okHeader,
            status: 200,
            [Symbol.iterator]: () => ({ next: () => { return { value: null, done: true } } }),
        }));

    return [createCommentSpy, updateCommentSpy, listCommentsSpy, reposGetSpy];
}

afterEach(() => {
    jest.resetAllMocks();
})

it("Creates CLA comment if it can't find one.", async () => {
    const [createCommentSpy, updateCommentSpy, listCommentsSpy] = mockWith(false);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "SomeAuthor",
        signed: false,
        id: 12345
    };
    const authorMap = new AuthorMap([author]);
    const result = await localRepo.setClaComment(authorMap);

    // Since the author hasn't signed there should be an x next to the name
    expect(result.search(`:x: @${author.name}`)).toBeGreaterThan(0);
    // The example text must be present.
    expect(result.search(settings.signatureText)).toBeGreaterThan(0);
    // And a link to the CLA file must be present.
    expect(result.search(settings.claDocUrl)).toBeGreaterThan(0);
    // And the regex to find the cla title should work.
    expect(result.match(/.*CLA Assistant Lite.*/)).toBeTruthy();

    // List comments should have been called (to get the list to search for existing comments)
    // along with creating a comment. Update comment should not have been called.
    expect(listCommentsSpy).toHaveBeenCalled();
    expect(updateCommentSpy).toHaveBeenCalledTimes(0);
    expect(createCommentSpy).toHaveBeenCalled();
});

it("Updates existing comment if one is present", async () => {
    const [createCommentSpy, updateCommentSpy, listCommentsSpy] = mockWith(true);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "SomeAuthor",
        signed: false,
        id: 12345
    };
    const authorMap = new AuthorMap([author]);
    const result = await localRepo.setClaComment(authorMap);

    // And the regex to find the cla title should work.
    expect(result.match(/.*CLA Assistant Lite.*/)).toBeTruthy();

    // List comments should have been called (to get the list to search for existing comments)
    // along with creating a comment. Update comment should not have been called.
    expect(listCommentsSpy).toHaveBeenCalled();
    expect(updateCommentSpy).toHaveBeenCalled();
    expect(createCommentSpy).toHaveBeenCalledTimes(0);
});

it("Creates a comment that everyone signed if everyone has signed", async () => {
    const [createCommentSpy, updateCommentSpy, listCommentsSpy] = mockWith(true);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "SomeAuthor",
        signed: true,
        id: 12345
    };
    const authorMap = new AuthorMap([author]);
    const result = await localRepo.setClaComment(authorMap);

    // Since everyone signed, names shouldn't show up.
    expect(result.search(author.name)).toBe(-1);
    // And the regex to find the cla title should work.
    expect(result.match(/.*CLA Assistant Lite.*/)).toBeTruthy();

    // List comments should have been called (to get the list to search for existing comments)
    // along with creating a comment. Update comment should not have been called.
    expect(listCommentsSpy).toHaveBeenCalled();
    expect(updateCommentSpy).toHaveBeenCalled();
    expect(createCommentSpy).toHaveBeenCalledTimes(0);
});

it("Counts signed and unsigned committers separately", async () => {
    mockWith(true);

    const localRepo = new PullComments(settings);
    const signedAuthor =
    {
        name: "SignedAuthor",
        signed: true,
        id: 12345
    };
    const unsignedAuthor =
    {
        name: "UnsignedAuthor",
        signed: false,
        id: 12346
    };
    const noAccount =
    {
        name: "NoAccountAuthor@example.com",
        signed: false,
    }
    const authorMap = new AuthorMap([signedAuthor, unsignedAuthor, noAccount]);
    const result = await localRepo.setClaComment(authorMap);

    // Since the author hasn't signed there should be an x next to the name
    expect(result.search(`:white_check_mark: @${signedAuthor.name}`)).toBeGreaterThan(0);
    // Since the author hasn't signed there should be an x next to the name
    expect(result.search(`:x: @${unsignedAuthor.name}`)).toBeGreaterThan(0);
    // And an unknown author should have a separate line
    expect(result.search(`${noAccount.name}`)).toBeGreaterThan(0);

    // The example text must be present.
    expect(result.search(settings.signatureText)).toBeGreaterThan(0);
    // And a link to the CLA file must be present.
    expect(result.search(settings.claDocUrl)).toBeGreaterThan(0);
    // And the regex to find the cla title should work.
    expect(result.match(/.*CLA Assistant Lite.*/)).toBeTruthy();
});

it("Maps new signature events", async () => {
    const [, , listCommentsSpy, reposGetSpy] = mockWith(true);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "CommentingUser",
        signed: false,
        id: 12345
    };
    const authorMap = new AuthorMap([author]);
    const signatures = await localRepo.getNewSignatures(authorMap);

    expect(signatures.length).toBe(1);
    expect(signatures[0].name).toBe(author.name);
    expect(signatures[0].id).toBe(author.id);
    expect(signatures[0].repoId).toBe(123456789);
    expect(signatures[0].comment_id).toBe(123);
    expect(signatures[0].created_at).toBe("Creation time.");

    expect(reposGetSpy).toHaveBeenCalledTimes(1);
    expect(listCommentsSpy).toHaveBeenCalledTimes(1);
});

it("Shortcuts if everyone has signed.", async () => {
    const [, , listCommentsSpy, reposGetSpy] = mockWith(true);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "CommentingUser",
        signed: true,
        id: 12345
    };
    const authorMap = new AuthorMap([author]);
    const signatures = await localRepo.getNewSignatures(authorMap);

    expect(signatures.length).toBe(0);

    // Doesn't call methods if everyone signed.
    expect(reposGetSpy).toHaveBeenCalledTimes(0);
    expect(listCommentsSpy).toHaveBeenCalledTimes(0);
});

it("Returns an empty list if no new signatures.", async () => {
    const [, , listCommentsSpy, reposGetSpy] = mockWith(true);

    const localRepo = new PullComments(settings);
    const author =
    {
        name: "CommentingUser",
        signed: true,
        id: 12345
    };
    const otherAuthor = {
        name: "SomeUser",
        signed: false,
        id: 55352
    };
    const authorMap = new AuthorMap([author, otherAuthor]);
    const signatures = await localRepo.getNewSignatures(authorMap);

    expect(signatures.length).toBe(0);

    // Doesn't call methods if everyone signed.
    expect(reposGetSpy).toHaveBeenCalledTimes(1);
    expect(listCommentsSpy).toHaveBeenCalledTimes(1);
});