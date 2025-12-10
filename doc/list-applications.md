# list-applications

What it does

- Lists all applications configured in AppScan for the authenticated account.

How it works (implementation notes)

- Calls AppScanService.listApplications(), formats the list in a human-friendly way, or outputs JSON when requested.

Usage

- `appscan apps` — list all applications
- `appscan apps --json` — print raw JSON

Notes / Caveats

- Shows name, ID and description (if present). Useful for identifying application IDs to pass to other commands.

Related files

- `src/commands/list-applications.js`