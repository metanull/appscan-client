# appscan-client application

This project is an application aiming at facilitating triage of vulnerabilities identified by the HCL AppScan Cloud tool and documenting and filing issues in Jira.

It offers two "modes":
- command line: individual commands to allow automation and scripting
- TUI: integrated terminal application 

A third mode: "Web" was added as a tentative, but was later removed (we do not want any left over from it)

Command line was the original mode; although it is pretty complete it probably lags behing the TUI mode , which was further developped.
TUI mode, is a working application, we have used it intensively. It still needs some polishing and has some room for improvement, but it offers all the feature we need.

All are based on the appscan rest api - for which we downloaded the openapi specification and auto-generated a javascript client library.

The project is distributed as a npm package, including binaries. It is meant to be installed "globally" by the users, so that they can run the tool from any terminal in their system (usage of windows 10/11 with powershell 5 or pwsh 7 is assumed).

Typical "triage" workflow (currently done only from the TUI app):
- List appscan applications
- Select an application
- List application's scans
- Select a specific scan OR select "all scans"
- List vulnerabilities in that scan (OR in "all scans")
- Filter vulnerabilities keeping only level LOW or INFORMATIONAL => Select them all and mark them as accepted (see below)
- Filter vulnerabilities keeping only level MEDIUM => Select them all and mark them as accepted (see below)
- Filter vulnerabilities keeping only level HIGH or CRITICAL => Review each vulnerability:
  - Read the vulnerability detail, and the corresponding appscan article (explanations and recommendations for that specific vulnerability)
  - Read the impacted source code portion (when available)
  - Verify if the vulnerability was already reported/filed in Jira:
  - If Already reported (it happens that a vulnerability was already reported separately in Jira and the Jira reference was not added to the vulnerability):
      - Mark the vulnerability as "InProgress"
      - Add the Jira reference to the vulnerability
  - Otherwise, decide how the vulnerability must be handled:
    - False positive
      - Mark the vulnerability as "Noise"
      - Add a Comment
    - True positive
      - If excluded by the Cybersecurity Policy (e.g. Our policy requires handling of CRITICAL and HIGH vulnerabilities only)
        - Mark the vulnerability as "Accepted"
        - Add a comment: "In compliance with CyberSecurity Policy, only CRITICAL+HIGH risk are currently in scope"
      - Otherwise
        - Mark the vulnerability as "InProgress"
        - Add a Comment. When applicable, include a reference to relevant OWASP ASVS Control. E.g. "**Confirmed** [ASVS 1.2.3] Text of the comment"
- When all vulnerabilities are reviewed, filter vulnerabilities keeping all "InProgress" vulnerabilities WITHOUT a Jira reference
- Select them all
- Create Jira issues for each "type" of vulnerability (one distinct jira Story is created for each type, it aggregates/contains all the vulnerabilities of that type; provides documentation about the issue(s) and their remediation(s), links to AppScan, links to AZDO, links to ASVS), the story receives labels: "security", "vulnerability". 
- Open each created Jira Story and do the following manually:
  - Review their Title (e.g. add the Impacted application's name, add "CRITICAL" if applicable)
  - Add Story Links (link to existing Stories to facilitate work assignment and referencing)
  - Set the assignee to "unassigned"
  - Set the parent "Epic"
  - Add labels (e.g. if issue is related to an ASVS control, add its name as a label. E.g. "asvs1.2.3")
  - Edit the description (e.g. if issue is related to an ASVS control, add a Link tile to the Confluence page where that control is documented)

## Required Improvements

- Verify that the cli mode offers the same set of feature as those proposed in TUI mode.
- verify compliance with KISS and DRY principles (avoid code repetition where possible)
- cleanup the doc folder and README.md. It contains way too many files; most of them partially outdated or irrelevant. We need a single and simple README file properly describing the actual application; how to configure it, how to use it (no heuristic, no bloat, no bla bla, not a node course, just plain factual and usefull help (what it does, how to use); with an extra MINOR section: how to build locally (as the right way to use our tool remains to install the npm package globally, and use the "appscan" binary from it from any console)
