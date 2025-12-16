# `ink-Triage`: Refactoring of `triage-report` into a console Cli app

**Document Version:** 1.0  
**Date:** December 10, 2025  
**Target Audience:** Outsourced Development Team  
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a comprehensive specification for a new, unified CLI command (the "Triage & Reporting Tool") to enhance the existing appscan-client npm package. The tool consolidates and extends functionality for querying AppScan Cloud API, updating vulnerabilities, creating Jira stories, and performing interactive triage workflows.

**Key Constraints:**
- No modifications to existing commands
- Single new command/module that unifies multiple workflows
- Follow KISS and DRY principles
- Self-contained; all required API details are in this document
- No external resource access needed

---

## 1. Background & Architecture

### 1.1 Existing Project Context

**Repository:** `@metanull/appscan-client`  
**Tech Stack:** Node.js >= 20, npm package (published to GitHub Packages)  
**Main Dependencies:**
- `axios` — HTTP client
- `commander` — CLI argument parsing
- `@inquirer/prompts` — Interactive terminal UI
- `chalk` — Terminal color output
- `marked` — Markdown parsing
- `jira.js` — Jira API client (optional, for Jira integration)
- `sanitize-html` — HTML sanitization

**Project Structure:**
```
src/
├── index.js                 # CLI entry point
├── commands/                # Individual commands (existing)
│   ├── triage.js           # Interactive triage (existing, will NOT be modified)
│   ├── list-applications.js
│   ├── list-issues.js
│   ├── update-issue-status.js
│   └── [other existing commands]
├── services/
│   ├── appscan-service.js   # AppScan API wrapper (existing)
│   └── jira-service.js      # Jira API wrapper (existing)
└── utils/
    ├── config.js            # Configuration management
    ├── triage-ui.js        # UI/prompt helpers (existing)
    └── [other utilities]
```

### 1.2 Triage Workflow Concepts

**Vulnerability Status Lifecycle:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Initial: "Open"                          │
│            (Not yet reviewed/triaged)                        │
└──────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌─────────────────────┐  ┌──────────────────┐
        │ "Noise" (False      │  │ True Positives:  │
        │ Positive)           │  │                  │
        │ - Dismissed         │  │ InProgress*      │
        │ - Not real issue    │  │ ├─ To be fixed   │
        │ - Accepted risk     │  │ ├─ Jira created  │
        └─────────────────────┘  │                  │
                                 │ Passed           │
                                 │ ├─ No action req │
                                 │ ├─ Accepted risk │
                                 │                  │
                                 │ Fixed            │
                                 │ └─ Already fixed │
                                 │ └─ Dev fixed it  │
                                 └──────────────────┘

* InProgress issues typically have corresponding Jira stories
```

**Triage Team Operations:**
1. **Review vulnerabilities** by application/scan/type
2. **Mark False Positives** → Status = "Noise" + Comment (optional)
3. **Mark True Positives** → Status = "InProgress" + Comment
4. **Create Jira Stories** for InProgress issues (grouped by vulnerability type)
5. **Track Resolution** in Jira, then update AppScan status to "Passed" or "Fixed"

---

## 2. New Command: `appscan triage-report`

### 2.1 Overview

A new command, `appscan triage-report`, provides:

1. **Querying** — List/filter vulnerabilities, scans, applications
2. **Reporting** — Generate status reports with counts, filters, links
3. **Updating** — Bulk update vulnerability statuses and comments
4. **Jira Integration** — Create Jira issues for grouped vulnerabilities
5. **Jira Lookup** — Find existing Jira issues linked to vulnerabilities
6. **Interactive Triage** — Guided workflow (alternative to existing `triage` command, but NOT a replacement)

### 2.2 Command Structure

```bash
# Query commands
appscan triage-report query --type applications [--filter <criteria>] [--json]
appscan triage-report query --type scans [--app <appId>] [--scan-type <SAST|DAST|SCA>] [--json]
appscan triage-report query --type scan-executions --scan <scanId> [--json]
appscan triage-report query --type vulnerabilities --app <appId> | --scan <scanId> [--filter <criteria>] [--json]
appscan triage-report query --type articles --issue <issueId> [--json]

# Reporting commands
appscan triage-report status --app <appId> | --scan <scanId> [--format table|json] [--include-jira]
appscan triage-report summary --app <appId> | --scan <scanId> [--json]

# Update commands
appscan triage-report update --issue <issueId> --status <status> [--comment <text>]
appscan triage-report bulk-update --issues <id1,id2,...> --status <status> [--comment <text>]
appscan triage-report bulk-update-filter --app <appId> --filter <criteria> --status <status> [--comment <text>]

# Jira commands
appscan triage-report create-jira --issues <id1,id2,...> --project <key> [--group-by type|severity]
appscan triage-report find-jira --issue <issueId> [--app <appId>]
appscan triage-report link-jira --issue <issueId> --jira-key <key>

