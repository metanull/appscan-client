import chalk from 'chalk';
import {
  initializeDetectifyService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Valid status actions for Detectify vulnerabilities
 */
const VALID_ACTIONS = {
  'accepted_risk': 'setAcceptedRisk',
  'accepted-risk': 'setAcceptedRisk',
  'acceptedrisk': 'setAcceptedRisk',
  'false_positive': 'setFalsePositive',
  'false-positive': 'setFalsePositive',
  'falsepositive': 'setFalsePositive',
  'patched': 'setFixed',
  'fixed': 'setFixed',
  'active': 'unset', // Special case: need to determine current status to unset
};

/**
 * Update a Detectify vulnerability status
 * @param {Object} options - CLI options
 * @param {string} options.uuid - Vulnerability UUID
 * @param {string} options.status - New status (accepted_risk, false_positive, patched/fixed, active)
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function updateDetectifyIssue(options) {
  try {
    if (!options.uuid) {
      throw new Error('--uuid is required');
    }
    if (!options.status) {
      throw new Error('--status is required');
    }

    const normalizedStatus = options.status.toLowerCase().replace(/[_-]/g, '');
    const actionKey = Object.keys(VALID_ACTIONS).find(
      k => k.replace(/[_-]/g, '') === normalizedStatus
    );

    if (!actionKey) {
      throw new Error(
        `Invalid status: ${options.status}. Valid values: accepted_risk, false_positive, patched, fixed, active`
      );
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeDetectifyService(options.config);

    // Get current vulnerability to show before/after
    cliOutput.status(`Fetching current status for vulnerability: ${options.uuid}`);
    const beforeVuln = await service.getVulnerability(options.uuid);
    const beforeStatus = beforeVuln.status;

    cliOutput.status(`Updating vulnerability status to: ${options.status}`);

    // Handle the special case of setting to "active" (which means unsetting current status)
    if (VALID_ACTIONS[actionKey] === 'unset') {
      // Need to unset based on current status
      if (beforeStatus === 'accepted_risk') {
        await service.unsetAcceptedRisk(options.uuid);
      } else if (beforeStatus === 'false_positive') {
        await service.unsetFalsePositive(options.uuid);
      } else if (beforeStatus === 'patched') {
        await service.unsetFixed(options.uuid);
      } else {
        cliOutput.result(chalk.yellow(`Vulnerability is already in '${beforeStatus}' state.`));
        if (options.json) {
          cliOutput.json({ uuid: options.uuid, status: beforeStatus, changed: false });
        }
        return;
      }
    } else {
      // Setting a specific status
      const methodName = VALID_ACTIONS[actionKey];
      
      // If already in a resolved state, need to unset first
      if (['accepted_risk', 'false_positive', 'patched'].includes(beforeStatus)) {
        cliOutput.status(`Unsetting current status '${beforeStatus}' first...`);
        if (beforeStatus === 'accepted_risk') {
          await service.unsetAcceptedRisk(options.uuid);
        } else if (beforeStatus === 'false_positive') {
          await service.unsetFalsePositive(options.uuid);
        } else if (beforeStatus === 'patched') {
          await service.unsetFixed(options.uuid);
        }
      }
      
      // Now set the new status
      await service[methodName](options.uuid);
    }

    // Fetch updated vulnerability
    const afterVuln = await service.getVulnerability(options.uuid);

    if (options.json) {
      cliOutput.json({
        uuid: options.uuid,
        title: afterVuln.title,
        beforeStatus,
        afterStatus: afterVuln.status,
        changed: beforeStatus !== afterVuln.status,
      });
    } else {
      cliOutput.result(chalk.green('\n✓ Vulnerability status updated successfully\n'));
      cliOutput.result(`${chalk.bold('UUID:')} ${afterVuln.uuid}`);
      cliOutput.result(`${chalk.bold('Title:')} ${afterVuln.title || '(no title)'}`);
      cliOutput.result(`${chalk.bold('Before Status:')} ${getStatusDisplay(beforeStatus)}`);
      cliOutput.result(`${chalk.bold('After Status:')} ${getStatusDisplay(afterVuln.status)}`);
      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to update Detectify vulnerability');
  }
}

/**
 * Get formatted status display with color
 * @param {string} status - Status value
 * @returns {string} Colored status string
 */
function getStatusDisplay(status) {
  const colors = {
    active: 'red',
    new: 'red',
    regression: 'yellow',
    patched: 'green',
    accepted_risk: 'cyan',
    false_positive: 'gray',
  };
  const color = colors[status?.toLowerCase()] || 'white';
  return chalk[color](status || 'N/A');
}

export default updateDetectifyIssue;
