import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/cli-common.js', () => ({
  initializeAppScanService: vi.fn(),
  handleCommandError: vi.fn(),
}));

import updateIssueStatus from '../../src/cli/commands/update-issue-status.js';
import { initializeAppScanService } from '../../src/utils/cli-common.js';

describe('updateIssueStatus CLI', () => {
  afterEach(() => vi.restoreAllMocks());

  it('updates issue status using service', async () => {
    const service = {
      api: {
        v4: {
          Issues_GetIssue: vi
            .fn()
            .mockResolvedValue({ Id: '1', ApplicationId: 'A' }),
          Issues_UpdateFilteredIssues: vi
            .fn()
            .mockResolvedValue({ TotalIssues: 1, UpdatedIssues: ['1'] }),
        },
      },
    };
    initializeAppScanService.mockResolvedValue({ service });

    await updateIssueStatus('1', 'Open', { config: null, json: false });
    expect(service.api.v4.Issues_UpdateFilteredIssues).toHaveBeenCalled();
  });
});
