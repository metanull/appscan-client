**Overview**
- **Purpose**: Document AppScan Cloud v4 API requests and responses for Applications, Scans, Issues and Articles.  
- **Source**: Derived from the OpenAPI specification downloaded to `doc/appscan-swagger-v4.json` and from the generated client in `src/generated/Api.js`.

**How this analysis was produced**
- Downloaded OpenAPI spec from `https://eu.cloud.appscan.com/swagger/v4/swagger.json` into `doc/appscan-swagger-v4.json`.
- Used `src/generated/Api.js` (generated with `swagger-typescript-api`) and `src/services/appscan-service.js` to see how the CLI uses endpoints.
- Extracted key schemas and enum values for `Application`, `Scan`, `Issue` and `Reports/Article`.

**Key endpoints (summary)**
- `GET /api/v4/Apps`  — returns `ApplicationModelPageResultModel` (paginated list of applications)
- `GET /api/v4/Apps/{id}` — returns `ApplicationModel` (single application details)
- `GET /api/v4/Scans` — returns `MinScanModelPageResultModel` (paginated minimal scan models)
- `GET /api/v4/Scans/{scanId}` — scan details (various ScanModel types depending on technology)
- `GET /api/v4/Issues/{scope}/{scopeId}` — returns `IssueModelPageResultModel` for a scope (eg. `Scan`, `Application`)
- `GET /api/v4/Issues/{issueId}` — returns `IssueModel` (single issue)
- `GET /api/v4/Issues/{issueId}/Details` — returns detailed issue information (HTML or JSON depending on `Format`)
- `GET /api/v4/Reports/Article` — returns help article or guidance based on `issuetype` or article id (raw HTML or JSON)

**Models & shapes (high-level)**
- Application list (`ApplicationModelPageResultModel`)
  - Items: array of `ApplicationModel` objects
  - Count: integer
- `ApplicationModel` (important/used fields)
  - `Id` (string, uuid)
  - `Name` (string)
  - `RiskRating` (enum) — see enums section
  - `MaxSeverity` (enum)
  - `ScanTechnologies` (enum set) — note: this uses short codes (e.g. `DAST`, `SAST`, `SCA`) that differ from scan `Technology` fields
  - `Application` contains additional metadata: owners, createdAt, policy associations
- Scan list (`MinScanModelPageResultModel`)
  - Items: array of `MinScanModel` objects
  - `MinScanModel` important fields:
    - `Id` (string) — scan identifier
    - `Name` (string)
    - `AppName`, `AppId` (link back to application)
    - `Technology` (enum) — values like `StaticAnalyzer`, `DynamicAnalyzer`, `ScaAnalyzer` etc.
    - `LatestExecution` / `ScanExecutionInfo` (see `ScanExecutionModel`)
- Issue list (`IssueModelPageResultModel`)
  - Items: array of `IssueModel`
  - `IssueModel` (important fields):
    - `Id` (string)
    - `Title` or `Name` (string)
    - `Severity` (enum)
    - `Status` (enum)
    - `IssueTypeId` (string) — used when requesting remediation articles
    - `ApplicationId` (string) — link back to app
    - `ScanId`, `ScanExecutionId` (string)
    - `SourceFileUri`, `Location`, `LineNumber`, `Context` (location / snippet)
    - `CveId`, `Api` (optional additional metadata)

**Enums & differences (important reconciliation notes)**
- Issue severities (consistent model for issues):
  - `Undetermined`, `Informational`, `Low`, `Medium`, `High`, `Critical`
- Issue statuses (used to triage and filter):
  - `Open`, `InProgress`, `Reopened`, `Noise`, `Passed`, `Fixed`, `New`