# Interactive triage
appscan triage-report interactive [--app <appId>] [--scan-type <SAST|DAST|SCA>]
```

---

## 3. Detailed Functional Requirements

### 3.1 Query Commands (`query` subcommand)

#### 3.1.1 Query Applications

```bash
appscan triage-report query --type applications [--filter name:<text>] [--json]
```

**Purpose:** List all applications, optionally filtered.

**API Endpoint:** `GET /api/v4/Apps`

**Response Fields (JSON output):**
```json
{
  "applications": [
    {
      "id": "f1c993c8-65dc-4727-818a-07a7803741ce",
      "name": "SAST-DITO",
      "description": "SAST scans for DITO project",
      "riskRating": "Medium",
      "maxSeverity": "High",
      "totalIssues": 100,
      "openIssues": 100,
      "criticalIssues": 0,
      "highIssues": 40,
      "mediumIssues": 22,
      "lowIssues": 38,
      "informationalIssues": 0,
      "scanTechnologies": ["SAST", "SCA"],
      "dateCreated": "2025-11-17T11:57:03Z",
      "url": "https://cloud.appscan.com/apps/<id>"
    }
  ],
  "total": 5
}
```

**Filtering:**
- `--filter name:<text>` — Case-insensitive substring match on `Name`
- Multiple filters: `--filter name:DITO --filter risk:High`

**Output:** JSON (default) or human-readable table (with `--table` flag)

---

#### 3.1.2 Query Scans

```bash
appscan triage-report query --type scans [--app <appId>] [--scan-type <SAST|DAST|SCA|IAC>] [--json] [--table]
```

**Purpose:** List scans, optionally filtered by app or technology type.

**API Endpoints:**
- `GET /api/v4/Scans` (with optional `$filter=AppId eq <appId>`)

**Key Field Mapping (API → Output):**
- `Scan.Technology` (MinScanModel) — Map to normalized type:
  - `StaticAnalyzer` → `SAST`
  - `DynamicAnalyzer` → `DAST`
  - `ScaAnalyzer` → `SCA`
  - `IASTAnalyzer` → `IAST`
  - (Keep others as-is)

**Response Fields (JSON output):**
```json
{
  "scans": [
    {
      "id": "e76af617-411c-409c-a166-9285a0406d17",
      "name": "DITO-backend-20251117-115701",
      "appId": "f1c993c8-65dc-4727-818a-07a7803741ce",
      "appName": "SAST-DITO",
      "scanType": "SCA",
      "numberOfExecutions": 1,
      "createdAt": "2025-11-17T11:57:23Z",
      "lastModified": "2025-11-17T11:57:31Z",
      "latestExecutionStatus": "Ready",
      "latestExecutionDate": "2025-11-17T11:58:03Z",
      "url": "https://cloud.appscan.com/scans/<id>"
    }
  ],
  "total": 10
}
```

**Filtering:**
- `--app <appId>` — Filter to scans for a specific application
- `--scan-type <SAST|DAST|SCA|IAC>` — Filter by normalized technology type
- `--filter name:<text>` — Substring match on scan name

---

#### 3.1.3 Query Scan Executions

```bash
appscan triage-report query --type scan-executions --scan <scanId> [--json] [--table]
```

**Purpose:** List execution history for a specific scan.

**API Endpoint:** `GET /api/v4/Scans/{scanId}` then access `LatestExecution` or call `Scans_GetExecutions`.

**Response Fields (JSON output):**
```json
{
  "scanId": "e76af617-411c-409c-a166-9285a0406d17",
  "executions": [
    {
      "id": "69b84994-e413-4e86-85a8-1e93a40c800f",
      "scanId": "e76af617-411c-409c-a166-9285a0406d17",
      "status": "Ready",
      "progress": 100,
      "executionProgress": "Completed",
      "createdAt": "2025-11-17T11:57:23Z",
      "scanEndTime": "2025-11-17T11:58:03Z",
      "executionDurationSec": 11,
      "criticalIssues": 0,
      "highIssues": 15,
      "mediumIssues": 8,
      "lowIssues": 22,
      "informationalIssues": 5,
      "newAppIssues": 0,
      "issuesFound": 45,
      "createdBy": "john.doe@example.com"
    }
  ],
  "total": 1
}
```

---

#### 3.1.4 Query Vulnerabilities

```bash
appscan triage-report query --type vulnerabilities \
  [--app <appId>] [--scan <scanId>] \
  [--filter "status:Open|severity:High|name:Injection|date:>2025-12-01"] \
  [--limit 100] [--offset 0] \
  [--json] [--table]
