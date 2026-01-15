import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

/**
 * Read Azure DevOps connection info from environment and return a connected WebApi client.
 * Throws if required env vars are missing.
 *
 * Env vars supported:
 * - AZDO_ORG_URL: Azure DevOps organization URL (e.g. https://dev.azure.com/<org>)
 * - AZDO_PAT: Personal access token with correct scopes
 *
 * @returns {Promise<import('azure-devops-node-api/WebApi').WebApi>} connected WebApi
 */
export async function getAzdoClient() {
  // Accept multiple env var names used across different environments
  // - AZDO_ORG_URL, AZDO_OR
  // - AZDO_PAT, AZDO_PERSONAL_ACCESS_TOKEN
  // - AZURE_DEVOPS_BASE_URL + AZURE_DEVOPS_ORG, AZURE_DEVOPS_PAT
  const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
    ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
    : undefined;

  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv || process.env.AZURE_DEVOPS_ORG_URL;
  const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;

  if (!orgUrl || !pat) {
    throw new Error('Missing Azure DevOps environment variables. Set one of (AZDO_ORG_URL | AZDO_OR | AZURE_DEVOPS_BASE_URL+AZURE_DEVOPS_ORG) and one of (AZDO_PAT | AZDO_PERSONAL_ACCESS_TOKEN | AZURE_DEVOPS_PAT)');
  }

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  // Test connectivity by asking for core API
  await connection.connect();
  return connection;
}

/**
 * List projects in the organization.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function listAzdoProjects() {
  const conn = await getAzdoClient();
  const coreApi = await conn.getCoreApi();
  const projects = await coreApi.getProjects();
  return (projects || []).map((p) => ({ id: p.id, name: p.name }));
}

/**
 * List repositories for a project.
 * @param {string} project Project id or name
 * @returns {Promise<Array<{id:string,name:string,projectName?:string}>>}
 */
export async function listRepositories(project) {
  const conn = await getAzdoClient();
  const gitApi = await conn.getGitApi();
  const repos = await gitApi.getRepositories(project);
  return (repos || []).map((r) => ({ id: r.id, name: r.name, projectName: r.project?.name }));
}

/**
 * Try to get Advanced Security settings for a repository. Not all orgs have Advanced Security APIs enabled;
 * this function returns an object describing the result and marks unknowns.
 *
 * @param {string} project Project id or name
 * @param {string} repoId Repository id
 * @returns {Promise<{advancedSecurityEnabled?:boolean, pushProtectionEnabled?:boolean, secretScanningEnabled?:boolean, raw?:any, error?:string}>}
 */
export async function getRepoAdvancedSecuritySettings(project, repoId) {
  const conn = await getAzdoClient();
  try {
    // Prefer SDK client when available
    if (typeof conn.getAdvancedSecurityManagementApi === 'function') {
      const adv = await conn.getAdvancedSecurityManagementApi();
      const settings = await adv.getRepoAdvancedSecuritySettings(project, repoId);
      return {
        advancedSecurityEnabled: settings?.enabled,
        pushProtectionEnabled: settings?.pushProtectionEnabled,
        secretScanningEnabled: settings?.secretScanningEnabled,
        raw: settings,
      };
    }

    // Fallback to REST API call
    const base = process.env.AZDO_ORG_URL || process.env.AZDO_OR ||
      (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : undefined) || process.env.AZURE_DEVOPS_ORG_URL;

    if (!base) {
      return { error: 'Cannot determine Azure DevOps base URL for REST fallback' };
    }

    const url = `${base}/${encodeURIComponent(project)}/_apis/advancedsecurity/repositories/${encodeURIComponent(repoId)}/settings?api-version=7.2-preview.1`; 
    try {
      const res = await conn.rest.get(url);
      // Response shape may vary. Map common fields.
      return {
        advancedSecurityEnabled: res?.enabled ?? res?.advancedSecurityEnabled ?? undefined,
        pushProtectionEnabled: res?.pushProtectionEnabled ?? undefined,
        secretScanningEnabled: res?.secretScanningEnabled ?? undefined,
        raw: res,
      };
    } catch (restErr) {
      return { error: restErr && restErr.message ? restErr.message : String(restErr) };
    }
  } catch (err) {
    return { error: err && err.message ? err.message : String(err) };
  }
}

/**
 * Get organization-level advanced security enablement settings via documented management endpoint
 * @returns {Promise<any>} parsed enablement object
 */
export async function getOrgEnablement() {
  const conn = await getAzdoClient();
  const org = process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : process.env.AZURE_DEVOPS_ORG_URL);
  if (!org) throw new Error('Cannot determine org URL');
  const orgName = org.replace(/^https?:\/\//,'').replace(/\/$/,'');
  const advBase = orgName.startsWith('dev.azure.com/') ? `https://advsec.dev.azure.com/${orgName.replace('dev.azure.com/','')}` : `https://advsec.dev.azure.com/${orgName.split('.')[0]}`;
  const url = `${advBase}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
  const res = await conn.rest.get(url, {});
  return res && res.result ? res.result : res;
}

/**
 * Get project-level advanced security enablement settings
 * @param {string} project Project id or name
 */
export async function getProjectEnablement(project) {
  const conn = await getAzdoClient();
  const org = process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : process.env.AZURE_DEVOPS_ORG_URL);
  if (!org) throw new Error('Cannot determine org URL');
  const orgName = org.replace(/^https?:\/\//,'').replace(/\/$/,'');
  const advBase = orgName.startsWith('dev.azure.com/') ? `https://advsec.dev.azure.com/${orgName.replace('dev.azure.com/','')}` : `https://advsec.dev.azure.com/${orgName.split('.')[0]}`;
  const url = `${advBase}/${encodeURIComponent(project)}/_apis/management/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
  const res = await conn.rest.get(url, {});
  return res && res.result ? res.result : res;
}

/**
 * Get repository-level advanced security enablement settings
 * @param {string} project
 * @param {string} repositoryId
 */
export async function getRepoEnablement(project, repositoryId) {
  const conn = await getAzdoClient();
  const org = process.env.AZDO_ORG_URL || process.env.AZDO_OR || (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}` : process.env.AZURE_DEVOPS_ORG_URL);
  if (!org) throw new Error('Cannot determine org URL');
  const orgName = org.replace(/^https?:\/\//,'').replace(/\/$/,'');
  const advBase = orgName.startsWith('dev.azure.com/') ? `https://advsec.dev.azure.com/${orgName.replace('dev.azure.com/','')}` : `https://advsec.dev.azure.com/${orgName.split('.')[0]}`;
  const url = `${advBase}/${encodeURIComponent(project)}/_apis/management/repositories/${encodeURIComponent(repositoryId)}/enablement?api-version=7.2-preview.3&includeAllProperties=true`;
  const res = await conn.rest.get(url, {});
  return res && res.result ? res.result : res;
}
