#!/usr/bin/env node
/**
 * azdo-09-close-reopen-demo.js
 * 
 * Purpose: Demonstrate closing and reopening an alert with different reasons and metadata
 * Package APIs: getAlertApi(), getAlerts(), getAlert(), updateAlert()
 * Self-contained: Yes
 * 
 * This script demonstrates:
 * 1. Selecting the first available alert
 * 2. Displaying its web URL
 * 3. Closing the alert with metadata and a specific reason
 * 4. Reopening it
 * 5. Closing it again with different reason and metadata
 * 6. Reopening it one last time
 * 
 * Only acts on ONE SINGLE alert and verifies each change.
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

/**
 * Get Azure DevOps connection
 */
async function getAzdoClient() {
  const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
    ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
    : undefined;
  
  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
  const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;
  
  if (!orgUrl || !pat) {
    throw new Error('Missing required environment variables: AZDO_ORG_URL and AZDO_PAT');
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
    8: 'AutoDismissed'
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
    5: 'ToolUpgrade'
  };
  return types[dismissalType] || `Unknown(${dismissalType})`;
}

/**
 * Display alert details including metadata
 */
function displayAlert(alert, label = 'Alert', webUrl) {
  console.log(`\n${label}:`);
  console.log(`  Alert ID: ${alert.alertId}`);
  console.log(`  Title: ${alert.title || '(no title)'}`);
  console.log(`  Type: ${alert.alertType}`);
  console.log(`  Severity: ${alert.severity}`);
  console.log(`  State: ${getStateName(alert.state)}`);
  
  if (webUrl) {
    console.log(`  Web URL: ${webUrl}`);
  }
  
  if (alert.dismissal) {
    console.log(`  Dismissal:`);
    console.log(`    Reason: ${getDismissalTypeName(alert.dismissal.dismissalType)}`);
    if (alert.dismissal.message) {
      console.log(`    Comment: ${alert.dismissal.message}`);
      
      // Try to parse as JSON metadata
      try {
        const metadata = JSON.parse(alert.dismissal.message);
        if (metadata._metadata) {
          console.log(`    Parsed Metadata:`);
          Object.entries(metadata._metadata).forEach(([key, value]) => {
            console.log(`      ${key}: ${JSON.stringify(value)}`);
          });
        }
      } catch {
        // Not JSON, just a regular comment
      }
    }
  }
}

/**
 * Create a JSON comment with embedded metadata
 */
function createMetadataComment(comment, metadata) {
  return JSON.stringify({
    comment,
    _metadata: metadata
  }, null, 2);
}

/**
 * Update alert and verify the change
 */
