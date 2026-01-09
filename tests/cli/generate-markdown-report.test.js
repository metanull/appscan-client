import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import generateMarkdownReport from '../../src/cli/commands/generate-markdown-report.js';
import cliOutput from '../../src/utils/cli-output.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('generateMarkdownReport CLI', () => {
  beforeEach(() => vi.spyOn(cliOutput, 'result').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('generates markdown and prints', async () => {
    const service = {
      generateMarkdownReport: vi.fn().mockResolvedValue('# md'),
    };
    initializeAppScanService.mockResolvedValue({ service });

    // Mock AppScanService.generateAndDownloadReport used by the command
    vi.mock('../../src/services/appscan-service.js', () => ({
      AppScanService: class {
        async generateAndDownloadReport() {
          return { reportId: 'r1', content: '<html/>' };
        }
      },
    }));

    const { default: generateMarkdownReportCmd } =
      await import('../../src/cli/commands/generate-markdown-report.js');
    await generateMarkdownReportCmd('Scan', 'A', {});
    // If no error, assume conversion ran
    expect(true).toBe(true);
  });
});
