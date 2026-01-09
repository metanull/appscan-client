import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock initializeAppScanService before importing command
vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import { getApplication } from '../../src/cli/commands/get-application.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('getApplication CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('outputs JSON when --json is true', async () => {
    const fakeApp = { Id: 'A', Name: 'App' };
    initializeAppScanService.mockResolvedValue({
      service: { getApplicationDetails: vi.fn().mockResolvedValue(fakeApp) },
    });

    await getApplication('A', { config: null, json: true });

    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith(fakeApp);
  });

  it('outputs formatted when not JSON', async () => {
    const fakeApp = { Id: 'A', Name: 'App', Description: 'X' };
    initializeAppScanService.mockResolvedValue({
      service: { getApplicationDetails: vi.fn().mockResolvedValue(fakeApp) },
    });

    await getApplication('A', { config: null, json: false });

    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(false);
    expect(cliOutput.result).toHaveBeenCalled();
    // ensure name displayed
    expect(
      cliOutput.result.mock.calls.some((c) => c.join('').includes('App'))
    ).toBe(true);
  });
});
