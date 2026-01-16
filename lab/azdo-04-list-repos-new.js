#!/usr/bin/env node
/**
 * azdo-04-list-repos-new.js
 *
 * Purpose: List repositories for Azure DevOps projects
 * Package APIs: getCoreApi(), getGitApi(), getProjects(), getRepositories()
 * Self-contained: Yes
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

async function main() {
  try {
    // Connect to Azure DevOps
    const orgUrlFromAzureEnv =
      process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
        ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
        : undefined;

    const orgUrl =
      process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
    const pat =
      process.env.AZDO_PAT ||
      process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
      process.env.AZURE_DEVOPS_PAT;

    if (!orgUrl || !pat) {
      throw new Error(
        'Missing required environment variables: AZDO_ORG_URL and AZDO_PAT'
      );
    }

    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    const conn = new azdev.WebApi(orgUrl, authHandler);
    await conn.connect();

    // Get project to list repos for (default: first project, or from env)
    const targetProject = process.env.AZDO_PROJECT;

    console.log('Fetching projects...\n');
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();

    if (!projects || projects.length === 0) {
      console.log('No projects found.');
      process.exit(0);
    }

    // Select project
    let project;
    if (targetProject) {
      project = projects.find((p) => p.name === targetProject);
      if (!project) {
        console.log(
          `Project "${targetProject}" not found. Available projects:`
        );
        projects.forEach((p) => console.log(`  - ${p.name}`));
        process.exit(1);
      }
    } else {
      project = projects[0];
      console.log(`Using first project: ${project.name}`);
      console.log(`(Set AZDO_PROJECT env var to choose a different project)\n`);
    }

    // Get Git API and list repositories
    console.log(`Fetching repositories for project: ${project.name}\n`);
    const gitApi = await conn.getGitApi();
    const repos = await gitApi.getRepositories(project.id);

    if (!repos || repos.length === 0) {
      console.log(`No repositories found in project "${project.name}".`);
      process.exit(0);
    }

    console.log(`Found ${repos.length} repository(ies):\n`);

    // Display repositories with details
    for (const repo of repos) {
      console.log(`${repo.name}`);
      console.log(`  ID: ${repo.id}`);
      console.log(`  Project: ${repo.project?.name || project.name}`);
      console.log(`  Default Branch: ${repo.defaultBranch || 'N/A'}`);
      console.log(`  Size: ${repo.size ? `${repo.size} bytes` : 'N/A'}`);
      console.log(`  URL: ${repo.webUrl || repo.remoteUrl || 'N/A'}`);
      console.log(`  Disabled: ${repo.isDisabled ? 'Yes' : 'No'}`);
      console.log();
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
