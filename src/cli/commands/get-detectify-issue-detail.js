import chalk from 'chalk';
import {
  initializeDetectifyService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get detailed information about a specific Detectify vulnerability
 * @param {Object} options - CLI options
 * @param {string} options.uuid - Vulnerability UUID
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getDetectifyIssueDetail(options) {
  try {
    if (!options.uuid) {
      throw new Error('--uuid is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeDetectifyService(options.config);

    cliOutput.status(`Fetching vulnerability details: ${options.uuid}`);

    const vuln = await service.getVulnerability(options.uuid);

    if (options.json) {
      cliOutput.json(vuln);
    } else {
      cliOutput.result(chalk.green('\n=== Detectify Vulnerability Details ===\n'));
      
      // Basic information
      cliOutput.result(`${chalk.bold('UUID:')} ${vuln.uuid || 'N/A'}`);
      cliOutput.result(`${chalk.bold('Title:')} ${vuln.title || '(no title)'}`);
      cliOutput.result(`${chalk.bold('Host:')} ${vuln.host || 'N/A'}`);
      cliOutput.result(`${chalk.bold('Location:')} ${vuln.location || 'N/A'}`);
      
      const severityColor = getSeverityColor(vuln.severity);
      const statusColor = getStatusColor(vuln.status);
      cliOutput.result(`${chalk.bold('Severity:')} ${chalk[severityColor](vuln.severity || 'N/A')}`);
      cliOutput.result(`${chalk.bold('Status:')} ${chalk[statusColor](vuln.status || 'N/A')}`);
      cliOutput.result(`${chalk.bold('Scan Source:')} ${vuln.scan_source || 'N/A'}`);

      // Timestamps
      cliOutput.result('');
      cliOutput.result(chalk.bold('--- Timestamps ---'));
      cliOutput.result(`${chalk.bold('Created At:')} ${vuln.created_at || 'N/A'}`);
      cliOutput.result(`${chalk.bold('Updated At:')} ${vuln.updated_at || 'N/A'}`);
      cliOutput.result(`${chalk.bold('Modified At:')} ${vuln.modified_at || 'N/A'}`);

      // Asset info
      if (vuln.asset_token) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- Asset ---'));
        cliOutput.result(`${chalk.bold('Asset Token:')} ${vuln.asset_token}`);
      }

      // CVSS Scores
      if (vuln.cvss_scores) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- CVSS Scores ---'));
        if (vuln.cvss_scores.cvss_2_0) {
          cliOutput.result(`${chalk.bold('CVSS v2.0:')} ${vuln.cvss_scores.cvss_2_0.score} (${vuln.cvss_scores.cvss_2_0.severity})`);
        }
        if (vuln.cvss_scores.cvss_3_0) {
          cliOutput.result(`${chalk.bold('CVSS v3.0:')} ${vuln.cvss_scores.cvss_3_0.score} (${vuln.cvss_scores.cvss_3_0.severity})`);
        }
        if (vuln.cvss_scores.cvss_3_1) {
          cliOutput.result(`${chalk.bold('CVSS v3.1:')} ${vuln.cvss_scores.cvss_3_1.score} (${vuln.cvss_scores.cvss_3_1.severity})`);
        }
      }

      // CWE
      if (vuln.cwe) {
        cliOutput.result('');
        cliOutput.result(`${chalk.bold('CWE:')} ${vuln.cwe}`);
      }

      // Definition
      if (vuln.definition) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- Definition ---'));
        if (vuln.definition.title) {
          cliOutput.result(`${chalk.bold('Title:')} ${vuln.definition.title}`);
        }
        if (vuln.definition.description) {
          cliOutput.result(`${chalk.bold('Description:')} ${truncate(vuln.definition.description, 500)}`);
        }
        if (vuln.definition.risk) {
          cliOutput.result(`${chalk.bold('Risk:')} ${truncate(vuln.definition.risk, 300)}`);
        }
      }

      // Details (text)
      if (vuln.details && vuln.details.text) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- Details ---'));
        const textDetails = Array.isArray(vuln.details.text) 
          ? vuln.details.text.map(t => t.value || t).join('\n')
          : (typeof vuln.details.text === 'string' ? vuln.details.text : JSON.stringify(vuln.details.text));
        cliOutput.result(truncate(textDetails, 1000));
      }

      // References
      if (vuln.references && vuln.references.length > 0) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- References ---'));
        for (const ref of vuln.references.slice(0, 5)) {
          if (ref.link && ref.name) {
            cliOutput.result(`  - ${ref.name}: ${ref.link}`);
          } else if (ref.link) {
            cliOutput.result(`  - ${ref.link}`);
          }
        }
        if (vuln.references.length > 5) {
          cliOutput.result(`  ... and ${vuln.references.length - 5} more`);
        }
      }

      // Links
      if (vuln.links) {
        cliOutput.result('');
        cliOutput.result(chalk.bold('--- Links ---'));
        if (vuln.links.details_page) {
          cliOutput.result(`${chalk.bold('Details Page:')} ${vuln.links.details_page}`);
        }
      }

      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to get Detectify vulnerability details');
  }
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
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

export default getDetectifyIssueDetail;
