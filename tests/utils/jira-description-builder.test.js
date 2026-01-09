import { describe, it, expect } from 'vitest';
import { JiraDescriptionBuilder } from '../../src/utils/jira-description-builder.js';

describe('JiraDescriptionBuilder', () => {
  it('builds article url and formats location', () => {
    const j = new JiraDescriptionBuilder([]);
    const issue = { IssueTypeId: '123', Language: 'en', Api: 'v1' };
    expect(j.buildArticleUrl(issue)).toContain('issuetype=123');
    expect(j.buildArticleUrl({})).toBeNull();

    expect(j.formatLocation({ SourceFile: 'a.js', LineNumber: 10 })).toBe('a.js:10');
    expect(j.formatLocation({ Location: 'L' })).toBe('L');
    expect(j.formatLocation({ SourceFileUri: 'https://x/path/file.js' })).toBe('file.js');
  });

  it('groups issues and calculates stats and highest severity', () => {
    const issues = [
      { IssueType: 'SQL', Severity: 'High' },
      { IssueType: 'SQL', Severity: 'Low' },
      { IssueType: 'XSS', Severity: 'Critical' },
    ];

    const j = new JiraDescriptionBuilder(issues);
    const grouped = j.groupByType();
    expect(grouped.length).toBe(2);

    const stats = j.calculateStats();
    expect(stats.High).toBe(1);
    expect(stats.Critical).toBe(1);

    expect(j.getHighestSeverity(issues.filter((i) => i.IssueType === 'SQL'))).toBe('High');
  });

  it('addMetadata adds app and scan info', () => {
    const app = { Id: 'A', Name: 'App' };
    const scan = { Id: 'S', Name: 'Scan' };
    const j = new JiraDescriptionBuilder([], 'https://app', app, scan);
    j.addMetadata();
    const out = j.build();
    expect(out).toContain('Application');
    expect(out).toContain('Scan');
  });
});
