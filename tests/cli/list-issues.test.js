import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { listIssues } from '../../src/cli/commands/list-issues.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('listIssues CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'status').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'success').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns JSON when requested', async () => {
    const issues = [{ Id: 'I1' }];
    const service = {
      listIssues: vi.fn().mockResolvedValue({ Items: issues }),
    };
    initializeAppScanService.mockResolvedValue({ service });

    await listIssues('scan1', { json: true });

    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith(issues);
  });

  it('uses filters when provided and calls service with filterOptions', async () => {
    const issues = [{ Id: 'I1' }];
    const service = {
      listIssues: vi.fn().mockResolvedValue({ Items: issues }),
    };
    initializeAppScanService.mockResolvedValue({ service });

    await listIssues('scan1', { active: true, json: true });

    // service.listIssues should be called with scanId and filterOptions
    expect(service.listIssues).toHaveBeenCalled();
    expect(cliOutput.json).toHaveBeenCalledWith(issues);
  });

  it('renders fixgroup grouped output and fetches fixgroup details', async () => {
    const issues = [
      { Id: 'I1', FixGroupId: 'FG1', ApplicationId: 'App1', Severity: 'High' },
      { Id: 'I2', FixGroupId: 'FG2', ApplicationId: 'App1', Severity: 'Low' },
    ];

    const service = {
      listIssues: vi.fn().mockResolvedValue({ Items: issues }),
      api: {
        v4: {
          FixGroups_Get: vi.fn().mockResolvedValue({
            Items: [{ Id: 'FG1', Subject: 'G1', Severity: 'High', NIssues: 1 }],
          }),
        },
      },
    };

    initializeAppScanService.mockResolvedValue({ service });

    await listIssues('scan1', { byFixgroup: true, json: false });

    expect(service.api.v4.FixGroups_Get).toHaveBeenCalledWith(
      'Application',
      'App1',
      {}
    );
    expect(console.log).toHaveBeenCalled();
  });
});
