import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { AppScanService } from '../../services/appscan-service.js';
import { JiraService } from '../../services/jira-service.js';
import { Config } from '../../utils/config.js';
import {
  groupIssuesByType,
  displayGroupedSummary,
  promptScanSelection,
  promptGroupSelection,
  promptIssueSelection,
  promptStatusChange,
  promptComment,
  promptAction,
  promptJiraCreation,
  displaySuccess,
  displayError,
  displayInfo,
  calculateIssueStats,
} from '../../utils/triage-ui.js';

/**
 * Create JIRA issue for vulnerabilities (extracted to avoid duplication)
 */
async function createJiraIssueForVulnerabilities(
  mediumOrHigher,
  selectedScanId,
  scans,
  config,
  service
) {
  const jiraService = new JiraService(config);
  const baseUrl = config.getBaseUrl();

  // Get scan details for JIRA issue
  const scan = scans.find((s) => s.Id === selectedScanId);
  const scanName = scan?.Name || selectedScanId;

  // Build issue summary
  const stats = calculateIssueStats(mediumOrHigher);
  const summary = `[Security] ${scanName} - ${mediumOrHigher.length} vulnerabilities (C:${stats.Critical} H:${stats.High} M:${stats.Medium})`;

  // Build compact JIRA description to avoid 32KB limit
  const { convertToAbsoluteUrl } = await import('../../utils/url-converter.js');

  let description = `## Summary\n`;
  description += `- Total: ${mediumOrHigher.length} vulnerabilities\n`;
  description += `- Critical: ${stats.Critical} | High: ${stats.High} | Medium: ${stats.Medium}\n\n`;

  description += `## Issues\n\n`;

  const jiraGroups = groupIssuesByType(mediumOrHigher);

  // Helper to extract short path for display
  const extractShortPath = (url) => {
    if (!url) return 'N/A';
    const pathMatch = url.match(/[?&]path=([^&]+)/);
    if (pathMatch) {
      const path = decodeURIComponent(pathMatch[1]);
      const parts = path.replace(/^\//, '').split('/');
      return parts.length > 3 ? parts.slice(-3).join('/') : parts.join('/');
    }
    const parts = url.split('/').filter((p) => p && !p.startsWith('?'));
    return parts.length > 3 ? parts.slice(-3).join('/') : parts.join('/');
  };

  for (const group of jiraGroups) {
    description += `### ${group.type} (${group.severity}) - ${group.issues.length} issue(s)\n\n`;

    for (const issue of group.issues) {
      const location =
        issue.SourceFileUri || issue.Location || issue.Api || 'N/A';
      const absoluteUrl = convertToAbsoluteUrl(location, baseUrl);
      const shortPath = extractShortPath(location);
      const line = issue.LineNumber ? `:${issue.LineNumber}` : '';

      // Format: [Severity] [short/path/to/file:line](absolute-url)
      description += `- [${issue.Severity}] [${shortPath}${line}](${absoluteUrl})`;

      // Add code context as inline code if available (better for JIRA ADF)
      if (issue.Context) {
        const context = issue.Context.substring(0, 150)
          .replace(/\n/g, ' ')
          .trim();
        description += ` → \`${context}${issue.Context.length > 150 ? '...' : ''}\``;
      }

      description += `\n`;
    }

    // Add remediation link for this specific issue type
    if (group.issues.length > 0 && group.issues[0].IssueTypeId) {
      const articleUrl = `${baseUrl}/api/v4/Reports/Article/?issuetype=${group.issues[0].IssueTypeId}`;
      description += `\n**Remediation:** [View guidance for ${group.type}](${articleUrl})\n`;
    }

    description += `\n`;
  }

  // Add AppScan comments in quote blocks (excluding duplicates)
  const uniqueComments = new Set();
  for (const issue of mediumOrHigher) {
    if (issue.Comment && issue.Comment.trim()) {
      uniqueComments.add(issue.Comment.trim());
    }
  }

  if (uniqueComments.size > 0) {
    description += `\n## AppScan Comments\n\n`;
    for (const comment of uniqueComments) {
      description += `> ${comment.replace(/\n/g, '\n> ')}\n\n`;
    }
  }

  const projectKey = config.getJiraProjectKey();
  const jiraIssue = await jiraService.createIssue(
    projectKey,
    summary,
    description,
    'Story',
    {
      labels: ['vulnerability', 'security'],
    }
  );

  displaySuccess(`JIRA issue created: ${jiraIssue.key}`);
  console.log(
    chalk.cyan('View issue at:'),
    chalk.blue.underline(
      jiraIssue.url || `${config.getJiraHost()}/browse/${jiraIssue.key}`
    )
  );

  // Link JIRA issue to AppScan issues via ExternalId
  console.log(chalk.gray('\nLinking JIRA issue to AppScan vulnerabilities...'));
  const issueIdsToLink = mediumOrHigher.map((i) => i.Id);
  try {
    await service.bulkUpdateIssues(issueIdsToLink, null, null, jiraIssue.key);
    console.log(
      chalk.green(
        `✓ Linked ${issueIdsToLink.length} issues to ${jiraIssue.key}\n`
      )
    );
  } catch (error) {
    console.log(
      chalk.yellow(`⚠ Could not link issues to JIRA: ${error.message}\n`)
    );
  }

  return jiraIssue;
}

export async function triage(options) {
  try {
    // Load configuration
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();

    // Check if configuration is valid
    if (!config.isValid()) {
      displayError('Configuration not found or incomplete!');
      console.log(
        chalk.yellow('Please run:'),
        chalk.cyan('appscan setup'),
        chalk.yellow('to configure your credentials.\n')
      );
      process.exit(1);
    }

    const service = new AppScanService(config);

    console.log(chalk.blue.bold('\n🔍 AppScan Vulnerability Triage\n'));
    console.log(chalk.gray('Authenticating...'));
    await service.authenticate();
    displaySuccess('Authenticated successfully');

    // Main triage loop
    let continueTriaging = true;

    while (continueTriaging) {
      // Step 1: Load and display all scans (no pagination, no extra API calls for performance)
      console.log(chalk.cyan('\n📋 Loading scans...\n'));
      const scansResponse = await service.listScans();
      let scans = scansResponse.Items || [];

      // Filter by scan type if specified
      if (options.scanType) {
        const allowedTypes = [
          'StaticAnalyzer',
          'DynamicAnalyzer',
          'ScaAnalyzer',
        ];
        if (!allowedTypes.includes(options.scanType)) {
          displayError(
            `Invalid scan type. Allowed values: ${allowedTypes.join(', ')}`
          );
          return;
        }
        scans = scans.filter((s) => s.Technology === options.scanType);
        console.log(chalk.gray(`Filtered to ${options.scanType} scans only\n`));
      }

      if (scans.length === 0) {
        displayInfo('No scans found.');
        break;
      }

      // Sort scans alphabetically by name
      scans.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

      console.log(chalk.gray(`Found ${scans.length} scan(s)\n`));

      // Format scan choices with app name and scan type
      const scanChoices = scans.map((scan) => {
        const appName = scan.AppName || 'Unknown App';
        const scanType = scan.Technology || 'Unknown';
        const scanDate = new Date(
          scan.LatestExecution?.ExecutionEnd || scan.CreatedAt
        ).toLocaleDateString();
        const typeColor =
          scanType === 'StaticAnalyzer'
            ? 'cyan'
            : scanType === 'DynamicAnalyzer'
              ? 'magenta'
              : scanType === 'ScaAnalyzer'
                ? 'yellow'
                : 'gray';

        return {
          name: `${chalk.gray(appName)} ${chalk[typeColor](`[${scanType}]`)} ${scan.Name} ${chalk.gray(`(${scanDate})`)}`,
          value: scan.Id,
          short: scan.Name,
        };
      });

      scanChoices.push({
        name: chalk.yellow('✕ Exit triage'),
        value: 'EXIT',
        short: 'Exit',
      });

      // Step 2: Select a scan
      const selectedScanId = await promptScanSelection(scanChoices);

      if (selectedScanId === 'EXIT') {
        console.log(chalk.cyan('\n👋 Exiting triage. Goodbye!\n'));
        break;
      }

      // Step 3: Check for existing JIRA issue for this scan
      let existingJiraIssue = null;
      if (config.isJiraValid()) {
        try {
          const jiraService = new JiraService(config);
          const projectKey = config.getJiraProjectKey();
          const selectedScan = scans.find((s) => s.Id === selectedScanId);
          if (selectedScan) {
            existingJiraIssue = await jiraService.findIssueForScan(
              selectedScan.Name,
              projectKey
            );
            if (existingJiraIssue) {
              console.log(
                chalk.green('\n🎫 Existing JIRA issue found:'),
                chalk.blue.underline(existingJiraIssue.url)
              );
              console.log(chalk.gray(`   Status: ${existingJiraIssue.status}`));
            }
          }
        } catch {
          // Ignore errors
        }
      }

      // Step 3: Load issues for selected scan
      console.log(chalk.cyan('\n📥 Loading issues...\n'));
      const issuesResponse = await service.listIssues(
        selectedScanId,
        'Noise,Fixed,Passed'
      );
      let issues = issuesResponse.Items || [];

      if (issues.length === 0) {
        displaySuccess('No open issues found in this scan!');
        continue;
      }

      // Display scan link
      if (issues.length > 0 && issues[0].ApplicationId) {
        const baseUrl = config.getBaseUrl();
        const scanUrl = `${baseUrl}/main/myapps/${issues[0].ApplicationId}/scans/${selectedScanId}/scanIssues`;
        console.log(
          chalk.gray('View scan in AppScan:'),
          chalk.blue.underline(scanUrl)
        );
        console.log('');
      }

      // Step 4: Group issues by type
      const groups = groupIssuesByType(issues);
      displayGroupedSummary(groups);

      // Step 5: Select a group
      let continueWithScan = true;

      while (continueWithScan && issues.length > 0) {
        const selectedGroupIndex = await promptGroupSelection(groups);

        if (selectedGroupIndex === -1) {
          // Back to scan list
          continueWithScan = false;
          break;
        }

        const selectedGroup = groups[selectedGroupIndex];
        const groupIssues = selectedGroup.issues;

        // Step 6: Issue selection and actions loop
        let continueWithGroup = true;

        while (continueWithGroup && groupIssues.length > 0) {
          console.log(
            chalk.cyan.bold(
              `\n📋 ${selectedGroup.type} (${groupIssues.length} issues)\n`
            )
          );

          // Select issues (pass base URL for URL conversion)
          const baseUrl = config.getBaseUrl();
          const selectedIssueIds = await promptIssueSelection(
            groupIssues,
            baseUrl
          );

          if (selectedIssueIds.length === 0) {
            displayInfo('No issues selected.');
            continueWithGroup = false;
            break;
          }

          console.log(
            chalk.green(`\n✓ Selected ${selectedIssueIds.length} issue(s)\n`)
          );

          // Select action
          const action = await promptAction();

          switch (action) {
            case 'update': {
              // Update status and add comment
              const newStatus = await promptStatusChange();
              const comment = await promptComment(false);

              console.log(
                chalk.cyan(
                  `\n🔄 Updating ${selectedIssueIds.length} issue(s)...\n`
                )
              );

              try {
                const result = await service.bulkUpdateIssues(
                  selectedIssueIds,
                  newStatus,
                  comment || undefined
                );

                displaySuccess(
                  `Updated ${result.totalUpdated} issue(s) to status: ${newStatus}`
                );

                if (comment) {
                  console.log(chalk.gray(`Comment: "${comment}"\n`));
                }

                // Remove updated issues from the group
                groupIssues.splice(
                  0,
                  groupIssues.length,
                  ...groupIssues.filter(
                    (issue) => !selectedIssueIds.includes(issue.Id)
                  )
                );

                // Update total issues list
                issues = issues.filter(
                  (issue) => !selectedIssueIds.includes(issue.Id)
                );

                // Update stats
                displayInfo(
                  `${groupIssues.length} issue(s) remaining in this group`
                );
                displayInfo(`${issues.length} issue(s) remaining in this scan`);

                if (groupIssues.length === 0) {
                  displaySuccess(
                    'All issues in this group have been processed!'
                  );
                  continueWithGroup = false;
                }
              } catch (error) {
                displayError(`Failed to update issues: ${error.message}`);
              }
              break;
            }

            case 'jira': {
              // Create JIRA issue for true positives
              if (!config.isJiraValid()) {
                displayError(
                  'JIRA is not configured. Please run: appscan setup'
                );
                break;
              }

              // Count true positives (non-Noise, non-Passed, non-Fixed)
              const truePositives = issues.filter(
                (issue) => !['Noise', 'Passed', 'Fixed'].includes(issue.Status)
              );

              const mediumOrHigher = truePositives.filter((issue) =>
                ['Critical', 'High', 'Medium'].includes(issue.Severity)
              );

              const shouldCreate = await promptJiraCreation(
                truePositives.length,
                mediumOrHigher.length
              );

              if (shouldCreate) {
                try {
                  console.log(chalk.cyan('\n🎫 Creating JIRA issue...\n'));
                  await createJiraIssueForVulnerabilities(
                    mediumOrHigher,
                    selectedScanId,
                    scans,
                    config,
                    service
                  );
                } catch (error) {
                  displayError(`Failed to create JIRA issue: ${error.message}`);
                }
              }
              break;
            }

            case 'view': {
              // View detailed information about selected issues
              const baseUrl = config.getBaseUrl();
              for (const issueId of selectedIssueIds.slice(0, 3)) {
                const issue = groupIssues.find((i) => i.Id === issueId);
                if (issue) {
                  try {
                    const article = await service.getArticle(issueId);
                    const { displayIssueDetails } =
                      await import('../../utils/triage-ui.js');
                    displayIssueDetails(issue, article, baseUrl);
                  } catch (error) {
                    console.error(
                      chalk.red(`Error loading details: ${error.message}`)
                    );
                  }
                }
              }
              if (selectedIssueIds.length > 3) {
                console.log(
                  chalk.gray(
                    `... and ${selectedIssueIds.length - 3} more issues\n`
                  )
                );
              }
              break;
            }

            case 'refresh': {
              // Reload issues
              console.log(chalk.cyan('\n🔄 Refreshing issues...\n'));
              const refreshedResponse = await service.listIssues(
                selectedScanId,
                'Noise,Fixed,Passed'
              );
              issues = refreshedResponse.Items || [];

              // Update groups
              const refreshedGroups = groupIssuesByType(issues);
              groups.splice(0, groups.length, ...refreshedGroups);

              displaySuccess('Issues refreshed');
              displayGroupedSummary(groups);
              continueWithGroup = false;
              break;
            }

            case 'back': {
              continueWithGroup = false;
              break;
            }
          }
        }

        // Check if all issues in scan are processed
        if (issues.length === 0) {
          displaySuccess('All issues in this scan have been processed!');

          // Offer to create JIRA issue for the scan before moving on
          if (config.isJiraValid()) {
            const createJira = await confirm({
              message: 'Do you want to create a JIRA issue for this scan now?',
              default: true,
            });

            if (createJira) {
              try {
                // Reload ALL issues for the scan (including those we just triaged)
                const allIssuesResponse = await service.listIssues(
                  selectedScanId,
                  ''
                );
                const allIssues = allIssuesResponse.Items || [];

                // Filter for non-closed issues (exclude Noise, Passed, Fixed)
                const openIssues = allIssues.filter(
                  (issue) =>
                    !['Noise', 'Passed', 'Fixed'].includes(issue.Status)
                );

                // Filter for Medium or higher severity
                const mediumOrHigher = openIssues.filter((issue) =>
                  ['Critical', 'High', 'Medium'].includes(issue.Severity)
                );

                if (mediumOrHigher.length === 0) {
                  displayInfo(
                    'No open issues with Medium or higher severity to include in JIRA.'
                  );
                } else {
                  console.log(chalk.cyan('\n🎫 Creating JIRA issue...\n'));
                  await createJiraIssueForVulnerabilities(
                    mediumOrHigher,
                    selectedScanId,
                    scans,
                    config,
                    service
                  );
                }
              } catch (error) {
                displayError(`Failed to create JIRA issue: ${error.message}`);
              }
            }
          }

          const triageAnother = await confirm({
            message: 'Do you want to triage another scan?',
            default: true,
          });

          if (!triageAnother) {
            continueTriaging = false;
          }

          continueWithScan = false;
        }
      }
    }

    console.log(chalk.green.bold('\n✅ Triage session complete!\n'));
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log(chalk.yellow('\n⚠️  Triage cancelled by user.\n'));
      process.exit(0);
    }
    displayError(error.message);
    process.exit(1);
  }
}

export default triage;
