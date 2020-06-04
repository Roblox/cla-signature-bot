import * as assert from 'assert'
import * as github from '@actions/github'
import * as core from '@actions/core'
import * as inputHelper from '../src/inputHelper'

import nock from 'nock';
import { IInputSettings } from '../src/inputSettings'
import { AssertionError } from 'assert'

// Inputs for mock @actions/core
let inputs = {} as any

// Shallow clone original @actions/github context
let originalContext = { ...github.context }

const ref = 'refs/pull/232/merge';
const sha = '1234567890123456789012345678901234567890';

beforeAll(() => {
    // Mock getInput with something resembling the real deal for exception handling.
    jest.spyOn(core, 'getInput').mockImplementation((name: string, options?: core.InputOptions) => {
        const val: string = inputs[name]
        if (options && options.required && !val) {
            throw new Error(`Input required and not supplied: ${name}`)
        }
        return val
    })

    // Mock github context
    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
        return {
            owner: 'some-owner',
            repo: 'some-repo'
        }
    });
    github.context.ref = ref;
    github.context.sha = sha;
});

beforeEach(() => {
    // Reset inputs
    inputs = {}
})

afterAll(() => {
    // Restore @actions/github context
    github.context.ref = originalContext.ref
    github.context.sha = originalContext.sha

    // Reset mock objects
    jest.restoreAllMocks()
})

it('sets defaults', () => {
    inputs["path-To-cladocument"] = "some/path/to/a/doc.md"
    const settings: IInputSettings = inputHelper.getInputs()
    expect(settings).toBeTruthy()
    expect(settings.blockchainStorageFlag).toBe(false)
    expect(settings.blockchainWebhookEndpoint).toBeTruthy()
    expect(settings.branch).toBe('master')
    expect(settings.claDocUrl).toBe('some/path/to/a/doc.md')
    expect(settings.repositoryName).toBe("some-repo")
    expect(settings.repositoryOwner).toBe("some-owner")
    expect(settings.repositoryAccessToken).toBe(settings.localAccessToken)
    expect(settings.claFilePath).toBeTruthy()
    expect(settings.whitelist).toBeFalsy()
    expect(settings.emptyCommitFlag).toBe(false)

    expect(settings.octokitRemote).toBeTruthy()
    expect(settings.octokitLocal).toBeTruthy()
})

it('Rejects invalid repository name arguments', () => {
    inputs["use-remote-repo"] = "true"
    inputs["remote-repo-name"] = "a-bad-repo-name"
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890"
    assert.throws(() => inputHelper.getInputs());
})

it('requires a pat with remote repo', () => {
    inputs["path-To-cladocument"] = "some/path/to/a/doc.md"
    inputs["use-remote-repo"] = "true"

    // Throws because neither a repo name nor a PAT are supplied
    assert.throws(() => {
        inputHelper.getInputs()
    })

    // Still throws because a PAT isn't supplied
    inputs["remote-repo-name"] = "someowner/somerepo"
    inputs["remote-repo-pat"] = null
    assert.throws(() => {
        inputHelper.getInputs()
    })

    // Still throws when only the PAT is supplied
    inputs["remote-repo-name"] = null
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890"
    assert.throws(() => {
        inputHelper.getInputs()
    })

    // Doesn't throw when both are supplied.
    inputs["remote-repo-name"] = "someowner/somerepo"
    inputs["remote-repo-pat"] = "1234567890123456789012345678901234567890"
    assert.doesNotThrow(() => {
        inputHelper.getInputs()
    })
})
