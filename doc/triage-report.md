# Triage-Report Command

The `triage-report` command provides comprehensive querying, reporting, and triage management for AppScan vulnerabilities with integrated Jira support.

## Overview

This unified command consolidates vulnerability management workflows into a single, consistent interface with the following capabilities:

- **Query** applications, scans, scan executions, vulnerabilities, and remediation articles
- **Report** on vulnerability status with counts by severity and status
- **Update** single or multiple vulnerabilities with status changes and comments
- **Create Jira issues** for vulnerabilities with intelligent grouping
- **Find and link** Jira issues to AppScan vulnerabilities
- **Interactive workflow** for guided triage sessions

## Prerequisites

- **AppScan API credentials**: Set `APPSCAN_API_KEY` and `APPSCAN_API_SECRET` environment variables
- **Jira credentials** (optional, for Jira integration): Set `JIRA_HOST`, `JIRA_EMAIL`, and `JIRA_API_TOKEN`

## Subcommands

### query

Query AppScan data with filtering and output in JSON or table format.

**Usage:**
```bash
appscan triage-report query --type <type> [options]
```

**Types:**
- `applications` - List all applications
- `scans` - List scans (optionally filtered by app or scan type)
- `scan-executions` - List execution history for a scan
- `vulnerabilities` - List vulnerabilities with filtering
- `articles` - Get remediation article for an issue

**Examples:**

```bash
# List all applications
appscan triage-report query --type applications

# List scans for a specific application
appscan triage-report query --type scans --app <appId>

# List SAST scans only
appscan triage-report query --type scans --scan-type SAST

# List vulnerabilities for an application with filters
appscan triage-report query --type vulnerabilities --app <appId> --filter "status:Open;severity:High"

# List vulnerabilities for a scan
appscan triage-report query --type vulnerabilities --scan <scanId>

# Get remediation article for an issue
appscan triage-report query --type articles --issue <issueId> --markdown
```

**Filter Syntax:**

Use the `--filter` option with the following syntax:

- `status:Open|InProgress` - Filter by status (use `|` for OR)
- `severity:High|Critical` - Filter by severity
- `name:Injection` - Substring match on issue type name
- `type:SQL` - Substring match on issue type
- `date:>2025-12-01` - Filter by date (supports `>`, `<`, `>=`, `<=`)
- `external-id:SEC-123` - Filter by external ID (Jira key)

Combine multiple filters with `;` for AND logic:
```bash
--filter "status:Open|InProgress;severity:High|Critical;name:Injection"
```

### status

Generate a status report showing vulnerability counts by status and severity.

**Usage:**
```bash
appscan triage-report status --app <appId> | --scan <scanId> [options]
```

**Options:**
- `--include-jira` - Include Jira status information
- `--json` - Output as JSON (default)
- `--table` - Output as table

**Examples:**

```bash
# Status report for an application
appscan triage-report status --app <appId>

# Status report for a scan with Jira info
appscan triage-report status --scan <scanId> --include-jira
```

**Output:**
```json
{
  "entityType": "application",
  "entityId": "app-123",
  "report": {
    "total": 100,
    "byStatus": {
      "Open": 10,
      "InProgress": 20,
      "Noise": 50,
      "Passed": 15,
      "Fixed": 5
    },
    "bySeverity": {
      "Critical": 0,
      "High": 40,
      "Medium": 22,
      "Low": 38
    }
  }
}
```

### summary

Generate a high-level summary for an application showing all scans.

**Usage:**
```bash
appscan triage-report summary --app <appId>
```

**Example:**
```bash
appscan triage-report summary --app <appId>
```

### update

Update a single vulnerability's status, comment, or external ID.

**Usage:**
```bash
appscan triage-report update --issue <issueId> --status <status> [options]
```

**Valid Statuses:**
- `Open` - Initial/under review
- `InProgress` - True positive, awaiting fix
- `Noise` - False positive, dismissed
- `Passed` - True positive, accepted/no action required
- `Fixed` - True positive, already fixed

**Examples:**

```bash
# Update status
appscan triage-report update --issue <issueId> --status InProgress

# Update with comment
appscan triage-report update --issue <issueId> --status Noise --comment "False positive - test data"

# Link to Jira issue
appscan triage-report update --issue <issueId> --status InProgress --external-id SEC-123
```

### bulk-update

Update multiple specific vulnerabilities at once.

