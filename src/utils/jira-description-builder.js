import TurndownService from 'turndown';

/**
 * JiraDescriptionBuilder - Build Jira issue descriptions from vulnerabilities
 * Ensures descriptions stay under 32KB limit
 */
export class JiraDescriptionBuilder {
  constructor(issues, baseUrl = 'https://cloud.appscan.com') {
    this.issues = issues;
    this.baseUrl = baseUrl;
    this.sections = [];
    this.maxBytes = 30000; // Leave some buffer under 32KB
  }

  /**
   * Add summary section with counts
   */
  addSummary(scanName = null, appName = null) {
    const stats = this.calculateStats();
    let summary = '## Summary\n\n';

    if (appName) summary += `**Application:** ${appName}\n`;
    if (scanName) summary += `**Scan:** ${scanName}\n`;
    summary += `**Total Vulnerabilities:** ${this.issues.length}\n`;
    summary += `**Critical:** ${stats.Critical} | **High:** ${stats.High} | **Medium:** ${stats.Medium} | **Low:** ${stats.Low}\n\n`;

    this.sections.push(summary);
    return this;
  }

  /**
   * Add issues grouped by type with full details
   * Note: This method is synchronous but expects issues to have been enriched
   * with article content and comments before calling this method.
   */
  addIssuesByType() {
    const grouped = this.groupByType();
    let issuesSection = '';

    for (const group of grouped) {
      // Get highest severity for the group
      const highestSeverity = this.getHighestSeverity(group.issues);
      
      // Header for this vulnerability type
      issuesSection += `# ${group.type} (${highestSeverity})\n\n`;

      // Add article description from first issue if available
      if (group.issues[0]?.articleMarkdown) {
        issuesSection += '## Description\n\n';
        issuesSection += '> ' + group.issues[0].articleMarkdown.split('\n').join('\n> ') + '\n\n';
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

        // Remediation article URL
        const articleUrl = this.buildArticleUrl(issue);
        if (articleUrl) {
          issuesSection += `- [🔗 Remediation](${articleUrl})\n`;
        }

        issuesSection += '\n';

        // Issue context - NOT TRIMMED
        if (issue.Context) {
          issuesSection += '### Issue\n\n';
          issuesSection += '```\n';
          issuesSection += issue.Context + '\n';
          issuesSection += '```\n\n';
        }

        // First comment - NOT TRIMMED, as quote block
        if (issue.comments && issue.comments.length > 0) {
          const firstComment = issue.comments[0];
          issuesSection += '### Comment\n\n';
          issuesSection += '> ' + (firstComment.Comment || '').split('\n').join('\n> ') + '\n\n';
        }
      }

      issuesSection += '\n';
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
   * Add remediation section with HTML converted to Markdown
   */
  addRemediation(articleHtml) {
    if (!articleHtml) return this;

    const markdown = this.convertHtmlToMarkdown(articleHtml);
    if (markdown) {
      this.sections.push('## Remediation\n\n' + markdown + '\n\n');
    }
    return this;
  }

  /**
   * Add AppScan issue IDs for traceability
   */
  addIssueIds() {
    const ids = this.issues.map((i) => i.Id).join(', ');
    this.sections.push(`## AppScan Issue IDs\n\n${ids}\n\n`);
    return this;
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

  /**
   * Format code context
   * @private
   */
  formatContext(issue) {
    if (!issue.Context) return null;

    // Truncate context to 100 chars
    const context = issue.Context.replace(/\n/g, ' ').trim();
    if (context.length > 100) {
      return '`' + context.substring(0, 100) + '...`';
    }
    return '`' + context + '`';
  }

  /**
   * Convert HTML to Markdown
   * @private
   */
  convertHtmlToMarkdown(html) {
    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    try {
      const markdown = turndown.turndown(html);
      // Truncate to reasonable size (5000 chars)
      return markdown.length > 5000
        ? markdown.substring(0, 5000) + '\n\n_[Truncated]_'
        : markdown;
    } catch (error) {
      // Log error for debugging but don't fail the entire operation
      console.warn('Failed to convert HTML to Markdown:', error.message);
      return null;
    }
  }
}
