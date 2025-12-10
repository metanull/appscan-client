# generate-and-download-report

What it does

- Generates a report (HTML, PDF, SARIF, XML, CSV) and saves it to disk.

How it works (implementation notes)

- Calls AppScanService.generateAndDownloadReport with multiple options controlling report contents and format.

Usage

- `appscan report download <type> <id> --format Html --output path` 

Options

- `--format` (Html, Pdf, SARIF, Xml, Csv)
- `--openOnly`, `--odataFilter`, and many report composition options similar to `generate-markdown-report`.

Notes / Caveats

- Saves report contents to a generated filename if `--output` is not provided.
- Validates the type and format arguments.

Related files

- `src/commands/generate-and-download-report.js`