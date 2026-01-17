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

---

make another version of the lab script exapnded to:
- use each of the filter criteria in sequence => assert if they can be used/how.
- use each of the grouping criteria  => assert if they can be used/how.
- use pagination and expansion  to fetch all alerts for an entire project ( from all its repos)
- use pagination and expansion  to fetch all alerts for an entire organization ( from all its projects and all their repos)

---

We have the package "https://github.com/microsoft/azure-devops-node-api" installed
It supports the "Advanced Security Alert" API.

We have created azdo-06-alert-client.js script that  uses EXCLUSIVELY the npm package to 
1. List Projects
2. List repositories in project with name = MembersPortal
3. List Advanced Security Alerts in each of these repositories
Save that script as `lab/azdo-06-alerts-client.js`

Create azdo-06-alert-client-all.js script that  uses EXCLUSIVELY the npm package to 
1. List Projects
2. List repositories in project with name = MembersPortal
3. List **all** (using the continuation token) the Advanced Security Alerts in each of these repositories

`labs` contains scripts that interact with the API:
- you may inspect there code
- You may run the `labs` scripts
- You must NOT include any of the existing labs in the solution; we want a single self contained script.
- You must use the existing .env 

If options in the npm client package are unclear, check the documentation of the API it supports: Documentation of the API: https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/list?view=azure-devops-rest-7.2

---

We have the package "https://github.com/microsoft/azure-devops-node-api" installed
It supports the "Advanced Security Alert" API.

We have created azdo-06-alert-client.js script that  uses EXCLUSIVELY the npm package to 
1. List Projects
2. List repositories in project with name = MembersPortal
3. List Advanced Security Alerts in each of these repositories
Save that script as `lab/azdo-06-alerts-client.js`

We have created azdo-06-alert-client-all.js that does the exact same but uses continuation token to retrieve ALL alerts.

We have Created azdo-07-filter-alert-rest.js script that useing REST calls to 
1. List Projects
2. List repositories in project with name = MembersPortal
3. For each of these repositories:
   1. Alert Type:
      1. List distinct criteria.alertType
      2. List the first 3 alerts matching the first criteria.alertType
   2. Confidence Level:
      1. List distinct criteria.confidenceLevel
      2. List the first 3 alerts matching the first criteria.confidenceLevel
   3. Dependency Name:
      1. List distinct criteria.dependencyName
      2. List the first 3 alerts matching the first criteria.dependencyName
   3. From Date:
      1. List distinct criteria.fromDate
      2. List the first 3 alerts occured after the first of June 2025
   4. Keyword:
      1. List distinct criteria.keywords
      2. List the first 3 alerts matching the first criteria.keywords
   5. Pipeline Name:
      1. List distinct criteria.pipelineName
      2. List the first 3 alerts matching the first criteria.pipelineName
	  3. List distinct criteria.phaseName for the first criteria.pipelineName
	  4. List the first 3 alerts matching the first criteria.phaseName
   6. Rule Name:
      1. List distinct criteria.ruleId, criteria.ruleName
      2. List the first 3 alerts matching the first criteria.ruleId
   7. To Date:
      1. List distinct criteria.toDate
      2. List the first 3 alerts occured before the first of June 2025
   8. Tool Name:
      1. List distinct criteria.ruleId, criteria.toolName
      2. List the first 3 alerts matching the first criteria.toolName
   9. Secrets:
      1. List distinct criteria.validity
      2. List the first 3 alerts matching the first criteria.validity
   10. Dependencies:
      1. List distinct criteria.ruleId, criteria.dependencyName
      2. List the first 3 alerts matching the first criteria.dependencyName
   11. Alert ID:
      1. List distinct criteria.alertId
      2. List the first 3 alerts matching the first criteria.alertId
   12. Modified Since:
      1. List distinct criteria.modifiedSince
      2. List the first 3 alerts modified after the first of June 2025
   13. Ordering:
      1. Display the first three alerts, sorting by Id
	  2. Display the first three alerts, sorting by firstSeen
	  3. Display the first three alerts, sorting by lastSeen
	  4. Display the first three alerts, sorting by fixedOn
	  5. Display the first three alerts, sorting by severity
   14. Top:
      1. Display the first 10 alerts using top, sorting by Id
	  2. Display the first 10 alerts using top, sorting by severity
	  
