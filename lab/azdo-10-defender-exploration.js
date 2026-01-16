#!/usr/bin/env node
/**
 * Azure Defender for Cloud API Exploration Script (CORRECTED)
 * 
 * This script explores the capabilities of Microsoft Defender for Cloud REST API
 * INCLUDING DevOps-specific operations via Security Connectors.
 * 
 * Required environment variables:
 * - AZURE_SUBSCRIPTION_ID: Azure subscription ID
 * - AZURE_TENANT_ID: Azure AD tenant ID
 * - AZURE_CLIENT_ID: Service principal client ID
 * - AZURE_CLIENT_SECRET: Service principal client secret
 * - AZURE_RESOURCE_GROUP: Resource group containing security connector (optional)
 * - AZURE_SECURITY_CONNECTOR: Security connector name (optional)
 * 
 * Note: Defender for Cloud Composite API provides DevOps management through
 * Security Connectors. You must have a DevOps connector configured in Azure.
 * 
 * API Reference:
 * https://learn.microsoft.com/en-us/rest/api/defenderforcloud-composite/
 * 
 * Required NPM packages:
 * - @azure/identity: For authentication
 * - @azure/arm-security: For Defender for Cloud operations
 * - @azure/arm-resourcesFor resource group operations
 */

import dotenv from 'dotenv';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { SecurityCenter } from '@azure/arm-security';
import fetch from 'node-fetch';

dotenv.config();

/**
 * Creates an authenticated Defender for Cloud client
 */
async function getDefenderClient() {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!subscriptionId) {
    throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
  }

  let credential;
  
  // Try ClientSecretCredential if all required variables are present
  if (tenantId && clientId && clientSecret) {
    console.log('Using ClientSecretCredential...');
    credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  } else {
    console.log('Using DefaultAzureCredential (requires Azure CLI login)...');
    credential = new DefaultAzureCredential();
  }

  const client = new SecurityCenter(credential, subscriptionId);
  return { client, credential, subscriptionId };
}

/**
 * Call Defender for Cloud REST API directly (for DevOps endpoints not yet in SDK)
 */
async function callDefenderAPI(credential, subscriptionId, path, apiVersion = '2024-04-01') {
  const token = await credential.getToken('https://management.azure.com/.default');
  const url = `https://management.azure.com/subscriptions/${subscriptionId}${path}?api-version=${apiVersion}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${error}`);
  }

  return await response.json();
}

/**
 * Main exploration function
 */