```

**Purpose:** List vulnerabilities with comprehensive filtering and sorting.

**API Endpoint:** `GET /api/v4/Issues/{scope}/{scopeId}` where scope is `Application` or `Scan`.

**Response Fields (JSON output):**
```json
{
  "vulnerabilities": [
    {
      "id": "b9513af1-7fc1-f011-8194-002248e524dc",
      "issueType": "Insertion of Sensitive Information into Log File",
      "issueTypeId": "Logging.RevealsDetails.SensitiveData",
      "appId": "6ebf4b50-eceb-4456-8ffe-0a5e17a968c0",
      "appName": "OBOD",
      "scanId": "e76af617-411c-409c-a166-9285a0406d17",
      "scanName": "OBOD-20251114-173025",
      "severity": "Low",
      "severityValue": 2,
      "status": "InProgress",
      "location": "OBOD.Cleanup/Program.cs:29",
      "sourceFile": "OBOD.Cleanup/Program.cs",
      "lineNumber": 29,
      "context": "Console.WriteLine(apiResult);",
      "language": "C#",
      "cwe": 532,
      "cveId": null,
      "discoveryMethod": "SAST",
      "dateCreated": "2025-11-14T17:32:50Z",
      "lastUpdated": "2025-12-09T17:18:43Z",
      "lastFound": "2025-11-14T17:32:50Z",
      "externalId": "SEC-638",
      "comment": "Already fixed in latest version",
      "sourceFileUri": "https://dev.azure.com/EESC-CoR/...",
      "appScanUrl": "https://cloud.appscan.com/issues/<id>",
      "remediationUrl": "https://cloud.appscan.com/api/v4/Reports/Article/?issuetype=Logging.RevealsDetails.SensitiveData"
    }
  ],
  "total": 450,
  "filtered": 45
}
```

**Filtering Syntax:**
- `status:<Open|Noise|InProgress|Passed|Fixed>` — Vulnerability status
- `severity:<Informational|Low|Medium|High|Critical>` — Severity level
- `name:<text>` — Substring match on issue type name
- `date:>YYYY-MM-DD` or `date:<YYYY-MM-DD` — By creation/update date
- `externalId:<text>` — External ID (e.g., Jira key)
- Multiple filters combined with `|` (OR) or `;` (AND)

**Severity Mapping (API enums):**
- `Undetermined` → skip or map to `Unknown`
- `Informational` → `Informational`
- `Low` → `Low`
- `Medium` → `Medium`
- `High` → `High`
- `Critical` → `Critical`

**Pagination:**
- `--limit <n>` — Retrieve first N results (default 100)
- `--offset <n>` — Skip first N results for pagination

---

#### 3.1.5 Query Remediation Articles

```bash
appscan triage-report query --type articles --issue <issueId> [--markdown] [--json]
```

**Purpose:** Fetch remediation article for a vulnerability, optionally in Markdown.

**API Endpoint:** `GET /api/v4/Reports/Article/?issuetype=<IssueTypeId>`

**Response Fields (JSON):**
```json
{
  "issueId": "b9513af1-7fc1-f011-8194-002248e524dc",
  "issueTypeId": "Logging.RevealsDetails.SensitiveData",
  "issueType": "Insertion of Sensitive Information into Log File",
  "language": "HTML",
  "title": "Insertion of Sensitive Information into Log File",
  "cause": "<p>Log files are often...",
  "fixRecommendation": "<p>Ensure that sensitive...",
  "fullHtml": "<html>...",
  "appScanUrl": "https://cloud.appscan.com/api/v4/Reports/Article/?issuetype=...",
  "markdownVersion": "## Cause\n\n...\n\n## Fix Recommendation\n\n..."
}
```

**Markdown Conversion (if `--markdown` flag):**
- Extract only "Cause" and "Fix Recommendation" sections
- Convert HTML to Markdown using `marked` or similar
- Strip style/script tags
- Return clean Markdown suitable for Jira

---

### 3.2 Reporting Commands

#### 3.2.1 Status Report

```bash
appscan triage-report status --app <appId> | --scan <scanId> [--include-jira] [--json]
```

**Purpose:** Summarize vulnerabilities by status/severity for a single app or scan.

**Response (JSON):**
```json
{
  "entityType": "scan",
  "entityId": "e76af617-411c-409c-a166-9285a0406d17",
  "entityName": "DITO-backend-20251117-115701",
  "appId": "f1c993c8-65dc-4727-818a-07a7803741ce",
  "appName": "SAST-DITO",
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
      "Low": 38,
      "Informational": 0
    },
    "bySeverityAndStatus": {
      "Critical": { "Open": 0, "InProgress": 0, "Noise": 0, "Passed": 0, "Fixed": 0 },
      "High": { "Open": 2, "InProgress": 10, "Noise": 20, "Passed": 5, "Fixed": 3 },
      "Medium": { "Open": 3, "InProgress": 5, "Noise": 15, "Passed": 0, "Fixed": 0 },
      ...
    },
    "vulnerabilitiesWithJira": 12,
    "jiraStatuses": {
      "Open": 3,
      "In Progress": 5,
      "Done": 4
    }
  },
  "vulnerabilities": [
    {
      "id": "b9513af1-7fc1-f011-8194-002248e524dc",
      "issueType": "Insertion of Sensitive Information into Log File",
      "severity": "Low",
      "status": "InProgress",
      "jiraKey": "SEC-638",
      "jiraUrl": "https://jira.company.com/browse/SEC-638",
      "jiraStatus": "In Progress",
      "remediationUrl": "https://cloud.appscan.com/api/v4/Reports/Article/?issuetype=..."
    }
  ]
}
```

**Output Format (with `--json`):** JSON as above  
**Output Format (default, table):** Human-readable summary

---

#### 3.2.2 Summary Report

```bash
appscan triage-report summary --app <appId> [--json]
```

**Purpose:** High-level counts for an application across all scans.

**Response (JSON):**
```json
{
  "app": {
    "id": "f1c993c8-65dc-4727-818a-07a7803741ce",
    "name": "SAST-DITO",
    "totalIssues": 100,
    "openIssues": 10,
    "inProgressIssues": 20,
    "noiseIssues": 50,
    "passedIssues": 15,
    "fixedIssues": 5
  },
  "scans": [
    {
      "id": "e76af617-411c-409c-a166-9285a0406d17",
      "name": "DITO-backend-20251117-115701",
      "scanType": "SCA",
      "totalIssues": 10,
      "openIssues": 2,
      "inProgressIssues": 3,
      "noiseIssues": 4,
      "passedIssues": 1,
      "fixedIssues": 0
    }
  ]
}
```

---

### 3.3 Update Commands

#### 3.3.1 Update Single Vulnerability

```bash
appscan triage-report update --issue <issueId> --status <status> [--comment <text>]
```

**Purpose:** Update a single vulnerability's status and optionally add a comment.

**Valid Statuses:**
- `Open` — Initial/under review
- `InProgress` — True positive, awaiting fix
- `Noise` — False positive, dismissed
- `Passed` — True positive, accepted/no action required
- `Fixed` — True positive, already fixed

**API Endpoint:** `PUT /api/v4/Issues/{scope}/{scopeId}` filtered by issue ID  
(Uses `Issues_UpdateFilteredIssues` with OData filter)

**Payload:**
```json
{
  "Status": "InProgress",
  "Comment": "Confirmed true positive. Created Jira SEC-638."
}
```

**Response (JSON):**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "issueId": "b9513af1-7fc1-f011-8194-002248e524dc",
  "newStatus": "InProgress",
  "commentAdded": true
}
```

