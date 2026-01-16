# Azure Security APIs Investigation Report

## ⚠️ IMPORTANT UPDATE

**Initial Assessment Corrected**: The original investigation incorrectly stated that Defender for Cloud API does not support DevOps operations. This has been corrected after reviewing the **Defender for Cloud Composite API** documentation.

**Key Discovery**: Defender for Cloud provides DevOps management through **Security Connectors**, including:
- Listing Azure DevOps organizations, projects, and repositories
- Managing onboarding state
- Configuring PR annotations (actionable remediation)
- Viewing DevOps security alerts

See the [Microsoft Defender for Cloud Composite API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/) documentation for details.

## Executive Summary

This document presents the findings from investigating **Microsoft Defender for Cloud REST API** and **Microsoft Graph Security API** as potential alternatives or complements to the **Azure DevOps REST API** for managing DevOps security tasks.

## Investigation Scope

The goal was to determine if Defender for Cloud or Microsoft Graph Security APIs can perform these 9 tasks currently accomplished with Azure DevOps API:

1. Connect to Azure DevOps REST API
2. Get information about the connection and DevOps configuration
3. List Azure DevOps Projects
4. List Azure DevOps Projects' repositories
5. Assert enablement of Microsoft Advanced Security in repositories
6. List alerts in Azure DevOps Projects
7. List security threats by category with filtering capabilities
8. Update security threats (categorization/status/severity/comment)
9. Close alerts with reason and structured comments (metadata)

## Available NPM Packages

### 1. Azure Identity (@azure/identity)
- **Version**: 4.13.0
- **Purpose**: Authentication library for all Azure SDKs
- **Usage**: Provides credentials for authenticating with Azure services
- **Key Features**:
  - `DefaultAzureCredential`: Auto-selects best auth method
  - `ClientSecretCredential`: Service principal authentication
  - `ManagedIdentityCredential`: Azure managed identity
  - `AzureCliCredential`: Use existing Azure CLI login

### 2. Azure Security Center (@azure/arm-security)
- **Version**: 5.0.0 (latest: 7.x available)
- **Purpose**: Client library for Microsoft Defender for Cloud (formerly Azure Security Center)
- **Key Features**:
  - List security assessments and recommendations
  - Manage security policies
  - List and update security alerts
  - Query secure scores
  - Manage regulatory compliance

### 3. Microsoft Graph Client (@microsoft/microsoft-graph-client)
- **Version**: 3.0.7
- **Purpose**: JavaScript client for Microsoft Graph API
- **Key Features**:
  - Unified API for Microsoft 365, Azure AD, and security data
  - Security alerts aggregation from multiple providers
  - Incident management
  - Threat intelligence
  - Security actions

## API Capabilities Analysis

### Microsoft Defender for Cloud API (CORRECTED ASSESSMENT)

#### What It CAN Do:
✅ **Azure DevOps Integration** (via Security Connectors):
- ✅ List Azure DevOps organizations onboarded to Defender
- ✅ List Azure DevOps projects via Defender
- ✅ List Azure DevOps repositories via Defender
- ✅ Check onboarding state per organization/project/repository
- ✅ Get repository properties (visibility, parent org/project, repo ID/URL)
- ✅ Configure actionable remediation (PR annotations)
- ✅ Manage DevOps security connector configuration

✅ **Azure Resource Security**:
- List security assessments for Azure resources
- Get security recommendations
- Query secure scores
- List security alerts from Azure resources and DevOps
- Update alert status (Active, InProgress, Resolved, Dismissed)
- Manage security policies and compliance

✅ **General Security Management**:
- Manage regulatory compliance
- Configure security contacts
- Set up security automation
- View security dashboard data

#### What It Has Limitations On:
⚠️ **DevOps-Specific Advanced Security Operations**:
- ⚠️ Repository-level alert filtering may have different criteria than native DevOps API
- ⚠️ Advanced Security enablement status check (requires specific connector setup)
- ⚠️ Detailed pipeline/phase/rule-specific filtering might be limited
- ⚠️ Structured metadata via comments (may use different format)

**Important**: Defender for Cloud provides a **management layer** over DevOps resources through Security Connectors. It requires initial setup of DevOps connector in Azure and provides a centralized view, but some granular operations are still better handled via native Azure DevOps API.

### Microsoft Graph Security API

#### What It CAN Do:
✅ **Unified Security View**:
- List security alerts from multiple Microsoft security products
- Query security incidents (aggregated alerts)
- Get secure scores across the organization
- Filter alerts by provider (could include "Azure DevOps" as provider)
- Update alert status, tags, comments, and assignments
- Manage threat indicators
- Create security actions

