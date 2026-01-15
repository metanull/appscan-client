#!/usr/bin/env node
// Minimal script: list Azure DevOps projects using azure-devops-node-api via lab/azdo-auth.js
import { listAzdoProjects } from './azdo-auth.js';

(async function main(){
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log('No projects');
      process.exit(0);
    }
    for (const p of projects) {
      console.log(p.id, p.name);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error listing projects:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();