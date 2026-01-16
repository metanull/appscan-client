# Defender for Cloud DevOps API - Quick Reference

## Overview

Microsoft Defender for Cloud **DOES** provide DevOps management capabilities through the **Defender for Cloud Composite API**. This was initially missed in the investigation but has been corrected.

## API Endpoints for DevOps

### Base URL
```
https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Security/securityConnectors/{securityConnectorName}/devops/default/
```

### Key Endpoints

| Operation | Endpoint | Purpose |
|-----------|----------|---------|
| List Organizations | `.../azureDevOpsOrgs` | List onboarded DevOps organizations |
| Get Organization | `.../azureDevOpsOrgs/{orgName}` | Get specific organization details |
| List Projects | `.../azureDevOpsOrgs/{orgName}/projects` | List projects in an organization |
| Get Project | `.../azureDevOpsOrgs/{orgName}/projects/{projectName}` | Get specific project details |
| List Repositories | `.../azureDevOpsOrgs/{orgName}/projects/{projectName}/repos` | List repositories in a project |
| Get Repository | `.../azureDevOpsOrgs/{orgName}/projects/{projectName}/repos/{repoName}` | Get specific repository details |

### Alerts Endpoint
```
https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/alerts?api-version=2022-01-01
```

## What You Can Do

### ✅ DevOps Resource Management
- List Azure DevOps organizations connected to Defender
- List projects within organizations
- List repositories within projects
- View repository properties (ID, URL, visibility)
- Check onboarding/provisioning state

### ✅ Security Configuration
- Configure actionable remediation (PR annotations)
- Set branch configuration for security feedback
- Configure category-based severity levels
- Manage inherit-from-parent settings

### ✅ Alert Management
- List all security alerts (including DevOps)
- Filter alerts by severity, status
- Update alert status (Active, InProgress, Resolved, Dismissed)
- View alert details and remediation steps

### ✅ Onboarding State Tracking
States: `NotApplicable`, `OnboardedByOtherConnector`, `Onboarded`, `NotOnboarded`

## What You Cannot Do (or is Limited)

### ⚠️ Granular Alert Filtering
Native DevOps API provides more detailed filtering:
- Pipeline name and phase
- Rule ID and tool name
- Dependency name and validity
- Keyword search
- Modified since date

Defender API has broader alert filtering but may lack DevOps-specific criteria.

### ⚠️ Direct Repository Operations
Cannot directly:
- Create or delete repositories
- Check Advanced Security enablement API
- Configure Advanced Security settings per repo

### ⚠️ Comment/Metadata Management
Limited structured metadata compared to native DevOps API comments.

## Prerequisites

### 1. Enable Defender for DevOps
- Azure subscription with Defender for Cloud
- Defender for Cloud DevOps plan enabled
- Resource group for security resources

### 2. Create Security Connector
In Azure Portal:
1. Go to Defender for Cloud
2. Environment settings
3. Add connector > DevOps
4. Connect your Azure DevOps organization
5. Select projects/repositories to onboard

### 3. Authentication
- Service Principal with permissions:
  - `Security Reader` or `Security Admin` on subscription
  - Access to resource group containing security connector

### 4. Environment Variables
```bash
AZURE_SUBSCRIPTION_ID=<subscription-id>
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
AZURE_CLIENT_SECRET=<client-secret>
AZURE_RESOURCE_GROUP=<resource-group-with-connector>
AZURE_SECURITY_CONNECTOR=<connector-name>
AZURE_DEVOPS_ORG=<devops-org-name>
```

## NPM Package

Currently, the full DevOps endpoints are not available in `@azure/arm-security` SDK.

**Solution**: Use REST API directly with `@azure/identity` for authentication.

```javascript
import { ClientSecretCredential } from '@azure/identity';
import fetch from 'node-fetch';

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const token = await credential.getToken('https://management.azure.com/.default');

const response = await fetch(
  `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Security/securityConnectors/${connectorName}/devops/default/azureDevOpsOrgs/${orgName}/projects?api-version=2024-04-01`,
  {
    headers: { 'Authorization': `Bearer ${token.token}` }
  }
);

const data = await response.json();
```

## API Versions

- DevOps operations: `2024-04-01`
- Alerts operations: `2022-01-01`

## Example Response: List Repositories

```json
{
  "value": [
    {
      "id": "/subscriptions/.../repos/myRepo",
      "name": "myRepo",
      "type": "Microsoft.Security/securityConnectors/devops/azureDevOpsOrgs/projects/repos",
      "properties": {
        "parentOrgName": "myOrg",
        "parentProjectName": "myProject",
        "repoId": "cb64ab91-c9ba-46df-b44c-c769358bccdf",
        "repoUrl": "https://dev.azure.com/myOrg/myProject/_git/myRepo",
        "visibility": "private",
        "onboardingState": "Onboarded",
        "provisioningState": "Succeeded",
        "actionableRemediation": {
          "state": "Enabled",
          "branchConfiguration": {
            "annotateDefaultBranch": "Enabled",
            "branchNames": ["main", "develop"]
          },
          "categoryConfigurations": [
            {
              "category": "Secrets",
              "minimumSeverityLevel": "High"
            },
            {
              "category": "Code",
              "minimumSeverityLevel": "Medium"
            }
          ]
        }
      }
    }
  ]
}
```

## When to Use Defender for Cloud API vs Native DevOps API

### Use Defender for Cloud API when:
- Need centralized view across multiple DevOps organizations
- Managing security onboarding and governance
- Configuring PR security annotations (actionable remediation)
- Integrating with Azure security policies and compliance
- Need unified view with other Azure security resources

### Use Native Azure DevOps API when:
- Need granular alert filtering (pipeline, phase, rule, tool)
- Direct repository and Advanced Security management
- Checking Advanced Security enablement per repository
- Adding structured metadata to alerts
- Quick access without Azure infrastructure setup

### Use Both when:
- Large organization with multiple DevOps organizations
- Need both operational details AND governance/compliance
- Want PR annotations but also need detailed alert management

## References

- [Defender for Cloud Composite API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/)
- [Azure DevOps Orgs API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-orgs)
- [Azure DevOps Projects API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-projects)
- [Azure DevOps Repos API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-repos)
- [Alerts API](https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/alerts)
- [Defender for DevOps Documentation](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction)

## Testing Scripts

Created exploration scripts to test the API:
- `lab/azdo-10-defender-exploration.js` - Tests Defender for Cloud DevOps endpoints
- `lab/azdo-11-graph-exploration.js` - Tests Microsoft Graph Security API
- `lab/AZURE_SECURITY_APIs_INVESTIGATION.md` - Full investigation report
