#!/usr/bin/env node
/**
 * Debug continuation token handling
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';
import * as AlertInterfaces from 'azure-devops-node-api/interfaces/AlertInterfaces.js';

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
    const { connection } = await getAzdoClient();
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    const projects = await coreApi.getProjects();

    // Target specific project
    const targetProject = projects.find((p) => p.name === 'Phoenix');
    if (!targetProject) {
      console.log(
        'Phoenix project not found. Available projects:',
        projects.map((p) => p.name).join(', ')
      );
      return;
    }

    // Find first project with repos
    for (const project of [targetProject]) {
      const repos = await gitApi.getRepositories(project.id);
      if (!repos || repos.length === 0) continue;

      for (const repo of repos) {
        try {
          console.log(`\n=== Testing ${project.name}/${repo.name} ===\n`);

          // TEST 1: Pass continuation token as 7th parameter (CORRECT)
          console.log(
            'TEST 1: Continuation token as 7th parameter (CORRECT position)'
          );
          const page1 = await alertApi.getAlerts(
            project.name,
            repo.id,
            5, // Small page size to force pagination
            undefined, // orderBy
            undefined, // criteria - get ALL alert types
            undefined, // expand
            undefined // continuationToken (first call)
          );
          console.log(
            '  Page 1 length:',
            Array.isArray(page1) ? page1.length : 'not array'
          );
          console.log('  Page 1 continuationToken:', page1?.continuationToken);

          // TEST 2: Pass continuation token as 6th parameter (WRONG but lab does this)
          console.log(
            '\nTEST 2: Continuation token as 6th parameter (WRONG - as expand)'
          );
          const page2 = await alertApi.getAlerts(
            project.name,
            repo.id,
            5,
            undefined, // orderBy
            undefined, // criteria
            undefined // This is expand, but lab passes continuation here (WRONG!)
          );
          console.log(
            '  Page 2 length:',
            Array.isArray(page2) ? page2.length : 'not array'
          );
          console.log('  Page 2 continuationToken:', page2?.continuationToken);

          // If there's a continuation token, try to use it in both positions
          if (page1?.continuationToken) {
            console.log('\n=== Testing with actual continuation token ===');
            console.log('Token value:', page1.continuationToken);

            console.log('\nTEST 3: Using token as 7th parameter (CORRECT)');
            const page3 = await alertApi.getAlerts(
              project.name,
              repo.id,
              5,
              undefined,
              undefined,
              undefined,
              page1.continuationToken // 7th parameter
            );
            console.log(
              '  Page 3 length:',
              Array.isArray(page3) ? page3.length : 'not array'
            );

            console.log(
              '\nTEST 4: Using token as 6th parameter (WRONG - like lab does)'
            );
            const page4 = await alertApi.getAlerts(
              project.name,
              repo.id,
              5,
              undefined,
              undefined,
              page1.continuationToken // 6th parameter (expand position)
            );
            console.log(
              '  Page 4 length:',
              Array.isArray(page4) ? page4.length : 'not array'
            );
          }

          // Exit after first test
          return;
        } catch (err) {
          // Skip repos without advanced security
          if (err.statusCode === 404) continue;
          throw err;
        }
      }
    }

    console.log('No repositories found with Advanced Security enabled');
  } catch (err) {
    console.error('Error:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
