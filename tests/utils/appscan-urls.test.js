import { describe, it, expect } from 'vitest';
import {
  getApplicationUrl,
  getScanUrl,
  getIssueUrl,
  getJiraUrl,
  getJiraProjectUrl,
  getAzureDevOpsProjectUrl,
  getAzureDevOpsRepoUrl,
  getConfluenceSpaceUrl,
} from '../../src/utils/appscan-urls.js';

describe('appscan-urls', () => {
  it('generates application/scan/issue urls', () => {
    expect(getApplicationUrl('https://x', 'A')).toBe('https://x/main/myapps/A');
    expect(getScanUrl('https://x', 'A', 'S')).toBe('https://x/main/myapps/A/scans/S');
    expect(getIssueUrl('https://x', 'A', 'I')).toBe('https://x/main/myapps/A/issues/I');
  });

  it('returns null for missing jira params', () => {
    expect(getJiraUrl('', 'PROJ-1')).toBeNull();
    expect(getJiraUrl('https://jira', '')).toBeNull();
    expect(getJiraProjectUrl('', 'P')).toBeNull();
  });

  it('builds jira and azure urls', () => {
    expect(getJiraUrl('https://jira', 'P-1')).toBe('https://jira/browse/P-1');
    expect(getJiraProjectUrl('https://jira', 'PRJ')).toContain('/projects/PRJ/summary');
    expect(getAzureDevOpsProjectUrl('https://dev.azure.com', 'org', 'proj')).toBe('https://dev.azure.com/org/proj');
    expect(getAzureDevOpsRepoUrl('https://dev.azure.com', 'org', 'proj', 'repo')).toBe('https://dev.azure.com/org/proj/_git/repo');
    expect(getConfluenceSpaceUrl('https://con', 'ABC')).toContain('/spaces/ABC/overview');
  });
});
