import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get state name from enum value
 * @param {number} state - State enum value
 * @returns {string}
 */
function getStateName(state) {
  const states = {
    0: 'Unknown',
    1: 'Active',
    2: 'Dismissed',
    4: 'Fixed',
    8: 'AutoDismissed',
  };
  return states[state] || `Unknown(${state})`;
}

/**
 * List alerts (issues) for all repositories in an Azure DevOps project
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} [options.type] - Alert type filter
 * @param {string} [options.severity] - Alert severity filter
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listAzdoByApp(options) {
  try {
    if (!options.appId) {
      throw new Error('--appId is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status(
      `Fetching alerts for all repositories in project: ${options.appId}`
    );
    const alerts = await service.listAlertsByProject(options.appId, {
      type: options.type,
      severity: options.severity,
    });

    if (options.json) {
      cliOutput.json(alerts || []);
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${alerts?.length || 0} alert(s):\n`)
      );

      if (alerts && alerts.length > 0) {
        // Group by repository, type, severity and state
        const byRepo = {};
        const byType = {};
        const bySeverity = {};
        const byState = {};

        for (const alert of alerts) {
          const repo = alert.repositoryName || 'Unknown';
          const type = alert.alertType || 'Unknown';
          const severity = alert.severity || 'Unknown';
          const state = getStateName(alert.state);

          byRepo[repo] = (byRepo[repo] || 0) + 1;
          byType[type] = (byType[type] || 0) + 1;
          bySeverity[severity] = (bySeverity[severity] || 0) + 1;
          byState[state] = (byState[state] || 0) + 1;
        }

        cliOutput.result(chalk.bold('Summary:'));
        cliOutput.result(`  By Repository: ${JSON.stringify(byRepo)}`);
        cliOutput.result(`  By Type: ${JSON.stringify(byType)}`);
        cliOutput.result(`  By Severity: ${JSON.stringify(bySeverity)}`);
        cliOutput.result(`  By State: ${JSON.stringify(byState)}`);
        cliOutput.result('');

        // Group alerts by repository for display
        const alertsByRepo = {};
        for (const alert of alerts) {
          const repo = alert.repositoryName || 'Unknown';
          if (!alertsByRepo[repo]) {
            alertsByRepo[repo] = [];
          }
          alertsByRepo[repo].push(alert);
        }

        // Display alerts grouped by repository
        for (const [repo, repoAlerts] of Object.entries(alertsByRepo)) {
          cliOutput.result(
            chalk.cyan.bold(`\n--- Repository: ${repo} (${repoAlerts.length} alerts) ---\n`)
          );

          repoAlerts.forEach((alert, index) => {
            cliOutput.result(
              `${index + 1}. ${chalk.bold(alert.title || alert.ruleName || '(no title)')} ${chalk.gray(`[ID: ${alert.alertId}]`)}`
            );
            cliOutput.result(
              `   Type: ${chalk.cyan(alert.alertType || 'N/A')} | Severity: ${chalk.yellow(alert.severity || 'N/A')} | State: ${getStateName(alert.state)}`
            );
          });
        }
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list alerts by application');
  }
}

export default listAzdoByApp;
