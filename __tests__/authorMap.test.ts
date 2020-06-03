import { AuthorMap, Author } from "../src/authorMap"

describe('AuthorMap tests', () => {
    const mixMap = new AuthorMap([
        new Author({
            name: "HasSigned",
            signed: true,
            id: 1,
            pullRequestNo: 1
        }),
        new Author({
            name: "NotSigned",
            signed: false,
            id: 2,
            pullRequestNo: 1
        }),
        new Author({
            name: "NoAccount",
            signed: false,
            pullRequestNo: 1
        }),
    ]);

    const allMap = new AuthorMap([
        new Author({
            name: "HasSigned",
            signed: true,
            id: 1,
            pullRequestNo: 2
        }),
    ]);

    it('Count returns correct count', () => {
        const length = mixMap.getSigned().length + mixMap.getUnsigned().length;
        expect(mixMap.count).toBe(length);
    })

    it('Signed returns only signed', () => {
        const signed = mixMap.getSigned();
        expect(signed.length).toBe(1);
        expect(signed.every(a => a.signed)).toBe(true);
    });

    it('Unsigned returns only signed', () => {
        const unsigned = mixMap.getUnsigned();
        expect(unsigned.length).toBe(2);
        expect(unsigned.every(a => !a.signed));
    });

    it('Mixed has not everyone signed', () => {
        expect(mixMap.allSigned()).toBe(false);
        expect(allMap.allSigned()).toBe(true);
    });

    it('Gets non-github accounts', () => {
        const signed = mixMap.getNonGithubAccounts();
        expect(signed.length).toBe(1);
        expect(signed.every(a => a.signed)).toBe(false);
    });
});