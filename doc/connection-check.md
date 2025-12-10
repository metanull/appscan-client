# connection-check

What it does

- Verifies AppScan configuration and connectivity (API auth, list applications). Optionally checks Jira configuration.

How it works (implementation notes)

- Loads configuration from `.env` or supplied `--config`.
- Uses AppScanService.authenticate() to validate credentials and API access.
- If configured, checks Jira credentials and project key presence.

Usage

- `appscan connection-check`

Notes / Caveats

- Helpful first-step after `appscan setup` to confirm connectivity and credentials.

Related files

- `src/commands/connection-check.js`