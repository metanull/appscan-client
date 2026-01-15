#!/usr/bin/env node
// Minimal script to connect to Azure DevOps using azure-devops-node-api
// Requirements: set AZDO_ORG_URL or AZDO_OR and AZDO_PAT (or AZURE_DEVOPS_* equivalents) in env
import { getAzdoClient } from './azdo-auth.js';

(async function main(){
  try {
    const conn = await getAzdoClient();
    // If getAzdoClient resolves, connection succeeded. Print minimal confirmation.
    console.log('Connected to Azure DevOps');
    // Print org url used for clarity
    console.log('Org URL:', conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : process.env.AZURE_DEVOPS_ORG_URL));
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();