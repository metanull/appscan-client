#!/usr/bin/env node
// Minimal script: assert Advanced Security enablement per repository using azure-devops-node-api
// Requirements: environment with AZDO_* or AZURE_DEVOPS_* vars and PAT
import { listAzdoProjects, listRepositories, getRepoAdvancedSecuritySettings } from './azdo-auth.js';

(async function main(){
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log('No projects');
      process.exit(0);
    }

    const project = projects[0].name;
    const repos = await listRepositories(project);
    if (!repos || repos.length === 0) {
      console.log('No repositories for project', project);
      process.exit(0);
    }

    for (const r of repos) {
      try {
        const s = await getRepoAdvancedSecuritySettings(project, r.id);
        let status = 'unknown';
        if (s && typeof s === 'object') {
          if (s.error) status = `error: ${s.error}`;
          else if (s.advancedSecurityEnabled === true) status = 'enabled';
          else if (s.advancedSecurityEnabled === false) status = 'disabled';
          else status = 'unknown';
        }
        console.log(r.id, r.name, '->', status);
      } catch (e) {
        console.log(r.id, r.name, '->', 'error', (e && e.message) ? e.message : String(e));
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error checking advanced security:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();