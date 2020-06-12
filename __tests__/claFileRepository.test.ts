import { ClaFileRepository } from "../src/claFileRepository"
import { IInputSettings } from "../src/inputSettings";
import * as github from '@actions/github';
import { ClaFile } from "../src/claFile";
import { Author } from "../src/authorMap";
import { SignEvent } from "../src/signEvent";

const mockGitHub = github.getOctokit("1234567890123456789012345678901234567890");

const settings = {
    localRepositoryOwner: "some-owner",
    localRepositoryName: "repo-name",
    claFilePath: "path/to/cla.json",
    branch: "master",
    octokitRemote: mockGitHub,
} as IInputSettings;

const rawAuthor = new Author({
    name: "SomeAccount",
    id: 12345,
    pullRequestNo: 5,
    signed: true,
});
const fakeClaFileContents ={
    signedContributors: [
        {
            name: rawAuthor.name,
            comment_id: 5,
            created_at: "Some timestamp",
            id: rawAuthor.id,
            pullRequestNo: rawAuthor.pullRequestNo,
            repoId: 3
        } as SignEvent
    ]
};

const claFile = new ClaFile(Buffer.from(JSON.stringify(fakeClaFileContents, null, 2)).toString("base64"))

// There _must_ be some better way of mocking these but I can't find it and the internet
// doesn't offer much insight. The 'recommended' way to mock Octokit is to use nock to
// mock _the underlying network requests_ but I can't be the only one thinking that's backwards
// when we have reasonably strongly typed methods we can intercept here instead.
// So instead of mocking the unknown and ever-changing API URLs using nock we just use
// spyOn to directly hijack the methods and return a specially crafted object.
// It might be better to add fully filled out types based on observed responses to API
// requests but this works fine for the purposes of making sure the code actually, you know
// works as intended.
// Unfortunately this method relies on understanding what API methods are called by
// the methods under test, but so would using nock so I don't feel too bad about it.
function mockWith(sha: string, createSha: string, content?: ClaFile) {
    jest.resetAllMocks();

    let getContentsSpy;
    if (!content) {
        getContentsSpy = jest.spyOn(mockGitHub.repos, 'getContents')
        .mockImplementation(async (params) => { throw { status: 404 } });
    } else {
        getContentsSpy = jest.spyOn(mockGitHub.repos, 'getContents')
        .mockImplementation(async (params) => ({
            url: "",
            data: {
                type: "string",
                encoding: "",
                size: 1024,
                name: "cla.json",
                path: "/signatures/cla.json",
                content: content.toBase64(),
                sha: sha,
                url: "",
                git_url: "",
                html_url: "",
                download_url: "",
                _links: {
                    git: "",
                    html: "",
                    self: "",
                },
            },
            status: 200,
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
                status: "200",
            },
            [Symbol.iterator]: () => ({next: () =>  { return { value: null, done: true}}}),
        }));
    }

    let createOrUpdateSpy = jest.spyOn(mockGitHub.repos, 'createOrUpdateFile')
        .mockImplementation(async (params) => ({
            url: "",
            data: {
                commit: {
                    author: {
                        date: "",
                        email: "someuser@example.com",
                        name: "author",
                    },
                    committer: {
                        date: "",
                        email: "someuser@example.com",
                        name: "committer",
                    },
                    html_url: "",
                    message: "Creating CLA signature file",
                    node_id: "akljsfglkjdnsfg",
                    sha: createSha,
                    parents: [],
                    tree: {
                        sha: "idklol",
                        url: "",
                    },
                    url: "",
                    verification: {
                        payload: "null",
                        reason: "",
                        signature: "",
                        verified: true
                    }
                },
                content: {
                    _links: {self: "", html: "", git: ""},
                    download_url: "",
                    git_url: "",
                    html_url: "",
                    name: "cla.json",
                    path: "path/to",
                    sha: createSha,
                    size: 1024,
                    type: "file idk bro",
                    url: "",
                }
            },
            status: 200,
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
                status: "200",
            },
            [Symbol.iterator]: () => ({next: () =>  { return { value: null, done: true}}}),
        }));

    return [getContentsSpy, createOrUpdateSpy];
}

beforeEach(() => {
    jest.restoreAllMocks();
});

it('returns the cla file if one is found', async () => {
    const [getContentsSpy, createOrUpdateSpy] = mockWith("12345", "67890", claFile);
    const fileRepo = new ClaFileRepository(settings);
    const file = await fileRepo.getClaFile();
    expect(file._records.some(s => s.name == rawAuthor.name)).toStrictEqual(true);

    // We expect to see get contents, but not create or update.
    expect(getContentsSpy).toHaveBeenCalledTimes(1);
    expect(createOrUpdateSpy).toHaveBeenCalledTimes(0);
});

it('Creates the file if a file isnt found, but only once', async () => {
    const [getContentsSpy, createOrUpdateSpy] = mockWith("12345", "67890");
    const fileRepo = new ClaFileRepository(settings);

    const file = await fileRepo.getClaFile();
    expect(file._records.length).toBe(0);

    const otherFile = await fileRepo.getClaFile();
    expect(otherFile._records.length).toBe(0);

    expect(getContentsSpy).toHaveBeenCalledTimes(1);
    expect(createOrUpdateSpy).toHaveBeenCalledTimes(1);
});

it('Commits file after getting it', async () => {
    const [getContentsSpy, createOrUpdateSpy] = mockWith("12345", "67890", claFile);
    const fileRepo = new ClaFileRepository(settings);
    const file = await fileRepo.commitClaFile();
    expect(file._records.some(s => s.name == rawAuthor.name)).toStrictEqual(true);

    // Should get the file and then update the file.
    expect(getContentsSpy).toHaveBeenCalledTimes(1);
    expect(createOrUpdateSpy).toHaveBeenCalledTimes(1);
});


it('Commits file after creating it', async () => {
    const [getContentsSpy, createOrUpdateSpy] = mockWith("12345", "67890");
    const fileRepo = new ClaFileRepository(settings);

    const file = await fileRepo.getClaFile();
    expect(file._records.length).toBe(0);

    const otherFile = await fileRepo.commitClaFile();
    expect(otherFile._records.length).toBe(0);

    expect(getContentsSpy).toHaveBeenCalledTimes(1);
    expect(createOrUpdateSpy).toHaveBeenCalledTimes(2);
});

it("Throws if attempting to create a CLA file in a readonly repo", async () => {
    const settings = {
        remoteRepositoryName: "blah",
        remoteRepositoryOwner: "owner",
        claFilePath: "asdf",
        branch: "master",
        isRemoteRepoReadonly: true,
        isRemoteRepo: true,
        octokitRemote: mockGitHub,
    } as IInputSettings;
    const [getContentsSpy, createOrUpdateSpy] = mockWith("12345", "67890");
    const fileRepo = new ClaFileRepository(settings);

    expect(fileRepo.getClaFile()).rejects.toThrow();
    expect(getContentsSpy).toHaveBeenCalledTimes(1);
    expect(createOrUpdateSpy).toHaveBeenCalledTimes(0);
});
