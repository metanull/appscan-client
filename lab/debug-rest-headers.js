#!/usr/bin/env node
/**
 * Debug REST headers to find continuation token
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

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
  return { connection, orgUrl };
}

async function main() {
  try {
    const { connection, orgUrl } = await getAzdoClient();
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    const projects = await coreApi.getProjects();
    const targetProject = projects.find((p) => p.name === 'Phoenix');

    if (!targetProject) {
      console.log('Phoenix project not found');
      return;
    }

    const repos = await gitApi.getRepositories(targetProject.id);
    const phoenixRepo = repos.find((r) => r.name === 'Phoenix');

    if (!phoenixRepo) {
      console.log('Phoenix repo not found');
      return;
    }

    console.log(`Testing ${targetProject.name}/${phoenixRepo.name}\n`);

    // Access the underlying rest client
    console.log('AlertApi properties:', Object.keys(alertApi));
    console.log('Has rest?', 'rest' in alertApi);
    console.log('Has vsoClient?', 'vsoClient' in alertApi);

    // Try to make a direct REST call
    if (alertApi.rest) {
      const baseUrl = `${orgUrl}/${encodeURIComponent(targetProject.name)}/_apis/alert/repositories/${phoenixRepo.id}/alerts`;
      const url = `${baseUrl}?$top=5&api-version=7.2-preview.1`;

      console.log('\nMaking direct REST call to:', url);

      const res = await alertApi.rest.get(url);
      console.log('\nResponse object keys:', Object.keys(res));
      console.log('Has headers?', 'headers' in res);
      console.log('Has statusCode?', 'statusCode' in res);

      if (res.headers) {
        console.log('\nResponse headers:');
        for (const [key, value] of Object.entries(res.headers)) {
          console.log(`  ${key}: ${value}`);
        }

        console.log(
          '\nContinuation token:',
          res.headers['x-ms-continuationtoken'] ||
            res.headers['X-MS-ContinuationToken']
        );
      }

      console.log(
        '\nResult length:',
        Array.isArray(res.result) ? res.result.length : 'not array'
      );
    }
  } catch (err) {
    console.error('Error:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
