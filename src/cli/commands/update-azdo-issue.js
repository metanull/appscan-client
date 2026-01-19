import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get state enum value from name
 * @param {string} stateName - State name
 * @returns {number}
 */
function getStateValue(stateName) {
  const states = {
    unknown: 0,
    active: 1,
    dismissed: 2,
    fixed: 4,
    autodismissed: 8,
  };
  const normalized = stateName.toLowerCase();
  if (!(normalized in states)) {
    throw new Error(
      `Invalid state: ${stateName}. Valid values: Unknown, Active, Dismissed, Fixed, AutoDismissed`
    );
  }
  return states[normalized];
}

/**
 * Get dismissal reason enum value from name
 * @param {string} reasonName - Dismissal reason name
 * @returns {number}
 */
function getDismissalReasonValue(reasonName) {
  const reasons = {
    unknown: 0,
    fixed: 1,
    acceptedrisk: 2,
    falsepositive: 3,
    agreedtoguidance: 4,
    toolupgrade: 5,
  };
  const normalized = reasonName.toLowerCase().replace(/[_-]/g, '');
  if (!(normalized in reasons)) {
    throw new Error(
      `Invalid dismissal reason: ${reasonName}. Valid values: Unknown, Fixed, AcceptedRisk, FalsePositive, AgreedToGuidance, ToolUpgrade`
    );
  }
  return reasons[normalized];
}

/**
 * Update an Azure DevOps alert (issue)
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} options.repositoryId - Repository ID or name
 * @param {number} options.issueId - Alert ID
 * @param {string} [options.severity] - New severity (not yet supported by API)
 * @param {string} [options.status] - New state
 * @param {string} [options.reason] - Dismissal reason (when dismissing)
 * @param {string} [options.comment] - Comment for dismissal
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function updateAzdoIssue(options) {
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

    if (!options.status && !options.severity) {
      throw new Error(
        'At least one of --status or --severity must be provided'
      );
    }

    if (options.severity) {
      throw new Error(
        'Severity updates are not yet supported by the Azure DevOps Alert API'
      );
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    // Get project and repository to extract IDs
    cliOutput.status(
      `Updating alert: ${options.issueId} in repository ${options.repositoryId}`
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

    // Build update object
    const update = {};

    if (options.status) {
      update.state = getStateValue(options.status);

      // If closing/dismissing, we need to provide dismissal reason
      if (update.state === 2 || update.state === 4 || update.state === 8) {
        // Dismissed, Fixed, or AutoDismissed
        if (options.reason) {
          // User provided explicit dismissal reason
          update.dismissedReason = getDismissalReasonValue(options.reason);
        } else {
          // Default to appropriate dismissal reason based on state
          if (update.state === 4) {
            update.dismissedReason = 1; // Fixed
          } else if (update.state === 2) {
            update.dismissedReason = 2; // AcceptedRisk (default for Dismissed)
          }
        }

        if (options.comment) {
          update.dismissedComment = options.comment;
        }
      }
    }

    const updatedAlert = await service.updateAlert(
      project.name,
      repository.id,
      options.issueId,
      update
    );

    if (options.json) {
      cliOutput.json(updatedAlert);
    } else {
      cliOutput.result(chalk.green('\n✓ Alert updated successfully\n'));
      cliOutput.result(
        `${chalk.bold('Alert ID:')} ${updatedAlert.alertId || 'N/A'}`
      );
      cliOutput.result(
        `${chalk.bold('Title:')} ${updatedAlert.title || '(no title)'}`
      );
      cliOutput.result(
        `${chalk.bold('New State:')} ${getStateName(updatedAlert.state)}`
      );

      if (updatedAlert.dismissal && updatedAlert.dismissal.message) {
        cliOutput.result(
          `${chalk.bold('Comment:')} ${updatedAlert.dismissal.message}`
        );
      }

      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to update alert');
  }
}

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

export default updateAzdoIssue;
