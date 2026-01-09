import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { listApplications } from '../../src/cli/commands/list-applications.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('listApplications CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('prints JSON when requested', async () => {
    const apps = [{ Id: 'A', Name: 'App' }];
    initializeAppScanService.mockResolvedValue({
      service: { listApplications: vi.fn().mockResolvedValue({ Items: apps }) },
    });

    await listApplications({ json: true });

    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith(apps);
  });

  it('prints formatted output when not JSON', async () => {
    const apps = [
      {
        Id: 'A',
        Name: 'App',
        Description: 'D',
        TotalIssues: 1,
        OpenIssues: 1,
        TotalScans: 2,
      },
    ];
    initializeAppScanService.mockResolvedValue({
      service: { listApplications: vi.fn().mockResolvedValue({ Items: apps }) },
    });

    await listApplications({ json: false });

    expect(cliOutput.result).toHaveBeenCalled();
    expect(
      cliOutput.result.mock.calls.some((c) => c.join('').includes('App'))
    ).toBe(true);
  });
});
