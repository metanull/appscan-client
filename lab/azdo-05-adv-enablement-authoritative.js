#!/usr/bin/env node
// Authoritative Advanced Security enablement reporter using documented management endpoints (via SDK rest client)
// Minimal: no args, uses first 5 projects
import { getAzdoClient, listAzdoProjects, listRepositories } from './azdo-auth.js';

function orgFromServerUrl(serverUrl) {
  if (!serverUrl) return undefined;
  const s = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (s.startsWith('dev.azure.com/')) return s.replace('dev.azure.com/', '');
  if (s.indexOf('.visualstudio.com') !== -1) return s.split('.')[0];
  return s;
}

function safeGet(obj, path) {
  try {
    return path.split('.').reduce((o,k)=>o && o[k], obj);
  } catch { return undefined; }
}

(async function main(){
  try {
    const conn = await getAzdoClient();
    const org = orgFromServerUrl(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL);
    if (!org) { console.error('Cannot determine org'); process.exit(2); }
    const base = `https://advsec.dev.azure.com/${org}`;

    // Org
    const orgUrl = `${base}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
    const orgRes = await conn.rest.get(orgUrl, {});
    const orgBody = orgRes && orgRes.result ? orgRes.result : orgRes;
    console.log('ORGANIZATION ENABLEMENT:');
    console.log('  codeSecurityEnabled:', safeGet(orgBody, 'codeSecurityFeatures.codeSecurityEnabled'));
    console.log('  secretProtectionEnabled:', safeGet(orgBody, 'secretProtectionFeatures.secretProtectionEnabled'));
    console.log('  reposEnablementStatus count:', Array.isArray(orgBody?.reposEnablementStatus) ? orgBody.reposEnablementStatus.length : '(none)');
    console.log('---');

    // Projects
    const projects = await listAzdoProjects();
    const toCheck = projects.slice(0, Math.min(5, projects.length));

    for (const project of toCheck) {
      const projUrl = `${base}/${encodeURIComponent(project.name)}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
      const prRes = await conn.rest.get(projUrl, {});
      const prBody = prRes && prRes.result ? prRes.result : prRes;
      console.log(`PROJECT: ${project.name}`);
      console.log('  codeSecurityEnabled:', safeGet(prBody, 'codeSecurityFeatures.codeSecurityEnabled'));
      console.log('  secretProtectionEnabled:', safeGet(prBody, 'secretProtectionFeatures.secretProtectionEnabled'));
      const reposEnablement = prBody?.reposEnablementStatus || [];
      console.log('  reposEnablementStatus count:', Array.isArray(reposEnablement) ? reposEnablement.length : '(none)');

      // Repos: check first 5 repos in project
      const repos = await listRepositories(project.name);
      const reposToCheck = repos.slice(0, Math.min(5, repos.length));
      for (const r of reposToCheck) {
        const repoUrl = `${base}/${encodeURIComponent(project.name)}/_apis/management/repositories/${encodeURIComponent(r.id)}/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
        const rr = await conn.rest.get(repoUrl, {});
        const rb = rr && rr.result ? rr.result : rr;
        console.log(`  REPO: ${r.name}`);
        console.log('    codeSecurityEnabled:', safeGet(rb, 'codeSecurityFeatures.codeSecurityEnabled'));
        console.log('    secretProtectionEnabled:', safeGet(rb, 'secretProtectionFeatures.secretProtectionEnabled'));
        console.log('    blockPushes:', safeGet(rb, 'secretProtectionFeatures.blockPushes'));
      }
      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();