**Usage:**
```bash
appscan triage-report bulk-update --issues <id1,id2,id3> --status <status> [options]
```

**Examples:**

```bash
# Update multiple issues to Noise
appscan triage-report bulk-update --issues id1,id2,id3 --status Noise --comment "Test data"

# Mark multiple as fixed
appscan triage-report bulk-update --issues id1,id2 --status Fixed
```

**Note:** Issues are automatically grouped by application for efficient API calls.

### bulk-update-filter

Update all vulnerabilities matching a filter.

**Usage:**
```bash
appscan triage-report bulk-update-filter --app <appId> --filter <expr> --status <status> [options]
```

**Examples:**

```bash
# Mark all open high-severity issues as InProgress
appscan triage-report bulk-update-filter --app <appId> \
  --filter "status:Open;severity:High" \
  --status InProgress

# Dismiss all low-severity informational issues
appscan triage-report bulk-update-filter --app <appId> \
  --filter "severity:Low|Informational" \
  --status Noise \
  --comment "Low priority, accepted risk"
```

### create-jira

Create Jira issues for vulnerabilities with intelligent grouping.

**Usage:**
```bash
appscan triage-report create-jira --issues <ids> --project <key> [options]
```

**Grouping Strategies:**
- `type` (default) - One Jira issue per vulnerability type
- `severity` - One Jira issue per severity level
- `none` - One Jira issue per vulnerability

**Examples:**

```bash
# Create Jira issues grouped by type
appscan triage-report create-jira --issues id1,id2,id3 --project SEC

# Group by severity
appscan triage-report create-jira --issues id1,id2,id3 --project SEC --group-by severity

# Create individual issues
appscan triage-report create-jira --issues id1,id2,id3 --project SEC --group-by none

# Dry run to preview
appscan triage-report create-jira --issues id1,id2 --project SEC --dry-run

# Custom issue type and labels
appscan triage-report create-jira --issues id1,id2 --project SEC \
  --issue-type Task \
  --labels "security,critical,urgent"
```

**Features:**
- Automatically links Jira issues back to AppScan via ExternalId
- Includes vulnerability occurrences with code/endpoint links
- Adds remediation guidance from AppScan articles
- Respects Jira's ~32KB description limit with smart truncation
- Converts HTML to Markdown for better readability

### find-jira

Find Jira issues linked to an AppScan vulnerability.

**Usage:**
```bash
appscan triage-report find-jira --issue <issueId>
```

**Example:**
```bash
appscan triage-report find-jira --issue <issueId>
```

**Output:**
```json
{
  "appScanIssueId": "issue-123",
  "externalId": "SEC-638",
  "jiraIssues": [
    {
      "key": "SEC-638",
      "summary": "[Security] SQL Injection - 3 occurrences",
      "status": "In Progress",
      "url": "https://jira.company.com/browse/SEC-638"
    }
  ]
}
```

### link-jira

Manually link a Jira issue to an AppScan vulnerability.

**Usage:**
```bash
appscan triage-report link-jira --issue <issueId> --jira-key <key>
```

**Example:**
```bash
appscan triage-report link-jira --issue <issueId> --jira-key SEC-123
```

### interactive

Interactive guided triage workflow with step-by-step prompts.

**Usage:**
```bash
appscan triage-report interactive [options]
```

**Options:**
- `--app <appId>` - Pre-select an application
- `--scan-type <type>` - Filter scans by type (SAST, DAST, SCA, etc.)

**Example:**
```bash
# Start interactive session
appscan triage-report interactive

# Pre-select application
appscan triage-report interactive --app <appId>

# Filter to SAST scans only
appscan triage-report interactive --scan-type SAST
```

**Workflow:**
1. Select application (if not pre-selected)
2. Select scan
3. View grouped vulnerabilities by type
4. Choose action: update status or create Jira
5. Multi-select vulnerabilities
6. Complete action with prompts for details

## Configuration

### Environment Variables

