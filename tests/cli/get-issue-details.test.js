import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Mock AppScanService class before importing command
vi.mock('../../src/services/appscan-service.js', () => {
  return {
    AppScanService: class {
      constructor() {}
      async getIssueDetails(id) {
        return `<div>issue ${id}</div>`;
      }
    },
  };
});

import { getIssueDetails } from '../../src/cli/commands/get-issue-details.js';
import cliOutput from '../../src/utils/cli-output.js';

describe('getIssueDetails CLI', () => {
  beforeEach(() => {
    vi.spyOn(cliOutput, 'result').mockImplementation(() => {});
    vi.spyOn(cliOutput, 'success').mockImplementation(() => {});
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('prints details to stdout when no output specified', async () => {
    await getIssueDetails('123', { output: undefined, format: 'html' });
    expect(cliOutput.result).toHaveBeenCalledWith('<div>issue 123</div>');
  });

  it('writes details to file when output specified', async () => {
    await getIssueDetails('123', { output: 'out.html', format: 'html' });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'out.html',
      '<div>issue 123</div>'
    );
    expect(cliOutput.success).toHaveBeenCalled();
  });
});
