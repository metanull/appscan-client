import TurndownService from 'turndown';

export class MarkdownReportGenerator {
  /**
   * Escapes special characters in markdown table cells to prevent rendering issues.
   * @param {string} text - The text to escape.
   * @returns {string} The escaped text or 'N/A' if input is empty.
   */
  escapeMarkdownTableCell(text) {
    if (!text) return 'N/A';
    return text.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  }

  /**
   * Generates a markdown report listing all applications.
   * @param {Array<object>} applications - Array of application objects containing Name, Id, and Description.
   * @returns {string} Formatted markdown report with applications table.
   */
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

  /**
   * Generates a markdown report listing all scans.
   * @param {Array<object>} scans - Array of scan objects containing Name, Id, ScanType, and LatestExecution.
   * @param {string} [appName] - Optional application name to include in the report header.
   * @returns {string} Formatted markdown report with scans table.
   */
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

  /**
   * Generates a markdown report of security issues with optional grouping and remediation.
   * @param {Array<object>} issues - Array of issue objects from AppScan.
   * @param {string} [scanName] - Optional scan name for the report header.
   * @param {object} [options] - Report options.
   * @param {boolean} [options.grouped] - Whether to group issues by type and language.
   * @param {string} [options.columns] - Technology type for column selection ('sca', 'dast', or auto-detect).
   * @param {object} [service] - AppScanService instance for fetching remediation articles.
   * @param {object} [scanMeta] - Scan metadata containing appId, id, technology, and appName.
   * @returns {Promise<string>} Formatted markdown report with issues tables.
   */
  async generateIssuesReport(
    issues,
    scanName,
    options = {},
    service = null,
    scanMeta = {}
  ) {
    let report = '# AppScan Issues Report\n\n';
    if (scanName) {
      const baseUrl =
        service?.config?.getBaseUrl() || 'https://eu.cloud.appscan.com';
      const metaText = this.formatScanMeta(scanMeta, baseUrl);
      report += `Scan: ${scanName}${metaText ? ` (${metaText})` : ''}\n\n`;
    }
    report += `Issues: ${issues.length}\n\n`;

    if (issues.length === 0) {
      report += 'No issues found.\n';
      return report;
    }

    const groupedMode = options.grouped ?? false;
    if (groupedMode) {
      const groupedIssues = this.groupIssuesByApplicationAndType(issues);
      const turndownService = this.createTurndownService();

      report += '## Table of Contents\n\n';
      groupedIssues.forEach((group, index) => {
        const issueType = group.issueType || 'Unknown Issue';
        const language = group.language || 'Unknown Language';
        const anchor = this.createAnchor(`${issueType}-${language}-${index}`);
        report += `- [${issueType} (${language})](#${anchor})\n`;
      });
      report += '\n';

      for (let i = 0; i < groupedIssues.length; i++) {
        const group = groupedIssues[i];
        const issueType = this.escapeMarkdownTableCell(
          group.issueType || 'Unknown Issue'
        );
        const language = this.escapeMarkdownTableCell(
          group.language || 'Unknown Language'
        );
        const highestSeverity = this.escapeMarkdownTableCell(
          group.highestSeverity || 'Unknown'
        );
        const highestSeverityValue = this.escapeMarkdownTableCell(
          group.highestSeverityValue?.toString() || '0'
        );
        const anchor = this.createAnchor(
          `${group.issueType || 'Unknown Issue'}-${group.language || 'Unknown Language'}-${i}`
        );

        report += `#### <a id="${anchor}"></a>${issueType} (${language}) – ${highestSeverity} (${highestSeverityValue})\n\n`;

        const firstIssue = group.issues[0] || {};
        const forcedColumns = options.columns || null;
        const detectedTech =
          forcedColumns ||
          scanMeta?.technology ||
          firstIssue.DiscoveryMethod ||
          firstIssue.Scanner ||
          firstIssue.ElementType ||
          '';

        const baseCols = [
          'Issue ID',
          'Severity',
          'SeverityValue',
          'CVE',
          'CVSS',
        ];

        let groupTechCols = [];
        const tt = ('' + detectedTech).toLowerCase();
        if (
          (forcedColumns && forcedColumns.toLowerCase() === 'sca') ||
          tt.includes('sca') ||
          tt.includes('thirdpartylib')
        ) {
          groupTechCols = [
            'Library',
            'Version',
            'PackageId',
            'EPSS',
            'Source File',
          ];
        } else if (
          (forcedColumns && forcedColumns.toLowerCase() === 'dast') ||
          tt.includes('dynamic') ||
          tt.includes('dast') ||
          firstIssue.ElementType === 'Page'
        ) {
          groupTechCols = ['URL', 'Domain', 'Element', 'Path'];
        } else {
          groupTechCols = [
            'Threat Class',
            'Scanner',
            'Fix Group',
            'Source File',
          ];
        }

        const columns = baseCols.concat(groupTechCols).concat(['Status']);
        report += `| ${columns.join(' | ')} |\n`;
        report += `|${columns.map(() => '---').join('|')}|\n`;

        group.issues.forEach((issue) => {
          const issueIdRaw = issue.Id || 'N/A';
          const issueId =
            issueIdRaw !== 'N/A'
              ? `[${this.escapeMarkdownTableCell(issueIdRaw)}](https://eu.cloud.appscan.com/api/v4/Issues/${issueIdRaw}?locale=en)`
              : 'N/A';

          const rowVals = {
            'Issue ID': issueId,
            Severity: this.escapeMarkdownTableCell(issue.Severity),
            SeverityValue: this.escapeMarkdownTableCell(
              issue.SeverityValue?.toString()
            ),
            CVE: this.escapeMarkdownTableCell(issue.CveId || issue.Cve),
            CVSS: this.escapeMarkdownTableCell(issue.Cvss),
            Library: this.escapeMarkdownTableCell(issue.LibraryName),
            Version: this.escapeMarkdownTableCell(issue.LibraryVersion),
            PackageId: this.escapeMarkdownTableCell(issue.PackageId),
            EPSS: this.escapeMarkdownTableCell(issue.EpssScore?.toString()),
            'Source File': this.escapeMarkdownTableCell(
              issue.SourceFile || issue.SourceFileUri || issue.Location
            ),
            URL: this.escapeMarkdownTableCell(issue.Location),
            Domain: this.escapeMarkdownTableCell(issue.Domain),
            Element: this.escapeMarkdownTableCell(issue.Element),
            Path: this.escapeMarkdownTableCell(issue.Path),
            'Threat Class': this.escapeMarkdownTableCell(issue.ThreatClassId),
            Scanner: this.escapeMarkdownTableCell(issue.Scanner),
            'Fix Group': this.escapeMarkdownTableCell(issue.FixGroupId),
            Status: this.escapeMarkdownTableCell(issue.Status),
          };

          const row = columns.map((col) => rowVals[col] ?? 'N/A');
          report += `| ${row.join(' | ')} |\n`;
        });

        const remediation = await this.generateGroupRemediation(
          group,
          service,
          turndownService
        );
        if (remediation) {
          report += '\n';
          report += this.formatAsBlockquote(remediation);
          report += '\n';
        }

        report += '\n[↑ Back to top](#appscan-issues-report)\n\n';
        report += '---\n\n';
      }

      return report;
    }

    const sortedIssues = this.sortIssuesBySeverityValue(issues);
    const grouped = this.groupBySeverity(sortedIssues);

    this.severityLevels()
      .filter((severity) => (grouped[severity] || []).length > 0)
      .forEach((severity) => {
        const severityIssues = grouped[severity] || [];
        report += `### ${severity} Severity (${severityIssues.length})\n\n`;
        const exampleIssue = severityIssues[0] || {};
        const technology =
          scanMeta?.technology ||
          exampleIssue.DiscoveryMethod ||
          exampleIssue.Scanner ||
          '';

        const baseCols = [
          'Issue ID',
          'Issue Type',
          'Severity',
          'SeverityValue',
          'CWE',
          'CVE',
          'CVSS',
        ];

        let techCols = [];
        const t = ('' + technology).toLowerCase();
        if (
          t.includes('sca') ||
          t.includes('sca analyzer') ||
          t.includes('thirdpartylib')
        ) {
          techCols = [
            'Library',
            'Library Version',
            'PackageId',
            'AppPkgStatus',
            'Source File',
            'EPSS',
          ];
        } else if (
          t.includes('dynamic') ||
          t.includes('dast') ||
          exampleIssue.ElementType === 'Page'
        ) {
          techCols = [
            'URL',
            'Domain',
            'Element',
            'ElementType',
            'Path',
            'Port',
            'Scheme',
          ];
        } else {
          techCols = [
            'Threat Class',
            'Scanner',
            'Fix Group',
            'Source File',
            'Location',
            'Context',
          ];
        }

        const trailing = ['Status'];

        const columns = baseCols.concat(techCols).concat(trailing);

        report += `| ${columns.join(' | ')} |\n`;
        report += `|${columns.map(() => '---').join('|')}|\n`;

        severityIssues.forEach((issue) => {
          const issueIdRaw = issue.Id || 'N/A';
          const issueId =
            issueIdRaw !== 'N/A'
              ? `[${this.escapeMarkdownTableCell(issueIdRaw)}](https://eu.cloud.appscan.com/api/v4/Issues/${issueIdRaw}?locale=en)`
              : 'N/A';

          const rowVals = {
            'Issue ID': issueId,
            'Issue Type': this.escapeMarkdownTableCell(issue.IssueType),
            Severity: this.escapeMarkdownTableCell(issue.Severity),
            SeverityValue: this.escapeMarkdownTableCell(
              issue.SeverityValue?.toString()
            ),
            CWE: this.escapeMarkdownTableCell(issue.Cwe?.toString()),
            CVE: this.escapeMarkdownTableCell(issue.CveId || issue.Cve),
            CVSS: this.escapeMarkdownTableCell(issue.Cvss),
            Library: this.escapeMarkdownTableCell(issue.LibraryName),
            'Library Version': this.escapeMarkdownTableCell(
              issue.LibraryVersion
            ),
            PackageId: this.escapeMarkdownTableCell(issue.PackageId),
            AppPkgStatus: this.escapeMarkdownTableCell(issue.AppPkgStatus),
            'Source File': this.escapeMarkdownTableCell(
              issue.SourceFile || issue.SourceFileUri || issue.Location
            ),
            EPSS: this.escapeMarkdownTableCell(issue.EpssScore?.toString()),
            URL: this.escapeMarkdownTableCell(issue.Location),
            Domain: this.escapeMarkdownTableCell(issue.Domain),
            Element: this.escapeMarkdownTableCell(issue.Element),
            ElementType: this.escapeMarkdownTableCell(issue.ElementType),
            Path: this.escapeMarkdownTableCell(issue.Path),
            Port: this.escapeMarkdownTableCell(issue.Port?.toString()),
            Scheme: this.escapeMarkdownTableCell(issue.Scheme),
            'Threat Class': this.escapeMarkdownTableCell(issue.ThreatClassId),
            Scanner: this.escapeMarkdownTableCell(issue.Scanner),
            'Fix Group': this.escapeMarkdownTableCell(issue.FixGroupId),
            Location: this.escapeMarkdownTableCell(issue.Location),
            Context: issue.Context
              ? `\`${this.escapeMarkdownTableCell(issue.Context)}\``
              : 'N/A',
            Status: this.escapeMarkdownTableCell(issue.Status),
          };

          const row = columns.map((col) => rowVals[col] ?? 'N/A');
          report += `| ${row.join(' | ')} |\n`;
        });

        report += '\n';
      });

    return report;
  }