- Scan technology: different representations depending on model/context:
  - `MinScanModel.Technology` (used by `GET /api/v4/Scans`):
    - DynamicAnalyzer, StaticAnalyzer, IASTAnalyzer (IAST), ScaAnalyzer, DastAutomation, IFA, ...
  - `ApplicationModel.ScanTechnologies` (used in app metadata):
    - `NONE`, `DAST`, `SAST`, `IAST`, `SCA`
  - Mapping note: `StaticAnalyzer` <-> `SAST`; `DynamicAnalyzer` <-> `DAST`; `ScaAnalyzer` <-> `SCA`.
    - These are equivalent concepts but different tokens/strings across schemas. When correlating data, normalize these values.

- `ApplicationModel` risk & severity fields:
  - `RiskRating`: `Unknown`, `Low`, `Medium`, `High`, `Critical`
  - `MaxSeverity`: same domain as Issue Severity

- `MinScanModel` additional enums (IAST agent etc.) — useful when correlating agent type and status for IAST scans.

**Reports / Articles**
- The `Reports_GetArticle` endpoint accepts query parameters such as `id` (article id) or `issuetype` (issue type id) and returns an HTML snippet (or JSON depending on `Accept` headers).
- AppScan UI uses relative article links like `?issuetype=xxxxx`; the client or service should convert to absolute URLs using the `baseUrl` (see `AppScanService.getArticle` which rewrites hrefs to absolute AppScan links).

**Business rules & expectations (observed from OpenAPI + client usage)**
- Authentication
  - Use `POST /api/v4/Account/ApiKeyLogin` with `KeyId`/`KeySecret` to obtain a bearer token returned in `AccessTokenData` (`Token` property). The CLI sets this as `Authorization: Bearer <token>` for subsequent calls.
  - The CLI `Config` will take `APPSCAN_API_KEY` and `APPSCAN_API_SECRET` from environment or config file.

- Pagination & OData filters
  - Many list endpoints follow OData conventions: `$top`, `$count`, `$filter`, `$select` are supported.
  - `Scans_Get` supports query filters like `$filter=AppId eq {appId}` (as used in `AppScanService.listScans(appId)`).

- Issue updates & bulk operations
  - The API provides a filtered update endpoint (e.g. `Issues_UpdateFilteredIssues` scoped to Application) to update many issues in a single request — the CLI builds OData `Id eq x or Id eq y` filters for this.
  - Valid statuses for updates are enumerated and validated by the client (`Open`, `InProgress`, `Reopened`, `Noise`, `Passed`, `Fixed`, `New`). Use only allowed values.

- Articles & remediation linking
  - Use `IssueTypeId` when calling `Reports_GetArticle` to fetch remediation guidance for a specific issue type.
  - The article body may be HTML and contain relative links that must be rewritten to absolute links to be usable outside the AppScan UI.

**Concrete extracted enum samples (from `doc/appscan-swagger-v4.json` analysis)**
- Issue Severity: ["Undetermined","Informational","Low","Medium","High","Critical"]
- Issue Status: ["Open","InProgress","Reopened","Noise","Passed","Fixed","New"]
- MinScanModel.Technology: ["DynamicAnalyzer","StaticAnalyzer","IFA","DastAutomation","IASTAnalyzer","ScaAnalyzer"]
- ApplicationModel.ScanTechnologies: ["NONE","DAST","SAST","IAST","SCA"]

**Recommended normalization rules**
- Normalize scan technology when correlating across App and Scan objects. Example normalization function:
  - Map `StaticAnalyzer` => `SAST`
  - Map `DynamicAnalyzer` => `DAST`
  - Map `ScaAnalyzer` => `SCA`
  - Map `IASTAnalyzer` => `IAST`
  - Map `IFA` => `IFA` (if used)

**How to collect live JSON responses (run locally)**
1) Ensure Node.js >= 20 is installed and repo deps installed (`npm ci`).
2) Set environment variables:
   - `APPSCAN_API_KEY` and `APPSCAN_API_SECRET` (and optional `APPSCAN_BASE_URL` if not cloud)
3) Run the included collection script to save JSON samples (script in `scripts/collect-samples.js`). Example:

