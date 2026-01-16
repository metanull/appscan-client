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

dotenv.config();

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
  let pageNumber = 1;

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

    if (pageAlerts.length > 0) {
      console.log(
        `      Page ${pageNumber}: Fetched ${pageAlerts.length} secret alerts`
      );
    }

    continuationToken = nextToken;
    pageNumber++;
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
 * Format alert state with color emoji
 */
function formatState(state) {
  switch (state) {
    case AlertInterfaces.State.Active:
      return '🔴 Active';
    case AlertInterfaces.State.Dismissed:
      return '⚪ Dismissed';
    case AlertInterfaces.State.Fixed:
      return '🟢 Fixed';
    case AlertInterfaces.State.AutoDismissed:
      return '🔵 Auto-Dismissed';
    default:
      return '❓ Unknown';
  }
}

/**
 * Format severity with emoji
 */
function formatSeverity(severity) {
  switch (severity) {
    case AlertInterfaces.Severity.Critical:
      return '🔥 Critical';
    case AlertInterfaces.Severity.High:
      return '🔴 High';
    case AlertInterfaces.Severity.Medium:
      return '🟡 Medium';
    case AlertInterfaces.Severity.Low:
      return '🟢 Low';
    default:
      return '❓ Unknown';
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
 * Main function
 */
async function main() {
  try {
    console.log('='.repeat(80));
    console.log('Azure DevOps - List All Secret Alerts');
    console.log('='.repeat(80));
    console.log();

    // Connect to Azure DevOps
    const { connection, orgUrl } = await getAzdoClient();
    console.log('✅ Connected to Azure DevOps\n');

    // Get required APIs
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    // Get all projects
    const projects = await coreApi.getProjects();
    console.log(`📁 Found ${projects.length} project(s)\n`);

    let totalSecretAlerts = 0;
    const alertDetails = [];

    // Iterate through all projects
    for (const project of projects) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Project: ${project.name}`);
      console.log('─'.repeat(80));

      // Get repositories for the project
      const repos = await gitApi.getRepositories(project.id);

      if (!repos || repos.length === 0) {
        console.log('  ℹ️  No repositories found');
        continue;
      }

      console.log(`  📦 Found ${repos.length} repository(ies)\n`);

      // Iterate through all repositories
      for (const repo of repos) {
        console.log(`    Repository: ${repo.name}`);

        try {
          // Fetch all secret alerts for this repository
          const secretAlerts = await fetchAllSecretAlerts(
            alertApi,
            project.name,
            repo.id
          );

          if (secretAlerts.length === 0) {
            console.log('      ✓ No secret alerts found\n');
            continue;
          }

          console.log(
            `      🔍 Total secret alerts: ${secretAlerts.length}\n`
          );
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
        } catch (err) {
          if (err.statusCode === 404) {
            console.log(
              '      ℹ️  Advanced Security not enabled or no alerts\n'
            );
          } else {
            console.log(`      ❌ Error: ${err.message}\n`);
          }
        }
      }
    }

    // Display summary
    console.log('\n');
    console.log('='.repeat(80));
    console.log('SUMMARY - All Secret Alerts');
    console.log('='.repeat(80));
    console.log(`Total secret alerts found: ${totalSecretAlerts}`);
    console.log();

    if (alertDetails.length === 0) {
      console.log('No secret alerts found in the organization.');
      process.exit(0);
    }

    // Display detailed list of all alerts
    console.log('\nDetailed Alert List:');
    console.log('─'.repeat(80));
    console.log();

    for (const { project, repository, alert, url } of alertDetails) {
      console.log(`Alert ID: ${alert.alertId}`);
      console.log(`  Project: ${project}`);
      console.log(`  Repository: ${repository}`);
      console.log(`  Title: ${alert.title || '(no title)'}`);
      console.log(`  State: ${formatState(alert.state)}`);
      console.log(`  Severity: ${formatSeverity(alert.severity)}`);
      console.log(`  Confidence: ${formatConfidence(alert.confidence)}`);
      if (alert.truncatedSecret) {
        console.log(`  Secret (truncated): ${alert.truncatedSecret}`);
      }
      if (alert.firstSeenDate) {
        console.log(
          `  First Seen: ${new Date(alert.firstSeenDate).toISOString()}`
        );
      }
      if (alert.lastSeenDate) {
        console.log(
          `  Last Seen: ${new Date(alert.lastSeenDate).toISOString()}`
        );
      }
      console.log(`  🔗 URL: ${url}`);
      console.log();
    }

    console.log('='.repeat(80));
    console.log('✅ Script completed successfully');
    console.log('='.repeat(80));

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
