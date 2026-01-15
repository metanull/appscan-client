import axios from 'axios';
import dotenv from 'dotenv';
import { listAzdoProjects, listRepositories } from './azdo-auth.js';

dotenv.config();

export function getAdvsecBase() {
  const org = process.env.AZURE_DEVOPS_ORG || process.env.AZDO_OR || (process.env.AZDO_ORG_URL && process.env.AZDO_ORG_URL.replace('https://dev.azure.com/',''));
  if (!org) return undefined;
  return `https://advsec.dev.azure.com/${org}`;
}

export async function listRepositoryAlerts({ projectName, repositoryId, apiVersion = '7.2-preview.1', token }) {
  const base = getAdvsecBase();
  if (!base) throw new Error('Advsec base could not be determined from env (AZURE_DEVOPS_ORG or AZDO_OR)');
  const url = `${base}/${encodeURIComponent(projectName)}/_apis/alert/repositories/${encodeURIComponent(repositoryId)}/alerts?api-version=${apiVersion}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(':' + (token || (process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT))).toString('base64')}`,
      Accept: 'application/json',
    },
    validateStatus: null,
  });
  return { status: res.status, data: res.data };
}

export async function listFirstProjectRepoAlerts({ apiVersion } = {}) {
  const projects = await listAzdoProjects();
  const project = projects.find(p => p.name === 'MembersPortal') || projects[0];
  const repos = await listRepositories(project.name);
  const repo = repos[0];
  return listRepositoryAlerts({ projectName: project.name, repositoryId: repo.id, apiVersion });
}
