The appscan-client app exposes CLI commands and a TUI interface (both providing similar operations).
Currently it is primarily focusing on interfacing with appscan on cloud (ASoC).
ASoC is a SaaS solution for all application security, it findings in a single service that provides a uniform experience for scanning web, mobile, and desktop applications using dynamic and static techniques.

Our company also uses Azure DevOps (azdo) with Github Advanced Security enabled (GHAS). 
GHAS is a suite of security features GitHub to enhance the security of code repositories. It includes:
- Dependency Graph : Identifies all project dependencies and their vulnerabilities. 
- Code Scanning: Uses CodeQL or third-party tools to find potential security vulnerabilities. 
- Secret Scanning: Detects exposed secrets in repositories
GHAS exposes a REST API allowing to interact with security alerts (the AlertsAPI)

We have verified how to use the AlertAPI for our needs by writing some lab scripts:
- azdo-00-connect-new.js: Connect to the Azdo API
- azdo-01-check-apis-new.js: List available APIs in azdo (AlertsAPI is one of them)
- azdo-02-config-new.js: Get basic information about the connection
- azdo-03-list-projects-new.js: List devops projects
- azdo-04-list-repos-new.js: List git repositories in devops projects
- azdo-05-enablement-api-new.js: Check "advanced security" in devops' Organization, its projects and their repositories
- azdo-06-list-alerts-new.js: List GHAS alerts
- azdo-07-filter-alerts-new.js: List GHAS alerts with support for large number of alerts, filter and grouping
- azdo-08-update-alert.js: Update a GHAS alert (severity; status; comments)
- azdo-09-close-reopen-demo.js: Add metadata to GHAS alert by closing it and using their comments field.
- azdo-12-list-all-secret-alerts.js: Recursively look for all alerts of type "Secret" in the entire orgnization

Create the following new Cli commands:

1. get-azdo-organization: Get the Organization details
2. list-azdo-applications: Get the list of Project (for consistency with other CLI, we refer to AzDO projects to as 'applications')
3. get-azdo-application --appId {projectId|projectName}: Get all the details of a Project
4. list-azdo-repositories --appId {projectId|projectName}: List all repositories in specific project
5. get-azdo-repository --appId {projectId|projectName} --repositoryId {repositoryId|repositoryName}: Get all the details of a Repository
6. list-azdo-issues --appId {projectId|projectName} --repositoryId {repositoryId|repositoryName}: List alerts in a repository (for consistency with other CLI, we refer to AzDO alerts to as 'issues')
   1. optional --type {name} only return alerts of that type (this is an enum)
   2. optional --severity {severity} only return alerts of that severity (this is an enum)
7. list-azdo-by-app --appId {projectId|projectName}: List alerts in all repositories of an application
   1. optional --type {name} only return alerts of that type (this is an enum)
   2. optional --severity {severity} only return alerts of that severity (this is an enum)
8. get-issue-detail --appId {projectId|projectName} --repositoryId {repositoryId|repositoryName} --issueId {alertId}: Get all details of a specific alert
9. update-azdo-issue --appId {projectId|projectName} --repositoryId {repositoryId|repositoryName} --issueId {alertId}: Update an alert's severity or status.
   1.  --severity {severity} If set: change the severity
   2.  --status {status} [--comment {$comment}] If set: change the state of the alert; if the new state is any of the closed state, allow adding an optional comment

Any commands must be leveraging
- the azure-devops-node-api npm package (never perform direct REST calls, not even for fallback)
- lab scripts examples 
  - do not reinvent; labs show how to achieve most operations (but ignore any lab that was not explicitly listed above)
  - do not guess; use the typescript types and the documentation
- existing CLI commands (comply in structure, quality and patterns to existing CLI)
- existing .env/config (rely on the same env files than existing ones)
- existing patterns: support --json (output result as json), reuse existing utils (e.g. logger), ...
- All CLI commands are exposed via the main script (e.g. `node dist/index.js get-applications` for the `get-applications.js` code file)