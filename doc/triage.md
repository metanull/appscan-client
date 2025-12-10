# triage

What it does

- Interactive triage tool that helps human reviewers examine AppScan scan results, group vulnerabilities by type, update statuses, add comments, and create Jira issues.

How it works (implementation notes)

- Uses `AppScanService` to authenticate and list scans and issues.
- Presents a multi-step interactive workflow where users select a scan, choose an issue group, select issues, then take actions (update status/comment, create Jira issue, view details, refresh, or go back).
- Integrates with Jira via `JiraService` (optional) to create issues and link back to AppScan vulnerabilities.
- UI helpers (prompts & formatters) are defined in `src/utils/triage-ui.js` and are used to format choices, prompt for actions, and render results.

Usage

- `appscan triage [--scan-type <StaticAnalyzer|DynamicAnalyzer|ScaAnalyzer>]`

Key behaviors & features

- Scan filtering: the command can filter by `Technology` (scan type) argument.
- Sorted scan list: the command displays scans alphabetically for clarity.
- Scan issue listing: for each scan, issues are loaded (excluding `Noise` by default) and grouped by issue type.
- Actions supported for selected issues:
  - Update status and add comments (bulk)
  - Create a single Jira issue for selected or all true positives (configurable)
  - View issue details or refresh the list

Implementation notes & important files

- `src/commands/triage.js` — main interactive workflow and logic
- `src/utils/triage-ui.js` — prompt builders, formatting helpers and display functions
- `src/services/jira-service.js` — Jira integration and ADF conversion helpers
- `src/services/appscan-service.js` — underlying API client

Related tasks

- This command is complex and has a dedicated requirements document: `triage-requirements.md` for maintainers and future development.

Testing tips

- Use `node src/index.js triage` locally with a test account. Use `--scan-type` to narrow scenarios.
- When testing Jira creation, verify JIRA host, email, and token in `.env` and check rate/content limits of Jira.