async function exploreDefenderForCloud() {
  console.log('='.repeat(80));
  console.log('Defender for Cloud API Exploration (CORRECTED)');
  console.log('='.repeat(80));
  console.log();

  try {
    const { client, credential, subscriptionId } = await getDefenderClient();
    console.log('✓ Successfully authenticated with Defender for Cloud');
    console.log();

    // Task 1: List security connectors
    console.log('Task 1: List Security Connectors (DevOps Integration)');
    console.log('-'.repeat(80));
    try {
      const resourceGroup = process.env.AZURE_RESOURCE_GROUP || 'list-all';
      
      if (resourceGroup === 'list-all') {
        // List all security connectors in subscription
        const path = '/providers/Microsoft.Security/securityConnectors';
        const result = await callDefenderAPI(credential, subscriptionId, path);
        
        const connectors = result.value || [];
        console.log(`Found ${connectors.length} security connectors`);
        
        if (connectors.length > 0) {
          console.log('Security connectors:');
          connectors.forEach((conn, i) => {
            console.log(`  ${i + 1}. ${conn.name}`);
            console.log(`     Type: ${conn.type}`);
            console.log(`     Location: ${conn.location}`);
            if (conn.properties?.offerings) {
              console.log(`     Offerings: ${conn.properties.offerings.map(o => o.offeringType).join(', ')}`);
            }
          });
        } else {
          console.log('⚠️  No security connectors found.');
          console.log('   You need to set up a DevOps security connector in Azure Portal:');
          console.log('   https://portal.azure.com -> Defender for Cloud -> Environment settings');
        }
      }
    } catch (error) {
      console.log(`❌ Error listing security connectors: ${error.message}`);
    }
    console.log();

    // Task 2: List Azure DevOps Organizations (via Defender)
    console.log('Task 2: List Azure DevOps Organizations via Defender');
    console.log('-'.repeat(80));
    try {
      const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
      const connectorName = process.env.AZURE_SECURITY_CONNECTOR;
      
      if (!resourceGroup || !connectorName) {
        console.log('⚠️  Skipped: Set AZURE_RESOURCE_GROUP and AZURE_SECURITY_CONNECTOR to test');
      } else {
        const path = `/resourceGroups/${resourceGroup}/providers/Microsoft.Security/securityConnectors/${connectorName}/devops/default/azureDevOpsOrgs`;
        const result = await callDefenderAPI(credential, subscriptionId, path);
        
        const orgs = result.value || [];
        console.log(`Found ${orgs.length} Azure DevOps organizations`);
        
        if (orgs.length > 0) {
          console.log('Organizations:');
          orgs.forEach((org, i) => {
            console.log(`  ${i + 1}. ${org.name}`);
            console.log(`     Onboarding State: ${org.properties?.onboardingState}`);
            console.log(`     Provisioning State: ${org.properties?.provisioningState}`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ Error listing DevOps organizations: ${error.message}`);
    }
    console.log();

    // Task 3: List Azure DevOps Projects (via Defender)
    console.log('Task 3: List Azure DevOps Projects via Defender');
    console.log('-'.repeat(80));
    try {
      const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
      const connectorName = process.env.AZURE_SECURITY_CONNECTOR;
      const orgName = process.env.AZURE_DEVOPS_ORG;
      
      if (!resourceGroup || !connectorName || !orgName) {
        console.log('⚠️  Skipped: Set AZURE_RESOURCE_GROUP, AZURE_SECURITY_CONNECTOR, and AZURE_DEVOPS_ORG');
      } else {
        const path = `/resourceGroups/${resourceGroup}/providers/Microsoft.Security/securityConnectors/${connectorName}/devops/default/azureDevOpsOrgs/${orgName}/projects`;
        const result = await callDefenderAPI(credential, subscriptionId, path);
        
        const projects = result.value || [];
        console.log(`Found ${projects.length} Azure DevOps projects`);
        
        if (projects.length > 0) {
          console.log('First 3 projects:');
          projects.slice(0, 3).forEach((proj, i) => {
            console.log(`  ${i + 1}. ${proj.name}`);
            console.log(`     Parent Org: ${proj.properties?.parentOrgName}`);
            console.log(`     Onboarding State: ${proj.properties?.onboardingState}`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ Error listing DevOps projects: ${error.message}`);
    }
    console.log();

    // Task 4: List Azure DevOps Repositories (via Defender)
    console.log('Task 4: List Azure DevOps Repositories via Defender');
    console.log('-'.repeat(80));
    try {
      const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
      const connectorName = process.env.AZURE_SECURITY_CONNECTOR;
      const orgName = process.env.AZURE_DEVOPS_ORG;
      const projectName = 'MembersPortal'; // Example project
      
      if (!resourceGroup || !connectorName || !orgName) {
        console.log('⚠️  Skipped: Set AZURE_RESOURCE_GROUP, AZURE_SECURITY_CONNECTOR, and AZURE_DEVOPS_ORG');
      } else {
        const path = `/resourceGroups/${resourceGroup}/providers/Microsoft.Security/securityConnectors/${connectorName}/devops/default/azureDevOpsOrgs/${orgName}/projects/${projectName}/repos`;
        const result = await callDefenderAPI(credential, subscriptionId, path);
        
        const repos = result.value || [];
        console.log(`Found ${repos.length} repositories in project ${projectName}`);
        
        if (repos.length > 0) {
          console.log('Repositories:');
          repos.forEach((repo, i) => {
            console.log(`  ${i + 1}. ${repo.name}`);
            console.log(`     Repo ID: ${repo.properties?.repoId}`);
            console.log(`     Visibility: ${repo.properties?.visibility}`);
            console.log(`     Onboarding State: ${repo.properties?.onboardingState}`);
            if (repo.properties?.actionableRemediation) {
              console.log(`     Actionable Remediation: ${repo.properties.actionableRemediation.state}`);
            }
          });
        }
      }
    } catch (error) {
      console.log(`❌ Error listing repositories: ${error.message}`);
    }
    console.log();

    // Task 5: List security alerts
    console.log('Task 5: List Security Alerts');
    console.log('-'.repeat(80));
    try {
      const alerts = [];
      
      for await (const alert of client.alerts.list()) {
        alerts.push(alert);
      }
      
      console.log(`Found ${alerts.length} security alerts`);
      if (alerts.length > 0) {
        console.log('First 3 alerts:');
        alerts.slice(0, 3).forEach((a, i) => {
          console.log(`  ${i + 1}. ${a.properties?.alertDisplayName || a.name}`);
          console.log(`     Severity: ${a.properties?.severity}, Status: ${a.properties?.status}`);
          console.log(`     Product: ${a.properties?.productName}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error listing alerts: ${error.message}`);
    }
    console.log();

    // Task 6: List secure scores
    console.log('Task 6: List Secure Scores');
    console.log('-'.repeat(80));
    try {
      const secureScores = [];
      
      for await (const score of client.secureScores.list()) {
        secureScores.push(score);
      }
      
      console.log(`Found ${secureScores.length} secure scores`);
      if (secureScores.length > 0) {
        console.log('Secure scores:');
        secureScores.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.name}: Current: ${s.properties?.score?.current}, Max: ${s.properties?.score?.max}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error listing secure scores: ${error.message}`);
    }
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY: Defender for Cloud API Capabilities (CORRECTED)');
    console.log('='.repeat(80));
    console.log();
    console.log('✅ Available DevOps operations via Defender for Cloud:');
    console.log('  1. List Azure DevOps organizations (via security connector)');
    console.log('  2. List Azure DevOps projects (via security connector)');
    console.log('  3. List Azure DevOps repositories (via security connector)');
    console.log('  4. Check onboarding state per org/project/repo');
    console.log('  5. View repository properties (visibility, ID, URL)');
    console.log('  6. Configure actionable remediation (PR annotations)');
    console.log('  7. List security alerts (including DevOps alerts)');
    console.log('  8. Update alert status');
    console.log();
    console.log('⚠️  Requirements and Limitations:');
    console.log('  - Requires Azure Defender for Cloud DevOps plan enabled');
    console.log('  - Requires Security Connector configured for DevOps');
    console.log('  - DevOps organizations must be onboarded to Defender');
    console.log('  - Alert filtering may have different options than native API');
    console.log('  - Some granular DevOps operations still require native API');
    console.log();
    console.log('Recommended Use Cases for Defender for Cloud API:');
    console.log('  1. Centralized security management across Azure + DevOps');
    console.log('  2. Organizational overview of DevOps onboarding status');
    console.log('  3. PR annotation configuration (security in pull requests)');
    console.log('  4. Cross-platform alert aggregation');
    console.log('  5. Compliance reporting and security posture tracking');
    console.log();
    console.log('Continue Using Azure DevOps API for:');
    console.log('  1. Granular alert filtering (by pipeline, phase, rule, etc.)');
    console.log('  2. Advanced Security enablement API operations');
    console.log('  3. Detailed alert metadata and comments');
    console.log('  4. Direct repository and pipeline management');
    console.log();

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error();
    console.error('Required configuration:');
    console.error('  - AZURE_SUBSCRIPTION_ID: Your Azure subscription ID');
    console.error('  - AZURE_TENANT_ID: Your Azure AD tenant ID');
    console.error('  - AZURE_CLIENT_ID: Service principal client ID');
    console.error('  - AZURE_CLIENT_SECRET: Service principal secret');
    console.error();
    console.error('Optional (for DevOps API testing):');
    console.error('  - AZURE_RESOURCE_GROUP: Resource group with security connector');
    console.error('  - AZURE_SECURITY_CONNECTOR: Name of security connector');
    console.error('  - AZURE_DEVOPS_ORG: Azure DevOps organization name');
    console.error();
    console.error('Or use Azure CLI authentication:');
    console.error('  az login');
    console.error('  az account set --subscription <subscription-id>');
    console.error();
    process.exit(1);
  }
}

// Run exploration
exploreDefenderForCloud();
