import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { listScans } from '../../src/cli/commands/list-scans.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('listScans CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns JSON when requested', async () => {
    const scans = [{ Id: 'S1' }];
    initializeAppScanService.mockResolvedValue({
      service: { listScans: vi.fn().mockResolvedValue({ Items: scans }) },
    });

    await listScans('app1', { json: true });
    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith(scans);
  });

  it('prints formatted when not JSON', async () => {
    const scans = [{ Id: 'S1', Name: 'Scan', Technology: 'StaticAnalyzer' }];
    initializeAppScanService.mockResolvedValue({
      service: { listScans: vi.fn().mockResolvedValue({ Items: scans }) },
    });

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await listScans('app1', { json: false });
    expect(console.log).toHaveBeenCalled();

    console.log.mockRestore();
    console.error.mockRestore();
  });
});
