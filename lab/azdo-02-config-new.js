#!/usr/bin/env node
/**
 * azdo-02-config-new.js
 * 
 * Purpose: Get basic connection and organization configuration info
 * Package APIs: WebApi.connect(), getCoreApi(), getProjects()
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
    
    console.log('Connecting to Azure DevOps...');
    const connectionData = await conn.connect();
    
    console.log('\n=== Connection Configuration ===\n');
    console.log('Organization URL:', conn.serverUrl);
    console.log('Authenticated User:', connectionData.authenticatedUser?.providerDisplayName || 'Unknown');
    console.log('Instance ID:', connectionData.instanceId || 'N/A');
    console.log('Deployment Type:', connectionData.deploymentType || 'N/A');
    
    // Get organization configuration via projects
    console.log('\n=== Organization Summary ===\n');
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    
    console.log('Total Projects:', projects?.length || 0);
    
    if (projects && projects.length > 0) {
      console.log('\nFirst 5 Projects:');
      const displayProjects = projects.slice(0, 5);
      for (const project of displayProjects) {
        console.log(`  - ${project.name}`);
        console.log(`    ID: ${project.id}`);
        console.log(`    State: ${project.state || 'N/A'}`);
        console.log(`    Visibility: ${project.visibility || 'N/A'}`);
        console.log(`    Last Update: ${project.lastUpdateTime || 'N/A'}`);
        console.log();
      }
      
      if (projects.length > 5) {
        console.log(`  ... and ${projects.length - 5} more projects`);
      }
    }
    
    console.log('\n=== WebApi Configuration ===\n');
    console.log('Server URL:', conn.serverUrl);
    console.log('Options:', JSON.stringify(conn.options || {}, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
