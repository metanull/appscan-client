# appscan-client

Command-line tool for interacting with HCL AppScan Cloud API. Provides both CLI commands for automation and an interactive Terminal UI (TUI) for vulnerability triage.

## Installation

### From GitHub Packages

```bash
npm config set @metanull:registry https://npm.pkg.github.com
npm install -g @metanull/appscan-client
```

### From Source

```bash
git clone https://github.com/metanull/appscan-client.git
cd appscan-client
npm install
npm run build
npm link
```

## Configuration

### Setup Wizard (Recommended)

```bash
appscan setup
```

Prompts for:
- AppScan API Key and Secret
- AppScan Base URL (default: https://cloud.appscan.com)
- Optional: Jira credentials (host, email, API token, project key)
- Optional: Confluence OWASP ASVS documentation URL

Configuration file location:
- **Windows**: `%USERPROFILE%\.appscan-client\.env`
- **Linux/macOS**: `~/.appscan-client/.env`
- **Development**: Project root `.env`

### Manual Configuration

Create `.env` file:

```env
APPSCAN_API_KEY=your_key
APPSCAN_API_SECRET=your_secret
APPSCAN_BASE_URL=https://cloud.appscan.com

# Optional Jira integration
JIRA_HOST=https://company.atlassian.net
JIRA_EMAIL=email@company.com
JIRA_API_TOKEN=token
JIRA_PROJECT_KEY=SEC

# Optional Confluence link
CONFLUENCE_OWASP_ASVS_URL=https://confluence.company.com/display/SEC/OWASP-ASVS
```

## Usage

### Interactive TUI Mode

Launch terminal UI for vulnerability triage:

```bash
appscan
# or
appscan triage
```

**Keyboard Shortcuts:**
- `↑/↓` - Navigate list
- `Enter` - View details
- `Space` - Toggle selection
- `Ctrl+A` - Select all
- `a` - Change application
- `s` - Change scan
- `f` - Filter issues
- `/` - Search
- `u` - Update status
- `j` - Create Jira issue
- `c` - Toggle context pane
- `h` - Help
- `q` - Quit

### CLI Commands

#### Connection & Setup

```bash
appscan connection-check          # Verify credentials
appscan setup                     # Configure .env file
```

#### List Resources

```bash
appscan list-applications         # List all applications
appscan list-scans [appId]        # List scans (all or by app)
appscan list-issues <scanId>      # List vulnerabilities
appscan list-issues-by-app <appId>  # All issues for an app
```

**Filtering Options:**
- `--active` / `--inactive` - Filter by status category
- `--pending` / `--processed` - Filter by triage state
- `--low` / `--medium` / `--high` - Filter by severity
- `--assigned` / `--unassigned` - Filter by Jira link presence
- `--exclude-status "Noise,Passed"` - Exclude statuses
- `--grouped` - Group by type/severity
- `--json` - JSON output

#### Issue Management

```bash
# Get issue details
appscan get-issue-details <issueId>
appscan get-issue-comments <issueId>
appscan get-article-markdown <issueId>

# Update status
appscan update-issue-status <issueId> <status>
appscan update-issue-status <issueId> InProgress --comment "Working on fix"

# Valid statuses: Open, InProgress, Reopened, Noise, Passed, Fixed
```

#### Jira Integration

```bash
# Create Jira issues
appscan create-jira-issue scan <scanId>
appscan create-jira-issue scan <scanId> --min-severity 3
appscan create-jira-issue issue <issueId> --project SEC

# Triage report with Jira
appscan triage-report bulk-update --issues id1,id2 --status InProgress
appscan triage-report create-jira --issues id1,id2 --project SEC --group-by type
appscan triage-report link-jira --issue <issueId> --jira-key SEC-123
```

#### Reports

```bash
# Generate markdown reports
appscan generate-report applications
appscan generate-report scans <appId>
appscan generate-report issues <scanId>
appscan generate-report issues <scanId> --grouped --min-severity 3

# Generate all reports
appscan all-reports
appscan all-reports --html --technology StaticAnalyzer --min-severity 4

# API-generated reports
appscan generate-api-report Scan <scanId> --format Pdf
appscan generate-markdown-api-report Scan <scanId>

# Yearly summary
appscan yearly-summary [year]
```

#### Advanced Triage

```bash
# Interactive triage workflow
appscan triage-report interactive

# Query with filters
appscan triage-report query --type vulnerabilities --app <appId> \
  --filter "status:Open;severity:High|Critical"

# Status report with Jira integration
appscan triage-report status --app <appId> --include-jira

# Bulk update by filter
appscan triage-report bulk-update-filter --app <appId> \
  --filter "status:Open;severity:High" --status InProgress
```

### Common Aliases

```bash
appscan apps              # list-applications
appscan scans             # list-scans
appscan issues <scanId>   # list-issues
appscan article <issueId> # get-article-markdown
appscan jira scan <scanId>  # create-jira-issue
appscan summary           # yearly-summary
```

## Output Format

- Status messages → `stderr`
- Data output → `stdout`
- Enables piping:

```bash
# PowerShell
appscan list-applications --json 2>$null | ConvertFrom-Json

# Bash
appscan list-applications --json 2>/dev/null | jq '.[] | select(.RiskRating=="High")'
```

## Typical Triage Workflow

1. Launch TUI: `appscan`
2. Select application
3. Select scan (or "all scans")
4. Filter LOW/INFORMATIONAL → Select all → Mark as "Accepted"
5. Filter MEDIUM → Review → Mark as "Accepted" or "InProgress"
6. Filter HIGH/CRITICAL → Review each:
   - Read details and article
   - Check if already in Jira
   - Mark as "Noise" (false positive) or "InProgress" (true positive)
   - Add comment with OWASP ASVS reference if applicable
7. Filter "InProgress" WITHOUT Jira reference
8. Select all → Create Jira issues (grouped by type)
9. Open created Jira Stories:
   - Adjust title (add app name, severity)
   - Link to related stories
   - Set assignee and epic
   - Add labels (e.g., `asvs1.2.3`)
   - Add Confluence link if ASVS-related

## Development

### Project Structure

```
src/
  ├── cli/              # CLI commands
  ├── tui/              # Terminal UI (Ink/React)
  ├── services/         # AppScan & Jira API services
  ├── utils/            # Shared utilities
  └── generated/        # Auto-generated API client
```

### Build

```bash
npm run build          # Build distribution
npm run lint           # Check code
npm run lint:fix       # Fix linting issues
npm run generate-api   # Regenerate API client from swagger
```

### Requirements

- Node.js >= 20.0.0
- HCL AppScan Cloud account with API access

## License

MIT

## Links

- [GitHub Repository](https://github.com/metanull/appscan-client)
- [HCL AppScan Cloud](https://cloud.appscan.com)
- [API Documentation](https://cloud.appscan.com/swagger/ui/index)
