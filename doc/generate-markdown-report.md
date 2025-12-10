# generate-markdown-report

What it does

- Generates a report using the AppScan reporting API and converts the result to Markdown.

How it works (implementation notes)

- Calls `service.generateAndDownloadReport(type, id, reportOptions)` to generate HTML, then converts the HTML to Markdown using Turndown with custom rules.

Usage

- `appscan report md <type> <id>`

Options

- Options include: title, notes, locale, odataFilter, summary, details, discussion, overview, tableOfContent, history, coverage, articles, maxRetries, retryDelay.
- `--output` to save the markdown result to a file.

Notes / Caveats

- `type` is one of `Scan`, `Application`, `ScanExecution`.
- This command is useful when you need a portable Markdown version of an AppScan report.

Related files

- `src/commands/generate-markdown-report.js`