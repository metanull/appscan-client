#!/usr/bin/env node
/**
 * azdo-06-list-alerts-new.js
 * 
 * Purpose: List Advanced Security alerts for repositories
 * Package APIs: getAlertApi(), getAlerts()
 * Self-contained: Yes
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
    
    // Get Alert API
    const alertApi = await conn.getAlertApi();
    console.log('✅ Connected to Alert API\n');
    
    // Get project (from env or use first project)
    const targetProjectName = process.env.AZDO_PROJECT;
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    
    if (!projects || projects.length === 0) {
      console.log('No projects found.');
      process.exit(0);
    }
    
    let project;
    if (targetProjectName) {
      project = projects.find(p => p.name === targetProjectName);
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
    const gitApi = await conn.getGitApi();
    const repos = await gitApi.getRepositories(project.id);
    
    if (!repos || repos.length === 0) {
      console.log(`No repositories found in project "${project.name}".`);
      process.exit(0);
    }
    
    console.log(`=== Advanced Security Alerts for Project: ${project.name} ===\n`);
    console.log(`Found ${repos.length} repository(ies)\n`);
    
    // List alerts for each repository
    for (const repo of repos) {
      console.log(`--- Repository: ${repo.name} ---`);
      
      try {
        // Fetch alerts for this repository
        const alerts = await alertApi.getAlerts(project.name, repo.id);
        
        if (!alerts || alerts.length === 0) {
          console.log('  No alerts found\n');
          continue;
        }
        
        console.log(`  Found ${alerts.length} alert(s):\n`);
        
        // Group alerts by type
        const byType = {};
        const bySeverity = {};
        const byState = {};
        
        for (const alert of alerts) {
          const type = alert.alertType || 'Unknown';
          const severity = alert.severity || 'Unknown';
          const state = alert.state || 'Unknown';
          
          byType[type] = (byType[type] || 0) + 1;
          bySeverity[severity] = (bySeverity[severity] || 0) + 1;
          byState[state] = (byState[state] || 0) + 1;
        }
        
        console.log('  Summary:');
        console.log('    By Type:', JSON.stringify(byType));
        console.log('    By Severity:', JSON.stringify(bySeverity));
        console.log('    By State:', JSON.stringify(byState));
        console.log();
        
        // Show first 3 alerts
        const displayAlerts = alerts.slice(0, 3);
        console.log('  First 3 alerts:');
        for (const alert of displayAlerts) {
          console.log(`    [${alert.alertId || alert.id}] ${alert.title || alert.ruleName || '(no title)'}`);
          console.log(`      Type: ${alert.alertType || 'N/A'}, Severity: ${alert.severity || 'N/A'}, State: ${alert.state || 'N/A'}`);
        }
        console.log();
        
      } catch (err) {
        if (err.statusCode === 404) {
          console.log('  ℹ️  Advanced Security not enabled or no alerts\n');
        } else {
          console.log(`  ❌ Error: ${err.message}\n`);
        }
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
