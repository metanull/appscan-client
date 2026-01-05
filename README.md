# appscan-client

A Node.js command-line interface (CLI), Terminal User Interface (TUI), and Web UI tool for interacting with the HCL AppScan Cloud API.

## Features

- 🔐 API Key authentication
- 🛠️ **Interactive setup wizard** - Easy configuration with guided prompts
- ✅ **Connection check** - Verify your API credentials before starting
- 🎯 **Modern TUI (Terminal UI)** - Ink-based 3-pane interface for vulnerability triage
  - VS Code-style layout with context, list, and details panes
  - Real-time filtering and search
  - Keyboard-driven navigation with vim-style shortcuts
  - Modal-based workflow for all operations
  - Cached article loading for instant access
  - Multi-select and bulk operations
- 🌐 **Web UI** - React-based web interface mirroring TUI layout and features
  - Modern browser-based interface with 3-pane layout
  - All TUI features available in the browser
  - Responsive design with keyboard shortcuts
  - Same filtering, search, and bulk operations
  - RESTful API backend for easy integration
- 📋 List applications, scans, scan executions, and security issues
- 📊 Generate reports in Markdown and HTML formats
- ⚙️ Flexible configuration via environment variables or config files
- 🎨 Colored terminal output for better readability
- 🔧 Pipe-friendly: messages to stderr, data to stdout

## Prerequisites

- Node.js >= 20.0.0
- HCL AppScan Cloud account with API access
- API Key and Secret (generate from your AppScan account)

## Installation

### From GitHub Packages (Recommended)

```bash
# Configure npm to use GitHub Packages for @metanull scope
npm config set @metanull:registry https://npm.pkg.github.com

# Install globally
npm install -g @metanull/appscan-client

# Verify installation
appscan --version
```

**Note**: The package is published to GitHub Packages as `@metanull/appscan-client`. No authentication is required for installation of this public package.

### From Source

```bash
# Clone the repository
git clone https://github.com/metanull/appscan-client.git
cd appscan-client

# Install dependencies
npm install

# Generate API client from swagger specification
npm run generate-api

# Link the CLI tool globally (optional)
npm link
```

## Quick Start

### 1. Setup (First Time)

Run the interactive setup wizard to configure your credentials:

```bash
appscan setup
```

