# `Triage-report`: Refactoring of individual commands into a single tool

## Analysis Overview

This document summarizes the comprehensive analysis performed on the appscan-client project to inform the creation of the Unified Triage & Reporting Tool specification.

**Analysis Date:** December 10, 2025  
**Analysis Scope:** Complete codebase, API documentation, real-world data samples, triage workflow requirements

---

## 1. Project Analysis

### 1.1 Current State

**Project:** @metanull/appscan-client (Node.js npm package)  
**Purpose:** Interact with HCL AppScan Cloud API for security vulnerability management  
**Maturity:** Functional first version with multiple CLI commands

**Existing Commands Analyzed:**
- ✅ `setup` — Configuration wizard
- ✅ `connection-check` — Verify AppScan connectivity
- ✅ `list-applications` — List apps with counts
- ✅ `list-scans` — List scans per app
- ✅ `list-scan-executions` — Scan execution history
- ✅ `list-issues` — List vulnerabilities
- ✅ `get-issue-details` — Detailed issue information
- ✅ `get-issue-comments` — Fetch issue comments
- ✅ `get-article` — Fetch remediation articles
- ✅ `get-article-markdown` — Convert articles to Markdown
- ✅ `update-issue-status` — Update vulnerability status
- ✅ `create-jira-issue` — Create Jira tickets for vulnerabilities
- ✅ `triage` — Interactive vulnerability triage workflow
- ✅ `generate-report` — Generate markdown reports
- ✅ `generate-markdown-report` — Detailed report generation
- ✅ `generate-and-download-report` — Report with download
- ✅ `yearly-summary` — Yearly vulnerability summary
- ✅ `all-reports` — Batch report generation

**Observations:**
- 18 separate commands exist (somewhat ad-hoc organization)
- Multiple commands overlap in functionality (reporting, listing, updating)
- Core services are well-structured (AppScanService, JiraService)
- Interactive triage exists but is tightly coupled to UI
- No unified query/filter/report abstraction

### 1.2 Technology Stack

**Runtime:** Node.js >= 20  
**Package Manager:** npm  
**Publication:** GitHub Packages (@metanull scope)

**Key Dependencies (verified in package.json):**
- `axios@^1.13.2` — HTTP client
- `commander@^14.0.2` — CLI argument parsing
- `@inquirer/prompts@^7.10.1` — Interactive terminal prompts
- `chalk@^5.6.2` — Terminal colors
- `dotenv@^17.2.3` — Environment variable loading
- `marked@^17.0.1` — Markdown parsing
- `sanitize-html@^2.17.0` — HTML sanitization
- `jira.js` — Jira API client (optional, for Jira integration)

**Testing:** Jest with cross-env for Node options

### 1.3 Project Structure Quality

**Strengths:**
- Clear separation of concerns (commands, services, utils)
- Service layer abstraction for AppScan and Jira APIs
- Configuration management in `src/utils/config.js`
- Existing UI helpers in `src/utils/triage-ui.js`
- Good use of chalk for colored output
- ESM modules (modern JavaScript)

**Areas for Consolidation:**
- 18 commands could be organized into logical subcommands
- Query filtering logic scattered across multiple commands
- Jira integration scattered (in triage.js, create-jira-issue.js, services)
- Report generation duplicated across multiple commands

---

## 2. API Analysis

### 2.1 AppScan Cloud v4 API Structure

**Key Findings:**

**Authentication:**
- Token-based (Bearer token)
- Endpoint: `POST /api/v4/Account/ApiKeyLogin`
- Uses API Key + Secret credentials
- Token valid for session

**Data Model Hierarchy:**
```
ApplicationModel (top-level)
├── Scan → ScanModel/MinScanModel
│   ├── ScanExecution → ScanExecutionModel
│   │   └── Issue → IssueModel
│   └── Issue → IssueModel (across all executions)
└── Issue → IssueModel (application-level)
```

**Key Entity Details:**

**ApplicationModel:**
- Fields: Id, Name, Description, RiskRating, MaxSeverity
- Issue counts: CriticalIssues, HighIssues, MediumIssues, LowIssues, InformationalIssues
- ScanTechnologies: "SAST, SCA" (comma-separated string or enum list)
- Metadata: DateCreated, LastUpdated, TestingStatus

**MinScanModel/ScanModel:**
- Fields: Id, Name, Technology (e.g., StaticAnalyzer, DynamicAnalyzer)
- AppId, AppName linking
- LatestExecution with summary
- CreatedAt, LastModified timestamps

