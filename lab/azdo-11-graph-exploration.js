#!/usr/bin/env node
/**
 * Microsoft Graph Security API Exploration Script
 *
 * This script explores the capabilities of Microsoft Graph Security API
 * to perform operations related to Azure DevOps and general security management.
 *
 * Required environment variables:
 * - AZURE_TENANT_ID: Azure AD tenant ID
 * - AZURE_CLIENT_ID: Service principal client ID (with SecurityEvents.Read.All, etc.)
 * - AZURE_CLIENT_SECRET: Service principal client secret
 *
 * Required NPM packages:
 * - @azure/identity: For authentication
 * - @microsoft/microsoft-graph-client: For Graph API calls
 */

import dotenv from 'dotenv';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';

dotenv.config();

/**
 * Creates an authenticated Microsoft Graph client
 */
async function getGraphClient() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Missing required environment variables: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET'
    );
  }

  console.log('Creating credential...');
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );

  console.log('Creating authentication provider...');
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  console.log('Creating Graph client...');
  const client = Client.initWithMiddleware({
    authProvider: authProvider,
  });

  return client;
}

/**
 * Main exploration function
 */
async function exploreGraphSecurity() {
  console.log('='.repeat(80));
  console.log('Microsoft Graph Security API Exploration');
  console.log('='.repeat(80));
  console.log();

  try {
    const client = await getGraphClient();
    console.log('✓ Successfully authenticated with Microsoft Graph');
    console.log();

    // Task 1: List security alerts (v1.0)
    console.log('Task 1: List Security Alerts (v1.0)');
    console.log('-'.repeat(80));
    try {
      const response = await client
        .api('/security/alerts')
        .version('v1.0')
        .top(5)
        .get();

      const alerts = response.value || [];
      console.log(`Found ${alerts.length} alerts (top 5)`);

      if (alerts.length > 0) {
        console.log('First 3 alerts:');
        alerts.slice(0, 3).forEach((alert, i) => {
          console.log(`  ${i + 1}. ${alert.title}`);
          console.log(
            `     Severity: ${alert.severity}, Status: ${alert.status}`
          );
          console.log(`     Category: ${alert.category}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error listing alerts: ${error.message}`);
      if (error.statusCode === 403) {
        console.log(
          '   Permission issue - requires SecurityEvents.Read.All or SecurityEvents.ReadWrite.All'
        );
      }
    }
    console.log();

    // Task 2: List security incidents (beta)
    console.log('Task 2: List Security Incidents (beta)');
    console.log('-'.repeat(80));
    try {
      const response = await client
        .api('/security/incidents')
        .version('beta')
        .top(5)
        .get();

      const incidents = response.value || [];
      console.log(`Found ${incidents.length} incidents (top 5)`);

      if (incidents.length > 0) {
        console.log('First 3 incidents:');
        incidents.slice(0, 3).forEach((incident, i) => {
          console.log(`  ${i + 1}. ${incident.displayName || incident.title}`);
          console.log(
            `     Severity: ${incident.severity}, Status: ${incident.status}`
          );
        });
      }
    } catch (error) {
      console.log(`❌ Error listing incidents: ${error.message}`);
      if (error.statusCode === 403) {
        console.log('   Permission issue - requires SecurityIncident.Read.All');
      }
    }
    console.log();

    // Task 3: Query secure scores
    console.log('Task 3: Query Secure Scores');
    console.log('-'.repeat(80));
    try {
      const response = await client
        .api('/security/secureScores')
        .version('v1.0')
        .top(5)
        .get();

      const scores = response.value || [];
      console.log(`Found ${scores.length} secure scores`);

      if (scores.length > 0) {
        console.log('Latest secure scores:');
        scores.forEach((score, i) => {
          console.log(`  ${i + 1}. ${score.azureTenantId}`);
          console.log(
            `     Current: ${score.currentScore}, Max: ${score.maxScore}`
          );
          console.log(`     Date: ${score.createdDateTime}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error querying secure scores: ${error.message}`);
      if (error.statusCode === 403) {
        console.log('   Permission issue - requires SecurityEvents.Read.All');
      }
    }
    console.log();

    // Task 4: Check for DevOps security alerts (beta)
    console.log('Task 4: Check DevOps Security via Graph (beta)');
    console.log('-'.repeat(80));
    try {
      // Attempt to query alerts with DevOps filters
      const response = await client
        .api('/security/alerts')
        .version('beta')
        .filter("vendorInformation/provider eq 'Azure DevOps'")
        .top(5)
        .get();

      const devopsAlerts = response.value || [];
      console.log(`Found ${devopsAlerts.length} DevOps-related alerts`);

      if (devopsAlerts.length > 0) {
        console.log('DevOps alerts:');
        devopsAlerts.forEach((alert, i) => {
          console.log(`  ${i + 1}. ${alert.title}`);
          console.log(`     Severity: ${alert.severity}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error querying DevOps alerts: ${error.message}`);
    }
    console.log();

    // Task 5: List security actions (beta)
    console.log('Task 5: List Security Actions (beta)');
    console.log('-'.repeat(80));
    try {
      const response = await client
        .api('/security/securityActions')
        .version('beta')
        .top(5)
        .get();

      const actions = response.value || [];
      console.log(`Found ${actions.length} security actions`);

      if (actions.length > 0) {
        console.log('Security actions:');
        actions.forEach((action, i) => {
          console.log(`  ${i + 1}. ${action.name}`);
          console.log(`     Status: ${action.status}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error listing security actions: ${error.message}`);
    }
    console.log();

    // Task 6: Test alert update capability
    console.log('Task 6: Alert Update Capabilities');
    console.log('-'.repeat(80));
    console.log('Graph Security API supports:');
    console.log('  - PATCH /security/alerts/{alert-id} to update:');
    console.log('    • assignedTo');
    console.log('    • closedDateTime');
    console.log('    • comments');
    console.log('    • feedback');
    console.log('    • status (newAlert, inProgress, resolved)');
    console.log('    • tags');
    console.log('    • vendorInformation');
    console.log();
    console.log(
      'Note: Updates require SecurityEvents.ReadWrite.All permission'
    );
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY: Microsoft Graph Security API Capabilities');
    console.log('='.repeat(80));
    console.log();
    console.log('✓ Available operations via Microsoft Graph Security API:');
    console.log('  1. List and filter security alerts from multiple providers');
    console.log('  2. Query security incidents (aggregated alerts)');
    console.log('  3. Get secure scores and recommendations');
    console.log('  4. Update alert status, tags, comments, and assignments');
    console.log('  5. List and create security actions');
    console.log('  6. Access threat intelligence indicators');
    console.log();
    console.log('Required Permissions (Application):');
    console.log('  - SecurityEvents.Read.All: Read security alerts and events');
    console.log('  - SecurityEvents.ReadWrite.All: Update alerts');
    console.log('  - SecurityIncident.Read.All: Read security incidents');
    console.log(
      '  - ThreatIndicators.ReadWrite.OwnedBy: Manage threat indicators'
    );
    console.log();
    console.log('❌ Limitations for Azure DevOps specific tasks:');
    console.log('  - Graph API aggregates security data but may not provide:');
    console.log('    • Direct repository-level Advanced Security alerts');
    console.log('    • DevOps project/repo enumeration');
    console.log('    • Pipeline-specific security information');
    console.log('    • Advanced Security enablement status per repo');
    console.log();
    console.log('  - DevOps-specific operations are better handled by:');
    console.log('    1. Azure DevOps REST API (azure-devops-node-api)');
    console.log(
      '    2. Advanced Security API endpoints (implemented in azdo-*.js)'
    );
    console.log();
    console.log('Recommended Architecture:');
    console.log('  1. Use azure-devops-node-api for:');
    console.log('     - Listing projects, repos, pipelines');
    console.log('     - Checking Advanced Security enablement');
    console.log('     - Managing DevOps-specific alerts');
    console.log('     - Updating alert status/metadata in DevOps');
    console.log();
    console.log('  2. Use Graph Security API for:');
    console.log('     - Cross-platform security view (DevOps + Azure + M365)');
    console.log('     - Aggregated incident management');
    console.log('     - Integration with SIEM/SOAR tools');
    console.log('     - Organization-wide security posture tracking');
    console.log();
    console.log('  3. Use Defender for Cloud API for:');
    console.log('     - Azure resource security management');
    console.log('     - Compliance and policy enforcement');
    console.log('     - Cloud workload protection');
    console.log();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error();
    console.error('Required configuration:');
    console.error('  1. Create an Azure AD App Registration:');
    console.error('     - Go to https://portal.azure.com');
    console.error(
      '     - Azure Active Directory > App registrations > New registration'
    );
    console.error();
    console.error('  2. Grant required API permissions:');
    console.error('     - Microsoft Graph > Application permissions:');
    console.error('       • SecurityEvents.Read.All');
    console.error('       • SecurityEvents.ReadWrite.All (for updates)');
    console.error('       • SecurityIncident.Read.All');
    console.error('     - Admin consent required');
    console.error();
    console.error('  3. Create a client secret:');
    console.error('     - Certificates & secrets > New client secret');
    console.error();
    console.error('  4. Set environment variables:');
    console.error('     - AZURE_TENANT_ID=<your-tenant-id>');
    console.error('     - AZURE_CLIENT_ID=<your-app-client-id>');
    console.error('     - AZURE_CLIENT_SECRET=<your-client-secret>');
    console.error();
    process.exit(1);
  }
}

// Run exploration
exploreGraphSecurity();