✅ **Cross-Platform Integration**:
- Aggregate security data from Azure DevOps, Microsoft 365, Azure AD
- Integration with SIEM/SOAR tools
- Standardized alert schema across products

#### What It CANNOT Do (or has limitations):
❌ **DevOps-Specific Operations**:
- ❌ List Azure DevOps projects and repositories directly
- ❌ Check Advanced Security enablement status per repository
- ❌ Access detailed DevOps alert metadata (pipeline, phase, rule details)
- ❌ Use DevOps-specific filter criteria (dependencyName, validity, etc.)
- ❌ Close alerts with DevOps-specific dismissal reasons

⚠️ **Partial Support**:
- ⚠️ May aggregate DevOps alerts if Defender for Cloud connector is configured
- ⚠️ Alert updates work but may not sync all fields back to DevOps
- ⚠️ Limited access to repository-level details

**Reason**: Graph Security API is a security data aggregator, not a DevOps management API.

## Comparison Matrix

| Task | Azure DevOps API | Defender for Cloud | Graph Security API |
|------|------------------|--------------------|--------------------|
| 1. Connect to API | ✅ Direct | ✅ Via Azure SDK + Connector | ✅ Via Graph SDK |
| 2. Get DevOps config | ✅ Full access | ✅ Via connector | ❌ No support |
| 3. List Projects | ✅ Native | ✅ Via connector | ❌ No support |
| 4. List Repositories | ✅ Native | ✅ Via connector | ❌ No support |
| 5. Check Adv Security | ✅ Native | ⚠️ Via onboarding state | ❌ No support |
| 6. List Alerts | ✅ Full details | ✅ Aggregated view | ⚠️ Cross-platform |
| 7. Filter by Category | ✅ Rich filters | ⚠️ Limited filters | ⚠️ Basic filters |
| 8. Update Alerts | ✅ Native fields | ✅ Update status | ⚠️ Generic fields |
| 9. Close with Metadata | ✅ Full support | ⚠️ Comments limited | ⚠️ Partial |

**Legend**: ✅ Full Support | ⚠️ Partial/Limited | ❌ Not Supported

**Key Insight**: Defender for Cloud requires a **Security Connector** setup to access DevOps resources. It provides organizational oversight and centralized management but may not expose all granular DevOps-specific filtering options that the native API provides.

## Required NPM Packages

### To Install:
```bash
# For Defender for Cloud exploration
npm install @azure/identity @azure/arm-security

# For Microsoft Graph Security exploration
npm install @azure/identity @microsoft/microsoft-graph-client
```

### Already Installed:
```bash
# For Azure DevOps operations (already in package.json)
# azure-devops-node-api: ^15.1.2
```

## Required Permissions

### Defender for Cloud API:
**Azure Role Assignments** (on subscription):
- `Security Reader`: Read security assessments and alerts
- `Security Admin`: Update security settings and alerts

### Microsoft Graph Security API:
**Application Permissions** (requires admin consent):
- `SecurityEvents.Read.All`: Read security alerts
- `SecurityEvents.ReadWrite.All`: Update security alerts
- `SecurityIncident.Read.All`: Read security incidents
- `ThreatIndicators.ReadWrite.OwnedBy`: Manage threat indicators

### Azure DevOps API:
**Personal Access Token** (PAT) scopes:
- `Advanced Security: Read`: Read Advanced Security alerts
- `Advanced Security: Read & write`: Update alerts
- `Code: Read`: Access repository information
- `Project and Team: Read`: List projects

## Environment Variables Required

### For Defender for Cloud (add to .env):
```bash
# Azure subscription and authentication
AZURE_SUBSCRIPTION_ID=<your-subscription-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<service-principal-client-id>
AZURE_CLIENT_SECRET=<service-principal-secret>
```

### For Microsoft Graph Security (add to .env):
```bash
# Same as above, but service principal needs Graph API permissions
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<app-registration-client-id>
AZURE_CLIENT_SECRET=<app-registration-secret>
```

### For Azure DevOps (already in .env):
```bash
AZURE_DEVOPS_ORG=<organization-name>
AZURE_DEVOPS_PAT=<personal-access-token>
```

## Exploration Scripts Created

### 1. lab/azdo-10-defender-exploration.js
**Purpose**: Explore Defender for Cloud API capabilities

**What it does**:
- Authenticates with Defender for Cloud
- Lists security assessments
- Lists security alerts
- Queries secure scores
- Documents capabilities and limitations

**Run**:
```bash
node lab/azdo-10-defender-exploration.js
```

### 2. lab/azdo-11-graph-exploration.js
**Purpose**: Explore Microsoft Graph Security API capabilities

