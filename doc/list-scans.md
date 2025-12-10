# list-scans

What it does

- Lists scans in AppScan. By default lists scans for all applications, or for a specific application when supplied.

How it works (implementation notes)

- Calls AppScanService.listScans(appId) which fetches the scan metadata from the AppScan API.
- Output is either JSON (when `--json`) or human-friendly terminal output (using chalk).

Usage

- List all scans:
  - `appscan scans`

- List scans for a specific application (ID):
  - `appscan scans <appId>`

Options

- `--json` - output full JSON payload instead of formatted text.

Notes / Caveats

- The command displays scan name, ID and last execution status.
- The output is primarily intended for human triage, scripting can use `--json`.

Related files

- `src/commands/list-scans.js`
- `src/services/appscan-service.js`