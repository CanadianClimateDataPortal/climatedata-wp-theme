# Contributing

1. Any `feature` branch linked to a Jira or GitHub issue must use this naming : <issue-number>_shortdesc 
2. All changes to the codebase pass through a PR review process
3. No commits are allowed on the `main` branch
4. Each feature must be tested in `demo` or `demo-2.0` before its approbation
5. `demo` or `demo-2.0` branch is not allowed to be force pushed
6. `main` can be merged into `demo` or `demo-2.0` branch when needed
7. To be merged into `main` branch, all PR checks must pass 
8. Only `feature` branches can be merged on `main`
9. `demo` and `demo-2.0` branch can’t be merged on `main`, since it may contain not yet approved features
10. After having merged a `feature` branch into `main`, the branch should be deleted and not pushed later on
11. The `main` branch must always be in a production ready state
12. All changes are written down in the CHANGELOG.md file using this semantic : 2021-11-19.01
13. In case a feature requires changes to be performed after its deployment (eg: in Wordpress), those changes must be described within the PR description
14. Contributions must be simple to review and focused on single goal
15. `demo` branch is deployed on staging1 (climatedata.crim.ca) every 5 minutes
16. `demo-2.0` branch is deployed on staging2 (climatedata2.crim.ca) every 5 minutes
17. `main` branch is deployed manually when needed on cca-portal1.climatedata.ca
18. At least one person from CRIM must have approved the PR before it gets merged to `main`
19. Each PR description must use the predefined PR template, featuring the reason behind this PR, checklists, etc.

<em>Refer to the image below for graphically represented Git workflow.</em>

![Branching strategy](branching.png)

## Pull requests process

When submitting a pull request, make sure to provide a meaningful description. Depending on what your update does, don't hesitate to add context, to
describe the current (incorrect) behavior, to describe what modification your update brings, etc.

If the PR is related to a specific ticket, include a link to the ticket.

### If your pull request is "approved" by the reviewer

A PR will be approved when there are no changes requested, or when there are only minor changes requested (ex: related to code style or comments, code changes that don't affect the general logic, etc.).

The person that opened the PR will then be responsible to:
1. Update the code as requested, if changes were requested.
2. Mark as "resolved" all pending discussions.
3. **_Squash and Merge_** the PR.
4. Delete the branch, if it's a _feature_ or _fix_ branch.

**Notes**:
* Make sure to read the comments left by the reviewer. Even if the PR is approved, there might be requests for minor changes.
* Beside the requested minor changes, don't update your code after the PR has been approved.
* Always _Squash and Merge_, unless exception.
* If a requested change needs more discussion, discuss under the comment left by the reviewer. If a discussion happened outside of GitHub
  (ex: by video call), write in the comment's discussion a summary of what was discussed.

### If your pull request is marked "Request changes" by the reviewer

A PR will be marked "Request changes" when requested changes are significant enough that the necessary updates would
need a new review.

The person that opened the PR will then be responsible to:
1. Update the code as requested (but don't "resolve" the reviewer's comments).
2. Request again a review from the reviewer (using the button beside the reviewer's name).

**Notes**:
* When ready for another review, use the "Re-request review" button beside the reviewer's name. Don't simply add a comment
  nor simply send a message to the reviewer.
* **_Don't_** mark the reviewer's comments as "Resolved" after you updated your code. The reviewer will need to know
  what was the comment before re-validating it. The reviewer will "resolve" the conversation once it's considered resolved.
  If you want to show that you have now "resolved" the comment, you can add a reaction (ex: 👍) or a comment to the comment.
* Once your PR is approved, follow the instructions in "_If your pull request is approved_".
