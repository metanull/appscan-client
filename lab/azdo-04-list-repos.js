#!/usr/bin/env node
// Minimal script: list repositories for the first Azure DevOps project using azure-devops-node-api
import { listAzdoProjects, listRepositories } from './azdo-auth.js';

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
      console.log(r.id, r.name);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error listing repositories:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();