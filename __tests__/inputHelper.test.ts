import * as assert from 'assert'
import * as github from '@actions/github'
import * as core from '@actions/core'
import * as inputHelper from '../src/inputHelper'

import { IInputSettings } from '../src/inputSettings'

// Inputs for mock @actions/core
let inputs = {} as any
jest.spyOn(core, 'debug').mockImplementation((string) => {});

// Shallow clone original @actions/github context
let originalContext = { ...github.context }

process.env["GITHUB_TOKEN"] = "1234567890098765432112345678900987654321"

const ref = 'refs/pull/232/merge';
const sha = '1234567890123456789012345678901234567890';

beforeAll(() => {
    // Mock getInput with something resembling the real deal for exception handling.
    jest.spyOn(core, 'getInput').mockImplementation((name: string, options?: core.InputOptions) => {
        const val: string = inputs[name];
        if (options && options.required && !val) {
            throw new Error(`Input required and not supplied: ${name}`);
        };
        return val;
    })

    // Mock github context
    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
        return {
            owner: 'some-owner',
            repo: 'some-repo'
        };
    });
    github.context.ref = ref;
    github.context.sha = sha;
});

beforeEach(() => {
    // Reset inputs
    inputs = {};
})

afterAll(() => {
    // Restore @actions/github context
    github.context.ref = originalContext.ref;
    github.context.sha = originalContext.sha;

    // Reset mock objects
    jest.restoreAllMocks();
})

it('sets defaults', () => {
    inputs["url-to-cladocument"] = "some/path/to/a/doc.md";
    const settings: IInputSettings = inputHelper.getInputs();
    expect(settings).toBeTruthy();
    expect(settings.blockchainStorageFlag).toBe(false);
    expect(settings.blockchainWebhookEndpoint).toBeTruthy();
    expect(settings.branch).toBe('master');
    expect(settings.claDocUrl).toBe('some/path/to/a/doc.md');
    expect(settings.remoteRepositoryName).toBe("some-repo");
    expect(settings.remoteRepositoryOwner).toBe("some-owner");
    expect(settings.localRepositoryName).toBe("some-repo");
    expect(settings.localRepositoryOwner).toBe("some-owner");
    expect(settings.repositoryAccessToken).toBe(settings.localAccessToken);
    expect(settings.claFilePath).toBeTruthy();
    expect(settings.whitelist).toBeFalsy();
    expect(settings.emptyCommitFlag).toBe(false);

    expect(settings.octokitRemote).toBeTruthy();
    expect(settings.octokitLocal).toBeTruthy();
})

it('Rejects invalid repository name arguments', () => {
    inputs["url-to-cladocument"] = "some/path/to/a/doc.md";
    inputs["use-remote-repo"] = "true";
    inputs["remote-repo-name"] = "a-bad-repo-name";
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890";
    assert.throws(() => inputHelper.getInputs());
})

it('requires a pat with remote repo', () => {
    inputs["url-to-cladocument"] = "some/path/to/a/doc.md";
    inputs["use-remote-repo"] = "true";

    // Throws because neither a repo name nor a PAT are supplied
    expect(() => inputHelper.getInputs()).toThrow();

    // Doesn't throw (but does set the readonly flag) because forks won't have a pat.
    inputs["remote-repo-name"] = "someowner/somerepo";
    inputs["remote-repo-pat"] = null;
    let settings = inputHelper.getInputs();
    expect(settings.isRemoteRepo).toStrictEqual(true);
    expect(settings.isRemoteRepoReadonly).toStrictEqual(true);

    // Still throws when only the PAT is supplied
    inputs["remote-repo-name"] = null;
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890";
    expect(() => inputHelper.getInputs()).toThrow();

    // Doesn't throw when both are supplied.
    inputs["remote-repo-name"] = "someowner/somerepo";
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890";
    settings = inputHelper.getInputs();
    expect(settings.isRemoteRepo).toStrictEqual(true);
    expect(settings.isRemoteRepoReadonly).toStrictEqual(false);
});

it("Throws if signature regex doesn't match signature text", () => {
    inputs["url-to-cladocument"] = "some/path/to/a/doc.md";
    inputs["signature-text"] = "sometext";
    expect(() => inputHelper.getInputs()).toThrow();

    // But not if the text matches
    inputs["signature-text"] = undefined;
    expect(inputHelper.getInputs()).toBeTruthy();
});