**What it does**:
- Authenticates with Microsoft Graph
- Lists security alerts from multiple providers
- Queries security incidents
- Checks secure scores
- Tests DevOps alert filtering
- Documents update capabilities

**Run**:
```bash
node lab/azdo-11-graph-exploration.js
```

## Recommended Architecture

Based on the investigation, here's the recommended approach for each use case:

### Use Azure DevOps REST API (`azure-devops-node-api`) for:
✅ **Primary DevOps Security Operations**:
1. ✅ Listing projects and repositories
2. ✅ Checking Advanced Security enablement
3. ✅ Listing repository-level security alerts
4. ✅ Filtering alerts by DevOps-specific criteria:
   - Alert type (code, secrets, dependencies)
   - Confidence level
   - Dependency name and version
   - Pipeline and phase names
   - Rule ID and tool name
   - Validity (for secrets)
5. ✅ Updating alert status, severity, comments
6. ✅ Closing alerts with dismissal reasons
7. ✅ Adding structured metadata via comments

**Reason**: Native API provides full DevOps functionality with no limitations.

### Use Microsoft Graph Security API for:
✅ **Cross-Platform Security Integration**:
1. ✅ Unified view of security alerts across all Microsoft products
2. ✅ Integration with SIEM/SOAR tools (Sentinel, Splunk, etc.)
3. ✅ Organization-wide security incident management
4. ✅ Aggregated security posture tracking
5. ✅ Threat intelligence sharing

**Use Case Example**: Dashboard showing all security alerts from DevOps, Azure, M365, and third-party tools in one view.

### Use Defender for Cloud API for:
✅ **Azure Infrastructure Security**:
1. ✅ Azure resource security assessments
2. ✅ Cloud workload protection
3. ✅ Compliance and policy management
4. ✅ Security recommendations for Azure resources

**Use Case Example**: Managing security for Azure VMs, storage, databases, etc., separate from code security.

## Hybrid Approach

For comprehensive security management, use all three APIs together:

```
┌─────────────────────────────────────────────────────────┐
│         Your Security Management Application             │
└─────────────────────────────────────────────────────────┘
          │                   │                   │
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Azure DevOps    │ │  Microsoft       │ │  Defender for    │
│  REST API        │ │  Graph Security  │ │  Cloud API       │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • List repos     │ │ • Aggregate      │ │ • Azure resource │
│ • Adv Security   │ │   alerts         │ │   security       │
│ • Code alerts    │ │ • Incidents      │ │ • Compliance     │
│ • Secret alerts  │ │ • SIEM export    │ │ • Policies       │
│ • Dep alerts     │ │ • Threat intel   │ │ • Workload       │
│ • Update status  │ │ • Cross-platform │ │   protection     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Practical Implementation Examples

### Example 1: List All Security Alerts (Unified View)

```javascript
// Get DevOps-specific alerts with full details
const devopsAlerts = await listAzdoAdvancedSecurityAlerts(project, repo);

// Get aggregated view from Graph for SIEM export
const graphAlerts = await graphClient
  .api('/security/alerts')
  .filter("vendorInformation/provider eq 'Azure DevOps'")
  .get();

// Combine for comprehensive view
const allAlerts = mergeAlerts(devopsAlerts, graphAlerts);
```

### Example 2: Update Alert in DevOps and Sync to Graph

```javascript
// Update in DevOps (source of truth)
await azdoClient.updateAlert(alertId, {
  state: 'dismissed',
  comment: 'False positive - test data'
});

// Sync to Graph for SIEM visibility
await graphClient
  .api(`/security/alerts/${graphAlertId}`)
  .patch({
    status: 'resolved',
    comments: ['Resolved in DevOps as false positive']
  });
```

### Example 3: Check Security Posture Across Platforms

```javascript
// Get DevOps security status
const devopsStatus = await checkAdvancedSecurityEnablement();

// Get Azure resource security score
const azureScore = await defenderClient.secureScores.list();

// Get organization secure score from Graph
const graphScore = await graphClient.api('/security/secureScores').get();

