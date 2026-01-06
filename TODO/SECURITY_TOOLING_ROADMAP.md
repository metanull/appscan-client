# Security Tooling Roadmap - Technical Analysis Document

## Executive Summary

This document provides a technical analysis of options for consolidating and automating security operations across multiple tools: Azure DevOps Advanced Security, Microsoft Defender for Cloud, HCL AppScan (Cloud & Standard), Trivy, and Jira. The goal is to streamline vulnerability triage, automate scanning workflows, and maintain traceability from findings to remediation actions.

---

## Table of Contents

1. [Context & Current State](#context--current-state)
2. [Requirements Analysis](#requirements-analysis)
3. [Requirement 1: Azure DevOps Advanced Security Assessment](#requirement-1-azure-devops-advanced-security-assessment)
4. [Requirement 2: Automating Ad-hoc Scans](#requirement-2-automating-ad-hoc-scans)
5. [Requirement 3: Triage & Filing Strategy](#requirement-3-triage--filing-strategy)
6. [Recommendations Summary](#recommendations-summary)
7. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## Context & Current State

### Current Tool Landscape

| Tool | Purpose | API Availability | Current Automation Level |
|------|---------|------------------|--------------------------|
| Azure DevOps | Source control, builds, Advanced Security | REST API + Node.js SDK | Partial (builds) |
| Defender for Cloud | Unified security view, DevOps posture | REST API, Microsoft Graph Security API | Manual (workbooks, GraphQL) |
| HCL AppScan Cloud | SAST/DAST scans (limited quota) | REST API v4 (fully implemented) | High (this project) |
| HCL AppScan Standard | SAST/DAST/IAC (unlimited) | CLI, COM Automation | Manual |
| Trivy | Dependency & secret scanning | CLI output (JSON/SARIF) | Script-based |
| Jira | Issue tracking, remediation | REST API v3 | Partial (from this project) |
| Confluence | Security policies (OWASP ASVS) | REST API | Manual reference |

### Existing Assets

- **appscan-client** (this project): Node.js CLI/TUI for AppScan Cloud triage with Jira integration
- **CyberSecurityTools**: Azure DevOps integration for triggering AppScan Cloud scans (reference: `sast-linux`)
- **azure-devops-node-api**: Ready-to-use npm package for Azure DevOps REST API

---

## Requirements Analysis

### Requirement 1: Azure DevOps Advanced Security Assessment (Priority: Low)

**Goal**: Verify which projects/repositories have Advanced Security enabled and properly configured.

**Key Questions**:
- Which repositories have Advanced Security enabled?
- Are scans running on code merges?
- Are pipelines blocking on security issues?

### Requirement 2: Automating Ad-hoc Scans (Priority: Medium)

**Sub-requirements**:
1. **2.1** Trivy scans on DevOps builds (script-based)
2. **2.2** AppScan Standard scans on DevOps builds (currently manual)
3. **2.3** AppScan Cloud scans on DevOps builds (API-based)

### Requirement 3: Triage & Filing Strategy (Priority: High)

**Decision Point**: Continue developing custom tooling vs. invest in Defender for Cloud

**Criteria for evaluation**:
- Ability to create Jira stories for grouped vulnerabilities
- Automatic documentation with remediation articles
- Bi-directional traceability (finding ↔ Jira story)
- Notification when Jira is closed for validation

---

## Requirement 1: Azure DevOps Advanced Security Assessment

### API Capabilities

The `azure-devops-node-api` package provides dedicated clients for Advanced Security:

```javascript
// Available clients relevant to Advanced Security
import * as azdev from "azure-devops-node-api";

const connection = new azdev.WebApi(orgUrl, authHandler);

// Advanced Security clients
const alertApi = await connection.getAdvancedSecurityAlertApi();
const managementApi = await connection.getAdvancedSecurityManagementApi();
```

### REST API Endpoints

**Advanced Security Alerts API** (`/advancedsecurity/alerts`):
| Operation | Description |
|-----------|-------------|
| `GET` | Get an alert by ID |
| `List` | Get all alerts for a repository |
| `Update` | Update alert status |

**Repository Settings** (via Core/Git API):
- Check if Advanced Security is enabled per repository
- Query build policies for security gates

### Implementation Options

#### Option A: Standalone Assessment Script

Create a Node.js script that:
1. Lists all projects and repositories in the organization
2. Queries each repository's Advanced Security settings
3. Checks for active build policies with security gates
4. Generates a compliance report

**Pros**: Simple, focused, reusable
**Cons**: Point-in-time snapshot only

```javascript
// Pseudocode for assessment
const coreApi = await connection.getCoreApi();
const gitApi = await connection.getGitApi();
const advSecMgmt = await connection.getAdvancedSecurityManagementApi();

const projects = await coreApi.getProjects();
for (const project of projects) {
  const repos = await gitApi.getRepositories(project.id);
  for (const repo of repos) {
    const settings = await advSecMgmt.getRepoAdvancedSecuritySettings(project.id, repo.id);
    // settings.advancedSecurityEnabled
    // settings.pushProtectionEnabled
    // settings.secretScanningEnabled
  }
}
```

#### Option B: Defender for Cloud DevOps Inventory

Defender for Cloud provides an inventory view showing:
- Advanced Security status (`On`, `Off`, `Partially enabled`, `N/A`)
- PR annotation status
- Total findings per repository

**Pros**: Unified view, already aggregated, includes findings
**Cons**: Requires Defender for Cloud setup, read-only visibility

#### Option C: Continuous Monitoring via Azure Policy

Use Azure Policy to enforce and monitor Advanced Security enablement at scale.

**Pros**: Enterprise-grade, automatic enforcement
**Cons**: Requires Azure governance setup, higher complexity

### Recommended Approach

**Start with Option A** (assessment script) to get immediate visibility, then **migrate to Option B** (Defender for Cloud) for ongoing monitoring as you mature your Defender for Cloud usage.

### Data Points to Collect

| Data Point | Source | API |
|------------|--------|-----|
| Repository list | Azure DevOps | `GitApi.getRepositories()` |
| Advanced Security enabled | Azure DevOps | `AdvancedSecurityManagementApi` |
| Code scanning enabled | Azure DevOps | Repository settings |
| Secret scanning enabled | Azure DevOps | Repository settings |
| Dependency scanning enabled | Azure DevOps | Repository settings |
| Push protection enabled | Azure DevOps | Repository settings |
| Build policies with security | Azure DevOps | `PolicyApi.getPolicyConfigurations()` |
| Alert counts by severity | Azure DevOps | `AdvancedSecurityAlertApi.list()` |

---

## Requirement 2: Automating Ad-hoc Scans

### 2.1 Trivy Scans on DevOps Builds

#### Current State
- Manual/script-based execution
- Results viewed in console
- Reports created manually

#### Automation Architecture

```
[Azure DevOps Build] → [Download Artifact] → [Run Trivy] → [Parse Results] → [Store/Report]
                                                  ↓
                                            [SARIF/JSON Output]
                                                  ↓
                                     [Upload to Defender for Cloud]
                                               OR
                                     [Create Jira Issues]
```

#### Implementation Options

**Option A: Pipeline Integration**
Add Trivy as a pipeline task in Azure DevOps YAML:

```yaml
- task: Bash@3
  displayName: 'Trivy Vulnerability Scan'
  inputs:
    targetType: 'inline'
    script: |
      trivy fs --format sarif --output trivy-results.sarif .
      trivy fs --format json --output trivy-results.json .

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'trivy-results.sarif'
    artifactName: 'SecurityScans'
```

**Option B: External Orchestration Script**
Node.js script that:
1. Monitors Azure DevOps for completed builds
2. Downloads build artifacts
3. Runs Trivy locally/in container
4. Processes results and creates Jira issues

```javascript
// Integration with existing appscan-client architecture
import { execSync } from 'child_process';

async function runTrivyScan(artifactPath) {
  const result = execSync(
    `trivy fs --format json --severity HIGH,CRITICAL ${artifactPath}`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result);
}
```

**Recommended**: **Option A** for CI/CD integration with **Option B** for ad-hoc scans on historical builds.

### 2.2 AppScan Standard Automation

#### Current State
- Fully manual via Windows GUI
- No official REST API

#### Automation Options

**Option A: AppScan Standard CLI (AppScanCMD)**

AppScan Standard provides a command-line interface:

```powershell
# Static Analysis
AppScanCMD.exe /s <scan_config.scan> /r <report_output.xml>

# DAST scan
AppScanCMD.exe /starting_url "https://target.com" /scan_template "Default" /r <report.xml>
```

**Option B: COM Automation (Windows Only)**

AppScan Standard exposes a COM interface for programmatic control:

```javascript
// Using node-activex or edge-js for COM interop
const appScan = new ActiveXObject("AppScan.Api");
appScan.OpenScan("C:\\scans\\project.scan");
appScan.Scan();
appScan.GenerateReport("C:\\reports\\output.xml", "Security Report");
```

**Option C: PowerShell Wrapper**

Create PowerShell scripts to wrap AppScanCMD:

```powershell
param(
    [string]$TargetPath,
    [string]$ReportPath,
    [string]$ScanType = "SAST"
)

$AppScanCmd = "C:\Program Files\HCL\AppScan Standard\AppScanCMD.exe"

switch ($ScanType) {
    "SAST" {
        & $AppScanCmd /s "$TargetPath" /r "$ReportPath" /rt xml
    }
    "DAST" {
        & $AppScanCmd /starting_url "$TargetPath" /r "$ReportPath" /rt xml
    }
}
```

**Recommended**: **Option C** (PowerShell) for immediate wins, with **Option B** (COM) for deeper integration later.

#### Integration with Workflow

```
[DevOps Build Complete] 
        ↓
[Download Artifacts to Windows Agent]
        ↓
[Run AppScan Standard via PowerShell/COM]
        ↓
[Parse XML Report]
        ↓
[Upload to AppScan Cloud OR Create Jira Issues]
```

### 2.3 AppScan Cloud Scans on DevOps Builds

#### Current State
- Already implemented in CyberSecurityTools project
- Uses AppScan Cloud REST API v4

#### API Flow

```javascript
// Existing pattern from appscan-client
const service = new AppScanService(config);
await service.authenticate();

// 1. Create or get application
const app = await service.api.v4.Apps_Create({
  Name: projectName,
  AssetGroupId: assetGroupId
});

// 2. Upload source code (IRX file)
const uploadResponse = await service.api.v4.FileUpload_Upload(irxFile);

// 3. Create and execute SAST scan
const scan = await service.api.v4.Scans_CreateSastScan({
  AppId: app.Id,
  ApplicationFileId: uploadResponse.FileId,
  Name: `${projectName}-${buildNumber}`
});

// Alternative: Git repository scanning
const scanFromRepo = await service.api.v4.Scans_CreateSastScan({
  AppId: app.Id,
  RepositoryDetails: {
    Url: repoUrl,
    Branch: 'main',
    Token: gitToken
  },
  Name: `${projectName}-${buildNumber}`
});
```

#### Enhanced Integration Options

**Option A: Direct Git Repository Scanning**
AppScan Cloud can scan Git repositories directly without IRX generation:

```javascript
{
  RepositoryDetails: {
    Url: "https://dev.azure.com/org/project/_git/repo",
    Branch: "main",
    Token: "PAT_TOKEN"
  },
  Recurrence: {
    // Scheduled scanning
    Schedule: "0 2 * * *" // Daily at 2 AM
  }
}
```

**Option B: Pipeline Task for IRX Generation**
Use HCL AppScan Source in pipeline to generate IRX, then upload:

```yaml
- task: HCLAppScanOnCloud@1
  inputs:
    AppId: '$(APPSCAN_APP_ID)'
    CredentialsId: '$(APPSCAN_CREDS)'
    scanType: 'static'
```

**Recommended**: **Option A** for simplicity if repo access is available; **Option B** for air-gapped or complex build scenarios.

---

## Requirement 3: Triage & Filing Strategy

### Decision Framework: Custom Tool vs. Defender for Cloud

| Criterion | Custom Tool (appscan-client) | Defender for Cloud |
|-----------|------------------------------|-------------------|
| **Jira Integration** | ✅ Native, customizable | ⚠️ Requires Logic Apps/Power Automate |
| **Grouped Vulnerabilities** | ✅ Full control over grouping | ⚠️ Limited grouping options |
| **Remediation Articles** | ✅ AppScan articles available | ✅ Built-in recommendations |
| **Bi-directional Tracking** | ✅ ExternalId in AppScan | ⚠️ Requires custom implementation |
| **Multi-tool Support** | ⚠️ Currently AppScan only | ✅ Azure DevOps, GitHub, GitLab |
| **Maintenance Burden** | ❌ High (you maintain) | ✅ Low (Microsoft maintains) |
| **Learning Curve** | ✅ Already familiar | ❌ New platform to learn |
| **Unified Dashboard** | ❌ Multiple tools | ✅ Single pane of glass |

### Option A: Continue Custom Development (appscan-client)

#### Advantages
- Tailored to your exact workflow
- Full control over Jira story creation
- Existing investment in codebase
- ExternalId tracking already implemented

#### Enhancement Roadmap

1. **Add Trivy Integration**
   ```javascript
   // New service: src/services/trivy-service.js
   export class TrivyService {
     async parseSarifReport(sarifPath) { /* ... */ }
     async parseJsonReport(jsonPath) { /* ... */ }
     mapToCommonFormat(trivyFindings) { /* ... */ }
   }
   ```

2. **Add Azure DevOps Advanced Security Integration**
   ```javascript
   // New service: src/services/azdo-security-service.js
   import * as azdev from "azure-devops-node-api";
   
   export class AzDoSecurityService {
     async listAlerts(project, repo) { /* ... */ }
     async updateAlertStatus(alertId, status) { /* ... */ }
   }
   ```

3. **Unified Findings Model**
   ```javascript
   // Common interface for all scanners
   interface SecurityFinding {
     id: string;
     source: 'appscan' | 'trivy' | 'azdo-advanced' | 'appscan-standard';
     severity: 'Critical' | 'High' | 'Medium' | 'Low';
     title: string;
     description: string;
     location: { file: string; line?: number };
     cwe?: string;
     cve?: string[];
     remediation?: string;
     externalId?: string; // Jira reference
   }
   ```

4. **Jira Webhook Listener**
   Set up webhooks to receive notifications when Jira issues are closed:
   
   ```javascript
   // Webhook handler for Jira issue transitions
   app.post('/webhooks/jira', async (req, res) => {
     const { webhookEvent, issue } = req.body;
     if (webhookEvent === 'jira:issue_updated') {
       const { status } = issue.fields;
       if (status.name === 'Done' || status.name === 'Closed') {
         // Trigger validation workflow
         await triggerSecurityValidation(issue.key);
       }
     }
   });
   ```

### Option B: Invest in Defender for Cloud

#### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Defender for Cloud                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Azure DevOps  │  │   GitHub     │  │   GitLab     │          │
│  │  Connector   │  │  Connector   │  │  Connector   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                 ↓                 ↓                   │
│  ┌─────────────────────────────────────────────────┐           │
│  │           DevOps Security Console               │           │
│  │   - Unified alert view                         │           │
│  │   - Severity-based filtering                   │           │
│  │   - Resource grouping                          │           │
│  └─────────────────────────────────────────────────┘           │
│                          ↓                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │           Continuous Export                     │           │
│  │   - Event Hub → Logic Apps → Jira              │           │
│  │   - Microsoft Graph Security API               │           │
│  └─────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

#### Jira Integration via Logic Apps

```json
{
  "definition": {
    "triggers": {
      "When_Defender_alert_is_triggered": {
        "type": "ApiConnectionWebhook",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['defenderforcloud']['connectionId']"
            }
          }
        }
      }
    },
    "actions": {
      "Create_Jira_Issue": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['jira']['connectionId']"
            }
          },
          "method": "post",
          "path": "/issue",
          "body": {
            "fields": {
              "project": { "key": "SEC" },
              "summary": "@{triggerBody()?['alertDisplayName']}",
              "description": "@{triggerBody()?['description']}",
              "issuetype": { "name": "Security Vulnerability" }
            }
          }
        }
      }
    }
  }
}
```

#### Challenges with Defender for Cloud

1. **No native Jira connector**: Requires Logic Apps, Power Automate, or custom webhooks
2. **AppScan findings not included**: Defender doesn't ingest HCL AppScan data
3. **Learning curve**: New platform, different mental model
4. **Grouping limitations**: Less flexibility than custom code

### Option C: Hybrid Approach (Recommended)

**Use Defender for Cloud for**:
- Azure DevOps Advanced Security monitoring
- Unified security posture dashboard
- Policy enforcement

**Use appscan-client for**:
- AppScan Cloud triage and Jira filing
- Detailed vulnerability management
- Custom grouping and bulk operations

**Bridge the gap with**:
- Common Jira project for all security issues
- Standardized labels/components to identify source
- Dashboard in Jira to track all findings

### Jira Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Jira (Central Hub)                            │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ Source: AppScan│  │ Source: AzDO   │  │ Source: Trivy  │         │
│  │ Component:SAST │  │ Component:GHAS │  │ Component:SCA  │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
│                              ↑                                        │
│                      Labels: severity, cwe, application              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                    ↑                    ↑                    ↑
            ┌───────┴───────┐    ┌───────┴───────┐    ┌───────┴───────┐
            │ appscan-client│    │ Logic Apps    │    │ trivy-to-jira │
            │ (this project)│    │ (Defender)    │    │ (new script)  │
            └───────────────┘    └───────────────┘    └───────────────┘
```

### Jira Story Template for Grouped Vulnerabilities

```json
{
  "fields": {
    "project": { "key": "SEC" },
    "issuetype": { "name": "Security Vulnerability" },
    "summary": "[{severity}] {vulnerability_type} in {application_name}",
    "description": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "content": [{ "type": "text", "text": "Vulnerability Details" }]
        },
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "{remediation_guidance}" }]
        },
        {
          "type": "heading",
          "content": [{ "type": "text", "text": "Affected Locations" }]
        },
        {
          "type": "table",
          "content": "/* locations table */"
        },
        {
          "type": "heading",
          "content": [{ "type": "text", "text": "OWASP ASVS Reference" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "See: {confluence_asvs_url}#{control_id}"
            }
          ]
        }
      ]
    },
    "labels": ["{severity}", "{cwe_id}", "{source_tool}"],
    "components": [{ "name": "{scan_type}" }],
    "customfield_10001": "{external_finding_id}" // For backtracking
  }
}
```

### Webhook Setup for Jira Closure Notification

Register a webhook in Jira to receive notifications:

```javascript
// POST to https://your-domain.atlassian.net/rest/webhooks/1.0/webhook
{
  "name": "Security Validation Trigger",
  "url": "https://your-server.com/webhooks/jira-security",
  "events": ["jira:issue_updated"],
  "filters": {
    "issue-related-events-section": "project = SEC AND status changed to Done"
  },
  "excludeBody": false
}
```

Handle in your application:

```javascript
// Webhook handler
async function handleJiraWebhook(payload) {
  const { issue, changelog } = payload;
  
  // Check if status changed to Done/Closed
  const statusChange = changelog?.items?.find(i => i.field === 'status');
  if (statusChange?.toString === 'Done') {
    const externalId = issue.fields.customfield_10001;
    
    // Find associated AppScan finding
    const finding = await appScanService.findByExternalId(externalId);
    
    // Notify for validation
    await notifyForValidation({
      jiraKey: issue.key,
      findingId: finding.Id,
      scanId: finding.ScanId,
      application: finding.AppName
    });
  }
}
```

---

## Recommendations Summary

### Immediate Actions (0-1 Month)

| Action | Tool | Effort |
|--------|------|--------|
| Create Azure DevOps Advanced Security assessment script | azure-devops-node-api | Low |
| Add PowerShell wrapper for AppScan Standard CLI | PowerShell | Low |
| Set up Jira webhook for issue closure notifications | Jira + Node.js | Medium |

### Short-term (1-3 Months)

| Action | Tool | Effort |
|--------|------|--------|
| Add Trivy integration to appscan-client | Node.js | Medium |
| Create unified findings model in appscan-client | Node.js | Medium |
| Explore Defender for Cloud DevOps connector | Azure Portal | Low |

### Medium-term (3-6 Months)

| Action | Tool | Effort |
|--------|------|--------|
| Add Azure DevOps Advanced Security integration to TUI | Node.js | High |
| Implement Logic Apps for Defender → Jira flow | Azure | Medium |
| Create validation workflow for closed Jira issues | Node.js | Medium |

### Long-term (6+ Months)

| Action | Tool | Effort |
|--------|------|--------|
| Evaluate AppScan Standard COM automation | Node.js + COM | High |
| Build comprehensive security dashboard | React/Grafana | High |
| Full migration to Defender for Cloud (if beneficial) | Azure | High |

---

## Implementation Priority Matrix

```
                        High Value
                            │
    ┌───────────────────────┼───────────────────────┐
    │   QUICK WINS          │   STRATEGIC           │
    │                       │                       │
    │ • AzDO assessment     │ • Unified findings    │
    │   script              │   model               │
    │ • Jira webhooks       │ • Defender for Cloud  │
    │ • PS wrapper for      │   exploration         │
    │   AppScan Standard    │ • Trivy integration   │