  /**
   * Generates a markdown report of scan executions.
   * @param {Array<object>} executions - Array of execution objects containing Id, Status, StartedAt, and CompletedAt.
   * @param {string} [scanName] - Optional scan name to include in the report header.
   * @returns {string} Formatted markdown report with executions table.
   */
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

  /**
   * Groups issues by severity level.
   * @param {Array<object>} issues - Array of issue objects with Severity property.
   * @returns {object} Object with severity levels as keys and arrays of issues as values.
   */
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

  /**
   * Returns an ordered array of standard severity levels.
   * @returns {Array<string>} Array of severity level names in descending order of importance.
   */
  severityLevels() {
    return ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Unknown'];
  }

  /**
   * Returns a numeric priority value for a severity level.
   * @param {string} severity - Severity level name.
   * @returns {number} Numeric priority (5 for Critical, 0 for Unknown).
   */
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

  /**
   * Sorts issues by SeverityValue in descending order.
   * @param {Array<object>} issues - Array of issue objects with SeverityValue property.
   * @returns {Array<object>} New sorted array of issues.
   */
  sortIssuesBySeverityValue(issues) {
    return [...issues].sort((a, b) => {
      const aValue = a.SeverityValue ?? 0;
      const bValue = b.SeverityValue ?? 0;
      return bValue - aValue; // Descending order
    });
  }

