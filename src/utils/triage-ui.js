import chalk from 'chalk';
import { select, checkbox, input, confirm } from '@inquirer/prompts';
import sanitizeHtml from 'sanitize-html';
import { convertToAbsoluteUrl, formatUrlForDisplay } from './url-converter.js';

/**
 * Severity colors and order for display
 */
export const SEVERITY_COLORS = {
  Critical: 'redBright',
  High: 'red',
  Medium: 'yellow',
  Low: 'blue',
  Informational: 'gray',
};

export const SEVERITY_ORDER = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
  Unknown: 0,
};

/**
 * Issue status options
 */
export const ISSUE_STATUSES = [
  { name: 'Open', value: 'Open' },
  { name: 'In Progress', value: 'InProgress' },
  { name: 'Reopened', value: 'Reopened' },
  { name: 'Noise (False Positive)', value: 'Noise' },
  { name: 'Passed (Risk Accepted)', value: 'Passed' },
  { name: 'Fixed', value: 'Fixed' },
];

/**
 * Format scan display with issue counts
 */
export function formatScanDisplay(scan, issueStats) {
  const scanName = scan.Name || scan.Id;
  const lastRun = scan.LatestExecution?.UpdatedAt 
    ? new Date(scan.LatestExecution.UpdatedAt).toLocaleDateString()
    : 'N/A';

  let statsDisplay = '';
  if (issueStats) {
    const total = issueStats.total || 0;
    const critical = issueStats.Critical || 0;
    const high = issueStats.High || 0;
    const medium = issueStats.Medium || 0;
    const low = issueStats.Low || 0;
    
    statsDisplay = ` [${chalk.gray(total)} total: `;
    const parts = [];
    if (critical > 0) parts.push(chalk.redBright(`C:${critical}`));
    if (high > 0) parts.push(chalk.red(`H:${high}`));
    if (medium > 0) parts.push(chalk.yellow(`M:${medium}`));
    if (low > 0) parts.push(chalk.blue(`L:${low}`));
    statsDisplay += parts.join(' ') + ']';
  }

  return {
    name: `${chalk.cyan(scanName)} ${chalk.gray(`(${lastRun})`)}${statsDisplay}`,
    value: scan.Id,
    short: scanName,
  };
}

/**
 * Group issues by IssueType for similar vulnerability grouping
 */
export function groupIssuesByType(issues) {
  const grouped = {};
  
  issues.forEach(issue => {
    const key = issue.IssueType || 'Unknown';
    if (!grouped[key]) {
      grouped[key] = {
        type: key,
        severity: issue.Severity || 'Unknown',
        issues: [],
      };
    }
    grouped[key].issues.push(issue);
  });

  // Sort groups by severity
  return Object.values(grouped).sort((a, b) => {
    return (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0);
  });
}

/**
 * Format issue for display in selection list
 */
export function formatIssueDisplay(issue, includeDetails = false, appScanBaseUrl = 'https://eu.cloud.appscan.com') {
  const severity = issue.Severity || 'Unknown';
  const color = SEVERITY_COLORS[severity] || 'white';
  const severityBadge = chalk[color].bold(`[${severity.charAt(0)}]`);
  
  const issueType = issue.IssueType || 'Unknown Issue';
  const status = issue.Status || 'Unknown';
  const statusColor = status === 'Open' ? 'red' : status === 'InProgress' ? 'yellow' : 'gray';
  
  let display = `${severityBadge} ${chalk.white(issueType)} ${chalk[statusColor](`(${status})`)}`;
  
  if (includeDetails) {
    // Show source file/location with absolute URL
    const sourceUrl = issue.SourceFileUri || issue.Location;
    if (sourceUrl) {
      const formatted = formatUrlForDisplay(sourceUrl, appScanBaseUrl);
      const displayText = formatted.isAbsolute 
        ? chalk.blue.underline(formatted.url)
        : chalk.cyan(formatted.text);
      display += `\n    ${chalk.gray('Location:')} ${displayText}`;
    }
    
    // Show API/URL for DAST issues
    if (issue.Api) {
      const formatted = formatUrlForDisplay(issue.Api, appScanBaseUrl);
      const displayText = formatted.isAbsolute 
        ? chalk.blue.underline(formatted.url)
        : chalk.cyan(formatted.text);
      display += `\n    ${chalk.gray('API/URL:')} ${displayText}`;
    }
    
    // Show code context if available
    if (issue.Context) {
      const contextPreview = issue.Context.substring(0, 80).replace(/\n/g, ' ');
      display += `\n    ${chalk.gray('Context:')} ${chalk.white(contextPreview)}${issue.Context.length > 80 ? '...' : ''}`;
    }
    
    // Add AppScan article link for remediation guidance
    if (issue.IssueTypeId) {
      const articleUrl = `${appScanBaseUrl}/api/v4/Reports/Article/?issuetype=${issue.IssueTypeId}`;
      display += `\n    ${chalk.gray('Article:')} ${chalk.blue.underline(articleUrl)}`;
    }
  }
  
  return {
    name: display,
    value: issue.Id,
    short: issueType,
  };
}

