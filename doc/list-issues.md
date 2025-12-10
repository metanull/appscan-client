# list-issues

What it does

- Lists issues (vulnerabilities) for a specified scan.
- Supports grouped or severity-organized views.

How it works (implementation notes)

- Calls AppScanService.listIssues(scanId, excludeStatus) and fetches vulnerabilities.
- Supports grouped output and human-friendly table-like rendering.

Usage

- Basic usage:
  - `appscan issues <scanId>`

- Examples:
  - `appscan issues ac0fee05-9ac5-4125-ba6c-32a57f7aacd3`
  - `appscan issues <scanId> --grouped` (display grouped by application/issue type)
  - `appscan issues <scanId> --exclude-status Noise` (customize excluded status)

Options

- `--json` - print raw JSON of issues
- `--grouped` - show grouped view (Application → IssueType → Severity)
- `--exclude-status` - OData status filter to exclude statuses like `Noise`

Notes / Caveats

- The command includes rich formatting and color-coding for severity.
- The grouped view sorts by Application → IssueType → Severity for easier triage.

Related files

- `src/commands/list-issues.js`
- `src/utils/triage-ui.js`
- `src/services/appscan-service.js`