  /**
   * Formats scan metadata into a comma-separated string with markdown links.
   * @param {object} [scanMeta] - Scan metadata object.
   * @param {string} [scanMeta.appId] - Application ID.
   * @param {string} [scanMeta.id] - Scan ID.
   * @param {string} [scanMeta.technology] - Scan technology.
   * @param {string} [scanMeta.appName] - Application name.
   * @param {string} [baseUrl='https://eu.cloud.appscan.com'] - Base URL for AppScan links.
   * @returns {string} Formatted metadata string with links.
   */
  formatScanMeta(scanMeta = {}, baseUrl = 'https://eu.cloud.appscan.com') {
    const parts = [];
    if (scanMeta.appId) {
      const appUrl = `${baseUrl}/main/myapps/${scanMeta.appId}`;
      parts.push(`AppId: [${scanMeta.appId}](${appUrl})`);
    }
    if (scanMeta.id) {
      const scanUrl = scanMeta.appId
        ? `${baseUrl}/main/myapps/${scanMeta.appId}/scans/${scanMeta.id}/scanOverview`
        : `${baseUrl}/main/scans/${scanMeta.id}`;
      parts.push(`ScanId: [${scanMeta.id}](${scanUrl})`);
    }
    if (scanMeta.technology) {
      parts.push(`Technology: ${scanMeta.technology}`);
    }
    if (scanMeta.appName) {
      parts.push(`AppName: ${scanMeta.appName}`);
    }
    return parts.join(', ');
  }

