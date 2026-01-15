#!/usr/bin/env node
// Minimal script: list Advanced Security alerts for the first repo of the first project
// Uses azure-devops-node-api's WebApi client (via lab/azdo-auth.js) and its rest client
import { listAzdoProjects, listRepositories, getAzdoClient } from './azdo-auth.js';

(async function main(){
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log('No projects');
      process.exit(0);
    }
    const project = projects[0];
    const repos = await listRepositories(project.name);
    if (!repos || repos.length === 0) {
      console.log('No repositories for project', project.name);
      process.exit(0);
    }
    const repo = repos[0];

    const conn = await getAzdoClient();
    // derive advsec base from serverUrl
    const org = (conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL).replace(/https:\/\//, '').replace(/\/$/, '');
    // org might be 'dev.azure.com/<org>' or '<org>.visualstudio.com' - extract org name
    let orgName = org;
    if (org.startsWith('dev.azure.com/')) orgName = org.replace('dev.azure.com/','');
    else if (org.indexOf('.visualstudio.com')>-1) orgName = org.split('.')[0];

    const advsecBase = `https://advsec.dev.azure.com/${orgName}`;
    const url = `${advsecBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1`;

    const res = await conn.rest.get(url, {});
    // res may be the raw result object or already parsed; try to read .value
    const data = res && res.value ? res : (res && res.result ? res.result : res);

    const alerts = data && data.value ? data.value : (Array.isArray(data) ? data : null);
    if (!alerts) {
      console.log('No alerts or unexpected response shape.');
      console.log('Response sample keys:', Object.keys(data || {}).slice(0,10));
      process.exit(0);
    }

    console.log(`alerts count: ${alerts.length}`);
    for (const a of alerts.slice(0,20)) {
      console.log(`${a.alertId || a.id || '(no id)'} | ${a.alertType || a.type || '(no type)'} | ${a.severity || a.severityLabel || a.priority || '(no severity)'} | ${a.title || a.ruleName || a.description || '(no title)'}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error listing adv alerts:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();