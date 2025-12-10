# get-issue-comments

What it does

- Lists comments for a given AppScan issue.

How it works (implementation notes)

- Calls the AppScan API: `Issues_GetIssueComments(issueId)` and prints comments with author, timestamps and content.

Usage

- `appscan issue comments <issueId>`
- `appscan issue comments <issueId> --json`

Options

- `--json` - return raw JSON

Notes / Caveats

- Useful for collecting context or historical notes associated with a vulnerability.
- Comment data is also used by the `triage` command to include comments in Jira descriptions (deduplicated).

Related files

- `src/commands/get-issue-comments.js`
- `src/services/appscan-service.js`