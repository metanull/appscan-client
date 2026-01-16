#!/usr/bin/env node
/**
 * azdo-07-filter-alert-client-only.js
 *
 * Purpose: Same behaviour as azdo-07-filter-alert-rest.js but using ONLY the
 * azure-devops-node-api client (no direct REST calls) and the continuation token
 * support on AlertApi.getAlerts to retrieve ALL alerts (no implicit capping).
 *
 * Usage:
 *  - Set env var AZDO_PROJECTS (comma-separated) to limit projects (defaults to Phoenix,Agora)
 *  - Optional: AZDO_ALERTS_PAGE_TOP to change page size (default 500)
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

const DEFAULT_PROJECTS = (process.env.AZDO_PROJECTS &&
  process.env.AZDO_PROJECTS.split(',')
    .map((s) => s.trim())
    .filter(Boolean)) || ['Phoenix', 'Agora'];
const PAGE_TOP = Number(process.env.AZDO_ALERTS_PAGE_TOP) || 500;

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
  if (!orgUrl || !pat)
    throw new Error(
      'Missing Azure DevOps env vars. Set AZDO_ORG_URL (or AZDO_OR/AZURE_DEVOPS_BASE_URL+AZURE_DEVOPS_ORG) and AZDO_PAT (or AZURE_DEVOPS_PAT)'
    );

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

/**
 * Fetch all alerts from repository using AlertApi.getAlerts with continuation tokens.
 * Uses only the SDK API and does not call the REST client.
 */
async function fetchAllAlertsUsingApi(
  alertApi,
  projectName,
  repositoryId,
  criteria = {},
  pageTop = PAGE_TOP
) {
  const all = [];
  let continuation = undefined;
  let pageCount = 0;
  do {
    // getAlerts(project, repoId, top, orderBy, searchCriteria, continuationToken)
    const page = await alertApi.getAlerts(
      projectName,
      repositoryId,
      pageTop,
      undefined,
      criteria,
      continuation
    );

    let pageAlerts = [];
    if (!page) pageAlerts = [];
    else if (Array.isArray(page)) pageAlerts = page;
    else if (Array.isArray(page.value)) pageAlerts = page.value;
    else if (Array.isArray(page.result)) pageAlerts = page.result;
    else pageAlerts = Array.isArray(page) ? page : [];

    all.push(...pageAlerts);

    // Detect continuation token from various possible shapes
    let next = null;
    if (page) {
      next =
        page.continuationToken ||
        (page.__continuation &&
          (page.__continuation.continuationToken ||
            page.__continuation.token)) ||
        null;
    }
    if (!next && Array.isArray(page) && page.continuationToken)
      next = page.continuationToken;
    if (!next && pageAlerts.length > 0) {
      const a0 = pageAlerts[0];
      if (a0 && (a0.__continuation || a0.continuationToken))
        next = a0.__continuation || a0.continuationToken;
    }

    continuation = next || undefined;
    pageCount += 1;

    // Safety: if something goes wrong with the token, avoid infinite loop
    if (pageCount > 10000)
      throw new Error('Too many pages while paginating alerts, aborting');
  } while (continuation);

  return all;
}

async function main() {
  try {
    const conn = await getAzdoClient();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();
    const alertApi = await conn.getAlertApi();

    const projectsRaw = await coreApi.getProjects();
    const projects = (projectsRaw || []).map((p) => ({
      id: p.id,
      name: p.name,
    }));

    const targetProjects = projects.filter((p) =>
      DEFAULT_PROJECTS.map((x) => x.toLowerCase()).includes(
        p.name.toLowerCase()
      )
    );
    if (targetProjects.length === 0) {
      console.log('No target projects found:', DEFAULT_PROJECTS.join(','));
      process.exit(0);
    }

    for (const project of targetProjects) {
      console.log('\n=== Project:', project.name, '===');

      const reposRaw = await gitApi.getRepositories(project.id);
      const repos = (reposRaw || []).map((r) => ({ id: r.id, name: r.name }));
      console.log('Repositories:', repos.map((r) => r.name).join(', '));

      let projectTotal = 0;

      for (const repo of repos) {
        try {
          console.log('\n--- Repository:', repo.name, '---');
          const allAlerts = await fetchAllAlertsUsingApi(
            alertApi,
            project.name,
            repo.id
          );
          const count = allAlerts.length;
          projectTotal += count;
          console.log(`  Alerts fetched: ${count}`);

          // If you want to inspect examples, print first 3
          if (count > 0) {
            console.log('  Example alerts:');
            for (const a of allAlerts.slice(0, 3)) {
              const id = a.alertId || a.id || '(no-id)';
              const sev = a.severity || a.severityLabel || '(no-severity)';
              const title = a.title || a.ruleName || '(no-title)';
              console.log(`   * ${id} | ${sev} | ${title}`);
            }
          }
        } catch (e) {
          // API returns error for repos not enabled for Advanced Security
          console.error(
            `  Error fetching alerts for repo ${repo.name}:`,
            e && e.message ? e.message : String(e)
          );
        }
      }

      console.log(
        `\nProject '${project.name}' total alerts across repositories: ${projectTotal}`
      );
    }

    process.exit(0);
  } catch (err) {
    console.error(
      'Fatal error:',
      err && err.message ? err.message : String(err)
    );
    process.exit(2);
  }
}

main();
