[![CodeQL](https://github.com/metanull/appscan-client/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/metanull/appscan-client/actions/workflows/github-code-scanning/codeql)
[![Quality Check](https://github.com/metanull/appscan-client/actions/workflows/validate.yml/badge.svg)](https://github.com/metanull/appscan-client/actions/workflows/validate.yml)
[![Publish Release](https://github.com/metanull/appscan-client/actions/workflows/release.yml/badge.svg)](https://github.com/metanull/appscan-client/actions/workflows/release.yml)
[![Publish Package](https://github.com/metanull/appscan-client/actions/workflows/publish.yml/badge.svg)](https://github.com/metanull/appscan-client/actions/workflows/publish.yml)

---

# appscan-client

Command-line tool for interacting with HCL AppScan Cloud API. Facilitates vulnerability triage and Jira issue creation from AppScan security scans.
It provides CLI commands for automation and an interactive Terminal UI (TUI) for vulnerability triage.

## Overview

This tool streamlines the security vulnerability triage workflow by providing:

- **CLI mode** - Individual commands for automation and scripting
- **TUI mode** - Interactive terminal UI for efficient manual triage

Distributed as an npm package with binaries for global installation. Designed for Windows 10/11 with PowerShell, but works on any platform with Node.js.

**Key capabilities:**
- Browse applications, scans, and vulnerabilities from AppScan Cloud
- Filter and search issues by severity, status, and type
- Bulk update vulnerability status with comments
- Create and link Jira issues with detailed remediation documentation
- Generate reports in multiple formats (Markdown, HTML, PDF)

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
# AppScan on Cloud (ASoC) Configuration
APPSCAN_API_KEY=your_api_key_here
APPSCAN_API_SECRET=your_api_secret_here
APPSCAN_BASE_URL=https://cloud.appscan.com

# Azure DevOps (AzDO) Configuration
AZURE_DEVOPS_ORG=your-organization
AZURE_DEVOPS_BASE_URL=https://dev.azure.com
AZDO_PAT=your_personal_access_token_here

# Jira Integration (Optional, for both ASoC and AzDO)
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your_email@example.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEY=PROJ

# Confluence (Optional)
CONFLUENCE_HOST=https://your-domain.atlassian.net
```

**Azure DevOps Setup:**

To use the Azure DevOps TUI, you need:
1. An Azure DevOps organization with GitHub Advanced Security (GHAS) enabled
2. A Personal Access Token (PAT) with appropriate permissions:
   - `Advanced Security: Read` - to read alerts
   - `Advanced Security: Write` - to update alert states
   - `Code: Read` - to access repositories
   - `Project and Team: Read` - to list projects

Generate a PAT at: `https://dev.azure.com/{your-org}/_usersSettings/tokens`


## Usage

### Interactive TUI Mode

#### AppScan on Cloud (ASoC) TUI

Launch terminal UI for AppScan vulnerability triage:

```bash
appscan asoc
```

#### Azure DevOps (AzDO) TUI

Launch terminal UI for Azure DevOps GHAS alert triage:

```bash
appscan azdo
```

**Keyboard Shortcuts (ASoC):**
- `↑/↓` - Navigate list
- `Enter` - View details (open details modal)
- `Space` - Toggle selection (moves to next item)
- `Ctrl+A` - Select all
- `Alt+A` - Clear selection
- `Left` - Open vulnerability (open issue in browser)
- `Right` - Open source file/URL (if available)
- `Ctrl+←` - Open scan in AppScan (when applicable)
- `Ctrl+→` - Open linked Jira issue (when present)
- `Ctrl+O` - Open application selector
- `Ctrl+W` - Open scan selector
- `l` - Links (open links modal)
- `p` - Edit application properties
- `u` - Update status
- `s` - Update severity
- `j` - Create Jira issue for current vulnerability
- `Ctrl+K` - Link selected issues to Jira
- `Alt+K` - Unlink selected issues from Jira
- `f` - Open filter modal
- `/` - Open search modal
- `Alt+F` - Clear filters
- `x` / `Alt+X` - Exclude / Include Noise & Passed issues
- `1`–`6` - Filter presets (status & severity presets)
- `o` - Sort (cycles through sort options)
- `c` - Toggle context pane
- `d` - Toggle details pane
- `h` / `?` - Help
- `Ctrl+D` / `Alt+D` - Enable / Disable debug mode
- `Ctrl+Q` - Quit

**Keyboard Shortcuts (AzDO):**
- `↑/↓` - Navigate list
- `Space` - Toggle alert selection
- `Ctrl+A` - Select all alerts
- `Alt+A` - Clear selection
- `Ctrl+O` - Open project selector
- `Ctrl+W` - Open repository selector
- `s` - Update alert state (Active/Dismissed/Fixed)
- `v` - Update alert severity
- `f` - Open filter modal (by state, severity, type)
- `/` - Open search modal
- `Alt+F` - Clear filters
- `o` - Sort (severity, name, state, type)
- `c` - Toggle context pane
- `d` - Toggle details pane
- `r` - Reload alerts
- `h` / `?` - Help
- `Ctrl+Q` - Quit

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

### Azure DevOps CLI Commands

#### Organization & Projects

```bash
# Get organization details
appscan get-azdo-organization
appscan azdo-org --json

# List projects
appscan list-azdo-applications
appscan azdo-apps --json

# Get project details
appscan get-azdo-application <projectId>
appscan azdo-app "MyProject" --json
```

#### Repositories

```bash
# List repositories in a project
appscan list-azdo-repositories --appId <projectId>
appscan azdo-repos --appId "MyProject"

# Get repository details
appscan get-azdo-repository --appId <projectId> --repositoryId <repoId>
appscan azdo-repo --appId "MyProject" --repositoryId "MyRepo"
```

#### Alerts (Security Issues)

```bash
# List alerts in a repository
appscan list-azdo-issues --appId <projectId> --repositoryId <repoId>
appscan azdo-issues --appId "MyProject" --repositoryId "MyRepo" --type secret
appscan azdo-issues --appId "MyProject" --repositoryId "MyRepo" --severity high

# List all alerts in a project (across all repositories)
appscan list-azdo-issues-by-app --appId <projectId>
appscan azdo-app-issues --appId "MyProject" --type code --severity critical

# Get alert details
appscan get-azdo-issue-detail --appId <projectId> --repositoryId <repoId> --issueId 123
appscan azdo-issue --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --json

# Update alert
appscan update-azdo-issue --appId <projectId> --repositoryId <repoId> --issueId 123 --status Dismissed --reason FalsePositive --comment "Not a real vulnerability"
appscan azdo-update --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --status Fixed
appscan azdo-update --appId "MyProject" --repositoryId "MyRepo" --issueId 123 --status Active

# Valid states: Active, Dismissed, Fixed
# Valid dismissal reasons: Fixed, AcceptedRisk, FalsePositive, AgreedToGuidance, ToolUpgrade
```

#### Filtering Options (Azure DevOps)

- `--type <value>` - Filter by alert type: `unknown`, `dependency`, `secret`, `code`, `license`
- `--severity <value>` - Filter by severity: `low`, `medium`, `high`, `critical`, `note`, `warning`, `error`
- `--json` - JSON output

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
   - Adjust title, description and properties
   - Review assignee and parent epic
   - Add Jira labels
   - Add Jira and Confluence links (related stories and pages)

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
- [HCL AppScan Cloud](https://eu.cloud.appscan.com)
- [HCL AppScan Rest API Documentation](https://help.hcl-software.com/appscan/ASoC/appseccloud_rest_apis.html)
- [HCL AppScan Rest API Reference (OpenApi/Swagger)](https://eu.cloud.appscan.com/swagger/ui/index)
- [Azure DevOps Rest APIs (1)](https://docs.microsoft.com/en-us/rest/api/vsts/?view=vsts-rest-4.1)
- [Azure DevOps REST APIs (2)](https://learn.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-7.2&viewFallbackFrom=vsts-rest-4.1)
- [Azure DevOps Rest API - client npm package](https://www.npmjs.com/package/azure-devops-node-api)
- [Azure DevOps Rest API - client npm package - APIs definitions](https://github.com/microsoft/azure-devops-node-api/tree/master/api)
- [Azure DevOps Rest API - client npm package - sample usage](https://github.com/Microsoft/azure-devops-node-api/tree/a90acbea84261f8d099bd2019088b907f40bb926/samples)
