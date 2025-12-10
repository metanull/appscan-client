# generate-report

What it does

- Generates reports (HTML or Markdown) for applications, scans, issues or scan executions.
- Can save to a file or emit to stdout.

How it works (implementation notes)

- Uses AppScanService to fetch data, delegates report rendering to `MarkdownReportGenerator` or `HtmlReportGenerator`.
- Has several report types: applications, scans, issues and executions.

Usage

- `appscan report generate <type> <id> [--format html|markdown] [--output file]`

Examples

- `appscan report generate issues <scanId> --format markdown --output report.md`

Options

- `--format` - `markdown` (default) or `html`
- `--output` - file to save report into
- `--minSeverity`, `--grouped`, `--columns` - filters and formatting for issues reports

Notes / Caveats

- Issues report supports exclusion filters, min severity and grouped output. If no issues remain after filters, no file is generated.

Related files

- `src/commands/generate-report.js`
- `src/reports/markdown-report.js`
- `src/reports/html-report.js`