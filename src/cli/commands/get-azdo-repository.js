import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get Azure DevOps repository details
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} options.repositoryId - Repository ID or name
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getAzdoRepository(options) {
  try {
    if (!options.appId) {
      throw new Error('--appId is required');
    }
    if (!options.repositoryId) {
      throw new Error('--repositoryId is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status(
      `Fetching repository details: ${options.repositoryId} in project ${options.appId}`
    );
    const repository = await service.getRepository(
      options.appId,
      options.repositoryId
    );

    if (options.json) {
      cliOutput.json(repository);
    } else {
      cliOutput.result(chalk.green('\n=== Repository Details ===\n'));
      cliOutput.result(`${chalk.bold('Name:')} ${repository.name || 'N/A'}`);
      cliOutput.result(`${chalk.bold('ID:')} ${repository.id || 'N/A'}`);
      cliOutput.result(
        `${chalk.bold('Project:')} ${repository.project?.name || 'N/A'}`
      );
      cliOutput.result(
        `${chalk.bold('Default Branch:')} ${repository.defaultBranch || 'N/A'}`
      );
      cliOutput.result(
        `${chalk.bold('Size:')} ${repository.size ? `${repository.size} bytes` : 'N/A'}`
      );
      cliOutput.result(
        `${chalk.bold('Disabled:')} ${repository.isDisabled ? 'Yes' : 'No'}`
      );

      if (repository.webUrl) {
        cliOutput.result(`${chalk.bold('Web URL:')} ${repository.webUrl}`);
      }

      if (repository.remoteUrl) {
        cliOutput.result(
          `${chalk.bold('Remote URL:')} ${repository.remoteUrl}`
        );
      }

      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to get repository details');
  }
}

export default getAzdoRepository;