Create azdo-07-filter-alert-client.js script that mimics azdo-07-filter-alert-rest.js but using EXCLUSIVELY the npm package (no direct REST calls)!

`labs` contains scripts that interact with the API:
- you may inspect there code
- You may run the `labs` scripts
- You must NOT include any of the existing labs in the solution; we want a single self contained script.
- You must use the existing .env 


---

We have the package "https://github.com/microsoft/azure-devops-node-api" installed
It supports the "Advanced Security Alert" API.

We have created azdo-xx-*.js script that uses EXCLUSIVELY the npm package to 

1. Connect to Azure DevOps REST API
2. Get information about the connection, about devops configuration
3. List Azure DevOps Projects
4. List Azure DevOps Projects' repositories
5. Assert enablement (or lack of enablement) of Microsoft Advanced Security in Azure DevOps repositories
6. List alerts in Azure DevOps Projects
7. List security threats in Azure DevOps Projects by "category"; identify criteria we can use to categorize, filter, search the list.
8. Update security threats in Azure DevOps Projects (change categorization/status/severity/comment)
9. Close alerts with a reason and structured comment (for metadata)

We also have access to Azure and  Defender for Cloud
- Defender for Cloud REST API | https://learn.microsoft.com/en-us/rest/api/defenderforcloud/ |
- Microsoft Graph Security API | https://learn.microsoft.com/en-us/graph/security-concept-overview

Investigate what options we have to use these two apis in order to perform the 9 tasks described above.
You must no not change the existing code; but you can interrogate web resources and create small node js scripts to verify your assumptions
Preferably use well supported NPM package to interact with the API (if any exists, instead of writing direct API calls)


Note: `labs` contains scripts that interact with the API:
- you may inspect there code
- You may run the `labs` scripts
- You must NOT include any of the existing labs in the solution; we want a single self contained script.
- You must use the existing .env 
- You must use the client package to interact with AZDO
- You must NEVER use direct REST API requests to interact with AZDO
- We are unaware of client packages to itneract with Defender and Azure Cloud (but some may exist!)

---

Resource about Defender For Cloud REST API for devOps:
https://learn.microsoft.com/en-us/rest/api/defenderforcloud/?view=rest-defenderforcloud-composite-stable
https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/alerts?view=rest-defenderforcloud-composite-stablehttps://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-repos/list?view=rest-defenderforcloud-composite-stable&tabs=HTTP
https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-projects?view=rest-defenderforcloud-composite-stable
https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/azure-devops-orgs?view=rest-defenderforcloud-composite-stable
https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/devops-configurations?view=rest-defenderforcloud-composite-stable
https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/devops-operation-results?view=rest-defenderforcloud-composite-stable

---

We have the package "https://github.com/microsoft/azure-devops-node-api" installed
It supports the "Advanced Security Alert" API.

We have created azdo-xx-*.js script that uses EXCLUSIVELY the npm package to 

1. Connect to Azure DevOps REST API
2. Get information about the connection, about devops configuration
3. List Azure DevOps Projects
4. List Azure DevOps Projects' repositories
5. Assert enablement (or lack of enablement) of Microsoft Advanced Security in Azure DevOps repositories
6. List alerts in Azure DevOps Projects
7. List alerts in Azure DevOps Projects by "category"
8. Update security threats in Azure DevOps Projects (change categorization/status/severity/comment)
9. Close alerts with a reason and structured comment (for metadata)
10. out-of-scope
11. out-of-scope

Using this information create a script that displays all alerts of category "secret" in our entire organization.
The script must use GetAlerts using filtering to retrieve Alerts of type "secret", and must use continuationToken to make sure that all matching alerts are displayed.
For each alert, also provide the alert URL to permit inspection in AzDO's web interface

