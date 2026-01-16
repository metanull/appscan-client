#!/usr/bin/env node
/**
 * azdo-07-validate-large-repo-alerts.js
 *
 * Purpose: Find a repository with a large number of Advanced Security alerts (default >= 200),
 * fetch ALL alerts using only the npm package AlertApi.getAlerts pagination (no REST),
 * list them and print the total to validate correct pagination behaviour.
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

const MIN_ALERTS = Number(process.env.AZDO_MIN_ALERTS) || 200;
const PAGE_TOP = Number(process.env.AZDO_ALERTS_PAGE_TOP) || 200;

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
    throw new Error(
      'Missing environment variables. Set AZDO_ORG_URL (or AZDO_OR) and AZDO_PAT'
    );
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

/**
 * Fetch all alerts using AlertApi.getAlerts with continuation token support.
 * Uses only the npm package API; no direct REST calls.
 * @param {import('azure-devops-node-api/Api').IAlertApi} alertApi
 * @param {string} projectName
 * @param {string} repositoryId
 * @param {object} [criteria]
 * @param {number} [pageTop]
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
  do {
    const page = await alertApi.getAlerts(
      projectName,
      repositoryId,
      pageTop,
      undefined,
      criteria,
      continuation
    );

    // Normalize page data to an array of alerts
    let pageAlerts = [];
    if (!page) pageAlerts = [];
    else if (Array.isArray(page)) pageAlerts = page;
    else if (Array.isArray(page.value)) pageAlerts = page.value;
    else if (Array.isArray(page.result)) pageAlerts = page.result;
    else pageAlerts = Array.isArray(page) ? page : [];

    all.push(...pageAlerts);

    // Detect continuation token in different potential shapes
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
  } while (continuation);

  return all;
}

(async function main() {
  try {
    const conn = await getAzdoClient();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();
    const alertApi = await conn.getAlertApi();

    const projects = await coreApi.getProjects();
    console.log(`Projects found: ${projects?.length ?? 0}`);

    const targetProject = process.env.AZDO_PROJECT || null;

    for (const project of projects || []) {
      if (
        targetProject &&
        String(project.name).toLowerCase() !==
          String(targetProject).toLowerCase()
      )
        continue;

      console.log(`\nScanning project: ${project.name}`);
      const repos = await gitApi.getRepositories(project.id);
      console.log(`  Repositories: ${repos?.length ?? 0}`);

      for (const r of repos || []) {
        try {
          console.log(`\n  Checking repository: ${r.name} (${r.id}) ...`);
          const allAlerts = await fetchAllAlertsUsingApi(
            alertApi,
            project.name,
            r.id
          );
          const count = allAlerts.length;
          console.log(`    Alerts found: ${count}`);

          if (count >= MIN_ALERTS) {
            console.log(
              `\n=== Repository '${r.name}' meets threshold (${count} alerts >= ${MIN_ALERTS}) ===\n`
            );
            // List all alerts (id | severity | title)
            for (const a of allAlerts) {
              const id = a.alertId || a.id || '(no-id)';
              const sev =
                a.severity || a.severityLabel || a.priority || '(no-severity)';
              const title =
                a.title || a.ruleName || a.description || '(no-title)';
              console.log(`* ${id} | ${sev} | ${title}`);
            }

            console.log(`\nTotal alerts listed: ${count}`);
            process.exit(0);
          }
        } catch (e) {
          console.error(
            `    Error checking repo ${r.name}:`,
            e && e.message ? e.message : String(e)
          );
        }
      }
    }

    console.log(`\nNo repository found with >= ${MIN_ALERTS} alerts.`);
    process.exit(2);
  } catch (err) {
    console.error(
      'Fatal error:',
      err && err.message ? err.message : String(err)
    );
    process.exit(1);
  }
})();
