## Context

My company develops many software applications. 
Their source control is powered by Azure DevOps (cloud) and its Git repository.
Every product have their own DevOps Project; and consists in 1 or more Repositories.

All DevOps projects are (or should be) configured and connected to Azure Defender fo Cloud.
All DevOps pipelines are (or should be) using Microsoft Advanced Security and other plugins to identify security threats (three categories: Secrets, Code, Dependencies) and to report to Defender For Cloud.

This very project is helping me to work with Security Threats in our projects. Currently it uses exclusively the AppScan On Cloud (AsOC) service; I want to extend it.

## Objectives

Create node.js "lab" scripts to assess and discover if and how to perform the following operations:

### 1. Scripts Querying Azure DevOps

1. Connect to Azure DevOps REST API
2. Get information about the connection, about devops configuration
3. List Azure DevOps Projects
4. List Azure DevOps Projects' repositories
5. Assert enablement (or lack of enablement) of Microsoft Advanced Security in Azure DevOps repositories
6. List alerts in Azure DevOps Projects
7. List security threats in Azure DevOps Projects by "category"; identify criteria we can use to categorize, filter, search the list.
8. Update security threats in Azure DevOps Projects (change categorization/status/severity/comment)
9. Link (e.g. add metadata) to security threats to allow cross referencing between the reported vulnerability and linked work and references (e.g. Jira stories, URL, ...)

### 2. Scripts Querying Defender For Cloud's

1. Connect to Defender for Cloud
2. Get information about the connection, about devops configuration
3. Get information about DevOps configuration VIA Defender for Cloud
4. List Azure DevOps Projects  VIA Defender for Cloud
5. List Azure DevOps Projects' repositories  VIA Defender for Cloud
6. List security threats in Azure DevOps Projects by "category"; identify criteria we can use to categorize, filter, search the list.
7. Assert connection (or lack of connection) of Azure DevOps repositories with Defender for Cloud
8. Run GraphQL queries on Azure to query Defender for Cloud and DevOps Security
9. List security threats in Azure DevOps Projects VIA Defender for Cloud
10. Update security threats in Azure DevOps Projects (change categorization/status/severity/comment) VIA Defender for Cloud


## Constraints

Approach the work progressively and iteratively; starting from the simplest, verifying success, gathering insight, then moving on to the next need.
Prefer using existing library (https://github.com/Microsoft/azure-devops-node-api) over custom development
KISS & DRY: work iteratively, making sure to preserve similar patterns, and prefer reusing proven working approaches over inventing new ones.
- Test connection with the API

## References (must read)

- Azure DevOps REST API | https://learn.microsoft.com/en-us/rest/api/azure/devops/ |
- Azure DevOps Node.js API | https://github.com/Microsoft/azure-devops-node-api |
- Advanced Security Alerts API | https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts |
- Defender for Cloud REST API | https://learn.microsoft.com/en-us/rest/api/defenderforcloud/ |
- Microsoft Graph Security API | https://learn.microsoft.com/en-us/graph/security-concept-overview

---

## Lab: Azure DevOps connectivity test

A minimal lab script has been added to verify connectivity against Azure DevOps using the official node client `azure-devops-node-api`.

Files added:

- `lab/azdo-auth.js` — simple helper that reads env variables and returns a connected `WebApi` client. It also exports `listAzdoProjects()`.
- `lab/test-azdo-connection.js` — executable script that lists projects and prints them to stdout.
- `tests/test-azdo-connection.spec.js` — Vitest test that runs `listAzdoProjects()`; it will be skipped when required env vars are not set.

Required environment variables (set in your `.env` or CI environment):

You can use either the `AZDO_*` names or the `AZURE_DEVOPS_*` names already present in some environments.

- `AZDO_ORG_URL` or `AZDO_OR` or (`AZURE_DEVOPS_BASE_URL` + `AZURE_DEVOPS_ORG`) — Azure DevOps organization URL (e.g., `https://dev.azure.com/<org>`)
- `AZDO_PAT` or `AZDO_PERSONAL_ACCESS_TOKEN` or `AZURE_DEVOPS_PAT` — Personal Access Token with appropriate scopes (read access to the organization and projects)

Note: The helper will accept any of the above variants; if you use `AZURE_DEVOPS_BASE_URL` and `AZURE_DEVOPS_ORG` the script will compose the org URL automatically.

Usage:

- Install the new dependency: `npm install --save azure-devops-node-api`
- Run the quick script: `node lab/test-azdo-connection.js`
- Run tests (skipped if env vars missing): `npm test -- tests/test-azdo-connection.spec.js`

Next steps:

- Add scripts to enumerate repositories and check Advanced Security enablement per-repository (implemented: `lab/azdo-repos.js`)
- Add scripts to list Advanced Security alerts (implemented: `lab/azdo-adv-alerts.js` / `lab/azdo-adv.js`)
  - Uses documented advsec host and alerts API: `GET https://advsec.dev.azure.com/{organization}/{project}/_apis/alert/repositories/{repository}/alerts?api-version=7.2-preview.1`
  - Example: `https://advsec.dev.azure.com/EESC-CoR/MembersPortal/_apis/alert/repositories/49ecea0e-70c3-43d7-8a49-7f90c394c2c1/alerts?api-version=7.2-preview.1`
  - Added `tests/test-azdo-adv-alerts.test.js` which exercises this API (skips when env is missing)
  - The probe `lab/azdo-adv-troubleshoot.js` was extended to try the advsec host and documented path variants
- Add Defender for Cloud exploration scripts (GraphQL / REST)
- implement Advanced Security alert enumeration and a summary report listing repositories missing Advanced Security.

|