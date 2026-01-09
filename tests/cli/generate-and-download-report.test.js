import { describe, it, expect, vi } from 'vitest';

// Mock fs to avoid file writes
vi.mock('fs', async () => {
  const fs = await vi.importActual('fs');
  return {
    ...fs,
    writeFileSync: vi.fn(),
  };
});

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import generateAndDownloadReport from '../../src/cli/commands/generate-and-download-report.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('generateAndDownloadReport CLI', () => {
  beforeEach(() => vi.spyOn(cliOutput, 'result').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('generates and downloads report', async () => {
    // Reset modules to ensure mocks are applied and no prior imports cached real fs
    vi.resetModules();

    // Reset modules and spy on fs.writeFileSync to guarantee intercept
    vi.resetModules();
    const fsSpyModule = await import('fs');
    vi.spyOn(fsSpyModule, 'writeFileSync').mockImplementation(() => {});

    // Mock AppScanService used directly
    vi.mock('../../src/services/appscan-service.js', () => ({
      AppScanService: class {
        async generateAndDownloadReport() {
          return { reportId: 'r1', content: 'x', report: { Status: 'Done' } };
        }
      },
    }));

    const { default: generateAndDownloadReportCmd } =
      await import('../../src/cli/commands/generate-and-download-report.js');

    // Use temporary directory for output to avoid writing into repo
    const os = await import('os');
    const path = await import('path');
    const fs = await import('fs');
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'appscan-client-test-')
    );
    const outputPath = path.join(tmpDir, 'report-r1.html');

    await generateAndDownloadReportCmd('Scan', 'A', { output: outputPath });

    // Ensure file was created in tmp dir and contains expected content
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf8');
    expect(content).toBe('x');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
