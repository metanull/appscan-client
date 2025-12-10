# generate-report (detailed)

This helper wraps both the markdown and HTML generators and supports multiple resource types.

- Types: `applications`, `scans`, `issues`, `executions`
- Issues reports support `excludeStatus` and `minSeverity` filtering and can be grouped.

Implementation notes

- Uses `MarkdownReportGenerator` and `HtmlReportGenerator`.
- Writes to output path or to stdout.

This file points to the main `generate-report.md` which contains usage and examples.