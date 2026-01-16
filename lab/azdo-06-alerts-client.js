#!/usr/bin/env node
// Self-contained script to list projects, repositories for project 'MembersPortal',
// and Advanced Security alerts for each repository.
// Uses ONLY the `azure-devops-node-api` npm package and environment variables from .env

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

const TARGET_PROJECT_NAME = process.env.AZDO_TARGET_PROJECT || 'MembersPortal';
const API_VERSION = '7.2-preview.1';

/**
 * Build and return a connected Azure DevOps WebApi client.
 * Requires AZDO_ORG_URL (or AZDO_OR) and AZDO_PAT in the environment.
 * @returns {Promise<import('azure-devops-node-api/WebApi').WebApi>}
 */
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

/**
 * Derive Advanced Security base URL for the organization used by the advsec API.
 * @param {string} serverUrl WebApi.serverUrl or org URL
 * @returns {string}
 */
function deriveAdvsecBase(serverUrl) {
  if (!serverUrl) throw new Error('serverUrl required to derive advsec base');
  const org = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  let orgName = org;
  if (org.startsWith('dev.azure.com/')) orgName = org.replace('dev.azure.com/', '');
  else if (org.indexOf('.visualstudio.com') > -1) orgName = org.split('.')[0];
  return `https://advsec.dev.azure.com/${orgName}`;
}

/**
 * Safely fetch alerts for a repository using the WebApi rest client.
 * @param {import('azure-devops-node-api/WebApi').WebApi} conn
 * @param {string} projectName
 * @param {string} repositoryId
 * @returns {Promise<Array|undefined>} array of alerts or undefined on unexpected response
 */
async function fetchRepoAlerts(conn, projectName, repositoryId) {
  const advBase = deriveAdvsecBase(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR);
  const url = `${advBase}/${encodeURIComponent(projectName)}/_apis/alert/repositories/${encodeURIComponent(repositoryId)}/alerts?api-version=${API_VERSION}`;
  const res = await conn.rest.get(url, {});
  // Response may be { value: [...] } or { result: { value: [...] } } or raw array
  const data = res && res.value ? res : (res && res.result ? res.result : res);
  const alerts = data && data.value ? data.value : (Array.isArray(data) ? data : null);
  return alerts ?? undefined;
}

(async function main(){
  try {
    const conn = await getAzdoClient();

    // 1) List projects
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    console.log(`Projects found: ${projects?.length ?? 0}`);
    for (const p of projects || []) console.log(` - ${p.name}`);

    // 2) Find project(s) matching TARGET_PROJECT_NAME
    const matched = (projects || []).filter((p) => String(p.name).toLowerCase() === TARGET_PROJECT_NAME.toLowerCase());
    if (matched.length === 0) {
      console.error(`No project with name '${TARGET_PROJECT_NAME}' found.`);
      process.exit(1);
    }

    const gitApi = await conn.getGitApi();

    for (const project of matched) {
      console.log('\nProject:', project.name);
      // 2) List repositories in the project
      const repos = await gitApi.getRepositories(project.name);
      console.log(`Repositories in ${project.name}: ${repos?.length ?? 0}`);
      for (const r of repos || []) console.log(` - ${r.name} (${r.id})`);

      // 3) Fetch advanced security alerts for each repo
      for (const r of repos || []) {
        try {
          const alerts = await fetchRepoAlerts(conn, project.name, r.id);
          if (!alerts) {
            console.log(`\nRepository '${r.name}': no alerts or unexpected response shape`);
            continue;
          }
          console.log(`\nRepository '${r.name}' alerts count: ${alerts.length}`);
          for (const a of alerts.slice(0, 50)) {
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
