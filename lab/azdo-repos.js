#!/usr/bin/env node
import {
  listAzdoProjects,
  listRepositories,
  getRepoAdvancedSecuritySettings,
} from './azdo-auth.js';

async function main() {
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log('No projects found');
      process.exit(0);
    }

    // Choose project: CLI arg or first one
    const projectArg = process.argv[2] || projects[0].name;
    console.log(`Using project: ${projectArg}`);

    const repos = await listRepositories(projectArg);
    if (!repos || repos.length === 0) {
      console.log('No repositories found for project', projectArg);
      process.exit(0);
    }

    console.log(`Found ${repos.length} repositories in ${projectArg}`);
    for (const r of repos) {
      const settings = await getRepoAdvancedSecuritySettings(projectArg, r.id);
      let status = 'unknown';
      if (settings.error) status = `error (${settings.error})`;
      else if (settings.advancedSecurityEnabled === true) status = 'enabled';
      else if (settings.advancedSecurityEnabled === false) status = 'disabled';

      console.log(`- ${r.name} (${r.id}): Advanced Security -> ${status}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(
      'Error listing repositories:',
      err.stack || err.message || err
    );
    process.exit(2);
  }
}

if (
  (process.argv[1] && process.argv[1].endsWith('azdo-repos.js')) ||
  process.argv[1] === undefined
) {
  main();
}
