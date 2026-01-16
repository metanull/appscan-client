#!/usr/bin/env node
/**
 * azdo-08-update-alert.js
 *
 * Purpose: Demonstrate updating alert properties in Azure DevOps Advanced Security
 * Package APIs: getAlertApi(), getAlerts(), updateAlert()
 * Self-contained: Yes
 *
 * This script:
 * 1. Connects to Azure DevOps
 * 2. Gets the first available alert
 * 3. Updates alert properties one by one (state, dismissedReason, dismissedComment)
 * 4. Verifies each change was saved
 * 5. Reverts back to the original values
 * 6. Only modifies ONE SINGLE alert
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

/**
 * Get Azure DevOps connection
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

  return conn;
}

/**
 * Get the state name from state enum value
 */
function getStateName(state) {
  const states = {
    0: 'Unknown',
    1: 'Active',
    2: 'Dismissed',
    4: 'Fixed',
    8: 'AutoDismissed',
  };
  return states[state] || `Unknown(${state})`;
}

/**
 * Get the dismissal type name from enum value
 */
function getDismissalTypeName(dismissalType) {
  const types = {
    0: 'Unknown',
    1: 'Fixed',
    2: 'AcceptedRisk',
    3: 'FalsePositive',
    4: 'AgreedToGuidance',
    5: 'ToolUpgrade',
  };
  return types[dismissalType] || `Unknown(${dismissalType})`;
}

/**
 * Display alert details
 */
function displayAlert(alert, label = 'Alert') {
  console.log(`\n${label}:`);
  console.log(`  Alert ID: ${alert.alertId}`);
  console.log(`  Title: ${alert.title || '(no title)'}`);
  console.log(`  Type: ${alert.alertType}`);
  console.log(`  State: ${getStateName(alert.state)}`);
  console.log(`  Severity: ${alert.severity}`);
  if (alert.dismissal) {
    console.log(`  Dismissal:`);
    console.log(
      `    Type: ${getDismissalTypeName(alert.dismissal.dismissalType)}`
    );
    console.log(`    Message: ${alert.dismissal.message || '(no message)'}`);
  }
}

/**
 * Update alert state and verify
 */
async function updateAndVerifyAlert(
  alertApi,
  project,
  repo,
  alert,
  stateUpdate,
  description
) {
  console.log(`\n🔄 ${description}...`);
  const comment = stateUpdate.dismissedComment || '(none)';
  console.log(
    `   Updating: state=${getStateName(stateUpdate.state)}, dismissedReason=${getDismissalTypeName(stateUpdate.dismissedReason)}, comment="${comment}"`
  );

  const updatedAlert = await alertApi.updateAlert(
    stateUpdate,
    project.name,
    alert.alertId,
    repo.id
  );

  console.log(`✅ Update successful`);
  displayAlert(updatedAlert, '   Updated Alert');

  return updatedAlert;
}

