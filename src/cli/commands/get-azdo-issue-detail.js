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
 * Get dismissal type name from enum value
 * @param {number} dismissalType - Dismissal type enum value
 * @returns {string}
 */
function getDismissalTypeName(dismissalType) {
  const types = {
    0: 'Unknown',
    1: 'Fixed',
    2: 'AcceptedRisk',
    3: 'FalsePositive',
    4: 'AgreedToGuidance',
    5: 'ToolUpgrade',
  };
  return types[dismissalType] || `Unknown(${dismissalType})`;
}

/**
 * Get detailed information about a specific alert (issue)
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} options.repositoryId - Repository ID or name
 * @param {number} options.issueId - Alert ID
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getAzdoIssueDetail(options) {
  try {
    if (!options.appId) {
      throw new Error('--appId is required');
    }
    if (!options.repositoryId) {
      throw new Error('--repositoryId is required');
    }
    if (!options.issueId) {
      throw new Error('--issueId is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    // Get project and repository to extract IDs
    cliOutput.status(
      `Fetching alert details: ${options.issueId} in repository ${options.repositoryId}`
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

    const alert = await service.getAlert(
      project.name,
      repository.id,
      options.issueId
    );

    if (options.json) {
      cliOutput.json(alert);
    } else {
      cliOutput.result(chalk.green('\n=== Alert Details ===\n'));
      cliOutput.result(`${chalk.bold('Alert ID:')} ${alert.alertId || 'N/A'}`);
      cliOutput.result(
        `${chalk.bold('Title:')} ${alert.title || '(no title)'}`
      );
      cliOutput.result(`${chalk.bold('Type:')} ${alert.alertType || 'N/A'}`);
      cliOutput.result(`${chalk.bold('Severity:')} ${alert.severity || 'N/A'}`);
      cliOutput.result(`${chalk.bold('State:')} ${getStateName(alert.state)}`);

      if (alert.confidence) {
        cliOutput.result(`${chalk.bold('Confidence:')} ${alert.confidence}`);
      }

      if (alert.dismissal) {
        cliOutput.result(chalk.bold('\nDismissal Info:'));
        cliOutput.result(
          `  Type: ${getDismissalTypeName(alert.dismissal.dismissalType)}`
        );
        if (alert.dismissal.message) {
          cliOutput.result(`  Message: ${alert.dismissal.message}`);
        }
      }

      if (alert.physicalLocations && alert.physicalLocations.length > 0) {
        cliOutput.result(chalk.bold('\nPhysical Locations:'));
        alert.physicalLocations.forEach((loc, index) => {
          cliOutput.result(`  ${index + 1}. ${loc.filePath || 'N/A'}`);
          if (loc.region) {
            cliOutput.result(
              `     Line: ${loc.region.lineStart || 'N/A'}, Column: ${loc.region.columnStart || 'N/A'}`
            );
          }
        });
      }

      if (alert.logicalLocations && alert.logicalLocations.length > 0) {
        cliOutput.result(chalk.bold('\nLogical Locations:'));
        alert.logicalLocations.forEach((loc, index) => {
          cliOutput.result(
            `  ${index + 1}. ${loc.fullyQualifiedName || 'N/A'}`
          );
        });
      }

      if (alert.introductionDate) {
        const date = new Date(alert.introductionDate);
        cliOutput.result(
          `\n${chalk.bold('Introduction Date:')} ${date.toLocaleString()}`
        );
      }

      if (alert.firstSeenDate) {
        const date = new Date(alert.firstSeenDate);
        cliOutput.result(
          `${chalk.bold('First Seen:')} ${date.toLocaleString()}`
        );
      }

      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to get alert details');
  }
}

export default getAzdoIssueDetail;
