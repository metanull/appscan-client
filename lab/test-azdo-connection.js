#!/usr/bin/env node
import { listAzdoProjects } from './azdo-auth.js';

async function main() {
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log(
        'No projects found or none accessible with the provided credentials.'
      );
      process.exit(0);
    }

    console.log('Found projects:');
    for (const p of projects) {
      console.log(`- ${p.name} (${p.id})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to Azure DevOps:', err.message);
    process.exit(2);
  }
}

// Execute when the script is invoked directly (works on Windows and Unix paths)
if (
  (process.argv[1] && process.argv[1].endsWith('test-azdo-connection.js')) ||
  process.argv[1] === undefined
) {
  main();
}
