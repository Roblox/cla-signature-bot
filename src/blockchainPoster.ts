import * as core from '@actions/core';
import fetch from "node-fetch";
import { SignEvent } from './signEvent';
import { IInputSettings } from './inputSettings';

export class BlockchainPoster {
    readonly settings: IInputSettings

    constructor(settings: IInputSettings) {
        this.settings = settings
    }

    public async postToBlockchain(signEvent: SignEvent[]): Promise<any> {
        if (!this.settings.blockchainStorageFlag) {
            return;
        }

        try {
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signEvent)
            };
            const res = await fetch(this.settings.blockchainWebhookEndpoint, config);
            const response = await res.json();
            core.debug("the response of the webhook is " + JSON.stringify(response));
            if (response.success) {
                core.debug("the response2 of the webhook is " + JSON.stringify(response));
                return response;
            }
        } catch (error) {
            core.error('The webhook post request for storing signatures in smart contract failed' + error);
        }
    }
}
