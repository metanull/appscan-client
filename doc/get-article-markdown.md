# get-article-markdown

What it does

- Fetches a remediation article (HTML) and converts it to Markdown for clean textual review.

How it works (implementation notes)

- Fetches article via `service.getArticle(issueId, options)`.
- Uses TurndownService to convert HTML to Markdown, with custom rules to strip <style> and <script>.

Usage

- `appscan article md <issueId>`
- `appscan article md <issueId> --output remediation.md`

Options

- Same options as get-article (language, api, cveId, mode, nl, enableTrainingLinks)
- `--output` to write Markdown to a file.

Notes / Caveats

- Markdown output is typically suitable for pasting into ticketing systems or docs.

Related files

- `src/commands/get-article-markdown.js`