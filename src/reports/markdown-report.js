export class MarkdownReportGenerator {
  escapeMarkdownTableCell(text) {
    if (!text) return 'N/A';
    // Escape backslashes first, then pipes
    return text.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  }

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
      const name = this.escapeMarkdownTableCell(app.Name);
      const id = this.escapeMarkdownTableCell(app.Id);
      const description = this.escapeMarkdownTableCell(app.Description);
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

  generateIssuesReport(issues, scanName, options = {}) {
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

    const groupedMode = options.grouped ?? false;
    if (groupedMode) {
      const groupedIssues = this.groupIssuesByApplicationAndType(issues);
      report += '### Grouped Issues\n\n';

      groupedIssues.forEach((group) => {
        // Add headline for each group with highest severity
        report += `#### ${group.highestSeverity} (${group.highestSeverityValue}): ${group.issueType}\n\n`;

        // Table with only the specified fields
        report +=
          '| Severity | SeverityValue | Language | Issue Type | Context | Source |\n';
        report +=
          '|----------|---------------|----------|------------|---------|--------|\n';

        group.issues.forEach((issue) => {
          const severity = this.escapeMarkdownTableCell(issue.Severity);
          const severityValue = this.escapeMarkdownTableCell(
            issue.SeverityValue?.toString()
          );
          const language = this.escapeMarkdownTableCell(issue.Language);
          const issueType = this.escapeMarkdownTableCell(issue.IssueType);
          const context = issue.Context
            ? `\`${this.escapeMarkdownTableCell(issue.Context)}\``
            : 'N/A';
          // Check both SourceFileUrl and SourceFileUri for compatibility
          const sourceUrl = issue.SourceFileUrl || issue.SourceFileUri;
          const source = sourceUrl ? `[Source](${sourceUrl})` : 'N/A';

          report += `| ${severity} | ${severityValue} | ${language} | ${issueType} | ${context} | ${source} |\n`;
        });

        report += '\n';
      });

      return report;
    }

    // Default mode: sort by SeverityValue descending
    const sortedIssues = this.sortIssuesBySeverityValue(issues);
    const grouped = this.groupBySeverity(sortedIssues);

    this.severityLevels()
      .filter((severity) => (grouped[severity] || []).length > 0)
      .forEach((severity) => {
        const severityIssues = grouped[severity] || [];
        report += `### ${severity} Severity (${severityIssues.length})\n\n`;
        report +=
          '| Issue Type | Severity | Threat Class | Scanner | Fix Group | Source File | Location | Status |\n';
        report +=
          '|------------|----------|--------------|---------|-----------|-------------|----------|--------|\n';

        severityIssues.forEach((issue) => {
          const issueType = this.escapeMarkdownTableCell(issue.IssueType);
          const severityText = this.escapeMarkdownTableCell(issue.Severity);
          const threatClass = this.escapeMarkdownTableCell(issue.ThreatClassId);
          const scanner = this.escapeMarkdownTableCell(issue.Scanner);
          const fixGroup = this.escapeMarkdownTableCell(issue.FixGroupId);
          const sourceFile = this.escapeMarkdownTableCell(issue.SourceFileUri);
          const location = this.escapeMarkdownTableCell(issue.Location);
          const status = this.escapeMarkdownTableCell(issue.Status);
          report += `| ${issueType} | ${severityText} | ${threatClass} | ${scanner} | ${fixGroup} | ${sourceFile} | ${location} | ${status} |\n`;
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

  severityLevels() {
    return ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Unknown'];
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

  sortIssuesBySeverityValue(issues) {
    return [...issues].sort((a, b) => {
      const aValue = a.SeverityValue ?? 0;
      const bValue = b.SeverityValue ?? 0;
      return bValue - aValue; // Descending order
    });
  }

  groupIssuesByApplicationAndType(issues) {
    // Create a map to group issues by applicationId and IssueTypeId
    const groupMap = new Map();

    issues.forEach((issue) => {
      const key = `${issue.ApplicationId || 'unknown'}_${issue.IssueTypeId || 'unknown'}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          applicationId: issue.ApplicationId,
          issueTypeId: issue.IssueTypeId,
          issueType: issue.IssueType,
          issues: [],
          maxSeverityValue: 0,
          highestSeverity: '',
          highestSeverityValue: 0,
        });
      }

      const group = groupMap.get(key);
      group.issues.push(issue);

      // Track the highest severity value in the group
      const severityValue = issue.SeverityValue ?? 0;
      if (severityValue > group.maxSeverityValue) {
        group.maxSeverityValue = severityValue;
        group.highestSeverity = issue.Severity;
        group.highestSeverityValue = severityValue;
      }
    });

    // Convert map to array and sort groups by max severity value descending
    const groups = Array.from(groupMap.values()).sort((a, b) => {
      return b.maxSeverityValue - a.maxSeverityValue;
    });

    // Sort issues within each group by severity value descending
    groups.forEach((group) => {
      group.issues.sort((a, b) => {
        const aValue = a.SeverityValue ?? 0;
        const bValue = b.SeverityValue ?? 0;
        return bValue - aValue;
      });
    });

    return groups;
  }

  sortIssuesForGroupedReport(issues) {
    return [...issues].sort((a, b) => {
      const appCompare = this.compareValues(a.ApplicationId, b.ApplicationId);
      if (appCompare !== 0) {
        return appCompare;
      }

      const issueTypeIdCompare = this.compareValues(
        a.IssueTypeId,
        b.IssueTypeId
      );
      if (issueTypeIdCompare !== 0) {
        return issueTypeIdCompare;
      }

      return (
        this.getSeverityOrder(b.Severity) - this.getSeverityOrder(a.Severity)
      );
    });
  }

  compareValues(a, b) {
    const aValue = a ?? '';
    const bValue = b ?? '';
    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  }
}

export default MarkdownReportGenerator;
