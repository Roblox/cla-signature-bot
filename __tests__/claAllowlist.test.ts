import { Allowlist } from "../src/claAllowlist"
import { Author } from "../src/authorMap";

const allowlistAuthor = new Author({
    name: "SomeUsername",
    signed: false,
});

const notAllowlistAuthor = new Author({
    name: "JoeRandom",
    signed: false
});

const allowlistBot = new Author({
    name: "CompanyBotForGithub",
    signed: false,
});

const weirdName = new Author({
    name: "A?Weird!User.Name@somecompany.email",
    signed: false,
});

const emptyList = new Allowlist("");
const whitelist = new Allowlist(`${allowlistAuthor.name},CompanyBot*,${weirdName.name},`);

it('Empty allowlist keeps author.', () => {
    expect(emptyList.isUserAllowlisted(allowlistAuthor)).toStrictEqual(false);
    expect(emptyList.isUserAllowlisted(notAllowlistAuthor)).toStrictEqual(false);
    expect(emptyList.isUserAllowlisted(allowlistBot)).toStrictEqual(false);
    expect(emptyList.isUserAllowlisted(weirdName)).toStrictEqual(false);
});

it('Author is allowlisted', () => {
    expect(whitelist.isUserAllowlisted(allowlistAuthor)).toStrictEqual(true);
    expect(whitelist.isUserAllowlisted(notAllowlistAuthor)).toStrictEqual(false);
});

it('Glob bot is allowlisted', () => {
    expect(whitelist.isUserAllowlisted(allowlistBot)).toStrictEqual(true);
});

it('Username with special characters is still allowlisted', () => {
    expect(whitelist.isUserAllowlisted(weirdName)).toStrictEqual(true);
});
