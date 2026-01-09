import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { listIssuesByApp } from '../../src/cli/commands/list-issues-by-app.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('listIssuesByApp CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'status').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'success').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns JSON when requested', async () => {
    const issues = [{ Id: 'I1' }];
    initializeAppScanService.mockResolvedValue({
      service: { listIssues: vi.fn().mockResolvedValue({ Items: issues }) },
    });

    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});

    await listIssuesByApp('app1', { json: true });
    expect(cliOutput.json).toHaveBeenCalledWith(issues);
  });
});
