#!/usr/bin/env node
/**
 * azdo-03-list-projects-new.js
 *
 * Purpose: List all Azure DevOps projects in the organization
 * Package APIs: getCoreApi(), getProjects()
 * Self-contained: Yes
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

async function main() {
  try {
    // Connect to Azure DevOps
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

    console.log('Fetching projects...\n');

    // Get Core API and list projects
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();

    if (!projects || projects.length === 0) {
      console.log('No projects found in this organization.');
      process.exit(0);
    }

    console.log(`Found ${projects.length} project(s):\n`);

    // Display projects with details
    for (const project of projects) {
      console.log(`${project.name}`);
      console.log(`  ID: ${project.id}`);
      console.log(
        `  Description: ${project.description || '(no description)'}`
      );
      console.log(`  State: ${project.state || 'N/A'}`);
      console.log(`  Visibility: ${project.visibility || 'N/A'}`);
      console.log(`  URL: ${project.url || 'N/A'}`);
      console.log();
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
