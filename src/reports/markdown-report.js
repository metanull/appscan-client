export class MarkdownReportGenerator {
  generateApplicationsReport(applications) {
    let report = '# AppScan Applications Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Applications (${applications.length})\n\n`;

    if (applications.length === 0) {
      report += 'No applications found.\n';
      return report;
    }

    report += '| Name | ID | Description |\n';
    report += '|------|----|--------------|\n';

    applications.forEach((app) => {
      const name = app.Name || 'N/A';
      const id = app.Id || 'N/A';
      const description = (app.Description || 'N/A').replace(/\|/g, '\\|');
      report += `| ${name} | ${id} | ${description} |\n`;
    });

    return report;
  }

  generateScansReport(scans, appName) {
    let report = '# AppScan Scans Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    if (appName) {
      report += `Application: ${appName}\n\n`;
    }
    report += `## Scans (${scans.length})\n\n`;

    if (scans.length === 0) {
      report += 'No scans found.\n';
      return report;
    }

    report += '| Name | ID | Type | Status |\n';
    report += '|------|----|------|--------|\n';

    scans.forEach((scan) => {
      const name = scan.Name || 'N/A';
      const id = scan.Id || 'N/A';
      const type = scan.ScanType || 'N/A';
      const status = scan.LatestExecution?.Status || 'N/A';
      report += `| ${name} | ${id} | ${type} | ${status} |\n`;
    });

    return report;
  }

  generateIssuesReport(issues, scanName) {
    let report = '# AppScan Issues Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    if (scanName) {
      report += `Scan: ${scanName}\n\n`;
    }
    report += `## Issues (${issues.length})\n\n`;

    if (issues.length === 0) {
      report += 'No issues found.\n';
      return report;
    }

    // Group by severity
    const grouped = this.groupBySeverity(issues);

    Object.keys(grouped)
      .sort((a, b) => this.getSeverityOrder(b) - this.getSeverityOrder(a))
      .forEach((severity) => {
        const severityIssues = grouped[severity];
        report += `### ${severity} Severity (${severityIssues.length})\n\n`;
        report += '| Issue Type | Location | Status |\n';
        report += '|------------|----------|--------|\n';

        severityIssues.forEach((issue) => {
          const issueType = (issue.IssueType || 'N/A').replace(/\|/g, '\\|');
          const location = (issue.Location || 'N/A').replace(/\|/g, '\\|');
          const status = issue.Status || 'N/A';
          report += `| ${issueType} | ${location} | ${status} |\n`;
        });

        report += '\n';
      });

    return report;
  }

  generateScanExecutionsReport(executions, scanName) {
    let report = '# AppScan Scan Executions Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    if (scanName) {
      report += `Scan: ${scanName}\n\n`;
    }
    report += `## Executions (${executions.length})\n\n`;

    if (executions.length === 0) {
      report += 'No executions found.\n';
      return report;
    }

    report += '| ID | Status | Started | Completed |\n';
    report += '|----|--------|---------|------------|\n';

    executions.forEach((execution) => {
      const id = execution.Id || 'N/A';
      const status = execution.Status || 'N/A';
      const started = execution.StartedAt
        ? new Date(execution.StartedAt).toLocaleString()
        : 'N/A';
      const completed = execution.CompletedAt
        ? new Date(execution.CompletedAt).toLocaleString()
        : 'N/A';
      report += `| ${id} | ${status} | ${started} | ${completed} |\n`;
    });

    return report;
  }

  groupBySeverity(issues) {
    return issues.reduce((acc, issue) => {
      const severity = issue.Severity || 'Unknown';
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push(issue);
      return acc;
    }, {});
  }

  getSeverityOrder(severity) {
    const order = {
      Critical: 5,
      High: 4,
      Medium: 3,
      Low: 2,
      Informational: 1,
      Unknown: 0,
    };
    return order[severity] || 0;
  }
}

export default MarkdownReportGenerator;
