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
