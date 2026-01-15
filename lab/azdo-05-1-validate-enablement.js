#!/usr/bin/env node
// Minimal validation script that uses new helpers getOrgEnablement/getProjectEnablement/getRepoEnablement
import { listAzdoProjects, listRepositories, getOrgEnablement, getProjectEnablement, getRepoEnablement } from './azdo-auth.js';

(async function main(){
  try {
    const org = await getOrgEnablement();
    console.log('Org enablement keys:', Object.keys(org || {}).slice(0,20).join(', '));

    const projects = await listAzdoProjects();
    const toCheck = projects.slice(0, Math.min(5, projects.length));

    for (const project of toCheck) {
      const p = await getProjectEnablement(project.name);
      console.log(`Project ${project.name} keys:`, Object.keys(p || {}).slice(0,20).join(', '));

      const repos = await listRepositories(project.name);
      const reposToCheck = repos.slice(0, Math.min(5, repos.length));
      for (const r of reposToCheck) {
        const repo = await getRepoEnablement(project.name, r.id);
        console.log(`  Repo ${r.name} -> codeSecurityEnabled: ${repo?.codeSecurityFeatures?.codeSecurityEnabled}, secretProtectionEnabled: ${repo?.secretProtectionFeatures?.secretProtectionEnabled}, blockPushes: ${repo?.secretProtectionFeatures?.blockPushes}`);
      }
      console.log('---');
    }
    process.exit(0);
  } catch (err) {
    console.error('Validation error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();