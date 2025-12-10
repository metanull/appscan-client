# list-scan-executions

What it does

- Lists executions (runs) for a specific scan ID.

How it works (implementation notes)

- Calls AppScanService.listScanExecutions(scanId) and shows execution status, start and end time.

Usage

- `appscan scans exec <scanId>`

Options

- `--json` - return raw JSON

Notes / Caveats

- The command prints details such as execution Id, status, started and completed timestamps.

Related files

- `src/commands/list-scan-executions.js`