```powershell
Set-Location -LiteralPath 'e:\appscan-client'
$env:APPSCAN_API_KEY = 'your-key'
$env:APPSCAN_API_SECRET = 'your-secret'
node scripts/collect-samples.js
```

**Next steps I can take for you (choose):**
- Option A: I can run the live collection step here if you provide API credentials (via secure input or by setting env vars in this environment).  
- Option B: You run `node scripts/collect-samples.js` locally and paste the resulting JSON files or push them to the repo; I will analyze them and extend this doc with concrete examples and any anomalies.  
- Option C: I extend this documentation with detailed per-endpoint field tables / example request/response bodies derived from `doc/appscan-swagger-v4.json` (no credentials needed).  

If you want me to proceed with Option C now, I will expand each endpoint section with explicit request parameters, response schema fields, allowed enums and short examples derived from the OpenAPI spec.

**Concrete examples (live samples)**
- Location: `reports/api-samples/` (generated by `scripts/collect-samples-by-tech.js`)

Below are representative excerpts from live API responses collected from the AppScan tenant. For full samples see the files in `reports/api-samples/`.

- Application sample (from `applications.json`, one item):

  Example fields:
  - `Id`: "f1c993c8-65dc-4727-818a-07a7803741ce"
  - `Name`: "SAST-DITO"
  - `RiskRating`: "Medium"
  - `MaxSeverity`: "High"
  - `TotalIssues`: 100
  - `ScanTechnologies`: "SAST, SCA"

  Minimal JSON excerpt:
  ```json
  {
    "Id": "f1c993c8-65dc-4727-818a-07a7803741ce",
    "Name": "SAST-DITO",
    "RiskRating": "Medium",
    "MaxSeverity": "High",
    "TotalIssues": 100,
    "ScanTechnologies": "SAST, SCA"
  }
  ```

- Scan samples (each `sample-<tech>-scan.json`):

  - SAST example (StaticAnalyzer):
    - `Id`: e315d9e6-4aee-4e22-9fdb-01d78cfe3bd3
    - `Technology`: "StaticAnalyzer"
    - `AppName`: "SAST-OBO Dashboard"
    - `LatestExecution.NIssuesFound`: 6

    Excerpt:
    ```json
    {
      "Id": "e315d9e6-4aee-4e22-9fdb-01d78cfe3bd3",
      "Name": "OBOD-20251114-173025",
      "Technology": "StaticAnalyzer",
      "AppName": "SAST-OBO Dashboard",
      "LatestExecution": {
        "NIssuesFound": 6,
        "NHighIssues": 3,
        "NLowIssues": 3,
        "Status": "Ready"
      }
    }
    ```

  - DAST example (DynamicAnalyzer):
    - `Id`: 90ec9703-7e99-401c-92cc-00cddddcac65
    - `Technology`: "DynamicAnalyzer"
    - `Url`: "https://obodcor-accept.ces-cdr.eu.int/"
    - `LatestExecution.NIssuesFound`: 10

    Excerpt:
    ```json
    {
      "Id": "90ec9703-7e99-401c-92cc-00cddddcac65",
      "Name": "DAST 2025-10-20 https://obodcor-accept.ces-cdr.eu.int/",
      "Technology": "DynamicAnalyzer",
      "Url": "https://obodcor-accept.ces-cdr.eu.int/",
      "LatestExecution": { "NIssuesFound": 10, "Status": "Ready" }
    }
    ```

  - SCA example (ScaAnalyzer):
    - `Id`: 87df20ba-0385-4ce9-a7a7-073cd789d18d
    - `Technology`: "ScaAnalyzer"
    - `LatestExecution.NOpenSourcePackages`: (may be -1 when not applicable)

    Excerpt:
    ```json
    {
      "Id": "87df20ba-0385-4ce9-a7a7-073cd789d18d",
      "Name": "HR-20251117-111423",
      "Technology": "ScaAnalyzer",
      "LatestExecution": { "NOpenSourcePackages": -1, "Status": "Ready" }
    }
    ```

