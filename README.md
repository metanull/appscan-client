# appscan-client

A Node.js command-line interface (CLI) tool for interacting with the HCL AppScan Cloud API.

## Features

- 🔐 API Key authentication
- 📋 List applications, scans, scan executions, and security issues
- 📊 Generate reports in Markdown and HTML formats
- ⚙️ Flexible configuration via environment variables or config files
- 🎯 Simple and intuitive command-line interface
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

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
APPSCAN_API_KEY=your_api_key_here
APPSCAN_API_SECRET=your_api_secret_here
APPSCAN_BASE_URL=https://cloud.appscan.com
```

### Configuration File

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
```

> Grouped reports now collapse repeated language/issue-type columns and automatically append the remediation article (via `get-article-markdown`) for the first issue in each group.

### Generate reports for every scan

```bash
# Generate markdown reports for all scans across all applications
appscan all-reports

# Limit to specific analyzers and emit HTML
appscan all-reports --html --technology StaticAnalyzer,ScaAnalyzer,DynamicAnalyzer

# Write outputs to a custom (empty) directory
appscan all-reports --outdir ./reports/daily
```

> The `all-reports` command streams a grouped issues report (with remediation snippets) for every scan, optionally filtering by technology, and writes one file per scan. Grouped mode is enabled by default; pass `--no-grouped` if you want the ungrouped layout. The command fails if the destination directory exists and contains files.

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

### Command Aliases

Short aliases are available for all commands:

```bash
appscan all-reports       # Generate all reports

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

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate test coverage
npm test:coverage

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

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

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

ISC

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/metanull/appscan-client/issues)
- HCL Support: [HCL Customer Support Portal](https://support.hcl-software.com/csm)
