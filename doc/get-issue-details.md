# get-issue-details

What it does

- Retrieves detailed data for a single AppScan issue (vulnerability), optionally in HTML or XML.

How it works (implementation notes)

- Calls `service.getIssueDetails(issueId, locale, format)` to fetch a formatted issue detail.
- Supports writing the output to a file.

Usage

- `appscan issue get <issueId> --format html` (default: html)
- `appscan issue get <issueId> --output issue-1234.html`

Options

- `--format` - html|xml
- `--locale` - locale code to fetch localized content
- `--output` - write result to file

Notes / Caveats

- The page may contain full article / explanatory text; this command is used when you need the canonical issue details.

Related files

- `src/commands/get-issue-details.js`
- `src/services/appscan-service.js`