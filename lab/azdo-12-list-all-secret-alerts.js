#!/usr/bin/env node
/**
 * azdo-09-list-all-secret-alerts.js
 *
 * Purpose: Display all alerts of category "secret" across the entire organization
 * Features:
 * - Uses AlertApi.getAlerts with filtering to retrieve only Secret alerts
 * - Uses continuationToken to ensure all matching alerts are retrieved
 * - Provides alert URL for each alert to permit inspection in AzDO's web interface
 * - Self-contained script using azure-devops-node-api package exclusively
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';
import * as AlertInterfaces from 'azure-devops-node-api/interfaces/AlertInterfaces.js';
import chalk from 'chalk';
import { program } from 'commander';

dotenv.config();

// Parse command-line arguments
program
  .option('--withLocation', 'Display physical location details')
  .option('--withCommit', 'Display commit hash information')
  .option('--withGitUrl', 'Display Git item URLs')
  .parse(process.argv);

const options = program.opts();

const PAGE_SIZE = 100; // Number of alerts to fetch per page

/**
 * Connect to Azure DevOps and return the client connection
 */
async function getAzdoClient() {
  const orgUrlFromAzureEnv =
    process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
      ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
      : undefined;

  const orgUrl =
    process.env.AZDO_ORG_URL ||
    process.env.AZDO_OR ||
    orgUrlFromAzureEnv ||
    process.env.AZURE_DEVOPS_ORG_URL;
  const pat =
    process.env.AZDO_PAT ||
    process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
    process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !pat) {
    throw new Error(
      'Missing required environment variables: AZDO_ORG_URL and AZDO_PAT'
    );
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return { connection, orgUrl };
}

/**
 * Extract continuation token from the API response
 * The token can be in different locations depending on the response structure
 */
function extractContinuationToken(page) {
  if (!page) return undefined;

  // Check direct properties
  if (page.continuationToken) return page.continuationToken;

  // Check __continuation object
  if (page.__continuation) {
    if (page.__continuation.continuationToken) {
      return page.__continuation.continuationToken;
    }
    if (page.__continuation.token) {
      return page.__continuation.token;
    }
  }

  // Check if page is an array with continuationToken property
  if (Array.isArray(page) && page.continuationToken) {
    return page.continuationToken;
  }

  return undefined;
}

/**
 * Fetch all secret alerts for a specific repository using pagination
 */
async function fetchAllSecretAlerts(alertApi, projectName, repositoryId) {
  const allAlerts = [];
  let continuationToken = undefined;

  do {
    // Create search criteria to filter only Secret alerts
    const criteria = {
      alertType: AlertInterfaces.AlertType.Secret,
    };

    // Fetch alerts with pagination
    const page = await alertApi.getAlerts(
      projectName,
      repositoryId,
      PAGE_SIZE,
      undefined, // orderBy
      criteria,
      undefined, // expand
      continuationToken
    );

    // Normalize page data to an array of alerts
    let pageAlerts = [];
    if (!page) {
      pageAlerts = [];
    } else if (Array.isArray(page)) {
      pageAlerts = page;
    } else if (Array.isArray(page.value)) {
      pageAlerts = page.value;
    } else if (Array.isArray(page.result)) {
      pageAlerts = page.result;
    }

    allAlerts.push(...pageAlerts);

    // Extract continuation token for next page
    const nextToken = extractContinuationToken(page);
    continuationToken = nextToken;
  } while (continuationToken);

  return allAlerts;
}

/**
 * Build the web URL for an alert in Azure DevOps
 */
function buildAlertUrl(orgUrl, projectName, repositoryId, alertId) {
  // Azure DevOps alert URL format:
  // https://dev.azure.com/{org}/{project}/_git/{repo}/alerts/{alertId}
  const encodedProject = encodeURIComponent(projectName);
  const encodedRepo = encodeURIComponent(repositoryId);
  return `${orgUrl}/${encodedProject}/_git/${encodedRepo}/alerts/${alertId}`;
}

/**
 * Format alert state with chalk colors
 */
