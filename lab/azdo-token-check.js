#!/usr/bin/env node
import { getAzdoClient, listAzdoProjects, listRepositories } from './azdo-auth.js';

function baseFromOrgUrl(orgUrl) {
  if (!orgUrl) return undefined;
  return orgUrl.replace(/\/$/, '');
}

function getOrgName() {
  // From AZDO_ORG_URL or AZURE_DEVOPS_ORG
  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : undefined) || process.env.AZURE_DEVOPS_ORG_URL;
  if (!orgUrl) return undefined;
  // orgUrl might be https://dev.azure.com/<org> or https://<org>.visualstudio.com
  const m = orgUrl.match(/dev\.azure\.com\/(.+)$/);
  if (m) return m[1];
  const m2 = orgUrl.match(/https?:\/\/(.+?)\./);
  if (m2) return m2[1];
  return orgUrl;
}

async function tryGet(conn, url, note) {
  try {
    const res = await conn.rest.get(url);
    console.log(`${note}: OK`);
    // Print limited info
    if (res && typeof res === 'object') {
      if (Array.isArray(res.value)) console.log(`  items: ${res.value.length}`);
      else console.log('  response keys:', Object.keys(res).slice(0, 10));
    }
    return { ok: true, res };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.log(`${note}: ERROR -> ${msg}`);
    if (err && err.statusCode) console.log(`  HTTP statusCode: ${err.statusCode}`);
    return { ok: false, err };
  }
}

async function main() {
  const conn = await getAzdoClient();
  const projects = await listAzdoProjects();
  console.log('Projects count:', projects.length);
  const project = projects[0];
  const repos = await listRepositories(project.name);
  console.log('Repos count:', repos.length);
  const repo = repos[0];

  const base = baseFromOrgUrl(process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : undefined) || process.env.AZURE_DEVOPS_ORG_URL);

  console.log('Using base url:', base);

  // Test Advanced Security settings endpoint
  const settingsUrl = `${base}/${encodeURIComponent(project.name)}/_apis/advancedsecurity/repositories/${encodeURIComponent(repo.id)}/settings?api-version=7.0-preview.1`;
  await tryGet(conn, settingsUrl, 'Advanced Security settings');

  // Test Advanced Security alerts listing for repository
  const alertsUrl = `${base}/${encodeURIComponent(project.name)}/_apis/advancedsecurity/alerts?repositoryId=${encodeURIComponent(repo.id)}&api-version=7.0-preview.1`;
  await tryGet(conn, alertsUrl, 'Advanced Security alerts (repo)');

  // Test organization-level alerts (if supported)
  const alertsProjectUrl = `${base}/${encodeURIComponent(project.name)}/_apis/advancedsecurity/alerts?api-version=7.0-preview.1`;
  await tryGet(conn, alertsProjectUrl, 'Advanced Security alerts (project)');

  // Try token admin PATs - vssps
  const orgName = getOrgName();
  if (orgName) {
    const vsspsUrl = `https://vssps.dev.azure.com/${orgName}/_apis/tokenadmin/pats?api-version=6.0-preview.1`;
    await tryGet(conn, vsspsUrl, 'PAT admin (vssps tokenadmin)');
  } else {
    console.log('Could not determine organization name for vssps token admin check');
  }

  // Also try to get the current authorized scopes indirectly using the tokens endpoint on app service
  try {
    const me = await conn.rest.get('https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0');
    console.log('Profile retrieval: OK (profile id ' + (me.id || 'unknown') + ')');
  } catch (err) {
    console.log('Profile retrieval: ERROR ->', err && err.message ? err.message : String(err));
  }
}

if ((process.argv[1] && process.argv[1].endsWith('azdo-token-check.js')) || process.argv[1] === undefined) {
  main().catch((e) => {
    console.error(e.stack || e.message || e);
    process.exit(2);
  });
}
