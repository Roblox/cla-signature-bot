/**
 * Structure of a record within the CLA file, versioned as v1.
 * This should not be modified without changing the version information.
 */
export interface SignEvent {
    name: string,
    id: number,
    pullRequestNo: number,
    comment_id: number,
    created_at: string,
    repoId: number
}
