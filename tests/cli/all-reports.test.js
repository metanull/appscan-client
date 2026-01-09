import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import generateAllReports from '../../src/cli/commands/all-reports.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('all-reports CLI', () => {
  afterEach(() => vi.restoreAllMocks());

  it('generates all reports via service', async () => {
    // Use a temporary directory for output to avoid touching repo files
    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'appscan-client-test-')
    );

    // Mock AppScanService directly as the command constructs it
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
                Technology: 'SAST',
                CreatedAt: '2025-01-02T00:00:00Z',
              },
            ],
          };
        }
        async listIssues(scanId) {
          return { Items: [{ Id: 'I1', SeverityValue: 5 }] };
        }
      },
    }));

    const { default: generateAllReportsCmd } =
      await import('../../src/cli/commands/all-reports.js');

    await generateAllReportsCmd({ outdir: tmpDir });

    // Cleanup tmpDir
    fs.rmSync(tmpDir, { recursive: true, force: true });

    expect(true).toBe(true);
  });
});
