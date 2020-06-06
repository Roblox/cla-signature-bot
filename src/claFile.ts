import * as core from '@actions/core';
import { Author, AuthorMap } from "./authorMap";
import { SignEvent } from "./signEvent";

export class ClaFile {

    readonly _records: SignEvent[];

    constructor(base64Content?: string) {
        if (base64Content) {
            this._records = JSON.parse(Buffer.from(base64Content, "base64").toString()).signedContributors;
        } else {
            this._records = [];
        }
    }

    public mapSignedAuthors(authors: Author[]): AuthorMap {
        return new AuthorMap(authors.map(a =>
            new Author({
                name: a.name,
                id: a.id,
                pullRequestNo: a.pullRequestNo,
                signed: this._records.some(r => r.id === a.id)
            })
        ));
    }

    public addSignature(sigEvent: SignEvent[]): SignEvent[] {
        core.debug(`Adding signatures: '${sigEvent.map(e => e.name).join(', ')}'`)
        // We only want to handle valid signature event objects.
        const validEvents = sigEvent.filter(sig =>
            sig.id !== undefined
            && sig.pullRequestNo !== undefined
            && !this._records.some(a => a.id === sig.id));

        core.debug(`Adding valid signatures: ${validEvents.map(e => e.name).join(', ')}'`)
        this._records.push(...validEvents);

        return validEvents;
    }

    public toBase64(): string {
        return Buffer
            .from(JSON.stringify({ signedContributors: this._records }, null, 2))
            .toString("base64");
    }
}
