This app allows triaging security issues from multiple tools, and offers
- a TUI ASOC app lists Applications > Scans > Vulnerabilities from Appscan On Cloud and update their statuses
- a TUI AZDO app lists Projects > Repositories > Alerts from AzureDev Ops and update their statuses
- Cli commands deliver similar capabilities than the TUI apps

I want to add a third input after ASOC and AZDO: Detectify


- Detectify offers an API: https://developer.detectify.com/v2#tag/vulnerabilities
- Detectify organizes the information in a different way: All the vulnerabilities are available at the first level (no need to select Application/Project, then Scan/Repository).
- Detectify offers dedicated methods to SET and UNSET Status (set/unset Accepted, set/unset False Positive, set/unset Fixed); it doesn't seems to allow setting a comment or adding metadata to the vulnerability (e.g. no way to store the JIRA ID inside the vulnerability itself)

Taking example on the existing azdo/asoc equivalent, Create CLI commands to:
- list detectify vulnerabilities
- get details of a vulnerability
- change status of a vulnerability

I have already added my API key for detectify to the .env file

Analyze the request and detectify API.
Before implementing the request create and test the capabilities of Detectify API and how it maps with existing concepts by creating and running small "lab" scripts - following the patterns used in  existing ones
