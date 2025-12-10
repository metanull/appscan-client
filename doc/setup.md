# setup

What it does

- Interactive setup wizard for saving AppScan API credentials and optional integration configuration (Jira, Confluence).

How it works (implementation notes)

- Prompts user for API key, secret, base URL, and optional Jira and Confluence settings using inquirer prompts.
- Writes a `.env` file with values supplied, or warns if an existing `.env` exists (unless `--force`).

Usage

- `appscan setup` (interactive) or `appscan setup --force` to overwrite a present `.env` file.

Notes / Caveats

- Be careful with production credentials — `.env` contains secrets. Use appropriate filesystem permissions.
- The command also prints next steps: `appscan connection-check` and `appscan triage`.

Related files

- `src/commands/setup.js`