# yearly-summary

What it does

- Produces an aggregate, year-scoped summary of AppScan data: scans, issues, breakdowns by application, technology and severity.

How it works (implementation notes)

- Fetches applications and scans for the target year, collects issue counts via AppScanService.listIssues(scanId, 'Noise') and aggregates metrics.

Usage

- `appscan yearly-summary 2024` (defaults to current year when omitted)
- `appscan yearly-summary 2023 --json`

Options

- `--json` - output raw summary JSON

Notes / Caveats

- Useful for periodic reporting and trends.
- Scans are normalized into SAST/DAST/SCA via a helper function.

Related files

- `src/commands/yearly-summary.js`