---

#### 3.3.2 Bulk Update (Multiple Issues)

```bash
appscan triage-report bulk-update --issues id1,id2,id3 --status Noise --comment "False positive"
```

**Purpose:** Update multiple specific vulnerabilities at once.

**Implementation:**
- For efficiency, group issues by `ApplicationId`
- For each app, build OData filter: `Id eq id1 or Id eq id2 or ...`
- Call `Issues_UpdateFilteredIssues` once per app

**Response (JSON):**
```json
{
  "success": true,
  "totalRequests": 2,
  "results": [
    {
      "applicationId": "6ebf4b50-eceb-4456-8ffe-0a5e17a968c0",
      "issuesUpdated": 5,
      "status": "success"
    },
    {
      "applicationId": "f1c993c8-65dc-4727-818a-07a7803741ce",
      "issuesUpdated": 2,
      "status": "success"
    }
  ],
  "totalIssuesUpdated": 7
}
```

---

#### 3.3.3 Bulk Update (Filter-based)

```bash
appscan triage-report bulk-update-filter \
  --app <appId> \
  --filter "status:Open;severity:High" \
  --status InProgress \
  --comment "Reviewed and confirmed"
```

**Purpose:** Update all vulnerabilities matching a filter query.

**Implementation:**
- Fetch all issues matching filter (apply pagination internally)
- Group by application
- Update each group via `Issues_UpdateFilteredIssues`

**Response:** Same as bulk-update above

---

### 3.4 Jira Integration Commands

#### 3.4.1 Create Jira Issues (for grouped vulnerabilities)

```bash
appscan triage-report create-jira \
  --issues id1,id2,id3 \
  --project SEC \
  [--group-by type|severity] \
  [--dry-run]
```

**Purpose:** Create one or more Jira issues for selected vulnerabilities, grouped intelligently.

**Grouping Strategies:**
- `--group-by type` (default) — One Jira issue per unique issue type
- `--group-by severity` — One Jira issue per severity level
- `--group-by none` — One Jira issue per vulnerability

**For each Jira issue, the description includes:**

```
## Vulnerability Overview
- **Issue Type**: [IssueType]
- **Severity**: [Severity]
- **Count**: [N] occurrence(s)
- **Scan**: [ScanName] ([ScanType])
- **Application**: [AppName]

## Occurrences

[For each location with hyperlink]
- **[File:Line]** ([Severity]) — [Context snippet]
  [URL to code/endpoint]

## Remediation

[From AppScan Article]
### Cause
[HTML converted to Markdown, truncated if needed]

### Fix Recommendation
[HTML converted to Markdown, truncated if needed]

[Link to full article on AppScan]

## Related AppScan Issues
- SEC-001
- SEC-002
- SEC-003
[List unique external IDs for traceability]
```

**Jira Payload (via `jira.js` client):**
```json
{
  "fields": {
    "project": { "key": "SEC" },
    "summary": "[Security] Authentication.Credentials.Unprotected — 2 occurrences",
    "description": "...[as above]...",
    "issuetype": { "name": "Bug" },
    "labels": ["appscan", "security", "triage"],
    "customfield_10001": "[AppScan Issue IDs: b9513af1-7fc1-f011-8194-002248e524dc, bc513af1-7fc1-f011-8194-002248e524dc]"
  }
}
```

**Constraints (Jira content limit):**
- Max description size ≈ 32 KB
- If description exceeds limit:
  - Truncate issue list and add `"+ N more..."` note
  - Link to status report instead of embedding full details
  - Log warning to stderr