/**
 * Display grouped issues summary
 */
export function displayGroupedSummary(groups) {
  console.log(chalk.cyan.bold('\n📊 Vulnerability Groups:\n'));
  
  groups.forEach((group, index) => {
    const color = SEVERITY_COLORS[group.severity] || 'white';
    const severityBadge = chalk[color].bold(`[${group.severity}]`);
    console.log(`${index + 1}. ${severityBadge} ${chalk.white.bold(group.type)} ${chalk.gray(`(${group.issues.length} issues)`)}`);
  });
  
  console.log('');
}

/**
 * Display issue details for triage
 */
export function displayIssueDetails(issue, articleHtml = null, appScanBaseUrl = 'https://eu.cloud.appscan.com') {
  const severity = issue.Severity || 'Unknown';
  const color = SEVERITY_COLORS[severity] || 'white';
  
  console.log(chalk[color].bold(`\n${'='.repeat(80)}`));
  console.log(chalk[color].bold(`${issue.IssueType || 'Unknown Issue'}`));
  console.log(chalk[color].bold(`${'='.repeat(80)}\n`));
  
  console.log(chalk.cyan('Severity:'), chalk[color].bold(severity));
  console.log(chalk.cyan('Status:'), issue.Status || 'Unknown');
  console.log(chalk.cyan('ID:'), chalk.gray(issue.Id));
  
  // Show source file/location with absolute URL
  const sourceUrl = issue.SourceFileUri || issue.SourceFileLocation || issue.Location;
  if (sourceUrl) {
    const absoluteUrl = convertToAbsoluteUrl(sourceUrl, appScanBaseUrl);
    console.log(chalk.cyan('Location:'), chalk.blue.underline(absoluteUrl));
  }
  
  // Show API/URL for DAST issues
  if (issue.Api) {
    const absoluteUrl = convertToAbsoluteUrl(issue.Api, appScanBaseUrl);
    console.log(chalk.cyan('API/URL:'), chalk.blue.underline(absoluteUrl));
  }
  
  if (issue.LineNumber) {
    console.log(chalk.cyan('Line:'), issue.LineNumber);
  }
  
  if (issue.CweId) {
    console.log(chalk.cyan('CWE:'), `CWE-${issue.CweId}`, chalk.gray(`https://cwe.mitre.org/data/definitions/${issue.CweId}.html`));
  }
  
  if (issue.Cve) {
    console.log(chalk.cyan('CVE:'), issue.Cve);
  }
  
  // Show snippet from article if available
  if (articleHtml && typeof articleHtml === 'string') {
    // Extract text from HTML using sanitize-html for security
    const text = sanitizeHtml(articleHtml, {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/\s+/g, ' ').trim();
    
    if (text.length > 0) {
      const preview = text.substring(0, 300);
      console.log(chalk.cyan('\n📖 Description:'));
      console.log(chalk.gray(preview + (text.length > 300 ? '...' : '')));
    }
  }
  
  console.log(chalk.gray(`\n${'-'.repeat(80)}\n`));
}

/**
 * Prompt for scan selection
 */
export async function promptScanSelection(scans) {
  return await select({
    message: 'Select a scan to triage:',
    choices: scans,
    pageSize: 15,
  });
}

/**
 * Prompt for group selection
 */
export async function promptGroupSelection(groups) {
  const choices = groups.map((group, index) => {
    const color = SEVERITY_COLORS[group.severity] || 'white';
    const severityBadge = chalk[color].bold(`[${group.severity}]`);
    return {
      name: `${severityBadge} ${group.type} ${chalk.gray(`(${group.issues.length} issues)`)}`,
      value: index,
      short: group.type,
    };
  });

  choices.push({
    name: chalk.yellow('← Back to scan list'),
    value: -1,
    short: 'Back',
  });

  return await select({
    message: 'Select a vulnerability group to triage:',
    choices,
    pageSize: 15,
  });
}

/**
 * Prompt for issue selection (multi-select)
 */
export async function promptIssueSelection(issues, appScanBaseUrl = 'https://eu.cloud.appscan.com') {
  const choices = issues.map(issue => formatIssueDisplay(issue, true, appScanBaseUrl));

  return await checkbox({
    message: 'Select issues to update (use Space to select, Enter to confirm):',
    choices,
    pageSize: 10,
  });
}

/**
 * Prompt for status change
 */
export async function promptStatusChange() {
  return await select({
    message: 'Select new status:',
    choices: ISSUE_STATUSES,
  });
}

/**
 * Prompt for comment
 */
export async function promptComment(required = false) {
  return await input({
    message: 'Enter comment (optional):',
    validate: (value) => {
      if (required && !value.trim()) {
        return 'Comment is required';
      }
      return true;
    },
  });
}

/**
 * Prompt for action selection
 */
export async function promptAction() {
  return await select({
    message: 'What would you like to do?',
    choices: [
      { name: '📝 Update selected issues (status + comment)', value: 'update' },
      { name: '🎫 Create JIRA issue for true positives', value: 'jira' },
      { name: '👁️  View issue details', value: 'view' },
      { name: '🔄 Refresh issue list', value: 'refresh' },
      { name: '← Back to groups', value: 'back' },
    ],
  });
}

/**
 * Prompt for JIRA confirmation
 */
export async function promptJiraCreation(truePositiveCount, mediumOrHigherCount) {
  console.log(chalk.cyan.bold('\n🎫 JIRA Issue Creation\n'));
  console.log(chalk.white(`Found ${chalk.yellow(truePositiveCount)} true positive(s)`));
  console.log(chalk.white(`Including ${chalk.red(mediumOrHigherCount)} Medium or higher severity\n`));
  
  return await confirm({
    message: 'Create JIRA issue for remaining vulnerabilities?',
    default: true,
  });
}

/**
 * Display success message
 */
export function displaySuccess(message) {
  console.log(chalk.green.bold(`\n✅ ${message}\n`));
}

/**
 * Display error message
 */
export function displayError(message) {
  console.log(chalk.red.bold(`\n❌ ${message}\n`));
}

/**
 * Display info message
 */
export function displayInfo(message) {
  console.log(chalk.cyan(`\nℹ️  ${message}\n`));
}

/**
 * Calculate issue statistics
 */
export function calculateIssueStats(issues) {
  const stats = {
    total: issues.length,
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0,
    byStatus: {},
  };

  issues.forEach(issue => {
    const severity = issue.Severity || 'Unknown';
    if (stats[severity] !== undefined) {
      stats[severity]++;
    }

    const status = issue.Status || 'Unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
  });

  return stats;
}

export default {
  formatScanDisplay,
  groupIssuesByType,
  formatIssueDisplay,
  displayGroupedSummary,
  displayIssueDetails,
  promptScanSelection,
  promptGroupSelection,
  promptIssueSelection,
  promptStatusChange,
  promptComment,
  promptAction,
  promptJiraCreation,
  displaySuccess,
  displayError,
  displayInfo,
  calculateIssueStats,
  SEVERITY_COLORS,
  SEVERITY_ORDER,
  ISSUE_STATUSES,
};