This will prompt you for:
- AppScan API Key and Secret
- AppScan Base URL (defaults to https://cloud.appscan.com)
- Optional JIRA configuration (host, email, API token, project key)
- Optional Confluence OWASP ASVS documentation URL

### 2. Verify Connection

Test your configuration:

```bash
appscan connection-check
```

### 3. Start Triaging Vulnerabilities

#### Option A: Terminal UI (TUI)

Launch the modern terminal UI:

```bash
appscan
# or
appscan triage
```

The TUI provides a 3-pane layout:
- **Context Pane** (left) - Shows selected app/scan info (toggle with `c`)
- **Vulnerability List** (center) - Filterable list of issues
- **Details Preview** (right) - Quick preview of selected issue

#### Option B: Web UI

Launch the web interface:

```bash
appscan web
# or specify a custom port
appscan web --port 8080
```

The Web UI will start at `http://localhost:3000` (or your specified port) and provides:
- **Same 3-pane layout** as the TUI
- **Browser-based interface** accessible from any modern browser
- **All TUI features** including filtering, search, bulk operations, Jira integration
- **Keyboard shortcuts** work the same way in the browser

#### Keyboard Shortcuts (TUI & Web UI)

| Key | Action |
|-----|--------|
| `↑/↓` | Move cursor |
| `PageUp/PageDown` | Page navigation |
| `Home/End` | Go to first/last |
| `Enter` | Open details modal |
| `Space` | Toggle selection |
| `Ctrl+A` | Select all |
| `Escape` | Close modal / go back |
| `a` | Change application |
| `s` | Change scan |
| `f` | Filter |
| `/` | Search |
| `l` | Links |
| `u` | Update status |
| `j` | Create Jira |
| `c` | Toggle context pane |
| `r` | Refresh |
| `h` or `?` | Help |
| `q` | Quit |

## Configuration

### Configuration File Location

When installed globally, the `.env` file and logs are stored in your user directory:

**Windows:** `%USERPROFILE%\.appscan-client\.env`  
**Linux/macOS:** `~/.appscan-client/.env`

When running from source (development), the `.env` file is in the project root.

Logs are stored in the `logs/` subdirectory:
- **Windows:** `%USERPROFILE%\.appscan-client\logs\`
- **Linux/macOS:** `~/.appscan-client/logs/`

### Interactive Setup (Recommended)

```bash
appscan setup
```

This wizard will automatically create the `.env` file in the correct location.

### Manual Configuration

#### Environment Variables

Create a `.env` file in the project root:

```env
# AppScan API Configuration
APPSCAN_API_KEY=your_api_key_here
APPSCAN_API_SECRET=your_api_secret_here
APPSCAN_BASE_URL=https://cloud.appscan.com

# JIRA Configuration (optional)
JIRA_HOST=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=SEC

# Confluence Configuration (optional)
CONFLUENCE_OWASP_ASVS_URL=https://confluence.company.com/display/SEC/OWASP-ASVS
```

#### Configuration File

Alternatively, create a JSON configuration file:

```json
{
  "apiKey": "your_api_key_here",
  "apiSecret": "your_api_secret_here",
  "baseUrl": "https://cloud.appscan.com"
}
```

Use the `-c` or `--config` flag to specify the config file path.

## Usage

### Setup and Configuration Commands

#### Setup

Interactive wizard to configure your `.env` file:

```bash
# First-time setup
appscan setup

# Force overwrite existing configuration
appscan setup --force
```

#### Connection Check

Verify your API credentials and connection:

```bash
# Test connection with default .env
appscan connection-check

# Test with custom config file
appscan connection-check --config /path/to/config.json
```

### Triage & Reporting Tool (New!)

The unified `triage-report` command provides comprehensive vulnerability management with querying, reporting, and Jira integration:

```bash
# Interactive triage workflow
appscan triage-report interactive

# Query vulnerabilities with filters
appscan triage-report query --type vulnerabilities --app <appId> \
  --filter "status:Open;severity:High|Critical"

# Generate status report
appscan triage-report status --app <appId> --include-jira

# Bulk update vulnerabilities
appscan triage-report bulk-update-filter --app <appId> \
  --filter "status:Open;severity:High" \
  --status InProgress

# Create Jira issues with grouping
appscan triage-report create-jira --issues id1,id2,id3 \
  --project SEC --group-by type
```

**Key Features:**
- 🔍 **Flexible querying** - Filter by status, severity, type, date with rich syntax
- 📊 **Status reporting** - Counts by severity and status with Jira integration
- ✏️ **Bulk updates** - Update single or multiple vulnerabilities efficiently
- 🎫 **Jira integration** - Create grouped issues with remediation details
- 🔗 **Traceability** - Auto-link Jira issues to AppScan vulnerabilities
- 🎯 **Interactive mode** - Guided workflow for manual triage sessions
- 📋 **JSON output** - All commands support JSON for automation

**See full documentation:** [doc/triage-report.md](doc/triage-report.md)

### Interactive Triage Tool (Legacy)

The original triage tool provides an efficient workflow for processing vulnerabilities:

```bash
# Start interactive triage
appscan triage

# Use custom config
appscan triage --config /path/to/config.json
```

**Triage Features:**
- 📊 View scans with issue counts (Critical, High, Medium, Low)
- 🔍 Browse vulnerabilities grouped by type
- ☑️  Multi-select issues with spacebar
- 🔄 Bulk update status (Open, InProgress, Noise, Passed, Fixed)
- 💬 Add comments to issues
- 🎫 Create JIRA issues for true positives
- 🔗 Auto-link to Confluence OWASP ASVS documentation
- 🌐 **Smart URL conversion** - Automatically converts relative URLs to absolute:
  - Azure DevOps source file paths → Clickable Git URLs
  - AppScan API paths → Direct issue detail links
  - DAST URLs → Full application URLs
- ♻️  Continuous workflow until all scans are processed

**Note:** Consider using `appscan triage-report interactive` for the newer unified workflow.

**Workflow Example:**
1. Select scan "MyApp SAST" with 45 open issues
2. View grouped vulnerabilities (e.g., "SQL Injection" with 12 instances)
3. Select all 12 SQL Injection issues
4. Mark as "Noise" with comment "False positive - parameterized queries used"
5. Move to next group
6. When done, create JIRA issue for remaining Medium+ severity issues
7. Return to scan list and process next scan

### List Applications

```bash
# List all applications (colored output)
appscan list-applications

# Output as JSON
appscan list-applications --json

# Using a config file
appscan list-applications --config /path/to/config.json

# Pipe JSON output to other tools (messages go to stderr, data to stdout)
appscan list-applications --json 2>$null | ConvertFrom-Json | Where-Object { $_.RiskRating -eq 'High' }
```

### List Scans

```bash
# List scans for all applications (default)
appscan list-scans

# Filter scans by application ID
appscan list-scans 123e4567-e89b-12d3-a456-426614174000

# Output as JSON (filtered by app if provided)
appscan list-scans <appId> --json
```

### List Scan Executions

```bash
# List executions for a specific scan
appscan list-scan-executions <scanId>

# Example
appscan list-scan-executions 456e7890-e89b-12d3-a456-426614174000

# Output as JSON
appscan list-scan-executions <scanId> --json
```

### List Issues

```bash
# List issues for a specific scan (excludes 'Noise' status by default)
appscan list-issues <scanId>

# Example
appscan list-issues 456e7890-e89b-12d3-a456-426614174000

# Show all issues (including Noise)
appscan list-issues <scanId> --exclude-status ""

# Exclude specific statuses (comma-separated)
appscan list-issues <scanId> --exclude-status "Noise,False Positive"

# Output as JSON
appscan list-issues <scanId> --json

# Grouped view sorts by application, issue type, and severity and surfaces the new columns
appscan list-issues <scanId> --grouped
```

### Generate Reports

```bash
# Generate applications report
appscan generate-report applications

# Generate scans report for an application
appscan generate-report scans <appId>

# Generate issues report for a scan (excludes 'Noise' status by default)
appscan generate-report issues <scanId>

# Generate issues report including all statuses
appscan generate-report issues <scanId> --exclude-status ""

# Generate issues report excluding specific statuses
appscan generate-report issues <scanId> --exclude-status "Noise,False Positive"

# Generate a grouped issues report (applies the same application → issue type → severity ordering)
appscan generate-report issues <scanId> --grouped

# Filter by minimum severity (default: 3 = Medium and above)
appscan generate-report issues <scanId> --min-severity 4  # High and Critical only
appscan generate-report issues <scanId> --min-severity 0  # All severities
```

> Grouped reports now collapse repeated language/issue-type columns and automatically append the remediation article (via `get-article-markdown`) for the first issue in each group. Issue IDs are included in tables for REST API interaction.

### Generate reports for every scan

```bash
# Generate markdown reports for all scans across all applications
appscan all-reports

# Limit to specific analyzers and emit HTML
appscan all-reports --html --technology StaticAnalyzer,ScaAnalyzer,DynamicAnalyzer

# Write outputs to a custom (empty) directory
appscan all-reports --outdir ./reports/daily

# Filter by minimum severity (default: 3 = Medium and above)
appscan all-reports --min-severity 4  # High and Critical only
```

> The `all-reports` command streams a grouped issues report (with remediation snippets) for every scan, optionally filtering by technology and minimum severity, and writes one file per scan. Grouped mode is enabled by default; pass `--no-grouped` if you want the ungrouped layout. The command fails if the destination directory exists and contains files.

### Generate Yearly Summary

```bash
# Generate summary for current year
appscan yearly-summary

# Generate summary for specific year
appscan yearly-summary 2025

# Output as JSON
appscan yearly-summary 2024 --json

# Using alias
appscan summary 2025
```

> The `yearly-summary` command provides a high-level overview of all scans and vulnerabilities for a calendar year. It filters scans by creation date, excludes "Noise" issues, and presents:
> - Total applications, scans, and issues
> - Breakdown by scan type (SAST/DAST/SCA)
> - Issues grouped by application and scan type
> - Issues by severity level
> - List of recent scans with issue counts

# Generate executions report for a scan
appscan generate-report executions <scanId>

# Save report to file
appscan generate-report applications --output report.md

# Generate HTML report
appscan generate-report issues <scanId> --format html --output report.html

### Authenticate and Get Bearer Token

```bash
# Get bearer token
appscan auth bearer
```

### Get Issue Details

```bash
# Get issue details as HTML
appscan get-issue-details <issueId>

# Get issue details as XML
appscan get-issue-details <issueId> --format xml

# Save to file with specific locale
appscan get-issue-details <issueId> --locale de-DE --format html --output issue.html
```

### Get Remediation Article

Retrieve the remediation documentation (how to fix) for a specific issue. The command automatically fetches the issue details first to get the required parameters (issueType, language, API, CVE), then retrieves the remediation article:

```bash
# Get remediation article as HTML and display on screen
appscan get-article <issueId>

# Save article to HTML file
appscan get-article <issueId> --output remediation.html

# Get article and convert to Markdown
appscan get-article-markdown <issueId>

# Save article as Markdown file
appscan get-article-markdown <issueId> --output remediation.md

# Customize display mode (light or dark theme)
appscan get-article <issueId> --mode dark

# Enable training links in the article
appscan get-article <issueId> --enable-training-links
```

> **Note**: The article commands automatically retrieve the issue details first to extract the necessary parameters (issueType, language, API, CVE) before fetching the remediation article.

### Generate API Security Reports

Generate comprehensive security reports directly from the AppScan API with full customization options:

```bash
# Generate and download HTML report for a scan
appscan generate-api-report Scan <scanId>

# Generate PDF report with custom title and notes
appscan generate-api-report Scan <scanId> --format Pdf --title "Security Report" --notes "Q4 2025"

# Generate report with only Open issues (using OData filter)
appscan generate-api-report Scan <scanId> --open-only

# Generate report for an Application or ScanExecution
appscan generate-api-report Application <appId> --format Html
appscan generate-api-report ScanExecution <executionId> --format SARIF

# Generate and save with custom filename
appscan generate-api-report Scan <scanId> --format Csv --output security-report.csv

# Available formats: Html, Pdf, SARIF, Xml, Csv
```

### Generate Markdown Report from API

Generate an HTML report from AppScan API and automatically convert it to Markdown for console viewing:

```bash
# Generate and display markdown report on screen
appscan generate-markdown-api-report Scan <scanId>

# Generate markdown report with only Open issues
appscan generate-markdown-api-report Scan <scanId> --open-only

# Generate and save markdown to file
appscan generate-markdown-api-report Scan <scanId> --output report.md

# Generate for Application or ScanExecution
appscan generate-markdown-api-report Application <appId>
appscan generate-markdown-api-report ScanExecution <executionId>
```

> **Note**: The `generate-markdown-api-report` command:
> - Generates an HTML report via the AppScan API
> - Waits for the report to be ready (may take a few minutes)
> - Downloads and converts it to Markdown
> - Outputs to console or saves to file

### Update Issue Status

Update the status of a specific issue and optionally add a comment:

```bash
# Update issue status
appscan update-issue-status <issueId> InProgress

# Update status with a comment
appscan update-issue-status <issueId> Fixed --comment "Fixed in version 1.2.3"

# Update status and set external ID (e.g., Jira issue key)
appscan update-issue-status <issueId> InProgress --external-id "JIRA-123"

# Output as JSON
appscan update-issue-status <issueId> Noise --json

# Using alias
appscan update-status <issueId> Reopened
```

**Available Status Values:**
- `Open` - Issue is open
- `InProgress` - Work in progress
- `Reopened` - Issue was reopened
- `Noise` - False positive
- `Passed` - Accepted risk
- `Fixed` - Issue resolved
- `New` - New issue

### Get Issue Comments

Retrieve all comments for a specific issue:

```bash
# Get comments for an issue
appscan get-issue-comments <issueId>

# Output as JSON
appscan get-issue-comments <issueId> --json

# Using alias
appscan comments <issueId>
```

### Create Jira Issues

Create Jira issues from AppScan scans or individual issues. Requires Jira configuration in `.env` file:

```bash
# Create Jira issues for all vulnerabilities in a scan
appscan create-jira-issue scan <scanId>

# Create Jira issues with minimum severity filter (0-5)
appscan create-jira-issue scan <scanId> --min-severity 3

# Create Jira issue from a single AppScan issue
appscan create-jira-issue issue <issueId>

# Specify Jira project and issue type
appscan create-jira-issue scan <scanId> --project PROJ --issue-type Task

# Add custom labels
appscan create-jira-issue scan <scanId> --labels "security,critical,urgent"

# Exclude specific statuses
appscan create-jira-issue scan <scanId> --exclude-status "Noise,Passed"

# Output as JSON
appscan create-jira-issue scan <scanId> --json

# Using alias
appscan jira scan <scanId> --min-severity 4
```

**Severity Levels:**
- 5 = Critical
- 4 = High
- 3 = Medium (default minimum)
- 2 = Low
- 1 = Informational
- 0 = All issues

**Jira Configuration:**

Add the following to your `.env` file:

```env
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your_email@example.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEY=PROJ
```

> **Note**: To generate a Jira API token, go to: https://id.atlassian.com/manage-profile/security/api-tokens

### Command Aliases

Short aliases are available for all commands:

```bash
appscan all-reports       # Generate all reports
appscan summary [year]    # yearly-summary

appscan apps              # list-applications
appscan scans [appId]     # list-scans
appscan executions <scanId>  # list-scan-executions
appscan issues <scanId>   # list-issues
appscan report <type> [id]  # generate-report
appscan issue-details <issueId>  # get-issue-details
appscan api-report <type> <id>   # generate-api-report
appscan md-report <type> <id>    # generate-markdown-api-report
appscan article <issueId>        # get-article
appscan article-md <issueId>     # get-article-markdown
appscan update-status <issueId> <status>  # update-issue-status
appscan comments <issueId>       # get-issue-comments
appscan jira <source> <sourceId> # create-jira-issue
```

## Development

### Project Structure

```
appscan-client/
├── src/
│   ├── commands/          # CLI command implementations
│   ├── services/          # API service layer
│   ├── reports/           # Report generators
│   ├── utils/             # Utility functions
│   ├── generated/         # Auto-generated API client
│   └── index.js           # CLI entry point
├── scripts/               # Build and generation scripts
├── tests/                 # Test files
├── resource/              # Swagger API specification
└── package.json
```

### Available Scripts

```bash
# Start the CLI
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Regenerate API client
npm run generate-api
```

### Adding New Commands

1. Create a new command file in `src/commands/`
2. Import and register the command in `src/index.js`
3. Add tests in `tests/`

## API Documentation

The tool uses the HCL AppScan Cloud REST API v4. For detailed API documentation, visit:
- [AppScan Cloud API Documentation](https://cloud.appscan.com/swagger/ui/index)

## Output and Piping

The CLI tool follows best practices for command-line applications:

- **Status messages** (authentication, progress) are sent to **stderr**
- **Data output** (JSON, reports, lists) is sent to **stdout**
- This allows you to pipe data to other tools while still seeing progress messages

### Examples

```bash
# PowerShell: Filter applications by risk rating
appscan list-applications --json 2>$null | ConvertFrom-Json | Where-Object { $_.RiskRating -eq 'High' }

# PowerShell: Save JSON output and see progress
appscan list-applications --json > apps.json  # Progress shown, JSON saved

# Bash: Filter applications
appscan list-applications --json 2>/dev/null | jq '.[] | select(.RiskRating=="High")'

# Bash: Count applications
appscan list-applications --json 2>/dev/null | jq '. | length'
```

## Troubleshooting

### Authentication Errors

- Verify your API Key and Secret are correct
- Ensure your AppScan account has API access enabled
- Check that the base URL is correct for your region

### Connection Issues

- Verify network connectivity to AppScan Cloud
- Check if a proxy is required and configure appropriately
- Ensure your firewall allows outbound HTTPS connections

### Windows Testing Issues

If you encounter `'NODE_OPTIONS' is not recognized` error when running tests, the project uses `cross-env` to handle this automatically. Make sure all dependencies are installed:

```bash
npm install
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/metanull/appscan-client/issues)
- HCL Support: [HCL Customer Support Portal](https://support.hcl-software.com/csm)
