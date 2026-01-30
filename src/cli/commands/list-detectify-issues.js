import chalk from 'chalk';
import {
  initializeDetectifyService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List vulnerabilities from Detectify
 * @param {Object} options - CLI options
 * @param {string} [options.status] - Filter by status (comma-separated: active,new,patched,regression,accepted_risk,false_positive)
 * @param {string} [options.severity] - Filter by severity (comma-separated: information,low,medium,high,critical)
 * @param {string} [options.host] - Filter by host
 * @param {string} [options.assetToken] - Filter by asset token
 * @param {number} [options.limit] - Limit number of results
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listDetectifyIssues(options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeDetectifyService(options.config);

    cliOutput.status('Fetching Detectify vulnerabilities...');

    // Build filter options
    const filterOptions = {
      pageSize: options.limit || 100,
    };

    if (options.status) {
      filterOptions.status = options.status.split(',').map(s => s.trim());
    }

    if (options.severity) {
      filterOptions.severityV3 = options.severity.split(',').map(s => s.trim());
    }

    if (options.host) {
      filterOptions.host = options.host.split(',').map(s => s.trim());
    }

    if (options.assetToken) {
      filterOptions.assetToken = options.assetToken.split(',').map(s => s.trim());
    }

    const response = await service.listVulnerabilities(filterOptions);
    const vulnerabilities = response.vulnerabilities || [];

    if (options.json) {
      cliOutput.json({
        total: response.total_vulnerabilities,
        fetched: vulnerabilities.length,
        hasMore: response.has_more,
        vulnerabilities,
      });
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${vulnerabilities.length} of ${response.total_vulnerabilities} total vulnerability(ies):\n`)
      );

      if (vulnerabilities.length > 0) {
        // Group by severity and status for summary
        const bySeverity = {};
        const byStatus = {};
        const byScanSource = {};

        for (const vuln of vulnerabilities) {
          const severity = vuln.severity || 'unknown';
          const status = vuln.status || 'unknown';
          const scanSource = vuln.scan_source || 'unknown';

          bySeverity[severity] = (bySeverity[severity] || 0) + 1;
          byStatus[status] = (byStatus[status] || 0) + 1;
          byScanSource[scanSource] = (byScanSource[scanSource] || 0) + 1;
        }

        cliOutput.result(chalk.bold('Summary:'));
        cliOutput.result(`  By Severity: ${JSON.stringify(bySeverity)}`);
        cliOutput.result(`  By Status: ${JSON.stringify(byStatus)}`);
        cliOutput.result(`  By Scan Source: ${JSON.stringify(byScanSource)}`);
        cliOutput.result('');

        // Display vulnerabilities
        vulnerabilities.forEach((vuln, index) => {
          const severityColor = getSeverityColor(vuln.severity);
          const statusColor = getStatusColor(vuln.status);
          
          cliOutput.result(
            `${index + 1}. ${chalk.bold(vuln.title || '(no title)')} ${chalk.gray(`[UUID: ${vuln.uuid}]`)}`
          );
          cliOutput.result(
            `   Host: ${chalk.cyan(vuln.host || 'N/A')} | ` +
            `Severity: ${chalk[severityColor](vuln.severity || 'N/A')} | ` +
            `Status: ${chalk[statusColor](vuln.status || 'N/A')}`
          );
          cliOutput.result(
            `   Location: ${vuln.location || 'N/A'}`
          );
          cliOutput.result('');
        });

        if (response.has_more) {
          cliOutput.result(chalk.yellow(`\nNote: More results available. Use --limit to fetch more.`));
        }
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list Detectify vulnerabilities');
  }
}

/**
 * Get severity color for display
 * @param {string} severity - Severity level
 * @returns {string} Chalk color name
 */
function getSeverityColor(severity) {
  const colors = {
    critical: 'red',
    high: 'red',
    medium: 'yellow',
    low: 'blue',
    information: 'gray',
  };
  return colors[severity?.toLowerCase()] || 'white';
}

/**
 * Get status color for display
 * @param {string} status - Status value
 * @returns {string} Chalk color name
 */
function getStatusColor(status) {
  const colors = {
    active: 'red',
    new: 'red',
    regression: 'yellow',
    patched: 'green',
    accepted_risk: 'cyan',
    false_positive: 'gray',
  };
  return colors[status?.toLowerCase()] || 'white';
}

export default listDetectifyIssues;
