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
 * List alerts (issues) for an Azure DevOps repository
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} options.repositoryId - Repository ID or name
 * @param {string} [options.type] - Alert type filter
 * @param {string} [options.severity] - Alert severity filter
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listAzdoIssues(options) {
  try {
    if (!options.appId) {
      throw new Error('--appId is required');
    }
    if (!options.repositoryId) {
      throw new Error('--repositoryId is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    // Get project and repository to extract IDs
    cliOutput.status(
      `Fetching alerts for repository: ${options.repositoryId} in project ${options.appId}`
    );
    const project = await service.getProject(options.appId);
    const repository = await service.getRepository(
      project.name,
      options.repositoryId
    );

    if (!repository) {
      throw new Error(
        `Repository "${options.repositoryId}" not found in project "${project.name}"`
      );
    }

    const alerts = await service.listAlerts(project.name, repository.id, {
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
        // Group by type and severity for summary
        const byType = {};
        const bySeverity = {};
        const byState = {};

        for (const alert of alerts) {
          const type = alert.alertType || 'Unknown';
          const severity = alert.severity || 'Unknown';
          const state = getStateName(alert.state);

          byType[type] = (byType[type] || 0) + 1;
          bySeverity[severity] = (bySeverity[severity] || 0) + 1;
          byState[state] = (byState[state] || 0) + 1;
        }

        cliOutput.result(chalk.bold('Summary:'));
        cliOutput.result(`  By Type: ${JSON.stringify(byType)}`);
        cliOutput.result(`  By Severity: ${JSON.stringify(bySeverity)}`);
        cliOutput.result(`  By State: ${JSON.stringify(byState)}`);
        cliOutput.result('');

        alerts.forEach((alert, index) => {
          cliOutput.result(
            `${index + 1}. ${chalk.bold(alert.title || alert.ruleName || '(no title)')} ${chalk.gray(`[ID: ${alert.alertId}]`)}`
          );
          cliOutput.result(
            `   Type: ${chalk.cyan(alert.alertType || 'N/A')} | Severity: ${chalk.yellow(alert.severity || 'N/A')} | State: ${getStateName(alert.state)}`
          );

          if (alert.logicalLocations && alert.logicalLocations.length > 0) {
            const location = alert.logicalLocations[0];
            cliOutput.result(
              `   Location: ${location.fullyQualifiedName || 'N/A'}`
            );
          }

          cliOutput.result('');
        });
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list alerts');
  }
}

export default listAzdoIssues;
