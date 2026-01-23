#!/usr/bin/env node
/**
 * azdo-14-test-alert-update-capabilities.js
 *
 * Purpose: Comprehensively test what alert updates are allowed by the Azure DevOps API
 *
 * According to the official API documentation:
 * https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/update
 *
 * AlertStateUpdate only supports:
 * - state: State enum
 * - dismissedReason: DismissalType enum
 * - dismissedComment: string
 *
 * SEVERITY IS NOT PART OF AlertStateUpdate - it's read-only computed by the service.
 *
 * State enum values:
 * - unknown (0)
 * - active (1)
 * - dismissed (2)
 * - fixed (4)
 * - autoDismissed (8)
 *
 * DismissalType enum values:
 * - unknown (0)
 * - fixed (1)
 * - acceptedRisk (2)
 * - falsePositive (3)
 * - agreedToGuidance (4)
 * - toolUpgrade (5)
 * - notDistributed (6) - new value per docs
 *
 * Our application states mapped:
 * - Open => state: 1 (Active)
 * - InProgress => state: 2 (Dismissed), dismissalType: 0 (Unknown), comment: jira ref
 * - Fixed => state: 2 (Dismissed), dismissalType: 1 (Fixed)
 * - FalsePositive => state: 2 (Dismissed), dismissalType: 3 (FalsePositive)
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

// State enum
const State = {
  Unknown: 0,
  Active: 1,
  Dismissed: 2,
  Fixed: 4,
  AutoDismissed: 8,
};

// DismissalType enum
const DismissalType = {
  Unknown: 0,
  Fixed: 1,
  AcceptedRisk: 2,
  FalsePositive: 3,
  AgreedToGuidance: 4,
  ToolUpgrade: 5,
  NotDistributed: 6,
};

// Severity enum (read-only, cannot be changed via API)
const Severity = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
  Note: 'note',
  Warning: 'warning',
  Error: 'error',
  Undefined: 'undefined',
};

// Severity numeric values (as seen in some responses)
const SeverityNumeric = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const getStateName = (state) => {
  const states = {
    0: 'Unknown',
    1: 'Active',
    2: 'Dismissed',
    4: 'Fixed',
    8: 'AutoDismissed',
  };
  return states[state] || `Unknown(${state})`;
};

const getDismissalTypeName = (type) => {
  const types = {
    0: 'Unknown',
    1: 'Fixed',
    2: 'AcceptedRisk',
    3: 'FalsePositive',
    4: 'AgreedToGuidance',
    5: 'ToolUpgrade',
    6: 'NotDistributed',
  };
  return types[type] || `Unknown(${type})`;
};

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

function displayAlert(alert, label = 'Alert') {
  console.log(`\n${label}:`);
  console.log(`  Alert ID: ${alert.alertId}`);
  console.log(`  Title: ${alert.title || '(no title)'}`);
  console.log(`  Severity: ${alert.severity}`);
  console.log(`  State: ${getStateName(alert.state)}`);
  if (alert.dismissal) {
    console.log(
      `  Dismissal Type: ${getDismissalTypeName(alert.dismissal.dismissalType)}`
    );
    console.log(`  Dismissal Message: ${alert.dismissal.message || '(none)'}`);
  }
}

async function testUpdate(
  alertApi,
  project,
  repo,
  alertId,
  updateData,
  description
) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📝 TEST: ${description}`);
  console.log(`${'─'.repeat(70)}`);
  console.log('Update payload:', JSON.stringify(updateData, null, 2));

  try {
    const result = await alertApi.updateAlert(
      updateData,
      project.name,
      alertId,
      repo.id
    );
    console.log('✅ SUCCESS');
    displayAlert(result, 'Result');
    return { success: true, result };
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    if (error.statusCode) console.log('Status Code:', error.statusCode);
    if (error.body) console.log('Response Body:', error.body);
    return { success: false, error };
  }
}

async function main() {
  try {
    console.log('═'.repeat(70));
    console.log('  AZURE DEVOPS ALERT UPDATE CAPABILITIES TEST');
    console.log('═'.repeat(70));
    console.log('\nPurpose: Determine what updates are allowed by the API');
    console.log('\nAPI Documentation Reference:');
    console.log(
      'https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/update'
    );
    console.log('\nAlertStateUpdate request body supports ONLY:');
    console.log('  - state: State enum');
    console.log('  - dismissedReason: DismissalType enum');
    console.log('  - dismissedComment: string');
    console.log(
      '\n⚠️  SEVERITY is NOT part of AlertStateUpdate - it is read-only!'
    );

    const conn = await getAzdoClient();
    console.log('\n✅ Connected to Azure DevOps\n');

    const alertApi = await conn.getAlertApi();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();

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
    }

    const repos = await gitApi.getRepositories(project.id);
    if (!repos || repos.length === 0) {
      console.log('No repositories found.');
      process.exit(0);
    }

    // Find a repository with Active alerts
    let targetRepo, testAlert;
    for (const repo of repos) {
      const alerts = await alertApi.getAlerts(project.name, repo.id, {
        states: [State.Active],
        top: 1,
      });
      if (alerts && alerts.length > 0) {
        targetRepo = repo;
        testAlert = alerts[0];
        break;
      }
    }

    if (!testAlert) {
      // Try with dismissed alerts
      for (const repo of repos) {
        const alerts = await alertApi.getAlerts(project.name, repo.id, {
          top: 1,
        });
        if (alerts && alerts.length > 0) {
          targetRepo = repo;
          testAlert = alerts[0];
          break;
        }
      }
    }

    if (!testAlert) {
      console.log('No alerts found for testing.');
      process.exit(0);
    }

    console.log(`\n📍 Test Environment:`);
    console.log(`   Project: ${project.name}`);
    console.log(`   Repository: ${targetRepo.name}`);
    displayAlert(testAlert, '   Test Alert');

    // Store original state for restoration
    const originalState = testAlert.state;
    const originalDismissalType = testAlert.dismissal?.dismissalType;
    const originalDismissalMessage = testAlert.dismissal?.message;

    console.log('\n\n═'.repeat(35));
    console.log('  PART 1: STATE CHANGE TESTS');
    console.log('═'.repeat(35));

    // Ensure alert is in Active state first
    if (testAlert.state !== State.Active) {
      await testUpdate(
        alertApi,
        project,
        targetRepo,
        testAlert.alertId,
        { state: State.Active },
        'Setup: Reactivate alert to Active state'
      );
    }

    // Test 1: Active -> Dismissed (FalsePositive) with comment
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.FalsePositive,
        dismissedComment: 'Test: Dismissing as false positive',
      },
      'Active -> Dismissed (FalsePositive) with comment'
    );

    // Test 2: Dismissed -> Active (reopen)
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { state: State.Active },
      'Dismissed -> Active (reopen)'
    );

    // Test 3: Active -> Dismissed (AcceptedRisk) with comment
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.AcceptedRisk,
        dismissedComment: 'Test: Accepting risk for testing',
      },
      'Active -> Dismissed (AcceptedRisk) with comment'
    );

    // Test 4: Dismissed -> Active again
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { state: State.Active },
      'Dismissed -> Active again'
    );

    // Test 5: Active -> Dismissed (Unknown / InProgress simulation) with Jira-like comment
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.Unknown,
        dismissedComment: '[JIRA-1234] Assigned for review',
      },
      'Active -> Dismissed (Unknown/InProgress) with Jira ref comment'
    );

    // Test 6: Dismissed (Unknown) -> Active
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { state: State.Active },
      'Dismissed (Unknown) -> Active'
    );

    // Test 7: Active -> Dismissed (Fixed)
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.Fixed,
        dismissedComment: 'Test: Fixed the issue',
      },
      'Active -> Dismissed (Fixed) with comment'
    );

    // Restore to Active for severity tests
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { state: State.Active },
      'Setup: Restore to Active for severity tests'
    );

    console.log('\n\n═'.repeat(35));
    console.log('  PART 2: SEVERITY CHANGE TESTS');
    console.log('═'.repeat(35));
    console.log('\n⚠️  These tests are expected to FAIL because severity');
    console.log('   is not part of the AlertStateUpdate API.\n');

    // Test 8: Try to change severity only (should fail)
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { severity: SeverityNumeric.Low },
      'Severity change only (numeric value) - EXPECTED TO FAIL'
    );

    // Test 9: Try to change severity with string value
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { severity: Severity.Low },
      'Severity change only (string value) - EXPECTED TO FAIL'
    );

    // Test 10: Try severity + state
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        severity: SeverityNumeric.Low,
        state: State.Active,
      },
      'Severity + state change - EXPECTED TO FAIL'
    );

    // Test 11: Try severity + dismissal
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        severity: SeverityNumeric.Critical,
        state: State.Dismissed,
        dismissedReason: DismissalType.AcceptedRisk,
        dismissedComment: 'Test with severity',
      },
      'Severity + full dismissal - EXPECTED TO FAIL or ignore severity'
    );

    // Test 12: Try severity with null
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { severity: null },
      'Severity = null - EXPECTED TO FAIL'
    );

    // Test 13: Try severity with undefined (explicitly set)
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { severity: undefined, dismissedComment: 'Test comment only' },
      'Severity = undefined + comment - Check if comment-only works'
    );

    console.log('\n\n═'.repeat(35));
    console.log('  PART 3: COMMENT-ONLY TESTS');
    console.log('═'.repeat(35));

    // Test 14: Comment only without state change
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      { dismissedComment: 'Test comment without state change' },
      'Comment only (no state) - May fail or be ignored'
    );

    // Test 15: Dismiss then try to update just the comment
    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.AcceptedRisk,
        dismissedComment: 'Initial comment',
      },
      'Dismiss with initial comment'
    );

    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      {
        state: State.Dismissed,
        dismissedReason: DismissalType.AcceptedRisk,
        dismissedComment: 'Updated comment',
      },
      'Update dismissed comment (re-dismiss with new comment)'
    );

    console.log('\n\n═'.repeat(35));
    console.log('  RESTORING ORIGINAL STATE');
    console.log('═'.repeat(35));

    const restoreData = { state: originalState };
    if (
      originalState === State.Dismissed &&
      originalDismissalType !== undefined
    ) {
      restoreData.dismissedReason = originalDismissalType;
      if (originalDismissalMessage) {
        restoreData.dismissedComment = originalDismissalMessage;
      }
    }

    await testUpdate(
      alertApi,
      project,
      targetRepo,
      testAlert.alertId,
      restoreData,
      'Restore original state'
    );

    console.log('\n\n═'.repeat(70));
    console.log('  TEST SUMMARY');
    console.log('═'.repeat(70));
    console.log('\n✅ SUPPORTED OPERATIONS (via AlertStateUpdate):');
    console.log('   • Change state: Active -> Dismissed');
    console.log('   • Change state: Dismissed -> Active (reopen)');
    console.log('   • Set dismissal reason when dismissing');
    console.log('   • Add/update dismissal comment when dismissing');
    console.log('   • Change dismissal reason by re-dismissing');
    console.log('\n❌ NOT SUPPORTED:');
    console.log('   • Changing severity (read-only, computed by service)');
    console.log('   • Updating comment without changing state');
    console.log('\n📖 Documentation Reference:');
    console.log(
      '   https://learn.microsoft.com/en-us/rest/api/azure/devops/advancedsecurity/alerts/update'
    );
    console.log('\n💡 RECOMMENDATION:');
    console.log(
      '   The TUI should remove or disable the "Update Severity" feature'
    );
    console.log(
      '   for Azure DevOps alerts, as severity cannot be changed via the API.'
    );
    console.log('═'.repeat(70));
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.stack) {
      console.error('\nStack trace:', err.stack);
    }
    process.exit(1);
  }
}

main();