script must use chalk for display. there must be no banner and no summary to the output. only the progress bar, then the list of alerts (or, in case of error, an exception)
Display also the physicallocation of the alert (physicalLocation.Region), the Tool, the Dismissal

PhysicalLocation has a rregion property with line and column details, they must be displayed as well next to each location
PhysicalLocation has a versionControl property with the git ItemUrl and gitCommit hash, they must be displayed after each location

add paramters to the script to allow display/hide some fields fields:
--withLocation: if present print the Location field, otherwise, don't
--withCommit: if present print the commit field, otherwise, don't
--withGitUrl: if present print the Git URL, otherwise, don't


Note: `labs` contains scripts that interact with the API:
- you may inspect there code
- You may run the `labs` scripts
- You must NOT include any of the existing labs in the solution; we want a single self contained script.
- You must use the existing .env 
- You must use the client package to interact with AZDO
- You must NEVER use direct REST API requests to interact with AZDO
- You MUST use filtering  and rely on the npm client to retrieve secrets
- You must rely on the documentation to find out how to identify secrets (e.g. using the AlertInterfaces.AlertType enum):
  - https://github.com/microsoft/azure-devops-node-api/blob/master/api/interfaces/AlertInterfaces.ts
  - https://github.com/microsoft/azure-devops-node-api/blob/master/api/AlertApi.ts
  - https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/list?view=azure-devops-rest-7.2



---

We have the package "https://github.com/microsoft/azure-devops-node-api" installed
It supports the "Advanced Security Alert" API.

We have created azdo-xx-*.js script that uses EXCLUSIVELY the npm package to 

1. Connect to Azure DevOps REST API
2. Get information about the connection, about devops configuration
3. List Azure DevOps Projects
4. List Azure DevOps Projects' repositories
5. Assert enablement (or lack of enablement) of Microsoft Advanced Security in Azure DevOps repositories
6. List alerts in Azure DevOps Projects
7. List alerts in Azure DevOps Projects by "category"
8. Update security threats in Azure DevOps Projects (change categorization/status/severity/comment)
9. Close alerts with a reason and structured comment (for metadata)
10. out-of-scope
11. out-of-scope
12. list all alerts of type 'secret'

Add a new script, based on the existing 12 (list secret) that lists all secrets in the organization.
It queries each repository in each project in the organization for alert of type secret. But in a different way than 12:
For each alert, it uses the gitApi's getBlobContent to retrieve the file's content with secrets (beware that the same file may be  referenced several times in one alert; we should  download each file only  once!)
Then it extracts the impacted line from the bloc (line numbers can be extracted from the field PhysicalLocation.VersionControl.itemUrl.; that url has a line and a lineEnd parameter)
The script then outputs, the Alert as follows:
```
## {Project}, {Repository}
### {Alert Number[0]}, {Title[0]}
{line number[0]}. {Lines[0]}
{line number[1]}. {Lines[1]}

### {Alert Number[1]}, {Title[1]}
{line number[0]}. {Lines[0]}
{line number[1]}. {Lines[1]}

...
```
Output should be produced as soon as possible, without buffering.
There should be no banner, no footer and no progress bar; script just prints the data as it it becomes available

Note: `labs` contains scripts that interact with the API:
- you may inspect there code
- You may run the `labs` scripts
- You must NOT include any of the existing labs in the solution; we want a single self contained script.
- You must use the existing .env 
- You must use the client package to interact with AZDO
- You must NEVER use direct REST API requests to interact with AZDO
- You MUST use filtering  and rely on the npm client to retrieve secrets
- You must rely on the documentation to find out how to identify secrets (e.g. using the AlertInterfaces.AlertType enum):
  - https://github.com/microsoft/azure-devops-node-api/blob/master/api/interfaces/AlertInterfaces.ts
  - https://github.com/microsoft/azure-devops-node-api/blob/master/api/AlertApi.ts
  - https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/list?view=azure-devops-rest-7.2