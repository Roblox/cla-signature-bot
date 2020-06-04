import { Author } from "./authorMap";
import * as core from '@actions/core'

export class Whitelist {
    readonly whitelist: string[];

    readonly reRegExpChar = /[\\^$.*+\-?()[\]{}|]/g;
    readonly reHasRegExpChar = RegExp(this.reRegExpChar.source);

    constructor(whitelist: string) {
        this.whitelist = (whitelist || "").split(',').map(s => s.trim());
    }

    /**
     * Determine if an author matches a whitelist rule.
     * @param user The user to check against the whitelist.
     */
    public isUserWhitelisted(user: Author): boolean {
        return this.whitelist.some(pattern => {
            let result = false;
            // Glob patterns need special handling, otherwise just match username.
            if (pattern.includes('*')) {
                const regex = this.escapeRegExp(pattern).split('\\*').join('.*');
                result = new RegExp(regex).test(user.name);
            } else {
                result = pattern === user.name;
            }

            if (result) {
                core.info(`Whitelisted author ${user.name} excluded from CLA requirement.`);
            }
            return result;
        });
    }

    private escapeRegExp(str: string): string {
        return (str && this.reHasRegExpChar.test(str))
            ? str.replace(this.reRegExpChar, '\\$&')
            : (str || '');
    }
}