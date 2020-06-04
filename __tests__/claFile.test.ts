import { ClaFile } from "../src/claFile"
import { SignEvent } from "../src/signEvent";
import { Author } from "../src/authorMap";

function fromBase64(str: string): any {
    return JSON.parse(Buffer.from(str, "base64").toString())
}

const empty = new ClaFile();

const rawAuthor = new Author({
    name: "SomeAccount",
    id: 12345,
    pullRequestNo: 5,
    signed: true,
});
const rawObject = {
    signedContributors: [
        {
            name: rawAuthor.name,
            comment_id: 5,
            created_at: "Some timestamp",
            id: rawAuthor.id,
            pullRequestNo: rawAuthor.pullRequestNo,
            repoId: 3
        } as SignEvent
    ]
};
const rawFile = Buffer.from(JSON.stringify(rawObject, null, 2)).toString("base64");
const oneSigner = new ClaFile(rawFile);

it('Sets empty contents correctly', () => {
    let emptyContents = fromBase64(empty.toBase64());
    expect(emptyContents).toBeTruthy();
    expect(emptyContents.signedContributors).toStrictEqual([]);
});

it('Loads and maps signed authors correctly', () => {
    const map = oneSigner.mapSignedAuthors([rawAuthor]);
    expect(map.count).toBe(1);
    const signed = map.getSigned();
    expect(signed.length).toBe(1);
});

it('Adds signature', () =>{
    const newMap = new ClaFile();
    const validAddResult = newMap.addSignature([{
        comment_id: 5,
        repoId: 3,
        created_at: "Some timestamp",
        id: rawAuthor.id!,
        name: rawAuthor.name!,
        pullRequestNo: rawAuthor.pullRequestNo!
    }]);
    expect(validAddResult.length).toBe(1);
});

it ('Rejects duplicate signatures', () => {
    const newMap = new ClaFile();
    const validAddResult = newMap.addSignature([{
        comment_id: 5,
        repoId: 3,
        created_at: "Some timestamp",
        id: rawAuthor.id!,
        name: rawAuthor.name!,
        pullRequestNo: rawAuthor.pullRequestNo!
    }]);
    expect(validAddResult.length).toBe(1);
    const invalidAddResult = newMap.addSignature([{
        comment_id: 5,
        repoId: 3,
        created_at: "Some timestamp",
        id: rawAuthor.id!,
        name: rawAuthor.name!,
        pullRequestNo: rawAuthor.pullRequestNo!
    }]);
    expect(invalidAddResult.length).toBe(0);
});