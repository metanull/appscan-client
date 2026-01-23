#!/usr/bin/env node
/**
 * azdo-13-get-alert-with-fingerprint.js
 *
 * Purpose: Get a secret alert with ValidationFingerprint expand option
 * Package APIs: getAlertApi(), getAlert() with expand parameter
 * Self-contained: Yes
 *
 * According to MS docs:
 * https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/get?view=azure-devops-rest-7.2
 *
 * The expand parameter can be set to 'ValidationFingerprint' to receive
 * the fingerprint of secret alerts.
 *
 * WARNING: The response may contain the secret in its unencrypted form.
 * Please exercise caution when using this data.
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';
import { ExpandOption } from 'azure-devops-node-api/interfaces/AlertInterfaces.js';

dotenv.config();

/**
 * Get Azure DevOps connection
 * @returns {Promise<{connection: azdev.WebApi, orgUrl: string}>}
 */
async function getAzdoClient() {
  const orgUrlFromAzureEnv =
    process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
      ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
      : undefined;

  const orgUrl =
    process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
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
  const conn = new azdev.WebApi(orgUrl, authHandler);
  await conn.connect();

  return { connection: conn, orgUrl };
}

/**
 * Build the web URL to view an alert in Azure DevOps
 * @param {string} orgUrl - Organization URL
 * @param {string} projectName - Project name
 * @param {string} repoId - Repository ID
 * @param {number} alertId - Alert ID
 * @returns {string}
 */
function buildAlertWebUrl(orgUrl, projectName, repoId, alertId) {
  return `${orgUrl}/${encodeURIComponent(projectName)}/_git/${repoId}/alerts/${alertId}`;
}

/**
 * Highlight specific fields in the JSON output
 * @param {Object} alert - Alert object
 * @param {string} alertWebUrl - Web URL to view the alert
 */
