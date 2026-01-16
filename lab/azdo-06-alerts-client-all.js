#!/usr/bin/env node
// Self-contained script to list projects, repositories for project 'MembersPortal',
// and fetch ALL Advanced Security alerts (following continuation tokens) for each repository.
// Uses ONLY the `azure-devops-node-api` npm package and environment variables from .env

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

const TARGET_PROJECT_NAME = process.env.AZDO_TARGET_PROJECT || 'MembersPortal';
const API_VERSION = '7.2-preview.1';
const PAGE_TOP = process.env.AZDO_ALERTS_PAGE_TOP ? Number(process.env.AZDO_ALERTS_PAGE_TOP) : 500;

async function getAzdoClient() {
  const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
    ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
    : undefined;

  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv || process.env.AZURE_DEVOPS_ORG_URL;
  const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !pat) {
    throw new Error('Missing environment variables. Set AZDO_ORG_URL (or AZDO_OR) and AZDO_PAT');
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

function deriveAdvsecBase(serverUrl) {
  if (!serverUrl) throw new Error('serverUrl required to derive advsec base');
  const org = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  let orgName = org;
  if (org.startsWith('dev.azure.com/')) orgName = org.replace('dev.azure.com/', '');
  else if (org.indexOf('.visualstudio.com') > -1) orgName = org.split('.')[0];
  return `https://advsec.dev.azure.com/${orgName}`;
}

async function fetchAllRepoAlerts(conn, projectName, repositoryId, params = {}) {
  const advBase = deriveAdvsecBase(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR);
  const all = [];
  let continuation = null;
  do {
    const qp = new URLSearchParams();
    if (continuation) qp.set('continuationToken', continuation);
    qp.set('top', String(PAGE_TOP));
    // append other params passed (e.g., criteria...)
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) for (const it of v) qp.append(k, it); else qp.append(k, String(v));
    }

    const url = `${advBase}/${encodeURIComponent(projectName)}/_apis/alert/repositories/${encodeURIComponent(repositoryId)}/alerts?api-version=${API_VERSION}&${qp.toString()}`;
    const r = await conn.rest.get(url, {});

    const data = r && r.result ? r.result : r;
    const pageAlerts = data && data.value ? data.value : (Array.isArray(data) ? data : []);
    all.push(...pageAlerts);

    // continuation token may be returned as header 'x-ms-continuationtoken' (case variations) or in the response body
    const headerCont = r && r.headers && (r.headers['x-ms-continuationtoken'] || r.headers['X-Ms-ContinuationToken']) ? (r.headers['x-ms-continuationtoken'] || r.headers['X-Ms-ContinuationToken']) : null;
    let bodyCont = null;
    if (data) {
      bodyCont = data.__continuation || data.continuationToken || (data.__continuation && (data.__continuation.continuationToken || data.__continuation.token)) || null;
    }
    continuation = headerCont || bodyCont || null;
  } while (continuation);
  return all;
}

(async function main(){
  try {
    const conn = await getAzdoClient();

    // 1) List projects
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    console.log(`Projects found: ${projects?.length ?? 0}`);
    for (const p of projects || []) console.log(` - ${p.name}`);

    const matched = (projects || []).filter((p) => String(p.name).toLowerCase() === TARGET_PROJECT_NAME.toLowerCase());
    if (matched.length === 0) {
      console.error(`No project with name '${TARGET_PROJECT_NAME}' found.`);
      process.exit(1);
    }

    const gitApi = await conn.getGitApi();

    for (const project of matched) {
      console.log('\nProject:', project.name);
      const repos = await gitApi.getRepositories(project.name);
      console.log(`Repositories in ${project.name}: ${repos?.length ?? 0}`);
      for (const r of repos || []) console.log(` - ${r.name} (${r.id})`);

      // For each repository, fetch ALL alerts using continuation
      for (const r of repos || []) {
        try {
          console.log(`\nFetching all alerts for repository '${r.name}' (this may take a while)`);
          const allAlerts = await fetchAllRepoAlerts(conn, project.name, r.id);
          console.log(`Repository '${r.name}' total alerts: ${allAlerts.length}`);

          // Print every alert
          for (const a of allAlerts) {
            const id = a.alertId || a.id || '(no-id)';
            const type = a.alertType || a.type || a.ruleName || '(no-type)';
            const severity = a.severity || a.severityLabel || a.priority || '(no-severity)';
            const title = a.title || a.description || a.ruleName || '(no-title)';
            console.log(` * ${id} | ${type} | ${severity} | ${title}`);
          }

        } catch (e) {
          console.error(`Error fetching alerts for repo ${r.name}:`, e && e.message ? e.message : String(e));
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();