  /**
   * Formats text as a markdown blockquote by prefixing each line with '>'.  * @param {string} text - Text to format.
   * @returns {string} Blockquote-formatted text.
   */
  formatAsBlockquote(text) {
    return text
      .split('\n')
      .map((line) => (line.trim() === '' ? '>' : `> ${line}`))
      .join('\n');
  }

  /**
   * Encodes spaces in a URL for use in markdown links.
   * @param {string} url - URL to encode.
   * @returns {string} URL with spaces replaced by %20.
   */
  encodeUrlForLink(url) {
    return url.replace(/ /g, '%20');
  }

  /**
   * Creates a URL-safe anchor ID from text for markdown links.
   * @param {string} text - Text to convert to an anchor.
   * @returns {string} Lowercase anchor with special characters replaced by hyphens.
   */
  createAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Extracts a human-readable label from a source control URL.
   * @param {string} rawUrl - Full source control URL.
   * @returns {string} Simplified label combining project, repository, and path, or 'Source' if parsing fails.
   */
  extractSourceLabel(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const project = segments[1] || segments[0] || '';
      const gitIndex = segments.indexOf('_git');
      const repository =
        gitIndex >= 0
          ? segments[gitIndex + 1] || ''
          : segments[segments.length - 1] || '';
      const pathParam = parsed.searchParams.get('path') || '';
      const normalizedPath = pathParam.replace(/^\/+/, '');
      let decodedPath = normalizedPath;
      if (decodedPath) {
        try {
          decodedPath = decodeURIComponent(decodedPath);
        } catch {
          decodedPath = normalizedPath;
        }
      }
      const segmentsToShow = [project, repository, decodedPath].filter(
        (part) => part
      );
      if (segmentsToShow.length > 0) {
        return segmentsToShow.join('/');
      }
    } catch {
      return 'Source';
    }
  }

  /**
   * Creates and configures a TurndownService instance for HTML to markdown conversion.
   * @returns {import('turndown')} Configured TurndownService instance.
   */
  createTurndownService() {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });
    turndownService.addRule('removeStyles', {
      filter: ['style', 'script'],
      replacement: () => {
        return '';
      },
    });
    return turndownService;
  }

  /**
   * Fetches the remediation article for the first issue in a grouped section and
   * converts it to Markdown so it can be appended to the report.
   * @param {object} group Group metadata containing at least one issue.
   * @param {object} service AppScanService instance used to request the article.
   * @param {import('turndown')} turndownService Converter used to translate HTML to Markdown.
   * @returns {Promise<string>} Markdown-formatted remediation snippet or an empty string.
   */
  async generateGroupRemediation(group, service, turndownService) {
    if (!service || !group.issues?.length || !turndownService) {
      return '';
    }

    const firstIssue = group.issues[0];
    const issueId = firstIssue?.Id;
    if (!issueId) {
      return '';
    }

    try {
      const articleHtml = await service.getArticle(issueId, {
        language: firstIssue.Language,
        api: firstIssue.Api,
        mode: 'light',
      });

      if (!articleHtml) {
        return '';
      }

      const markdown = turndownService.turndown(articleHtml);
      if (!markdown.trim()) {
        return '';
      }

      return `**Remediation** (Issue ${issueId})\n\n${markdown}`;
    } catch (error) {
      return `*Unable to fetch remediation article: ${error.message}*\n`;
    }
  }

  /**
   * Groups issues by application ID, issue type ID, and language, sorted by severity.
   * @param {Array<object>} issues - Array of issue objects.
   * @returns {Array<object>} Array of group objects with applicationId, issueTypeId, issueType, language, issues array, and severity metrics.
   */
  groupIssuesByApplicationAndType(issues) {
    const groupMap = new Map();

    issues.forEach((issue) => {
      const key = `${issue.ApplicationId || 'unknown'}_${issue.IssueTypeId || 'unknown'}_${issue.Language || 'unknownLang'}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          applicationId: issue.ApplicationId,
          issueTypeId: issue.IssueTypeId,
          issueType: issue.IssueType,
          language: issue.Language,
          issues: [],
          maxSeverityValue: 0,
          highestSeverity: '',
          highestSeverityValue: 0,
        });
      }

      const group = groupMap.get(key);
      group.issues.push(issue);

      const severityValue = issue.SeverityValue ?? 0;
      if (severityValue > group.maxSeverityValue) {
        group.maxSeverityValue = severityValue;
        group.highestSeverity = issue.Severity;
        group.highestSeverityValue = severityValue;
      }
    });

    const groups = Array.from(groupMap.values()).sort((a, b) => {
      return b.maxSeverityValue - a.maxSeverityValue;
    });

    groups.forEach((group) => {
      group.issues.sort((a, b) => {
        const aValue = a.SeverityValue ?? 0;
        const bValue = b.SeverityValue ?? 0;
        return bValue - aValue;
      });
    });

    return groups;
  }

  /**
   * Sorts issues for grouped reports by application, issue type, and severity.
   * @param {Array<object>} issues - Array of issue objects.
   * @returns {Array<object>} New sorted array of issues.
   */
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

  /**
   * Compares two values for sorting, treating undefined/null as empty strings.
   * @param {*} a - First value to compare.
   * @param {*} b - Second value to compare.
   * @returns {number} -1 if a < b, 1 if a > b, 0 if equal.
   */
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
