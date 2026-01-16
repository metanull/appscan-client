#!/usr/bin/env node
/**
 * azdo-05-alert-api-new.js
 * 
 * Purpose: Discover and test Advanced Security Alert API availability
 * Package APIs: getAlertApi() (Advanced Security Alerts)
 * Self-contained: Yes
 * 
 * NOTE: Advanced Security MANAGEMENT APIs (for checking/configuring enablement)
 * are NOT available in azure-devops-node-api package. Only Alert APIs are available.
 * For management operations, direct REST calls are required.
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

async function main() {
  try {
    // Connect to Azure DevOps
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
    
    console.log('=== Advanced Security Alert API Discovery ===\n');
    
    // Check if Alert API is available
    console.log('Checking API availability...');
    const hasAlertApi = typeof conn.getAlertApi === 'function';
    console.log(`  getAlertApi(): ${hasAlertApi ? '✅ Available' : '❌ Not Available'}`);
    
    if (!hasAlertApi) {
      console.log('\n❌ Alert API not available in this package version.');
      console.log('Please upgrade azure-devops-node-api to access Advanced Security features.');
      process.exit(1);
    }
    
    // Create Alert API instance
    console.log('\nCreating Alert API instance...');
    const alertApi = await conn.getAlertApi();
    console.log('✅ Alert API instance created successfully');
    
    // Get a project and repo to test with
    console.log('\n=== Testing Alert API with Real Data ===\n');
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    
    if (!projects || projects.length === 0) {
      console.log('No projects found to test with.');
      process.exit(0);
    }
    
    // Use target project or first project
    const targetProjectName = process.env.AZDO_PROJECT || projects[0].name;
    const project = projects.find(p => p.name === targetProjectName) || projects[0];
    console.log(`Using project: ${project.name}`);
    
    // Get repositories
    const gitApi = await conn.getGitApi();
    const repos = await gitApi.getRepositories(project.id);
    
    if (!repos || repos.length === 0) {
      console.log(`No repositories found in project "${project.name}".`);
      process.exit(0);
    }
    
    console.log(`Found ${repos.length} repository(ies)\n`);
    
    // Test Alert API on first repository
    const repo = repos[0];
    console.log(`Testing alerts for repository: ${repo.name}`);
    console.log(`Repository ID: ${repo.id}\n`);
    
    try {
      // Fetch alerts (limit to 10 for testing)
      const alerts = await alertApi.getAlerts(project.name, repo.id, 10);
      
      if (!alerts || alerts.length === 0) {
        console.log('✅ Alert API works! No alerts found in this repository.');
      } else {
        console.log(`✅ Alert API works! Found ${alerts.length} alert(s):\n`);
        
        // Display first 5 alerts
        const displayAlerts = alerts.slice(0, 5);
        for (const alert of displayAlerts) {
          console.log(`Alert ID: ${alert.alertId || alert.id}`);
          console.log(`  Title: ${alert.title || alert.ruleName || '(no title)'}`);
          console.log(`  Type: ${alert.alertType || 'N/A'}`);
          console.log(`  Severity: ${alert.severity || 'N/A'}`);
          console.log(`  State: ${alert.state || 'N/A'}`);
          console.log(`  First Seen: ${alert.firstSeenDate || 'N/A'}`);
          console.log();
        }
        
        if (alerts.length > 5) {
          console.log(`... and ${alerts.length - 5} more alert(s)`);
        }
      }
    } catch (alertErr) {
      if (alertErr.statusCode === 404) {
        console.log('ℹ️  Advanced Security not enabled for this repository.');
      } else {
        throw alertErr;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log('✅ Alert API is available and functional');
    console.log('\n📝 Note: Advanced Security MANAGEMENT APIs (enablement settings)');
    console.log('   are NOT available in the package and require direct REST calls.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