**AppScan:**
- `APPSCAN_API_KEY` - AppScan API Key (required)
- `APPSCAN_API_SECRET` - AppScan API Secret (required)
- `APPSCAN_BASE_URL` - AppScan base URL (default: https://cloud.appscan.com)

**Jira (optional):**
- `JIRA_HOST` - Jira host (e.g., https://jira.company.com)
- `JIRA_EMAIL` - Jira user email
- `JIRA_API_TOKEN` - Jira API token
- `JIRA_PROJECT_KEY` - Default Jira project key

### Configuration File

Create a `.env` file in your project root:

```bash
APPSCAN_API_KEY=your_api_key
APPSCAN_API_SECRET=your_api_secret

# Optional Jira configuration
JIRA_HOST=https://jira.company.com
JIRA_EMAIL=user@company.com
JIRA_API_TOKEN=your_jira_token
JIRA_PROJECT_KEY=SEC
```

Or use a custom config file with `--config`:
```bash
appscan triage-report query --type applications --config ./custom.env
```

## Common Workflows

### Triage New Scan Results

```bash
# 1. List scans for an application
appscan triage-report query --type scans --app <appId>

# 2. Check vulnerability status
appscan triage-report status --scan <scanId>

# 3. Query open high/critical issues
appscan triage-report query --type vulnerabilities --scan <scanId> \
  --filter "status:Open;severity:High|Critical"

# 4. Use interactive mode for triage
appscan triage-report interactive --app <appId>
```

### Bulk Dismiss False Positives

```bash
# Mark all test-related SQL injection issues as Noise
appscan triage-report bulk-update-filter --app <appId> \
  --filter "status:Open;name:SQL" \
  --status Noise \
  --comment "Test environment data, not a real vulnerability"
```

### Create Jira Issues for High Priority Issues

```bash
# 1. Query high/critical open issues
appscan triage-report query --type vulnerabilities --app <appId> \
  --filter "status:Open;severity:High|Critical" > issues.json

# 2. Extract issue IDs and create Jira issues
appscan triage-report create-jira \
  --issues id1,id2,id3 \
  --project SEC \
  --group-by type
```

### Track Remediation Progress

```bash
# 1. Get status report
appscan triage-report status --app <appId> --include-jira

# 2. Find Jira issues for specific vulnerabilities
appscan triage-report find-jira --issue <issueId>

# 3. Update AppScan when Jira is resolved
appscan triage-report update --issue <issueId> --status Fixed
```

## Output Formats

### JSON (Default)

All commands output JSON by default, which can be piped to `jq` for processing:

```bash
# Extract issue IDs
appscan triage-report query --type vulnerabilities --app <appId> | \
  jq -r '.vulnerabilities[].id'

# Count by severity
appscan triage-report status --app <appId> | \
  jq '.report.bySeverity'
```

### Table

Use `--table` flag for human-readable output (where supported):

```bash
appscan triage-report query --type applications --table
```

## Error Handling

The command provides clear error messages with suggestions:

```bash
# Missing required option
$ appscan triage-report query --type vulnerabilities
Error: Either --app or --scan option is required for vulnerabilities query

# Invalid status
$ appscan triage-report update --issue <id> --status InvalidStatus
Error: Invalid status: InvalidStatus. Valid: Open, InProgress, Noise, Passed, Fixed

# Issue not found
$ appscan triage-report update --issue invalid-id --status Open
Error: Issue not found: invalid-id
```

## Best Practices

1. **Use filters** to narrow results and improve performance
2. **Bulk update by application** for efficiency (automatically handled)
3. **Group Jira issues by type** to avoid creating too many issues
4. **Add comments** when changing status for audit trail
5. **Link Jira issues** immediately after creation for traceability
6. **Use interactive mode** for manual triage sessions
7. **Export to JSON** for integration with other tools

## Limitations

- Jira descriptions are limited to ~32KB; long descriptions are automatically truncated
- Bulk updates may take time for large numbers of issues
- Filter syntax does not support complex nested conditions
- Article HTML to Markdown conversion is best-effort

## Troubleshooting

### Authentication Errors

```bash
# Verify credentials
appscan connection-check

# Test with explicit config file
appscan triage-report query --type applications --config .env
```

### Jira Integration Issues

```bash
# Verify Jira credentials are set
echo $JIRA_HOST
echo $JIRA_EMAIL

# Test without Jira integration
appscan triage-report status --app <appId>  # Don't use --include-jira
```

### Performance Issues

```bash
# Use filters to reduce result set
appscan triage-report query --type vulnerabilities --app <appId> \
  --filter "severity:High|Critical" \
  --limit 50

# Process in batches for bulk updates
```

## See Also

- [AppScan API Documentation](doc/appscan-api-responses.md)
- [Triage Command](doc/triage.md) - Original interactive triage tool
- [Setup Command](doc/setup.md) - Configure credentials