**Response (JSON):**
```json
{
  "success": true,
  "jiraIssuesCreated": [
    {
      "appScanIssues": ["b9513af1-7fc1-f011-8194-002248e524dc", "bc513af1-7fc1-f011-8194-002248e524dc"],
      "jiraKey": "SEC-638",
      "jiraUrl": "https://jira.company.com/browse/SEC-638",
      "summary": "[Security] Authentication.Credentials.Unprotected — 2 occurrences"
    }
  ],
  "totalIssuesCreated": 1
}
```

**Update AppScan with Jira Link:**
- After Jira issue creation, update all AppScan issues with `ExternalId = jiraKey`
- Use `Issues_UpdateFilteredIssues` to set `ExternalId` field

---

#### 3.4.2 Find Jira Issues

```bash
appscan triage-report find-jira --issue <issueId> [--app <appId>]
```

**Purpose:** Search Jira for issues linked to a specific AppScan vulnerability.

**Implementation:**
1. Get issue details (fetch `ExternalId` if present)
2. If `ExternalId` is set, use it to query Jira (expected to be Jira key)
3. Search Jira for issues containing the AppScan issue ID in custom field or description
4. Return matching Jira issues

**Jira Search (JQL):**
```
customfield_10001 ~ "b9513af1-7fc1-f011-8194-002248e524dc"
OR description ~ "b9513af1-7fc1-f011-8194-002248e524dc"
```

**Response (JSON):**
```json
{
  "appScanIssueId": "b9513af1-7fc1-f011-8194-002248e524dc",
  "jiraIssuesFound": [
    {
      "key": "SEC-638",
      "summary": "[Security] Authentication.Credentials.Unprotected — 2 occurrences",
      "status": "In Progress",
      "url": "https://jira.company.com/browse/SEC-638"
    }
  ]
}
```

---

#### 3.4.3 Link Jira Issue Manually

```bash
appscan triage-report link-jira --issue <issueId> --jira-key <KEY>
```

**Purpose:** Manually associate an AppScan issue with a Jira key (sets `ExternalId`).

**Implementation:**
- Update AppScan issue with `ExternalId = <KEY>`

**Response (JSON):**
```json
{
  "success": true,
  "appScanIssueId": "b9513af1-7fc1-f011-8194-002248e524dc",
  "linkedJiraKey": "SEC-638"
}
```

---

### 3.5 Interactive Triage (`interactive` subcommand)

```bash
appscan triage-report interactive [--app <appId>] [--scan-type <SAST|DAST|SCA>]
```

**Purpose:** Step-by-step guided triage workflow (alternative to existing `triage` command).

**Workflow:**

```
┌──────────────────────────────────────────────────┐
│ 1. SELECT APPLICATION (or skip to all)           │
├──────────────────────────────────────────────────┤
│ 2. SELECT SCAN (from app, optionally filter)     │
├──────────────────────────────────────────────────┤
│ 3. VIEW VULNERABILITIES (grouped by type/sev)    │
│   - Filter (by status, severity, name)           │
│   - Sort (by name, severity, status)             │
│   - Search (text match)                          │
├──────────────────────────────────────────────────┤
│ 4. MULTI-SELECT ISSUES                           │
│   - Select all instances of a vulnerability type │
│   - Deselect specific ones if needed             │
├──────────────────────────────────────────────────┤
│ 5. TAKE ACTION (on selected)                     │
│   - Update Status + Comment                      │
│   - View Details                                 │
│   - Create Jira Issue                            │
│   - Back / Refresh / Search                      │
└──────────────────────────────────────────────────┘
```

**Key Features:**

- **No implicit filtering:** Default shows all vulnerabilities; user explicitly applies filters
- **Multi-select UI:** Use `@inquirer/prompts` checkbox feature (spacebar to select)
- **Flexible filtering & sorting:**
  - Filter menu: status, severity, name, date
  - Sort menu: by type, severity, status, date
  - Search menu: full-text filter
- **Grouping:** Display by vulnerability type, with counts per severity
- **Context:** Show code snippet/location for each issue
- **Actions menu:**
  - Update Status & Comment
  - Create Jira Issue
  - View Full Details
  - Clear Selection
  - Refresh
  - Back to Scan Selection
  - Exit

**UI Flow (pseudocode):**

```
1. askSelectApp() → appId
2. if appId:
     listScans(appId) → scans[]
   else:
     listAllScans() → scans[]
3. askSelectScan(scans) → scan
4. loop:
     loadVulnerabilities(scan) → vulns[]
     displayVulnerabilities(vulns) → filtered, sorted
     askMultiSelect(vulns) → selected[]
     if selected.length > 0:
       askAction() →
         - Update Status → askStatus, askComment → updateIssues(selected)
         - Create Jira → askGroupBy → createJiraIssues(selected)
         - View Details → displayDetails(issue)
         - Search → askSearchText → refilter(vulns)
         - Filter → askFilter → refilter(vulns)
         - Sort → askSort → reorder(vulns)
         - Back → go to step 3
         - Exit → exit
```

---

## 4. API Contract & Field Mapping

### 4.1 AppScan API Endpoints Used

