#!/usr/bin/env node
/**
 * azdo-15-list-secrets-with-fingerprint.js
 *
 * Purpose: Display all secret alerts across all repos in all projects
 * using the azdo service (as used by the TUI), with fingerprint data.
 *
 * Displays for each alert:
 * - Project name & ID
 * - Repo name & ID
 * - Alert Title
 * - fingerprint(json).secret
 * - fingerprint(json).id
 * - File locations (comma separated)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import { getEnvPath } from '../src/utils/config-paths.js';

// Load environment variables from the correct path (same as TUI)
const envPath = getEnvPath();
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Initialize proxy/TLS configuration (must be after dotenv)
await import('../src/utils/bootstrap-proxy.js');

import chalk from 'chalk';
import { AzdoService } from '../src/tui/shared/services/azdo.js';
import {
  getMostRecentFingerprint,
  parseFingerprintJson,
} from '../src/tui/apps/azdo/utils/issue.js';

/**
 * Get file paths from alert physical locations
 * @param {Object} alert - Alert object
 * @returns {string} Comma-separated file paths
 */
function getFilePaths(alert) {
  if (!alert.physicalLocations || alert.physicalLocations.length === 0) {
    return 'N/A';
  }
  const paths = alert.physicalLocations
    .map((loc) => loc.filePath)
    .filter(Boolean);
  return paths.length > 0 ? paths.join(', ') : 'N/A';
}

/**
 * Extract fingerprint data (secret and id) from alert
 * @param {Object} alert - Alert object with validationFingerprints
 * @returns {{ secret: string, id: string }}
 */
function extractFingerprintData(alert) {
  const fingerprint = getMostRecentFingerprint(alert);
  if (!fingerprint) {
    return { secret: 'N/A', id: 'N/A' };
  }

  const fingerprintData = parseFingerprintJson(fingerprint);
  if (!fingerprintData) {
    return { secret: 'N/A', id: 'N/A' };
  }

  return {
    secret: fingerprintData.secret || 'N/A',
    id: fingerprintData.id || 'N/A',
  };
}

async function main() {
  try {
    console.log(chalk.cyan.bold('Azure DevOps Secret Alerts Scanner'));
    console.log(chalk.gray('Using TUI AzdoService\n'));

    // Initialize the AzdoService (same as TUI uses)
    const azdoService = new AzdoService();

    // List all projects
    console.log(chalk.yellow('Fetching projects...'));
    const projects = await azdoService.listProjects();
    console.log(chalk.green(`Found ${projects.length} projects\n`));

    const allAlerts = [];
    let processedRepos = 0;
    let totalRepos = 0;

    // Count total repositories first for progress display
    for (const project of projects) {
      try {
        const repos = await azdoService.listRepositories(project.id);
        totalRepos += repos?.length || 0;
      } catch {
        // Skip projects with no access
      }
    }

    console.log(chalk.yellow(`Scanning ${totalRepos} repositories...\n`));

    // Iterate through all projects and repositories
    for (const project of projects) {
      let repos;
      try {
        repos = await azdoService.listRepositories(project.id);
      } catch {
        continue;
      }

      if (!repos || repos.length === 0) {
        continue;
      }

      for (const repo of repos) {
        processedRepos++;

        // Update progress
        const percentage = Math.round((processedRepos / totalRepos) * 100);
        const barLength = 40;
        const filledLength = Math.round((percentage / 100) * barLength);
        const bar =
          chalk.cyan('█'.repeat(filledLength)) +
          chalk.gray('░'.repeat(barLength - filledLength));

        process.stdout.write(
          `\r[${bar}] ${chalk.bold(percentage + '%')} | ${processedRepos}/${totalRepos} repos | ${chalk.yellow(allAlerts.length)} secrets found`
        );

        try {
          // List secret alerts for this repository
          const alerts = await azdoService.listAlerts(project.name, repo.id, {
            type: 'secret',
          });

          if (alerts && alerts.length > 0) {
            // For each alert, fetch full details to get fingerprint data
            for (const alert of alerts) {
              try {
                const alertDetails = await azdoService.getAlert(
                  project.name,
                  repo.id,
                  alert.alertId,
                  { includeFingerprint: true }
                );

                allAlerts.push({
                  project,
                  repo,
                  alert: alertDetails,
                });
              } catch {
                // Use basic alert if details fetch fails
                allAlerts.push({
                  project,
                  repo,
                  alert,
                });
              }
            }
          }
        } catch {
          // Skip repositories without advanced security enabled
        }
      }
    }

    // Clear progress line
    console.log('\n');

    if (allAlerts.length === 0) {
      console.log(chalk.gray('No secret alerts found in the organization.'));
      process.exit(0);
    }

    console.log(
      chalk.green.bold(`\nFound ${allAlerts.length} secret alerts:\n`)
    );
    console.log(chalk.gray('─'.repeat(80)));

    // Display each alert with the requested information
    for (const { project, repo, alert } of allAlerts) {
      const fingerprintData = extractFingerprintData(alert);
      const filePaths = getFilePaths(alert);

      console.log(chalk.bold.cyan(`Alert #${alert.alertId}`));
      console.log(
        chalk.gray('  Project Name:      ') + chalk.white(project.name)
      );
      console.log(chalk.gray('  Project ID:        ') + chalk.dim(project.id));
      console.log(chalk.gray('  Repo Name:         ') + chalk.white(repo.name));
      console.log(chalk.gray('  Repo ID:           ') + chalk.dim(repo.id));
      console.log(
        chalk.gray('  Alert Title:       ') +
          chalk.white(alert.title || alert.ruleName || 'N/A')
      );
      console.log(
        chalk.gray('  Fingerprint Secret:') +
          chalk.yellow(` ${fingerprintData.secret}`)
      );
      console.log(
        chalk.gray('  Fingerprint ID:    ') + chalk.yellow(fingerprintData.id)
      );
      console.log(chalk.gray('  File(s):           ') + chalk.blue(filePaths));
      console.log(chalk.gray('─'.repeat(80)));
    }

    console.log(
      chalk.green.bold(`\nTotal: ${allAlerts.length} secret alerts found`)
    );

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
