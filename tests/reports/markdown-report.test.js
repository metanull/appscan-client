import { MarkdownReportGenerator } from '../../src/reports/markdown-report.js';

describe('MarkdownReportGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new MarkdownReportGenerator();
  });

  describe('generateApplicationsReport', () => {
    it('should generate report for applications', () => {
      const applications = [
        { Name: 'App 1', Id: '123', Description: 'Test app 1' },
        { Name: 'App 2', Id: '456', Description: 'Test app 2' },
      ];

      const report = generator.generateApplicationsReport(applications);

      expect(report).toContain('# AppScan Applications Report');
      expect(report).toContain('## Applications (2)');
      expect(report).toContain('App 1');
      expect(report).toContain('App 2');
      expect(report).toContain('123');
      expect(report).toContain('456');
    });

    it('should handle empty applications list', () => {
      const report = generator.generateApplicationsReport([]);

      expect(report).toContain('## Applications (0)');
      expect(report).toContain('No applications found');
    });

    it('should escape pipe characters in descriptions', () => {
      const applications = [
        { Name: 'App', Id: '123', Description: 'Test | with | pipes' },
      ];

      const report = generator.generateApplicationsReport(applications);

      expect(report).toContain('Test \\| with \\| pipes');
    });
  });

  describe('generateScansReport', () => {
    it('should generate report for scans', () => {
      const scans = [
        {
          Name: 'Scan 1',
          Id: 'scan-123',
          ScanType: 'DAST',
          LatestExecution: { Status: 'Completed' },
        },
        {
          Name: 'Scan 2',
          Id: 'scan-456',
          ScanType: 'SAST',
          LatestExecution: { Status: 'Running' },
        },
      ];

      const report = generator.generateScansReport(scans, 'Test App');

      expect(report).toContain('# AppScan Scans Report');
      expect(report).toContain('Application: Test App');
      expect(report).toContain('## Scans (2)');
      expect(report).toContain('Scan 1');
      expect(report).toContain('DAST');
      expect(report).toContain('Completed');
    });

    it('should handle empty scans list', () => {
      const report = generator.generateScansReport([]);

      expect(report).toContain('## Scans (0)');
      expect(report).toContain('No scans found');
    });
  });

  describe('generateIssuesReport', () => {
    it('should generate report for issues grouped by severity', () => {
      const issues = [
        {
          IssueType: 'XSS',
          Severity: 'High',
          Location: '/page1',
          Status: 'Open',
        },
        {
          IssueType: 'SQL Injection',
          Severity: 'Critical',
          Location: '/page2',
          Status: 'Open',
        },
        {
          IssueType: 'Info Leak',
          Severity: 'Low',
          Location: '/page3',
          Status: 'Fixed',
        },
      ];

      const report = generator.generateIssuesReport(issues, 'Test Scan');

      expect(report).toContain('# AppScan Issues Report');
      expect(report).toContain('Scan: Test Scan');
      expect(report).toContain('## Issues (3)');
      expect(report).toContain('### Critical Severity (1)');
      expect(report).toContain('### High Severity (1)');
      expect(report).toContain('### Low Severity (1)');
      expect(report).toContain('SQL Injection');
      expect(report).toContain('XSS');
    });

    it('should handle empty issues list', () => {
      const report = generator.generateIssuesReport([]);

      expect(report).toContain('## Issues (0)');
      expect(report).toContain('No issues found');
    });
  });

  describe('generateScanExecutionsReport', () => {
    it('should generate report for scan executions', () => {
      const executions = [
        {
          Id: 'exec-1',
          Status: 'Completed',
          StartedAt: '2025-01-01T10:00:00Z',
          CompletedAt: '2025-01-01T11:00:00Z',
        },
        {
          Id: 'exec-2',
          Status: 'Running',
          StartedAt: '2025-01-01T12:00:00Z',
        },
      ];

      const report = generator.generateScanExecutionsReport(
        executions,
        'Test Scan'
      );

      expect(report).toContain('# AppScan Scan Executions Report');
      expect(report).toContain('Scan: Test Scan');
      expect(report).toContain('## Executions (2)');
      expect(report).toContain('exec-1');
      expect(report).toContain('Completed');
    });
  });

  describe('groupBySeverity', () => {
    it('should group issues by severity', () => {
      const issues = [
        { Severity: 'High' },
        { Severity: 'Low' },
        { Severity: 'High' },
        { Severity: 'Critical' },
      ];

      const grouped = generator.groupBySeverity(issues);

      expect(grouped.High).toHaveLength(2);
      expect(grouped.Low).toHaveLength(1);
      expect(grouped.Critical).toHaveLength(1);
    });

    it('should handle unknown severity', () => {
      const issues = [{ IssueType: 'Test' }];

      const grouped = generator.groupBySeverity(issues);

      expect(grouped.Unknown).toHaveLength(1);
    });
  });

  describe('getSeverityOrder', () => {
    it('should return correct order for severities', () => {
      expect(generator.getSeverityOrder('Critical')).toBeGreaterThan(
        generator.getSeverityOrder('High')
      );
      expect(generator.getSeverityOrder('High')).toBeGreaterThan(
        generator.getSeverityOrder('Medium')
      );
      expect(generator.getSeverityOrder('Medium')).toBeGreaterThan(
        generator.getSeverityOrder('Low')
      );
      expect(generator.getSeverityOrder('Low')).toBeGreaterThan(
        generator.getSeverityOrder('Informational')
      );
    });

    it('should return 0 for unknown severity', () => {
      expect(generator.getSeverityOrder('Unknown')).toBe(0);
    });
  });
});
