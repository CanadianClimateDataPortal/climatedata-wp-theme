# Pull requests process

## Submitting a pull request

When submitting a pull request, make sure to provide a meaningful description.
Depending on what your update does, don't hesitate to add context, to describe
the current (incorrect) behavior, to describe what modification your update
brings, etc.

The PR's description must be written in English.

If the PR is related to a specific ticket, include a link to the ticket.

### If your pull request is "approved" by the reviewer(s)

Your responsibilities are then:

1. Update the code as requested, if changes were requested.
2. Mark as "resolved" all pending comments.
3. **_Squash and Merge_** the PR.
4. Delete the branch (only if it was a feature/fix development branch).

Notes:
* If multiple reviewers were assigned, you should wait for all of them to submit
  their review, unless it was agreed beforehand that only some of the reviews
  are required.
* Make sure to read the comments left by the reviewer(s). Even if the PR is
  approved, there might be requests for minor changes.
* Beside the requested minor changes, don't update your code after the PR has
  been approved.
* Always _Squash and Merge_ your branch. If you think that your PR should not
  be squashed, validate with the project's tech lead.
* If a requested change needs more discussion, discuss it in the comment's
  thread. If a discussion happened outside of GitHub (ex: by video call), write
  in the comment's thread a summary of what was discussed, or add a link to the
  external conversation if applicable (ex: a Slack exchange).

### If your pull request is marked "Request changes" by the reviewer(s)

Your responsibilities are:

1. Update the code as requested (but don't "resolve" the reviewers comments).
2. Request again a review from the reviewer(s)
   ([see how to](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews#re-requesting-a-review)).

Notes:
* When ready for another review, use the "Re-request review" button beside the
  reviewer's name. Don't simply add a comment nor simply send a message to the
  reviewer.
* **_Don't_** mark a reviewer's comments as "Resolved" after you updated your
  code. The reviewer will need to know what was the comment before re-validating
  it. The reviewer will "resolve" the comment once it's considered resolved. If
  you want to show that you have now "resolved" the comment, you can add a
  reaction (ex: 👍) or a message in the comment's thread.
* Once your PR is approved, follow the instructions above (in "_If your pull
  request is approved by the reviewer(s)_").

## Reviewing a pull request

If you are assigned a PR to review, your responsibilities are:

1. Make sure the code follows the best practices and that it works as expected
   (test the code on your environment).
2. Add comments where modifications are desired.
3. Submit your review:
    * "Approved" if no changes are requested, or the requested changes are minor
      enough that you don't need to review them.
    * "Request Changes" if you would like to review how the changes will be
      implemented.

If you are requested to *re*-review a PR, your responsibilities are:

1. Review every comment you left and make sure the correct changes have been
   applied.
2. Mark as "Resolved" comments that have been resolved.
3. Add more comments, if required.
4. Submit your review ("Approved" or "Request Changes").

Notes:
* Always _submit_ a review ("Approved" or "Request Changes"), don't simply add
  a comment. Else, it complicates the PR management if we cannot easily see what
  has been reviewed or not. Don't hesitate to use "Request Changes".
* If a discussion happened outside a comment's thread (ex: a video call), update
  the thread to include a summary of what was discussed, or add a link to this
  outside discussion (ex: a Slack exchange).
