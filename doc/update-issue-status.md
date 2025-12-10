# update-issue-status

What it does

- Update status of a single issue using the AppScan API.

How it works (implementation notes)

- Uses `AppScanService.api.v4.Issues_GetIssue(issueId)` to fetch issue and applicationId (to target the update endpoint).
- Calls Issues_UpdateFilteredIssues to change status and optionally add a comment or ExternalId.

Usage

- `appscan issue update <issueId> <newStatus> --comment "..." --externalId JIRA-123`

Valid statuses

- `Open`, `InProgress`, `Reopened`, `Noise`, `Passed`, `Fixed`, `New`.

Options

- `--comment` - append a comment to updated issues
- `--externalId` - set ExternalId (e.g., JIRA key)
- `--json` - output raw result as JSON

Notes / Caveats

- The command validates the status and ensures the issue has an ApplicationId before performing a bulk update.
- Status updates are performed through a filtered update endpoint that targets a specific application via OData filter.

Related files

- `src/commands/update-issue-status.js`