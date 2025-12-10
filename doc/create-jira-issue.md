# create-jira-issue

What it does

- Creates Jira issues from AppScan items. Can create issues from a whole scan (many vulnerabilities) or a single issue.

How it works (implementation notes)

- Validates Jira SDK availability (`jira.js`) and Jira configuration in the environment.
- Fetches issues (or a single issue) from AppScan.
- Filters issues by severity (via `--minSeverity`) before creating Jira issues.
- Builds a JIRA issue description and calls JiraService.createIssue.

Usage

- Create Jira issues for a scan (all issues matching filter):
  - `appscan create-jira scan <scanId> --project SEC --minSeverity 3`

- Create a Jira issue for a single issue:
  - `appscan create-jira issue <issueId> --project SEC` 

Options

- `--project` - Jira project key (project override)
- `--issueType` - desired Jira issue type (default: Bug)
- `--labels` - comma-separated labels
- `--minSeverity` - filter issues by severity threshold
- `--json` - return JSON with created Jira issue metadata

Notes / Caveats

- Requires `jira.js` installed or present in the runtime.
- Creates an AppScan external link inside the Jira description for traceability.

Related files

- `src/commands/create-jira-issue.js`
- `src/services/jira-service.js`