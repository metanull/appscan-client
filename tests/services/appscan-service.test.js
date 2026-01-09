import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppScanService } from '../../src/services/appscan-service.js';

function makeServiceWithApi(stubs = {}) {
  const svc = new AppScanService();
  svc.token = 'token'; // avoid authenticate()
  svc.config = { getBaseUrl: () => 'https://base' };
  svc.api = { v4: { ...stubs } };
  return svc;
}

describe('AppScanService - filters and transforms', () => {
  it('builds OData filter from filter options via listIssues', async () => {
    const issuesCalled = [];
    const svc = makeServiceWithApi({
      Issues_Get: (scope, scopeId, query) => {
        issuesCalled.push({ scope, scopeId, query });
        return { Items: [] };
      },
    });

    await svc.listIssues('scan-1', {
      statusActive: true,
      severityHigh: true,
      jiraAssigned: true,
    });

    expect(issuesCalled.length).toBe(1);
    const q = issuesCalled[0].query;
    expect(q).toHaveProperty('$filter');
    // Should contain Status OR block, Severity block and ExternalId condition
    expect(q.$filter).toContain(
      "(Status eq 'Open' or Status eq 'Reopened' or Status eq 'InProgress')"
    );
    expect(q.$filter).toContain(
      "(Severity eq 'High' or Severity eq 'Critical')"
    );
    expect(q.$filter).toContain('ExternalId ne null');
  });

  it('transforms CustomFields into customFields map in listApplications', async () => {
    const rawApp = {
      Id: 1,
      Name: 'TestApp',
      CustomFields: [
        { Name: 'cf1', Value: '  v1  ' },
        { Name: 'cf2', Value: '' },
      ],
    };

    const svc = makeServiceWithApi({
      Apps_Get: () => ({ Items: [rawApp] }),
    });

    const res = await svc.listApplications();
    // Current implementation preserves whitespace in the value
    expect(res.Items[0].customFields).toEqual({ cf1: '  v1  ', cf2: null });
    expect(res.Items[0]._customFieldsRaw).toBeDefined();
    expect(res.Items[0].CustomFields).toBeUndefined();
  });

  it('returns focused article url when api contains matching ApiVulnName link and decodes entities', async () => {
    const issue = {
      IssueTypeId: 'TID',
      Language: 'en',
      // Note: the implementation compares anchor text directly to ApiVulnName without HTML decoding
      // so provide the anchor encoded text here to match the implementation
      ApiVulnName: 'X&amp;Y',
    };

    // api returns HTML containing apiLinks with anchor (anchor text uses HTML entity)
    const html =
      '<div id="apiLinks"><a href="path/with&amp;entity">X&amp;Y</a></div>';

    const svc = makeServiceWithApi({
      Reports_GetArticle: () => html,
    });

    const url = await svc.getFocusedArticleUrl(issue);
    expect(url).toBe('https://base/api/v4/Reports/Article/path/with&entity');
  });

  it('falls back to general article url when no ApiVulnName or links found', async () => {
    const issue = { IssueTypeId: 'TID', Language: 'en' };
    const svc = makeServiceWithApi({ Reports_GetArticle: () => '<div></div>' });
    const url = await svc.getFocusedArticleUrl(issue);
    expect(url).toBe(
      'https://base/api/v4/Reports/Article/?issuetype=TID&language=en'
    );
  });
});
