import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { AppScanService } from '../services/appscan-service.js';
import { JiraService } from '../services/jira-service.js';
import { Config } from '../utils/config.js';
import {
  formatScanDisplay,
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
} from '../utils/triage-ui.js';

export async function triage(options) {
  try {
    // Load configuration
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();

    // Check if configuration is valid
    if (!config.isValid()) {
      displayError('Configuration not found or incomplete!');
      console.log(chalk.yellow('Please run:'), chalk.cyan('appscan setup'), chalk.yellow('to configure your credentials.\n'));
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
      // Step 1: Load and display scans with issue counts
      console.log(chalk.cyan('\n📋 Loading scans...\n'));
      const scansResponse = await service.listScans();
      const scans = scansResponse.Items || [];

      if (scans.length === 0) {
        displayInfo('No scans found.');
        break;
      }

      // Initialize JIRA service if configured
      let jiraService = null;
      if (config.isJiraValid()) {
        try {
          jiraService = new JiraService(config);
        } catch (error) {
          console.error(chalk.gray(`  Warning: Could not initialize JIRA service: ${error.message}`));
        }
      }

      // Get issue counts and JIRA status for each scan (limited to first 20 for performance)
      const scansWithStats = await Promise.all(
        scans.slice(0, 20).map(async (scan) => {
          try {
            const stats = await service.getIssueCounts(scan.Id, 'Noise,Fixed,Passed');
            
            // Check for existing JIRA issue
            let jiraIssue = null;
            if (jiraService) {
              try {
                jiraIssue = await jiraService.findIssueForScan(scan.Name, config.getJiraProjectKey());
              } catch {
                // Silent failure for JIRA lookup
              }
            }
            
            return {
              scan,
              stats,
              jiraIssue,
            };
          } catch (error) {
            console.error(chalk.gray(`  Warning: Could not load stats for ${scan.Name}: ${error.message}`));
            return {
              scan,
              stats: null,
              jiraIssue: null,
            };
          }
        })
      );

      // Filter scans with open issues
      const scansWithIssues = scansWithStats.filter(s => !s.stats || s.stats.total > 0);

      if (scansWithIssues.length === 0) {
        displaySuccess('All scans have been triaged! No open issues remaining.');
        break;
      }

      // Format scan choices
      const scanChoices = scansWithIssues.map(({ scan, stats, jiraIssue }) => 
        formatScanDisplay(scan, stats, jiraIssue)
      );

      scanChoices.push({
        name: chalk.yellow('← Exit triage'),
        value: 'EXIT',
        short: 'Exit',
      });

      // Step 2: Select a scan
      const selectedScanId = await promptScanSelection(scanChoices);

      if (selectedScanId === 'EXIT') {
        console.log(chalk.cyan('\n👋 Exiting triage. Goodbye!\n'));
        break;
      }

      // Step 3: Load issues for selected scan
      console.log(chalk.cyan('\n📥 Loading issues...\n'));
      const issuesResponse = await service.listIssues(selectedScanId, 'Noise,Fixed,Passed');
      let issues = issuesResponse.Items || [];

      if (issues.length === 0) {
        displaySuccess('No open issues found in this scan!');
        continue;
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
          console.log(chalk.cyan.bold(`\n📋 ${selectedGroup.type} (${groupIssues.length} issues)\n`));

          // Select issues (pass base URL for URL conversion)
          const baseUrl = config.getBaseUrl();
          const selectedIssueIds = await promptIssueSelection(groupIssues, baseUrl);

          if (selectedIssueIds.length === 0) {
            displayInfo('No issues selected.');
            continueWithGroup = false;
            break;
          }

          console.log(chalk.green(`\n✓ Selected ${selectedIssueIds.length} issue(s)\n`));

          // Select action
          const action = await promptAction();

          switch (action) {
            case 'update': {
              // Update status and add comment
              const newStatus = await promptStatusChange();
              const comment = await promptComment(false);

              console.log(chalk.cyan(`\n🔄 Updating ${selectedIssueIds.length} issue(s)...\n`));

              try {
                const result = await service.bulkUpdateIssues(
                  selectedIssueIds,
                  newStatus,
                  comment || undefined
                );

                displaySuccess(`Updated ${result.totalUpdated} issue(s) to status: ${newStatus}`);

                if (comment) {
                  console.log(chalk.gray(`Comment: "${comment}"\n`));
                }

                // Remove updated issues from the group
                groupIssues.splice(0, groupIssues.length, 
                  ...groupIssues.filter(issue => !selectedIssueIds.includes(issue.Id))
                );

                // Update total issues list
                issues = issues.filter(issue => !selectedIssueIds.includes(issue.Id));

                // Update stats
                displayInfo(`${groupIssues.length} issue(s) remaining in this group`);
                displayInfo(`${issues.length} issue(s) remaining in this scan`);

                if (groupIssues.length === 0) {
                  displaySuccess('All issues in this group have been processed!');
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
                displayError('JIRA is not configured. Please run: appscan setup');
                break;
              }

              // Count true positives (non-Noise, non-Passed, non-Fixed)
              const truePositives = issues.filter(
                issue => !['Noise', 'Passed', 'Fixed'].includes(issue.Status)
              );

              const mediumOrHigher = truePositives.filter(
                issue => ['Critical', 'High', 'Medium'].includes(issue.Severity)
              );

              const shouldCreate = await promptJiraCreation(
                truePositives.length,
                mediumOrHigher.length
              );

              if (shouldCreate) {
                try {
                  console.log(chalk.cyan('\n🎫 Creating JIRA issue...\n'));

                  const jiraService = new JiraService(config);
                  const baseUrl = config.getBaseUrl();

                  // Get scan details for JIRA issue
                  const scan = scansWithIssues.find(s => s.scan.Id === selectedScanId)?.scan;
                  const scanName = scan?.Name || selectedScanId;

                  // Build issue summary
                  const stats = calculateIssueStats(mediumOrHigher);
                  const summary = `[Security] ${scanName} - ${mediumOrHigher.length} vulnerabilities (C:${stats.Critical} H:${stats.High} M:${stats.Medium})`;

                  // Build description with detailed vulnerability information
                  let description = `# Security Vulnerabilities - ${scanName}\n\n`;
                  description += `## Summary\n`;
                  description += `- Total vulnerabilities: ${mediumOrHigher.length}\n`;
                  description += `- Critical: ${stats.Critical}\n`;
                  description += `- High: ${stats.High}\n`;
                  description += `- Medium: ${stats.Medium}\n\n`;

                  description += `## Vulnerabilities by Type\n\n`;

                  const jiraGroups = groupIssuesByType(mediumOrHigher);
                  
                  for (const group of jiraGroups) {
                    description += `### ${group.type} (${group.severity})\n`;
                    description += `Count: ${group.issues.length}\n\n`;
                    
                    // Add detailed info for each issue
                    for (const issue of group.issues) {
                      const { convertToAbsoluteUrl } = await import('../utils/url-converter.js');
                      
                      description += `#### Issue: ${issue.IssueType || 'Unknown'}\n`;
                      description += `- Severity: ${issue.Severity || 'Unknown'} (${issue.SeverityValue || 'N/A'})\n`;
                      description += `- Status: ${issue.Status || 'Unknown'}\n`;
                      
                      if (issue.SourceFileUri || issue.Location) {
                        const sourceUrl = issue.SourceFileUri || issue.Location;
                        const absoluteUrl = convertToAbsoluteUrl(sourceUrl, baseUrl);
                        description += `- Location: [${sourceUrl}](${absoluteUrl})\n`;
                      }
                      
                      if (issue.Api) {
                        const absoluteUrl = convertToAbsoluteUrl(issue.Api, baseUrl);
                        description += `- API/URL: [${issue.Api}](${absoluteUrl})\n`;
                      }
                      
                      if (issue.LineNumber) {
                        description += `- Line: ${issue.LineNumber}\n`;
                      }
                      
                      if (issue.CweId) {
                        description += `- CWE: [CWE-${issue.CweId}](https://cwe.mitre.org/data/definitions/${issue.CweId}.html)\n`;
                      }
                      
                      // Add link to AppScan article
                      const issueDetailsUrl = `${baseUrl}/api/v4/Issues/${issue.Id}?locale=en`;
                      description += `- [View in AppScan](${issueDetailsUrl})\n`;
                      
                      if (issue.IssueTypeId) {
                        const articleUrl = `${baseUrl}/api/v4/Reports/Article/?issuetype=${issue.IssueTypeId}`;
                        description += `- [Remediation Guide](${articleUrl})\n`;
                      }
                      
                      description += `\n`;
                    }
                  }

                  const projectKey = config.getJiraProjectKey();
                  const jiraIssue = await jiraService.createIssue(
                    projectKey,
                    summary,
                    description,
                    'Story',
                    {
                      labels: ['vulnerability', 'security']
                    }
                  );

                  displaySuccess(`JIRA issue created: ${jiraIssue.key}`);
                  console.log(chalk.cyan('View issue at:'), chalk.blue.underline(jiraIssue.url || `${config.getJiraHost()}/browse/${jiraIssue.key}`));
                  
                  // Link JIRA issue to AppScan issues via ExternalId
                  console.log(chalk.gray('\nLinking JIRA issue to AppScan vulnerabilities...'));
                  const issueIdsToLink = mediumOrHigher.map(i => i.Id);
                  try {
                    await service.bulkUpdateIssues(issueIdsToLink, null, null, jiraIssue.key);
                    console.log(chalk.green(`✓ Linked ${issueIdsToLink.length} issues to ${jiraIssue.key}\n`));
                  } catch (error) {
                    console.log(chalk.yellow(`⚠ Could not link issues to JIRA: ${error.message}\n`));
                  }

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
                const issue = groupIssues.find(i => i.Id === issueId);
                if (issue) {
                  try {
                    const article = await service.getArticle(issueId);
                    const { displayIssueDetails } = await import('../utils/triage-ui.js');
                    displayIssueDetails(issue, article, baseUrl);
                  } catch (error) {
                    console.error(chalk.red(`Error loading details: ${error.message}`));
                  }
                }
              }
              if (selectedIssueIds.length > 3) {
                console.log(chalk.gray(`... and ${selectedIssueIds.length - 3} more issues\n`));
              }
              break;
            }

            case 'refresh': {
              // Reload issues
              console.log(chalk.cyan('\n🔄 Refreshing issues...\n'));
              const refreshedResponse = await service.listIssues(selectedScanId, 'Noise,Fixed,Passed');
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
                const allIssuesResponse = await service.listIssues(selectedScanId, '');
                const allIssues = allIssuesResponse.Items || [];

                // Filter for non-closed issues (exclude Noise, Passed, Fixed)
                const openIssues = allIssues.filter(
                  issue => !['Noise', 'Passed', 'Fixed'].includes(issue.Status)
                );

                // Filter for Medium or higher severity
                const mediumOrHigher = openIssues.filter(
                  issue => ['Critical', 'High', 'Medium'].includes(issue.Severity)
                );

                if (mediumOrHigher.length === 0) {
                  displayInfo('No open issues with Medium or higher severity to include in JIRA.');
                } else {
                  console.log(chalk.cyan('\n🎫 Creating JIRA issue...\n'));

                  const jiraService = new JiraService(config);
                  const baseUrl = config.getBaseUrl();
                  const scan = scansWithIssues.find(s => s.scan.Id === selectedScanId)?.scan;
                  const scanName = scan?.Name || selectedScanId;

                  // Build issue summary
                  const stats = calculateIssueStats(mediumOrHigher);
                  const summary = `[Security] ${scanName} - ${mediumOrHigher.length} vulnerabilities (C:${stats.Critical} H:${stats.High} M:${stats.Medium})`;

                  // Build description with detailed vulnerability information
                  let description = `# Security Vulnerabilities - ${scanName}\n\n`;
                  description += `## Summary\n`;
                  description += `- Total vulnerabilities: ${mediumOrHigher.length}\n`;
                  description += `- Critical: ${stats.Critical}\n`;
                  description += `- High: ${stats.High}\n`;
                  description += `- Medium: ${stats.Medium}\n\n`;

                  description += `## Vulnerabilities by Type\n\n`;

                  const jiraGroups = groupIssuesByType(mediumOrHigher);
                  
                  for (const group of jiraGroups) {
                    description += `### ${group.type} (${group.severity})\n`;
                    description += `Count: ${group.issues.length}\n\n`;
                    
                    // Add detailed info for each issue
                    for (const issue of group.issues) {
                      const { convertToAbsoluteUrl } = await import('../utils/url-converter.js');
                      
                      description += `#### Issue: ${issue.IssueType || 'Unknown'}\n`;
                      description += `- Severity: ${issue.Severity || 'Unknown'} (${issue.SeverityValue || 'N/A'})\n`;
                      description += `- Status: ${issue.Status || 'Unknown'}\n`;
                      
                      if (issue.SourceFileUri || issue.Location) {
                        const sourceUrl = issue.SourceFileUri || issue.Location;
                        const absoluteUrl = convertToAbsoluteUrl(sourceUrl, baseUrl);
                        description += `- Location: [${sourceUrl}](${absoluteUrl})\n`;
                      }
                      
                      if (issue.Api) {
                        const absoluteUrl = convertToAbsoluteUrl(issue.Api, baseUrl);
                        description += `- API/URL: [${issue.Api}](${absoluteUrl})\n`;
                      }
                      
                      if (issue.LineNumber) {
                        description += `- Line: ${issue.LineNumber}\n`;
                      }
                      
                      if (issue.CweId) {
                        description += `- CWE: [CWE-${issue.CweId}](https://cwe.mitre.org/data/definitions/${issue.CweId}.html)\n`;
                      }
                      
                      // Add link to AppScan article
                      const issueDetailsUrl = `${baseUrl}/api/v4/Issues/${issue.Id}?locale=en`;
                      description += `- [View in AppScan](${issueDetailsUrl})\n`;
                      
                      if (issue.IssueTypeId) {
                        const articleUrl = `${baseUrl}/api/v4/Reports/Article/?issuetype=${issue.IssueTypeId}`;
                        description += `- [Remediation Guide](${articleUrl})\n`;
                      }
                      
                      description += `\n`;
                    }
                  }

                  const projectKey = config.getJiraProjectKey();
                  const jiraIssue = await jiraService.createIssue(
                    projectKey,
                    summary,
                    description,
                    'Story',
                    {
                      labels: ['vulnerability', 'security']
                    }
                  );

                  displaySuccess(`JIRA issue created: ${jiraIssue.key}`);
                  console.log(chalk.cyan('View issue at:'), chalk.blue.underline(jiraIssue.url || `${config.getJiraHost()}/browse/${jiraIssue.key}`));
                  
                  // Link JIRA issue to AppScan issues via ExternalId
                  console.log(chalk.gray('\nLinking JIRA issue to AppScan vulnerabilities...'));
                  const issueIdsToLink = mediumOrHigher.map(i => i.Id);
                  try {
                    await service.bulkUpdateIssues(issueIdsToLink, null, null, jiraIssue.key);
                    console.log(chalk.green(`✓ Linked ${issueIdsToLink.length} issues to ${jiraIssue.key}\n`));
                  } catch (error) {
                    console.log(chalk.yellow(`⚠ Could not link issues to JIRA: ${error.message}\n`));
                  }
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
