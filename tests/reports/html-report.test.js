import { HtmlReportGenerator } from '../../src/reports/html-report.js';

describe('HtmlReportGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new HtmlReportGenerator();
  });

  describe('generateApplicationsReport', () => {
    it('should generate HTML report for applications', () => {
      const applications = [
        { Name: 'App 1', Id: '123', Description: 'Test app 1' },
        { Name: 'App 2', Id: '456', Description: 'Test app 2' },
      ];

      const report = generator.generateApplicationsReport(applications);

      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('<html lang="en">');
      expect(report).toContain('AppScan Applications Report');
      expect(report).toContain('<table');
      expect(report).toContain('App 1');
      expect(report).toContain('App 2');
    });
  });

  describe('generateScansReport', () => {
    it('should generate HTML report for scans', () => {
      const scans = [
        {
          Name: 'Scan 1',
          Id: 'scan-123',
          ScanType: 'DAST',
          LatestExecution: { Status: 'Completed' },
        },
      ];

      const report = generator.generateScansReport(scans, 'Test App');

      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('AppScan Scans Report');
      expect(report).toContain('Scan 1');
      expect(report).toContain('DAST');
    });
  });

  describe('generateIssuesReport', () => {
    it('should generate HTML report for issues', () => {
      const issues = [
        { IssueType: 'XSS', Severity: 'High', Location: '/page1', Status: 'Open' },
      ];

      const report = generator.generateIssuesReport(issues, 'Test Scan');

      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('AppScan Issues Report');
      expect(report).toContain('XSS');
      expect(report).toContain('High');
    });
  });

  describe('wrapInHtml', () => {
    it('should wrap content in HTML template', () => {
      const content = '<p>Test content</p>';
      const title = 'Test Title';

      const html = generator.wrapInHtml(content, title);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<title>Test Title</title>');
      expect(html).toContain('<p>Test content</p>');
      expect(html).toContain('<style>');
      expect(html).toContain('</html>');
    });

    it('should include CSS styles', () => {
      const content = '<p>Test</p>';
      const html = generator.wrapInHtml(content, 'Title');

      expect(html).toContain('font-family');
      expect(html).toContain('border-collapse');
      expect(html).toContain('background-color');
    });
  });
});
