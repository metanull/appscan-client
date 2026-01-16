import { describe, test, expect } from 'vitest';
import { listAzdoProjects } from '../lab/azdo-auth.js';

const hasEnv =
  Boolean(
    process.env.AZDO_ORG_URL ||
    process.env.AZDO_OR ||
    (process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG) ||
    process.env.AZURE_DEVOPS_ORG_URL
  ) &&
  Boolean(
    process.env.AZDO_PAT ||
    process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
    process.env.AZURE_DEVOPS_PAT
  );

describe('Azure DevOps connection (lab)', () => {
  const testFn = hasEnv ? test : test.skip;

  testFn(
    'lists projects from Azure DevOps',
    async () => {
      const projects = await listAzdoProjects();
      expect(Array.isArray(projects)).toBe(true);
    },
    30_000
  );
});