**Authentication:**
```
POST /api/v4/Account/ApiKeyLogin
Headers: Content-Type: application/json
Body: { "KeyId": "...", "KeySecret": "..." }
Response: { "Token": "...", ... }
→ Use token in Authorization: Bearer <token> for subsequent calls
```

**Applications:**
```
GET /api/v4/Apps?$top=100&$filter=...
Response: {
  "Items": [ ApplicationModel... ],
  "Count": N
}
```

**Scans:**
```
GET /api/v4/Scans?$filter=AppId eq <appId>&$top=100
Response: {
  "Items": [ MinScanModel... ],
  "Count": N
}
```

**Scan Executions:**
```
GET /api/v4/Scans/{scanId}/Executions?$top=100
Response: {
  "Items": [ ScanExecutionModel... ],
  "Count": N
}
```

**Issues:**
```
GET /api/v4/Issues/{scope}/{scopeId}?$filter=...&$top=100&$skip=...
scope: "Scan" or "Application"
scopeId: scan ID or app ID
Response: {
  "Items": [ IssueModel... ],
  "Count": N
}
```

**Update Issues:**
```
PUT /api/v4/Issues/{scope}/{scopeId}
Headers: Content-Type: application/json
Body: {
  "Status": "InProgress",
  "Comment": "...",
  "ExternalId": "..."
}
QueryParam: odataFilter=<filter>
Response: { "UpdatedIssues": N, ... }
```

**Articles:**
```
GET /api/v4/Reports/Article/?issuetype=<IssueTypeId>
Response: HTML (raw article)
```

### 4.2 Enum Mappings

**Issue Severity (IssueModel.Severity):**
```
Undetermined → Unknown
Informational → Informational
Low → Low
Medium → Medium
High → High
Critical → Critical
```

**Issue Status (IssueModel.Status):**
```
Open
InProgress
Reopened
Noise
Passed
Fixed
New
```

**Scan Technology (MinScanModel.Technology → Normalized):**
```
StaticAnalyzer → SAST
DynamicAnalyzer → DAST
ScaAnalyzer → SCA
IASTAnalyzer → IAST
DastAutomation → DAST
IFA → IFA
Others → Keep as-is
```

**Application Risk Rating (ApplicationModel.RiskRating):**
```
Unknown
Low
Medium
High
Critical
```

---

## 5. Error Handling & Resilience

### 5.1 Error Scenarios

**Authentication Errors:**
- Missing/invalid API key: Exit with clear message, suggest `appscan setup`
- Token expired: Retry authentication once
- Unauthorized (403): Suggest checking API key permissions

**API Errors:**
- Rate limiting (429): Retry with exponential backoff (max 3 retries)
- Timeout (connection): Retry once, then fail with timeout message
- Invalid filter/parameter (400): Return error message with parameter details
- Not found (404): Return "entity not found" message

**Data Errors:**
- Missing required fields: Log warning, skip item or use default value
- Jira content limit exceeded: Truncate description, log warning, still create issue

### 5.2 Logging & Debug Output

- All errors to `stderr`
- All JSON output to `stdout`
- Use `chalk` for coloring errors (red), warnings (yellow), success (green), info (blue)
- No logging of secrets (API keys, tokens, passwords)

---

## 6. Configuration & Environment

### 6.1 Required Configuration

```bash
# AppScan
APPSCAN_API_KEY=<key>
APPSCAN_API_SECRET=<secret>
APPSCAN_BASE_URL=https://cloud.appscan.com (or custom)

# Jira (optional, for Jira integration)
JIRA_HOST=https://jira.company.com
JIRA_EMAIL=user@company.com
JIRA_API_TOKEN=<token>
JIRA_PROJECT_KEY=SEC (default project)

# Custom field for linking AppScan issues (optional)
JIRA_CUSTOM_FIELD_APPSCAN_ISSUES=customfield_10001
```

### 6.2 Configuration File (Optional)

Support `.appscantriage.json` in project root or home directory:

```json
{
  "appscan": {
    "apiKey": "...",
    "apiSecret": "...",
    "baseUrl": "https://cloud.appscan.com"
  },
  "jira": {
    "host": "https://jira.company.com",
    "email": "user@company.com",
    "apiToken": "...",
    "projectKey": "SEC",
    "customFieldAppscanIssues": "customfield_10001"
  }
}
```

**Priority:** Environment variables override config file

---

## 7. Implementation Details

### 7.1 New Module Structure

```
src/commands/triage-report.js
├── Imports subcommands
├── Main command handler
└── Routes to subcommands

src/commands/triage-report/
├── query.js
├── status.js
├── update.js
├── bulk-update.js
├── create-jira.js
├── find-jira.js
├── link-jira.js
└── interactive.js

src/utils/triage-report/
├── query-builder.js          # Build OData filters
├── formatter.js              # Format output (table, JSON)
├── filters.js               # Parse and apply filters
├── jira-description-builder.js  # Build Jira descriptions
├── article-markdown-converter.js # HTML → Markdown
└── interactive-ui.js        # Interactive prompts

src/services/
├── appscan-service.js (extend existing)
├── jira-service.js (extend existing)
└── triage-report-service.js (new facade)
```

### 7.2 Key Classes/Functions

