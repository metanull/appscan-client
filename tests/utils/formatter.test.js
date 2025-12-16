import { Formatter } from '../../src/utils/formatter.js';

describe('Formatter', () => {
  test('normalizeScanType converts StaticAnalyzer to SAST', () => {
    expect(Formatter.normalizeScanType('StaticAnalyzer')).toBe('SAST');
  });

  test('normalizeScanType converts DynamicAnalyzer to DAST', () => {
    expect(Formatter.normalizeScanType('DynamicAnalyzer')).toBe('DAST');
  });

  test('normalizeScanType converts ScaAnalyzer to SCA', () => {
    expect(Formatter.normalizeScanType('ScaAnalyzer')).toBe('SCA');
  });

  test('normalizeScanType converts IASTAnalyzer to IAST', () => {
    expect(Formatter.normalizeScanType('IASTAnalyzer')).toBe('IAST');
  });

  test('normalizeScanType returns unchanged for unknown types', () => {
    expect(Formatter.normalizeScanType('UnknownType')).toBe('UnknownType');
  });

  test('severityToValue maps severities to numbers', () => {
    expect(Formatter.severityToValue('Critical')).toBe(5);
    expect(Formatter.severityToValue('High')).toBe(4);
    expect(Formatter.severityToValue('Medium')).toBe(3);
    expect(Formatter.severityToValue('Low')).toBe(2);
    expect(Formatter.severityToValue('Informational')).toBe(1);
    expect(Formatter.severityToValue('Unknown')).toBe(0);
  });

  test('getSeverityColor returns correct colors', () => {
    expect(Formatter.getSeverityColor('Critical')).toBe('redBright');
    expect(Formatter.getSeverityColor('High')).toBe('red');
    expect(Formatter.getSeverityColor('Medium')).toBe('yellow');
    expect(Formatter.getSeverityColor('Low')).toBe('blue');
    expect(Formatter.getSeverityColor('Informational')).toBe('gray');
  });

  test('formatApplication creates correct structure', () => {
    const formatter = new Formatter('https://cloud.appscan.com');
    const app = {
      Id: 'app-123',
      Name: 'Test App',
      Description: 'Test Description',
      RiskRating: 'High',
      TotalIssues: 10,
      OpenIssues: 5,
      CriticalIssues: 1,
      HighIssues: 2,
      MediumIssues: 3,
      LowIssues: 4,
      InformationalIssues: 0,
      CreatedAt: '2025-01-01T00:00:00Z',
    };

    const formatted = formatter.formatApplication(app);
    expect(formatted.id).toBe('app-123');
    expect(formatted.name).toBe('Test App');
    expect(formatted.totalIssues).toBe(10);
    expect(formatted.url).toBe('https://cloud.appscan.com/apps/app-123');
  });

  test('formatScan creates correct structure', () => {
    const formatter = new Formatter('https://cloud.appscan.com');
    const scan = {
      Id: 'scan-123',
      Name: 'Test Scan',
      AppId: 'app-123',
      Technology: 'StaticAnalyzer',
      NumberOfExecutions: 5,
      CreatedAt: '2025-01-01T00:00:00Z',
      UpdatedAt: '2025-01-02T00:00:00Z',
      LatestExecution: {
        Status: 'Ready',
        ExecutionProgress: 'Completed',
        UpdatedAt: '2025-01-02T00:00:00Z',
      },
    };

    const formatted = formatter.formatScan(scan);
    expect(formatted.id).toBe('scan-123');
    expect(formatted.scanType).toBe('SAST');
    expect(formatted.url).toBe('https://cloud.appscan.com/scans/scan-123');
  });

  test('formatVulnerability creates correct structure', () => {
    const formatter = new Formatter('https://cloud.appscan.com');
    const issue = {
      Id: 'issue-123',
      IssueType: 'SQL Injection',
      IssueTypeId: 'SQLInjection',
      ApplicationId: 'app-123',
      ScanId: 'scan-123',
      Severity: 'High',
      Status: 'Open',
      Location: '/path/to/file.js',
      DateCreated: '2025-01-01T00:00:00Z',
    };

    const formatted = formatter.formatVulnerability(issue);
    expect(formatted.id).toBe('issue-123');
    expect(formatted.severity).toBe('High');
    expect(formatted.severityValue).toBe(4);
    expect(formatted.appScanUrl).toBe(
      'https://cloud.appscan.com/issues/issue-123'
    );
    expect(formatted.remediationUrl).toBe(
      'https://cloud.appscan.com/api/v4/Reports/Article/?issuetype=SQLInjection'
    );
  });

  test('stripAnsi removes ANSI color codes', () => {
    const str = '\u001b[31mRed Text\u001b[0m';
    const stripped = Formatter.stripAnsi(str);
    expect(stripped).toBe('Red Text');
  });
});
