jest.mock('node-fetch', () => jest.fn());

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { IInputSettings } from "../src/inputSettings";
import { BlockchainPoster } from "../src/blockchainPoster";

afterEach(() => {
    jest.resetAllMocks();
    jest.mocked(fetch).mockClear()
})

it("Returns early if the flag is false", async () => {
    const settings = {
        blockchainStorageFlag: false
    } as IInputSettings

    const poster = new BlockchainPoster(settings);
    await poster.postToBlockchain([]);

    expect(fetch).toHaveBeenCalledTimes(0);
});

it("Posts the whole input array", async() => {
    jest.mocked(fetch).mockImplementation((): Promise<any> => {
        return Promise.resolve({
            json() {
                return Promise.resolve({success: true});
            }
        })
    })
    const settings = {
        blockchainStorageFlag: true,
        blockchainWebhookEndpoint: "example.com"
    } as IInputSettings

    const poster = new BlockchainPoster(settings);
    await poster.postToBlockchain([]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith(settings.blockchainWebhookEndpoint, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: "[]"
    });
})