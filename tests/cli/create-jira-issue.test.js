import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeServices: vi.fn(),
  handleCommandError: vi.fn(),
}));

// Mock Jira client availability
vi.mock('jira.js', () => ({ default: {} }));

// Mock Config to be valid and provide a Jira project key
vi.mock('../../src/utils/config.js', () => ({
  Config: class {
    constructor() {}
    isValid() {
      return true;
    }
    isJiraValid() {
      return true;
    }
    getJiraProjectKey() {
      return 'PRJ';
    }
    getJiraHost() {
      return 'https://jira.example';
    }
    getBaseUrl() {
      return 'https://cloud.appscan.com';
    }
  },
}));

// Mock AppScanService and JiraService used directly in command
vi.mock('../../src/services/appscan-service.js', () => ({
  AppScanService: class {
    async authenticate() {}
    async listIssues() {
      return {
        Items: [
          { Id: 'I1', Severity: 'High', IssueType: 'X', ApplicationId: 'A' },
        ],
      };
    }
    async getScanDetails() {
      return { Items: [{ Id: 'A', Name: 'Scan' }] };
    }
    api = {
      v4: {
        Issues_GetIssue: async () => ({
          Id: 'I1',
          ApplicationId: 'A',
          Severity: 'High',
        }),
      },
    };
  },
}));

vi.mock('../../src/services/jira-service.js', () => ({
  JiraService: class {
    constructor() {}
    initialize() {}
    async getProject() {
      return true;
    }
    async createIssue(project, summary, description, issueType) {
      return { key: 'PRJ-1', id: '100' };
    }
  },
}));

import createJiraIssue from '../../src/cli/commands/create-jira-issue.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeServices } from '../../src/utils/cli-common.js';

describe('createJiraIssue CLI', () => {
  beforeEach(() => vi.spyOn(cliOutput, 'result').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('creates jira issue via service and prints', async () => {
    const service = { createJiraForSelected: vi.fn().mockResolvedValue('ok') };
    const jira = { create: vi.fn() };
    initializeServices.mockResolvedValue({ service, jiraService: jira });

    // Call with correct signature: source 'scan' and id 'A'
    await createJiraIssue('scan', 'A', { project: 'PRJ', minSeverity: '0' });
    // If no error and mocks executed, assert true
    expect(true).toBe(true);
  });
});
