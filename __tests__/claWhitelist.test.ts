import { Whitelist } from "../src/claWhitelist"
import { Author } from "../src/authorMap";

const whitelistAuthor = new Author({
    name: "SomeUsername",
    signed: false,
});

const notWhiltelistAuthor = new Author({
    name: "JoeRandom",
    signed: false
});

const whitelistBot = new Author({
    name: "CompanyBotForGithub",
    signed: false,
});

const weirdName = new Author({
    name: "A?Weird!User.Name@somecompany.email",
    signed: false,
});

const emptyList = new Whitelist("");
const whitelist = new Whitelist(`${whitelistAuthor.name},CompanyBot*,${weirdName.name},`);

it('Empty whitelist keeps author.', () => {
    expect(emptyList.isUserWhitelisted(whitelistAuthor)).toStrictEqual(false);
    expect(emptyList.isUserWhitelisted(notWhiltelistAuthor)).toStrictEqual(false);
    expect(emptyList.isUserWhitelisted(whitelistBot)).toStrictEqual(false);
    expect(emptyList.isUserWhitelisted(weirdName)).toStrictEqual(false);
});

it('Author is whitelisted', () => {
    expect(whitelist.isUserWhitelisted(whitelistAuthor)).toStrictEqual(true);
    expect(whitelist.isUserWhitelisted(notWhiltelistAuthor)).toStrictEqual(false);
});

it('Glob bot is whitelisted', () => {
    expect(whitelist.isUserWhitelisted(whitelistBot)).toStrictEqual(true);
});

it('Username with special characters is still whitelisted', () => {
    expect(whitelist.isUserWhitelisted(weirdName)).toStrictEqual(true);
});
