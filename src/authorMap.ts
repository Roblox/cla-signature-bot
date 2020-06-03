/**
 * Stored 
 */
export class AuthorMap {
    private _authors: Author[];

    constructor(authors: Author[]) {
        this._authors = authors;
    }

    /**
     * Get all authors that have signed the CLA.
     */
    public getSigned(): Author[] {
        return this._authors.filter(a => a.signed);
    }

    /**
     * Get all authors that have not signed the CLA.
     */
    public getUnsigned(): Author[] {
        return this._authors.filter(a => !a.signed);
    }

    /**
     * Get all authors that don't have a related GitHub account.
     */
    public getNonGithubAccounts(): Author[] {
        return this._authors.filter(a => !a.id);
    }

    /**
     * Get whether all authors have signed.
     */
    public allSigned(): boolean {
        return this._authors.every(a => a.signed);
    }

    get count(): number {
        return this._authors.length;
    }
}

export class Author {
    readonly name: string;
    readonly id?: number;
    readonly pullRequestNo?: number;
    readonly signed: boolean;

    constructor({ name, id, pullRequestNo, signed }: {
        name: string;
        id?: number;
        pullRequestNo?: number;
        signed: boolean
    }) {
        this.name = name;
        this.id = id;
        this.pullRequestNo = pullRequestNo;
        this.signed = signed;
    }
}
