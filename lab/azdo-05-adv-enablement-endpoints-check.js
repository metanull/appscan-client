#!/usr/bin/env node
// Check Advanced Security enablement endpoints (org, project, repo) using SDK rest client
import { getAzdoClient, listAzdoProjects, listRepositories } from './azdo-auth.js';

function deriveOrgNameFromServerUrl(serverUrl) {
  if (!serverUrl) return undefined;
  const s = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (s.startsWith('dev.azure.com/')) return s.replace('dev.azure.com/', '');
  if (s.indexOf('.visualstudio.com') !== -1) return s.split('.')[0];
  return s;
}

(async function main(){
  try {
    const conn = await getAzdoClient();
    const orgName = deriveOrgNameFromServerUrl(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL);
    if (!orgName) { console.error('Could not determine org name'); process.exit(2); }
    const advsecBase = `https://advsec.dev.azure.com/${orgName}`;

    // Org enablement
    try {
      const orgUrl = `${advsecBase}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
      const orgRes = await conn.rest.get(orgUrl, {});
      const status = orgRes && orgRes.statusCode ? orgRes.statusCode : (orgRes && orgRes.result ? 200 : 200);
      const body = orgRes && orgRes.result ? orgRes.result : orgRes;
      console.log('ORG endpoint:', orgUrl, 'status:', status);
      if (status === 200 && body) console.log('  keys:', Object.keys(body).slice(0,20).join(', '));
    } catch (e) {
      console.log('ORG endpoint error:', e && (e.statusCode || e.status) ? `${e.statusCode||e.status}` : e.message);
    }

    const projects = await listAzdoProjects();
    const toCheck = projects.slice(0, Math.min(5, projects.length));

    for (const project of toCheck) {
      try {
        const projUrl = `${advsecBase}/${encodeURIComponent(project.name)}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
        const pr = await conn.rest.get(projUrl, {});
        const status = pr && pr.statusCode ? pr.statusCode : (pr && pr.result ? 200 : 200);
        const body = pr && pr.result ? pr.result : pr;
        console.log('PROJECT endpoint:', project.name, '=>', projUrl, 'status:', status);
        if (status === 200 && body) console.log('  keys:', Object.keys(body).slice(0,20).join(', '));
      } catch (e) {
        console.log('PROJECT endpoint error for', project.name, ':', e && (e.statusCode || e.status) ? `${e.statusCode||e.status}` : e.message);
      }

      // Repos in project
      const repos = await listRepositories(project.name);
      for (const repo of repos) {
        try {
          const repoUrl = `${advsecBase}/${encodeURIComponent(project.name)}/_apis/management/repositories/${encodeURIComponent(repo.id)}/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
          const rr = await conn.rest.get(repoUrl, {});
          const status = rr && rr.statusCode ? rr.statusCode : (rr && rr.result ? 200 : 200);
          const body = rr && rr.result ? rr.result : rr;
          console.log('  REPO endpoint:', repo.name, '=>', repoUrl, 'status:', status);
          if (status === 200 && body) console.log('    keys:', Object.keys(body).slice(0,20).join(', '));
        } catch (e) {
          console.log('  REPO endpoint error for', repo.name, ':', e && (e.statusCode || e.status) ? `${e.statusCode||e.status}` : e.message);
        }
      }
      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();