- Issue samples (each `sample-<tech>-issues.json`). Example fields are consistent across technologies, but some fields are specific to SCA (packages) or DAST (URL/Port):

  - SAST issue excerpt (from `sample-sast-issues.json`):
    ```json
    {
      "Id": "b9513af1-7fc1-f011-8194-002248e524dc",
      "Language": "C#",
      "Severity": "Low",
      "Status": "InProgress",
      "IssueType": "Insertion of Sensitive Information into Log File",
      "SourceFileUri": "https://dev.azure.com/.../Program.cs?path=...&line=29",
      "Context": "Console.WriteLine(apiResult);",
      "IssueTypeId": "Logging.RevealsDetails.SensitiveData",
      "DiscoveryMethod": "SAST"
    }
    ```

  - DAST issue excerpt (from `sample-dast-issues.json`): contains fields like `Location`, `Port`, `Scheme`, `Api` and `DiscoveryMethod: DAST`. Example:
    ```json
    {
      "Id": "...",
      "Severity": "Medium",
      "Status": "Open",
      "Location": "GET /some/path",
      "Port": 443,
      "Scheme": "https",
      "DiscoveryMethod": "DAST",
      "IssueTypeId": "..."
    }
    ```

  - SCA issue excerpt (from `sample-sca-issues.json`): SCA issues include `Package`, `LibraryName`, `LibraryVersion`, `AppPackageId` fields:
    ```json
    {
      "Id": "...",
      "Severity": "Informational",
      "Status": "Open",
      "Package": "org.example:lib:1.2.3",
      "LibraryName": "lib",
      "LibraryVersion": "1.2.3",
      "DiscoveryMethod": "SCA"
    }
    ```

Notes:
- Some numeric counters may be `-1` when the property is not applicable (e.g., `NOpenSourcePackages: -1`).
- `SourceFileUri` is often an absolute link to repository file viewers (Azure DevOps, GitHub) and may include line parameters — use `SourceFileUri` to link directly to code.

If you want, I will now:
- (A) Extend `doc/appscan-api-responses.md` with a per-endpoint, per-field table for Applications, Scans, Issues and Reports (derived from the OpenAPI schema and live samples).  
- (B) Add the full collected JSON samples to the repository under `reports/api-samples/` (they are already saved there) and link them from the doc with short notes.  
- (C) Generate small normalization helper functions (JS) to map scan technology tokens to canonical values and add them under `src/utils/`.

Pick one or more and I'll continue.

**Per-endpoint field tables (detailed)**

Note: types and enums below are taken from `doc/appscan-swagger-v4.json` (`components.schemas`) and cross-checked with live samples in `reports/api-samples/`.

**Applications — `GET /api/v4/Apps` → `ApplicationModelPageResultModel` / `ApplicationModel`**
- Important fields:
  - `Id` (string, uuid)
  - `Name` (string)
  - `RiskRating` (string enum: `Unknown`,`Low`,`Medium`,`High`,`Critical`)
  - `MaxSeverity` (string enum: `Undetermined`,`Informational`,`Low`,`Medium`,`High`,`Critical`)
  - `TotalIssues` (integer)
  - `OpenIssues` (integer)
  - `ScanTechnologies` (string enum: `NONE`,`DAST`,`SAST`,`IAST`,`SCA`) — note: in live samples this field can be a comma-separated string listing multiple tokens (see Anomalies section)
  - `DateCreated`, `LastUpdated` (date-time strings)
  - `AssetGroupId`, `BusinessUnitId` (uuid strings)

