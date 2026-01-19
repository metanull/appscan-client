import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get Azure DevOps organization details
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getAzdoOrganization(options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status('Fetching organization details...');
    const orgData = await service.getOrganization();

    if (options.json) {
      cliOutput.json(orgData);
    } else {
      cliOutput.result(chalk.green('\n=== Azure DevOps Organization ===\n'));
      cliOutput.result(`${chalk.bold('Server URL:')} ${orgData.serverUrl}`);
      cliOutput.result(
        `${chalk.bold('Authenticated User:')} ${orgData.authenticatedUser || 'Unknown'}`
      );
      cliOutput.result(
        `${chalk.bold('Instance ID:')} ${orgData.instanceId || 'N/A'}`
      );
      cliOutput.result(
        `${chalk.bold('Deployment Type:')} ${orgData.deploymentType || 'N/A'}`
      );
      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to get organization details');
  }
}

export default getAzdoOrganization;
