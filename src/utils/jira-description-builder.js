import { Formatter } from './formatter.js';

/**
 * JiraDescriptionBuilder - Build Jira issue descriptions from vulnerabilities
 * Ensures descriptions stay under 32KB limit
 */
export class JiraDescriptionBuilder {
  constructor(
    issues,
    baseUrl = 'https://cloud.appscan.com',
    app = null,
    scan = null
  ) {
    this.issues = issues;
    this.baseUrl = baseUrl;
    this.app = app;
    this.scan = scan;
    this.sections = [];
    this.maxBytes = 30000; // Leave some buffer under 32KB
  }

  /**
   * Add metadata section with application and scan information
   */
  addMetadata() {
    let metadata = '';

    if (this.app) {
      const appUrl = `${this.baseUrl}/main/myapps/${this.app.Id}`;
      metadata += `**Application:** [${this.app.Name}](${appUrl}) - ${this.app.Id}\n\n`;
    }

    // Check if we're in "all scan" mode
    const isViewAllMode =
      !this.scan ||
      this.scan.Id === '__VIEW_ALL__' ||
      this.scan._isViewAll === true;

    if (this.app && !isViewAllMode && this.scan) {
      // Single scan mode - show single scan link
      const scanUrl = `${this.baseUrl}/main/myapps/${this.app.Id}/scans/${this.scan.Id}`;
      metadata += `**Scan:** [${this.scan.Name}](${scanUrl}) - ${this.scan.Id}\n\n`;
    } else if (this.app && isViewAllMode) {
      // All scan mode - show list of distinct scans from issues
      const distinctScans = this.getDistinctScans();
      if (distinctScans.length > 0) {
        metadata += `**Scans:**\n`;
        for (const scanInfo of distinctScans) {
          const scanUrl = `${this.baseUrl}/main/myapps/${this.app.Id}/scans/${scanInfo.scanId}`;
          metadata += `- [${scanInfo.scanName}](${scanUrl}) - ${scanInfo.scanId}\n`;
        }
        metadata += '\n';
      }
    }

    if (metadata) {
      metadata += '---\n\n';
      this.sections.push(metadata);
    }

    return this;
  }

  /**
   * Get distinct scans from issues
   * @private
   */
  getDistinctScans() {
    const scanMap = new Map();

    for (const issue of this.issues) {
      if (issue.ScanId && !scanMap.has(issue.ScanId)) {
        scanMap.set(issue.ScanId, {
          scanId: issue.ScanId,
          scanName: issue.ScanName || issue.ScanId,
        });
      }
    }

    return Array.from(scanMap.values());
  }

  /**
   * Add issues grouped by type with full details
   * Note: This method is synchronous but expects issues to have been enriched
   * with article content and comments before calling this method.
   */
  addIssuesByType() {
    const grouped = this.groupByType();
    let issuesSection = '';

    for (let groupIndex = 0; groupIndex < grouped.length; groupIndex++) {
      const group = grouped[groupIndex];

      // Get highest severity for the group
      const highestSeverity = this.getHighestSeverity(group.issues);

      // Header for this vulnerability type
      issuesSection += `# ${group.type} (${highestSeverity})\n\n`;

      // Add Remediation link once after the header (if available)
      if (group.issues[0]?.focusedArticleUrl) {
        issuesSection += `[🔗 Remediation](${group.issues[0].focusedArticleUrl})\n\n`;
      }

      // Loop through each issue
      for (let i = 0; i < group.issues.length; i++) {
        const issue = group.issues[i];
        const issueNumber = i + 1;
        const location = this.formatLocation(issue);

        // Issue header
        issuesSection += `## ${issueNumber}. ${location} (${issue.Severity})\n\n`;

        // AZDO URL (SourceFileUri)
        if (issue.SourceFileUri) {
          issuesSection += `- [🔗 Source](${issue.SourceFileUri})\n`;
        }

        // AppScan Issue link
        if (this.app?.Id && issue.Id) {
          const issueUrl = `${this.baseUrl}/main/myapps/${this.app.Id}/issues/${issue.Id}`;
          issuesSection += `- [🔗 AppScan - ${issue.Id}](${issueUrl})\n`;
        }

        issuesSection += '\n';

        // Issue context - NOT TRIMMED
        const contextToShow = Formatter.getIssueContext(issue);
        if (contextToShow) {
          issuesSection += '### Issue\n\n';
          issuesSection += '```\n';
          issuesSection += contextToShow + '\n';
          issuesSection += '```\n\n';
        }

        // First comment - NOT TRIMMED
        if (issue.comments && issue.comments.length > 0) {
          const firstComment = issue.comments[0];
          issuesSection += '### Comment\n\n';
          issuesSection += (firstComment.Comment || '') + '\n\n';
        }
      }

      // Add article description at the bottom of the type (after all issues)
      if (group.issues[0]?.articleMarkdown) {
        issuesSection += '---\n\n';
        issuesSection += '## Remediation\n\n';
        issuesSection += group.issues[0].articleMarkdown + '\n\n';
      }

      // Add separator between vulnerability types (except after the last one)
      if (groupIndex < grouped.length - 1) {
        issuesSection += '---\n\n';
      }
    }

    this.sections.push(issuesSection);
    return this;
  }

