import { describe, it, expect, vi } from 'vitest';

// Mock AppScanService class used directly by the command
vi.mock('../../src/services/appscan-service.js', () => ({
  AppScanService: class {
    async authenticate() {}
    async listScanExecutions(scanId) {
      return { Items: [{ Id: 'E1', Status: 'Ready' }] };
    }
  },
}));

import { listScanExecutions } from '../../src/cli/commands/list-scan-executions.js';
import cliOutput from '../../src/utils/cli-output.js';

describe('listScanExecutions CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'json').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'status').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'success').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns JSON when requested', async () => {
    // The mocked AppScanService returns a ready execution
    await listScanExecutions('scan1', { json: true });
    expect(cliOutput.setJsonMode).toHaveBeenCalledWith(true);
    expect(cliOutput.json).toHaveBeenCalledWith([
      { Id: 'E1', Status: 'Ready' },
    ]);
  });

  it('prints formatted when not JSON', async () => {
    await listScanExecutions('scan1', { json: false });
    expect(cliOutput.status).toHaveBeenCalled();
  });
});