**QueryBuilder:**
```javascript
class QueryBuilder {
  constructor(baseQuery = {}) { ... }
  
  filterBySeverity(severities) { ... }
  filterByStatus(statuses) { ... }
  filterByName(text) { ... }
  filterByDate(operator, date) { ... }
  toODataFilter() { ... }  // Returns OData string
}
```

**Formatter:**
```javascript
class Formatter {
  static toJson(data) { ... }
  static toTable(data, columns) { ... }
  static toMarkdown(html) { ... }
}
```

**JiraDescriptionBuilder:**
```javascript
class JiraDescriptionBuilder {
  constructor(issues, baseUrl) { ... }
  
  addSummary() { ... }
  addIssuesByType() { ... }
  addRemediationLinks() { ... }
  addAppScanComments() { ... }
  build() { ... }  // Returns markdown string
  
  // Static helper to check size
  static getEstimatedSize(markdown) { ... }
  static truncateIfNeeded(markdown, maxBytes = 32000) { ... }
}
```

**InteractiveUI:**
```javascript
async function selectApp(apps) { ... }
async function selectScan(scans) { ... }
async function multiSelectIssues(issues) { ... }
async function askAction() { ... }  // Returns action name
async function askFilter() { ... }   // Returns filter criteria
async function askSort() { ... }     // Returns sort field
async function askStatus() { ... }   // Returns new status
async function askComment() { ... }  // Returns comment text
```

### 7.3 Example: Bulk Update Implementation

```javascript
async function bulkUpdate(issues, status, comment, service) {
  // Validate status
  const validStatuses = ['Open', 'InProgress', 'Noise', 'Passed', 'Fixed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  
  // Group by application ID
  const issuesByApp = {};
  for (const issue of issues) {
    const appId = issue.ApplicationId;
    if (!issuesByApp[appId]) {
      issuesByApp[appId] = [];
    }
    issuesByApp[appId].push(issue.Id);
  }
  
  // Update each app's issues
  const results = [];
  for (const [appId, issueIds] of Object.entries(issuesByApp)) {
    const odataFilter = issueIds.map(id => `Id eq ${id}`).join(' or ');
    const updateData = { Status: status };
    if (comment) updateData.Comment = comment;
    
    const result = await service.api.v4.Issues_UpdateFilteredIssues(
      'Application',
      appId,
      updateData,
      { odataFilter }
    );
    
    results.push({
      applicationId: appId,
      issuesUpdated: result.UpdatedIssues || issueIds.length,
      status: 'success'
    });
  }
  
  return results;
}
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

**Test Files:**
```
tests/unit/triage-report/
├── query-builder.test.js
├── formatter.test.js
├── filters.test.js
├── jira-description-builder.test.js
├── article-markdown-converter.test.js
└── interactive-ui.test.js
```

**Example Test Cases:**

```javascript
describe('QueryBuilder', () => {
  test('filterBySeverity() builds correct OData', () => {
    const qb = new QueryBuilder();
    qb.filterBySeverity(['High', 'Critical']);
    const filter = qb.toODataFilter();
    expect(filter).toContain("Severity eq 'High' or Severity eq 'Critical'");
  });
  
  test('filterByDate() with > operator', () => {
    const qb = new QueryBuilder();
    qb.filterByDate('>', new Date('2025-12-01'));
    const filter = qb.toODataFilter();
    expect(filter).toContain("DateCreated gt datetime'2025-12-01");
  });
});

describe('JiraDescriptionBuilder', () => {
  test('does not exceed 32KB limit', () => {
    const issues = [/* 100 large issues */];
    const builder = new JiraDescriptionBuilder(issues, 'https://...');
    const desc = builder.addSummary().addIssuesByType().build();
    expect(Buffer.byteLength(desc, 'utf8')).toBeLessThan(32000);
  });
});
```

### 8.2 Integration Tests

**Test Files:**
```
tests/integration/
├── query-commands.test.js
├── update-commands.test.js
├── jira-commands.test.js
└── interactive-flow.test.js
```

**Setup:** Use mock HTTP responses from `/reports/api-samples/` (included in tests)

**Example:**
```javascript
describe('Integration: Create Jira Issues', () => {
  test('creates grouped Jira issue from vulnerabilities', async () => {
    const mockIssues = loadMockData('sample-sast-issues.json');
    const service = new AppScanService(mockConfig);
    
    // Mock Jira and AppScan API
    mockAppScanAPI.listIssues.resolves(mockIssues);
    mockJiraAPI.createIssue.resolves({ key: 'SEC-638' });
    
    const result = await createJiraIssues(
      mockIssues.Items,
      'SEC',
      'type'
    );
    
    expect(result.jiraIssuesCreated).toHaveLength(3);
    expect(mockJiraAPI.createIssue).toHaveBeenCalledTimes(3);
  });
});
```

### 8.3 Manual Testing Checklist

- [ ] `query --type applications` with/without filters
- [ ] `query --type scans` with app/scan-type filters
- [ ] `query --type vulnerabilities` with complex filters
- [ ] `status --app <id> --include-jira` (with and without Jira config)
- [ ] `update --issue <id> --status InProgress --comment "test"`
- [ ] `bulk-update --issues a,b,c --status Noise`
- [ ] `bulk-update-filter --app <id> --filter "status:Open;severity:High" --status InProgress`
- [ ] `create-jira --issues a,b,c --project SEC --group-by type`
- [ ] `find-jira --issue <id>` (with and without Jira config)
- [ ] `link-jira --issue <id> --jira-key SEC-123`
- [ ] `interactive` full workflow (select app, scan, issues, update status, create Jira)

---

## 9. CLI Integration

### 9.1 Entry Point Registration

In `src/index.js`, register the new command:

```javascript
import triageReportCommand from './commands/triage-report.js';

