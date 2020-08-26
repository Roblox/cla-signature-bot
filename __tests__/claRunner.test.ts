import { ClaRunner} from "../src/claRunner"
import * as github from '@actions/github';
import { IInputSettings } from "../src/inputSettings"
import { Allowlist } from "../src/claAllowlist";
import { PullAuthors } from "../src/pullAuthors";
import { Author } from "../src/authorMap";
import { ClaFileRepository } from "../src/claFileRepository";
import { ClaFile } from "../src/claFile";
import { PullComments } from "../src/pullComments";
import { SignEvent } from "../src/signEvent";
import { BlockchainPoster } from "../src/blockchainPoster";
import { PullCheckRunner } from "../src/pullCheckRunner";

const mockGitHub = github.getOctokit("1234567890123456789012345678901234567890");

function getSettings() {
    return {
        octokitLocal: mockGitHub
    } as IInputSettings;
}

function getPullAuthorsMock(settings: IInputSettings): [PullAuthors, any] {
    const authors = new PullAuthors(settings);

    const getAuthorsSpy = jest.spyOn(authors, 'getAuthors')
        .mockImplementation(async () => ([
            new Author({
                name: "SomeDude",
                signed: false,
                id: 1234
            }),
            new Author({
                name: "SomeDudette",
                signed: false,
                id: 1235
            }),
            new Author({
                name: "SomeEnby",
                signed: false,
                id: 1236
            })
        ]));

    return [authors, getAuthorsSpy];
}

function getClaFileRepositoryMock(settings: IInputSettings): [ClaFileRepository, any, any] {
    const fileRepo = new ClaFileRepository(settings);

    const getFileSpy = jest.spyOn(fileRepo, 'getClaFile')
        .mockImplementation(async () => {
            return new ClaFile();
        });

    const commitFileSpy = jest.spyOn(fileRepo, 'commitClaFile')
        .mockImplementation(async () => {
            return new ClaFile();
        });

    return [fileRepo, getFileSpy, commitFileSpy];
}

function getPullCommentsMock(settings: IInputSettings): [PullComments, any, any]{
    const pullComments = new PullComments(settings);

    const setClaCommentSpy = jest.spyOn(pullComments, 'setClaComment')
        .mockImplementation(async (params) => (""));

    const getNewSignaturesSpy = jest.spyOn(pullComments, 'getNewSignatures')
        .mockImplementation(async (params) => ([]));

    return [pullComments, setClaCommentSpy, getNewSignaturesSpy];
}

function getBlockchainPosterMock(settings: IInputSettings): [BlockchainPoster, any] {
    const blockchainPoster = new BlockchainPoster(settings);

    const postToBlockchainSpy = jest.spyOn(blockchainPoster, 'postToBlockchain')
        .mockImplementation(async () => ({}))

    return [blockchainPoster, postToBlockchainSpy];
}

function getPullCheckRunnerMock(settings: IInputSettings): [PullCheckRunner, any] {
    const pullCheckRunner = new PullCheckRunner(settings);

    const rerunLastCheckSpy = jest.spyOn(pullCheckRunner, 'rerunLastCheck')
        .mockImplementation(async () => {});

        return [pullCheckRunner, rerunLastCheckSpy];
}

function getMockOrganizationMembers(logins: Array<string>) {
    return logins.map(login => {
        return {
            login,
            id: 1,
            node_id: '',
            avatar_url: '',
            gravatar_id: '',
            url: '',
            html_url: '',
            followers_url: '',
            following_url: '',
            gists_url: '',
            starred_url: '',
            subscriptions_url: '',
            organizations_url: '',
            repos_url: '',
            events_url: '',
            received_events_url: '',
            type: 'User',
            site_admin: false
        }
    })
}

afterEach(() => {
    jest.resetAllMocks();
});

it("Successfully constructs with full or empty settings", () => {
    const fullSettings = {
        blockchainStorageFlag: false,
        blockchainWebhookEndpoint: "",
        branch: "master",
        claDocUrl: "",
        claFilePath: "",
        emptyCommitFlag: false,
        isRemoteRepo: true,
        localAccessToken: "",
        octokitLocal: github.getOctokit("1234567890123456789012345678901234567890"),
        octokitRemote: github.getOctokit("1234567890123456789012345678901234567890"),
        payloadAction: "",
        pullRequestNumber: 1,
        repositoryAccessToken: "",
        localRepositoryName: "name",
        localRepositoryOwner: "owner",
        remoteRepositoryName: "name",
        remoteRepositoryOwner: "owner",
        signatureRegex: /.*/,
        signatureText: "signature",
        allowlist: "",
        whitelist: "",
        allowOrganizationMembers: false
    } as IInputSettings;

    const runner = new ClaRunner({inputSettings: fullSettings});

    // And constructing with an empty object should also not fail
    const otherRunner = new ClaRunner({inputSettings: {} as IInputSettings});
});

