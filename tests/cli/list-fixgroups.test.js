import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { listFixGroups } from '../../src/cli/commands/list-fixgroups.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('listFixGroups CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'status').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'success').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns JSON when requested', async () => {
    const fixGroups = [{ Id: 'F1' }];
    const service = {
      api: {
        v4: { FixGroups_Get: vi.fn().mockResolvedValue({ Items: fixGroups }) },
      },
    };
    initializeAppScanService.mockResolvedValue({ service });

    await listFixGroups('app1', { json: true });

    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith(fixGroups);
  });

  it('prints formatted output when not JSON', async () => {
    const fixGroups = [
      {
        Id: 'F1',
        Subject: 'S',
        Severity: 'High',
        Status: 'Open',
        NIssues: 2,
        NOpenIssues: 1,
      },
    ];
    const service = {
      api: {
        v4: { FixGroups_Get: vi.fn().mockResolvedValue({ Items: fixGroups }) },
      },
    };
    initializeAppScanService.mockResolvedValue({ service });

    await listFixGroups('app1', { json: false });

    expect(cliOutput.status).toHaveBeenCalled();
    // ensure header printed via cliOutput.success
    expect(cliOutput.success).toHaveBeenCalled();
  });
});
