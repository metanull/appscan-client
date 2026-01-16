#!/usr/bin/env node
/**
 * azdo-09-alert-metadata.js
 * 
 * Purpose: Demonstrate adding custom metadata to Advanced Security alerts
 * Package APIs: getAlertApi(), getAlerts(), getAlert(), updateAlert()
 * Self-contained: Yes
 * 
 * This script demonstrates TWO approaches:
 * 1. Using updateAlertsMetadata (only supports Azure DevOps work items)
 * 2. Using updateAlert with dismissedComment (supports custom metadata via structured JSON)
 * 
 * FINDINGS FROM TESTING:
 * - updateAlertsMetadata API only supports rel="workitem" with Azure DevOps work item URLs
 * - Custom "rel" types cause "Invalid metadata type" errors
 * - WORKAROUND: Store custom metadata as structured JSON in dismissedComment field
 * 
 * RECOMMENDED APPROACH FOR EXTERNAL SYSTEMS:
 * - Use updateAlert() with dismissedComment containing JSON metadata
 * - Store tracking IDs, Jira URLs, labels, etc. as JSON in the comment
 * - Parse the JSON when reading the alert to extract metadata
 * - This approach works without requiring Azure DevOps work items
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
 * Display alert details including metadata
 */
function displayAlert(alert, label = 'Alert', orgUrl, project, repo) {
  console.log(`\n${label}:`);
  console.log(`  Alert ID: ${alert.alertId}`);
  console.log(`  Title: ${alert.title || '(no title)'}`);
  console.log(`  Type: ${alert.alertType}`);
  console.log(`  Severity: ${alert.severity}`);
  console.log(`  State: ${getStateName(alert.state)}`);
  
  // Construct web URL
  const webUrl = `${orgUrl}/${project.name}/_git/${repo.name}/alerts/${alert.alertId}`;
  console.log(`  Web URL: ${webUrl}`);
  
  // Display dismissal info (which may contain our custom metadata)
  if (alert.dismissal) {
    console.log(`  Dismissal:`);
    console.log(`    Type: ${getDismissalTypeName(alert.dismissal.dismissalType)}`);
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
  
  // Display work item relations if exists
  if (alert.relations && alert.relations.length > 0) {
    console.log(`  Work Item Links (${alert.relations.length}):`);
    alert.relations.forEach((relation, index) => {
      console.log(`    [${index}] ${relation.url || '(no URL)'}`);
    });
  }
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
 * Wait for a moment to make changes visible
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * MetadataOperation enum values
 */
const MetadataOperation = {
  None: 0,
  Add: 1,
  Remove: 2
};

async function main() {
  try {
    console.log('=== Azure DevOps Advanced Security Alert Metadata Demo ===\n');
    
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
          console.log(`✅ Found alert in repository: ${repo.name}\n`);
          break;
        }
      } catch (err) {
        // Skip repos without Advanced Security enabled
        continue;
      }
    }
    
    if (!targetAlert || !targetRepo) {
      console.log('❌ No alerts found in any repository.');
      console.log('   Advanced Security may not be enabled or there are no alerts.');
      process.exit(1);
    }
    
    // Display initial alert state
    displayAlert(targetAlert, '📋 Initial Alert State', orgUrl, project, targetRepo);
    
    console.log('\n⏸️  Please review the alert at the URL above.');
    console.log('   Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
    await sleep(5000);
    
    // Store original state to restore at the end
    const originalState = targetAlert.state;
    const originalDismissal = targetAlert.dismissal;
    
    // ========================================================================
    // APPROACH 1: Using Alert Comments for Custom Metadata (RECOMMENDED)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('APPROACH 1: Storing Custom Metadata in Alert Comments (RECOMMENDED)');
    console.log('='.repeat(70));
    
    console.log('\n📝 This approach stores metadata as JSON in the dismissedComment field');
    console.log('   Benefits: Works immediately, no Azure DevOps work items required');
    console.log('   Limitations: Alert must be dismissed to have a comment\n');
    
    // Create custom metadata structure
    const customMetadata = {
      _metadata: {
        trackingId: 'TRACK-12345',
        jiraUrl: 'https://jira.example.com/browse/SEC-9876',
        jiraIssue: 'SEC-9876',
        externalSystem: 'company-tracker',
        labels: ['critical', 'sql-injection', 'production'],
        assignee: 'security-team',
        dueDate: '2026-02-15',
        lastUpdated: new Date().toISOString()
      },
      userComment: 'Investigating SQL credential leak. Linked to Jira ticket for tracking remediation.'
    };
    
    console.log('\n📤 Adding custom metadata to alert...');
    console.log('   Metadata structure:');
    console.log(JSON.stringify(customMetadata._metadata, null, 2));
    
    // Check if alert is already dismissed
    if (targetAlert.state === 2) {
      console.log('\n⚠️  Alert is already dismissed. Reopening first...');
      await alertApi.updateAlert(
        { state: 1 }, // Active
        project.name,
        targetAlert.alertId,
        targetRepo.id
      );
      await sleep(1000);
    }
    
    // Update alert with metadata in comment
    const metadataUpdate = {
      state: 2, // Dismissed
      dismissedReason: 2, // AcceptedRisk
      dismissedComment: JSON.stringify(customMetadata)
    };
    
    let updatedAlert = await alertApi.updateAlert(
      metadataUpdate,
      project.name,
      targetAlert.alertId,
      targetRepo.id
    );
    
    console.log('\n✅ Metadata stored successfully!');
    await sleep(1000);
    updatedAlert = await alertApi.getAlert(project.name, targetAlert.alertId, targetRepo.id);
    displayAlert(updatedAlert, '📋 Alert with Custom Metadata', orgUrl, project, targetRepo);
    
    // ========================================================================
    // STEP 2: Reading and Parsing Custom Metadata
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('STEP 2: Reading and Parsing Custom Metadata');
    console.log('='.repeat(70));
    
    if (updatedAlert.dismissal?.message) {
      try {
        const parsedData = JSON.parse(updatedAlert.dismissal.message);
        
        console.log('\n✅ Successfully parsed metadata from alert:');
        console.log(`   Tracking ID: ${parsedData._metadata.trackingId}`);
        console.log(`   Jira URL: ${parsedData._metadata.jiraUrl}`);
        console.log(`   Jira Issue: ${parsedData._metadata.jiraIssue}`);
        console.log(`   External System: ${parsedData._metadata.externalSystem}`);
        console.log(`   Labels: ${parsedData._metadata.labels.join(', ')}`);
        console.log(`   Assignee: ${parsedData._metadata.assignee}`);
        console.log(`   Due Date: ${parsedData._metadata.dueDate}`);
        console.log(`   Last Updated: ${parsedData._metadata.lastUpdated}`);
        console.log(`   User Comment: ${parsedData.userComment}`);
      } catch (err) {
        console.log(`\n❌ Failed to parse metadata: ${err.message}`);
      }
    }
    
    // ========================================================================
    // STEP 3: Updating Custom Metadata
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('STEP 3: Updating Custom Metadata');
    console.log('='.repeat(70));
    
    // Parse existing metadata, update it, and save back
    const existingData = JSON.parse(updatedAlert.dismissal.message);
    existingData._metadata.status = 'in-progress';
    existingData._metadata.lastUpdated = new Date().toISOString();
    existingData._metadata.labels.push('investigating');
    existingData.userComment += ' - Investigation started.';
    
    console.log('\n📤 Updating metadata...');
    console.log(`   Added status: ${existingData._metadata.status}`);
    console.log(`   Added label: investigating`);
    
    // First, reopen the alert
    await alertApi.updateAlert(
      { state: 1 }, // Active
      project.name,
      targetAlert.alertId,
      targetRepo.id
    );
    
    await sleep(500);
    
    // Then dismiss again with updated metadata
    const updateMetadata2 = {
      state: 2, // Dismissed
      dismissedReason: 2, // AcceptedRisk
      dismissedComment: JSON.stringify(existingData)
    };
    
    updatedAlert = await alertApi.updateAlert(
      updateMetadata2,
      project.name,
      targetAlert.alertId,
      targetRepo.id
    );
    
    console.log('\n✅ Metadata updated successfully!');
    await sleep(1000);
    updatedAlert = await alertApi.getAlert(project.name, targetAlert.alertId, targetRepo.id);
    displayAlert(updatedAlert, '📋 Alert with Updated Metadata', orgUrl, project, targetRepo);
    
    // ========================================================================
    // APPROACH 2: Testing updateAlertsMetadata (Azure DevOps Work Items Only)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('APPROACH 2: Azure DevOps Work Item Linking (Limited Use)');
    console.log('='.repeat(70));
    
    console.log('\n⚠️  This approach only works with Azure DevOps work items');
    console.log('   It does NOT support custom metadata types (Jira, tracking IDs, etc.)');
    console.log('   Custom rel types cause "Invalid metadata type" errors\n');
    
    // Demonstrate that custom metadata types don't work
    console.log('📤 Testing custom metadata types (these will fail)...\n');
    
    const testCases = [
      { rel: 'jira', url: 'https://jira.example.com/browse/SEC-12345', description: 'Jira URL' },
      { rel: 'tracking-id', url: 'https://tracker.example.com/TRACK-12345', description: 'Tracking ID' },
      { rel: 'external', url: 'https://example.com/issue/123', description: 'External system' }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`   Testing rel="${testCase.rel}" (${testCase.description})...`);
        await alertApi.updateAlertsMetadata(
          [{
            alertId: targetAlert.alertId,
            metadata: [{
              op: MetadataOperation.Add,
              value: { rel: testCase.rel, url: testCase.url }
            }]
          }],
          project.name,
          targetRepo.id
        );
        console.log(`   ✅ SUCCESS - rel="${testCase.rel}" worked!`);
      } catch (err) {
        console.log(`   ❌ FAILED - ${err.message}`);
      }
    }
    
    console.log('\n   As demonstrated, only rel="workitem" is supported.');
    console.log('   For external systems, use APPROACH 1 (alert comments).');
    
    // ========================================================================
    // STEP 4: Restore Original Alert State
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('STEP 4: Restoring Original Alert State');
    console.log('='.repeat(70));
    
    console.log('\n📤 Restoring alert to original state...');
    
    const restoreUpdate = {
      state: originalState,
      dismissedReason: originalDismissal?.dismissalType || 0,
      dismissedComment: originalDismissal?.message || undefined
    };
    
    await alertApi.updateAlert(
      restoreUpdate,
      project.name,
      targetAlert.alertId,
      targetRepo.id
    );
    
    console.log('✅ Alert restored to original state');
    await sleep(1000);
    const restoredAlert = await alertApi.getAlert(project.name, targetAlert.alertId, targetRepo.id);
    displayAlert(restoredAlert, '📋 Restored Alert State', orgUrl, project, targetRepo);
    
    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY OF FINDINGS');
    console.log('='.repeat(70));
    
    console.log('\n✅ RECOMMENDED SOLUTION: Use Alert Comments for Custom Metadata');
    console.log('   • Store metadata as JSON in dismissedComment field');
    console.log('   • Supports any custom fields: tracking IDs, Jira URLs, labels, etc.');
    console.log('   • Works immediately without Azure DevOps work items');
    console.log('   • Easy to parse and update programmatically');
    console.log('   • Limitation: Alert must be in Dismissed state\n');
    
    console.log('📝 Example Metadata Structure:');
    console.log('   {');
    console.log('     "_metadata": {');
    console.log('       "trackingId": "TRACK-12345",');
    console.log('       "jiraUrl": "https://jira.example.com/browse/SEC-9876",');
    console.log('       "jiraIssue": "SEC-9876",');
    console.log('       "labels": ["critical", "sql-injection"],');
    console.log('       "assignee": "security-team"');
    console.log('     },');
    console.log('     "userComment": "Human-readable comment"');
    console.log('   }\n');
    
    console.log('⚠️  updateAlertsMetadata API Limitations:');
    console.log('   • Only supports rel="workitem" with Azure DevOps work items');
    console.log('   • Custom rel types (jira, tracking-id, external, etc.) are rejected');
    console.log('   • Not suitable for external system integration\n');
    
    console.log('💡 Implementation Recommendations:');
    console.log('   1. Use updateAlert() with JSON in dismissedComment for custom metadata');
    console.log('   2. Establish a standard metadata schema for your organization');
    console.log('   3. Use _metadata prefix to distinguish from user comments');
    console.log('   4. Include both metadata and human-readable comment in same field');
    console.log('   5. Create helper functions to serialize/deserialize metadata\n');
    
    console.log('🔄 Workflow Example:');
    console.log('   1. Alert detected → Dismiss with AcceptedRisk');
    console.log('   2. Add metadata: tracking ID, Jira URL, labels');
    console.log('   3. Update metadata as investigation progresses');
    console.log('   4. Query alerts and parse metadata for reporting');
    console.log('   5. When fixed → Update state to Fixed, metadata persists\n');
    
    console.log('✅ Script completed successfully!');
    console.log(`   Alert URL: ${orgUrl}/${project.name}/_git/${targetRepo.name}/alerts/${targetAlert.alertId}`);
    console.log('   Custom metadata has been demonstrated using alert comments.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.statusCode) {
      console.error(`   Status Code: ${err.statusCode}`);
    }
    if (err.result) {
      console.error(`   Details:`, JSON.stringify(err.result, null, 2));
    }
    process.exit(1);
  }
}

main();
