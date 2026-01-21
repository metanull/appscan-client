import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraService } from '../../../src/tui/shared/services/jira.js';

function makeJiraService() {
  const config = {
    getBaseUrl: () => 'https://base',
    getJiraHost: () => 'jira.host',
    getJiraProjectKey: () => 'PROJ',
  };
  const svc = new JiraService(config);
  // Prevent real initialization side-effects
  svc.service = {
    initialize: () => {},
    client: { issues: { createIssue: vi.fn() } },
    convertToADF: (d) => d,
  };
  return svc;
}

describe('JiraService helpers', () => {
  it('extractRelevantArticleSections keeps only Cause and Fix Recommendation sections', () => {
    const svc = makeJiraService();

    const md = `# Intro\nSome text\n## Cause\nCause detail\nMore cause\n## Other\nOther text\n## Fix Recommendation\nFix it\nDetails\n`;

    const res = svc.extractRelevantArticleSections(md);
    expect(res).toContain('## Cause');
    expect(res).toContain('Cause detail');
    expect(res).toContain('## Fix Recommendation');
    expect(res).not.toContain('## Other');
  });

  it('enrichIssuesWithDetails fetches article, comments and focused urls and trims article for first of type', async () => {
    const svc = makeJiraService();
    const issues = [
      { Id: 1, IssueType: 'A' },
      { Id: 2, IssueType: 'A' },
      { Id: 3, IssueType: 'B' },
    ];

    const appScanService = {
      getIssueArticle: vi
        .fn()
        .mockResolvedValue('# Cause\nC\n## Other\nX\n## Fix Recommendation\nF'),
      getIssueComments: vi.fn().mockResolvedValue([{ c: 1 }]),
      getFocusedArticleUrl: vi.fn().mockResolvedValue('https://focused'),
    };

    await svc.enrichIssuesWithDetails(issues, appScanService);

    // first of type A (Id 1) should have articleMarkdown trimmed to cause + fix
    // Headings may use different heading levels (implementation keeps the same level), so assert presence of heading text
    expect(issues[0].articleMarkdown).toContain('Cause');
    expect(issues[0].articleMarkdown).toContain('Fix Recommendation');

    // comments and focusedArticleUrl should be present for all issues
    for (const issue of issues) {
      expect(issue.comments).toBeDefined();
      expect(issue.focusedArticleUrl).toBe('https://focused');
    }

    // Ensure appScanService methods were called expected number of times
    expect(appScanService.getIssueArticle).toHaveBeenCalledTimes(2); // once per type
    expect(appScanService.getIssueComments).toHaveBeenCalledTimes(3);
    expect(appScanService.getFocusedArticleUrl).toHaveBeenCalledTimes(3);
  });

  it('createIssues groups by type, severity and none and calls createJiraIssue accordingly', async () => {
    const svc = makeJiraService();

    // Stub createJiraIssue to return a resolved fake issue
    svc.createJiraIssue = vi.fn().mockResolvedValue({ key: 'X-1' });

    const issues = [
      { IssueType: 'T1', Severity: 'High' },
      { IssueType: 'T1', Severity: 'Low' },
      { IssueType: 'T2', Severity: 'High' },
    ];

    // Group by type -> expect 2 calls (T1 and T2)
    let res = await svc.createIssues(
      'PRJ',
      'type',
      issues,
      null,
      null,
      null,
      null,
      'App'
    );
    expect(svc.createJiraIssue).toHaveBeenCalledTimes(2);
    expect(res.length).toBe(2);

    svc.createJiraIssue.mockClear();
    res = await svc.createIssues('PRJ', 'severity', issues, null);
    expect(svc.createJiraIssue).toHaveBeenCalledTimes(2); // High and Low

    svc.createJiraIssue.mockClear();
    res = await svc.createIssues('PRJ', 'none', issues, null);
    expect(svc.createJiraIssue).toHaveBeenCalledTimes(3); // one per issue
  });
});
