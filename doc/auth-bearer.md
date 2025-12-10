# auth-bearer

What it does

- Returns an authentication bearer/token for AppScan API (for scripting or manual use).

How it works

- Calls `service.authenticate()` which either returns the bearer or prints it when run.

Usage

- `appscan auth-bearer`

Notes

- Useful for piping tokens into other tools or scripts.

Related files

- `src/commands/auth-bearer.js`