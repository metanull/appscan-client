#!/usr/bin/env node
/**
 * Comprehensive dump of all Azure DevOps objects to find pagination mechanism
 * Uses only the azure-devops-node-api package
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';
import util from 'node:util';

dotenv.config();

const TARGET_PROJECT = process.env.AZDO_PROJECT || 'Phoenix';
const PAGE_SIZE = 10; // Small page size to trigger pagination

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

function dumpObject(obj, label) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${label}`);
  console.log('='.repeat(80));
  console.log('Type:', typeof obj);
  console.log('Is Array:', Array.isArray(obj));
  console.log('Constructor:', obj?.constructor?.name);

  console.log('\n--- Direct Properties ---');
  if (obj) {
    const directProps = [
      'continuationToken',
      '__continuation',
      'value',
      'result',
      'count',
      'id',
      'name',
      'alertId',
      'length',
    ];
    directProps.forEach((prop) => {
      if (prop in obj) {
        console.log(`${prop}:`, obj[prop]);
      }
    });
  }

  console.log('\n--- All Own Properties ---');
  const ownProps = Object.getOwnPropertyNames(obj);
  ownProps.forEach((prop) => {
    if (!prop.match(/^\d+$/) || ownProps.length < 20) {
      // Skip array indexes unless small array
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      console.log(`${prop}:`, {
        type: typeof obj[prop],
        enumerable: descriptor.enumerable,
        value:
          typeof obj[prop] === 'object' && obj[prop] !== null
            ? `[${obj[prop].constructor?.name || 'Object'}]`
            : obj[prop],
      });
    }
  });

  console.log('\n--- Symbol Properties ---');
  const symbols = Object.getOwnPropertySymbols(obj);
  if (symbols.length > 0) {
    symbols.forEach((sym) => {
      console.log(`Symbol(${sym.toString()}):`, obj[sym]);
    });
  } else {
    console.log('(none)');
  }

  console.log('\n--- Prototype Chain ---');
  let proto = Object.getPrototypeOf(obj);
  let depth = 0;
  while (proto && depth < 5) {
    console.log(`Prototype ${depth}:`, proto.constructor?.name);
    const protoProps = Object.getOwnPropertyNames(proto).filter(
      (p) => !p.match(/^\d+$/) && p !== 'constructor' && !p.startsWith('_')
    );
    if (protoProps.length > 0 && protoProps.length < 10) {
      console.log('  Properties:', protoProps.join(', '));
    }
    proto = Object.getPrototypeOf(proto);
    depth++;
  }

  console.log('\n--- Full Object Dump (depth 2) ---');
  console.log(
    util.inspect(obj, {
      depth: 2,
      colors: true,
      maxArrayLength: 3,
      showHidden: true,
    })
  );
}

async function main() {
  try {
    const connection = await getAzdoClient();
    const coreApi = await connection.getCoreApi();
    const gitApi = await connection.getGitApi();
    const alertApi = await connection.getAlertApi();

    // List all projects
    console.log('\n\n' + '#'.repeat(80));
    console.log('FETCHING ALL PROJECTS');
    console.log('#'.repeat(80));

    const projects = await coreApi.getProjects();
    dumpObject(projects, 'PROJECTS LIST RESPONSE');

    // Filter to target project or use first few
    const targetProjects = TARGET_PROJECT
      ? projects.filter((p) => p.name === TARGET_PROJECT)
      : projects.slice(0, 1); // Just first project if no target

    console.log(`\n\nProcessing ${targetProjects.length} project(s)...`);

    for (const project of targetProjects) {
      console.log('\n\n' + '#'.repeat(80));
      console.log(`PROJECT: ${project.name}`);
      console.log('#'.repeat(80));

      dumpObject(project, `PROJECT OBJECT: ${project.name}`);

      // List repositories
      console.log('\n\n' + '='.repeat(80));
      console.log(`FETCHING REPOSITORIES FOR PROJECT: ${project.name}`);
      console.log('='.repeat(80));

      const repos = await gitApi.getRepositories(project.id);
      dumpObject(repos, `REPOSITORIES LIST RESPONSE for ${project.name}`);

      // Process each repository
      for (const repo of repos || []) {
        console.log('\n\n' + '-'.repeat(80));
        console.log(`REPOSITORY: ${repo.name}`);
        console.log('-'.repeat(80));

        dumpObject(repo, `REPOSITORY OBJECT: ${repo.name}`);

        try {
          // Fetch alerts
          console.log('\n\n' + '.'.repeat(80));
          console.log(`FETCHING ALERTS FOR: ${project.name}/${repo.name}`);
          console.log(`Using page size: ${PAGE_SIZE}`);
          console.log('.'.repeat(80));

          const alerts = await alertApi.getAlerts(
            project.name,
            repo.id,
            PAGE_SIZE,
            undefined, // orderBy
            undefined, // criteria
            undefined, // expand
            undefined // continuationToken
          );

          dumpObject(
            alerts,
            `ALERTS RESPONSE for ${project.name}/${repo.name}`
          );

          if (Array.isArray(alerts) && alerts.length > 0) {
            console.log(
              `\n\nFound ${alerts.length} alerts. Dumping first alert...`
            );
            dumpObject(
              alerts[0],
              `FIRST ALERT in ${project.name}/${repo.name}`
            );

            // If there are alerts, try to see if we can get more with a fake continuation token
            console.log('\n\n' + '.'.repeat(80));
            console.log('TESTING: Can we fetch more alerts?');
            console.log('.'.repeat(80));

            // Try fetching with a higher top value to see total count
            const moreAlerts = await alertApi.getAlerts(
              project.name,
              repo.id,
              1000, // Large page size
              undefined,
              undefined,
              undefined,
              undefined
            );

            console.log(
              `\nWith top=1000, got ${moreAlerts?.length || 0} alerts`
            );
            console.log(
              'This tells us the actual total number of alerts in the repo.'
            );

            if ((moreAlerts?.length || 0) > PAGE_SIZE) {
              console.log('\n⚠️  PAGINATION NEEDED!');
              console.log(
                `We have ${moreAlerts.length} total alerts but page size is ${PAGE_SIZE}`
              );
              console.log(
                'Checking if continuation token exists in large response...'
              );
              dumpObject(moreAlerts, 'LARGE ALERTS RESPONSE (top=1000)');
            }
          }

          // Only process first repo with alerts
          if (alerts && alerts.length > 0) {
            console.log(
              '\n\n✅ Found repository with alerts. Stopping here for analysis.'
            );
            return;
          }
        } catch (err) {
          console.log(`\n❌ Error fetching alerts: ${err.message}`);
          if (err.statusCode === 404) {
            console.log('(Advanced Security not enabled for this repository)');
          }
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(80));
  } catch (err) {
    console.error('\n\n❌ Fatal Error:', err.message);
    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
