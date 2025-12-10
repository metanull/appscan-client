# get-article

What it does

- Fetches the remediation article for a given issue (HTML) from AppScan and prints it or writes to a file.

How it works (implementation notes)

- Fetches the issue metadata and then calls `service.getArticle(issueId, options)` with language, api, or CVE parameters.
- Optionally writes HTML to file.

Usage

- `appscan article get <issueId>`
- `appscan article get <issueId> --output remediation.html`

Options

- `--language`, `--api`, `--cveId`, `--mode`, `--nl`, `--enableTrainingLinks`, `--output`

Notes / Caveats

- The output is HTML; to get cleaner Markdown, see `get-article-markdown`.

Related files

- `src/commands/get-article.js`
- `src/services/appscan-service.js`