// Generate unified report
const securityReport = generateReport(devopsStatus, azureScore, graphScore);
```

## Conclusions and Recommendations (UPDATED)

### Key Findings:

1. **Azure DevOps REST API remains the primary choice** for granular DevOps security tasks:
   - Direct access to repositories without connector setup
   - Full Advanced Security alert filtering (pipeline, phase, rule, tool, validity)
   - Native metadata and comment management
   - No additional Azure infrastructure required

2. **Microsoft Defender for Cloud API provides valuable centralized management**:
   - ✅ Lists DevOps organizations, projects, and repositories via Security Connectors
   - ✅ Provides onboarding state and centralized security overview
   - ✅ Enables PR annotations (actionable remediation)
   - ✅ Aggregates alerts across Azure and DevOps
   - ⚠️ Requires Security Connector setup and onboarding
   - ⚠️ May have less granular filtering than native DevOps API

3. **Microsoft Graph Security API is valuable for**:
   - Cross-platform security monitoring
   - SIEM/SOAR integration
   - Unified incident management
   - Organization-wide security dashboards

### Updated Recommendations:

1. **Use Azure DevOps API (`azure-devops-node-api`) for**:
   - ✅ Daily security operations and alert management
   - ✅ Granular filtering and searching
   - ✅ Quick setup without additional Azure configuration
   - ✅ All 9 tasks in the requirements

2. **Consider adding Defender for Cloud API when you need**:
   - ⭐ Centralized management of multiple DevOps organizations
   - ⭐ Cross-Azure and DevOps security visibility
   - ⭐ PR annotation configuration (security in code reviews)
   - ⭐ Organizational compliance and governance
   - ⭐ Integration with Azure security policies

3. **Consider adding Microsoft Graph Security API for**:
   - ⭐ Cross-platform security dashboards (DevOps + M365 + Azure)
   - ⭐ SIEM export and integration
   - ⭐ Aggregated incident management
   - ⭐ Threat intelligence sharing

### Recommended Architecture (UPDATED):

```
┌─────────────────────────────────────────────────────────────┐
│         Your Security Management Application                 │
└─────────────────────────────────────────────────────────────┘
          │                   │                   │
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Azure DevOps    │ │  Defender for    │ │  Microsoft       │
│  REST API        │ │  Cloud API       │ │  Graph Security  │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ PRIMARY for:     │ │ USE for:         │ │ USE for:         │
│ • Direct repo    │ │ • Centralized    │ │ • Cross-platform │
│   access         │ │   management     │ │   aggregation    │
│ • Alert details  │ │ • DevOps orgs/   │ │ • SIEM export    │
│ • Granular       │ │   projects/repos │ │ • Incidents      │
│   filtering      │ │ • Onboarding     │ │ • Threat intel   │
│ • Update status  │ │   state          │ │ • M365 + Azure   │
│ • Metadata       │ │ • PR annotations │ │   + DevOps view  │
│ • No setup       │ │ • Compliance     │ │                  │
│   required       │ │ • Governance     │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### When to Use Which API:

| Scenario | Recommended API | Reason |
|----------|----------------|--------|
| List all Advanced Security alerts in a repo | Azure DevOps API | Direct access, rich filtering |
| Filter alerts by pipeline/phase/rule | Azure DevOps API | Granular DevOps-specific criteria |
| Update alert status or add comments | Azure DevOps API | Native metadata support |
| Check which repos have Advanced Security enabled | Azure DevOps API | Direct enablement API |
| Get organizational view of DevOps security | Defender for Cloud | Centralized across all orgs |
| Configure PR security annotations | Defender for Cloud | Actionable remediation feature |
| Check which DevOps orgs are onboarded | Defender for Cloud | Onboarding state management |
| Export security data to SIEM | Graph Security | Standardized format |
| Unified view across DevOps + M365 + Azure | Graph Security | Cross-platform aggregation |
| Create security incident from multiple alerts | Graph Security | Incident management |

### Next Steps:

1. **Run exploration scripts** to verify findings:
   ```bash
   # Requires Azure credentials
   node lab/azdo-10-defender-exploration.js
   node lab/azdo-11-graph-exploration.js
   ```

2. **If Graph API is valuable**, create integration scripts:
   - Export DevOps alerts to Graph format
   - Sync alert status between platforms
   - Generate unified security reports

3. **Update package.json** if Graph API will be used:
   ```bash
   npm install --save @azure/identity @microsoft/microsoft-graph-client
   ```

## References

- Azure DevOps REST API: https://learn.microsoft.com/en-us/rest/api/azure/devops/
- Advanced Security Alerts API: https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts
- Microsoft Graph Security API: https://learn.microsoft.com/en-us/graph/security-concept-overview
- Defender for Cloud REST API: https://learn.microsoft.com/en-us/rest/api/defenderforcloud/
- Azure DevOps Node.js API: https://github.com/Microsoft/azure-devops-node-api
- @azure/identity: https://www.npmjs.com/package/@azure/identity
- @azure/arm-security: https://www.npmjs.com/package/@azure/arm-security
- @microsoft/microsoft-graph-client: https://www.npmjs.com/package/@microsoft/microsoft-graph-client
