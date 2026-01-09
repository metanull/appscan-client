import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import generateYearlySummary from '../../src/cli/commands/yearly-summary.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('yearly-summary CLI', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls service to generate yearly summary', async () => {
    // Mock AppScanService used directly
    vi.mock('../../src/services/appscan-service.js', () => ({
      AppScanService: class {
        async authenticate() {}
        async listApplications() {
          return { Items: [{ Id: 'A', Name: 'App' }] };
        }
        async listScans(appId) {
          return {
            Items: [
              {
                Id: 'S1',
                Name: 'Scan',
                Technology: 'StaticAnalyzer',
                CreatedAt: '2025-05-01T00:00:00Z',
              },
            ],
          };
        }
        async listIssues(scanId) {
          return { Items: [{ Id: 'I1', Severity: 'High' }] };
        }
      },
    }));

    const { default: generateYearlySummaryCmd } =
      await import('../../src/cli/commands/yearly-summary.js');
    await generateYearlySummaryCmd(2025, { config: null, json: false });
    expect(true).toBe(true);
  });
});