function highlightFields(alert, alertWebUrl) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 HIGHLIGHTED FIELDS');
  console.log('='.repeat(80));

  // Alert Web URL
  console.log('\n📌 ALERT WEB URL (view in browser):');
  console.log(`   ${alertWebUrl}`);

  // Truncated Secret (for comparison)
  if (alert.truncatedSecret) {
    console.log('\n🔐 TRUNCATED SECRET:');
    console.log(`   ${alert.truncatedSecret}`);
  }

  // Validation Fingerprints
  if (alert.validationFingerprints && alert.validationFingerprints.length > 0) {
    console.log('\n🔑 VALIDATION FINGERPRINTS:');
    for (let i = 0; i < alert.validationFingerprints.length; i++) {
      const fp = alert.validationFingerprints[i];
      console.log(`\n   [Fingerprint ${i + 1}]`);

      if (fp.validationFingerprintHash) {
        console.log(`   Hash: ${fp.validationFingerprintHash}`);
      }
      if (fp.c3Id) {
        console.log(`   C3 ID (Cross-Company Correlating ID): ${fp.c3Id}`);
      }
      if (fp.validityResult !== undefined) {
        const resultNames = {
          0: 'None',
          1: 'Exploitable',
          2: 'NotExploitable',
          3: 'Inconclusive',
          4: 'ValidationNotSupported',
          5: 'TransientError',
        };
        console.log(
          `   Validity Result: ${resultNames[fp.validityResult] || fp.validityResult}`
        );
      }
      if (fp.validityLastUpdatedDate) {
        console.log(`   Validity Last Updated: ${fp.validityLastUpdatedDate}`);
      }
      if (fp.assetFingerprint) {
        console.log(
          `   Asset Fingerprint: ${JSON.stringify(fp.assetFingerprint)}`
        );
      }
      if (fp.validationFingerprintJson) {
        console.log(
          `   ⚠️  Fingerprint JSON (MAY CONTAIN UNENCRYPTED SECRET):`
        );
        console.log(`   ${fp.validationFingerprintJson}`);
      }
    }
  } else {
    console.log('\n🔑 VALIDATION FINGERPRINTS: (none returned)');
  }

  // Validity Details
  if (alert.validityDetails) {
    console.log('\n✅ VALIDITY DETAILS:');
    const statusNames = {
      0: 'None',
      1: 'Unknown',
      2: 'Active',
      3: 'Inactive',
    };
    console.log(
      `   Status: ${statusNames[alert.validityDetails.validityStatus] || alert.validityDetails.validityStatus}`
    );
    if (alert.validityDetails.validityLastCheckedDate) {
      console.log(
        `   Last Checked: ${alert.validityDetails.validityLastCheckedDate}`
      );
    }
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let projectName = process.env.AZDO_PROJECT;
  let repoName = process.env.AZDO_REPOSITORY;
  let alertId;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' || args[i] === '-p') {
      projectName = args[++i];
    } else if (args[i] === '--repo' || args[i] === '-r') {
      repoName = args[++i];
    } else if (args[i] === '--alertId' || args[i] === '-a') {
      alertId = parseInt(args[++i], 10);
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node azdo-13-get-alert-with-fingerprint.js [options]

Options:
  --project, -p <name>   Project name (or set AZDO_PROJECT env var)
  --repo, -r <name>      Repository name (or set AZDO_REPOSITORY env var)
  --alertId, -a <id>     Alert ID (required, or will find first secret alert)
  --help, -h             Show this help

Environment variables:
  AZDO_ORG_URL           Azure DevOps organization URL
  AZDO_PAT               Personal Access Token
  AZDO_PROJECT           Default project name
  AZDO_REPOSITORY        Default repository name

Example:
  node azdo-13-get-alert-with-fingerprint.js --project MyProject --repo MyRepo --alertId 123
`);
      process.exit(0);
    }
  }

  try {
    console.log('=== Get Alert with ValidationFingerprint Expand ===\n');

    // Connect to Azure DevOps
    const { connection, orgUrl } = await getAzdoClient();
    console.log('✅ Connected to Azure DevOps');
    console.log(`   Org URL: ${orgUrl}\n`);

    // Get APIs
    const alertApi = await connection.getAlertApi();
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();

    // Get project
    if (!projectName) {
      const projects = await coreApi.getProjects();
      if (!projects || projects.length === 0) {
        throw new Error('No projects found');
      }
      projectName = projects[0].name;
      console.log(
        `ℹ️  No project specified, using first project: ${projectName}`
      );
    }

    const project = await coreApi.getProject(projectName);
    if (!project) {
      throw new Error(`Project "${projectName}" not found`);
    }
    console.log(`📁 Project: ${project.name}`);

    // Get repository
    const repos = await gitApi.getRepositories(project.id);
    let repo;

    if (repoName) {
      repo = repos.find((r) => r.name === repoName || r.id === repoName);
      if (!repo) {
        throw new Error(`Repository "${repoName}" not found`);
      }
    } else {
      // Find a repo with secret alerts
      for (const r of repos) {
        try {
          const criteria = { alertType: 3 }; // 3 = Secret
          const alerts = await alertApi.getAlerts(
            project.name,
            r.id,
            1,
            undefined,
            criteria
          );
          if (alerts && alerts.length > 0) {
            repo = r;
            if (!alertId) {
              alertId = alerts[0].alertId;
            }
            break;
          }
        } catch {
          // Skip repos without Advanced Security
        }
      }
      if (!repo) {
        throw new Error('No repository with secret alerts found');
      }
    }
    console.log(`📂 Repository: ${repo.name} (${repo.id})`);

    // If no alertId specified, find first secret alert
    if (!alertId) {
      const criteria = { alertType: 3 }; // 3 = Secret
      const alerts = await alertApi.getAlerts(
        project.name,
        repo.id,
        1,
        undefined,
        criteria
      );
      if (!alerts || alerts.length === 0) {
        throw new Error('No secret alerts found in this repository');
      }
      alertId = alerts[0].alertId;
      console.log(
        `ℹ️  No alertId specified, using first secret alert: ${alertId}`
      );
    }

    console.log(`🔔 Alert ID: ${alertId}`);
    console.log(`\n⏳ Fetching alert with expand=ValidationFingerprint...\n`);

    // Get alert WITH ValidationFingerprint expand option
    // Method signature: getAlert(project, alertId, repository, ref, expand)
    const alert = await alertApi.getAlert(
      project.name,
      alertId,
      repo.id,
      undefined, // ref (optional)
      ExpandOption.ValidationFingerprint // expand = 1 (ValidationFingerprint)
    );

    // Build web URL
    const alertWebUrl = buildAlertWebUrl(
      orgUrl,
      project.name,
      repo.id,
      alertId
    );

    // Output the full JSON response
    console.log('📄 FULL JSON RESPONSE:');
    console.log(JSON.stringify(alert, null, 2));

    // Highlight the fingerprint and URL
    highlightFields(alert, alertWebUrl);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.statusCode) {
      console.error(`   Status Code: ${err.statusCode}`);
    }
    process.exit(1);
  }
}

main();
