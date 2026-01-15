#!/usr/bin/env node
// Minimal script: get basic connection and configuration info from Azure DevOps
// Uses azure-devops-node-api via getAzdoClient() in lab/azdo-auth.js
import { getAzdoClient } from './azdo-auth.js';

(async function main(){
  try {
    const conn = await getAzdoClient();
    console.log('Connected to:', conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : process.env.AZURE_DEVOPS_ORG_URL));

    // Use core API to get organization configuration summary (projects list)
    const coreApi = await conn.getCoreApi();
    const projects = await coreApi.getProjects();
    console.log('projects count:', Array.isArray(projects) ? projects.length : '(unknown)');
    if (Array.isArray(projects) && projects.length>0) {
      const p = projects[0];
      console.log('first project:', p.name || p.id || '(no name)');
      console.log('first project url:', p.url || p._links?.web?.href || '(no url)');
    }

    // Print a small summary of connection config
    console.log('serverUrl:', conn.serverUrl);
    console.log('authorizedToCollectUsageData:', conn.authorizedToCollectUsageData === undefined ? '(unknown)' : String(conn.authorizedToCollectUsageData));
    console.log('top-level connection keys:', Object.keys(conn).slice(0,10).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('Error retrieving configuration:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();