function formatState(state) {
  switch (state) {
    case AlertInterfaces.State.Active:
      return chalk.red('🔴 Active');
    case AlertInterfaces.State.Dismissed:
      return chalk.gray('⚪ Dismissed');
    case AlertInterfaces.State.Fixed:
      return chalk.green('🟢 Fixed');
    case AlertInterfaces.State.AutoDismissed:
      return chalk.blue('🔵 Auto-Dismissed');
    default:
      return chalk.gray('❓ Unknown');
  }
}

/**
 * Format severity with chalk colors
 */
function formatSeverity(severity) {
  switch (severity) {
    case AlertInterfaces.Severity.Critical:
      return chalk.red.bold('🔥 Critical');
    case AlertInterfaces.Severity.High:
      return chalk.red('🔴 High');
    case AlertInterfaces.Severity.Medium:
      return chalk.yellow('🟡 Medium');
    case AlertInterfaces.Severity.Low:
      return chalk.green('🟢 Low');
    default:
      return chalk.gray('❓Unknown');
  }
}

/**
 * Format confidence level
 */
function formatConfidence(confidence) {
  switch (confidence) {
    case AlertInterfaces.Confidence.High:
      return 'High';
    case AlertInterfaces.Confidence.Other:
      return 'Other';
    default:
      return 'Unknown';
  }
}

/**
 * Format dismissal type
 */