  /**
   * Get highest severity from a list of issues
   * @private
   */
  getHighestSeverity(issues) {
    const severityOrder = {
      Critical: 5,
      High: 4,
      Medium: 3,
      Low: 2,
      Informational: 1,
    };

    let highest = 'Informational';
    let highestValue = 0;

    for (const issue of issues) {
      const severity = issue.Severity || 'Informational';
      const value = severityOrder[severity] || 0;
      if (value > highestValue) {
        highestValue = value;
        highest = severity;
      }
    }

    return highest;
  }

  /**
   * Build the focused article URL for an issue
   * @private
   */
  buildArticleUrl(issue) {
    if (!issue.IssueTypeId) return null;

    const params = new URLSearchParams({
      issuetype: issue.IssueTypeId,
    });

    if (issue.Language) {
      params.append('language', issue.Language);
    }

    if (issue.Api) {
      params.append('api', issue.Api);
    }

    return `${this.baseUrl}/api/v4/Reports/Article/?${params.toString()}`;
  }

  /**
   * Build final description, truncating if needed
   */
  build() {
    let description = this.sections.join('');

    // Check size and truncate if needed
    const byteSize = Buffer.byteLength(description, 'utf8');

    if (byteSize > this.maxBytes) {
      // Truncate to fit
      const truncateMsg =
        '\n\n_Description truncated due to size limits. See AppScan for full details._\n';

      // Binary search for correct truncation point
      let low = 0;
      let high = description.length;
      let result = description;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidate = description.substring(0, mid) + truncateMsg;
        const size = Buffer.byteLength(candidate, 'utf8');

        if (size <= this.maxBytes) {
          result = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      description = result;
    }

    return description;
  }

  /**
   * Calculate severity statistics
   * @private
   */
  calculateStats() {
    const stats = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
    for (const issue of this.issues) {
      const severity = issue.Severity || 'Unknown';
      if (stats[severity] !== undefined) {
        stats[severity]++;
      }
    }
    return stats;
  }

  /**
   * Group issues by type
   * @private
   */
  groupByType() {
    const grouped = {};

    for (const issue of this.issues) {
      const key = issue.IssueType || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = {
          type: key,
          severity: issue.Severity || 'Unknown',
          issues: [],
        };
      }
      grouped[key].issues.push(issue);
    }

    // Sort by severity
    return Object.values(grouped).sort((a, b) => {
      const severityOrder = {
        Critical: 5,
        High: 4,
        Medium: 3,
        Low: 2,
        Informational: 1,
      };
      return (
        (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      );
    });
  }

  /**
   * Format issue location
   * @private
   */
  formatLocation(issue) {
    if (issue.SourceFile && issue.LineNumber) {
      return `${issue.SourceFile}:${issue.LineNumber}`;
    } else if (issue.Location) {
      return issue.Location;
    } else if (issue.Api) {
      return issue.Api;
    } else if (issue.SourceFileUri) {
      // Extract filename from URI
      const match = issue.SourceFileUri.match(/\/([^/]+)$/);
      return match ? match[1] : issue.SourceFileUri;
    }
    return 'Location not specified';
  }
}