Low ├───────────────────────┼───────────────────────┤ High
Effort│   FILL-INS           │   MAJOR PROJECTS      │ Effort
    │                       │                       │
    │ • Documentation       │ • AppScan Standard    │
    │ • Process             │   COM automation      │
    │   optimization        │ • Custom dashboard    │
    │                       │ • Full Defender       │
    │                       │   migration           │
    └───────────────────────┼───────────────────────┘
                            │
                        Low Value
```

---

## Appendix A: API Reference Quick Links

| Service | Documentation |
|---------|---------------|
| Azure DevOps REST API | https://learn.microsoft.com/en-us/rest/api/azure/devops/ |
| Azure DevOps Node.js API | https://github.com/Microsoft/azure-devops-node-api |
| Advanced Security Alerts API | https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts |
| Defender for Cloud REST API | https://learn.microsoft.com/en-us/rest/api/defenderforcloud/ |
| Microsoft Graph Security API | https://learn.microsoft.com/en-us/graph/security-concept-overview |
| HCL AppScan Cloud API v4 | https://cloud.appscan.com/swagger/ui/index |
| Jira REST API v3 | https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/ |
| Jira Webhooks | https://developer.atlassian.com/cloud/jira/platform/webhooks/ |

---

## Appendix B: Configuration Templates

### Environment Variables (Extended)

```env
# AppScan Cloud (existing)
APPSCAN_API_KEY=your_key
APPSCAN_API_SECRET=your_secret
APPSCAN_BASE_URL=https://cloud.appscan.com

# Azure DevOps (new)
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/yourorg
AZURE_DEVOPS_PAT=your_personal_access_token

# Jira (existing)
JIRA_HOST=https://company.atlassian.net
JIRA_EMAIL=email@company.com
JIRA_API_TOKEN=token
JIRA_PROJECT_KEY=SEC

# Jira Webhooks (new)
JIRA_WEBHOOK_SECRET=random_secret_for_hmac

# Trivy (new)
TRIVY_CACHE_DIR=/path/to/cache
TRIVY_SEVERITY=CRITICAL,HIGH

# AppScan Standard (new)
APPSCAN_STANDARD_PATH=C:\Program Files\HCL\AppScan Standard\AppScanCMD.exe
```

---

*Document generated: January 6, 2026*
*Version: 1.0*
