import { IInputSettings } from "./inputSettings";
import { Author, AuthorMap } from "./authorMap";
import { SignEvent } from "./signEvent";

export class PullAuthors {
    private getCommitAuthorsQuery = `
query($owner:String! $name:String! $number:Int! $cursor:String!){
    repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
            commits(first: 100, after: $cursor) {
                totalCount
                edges {
                    node {
                        commit {
                            author {
                                email
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                            committer {
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                        }
                    }
                    cursor
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
}`.replace(/ /g, '');

    readonly settings: IInputSettings;

    constructor(settings: IInputSettings) {
        this.settings = settings
    }


    public async getAuthors(): Promise<Author[]> {
        const result = await this.queryForCommitAuthors();
        return result.repository.pullRequest.commits.edges
            .map(e => this.getUserFromCommit(e.node.commit)) // Get the authors
            .filter((author: Author, index: number, self: Author[]) => self.findIndex(a => a.name === author.name) === index) // Only unique authors
            .filter((a: Author) => a.id !== 41898282); // And skip accounts with this ID for some reason?
    }

    private async queryForCommitAuthors(): Promise<any> {
        try {
            // TODO: Pagination on large queries.
            const result = await this.settings.octokitLocal.graphql(this.getCommitAuthorsQuery, {
                owner: this.settings.localRepositoryOwner,
                name: this.settings.localRepositoryName,
                number: this.settings.pullRequestNumber,
                cursor: ''
            }) as any;
            if (result.repository.pullRequest.commits.totalCount > 100) {
                throw new Error("Commit query has more than 100 commits and GraphQL pagination isn't supported yet! Can't validate all of the authors of this PR.")
            }
            return result;
        } catch (error) {
            throw new Error(`GraphQL query to get commit authors failed: '${error.message}'. Details: ${JSON.stringify(error)} `);
        }
    }

    private getUserFromCommit(commit): Author {
        // Author details can come from multiple different object sources depending
        // on the results from the graphQL query.
        const author =
            (commit.author || {}).user
            || (commit.committer || {}).user
            || commit.author
            || commit.committer;
        return new Author({
            name: author.login || author.name,
            id: author.databaseId || undefined,
            pullRequestNo: this.settings.pullRequestNumber,
            signed: false
        });
    }
}