**Scans — `GET /api/v4/Scans` → `MinScanModelPageResultModel` / `MinScanModel`**
- Important fields:
  - `Id` (string, uuid)
  - `AppId` (string, uuid)
  - `Name` (string)
  - `Technology` (string enum: `DynamicAnalyzer`,`StaticAnalyzer`,`IFA`,`DastAutomation`,`IASTAnalyzer`,`ScaAnalyzer`)
  - `IastAgentType` / `IastAgentStatus` (IAST-specific enums)
  - `Url` (string) — for DAST scans
  - `AppName` (string)
  - `NumberOfExecutions` (integer)
  - `LatestExecution` (object ref to `ScanExecutionModel`) — contains counters and status
  - `EnablePromote`, `RescanAllowed`, `EnableMailNotifications` (booleans)

**Scan execution — `ScanExecutionModel` (embedded in scan responses)**
- Important fields:
  - `Id` (uuid), `ScanId` (uuid)
  - `CreatedAt`, `ExecutedAt`, `ScanEndTime` (date-time)
  - `Status` (string enum: `Running`,`Stopping`,`Pausing`,`InQueue`,`Paused`,`Ready`,`Failed`)
  - `NIssuesFound`, `NCriticalIssues`, `NHighIssues`, `NMediumIssues`, `NLowIssues`, `NInfoIssues` (integers)
  - `NOpenSourceLicenses`, `NOpenSourcePackages` (integers; may be `-1` in some responses when not applicable)
  - `ExecutionProgress` (string enum: `Pending`,`Running`,`UnderReview`,`RunningManually`,`Paused`,`Completed`)
  - `Progress` (integer) — observed values may vary (see Anomalies)

**Issues — `GET /api/v4/Issues/{scope}/{scopeId}` → `IssueModelPageResultModel` / `IssueModel`**
- Important fields:
  - `Id` (uuid)
  - `Severity` (string enum: `Undetermined`,`Informational`,`Low`,`Medium`,`High`,`Critical`)
  - `Status` (string enum: `Open`,`InProgress`,`Reopened`,`Noise`,`Passed`,`Fixed`,`New`)
  - `IssueType` (string) and `IssueTypeId` (string) — `IssueTypeId` is the canonical token to request remediation articles
  - `IssueTypeGuid` (uuid)
  - `ApplicationId`, `ScanId`, `ScanExecutionId` (uuids)
  - `SourceFile`, `SourceFileUri`, `Api`, `Location`, `Line` (location metadata)
  - `Context` (string) — short code snippet or context
  - `CveId`, `Cvss`, `CvssVersion` (where applicable)
  - `DiscoveryMethod` (string) — typically `SAST`,`DAST`,`SCA`, etc.
  - `Package`, `LibraryName`, `LibraryVersion`, `AppPackageId`, `AppPkgStatus` — SCA-specific fields
  - `DiffResult` (enum: `NoChange`,`Added`,`Removed`)
  - `ReplayScriptFrameworks` (enum: `None`,`Python`,`JsConsole`) — when replay scripts are available

**Reports / Articles — `GET /api/v4/Reports/Article`**
- Query params commonly used:
  - `id` — article id (optional)
  - `issuetype` — pass `IssueTypeId` to fetch remediation guidance for that issue type
  - `language`, `api`, `cveId`, `nl`, `mode`, `enableTrainingLinks` — optional
- Response: HTML (or JSON) content with remediation guidance; may include relative links like `?issuetype=...` which need conversion to absolute URLs (see `AppScanService.getArticle` which rewrites hrefs).

**Anomalies, mismatches and defensive parsing recommendations**

I compared the OpenAPI schemas with live samples and flagged the following practical differences and edge cases you should handle in tooling:

- Scan technology representation mismatch:
  - OpenAPI: `MinScanModel.Technology` uses tokens like `StaticAnalyzer`, `DynamicAnalyzer`, `ScaAnalyzer`.
  - OpenAPI: `ApplicationModel.ScanTechnologies` is declared as an enum single string of values like `SAST` / `DAST` etc.
  - Live sample: `ApplicationModel.ScanTechnologies` sometimes contains a comma-separated string (example: `"SAST, SCA"`) listing multiple technologies.
  - Recommendation: treat `ScanTechnologies` as a CSV string (split on comma, trim) and normalize each token using a mapping table (see below).

