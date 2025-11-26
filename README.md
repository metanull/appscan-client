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
# List scans for a specific application
appscan list-scans <appId>

# Example
appscan list-scans 123e4567-e89b-12d3-a456-426614174000

# Output as JSON
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

# Generate executions report for a scan
appscan generate-report executions <scanId>

# Save report to file
appscan generate-report applications --output report.md

# Generate HTML report
appscan generate-report issues <scanId> --format html --output report.html
```

### Command Aliases

Short aliases are available for all commands:

```bash
appscan apps              # list-applications
appscan scans <appId>     # list-scans
appscan executions <scanId>  # list-scan-executions
appscan issues <scanId>   # list-issues
appscan report <type> [id]  # generate-report
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
