import chalk from 'chalk';

/**
 * Formatter - Consistent output formatting for triage-report commands
 */
export class Formatter {
  constructor(baseUrl = 'https://cloud.appscan.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Normalize scan technology from API enum to readable format
   */
  static normalizeScanType(technology) {
    const map = {
      StaticAnalyzer: 'SAST',
      DynamicAnalyzer: 'DAST',
      ScaAnalyzer: 'SCA',
      IASTAnalyzer: 'IAST',
      InfrastructureAnalyzer: 'IAC',
    };
    return map[technology] || technology;
  }

  /**
   * Convert issue Scanner string to Technology enum value
   * Scanner values from issues are like "AppScan Static Analyzer", "AppScan Dynamic Analyzer"
   * Technology values from scans are like "StaticAnalyzer", "DynamicAnalyzer"
   */
  static scannerToTechnology(scanner) {
    if (!scanner) return null;

    const scannerLower = scanner.toLowerCase();

    if (scannerLower.includes('static')) return 'StaticAnalyzer';
    if (scannerLower.includes('dynamic')) return 'DynamicAnalyzer';
    if (scannerLower.includes('sca') || scannerLower.includes('open source'))
      return 'ScaAnalyzer';
    if (scannerLower.includes('iast')) return 'IASTAnalyzer';
    if (scannerLower.includes('infrastructure'))
      return 'InfrastructureAnalyzer';

    return scanner; // fallback to original value
  }

  /**
   * Get color for scan type (for terminal display)
   */
  static getScanTypeColor(technology) {
    const map = {
      StaticAnalyzer: 'green',
      DynamicAnalyzer: 'magenta',
      ScaAnalyzer: 'cyan',
      IASTAnalyzer: 'yellow',
      InfrastructureAnalyzer: 'blue',
    };
    return map[technology] || 'white';
  }

  /**
   * Map severity to numeric value for sorting
   */
  static severityToValue(severity) {
    const map = {
      Critical: 5,
      High: 4,
      Medium: 3,
      Low: 2,
      Informational: 1,
      Undetermined: 0,
      Unknown: 0,
    };
    return map[severity] || 0;
  }

  /**
   * Get color for severity
   */
  static getSeverityColor(severity) {
    const map = {
      Critical: 'redBright',
      High: 'red',
      Medium: 'yellow',
      Low: 'blue',
      Informational: 'gray',
    };
    return map[severity] || 'white';
  }

  /**
   * Format SCA/dependency check issue details as context text
   * Returns null if this is not an SCA issue
   * Format: {ScaTechnology} library - {LibraryName} {LibraryVersion} - {CvePublishDate} [{Cve}]({DetailsUrl}) (CVSS {Cvss}/10)
   * Example: JS library - marked 3.0.8 - 14/01/2022 [CVE-2022-21680](https://www.cve.org/CVERecord?id=CVE-2022-21680) (CVSS 7.5/10)
   */
  static formatScaContext(issue) {
    // Check if this is an SCA/dependency check issue
    if (!issue.ScaTechnology && !issue.LibraryName) {
      return null;
    }

    let context = '';

    // Technology and library info
    if (issue.ScaTechnology) {
      context += `${issue.ScaTechnology} library`;
    } else {
      context += 'Library';
    }

    if (issue.LibraryName) {
      context += ` - ${issue.LibraryName}`;
      if (issue.LibraryVersion) {
        context += ` ${issue.LibraryVersion}`;
      }
    }

    // CVE info
    if (issue.CvePublishDate || issue.Cve) {
      context += ' - ';

      if (issue.CvePublishDate) {
        const date = new Date(issue.CvePublishDate);
        context += date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        context += ' ';
      }

      if (issue.Cve) {
        if (issue.DetailsUrl) {
          context += `[${issue.Cve}](${issue.DetailsUrl})`;
        } else {
          context += issue.Cve;
        }
      }

      if (issue.Cvss) {
        context += ` (CVSS ${issue.Cvss}/10)`;
      }
    }

    return context || null;
  }

  /**
   * Get context for an issue - returns actual Context or SCA-formatted context
   * This is the preferred method to get displayable context
   */
  static getIssueContext(issue) {
    if (issue.Context) {
      return issue.Context;
    }
    return Formatter.formatScaContext(issue);
  }

  /**
   * Format application for JSON output
   */
  formatApplication(app) {
    return {
      id: app.Id,
      name: app.Name,
      description: app.Description || '',
      riskRating: app.RiskRating || 'Unknown',
      maxSeverity: app.HighestSeverityValue || 'Unknown',
      totalIssues: app.TotalIssues || 0,
      openIssues: app.OpenIssues || 0,
      criticalIssues: app.CriticalIssues || 0,
      highIssues: app.HighIssues || 0,
      mediumIssues: app.MediumIssues || 0,
      lowIssues: app.LowIssues || 0,
      informationalIssues: app.InformationalIssues || 0,
      scanTechnologies: this.extractScanTechnologies(app),
      dateCreated: app.CreatedAt,
      url: `${this.baseUrl}/apps/${app.Id}`,
    };
  }

  /**
   * Format scan for JSON output
   */
  formatScan(scan, appName = null) {
    return {
      id: scan.Id,
      name: scan.Name,
      appId: scan.AppId,
      appName: appName || scan.AppName || null,
      scanType: Formatter.normalizeScanType(scan.Technology),
      numberOfExecutions: scan.NumberOfExecutions || 0,
      createdAt: scan.CreatedAt,
      lastModified: scan.UpdatedAt,
      latestExecutionStatus:
        scan.LatestExecution?.ExecutionProgress ||
        scan.LatestExecution?.Status ||
        'Unknown',
      latestExecutionDate: scan.LatestExecution?.UpdatedAt || null,
      url: `${this.baseUrl}/scans/${scan.Id}`,
    };
  }

  /**
   * Format scan execution for JSON output
   */
  formatExecution(execution) {
    return {
      id: execution.Id,
      scanId: execution.ScanId,
      status: execution.Status,
      progress: execution.Progress,
      executionProgress: execution.ExecutionProgress,
      createdAt: execution.CreatedAt,
      scanEndTime: execution.ScanEndTime,
      executionDurationSec: execution.ExecutionDurationSec || null,
      criticalIssues: execution.NCriticalIssues || 0,
      highIssues: execution.NHighIssues || 0,
      mediumIssues: execution.NMediumIssues || 0,
      lowIssues: execution.NLowIssues || 0,
      informationalIssues: execution.NInfoIssues || 0,
      newAppIssues: execution.NNewAppIssues || 0,
      issuesFound: execution.NIssuesFound || 0,
      createdBy: execution.UserEmail,
    };
  }

  /**
   * Format vulnerability for JSON output
   */
  formatVulnerability(issue, appName = null, scanName = null) {
    return {
      id: issue.Id,
      issueType: issue.IssueType,
      issueTypeId: issue.IssueTypeId,
      appId: issue.ApplicationId,
      appName: appName || issue.ApplicationName || null,
      scanId: issue.ScanId,
      scanName: scanName || issue.ScanName || null,
      severity: issue.Severity,
      severityValue: Formatter.severityToValue(issue.Severity),
      status: issue.Status,
      location: issue.Location || issue.Api || issue.SourceFileUri || 'N/A',
      sourceFile: issue.SourceFile || null,
      lineNumber: issue.LineNumber || null,
      context: issue.Context || null,
      language: issue.Language || null,
      cwe: issue.Cwe || null,
      cveId: issue.CveId || null,
      discoveryMethod: issue.DiscoveryMethod || null,
      dateCreated: issue.DateCreated,
      lastUpdated: issue.LastUpdated,
      lastFound: issue.LastFound,
      externalId: issue.ExternalId || null,
      comment: issue.Comment || null,
      sourceFileUri: issue.SourceFileUri || null,
      appScanUrl: `${this.baseUrl}/issues/${issue.Id}`,
      remediationUrl: issue.IssueTypeId
        ? `${this.baseUrl}/api/v4/Reports/Article/?issuetype=${issue.IssueTypeId}`
        : null,
    };
  }

  /**
   * Extract scan technologies from application
   * @private
   */
  extractScanTechnologies(app) {
    const techs = new Set();

    // Check various sources for technology information
    if (app.Scans && Array.isArray(app.Scans)) {
      app.Scans.forEach((scan) => {
        if (scan.Technology) {
          techs.add(Formatter.normalizeScanType(scan.Technology));
        }
      });
    }

    return Array.from(techs).sort();
  }

  /**
   * Format output as table (for non-JSON display)
   */
  static formatTable(data, columns) {
    if (!data || data.length === 0) {
      return chalk.gray('No data to display');
    }

    const rows = [columns.map((col) => chalk.bold(col.header))];

    for (const item of data) {
      const row = columns.map((col) => {
        const value = col.getter(item);
        return col.color ? chalk[col.color](value) : value;
      });
      rows.push(row);
    }

    return this.alignColumns(rows);
  }

  /**
   * Align columns for table display
   * @private
   */
  static alignColumns(rows) {
    // Calculate max width for each column
    const widths = [];
    for (let i = 0; i < rows[0].length; i++) {
      widths[i] = Math.max(...rows.map((row) => this.stripAnsi(row[i]).length));
    }

    // Format rows with padding
    return rows
      .map((row) => {
        return row
          .map((cell, i) => {
            const stripped = this.stripAnsi(cell);
            const padding = ' '.repeat(
              Math.max(0, widths[i] - stripped.length)
            );
            return cell + padding;
          })
          .join('  ');
      })
      .join('\n');
  }

  /**
   * Strip ANSI color codes for length calculation
   * @private
   */
  static stripAnsi(str) {
    return str.replace(/\u001b\[[0-9;]*m/g, '');
  }
}
