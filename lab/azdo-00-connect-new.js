#!/usr/bin/env node
/**
 * azdo-00-connect-new.js
 * 
 * Purpose: Test basic connection to Azure DevOps
 * Package APIs: WebApi.connect()
 * Self-contained: Yes
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

async function main() {
  try {
    // Get connection details from environment
    const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
      ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
      : undefined;
    
    const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
    const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;
    
    if (!orgUrl || !pat) {
      throw new Error('Missing required environment variables: AZDO_ORG_URL and AZDO_PAT');
    }
    
    console.log('Attempting to connect to Azure DevOps...');
    console.log('Organization URL:', orgUrl);
    
    // Create connection
    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    
    // Test connection
    const connectionData = await connection.connect();
    
    console.log('\n✅ Successfully connected to Azure DevOps!');
    console.log('\nConnection Details:');
    console.log('  Authenticated User:', connectionData.authenticatedUser?.providerDisplayName || 'Unknown');
    console.log('  Instance ID:', connectionData.instanceId || 'N/A');
    console.log('  Deployment Type:', connectionData.deploymentType || 'N/A');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    process.exit(1);
  }
}

main();