- Counters with sentinel negative values:
  - Fields such as `NOpenSourcePackages` or `NOpenSourceLicenses` can be `-1` in responses (sample shows `-1`). This indicates "not applicable / not collected" rather than a true negative count.
  - Recommendation: treat negative counts as `null`/N/A in tooling and avoid arithmetic on raw values without normalization.

- Progress and numeric ranges:
  - `ScanExecutionModel.Progress` sometimes contains unexpected values (example: `32196` in a DAST sample), while other executions have values like `100`. Do not assume a 0-100 range; use `ExecutionProgress` and `Status` to determine completion state.
  - Recommendation: expose both `Progress` and `ExecutionProgress` in UI, but rely on `Status === 'Ready'` or `ExecutionProgress === 'Completed'` to consider scan finished.

- Optional vs missing fields / nulls:
  - Many fields are optional and frequently `null` or omitted (e.g., `Url`, `CveId`, `SourceFileUri`). Your code should defensively check for property existence before reading or dereferencing (no direct dot-chaining assumptions).

- Issue vs article parameters:
  - Remediation articles should be requested with `issuetype=<IssueTypeId>`; some items include `IssueTypeId` and `IssueTypeGuid` — prefer `IssueTypeId` for `Reports_GetArticle`.
  - `AppScanService.getArticle` already builds a query and rewrites relative hrefs; reuse that helper logic or mirror its behavior.

- Severity/value normalization:
  - Some systems prefer numeric severity (`SeverityValue`) in addition to `Severity` string. Use `Severity` as canonical but fall back to `SeverityValue` when mapping to numeric scales.

- Date/time fields:
  - Dates are ISO-8601 strings. Expect timezone suffix `Z`. Parse to JS `Date` or store as strings consistently.

**Suggested normalization mapping (example)**
- Map `MinScanModel.Technology` → canonical short code:
  - `StaticAnalyzer` => `SAST`
  - `DynamicAnalyzer` => `DAST`
  - `ScaAnalyzer` => `SCA`
  - `IASTAnalyzer` => `IAST`
  - `DastAutomation` => `DAST` (or keep `DastAutomation` if you need exact type)

**Suggested defensive parsing utilities**
- `parseScanTechnologies(value)`
  - Input: string (may be `"SAST, SCA"`, `"SAST"`, or null)
  - Output: array of normalized tokens (e.g., `["SAST","SCA"]`)

- `normalizeCount(n)`
  - Input: number
  - Output: `null` if `n < 0`, else `n`

- `isScanReady(execution)`
  - Return `true` when `execution.Status === 'Ready' || execution.ExecutionProgress === 'Completed'`

I will add small helper implementations for these utilities under `src/utils/` if you want them (non-invasive helpers only). They make the CLI more resilient when aggregating counts or grouping scans by technology.

**Anomalies report (concrete items found in live samples)**
- `applications.json`: `ScanTechnologies` contains the string `"SAST, SCA"` (CSV) instead of single-token enum.
- `scans.json` / `sample-dast-scan.json`: `LatestExecution.Progress` shows `32196` in a DAST sample — don't assume 0-100.
- `sample-sast-scan.json`: `LatestExecution.NIssuesFound` matches `TotalIssues` on app but issue list returns detailed items; some scans have 0 issues returned when `listIssues` used scoped query (empty Items array in `reports/api-samples/issues.json`).
- `sample-sca-scan.json` / `ScanExecutionModel`: `NOpenSourcePackages` and `NOpenSourceLicenses` may be `-1`.

Next actions I can perform for you:
- (1) Implement the suggested helper utilities under `src/utils/` and update `AppScanService` usage to normalize counts and technologies (non-breaking).  
- (2) Expand `doc/appscan-api-responses.md` further with complete per-field descriptions (I can auto-generate tables from the swagger schema).  
- (3) Create unit tests for the normalization helpers.

Which next action(s) do you want me to take? 