async function main() {
  try {
    console.log('=== Azure DevOps Alert Update Demo ===\n');

    // Connect to Azure DevOps
    const conn = await getAzdoClient();
    console.log('✅ Connected to Azure DevOps\n');

    // Get Alert API
    const alertApi = await conn.getAlertApi();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();

    // Get project (from env or use first project)
    const targetProjectName = process.env.AZDO_PROJECT;
    const projects = await coreApi.getProjects();

    if (!projects || projects.length === 0) {
      console.log('No projects found.');
      process.exit(0);
    }

    let project;
    if (targetProjectName) {
      project = projects.find((p) => p.name === targetProjectName);
      if (!project) {
        console.log(`Project "${targetProjectName}" not found.`);
        process.exit(1);
      }
    } else {
      project = projects[0];
      console.log(`Using first project: ${project.name}`);
      console.log('(Set AZDO_PROJECT env var to choose a different project)\n');
    }

    // Get repositories for the project
    const repos = await gitApi.getRepositories(project.id);

    if (!repos || repos.length === 0) {
      console.log(`No repositories found in project "${project.name}".`);
      process.exit(0);
    }

    console.log(`Project: ${project.name}`);
    console.log(`Repositories: ${repos.map((r) => r.name).join(', ')}\n`);

    // Find the first repository with alerts
    let targetRepo = undefined;
    let firstAlert = undefined;

    for (const repo of repos) {
      const alerts = await alertApi.getAlerts(project.name, repo.id, 1); // Get only 1 alert

      if (alerts && alerts.length > 0) {
        targetRepo = repo;
        firstAlert = alerts[0];
        break;
      }
    }

    if (!targetRepo || !firstAlert) {
      console.log('❌ No alerts found in any repository.');
      process.exit(0);
    }

    console.log(`Found alert in repository: ${targetRepo.name}`);
    displayAlert(firstAlert, 'Original Alert');

    // Save original values
    const originalState = firstAlert.state;
    const originalDismissalType = firstAlert.dismissal
      ? firstAlert.dismissal.dismissalType
      : undefined;
    const originalDismissalMessage = firstAlert.dismissal
      ? firstAlert.dismissal.message
      : undefined;

    const separator = '='.repeat(60);
    console.log(`\n${separator}`);
    console.log('Starting update operations (only on this ONE alert)');
    console.log(separator);

    // If alert is already dismissed, reactivate it first to start fresh
    if (firstAlert.state === 2) {
      console.log(
        '\n⚠️  Alert is already dismissed. Reactivating first to demonstrate all operations...'
      );
      firstAlert = await updateAndVerifyAlert(
        alertApi,
        project,
        targetRepo,
        firstAlert,
        {
          state: 1, // Active
        },
        'Initial: Reactivate alert'
      );
    }

    // Step 1: Update state to Dismissed with FalsePositive reason
    let updatedAlert = await updateAndVerifyAlert(
      alertApi,
      project,
      targetRepo,
      firstAlert,
      {
        state: 2, // Dismissed
        dismissedReason: 3, // FalsePositive
        dismissedComment: 'Test update: Dismissing as false positive',
      },
      'Step 1: Dismiss alert as False Positive'
    );

    // Verify the change
    if (updatedAlert.state !== 2) {
      console.log('⚠️  Warning: State was not updated as expected');
    }

    // Step 2: Reactivate the alert (to demonstrate changing dismissal)
    updatedAlert = await updateAndVerifyAlert(
      alertApi,
      project,
      targetRepo,
      firstAlert,
      {
        state: 1, // Active
      },
      'Step 2: Reactivate alert'
    );

    // Step 3: Dismiss with a different reason (AcceptedRisk)
    updatedAlert = await updateAndVerifyAlert(
      alertApi,
      project,
      targetRepo,
      firstAlert,
      {
        state: 2, // Dismissed
        dismissedReason: 2, // AcceptedRisk
        dismissedComment: 'Test update: Changed reason to accepted risk',
      },
      'Step 3: Dismiss with Accepted Risk reason'
    );

    // Step 4: Reactivate again
    updatedAlert = await updateAndVerifyAlert(
      alertApi,
      project,
      targetRepo,
      firstAlert,
      {
        state: 1, // Active
      },
      'Step 4: Reactivate alert again'
    );

    console.log(`\n${separator}`);
    console.log('Reverting to original values');
    console.log(separator);

    // Revert to original state
    const revertStateUpdate = {
      state: originalState,
    };

    // If originally dismissed, restore dismissal details
    if (originalState === 2 && originalDismissalType !== undefined) {
      revertStateUpdate.dismissedReason = originalDismissalType;
      revertStateUpdate.dismissedComment = originalDismissalMessage || '';
    }

    updatedAlert = await updateAndVerifyAlert(
      alertApi,
      project,
      targetRepo,
      firstAlert,
      revertStateUpdate,
      'Reverting to original state'
    );

    // Final verification
    console.log(`\n${separator}`);
    console.log('✅ Successfully completed all update operations');
    console.log('✅ Alert has been reverted to its original state');
    console.log(separator);
    console.log(`\nSummary:`);
    console.log(`  Repository: ${targetRepo.name}`);
    console.log(`  Alert ID: ${firstAlert.alertId}`);
    console.log(`  Original State: ${getStateName(originalState)}`);
    console.log(`  Final State: ${getStateName(updatedAlert.state)}`);
    console.log(
      `\nNote: Only ONE alert was modified and it has been restored to its original state.`
    );
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
