#!/usr/bin/env node
/**
 * Simple test to observe getAlerts response structure
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';
import util from 'node:util';

dotenv.config();

async function getAzdoClient() {
  const orgUrlFromAzureEnv =
    process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
      ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
      : undefined;

  const orgUrl =
    process.env.AZDO_ORG_URL ||
    process.env.AZDO_OR ||
    orgUrlFromAzureEnv ||
    process.env.AZURE_DEVOPS_ORG_URL;
  const pat =
    process.env.AZDO_PAT ||
    process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
    process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !pat) {
    throw new Error('Missing required environment variables');
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

async function main() {
  try {
    const connection = await getAzdoClient();
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    // Get Phoenix project
    const projects = await coreApi.getProjects();
    const phoenixProject = projects.find((p) => p.name === 'Phoenix');

    if (!phoenixProject) {
      console.log('Phoenix project not found');
      return;
    }

    // Get Phoenix repo
    const repos = await gitApi.getRepositories(phoenixProject.id);
    const phoenixRepo = repos.find((r) => r.name === 'Phoenix');

    if (!phoenixRepo) {
      console.log('Phoenix repo not found');
      return;
    }

    console.log(
      `Fetching alerts from ${phoenixProject.name}/${phoenixRepo.name}\n`
    );

    // Call getAlerts with small page size
    const response = await alertApi.getAlerts(
      phoenixProject.name,
      phoenixRepo.id,
      10, // top - small page size
      undefined, // orderBy
      undefined, // criteria
      undefined, // expand
      undefined // continuationToken
    );

    console.log('=== RESPONSE ANALYSIS ===\n');
    console.log('typeof response:', typeof response);
    console.log('Array.isArray(response):', Array.isArray(response));
    console.log('response.length:', response?.length);

    console.log('\n=== DIRECT PROPERTIES ===');
    console.log('response.continuationToken:', response.continuationToken);
    console.log('response.__continuation:', response.__continuation);
    console.log('response.value:', response.value);
    console.log('response.result:', response.result);

    console.log('\n=== ALL OWN PROPERTIES ===');
    const ownProps = Object.getOwnPropertyNames(response);
    ownProps.forEach((prop) => {
      if (!prop.match(/^\d+$/)) {
        // Skip array indexes
        const value = response[prop];
        console.log(
          `${prop}:`,
          typeof value === 'object'
            ? util.inspect(value, { depth: 1, colors: true })
            : value
        );
      }
    });

    console.log('\n=== ENUMERABLE PROPERTIES (for...in) ===');
    for (const key in response) {
      if (!key.match(/^\d+$/)) {
        console.log(`${key}:`, response[key]);
      }
    }

    console.log('\n=== SYMBOL PROPERTIES ===');
    const symbols = Object.getOwnPropertySymbols(response);
    console.log('Symbol properties:', symbols.length);
    symbols.forEach((sym) => {
      console.log(`Symbol(${sym.toString()}):`, response[sym]);
    });

    if (Array.isArray(response) && response.length > 0) {
      console.log('\n=== FIRST ALERT ===');
      console.log(util.inspect(response[0], { depth: 2, colors: true }));
    }

    console.log('\n=== FULL RESPONSE (shallow) ===');
    console.log(
      util.inspect(response, { depth: 0, colors: true, maxArrayLength: 3 })
    );
  } catch (err) {
    console.error('Error:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