it('Locks the PR when the PR is closed', async () => {
    const lockCommentSpy = jest.spyOn(mockGitHub.issues, 'lock')
        .mockImplementation(async (params) => ({
            url: "",
            data: {},
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

    const settings = getSettings();
    settings.payloadAction = "closed";
    const runner = new ClaRunner({inputSettings: settings});
    const result = await runner.execute();

    expect(result).toStrictEqual(true);
    expect(lockCommentSpy).toHaveBeenCalledTimes(1);
});

it("Returns early if all authors are organization members and 'allowOrganizationMembers' is enabled", async () => {
    const listMembersSpy = jest.spyOn(mockGitHub.orgs, 'listMembers')
        .mockImplementation(async (params) => ({
            url: "",
            data: getMockOrganizationMembers(['SomeDude', 'SomeDudette', 'SomeEnby']),
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
    const settings = getSettings();
    settings.allowOrganizationMembers = true

    const [authors, getAuthorsSpy] = getPullAuthorsMock(settings);

    const runner = new ClaRunner({
        inputSettings: settings,
        pullAuthors: authors
        });
    const result = await runner.execute();

    expect(result).toStrictEqual(true);
    expect(getAuthorsSpy).toHaveBeenCalledTimes(1);
});

it('Returns early if all authors are on whitelist', async () => {
    const settings = getSettings();
    const allowlist = new Allowlist("SomeDude,SomeDudette,SomeEnby");

    const [authors, getAuthorsSpy] = getPullAuthorsMock(settings);

    const runner = new ClaRunner({
        inputSettings: settings,
        claAllowlist: allowlist,
        pullAuthors: authors
        });
    const result = await runner.execute();

    expect(result).toStrictEqual(true);
    expect(getAuthorsSpy).toHaveBeenCalledTimes(1);
});

it ('Fails if not everyone has signed', async () => {
    const settings = getSettings();

    const [authors] = getPullAuthorsMock(settings);
    const [claFileRepo] = getClaFileRepositoryMock(settings);
    const [pullComments, , getNewSignaturesSpy] = getPullCommentsMock(settings);

    const runner = new ClaRunner({
        inputSettings: settings,
        pullAuthors: authors,
        claRepo: claFileRepo,
        pullComments: pullComments,
    });

    const result = await runner.execute();

    expect(result).toStrictEqual(false);
    expect(getNewSignaturesSpy).toHaveBeenCalledTimes(1);
});

it('succeeds if a new signature makes everyone signed', async () => {
    const settings = getSettings();
    settings.allowlist = "SomeDude,SomeDudette";
    settings.pullRequestNumber = 86;

    const [authors] = getPullAuthorsMock(settings);
    const [claFileRepo, , commitFileSpy] = getClaFileRepositoryMock(settings);
    const [blockchainPoster, postToBlockchainSpy] = getBlockchainPosterMock(settings);
    const [pullCheckRunner, rerunLastCheckSpy] = getPullCheckRunnerMock(settings);

    const pullComments = new PullComments(settings);
    const setClaCommentSpy = jest.spyOn(pullComments, 'setClaComment')
        .mockImplementation(async (params) => (""));
    const getNewSignaturesSpy = jest.spyOn(pullComments, 'getNewSignatures')
        .mockImplementation(async (authorMap) => ([
            {
                comment_id: 23,
                created_at: "Right Here, Right Now",
                id: 1236,
                name: "SomeEnby",
                pullRequestNo: 25,
                repoId: 123456789
            } as SignEvent
        ]));

    const runner = new ClaRunner({
        inputSettings: settings,
        pullAuthors: authors,
        claRepo: claFileRepo,
        pullComments: pullComments,
        blockchainPoster: blockchainPoster,
        pullCheckRunner: pullCheckRunner,
    });

    const result = await runner.execute();
    expect(result).toStrictEqual(true);
    expect(getNewSignaturesSpy).toHaveBeenCalledTimes(1);
    expect(setClaCommentSpy).toHaveBeenCalledTimes(1);
    expect(commitFileSpy).toHaveBeenCalledTimes(1);
    expect(postToBlockchainSpy).toHaveBeenCalledTimes(1);
    expect(rerunLastCheckSpy).toHaveBeenCalledTimes(1);
});