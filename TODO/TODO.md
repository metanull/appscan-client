Here is a task list to execute (inline with copilot-instructions).

Proceed systematically and iteratively (Implement Task 1.1; let me review, then Task 1.2, let me review, then Task 2.1 ...)

##Task 1: Comments

We have removed comments that do not meet our instructions; and added JSDoc comments. But we did not process some important folders: src/cli, src/reports, src/tui

1. Remove unnecessary comments from these folders
2. Add jsdoc comments to the functions in these directories, respecting our instructions (comments must also be sufficient to let user understand how to use a function, when a parameter is obscure it must be clarified (like what we did for generate-report.js=>generateReport() ))

## Task 2: FixGroup

AppScan ASoC API supports CorrelationgGroup/FixGroup, defined by application, they can be used to filter issues sharing common properties.

1. Iteratively write a lab function to verify if/how to retrieve the groups and check their structure/content
(iteratively means: implement a basic simple first function - test it works and fix; when working, iterate adding more details+test+fix; until we have all the information we need)
2. Iteratively write a lab function to verify if/how to retrieve application/scan vulnerabilities by fixed groups
3. Add a CLI command to get the list of groups for an application
4. Update the list issues CLI command(s) adding fixgroup to the grouping options
5. In TUI, add the FixGroup list to the list of filters for vulnerabilities
6. In TUI, add the FixGroup list to the grouping options when creating Jira for selected vulnerabilities

## Task 3. Testing

Our codebase is lacking test completelly. We only have 'lab' scripts (small apps asserting implementation details, not actual test) -> we must preserve them untouched

1. Add tests systematically, following our instructions file, for all utils
2. Add tests systematically, following our instructions file, for all CLI commands (assert  proper business logic)
3. Add tests systematically, following our instructions file, for the TUI app navigation (assert proper business logic: right page shown with the right data; data visibility in the layout...)
4. Add tests systematically, following our instructions file, for the TUI app business logic (assert proper business logic: right apis called at the right time)
  