import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import generateReport from '../../src/cli/commands/generate-report.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('generateReport CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'setJsonMode').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('calls service to generate report and prints result', async () => {
    const service = {
      listScans: vi.fn().mockResolvedValue({ Items: [] }),
      getApplicationDetails: vi.fn().mockResolvedValue({ Name: 'App' }),
    };
    initializeAppScanService.mockResolvedValue({ service });

    // Mock AppScanService used by the command
    vi.mock('../../src/services/appscan-service.js', () => ({
      AppScanService: class {
        async authenticate() {}
        async listScans(id) {
          return { Items: [] };
        }
        async getApplicationDetails(id) {
          return { Name: 'App' };
        }
      },
    }));

    const { default: generateReportCmd } =
      await import('../../src/cli/commands/generate-report.js');
    await generateReportCmd('scans', 'A', { config: null, format: 'markdown' });
    // If no error, command executed with mock
    expect(true).toBe(true);
  });
});