**ScanExecutionModel:**
- Fields: Id, Status (Ready, etc.), Progress
- Timestamps: CreatedAt, ScanEndTime
- Issue counts: NCriticalIssues, NHighIssues, NMediumIssues, NLowIssues
- Metadata: CreatedBy

**IssueModel:**
- Fields: Id, Title/Name, IssueType, IssueTypeId
- Severity: Enum (Undetermined, Informational, Low, Medium, High, Critical)
- Status: Enum (Open, InProgress, Reopened, Noise, Passed, Fixed, New)
- Location: SourceFile, SourceFileUri, LineNumber, Context
- Metadata: DateCreated, LastUpdated, LastFound
- Linking: ApplicationId, ScanId, ScanExecutionId
- Traceability: ExternalId (for Jira), CveId, Cwe
- Extra: Comment, Language, DiscoveryMethod (SAST/DAST/SCA)

**Enums & Mappings (Critical):**

Severity (consistent across APIs):
- Undetermined → Unknown
- Informational → Informational
- Low → Low
- Medium → Medium
- High → High
- Critical → Critical

Status (for triage):
- Open (initial state)
- InProgress (true positive, being worked)
- Noise (false positive, dismissed)
- Passed (true positive, accepted/no action)
- Fixed (true positive, already fixed)
- Reopened, New (other states)

Technology/ScanType (IMPORTANT: Different across endpoints):
- In MinScanModel.Technology: StaticAnalyzer, DynamicAnalyzer, ScaAnalyzer, IASTAnalyzer, DastAutomation, IFA
- In ApplicationModel.ScanTechnologies: SAST, DAST, SCA, IAST, NONE
- Normalization needed: StaticAnalyzer↔SAST, DynamicAnalyzer↔DAST, ScaAnalyzer↔SCA, IASTAnalyzer↔IAST

**API Endpoints Identified:**

```
GET /api/v4/Apps                              → ApplicationModelPageResultModel
GET /api/v4/Apps/{id}                         → ApplicationModel
GET /api/v4/Scans                             → MinScanModelPageResultModel
GET /api/v4/Scans/{scanId}                    → ScanModel
GET /api/v4/Scans/{scanId}/Executions         → ScanExecutionModel[]
GET /api/v4/Issues/{scope}/{scopeId}          → IssueModelPageResultModel
GET /api/v4/Issues/{issueId}                  → IssueModel
GET /api/v4/Issues/{issueId}/Details          → IssueDetailModel
PUT /api/v4/Issues/{scope}/{scopeId}          → Update filtered issues
GET /api/v4/Reports/Article/                  → HTML article
```

**Query Capabilities:**
- OData-style filters: `$filter`, `$top`, `$skip`, `$count`, `$select`
- Filtering by: AppId, Status, Severity (via numeric SeverityValue), Name
- Pagination: top/skip parameters

### 2.2 Real-World API Response Analysis

**Key Observations from Real Data:**

1. **Severity representation:**
   - IssueModel.Severity: String enum (High, Low, Medium, etc.)
   - IssueModel.SeverityValue: Numeric (0-5, mapping to severity levels)

2. **Location/Code Context:**
   - SAST: SourceFileUri points to Azure DevOps repository with exact line/column
   - DAST: Host, Domain, Path, Scheme for URL-based vulns
   - SCA: Library information with package details

3. **Issue Grouping:**
   - IssueTypeId: Consistent identifier (e.g., "Authentication.Credentials.Unprotected")
   - FixGroupId: Groups multiple occurrences of same vulnerability
   - ExternalId: Can link to Jira (e.g., "SEC-638")

4. **Status Tracking:**
   - Status changes logged (LastUpdated, LastComment timestamps)
   - Comments included for triage decisions
   - Multiple issues can be grouped by FixGroupId

5. **Scan Execution Metrics:**
   - Detailed execution progress and timing
   - Issue counts per severity per execution
   - CreatedBy/LastModified user tracking

---

## 3. Triage Workflow Analysis

### 3.1 Workflow Requirements (from doc/triage-requirements.md)

**Functional Scope:**
1. Authentication & validation
2. Scan selection & filtering (by type: SAST/DAST/SCA)
3. Issue loading & display (grouped view)
4. Bulk actions on issues (update status, create Jira)
5. Jira integration (creation, deduplication, size limits)
6. Traceability (ExternalId, URLs, comments)
7. Performance (avoid N+1 API calls)
8. Error handling (graceful degradation, helpful messages)