function formatDismissalType(type) {
  switch (type) {
    case AlertInterfaces.DismissalType.CannotFix:
      return 'Cannot Fix';
    case AlertInterfaces.DismissalType.FalsePositive:
      return 'False Positive';
    case AlertInterfaces.DismissalType.InCode:
      return 'In Code';
    case AlertInterfaces.DismissalType.AgreedToGuidance:
      return 'Agreed To Guidance';
    case AlertInterfaces.DismissalType.ToolUpgrade:
      return 'Tool Upgrade';
    default:
      return 'Unknown';
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Connect to Azure DevOps
    const { connection, orgUrl } = await getAzdoClient();

    // Get required APIs
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    // Get all projects
    const projects = await coreApi.getProjects();

    let totalSecretAlerts = 0;
    const alertDetails = [];
    let processedRepos = 0;
    let totalRepos = 0;

    // Count total repositories first
    for (const project of projects) {
      const repos = await gitApi.getRepositories(project.id);
      totalRepos += repos?.length || 0;
    }

    // Iterate through all projects
    for (const project of projects) {
      // Get repositories for the project
      const repos = await gitApi.getRepositories(project.id);

      if (!repos || repos.length === 0) {
        continue;
      }

      // Iterate through all repositories
      for (const repo of repos) {
        processedRepos++;

        try {
          // Fetch all secret alerts for this repository
          const secretAlerts = await fetchAllSecretAlerts(
            alertApi,
            project.name,
            repo.id
          );

          if (secretAlerts.length > 0) {
            totalSecretAlerts += secretAlerts.length;

            // Store alert details for summary
            for (const alert of secretAlerts) {
              alertDetails.push({
                project: project.name,
                repository: repo.name,
                alert: alert,
                url: buildAlertUrl(orgUrl, project.name, repo.id, alert.alertId),
              });
            }
          }
        } catch (err) {
          // Silently skip repositories with errors (e.g., Advanced Security not enabled)
        }

        // Update progress
        const percentage = Math.round((processedRepos / totalRepos) * 100);
        const barLength = 40;
        const filledLength = Math.round((percentage / 100) * barLength);
        const bar = chalk.cyan('█'.repeat(filledLength)) + chalk.gray('░'.repeat(barLength - filledLength));
        
        process.stdout.write(
          `\r[${bar}] ${chalk.bold(percentage + '%')} | ${processedRepos}/${totalRepos} repos | ${chalk.yellow(totalSecretAlerts)} secrets found`
        );
      }
    }

    // Clear progress line and add newline
    console.log('\n');

    if (alertDetails.length === 0) {
      console.log(chalk.gray('No secret alerts found in the organization.'));
      process.exit(0);
    }

    // Display detailed list of all alerts
    for (const { project, repository, alert, url } of alertDetails) {
      console.log(chalk.bold.cyan(`Alert #${alert.alertId}`));
      console.log(chalk.gray(`  Project: `) + chalk.white(project));
      console.log(chalk.gray(`  Repository: `) + chalk.white(repository));
      console.log(chalk.gray(`  Title: `) + chalk.white(alert.title || '(no title)'));
      console.log(chalk.gray(`  State: `) + formatState(alert.state));
      console.log(chalk.gray(`  Severity: `) + formatSeverity(alert.severity));
      console.log(chalk.gray(`  Confidence: `) + chalk.white(formatConfidence(alert.confidence)));
      
      // Physical locations (file, line, column, and version control details)
      if (alert.physicalLocations && alert.physicalLocations.length > 0) {
        for (const location of alert.physicalLocations) {
          if (location.filePath) {
            // Display location if flag is set
            if (options.withLocation) {
              let locationStr = chalk.blue(location.filePath);
              
              // Add region details (line and column)
              if (location.region) {
                const { startLine, endLine, startColumn, endColumn } = location.region;
                
                if (startLine !== undefined) {
                  // Line range
                  if (endLine !== undefined && endLine !== startLine) {
                    locationStr += chalk.gray(`:${startLine}-${endLine}`);
                  } else {
                    locationStr += chalk.gray(`:${startLine}`);
                  }
                  
                  // Column range
                  if (startColumn !== undefined) {
                    if (endColumn !== undefined && endColumn !== startColumn) {
                      locationStr += chalk.gray(`:${startColumn}-${endColumn}`);
                    } else {
                      locationStr += chalk.gray(`:${startColumn}`);
                    }
                  }
                }
              }
              
              console.log(chalk.gray(`  Location: `) + locationStr);
            }
            
            // Add version control details (commit hash and item URL)
            if (location.versionControl) {
              if (options.withCommit && location.versionControl.commitHash) {
                console.log(chalk.gray(`    Commit: `) + chalk.yellow(location.versionControl.commitHash));
              }
              if (options.withGitUrl && location.versionControl.itemUrl) {
                console.log(chalk.gray(`    URL: `) + chalk.underline.blue(location.versionControl.itemUrl));
              }
            }
          }
        }
      }
      
      // Tools
      if (alert.tools && alert.tools.length > 0) {
        const toolNames = alert.tools.map(t => t.name).filter(Boolean).join(', ');
        if (toolNames) {
          console.log(chalk.gray(`  Tool: `) + chalk.white(toolNames));
        }
      }
      
      // Dismissal information
      if (alert.dismissal) {
        console.log(chalk.gray(`  Dismissal:`));
        if (alert.dismissal.dismissedReason) {
          console.log(chalk.gray(`    Reason: `) + chalk.white(formatDismissalType(alert.dismissal.dismissedReason)));
        }
        if (alert.dismissal.dismissedComment) {
          console.log(chalk.gray(`    Comment: `) + chalk.white(alert.dismissal.dismissedComment));
        }
        if (alert.dismissal.dismissedDate) {
          console.log(chalk.gray(`    Date: `) + chalk.white(new Date(alert.dismissal.dismissedDate).toISOString()));
        }
      }
      
      if (alert.truncatedSecret) {
        console.log(chalk.gray(`  Secret: `) + chalk.dim(alert.truncatedSecret));
      }
      if (alert.firstSeenDate) {
        console.log(chalk.gray(`  First Seen: `) + chalk.white(new Date(alert.firstSeenDate).toISOString()));
      }
      if (alert.lastSeenDate) {
        console.log(chalk.gray(`  Last Seen: `) + chalk.white(new Date(alert.lastSeenDate).toISOString()));
      }
      console.log(chalk.gray(`  URL: `) + chalk.underline.blue(url));
      console.log();
    }

    process.exit(0);
  } catch (err) {
    console.error(chalk.red.bold('\nError: ') + chalk.red(err.message));
    if (err.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(err.stack));
    }
    process.exit(1);
  }
}

main();