program
  .command('triage-report')
  .description('Comprehensive triage, reporting, and Jira integration tool')
  .addCommand(triageReportCommand);
```

### 9.2 CLI Options

All commands support:
- `--json` — Output JSON (default unless interactive)
- `--config <path>` — Custom config file (optional)
- `--verbose` — Debug output to stderr
- `--dry-run` — For write operations, show what would be done without doing it

---

## 10. Documentation

### 10.1 README Section

Add to `README.md`:

```markdown
### triage-report Command

The `triage-report` command provides comprehensive querying, reporting, and triage management for AppScan vulnerabilities.

**Subcommands:**
- `query` — Query applications, scans, vulnerabilities, articles
- `status` — Generate status reports
- `update` — Update vulnerability status/comments
- `bulk-update` — Bulk update multiple issues
- `bulk-update-filter` — Update all issues matching a filter
- `create-jira` — Create Jira issues for vulnerabilities
- `find-jira` — Find linked Jira issues
- `link-jira` — Manually link Jira issue to AppScan issue
- `interactive` — Interactive guided triage workflow

**Examples:**

```bash
# Query vulnerabilities
appscan triage-report query --type vulnerabilities --app <appId> --filter "severity:High" --json

# Generate status report
appscan triage-report status --scan <scanId> --include-jira

# Update vulnerability
appscan triage-report update --issue <issueId> --status InProgress --comment "Confirmed"

# Create Jira issues
appscan triage-report create-jira --issues id1,id2 --project SEC --group-by type

# Interactive triage
appscan triage-report interactive --scan-type SAST
```

See `doc/triage-report.md` for detailed documentation.
```

### 10.2 Detailed Command Documentation

Create `/doc/triage-report.md` with full examples for each subcommand.

---

## 11. Acceptance Criteria

- [ ] All commands execute successfully with provided examples
- [ ] JSON output is valid and contains required fields
- [ ] Filtering (by status, severity, name, date) works correctly
- [ ] Bulk update groups by application and batches API calls
- [ ] Jira issue creation includes all required content (summary, description, links)
- [ ] Jira description does not exceed 32KB limit
- [ ] Interactive UI prompts are clear and responsive
- [ ] Error messages are helpful and suggest next steps
- [ ] No secrets logged or output
- [ ] Unit and integration tests pass
- [ ] Code follows existing project style/conventions
- [ ] No modifications to existing commands

---

## 12. Deliverables

1. **Source Code**
   - `src/commands/triage-report.js` (main command router)
   - `src/commands/triage-report/*.js` (subcommands)
   - `src/utils/triage-report/*.js` (utilities)
   - `src/services/triage-report-service.js` (facade, if needed)

2. **Tests**
   - `tests/unit/triage-report/*.test.js`
   - `tests/integration/triage-report/*.test.js`
   - Mock data in `tests/fixtures/` (from `/reports/api-samples/`)

3. **Documentation**
   - `doc/triage-report.md` (comprehensive guide)
   - Updated `README.md` with triage-report section
   - Code comments for complex logic

4. **Dependencies** (if needed)
   - Add any new npm packages to `package.json` (prefer existing stack)

5. **Configuration** (optional)
   - Example `.appscantriage.json` template

---

## 13. Notes for Developers

### 13.1 Assumptions

- AppScan API endpoints and responses match the v4 API spec in `doc/appscan-swagger-v4.json`
- Mock data in `reports/api-samples/` is representative of live API responses
- Jira is configured via environment variables or config file (not hard-coded)
- Node.js >= 20 is available in production environment

### 13.2 Known Constraints

- Jira issue description has ~32KB size limit; content must be truncated gracefully
- AppScan articles are HTML; conversion to Markdown may lose some formatting
- Bulk operations grouped by application to respect API limits
- OData filter syntax must follow AppScan API conventions

### 13.3 Future Extensions

- Support exporting vulnerabilities to CSV/Excel
- Schedule bulk triage across multiple scans
- Integration with other ticketing systems (Azure DevOps, GitHub Issues)
- Custom field mapping for Jira projects
- Compliance/audit report generation

---

## End of Implementation Plan

**Author's Notes:**
This plan is comprehensive and self-contained. A development team should be able to implement this without access to the running application or additional resources. All API contracts, examples, and requirements are documented above. The existing codebase provides reference implementations for similar functionality (e.g., the current `triage.js` command).

For questions during implementation, refer to:
- `doc/appscan-api-responses.md` — API contract details
- `reports/api-samples/*.json` — Real API response examples
- Existing commands (`src/commands/*.js`) — Reference implementations