**Triage Lifecycle:**
```
Open (initial) → False Positive → Noise (dismissed)
              → True Positive → InProgress (create Jira)
                              → Passed (accepted)
                              → Fixed (already fixed)
```

**Jira Integration Requirements:**
- Description must include: summary, occurrences with links, remediation info
- Content limit: ~32KB per issue
- Deduplication: Extract unique AppScan comments
- Traceability: Store AppScan issue IDs in Jira custom field
- Linking: Update AppScan ExternalId with Jira key

### 3.2 Existing Implementation Review

**Existing `triage.js` Command:**
- ✅ Interactive prompt-based workflow
- ✅ Scan selection with filtering by technology
- ✅ Issue grouping by type
- ✅ Multi-select with spacebar
- ✅ Bulk status update
- ✅ Jira issue creation
- ❌ Lacks unified query API
- ❌ Tight coupling to UI
- ❌ Limited filtering options

**Existing `create-jira-issue.js`:**
- ✅ Scan-based or issue-based creation
- ✅ Severity filtering
- ✅ Jira integration
- ✅ AppScan link preservation
- ❌ No grouping strategy

**Existing `update-issue-status.js`:**
- ✅ Single issue update
- ✅ Comment addition
- ✅ ExternalId support
- ❌ No bulk update
- ❌ No filter-based update

### 3.3 Consolidation Opportunities

**Query/Filter Layer:**
- Create reusable QueryBuilder class
- Support: status, severity, name, date, type filters
- OData filter generation
- Pagination management

**Reporting Layer:**
- Extract report formatting logic
- Support: JSON, table, markdown outputs
- Include Jira linking status

**Update Operations:**
- Centralize bulk update logic
- Group by application
- Batch API calls

**Jira Integration:**
- Abstract description building
- Implement content limit handling
- Deduplication logic
- URL conversion for code locations

---

## 4. Documentation Analysis

### 4.1 Existing Documentation Structure

**Files Reviewed:**
- `README.md` — Project overview, quick start, features (695 lines)
- `doc/triage-requirements.md` — Requirements & design for triage feature
- `doc/appscan-api-responses.md` — Comprehensive API documentation (391 lines)
- `doc/appscan-swagger-v4.json` — OpenAPI 3.0 specification
- Multiple feature documentation files (list-issues, create-jira, etc.)

### 4.2 Key Documentation Insights

**From `triage-requirements.md`:**
- Clear requirements for triage workflow
- Emphasis on UX clarity and error handling
- Content limit concerns for Jira (32KB)
- Extensibility principles
- Testing requirements

**From `appscan-api-responses.md`:**
- Complete API endpoint documentation
- Field definitions and enums
- Normalization rules
- Business rules and expectations
- Recommendations for OData usage

---

## 5. Design Synthesis

### 5.1 Key Principles for New Tool

**From Analysis:**

1. **Unified Query API**
   - Abstract filtering, sorting, pagination
   - Support multiple entity types (apps, scans, issues, articles)
   - Return standardized JSON with relevant fields

2. **Reusable Components**
   - QueryBuilder for OData filter generation
   - Formatter for output rendering
   - Jira description builder with content limits
   - HTML to Markdown converter for articles

3. **Consistent Status Workflows**
   - Normalize status across APIs
   - Support triage lifecycle (Open → Noise/InProgress → Passed/Fixed)
   - Link to Jira for InProgress items

4. **Grouping Intelligence**
   - Group issues by type (issue type ID)
   - Group by severity
   - Dedup for Jira description

5. **Error Resilience**
   - Rate limit handling with backoff
   - Content limit enforcement for Jira
   - Graceful Jira failures (don't crash triage)
   - Helpful error messages

### 5.2 Architecture Decisions

**Single Command with Subcommands:**
- Primary: `appscan triage-report`
- Subcommands: query, status, update, bulk-update, create-jira, find-jira, link-jira, interactive

**Service Layer Extensions:**
- Extend AppScanService (add new query methods)
- Extend JiraService (add description builder)
- Create TriageReportService facade (optional)

**Utility Classes:**
- QueryBuilder for OData filters
- Formatter for output (JSON, table, markdown)
- JiraDescriptionBuilder with size validation
- ArticleMarkdownConverter

**Interactive UI:**
- Leverage @inquirer/prompts (checkbox, select, input)
- Maintain compatibility with existing triage-ui.js helpers
- Add new prompt builders for filters and sorts
