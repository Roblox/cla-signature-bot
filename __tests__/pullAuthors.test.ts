import { IInputSettings } from "../src/inputSettings"
import * as github from "@actions/github";
import { PullAuthors } from "../src/pullAuthors";

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

function mockWith(hasGitHubAccount = true, hasTooManyCommits = false) {
    // Committers that have github accounts get user objects, committers that
    // don't get a committer object. The IDs should match at least one signatureComment
    // in the listComments mock so that they can be correlated.
    const commit = hasGitHubAccount ? ({
        author: {
            user: {
                login: "SomeAuthor",
                databaseId: 12345
            }
        }
    }) : ({
        committer: {
            user: {
                name: "SomeCommitter@example.com"
            }
        }
    });
    const graphqlSpy = jest.spyOn(mockGitHub, 'graphql')
        .mockImplementation(async (query) => ({
            repository: {
                pullRequest: {
                    commits: {
                        totalCount: hasTooManyCommits ? 102 : 1,
                        edges: [
                            {
                                node: {
                                    commit: commit
                                }
                            }
                        ]
                    }
                }
            }
        }));

    return [graphqlSpy];
}

afterAll(() => {
    jest.resetAllMocks();
})

it("Returns commit authors correctly", async () => {
    const [graphqlSpy] = mockWith(true);

    const pullAuthors = new PullAuthors(settings);
    const result = await pullAuthors.getAuthors();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("SomeAuthor");
    expect(result[0].id).toBe(12345);
    expect(result[0].pullRequestNo).toBe(settings.pullRequestNumber);
    expect(result[0].signed).toStrictEqual(false);

    expect(graphqlSpy).toHaveBeenCalledTimes(1);
});

it("Returns unknown accounts without an id", async () => {
    const [graphqlSpy] = mockWith(false);

    const pullAuthors = new PullAuthors(settings);
    const result = await pullAuthors.getAuthors();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("SomeCommitter@example.com");
    expect(result[0].id).toBe(undefined);
    expect(result[0].pullRequestNo).toBe(settings.pullRequestNumber);
    expect(result[0].signed).toStrictEqual(false);

    expect(graphqlSpy).toHaveBeenCalledTimes(1);
});

it("Throws if too many commits are in the pull request to process", async () => {
    const [graphqlSpy] = mockWith(false, true);

    const pullAuthors = new PullAuthors(settings);
    expect(pullAuthors.getAuthors()).rejects.toThrow();
    expect(graphqlSpy).toHaveBeenCalled();
});