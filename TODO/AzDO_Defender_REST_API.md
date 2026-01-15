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
- Microsoft Graph Security API | https://learn.microsoft.com/en-us/graph/security-concept-overview |