async function updateAndVerify(alertApi, project, repo, alert, stateUpdate, description, webUrl) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔄 ${description}`);
  console.log('='.repeat(70));
  
  const stateStr = stateUpdate.state ? `state=${getStateName(stateUpdate.state)}` : '';
  const reasonStr = stateUpdate.dismissedReason ? `reason=${getDismissalTypeName(stateUpdate.dismissedReason)}` : '';
  const commentStr = stateUpdate.dismissedComment ? `comment="${stateUpdate.dismissedComment.substring(0, 50)}${stateUpdate.dismissedComment.length > 50 ? '...' : ''}"` : '';
  
  const updates = [stateStr, reasonStr, commentStr].filter(s => s).join(', ');
  console.log(`   Updating: ${updates}`);
  
  const updatedAlert = await alertApi.updateAlert(stateUpdate, project.name, alert.alertId, repo.id);
  
  console.log(`✅ Update successful`);
  displayAlert(updatedAlert, '   Updated Alert', webUrl);
  
  // Verify the change
  const verifiedAlert = await alertApi.getAlert(project.name, alert.alertId, repo.id);
  
  if (verifiedAlert.state !== updatedAlert.state) {
    console.log(`⚠️  Warning: State verification failed. Expected ${getStateName(updatedAlert.state)}, got ${getStateName(verifiedAlert.state)}`);
  } else {
    console.log(`✅ Change verified`);
  }
  
  return verifiedAlert;
}

/**
 * Wait for a brief moment
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log('=== Azure DevOps Alert Close/Reopen Demo with Metadata ===\n');
    
    // Connect to Azure DevOps
    const conn = await getAzdoClient();
    const connData = await conn.connect();
    const orgUrl = conn.serverUrl;
    
    console.log('✅ Connected to Azure DevOps');
    console.log(`   Organization: ${orgUrl}`);
    console.log(`   User: ${connData.authenticatedUser?.providerDisplayName || 'Unknown'}\n`);
    
    // Get APIs
    const alertApi = await conn.getAlertApi();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();
    
    // Get project
    const targetProjectName = process.env.AZDO_PROJECT;
    const projects = await coreApi.getProjects();
    
    if (!projects || projects.length === 0) {
      console.log('❌ No projects found.');
      process.exit(1);
    }
    
    let project;
    if (targetProjectName) {
      project = projects.find(p => p.name === targetProjectName);
      if (!project) {
        console.log(`❌ Project "${targetProjectName}" not found.`);
        process.exit(1);
      }
    } else {
      project = projects[0];
      console.log(`📂 Using first project: ${project.name}`);
      console.log('   (Set AZDO_PROJECT env var to choose a different project)\n');
    }
    
    // Find first repository with alerts
    const repos = await gitApi.getRepositories(project.id);
    
    if (!repos || repos.length === 0) {
      console.log(`❌ No repositories found in project "${project.name}".`);
      process.exit(1);
    }
    
    let targetAlert = undefined;
    let targetRepo = undefined;
    
    console.log('🔍 Searching for an alert to work with...\n');
    
    for (const repo of repos) {
      try {
        const alerts = await alertApi.getAlerts(project.name, repo.id, 1);
        
        if (alerts && alerts.length > 0) {
          targetAlert = alerts[0];
          targetRepo = repo;
          break;
        }
      } catch (err) {
        // Repo might not have Advanced Security enabled, skip it
        continue;
      }
    }
    
    if (!targetAlert || !targetRepo) {
      console.log('❌ No alerts found in any repository.');
      process.exit(1);
    }
    
    // Construct web URL
    const webUrl = `${orgUrl}/${project.name}/_git/${targetRepo.name}/alerts/${targetAlert.alertId}`;
    
    console.log(`✅ Found alert in repository: ${targetRepo.name}`);
    displayAlert(targetAlert, '📋 Selected Alert', webUrl);
    
    console.log(`\n⚠️  This script will ONLY modify this ONE alert.`);
    console.log(`⚠️  Please review the alert at: ${webUrl}`);
    console.log(`\n⏳ Starting operations in 3 seconds...`);
    await sleep(3000);
    
    // Save original state to restore later
    const originalState = targetAlert.state;
    const originalDismissalType = targetAlert.dismissal?.dismissalType;
    const originalDismissalMessage = targetAlert.dismissal?.message;
    
    // If alert is already dismissed, reactivate it first
    if (targetAlert.state === 2) {
      console.log(`\n⚠️  Alert is already dismissed. Reactivating first...`);
      targetAlert = await updateAndVerify(
        alertApi,
        project,
        targetRepo,
        targetAlert,
        { state: 1 }, // Active
        'Initial: Reactivate alert to start demo',
        webUrl
      );
      await sleep(1000);
    }
    
    // Step 1: Close alert with "False Positive" reason and metadata
    const metadata1 = {
      jiraTicket: 'JIRA-12345',
      reviewedBy: 'security-team',
      reviewDate: new Date().toISOString(),
      category: 'known-safe-pattern'
    };
    
    targetAlert = await updateAndVerify(
      alertApi,
      project,
      targetRepo,
      targetAlert,
      {
        state: 2, // Dismissed
        dismissedReason: 3, // FalsePositive
        dismissedComment: createMetadataComment(
          'This is a false positive - tested pattern is safe',
          metadata1
        )
      },
      'STEP 1: Close alert as False Positive with metadata',
      webUrl
    );
    await sleep(1000);
    
    // Step 2: Reopen the alert
    targetAlert = await updateAndVerify(
      alertApi,
      project,
      targetRepo,
      targetAlert,
      { state: 1 }, // Active
      'STEP 2: Reopen the alert',
      webUrl
    );
    await sleep(1000);
    
    // Step 3: Close with different reason and metadata
    const metadata2 = {
      approvedBy: 'tech-lead',
      riskLevel: 'low',
      mitigation: 'compensating-controls-in-place',
      expiryDate: '2026-12-31',
      trackingId: 'RISK-67890'
    };
    
    targetAlert = await updateAndVerify(
      alertApi,
      project,
      targetRepo,
      targetAlert,
      {
        state: 2, // Dismissed
        dismissedReason: 2, // AcceptedRisk
        dismissedComment: createMetadataComment(
          'Risk accepted with compensating controls',
          metadata2
        )
      },
      'STEP 3: Close alert as Accepted Risk with different metadata',
      webUrl
    );
    await sleep(1000);
    
    // Step 4: Reopen one last time
    targetAlert = await updateAndVerify(
      alertApi,
      project,
      targetRepo,
      targetAlert,
      { state: 1 }, // Active
      'STEP 4: Reopen alert one last time',
      webUrl
    );
    
    // Final Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ Demo Completed Successfully');
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`  Project: ${project.name}`);
    console.log(`  Repository: ${targetRepo.name}`);
    console.log(`  Alert ID: ${targetAlert.alertId}`);
    console.log(`  Web URL: ${webUrl}`);
    console.log(`\n📋 Operations Performed:`);
    console.log(`  1. ✅ Closed as False Positive with JIRA tracking metadata`);
    console.log(`  2. ✅ Reopened alert`);
    console.log(`  3. ✅ Closed as Accepted Risk with risk management metadata`);
    console.log(`  4. ✅ Reopened alert one last time`);
    console.log(`\n  Current State: ${getStateName(targetAlert.state)}`);
    console.log(`  Original State: ${getStateName(originalState)}`);
    
    if (originalState !== targetAlert.state) {
      console.log(`\n⚠️  Note: Alert state was changed from original.`);
      console.log(`   You can restore it manually at: ${webUrl}`);
    }
    
    console.log(`\n✨ All changes were verified. Only ONE alert was modified.`);
    
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
