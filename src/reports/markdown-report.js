import TurndownService from 'turndown';

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

      // Build table of contents
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

        // For grouped view we also offer technology-aware, compact summary columns.
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
        // Build technology-aware columns to better support SAST, DAST and SCA
        const exampleIssue = severityIssues[0] || {};
        const technology =
          scanMeta?.technology ||
          exampleIssue.DiscoveryMethod ||
          exampleIssue.Scanner ||
          '';

        // base columns common to most scanners
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
          // SCA-focused columns
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
          // DAST-focused columns
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
          // Default to SAST-friendly columns
          techCols = [
            'Threat Class',
            'Scanner',
            'Fix Group',
            'Source File',
            'Location',
            'Context',
          ];
        }

        // common trailing column
        const trailing = ['Status'];

        const columns = baseCols.concat(techCols).concat(trailing);

        // write header
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

  formatAsBlockquote(text) {
    return text
      .split('\n')
      .map((line) => (line.trim() === '' ? '>' : `> ${line}`))
      .join('\n');
  }

  encodeUrlForLink(url) {
    return url.replace(/ /g, '%20');
  }

  createAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

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
          // Invalid URI encoding - use original path
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
      // Invalid URL format - fall through to generic label
    }
    return 'Source';
  }

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

  groupIssuesByApplicationAndType(issues) {
    // Create a map to group issues by applicationId and IssueTypeId
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
