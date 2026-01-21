import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppScanService } from '../../src/tui/shared/services/asoc.js';
import * as AppScanUrls from '../../src/utils/appscan-urls.js';

describe('TUI AppScanService helpers', () => {
  let svc;

  beforeEach(() => {
    svc = new AppScanService(null);
    // Replace parent service with a fake so we don't perform real HTTP calls
    svc.service = {
      ensureAuthenticated: vi.fn().mockResolvedValue(true),
      api: {
        v4: {
          FixGroups_Get: vi.fn().mockResolvedValue({ Items: [{ Id: 1 }] }),
          Apps_Update: vi.fn().mockResolvedValue({ ok: true }),
          Issues_UpdateFilteredIssues: vi
            .fn()
            .mockResolvedValue({ UpdatedIssues: 1 }),
          Issues_GetIssue: vi.fn().mockResolvedValue({ ApplicationId: 'app1' }),
        },
      },
      updateAllIssuesInScan: vi.fn().mockResolvedValue({ UpdatedIssues: 3 }),
      updateAllIssuesInApplication: vi
        .fn()
        .mockResolvedValue({ UpdatedIssues: 4 }),
    };
  });

  it('getFixGroups returns Items or empty array and calls API', async () => {
    const items = await svc.getFixGroups('Application', 'app1');
    expect(items).toEqual([{ Id: 1 }]);
    // Error case
    svc.service.api.v4.FixGroups_Get = vi
      .fn()
      .mockRejectedValue(new Error('boom'));
    await expect(svc.getFixGroups('Application', 'app1')).rejects.toThrow(
      'boom'
    );
  });

  it('getAppIssueCounts handles null and numeric strings', () => {
    expect(svc.getAppIssueCounts(null)).toEqual({
      inProgress: 0,
      active: 0,
      total: 0,
    });

    const app = { IssuesInProgress: '2', OpenIssues: 3, TotalIssues: '5' };
    expect(svc.getAppIssueCounts(app)).toEqual({
      inProgress: 2,
      active: 3,
      total: 5,
    });
  });

  it('getScanIssueCounts handles missing LatestExecution and numeric strings', () => {
    expect(svc.getScanIssueCounts(null)).toEqual({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: 0,
    });

    const scan = {
      LatestExecution: {
        NCriticalIssues: '1',
        NHighIssues: 2,
        NMediumIssues: '3',
        NLowIssues: 0,
        NInfoIssues: '0',
        NIssuesFound: '6',
      },
    };
    expect(svc.getScanIssueCounts(scan)).toEqual({
      critical: 1,
      high: 2,
      medium: 3,
      low: 0,
      info: 0,
      total: 6,
    });
  });

  it('getAppScanCount reads multiple possible fields', () => {
    expect(svc.getAppScanCount(null)).toBe(0);
    expect(svc.getAppScanCount({ ScanCount: '2' })).toBe(2);
    expect(svc.getAppScanCount({ NumberOfScans: 3 })).toBe(3);
    expect(svc.getAppScanCount({ TotalScans: '4' })).toBe(4);
  });

  it('URL helpers delegate to AppScanUrls', () => {
    const issueUrlSpy = vi
      .spyOn(AppScanUrls, 'getIssueUrl')
      .mockReturnValue('ISSUE_URL');
    const appUrlSpy = vi
      .spyOn(AppScanUrls, 'getApplicationUrl')
      .mockReturnValue('APP_URL');
    const scanUrlSpy = vi
      .spyOn(AppScanUrls, 'getScanUrl')
      .mockReturnValue('SCAN_URL');
    const jiraUrlSpy = vi
      .spyOn(AppScanUrls, 'getJiraUrl')
      .mockReturnValue('JIRA_URL');

    expect(svc.getIssueUrl('a', 'i')).toBe('ISSUE_URL');
    expect(svc.getApplicationUrl('a')).toBe('APP_URL');
    expect(svc.getScanUrl('a', 's')).toBe('SCAN_URL');

    // getJiraUrl returns null when no ExternalId
    expect(svc.getJiraUrl({})).toBeNull();
    expect(svc.getJiraUrl({ ExternalId: 'PRJ-1' })).toBe('JIRA_URL');

    issueUrlSpy.mockRestore();
    appUrlSpy.mockRestore();
    scanUrlSpy.mockRestore();
    jiraUrlSpy.mockRestore();
  });

  it('getConfig and getBaseUrl return config values', () => {
    expect(svc.getConfig()).toBeDefined();
    expect(svc.getBaseUrl()).toBe(svc.config.getBaseUrl());
  });

  it('bulkUpdateIssuesChunked aggregates results and reports progress', async () => {
    // stub bulkUpdateIssues to fail on second chunk
    const calls = [];
    svc.bulkUpdateIssues = vi.fn().mockImplementation(async (ids) => {
      calls.push(ids);
      if (ids.includes('3')) throw new Error('chunk-fail');
      return { UpdatedIssues: ids.length };
    });

    const ids = ['1', '2', '3', '4', '5'];
    const progressCalls = [];
    const res = await svc.bulkUpdateIssuesChunked(
      ids,
      'app',
      { Status: 'Fixed' },
      2,
      (p, t) => progressCalls.push([p, t])
    );

    expect(res.total).toBe(5);
    expect(res.processed).toBe(5);
    // successful should be 3 (chunks [1,2] success (2), [3,4] failure (0), [5] success (1))
    expect(res.successful).toBe(3);
    expect(res.failed).toBe(2);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(progressCalls.length).toBe(3);
  });
});
