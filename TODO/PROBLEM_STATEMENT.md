Our organization stores their ICT projects in Azure DevOps. I'm in charge of the security of software.
I'm confronted with the issue that a lot of information is spread in multiple tools. And I'm alone to scan the systems, asess the reports, document the vulnerabilities, and guide the appsec policies.

- Azure DevOps has "Advanced Security" enabled on most projects and repositories. I can see security events in Azure DevOps repositories.
- Defender for Cloud is connected to Azure DevOps, I can see DevOps security events in Defender For Cloud. I have very lkimited knowledge about it, and only use Defender workbooks and GraphQL queries to browse the security events.
- HCL AppScan Cloud is used to run ad-hoc SAST test on recent builds - number of scan is limited per period of time. We use Azure DevOps REST Api to find recent builds, and AppScan REST Api to create related resources (applications and scans) in AppScan. I can see AppScan reported security events in AppScan Cloud.
- HCL AppScan Standard (standalone windows application) is used to run ad-hoc SAST, DAST and IAC scans - number of scans is not limited. I can see reported security events in the AppScan application and manually create Reports for offline reviewing.
- Trivy is used to run ad-hoc dependency scan, and secret scan on recent builds. We use Azure DevOps REST Api to find recent builds and scripting to run trivy on the build artifacts. I can see reported security events in the script's console and manually create reports for offline reviewing
- Jira is used to file, document and assign vulnerability mitigation actions to the development team
- Confluence is used to document security policies and rules. We have a customized set of OWASP ASVS Level 1 Controls documented. For the moment references to relevant ASVS controls are manually added inside the Jira Stories' description field.

It is a tremendous amount of work to triage the security events; update their status; and create the Jira stories.
It is a challenge to assess and verify which of our Azure DevOps projects and repositories are Advanced Security enabled; and almost impossible to verify which of the enabled ones are actually using it properly (Advanced Security properly configured, running on any code merge, and blocking build and deployment pipelines in case of issues)

I have started developping some applications to help me do the triage (from triaging/categorizing alerts to creating Jira stories):
- This very project (E:\appscan-client) uses AppScan cloud API to display all the security events from AppScan cloud. It facilitates display, triaging (changing status, adding comment), and filing to Jira. It uses AppScan Cloud's "ExternalId" feature to store a reference to Jira in the related security vulnerabilities (it permit backtracking from the vulnerability to the remediation action)
- The CyberSecurityTools project (E:\CyberSecurityTools) uses Azure DevOps API to list our organization's Projects, Repositories and Builds; and to create corresponding resources in AppScan Cloud (Applications, Scans). The tool contains several versions of the work, the right one for reference is the sast-linux one (it uses a linux Docker container to run shell and node scripts).
- APPSCAN Cloud offer a REST API, we have already created a stable npm client package to itneract with it (in this very project)
- I have just found a ready made npm package to interact with Azure DevOps' REST API, but didn't start u sing it yet [azure-devops-node-api](https://www.npmjs.com/package/azure-devops-node-api).
- I have not investigated Defender for cloud REST API possibilities yet, but I know they provide GraphQL queries (I have only used them via defender's web interface), and "Workbook" (which I believe is a tool primarily aimed at performing triage from within Defender for cloud); 
- Both Azure DevOps and Defender for Cloud have feature to file work; but through Microsoft's proprietary work management tool. Not natively integrating with Jira.

I want to go further on three tracks (sorted by priority/importance from the lower to the highest):
1. Assessing our DevOps projects and repositories "Advanced Security" enablement
2. Automating launch of add-hoc scans:
  1. On DevOps builds, with trivy (script based)
  2. On DevOps builds, with appscan standard (currently fully manual through AppScan Standard's UI)
  3. On DevOps builds, with appscan cloud (API based)
3. Triaging and filing issues: review vulnerabilities; close false-positive/accept low level true-positive/file true-positive to development team. Because of my limited knowledge I have difficulties deciding if:
  1. I should keep on developping an application (like this very project) less powerfull, but tailormade to my needs
  2. Invest in learning Defender for Cloud and use it as primary tool... which I'd consider only if I can easily crete Jira stories for groups of similar vulnerabilities; documenting them automatically (app scan does provide remediation articles); and keeping track from the finding to the jira story and vice-versa - ideally being informed when a jira is closed so that I can validate the fix in some way. 