import { Author } from "./authorMap";
import * as core from '@actions/core'

export class Allowlist {
    readonly allowlist: string[];

    readonly reRegExpChar = /[\\^$.*+\-?()[\]{}|]/g;
    readonly reHasRegExpChar = RegExp(this.reRegExpChar.source);

    constructor(allowlist: string) {
        this.allowlist = (allowlist || "").split(',').map(s => s.trim());
    }

    /**
     * Determine if an author matches an allowlist rule.
     * @param user The user to check against the allowlist.
     */
    public isUserAllowlisted(user: Author): boolean {
        return this.allowlist.some(pattern => {
            let result = false;
            // Glob patterns need special handling, otherwise just match username.
            if (pattern.includes('*')) {
                const regex = this.escapeRegExp(pattern).split('\\*').join('.*');
                result = new RegExp(regex).test(user.name);
            } else {
                result = pattern === user.name;
            }

            if (result) {
                core.info(`Allowlisted author ${user.name} excluded from CLA requirement.`);
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