import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List repositories for an Azure DevOps project
 * @param {Object} options - CLI options
 * @param {string} options.appId - Project ID or name
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listAzdoRepositories(options) {
  try {
    if (!options.appId) {
      throw new Error('--appId is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status(`Fetching repositories for project: ${options.appId}`);
    const repositories = await service.listRepositories(options.appId);

    if (options.json) {
      cliOutput.json(repositories || []);
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${repositories?.length || 0} repository(ies):\n`)
      );

      if (repositories && repositories.length > 0) {
        repositories.forEach((repo, index) => {
          cliOutput.result(
            `${index + 1}. ${chalk.bold(repo.name || 'N/A')} ${chalk.gray(`(ID: ${repo.id || 'N/A'})`)}`
          );

          const details = [];
          if (repo.defaultBranch) details.push(`Branch: ${repo.defaultBranch}`);
          if (repo.size) details.push(`Size: ${repo.size} bytes`);
          if (repo.isDisabled) details.push('Disabled: Yes');

          if (details.length > 0) {
            cliOutput.result(`   ${chalk.dim(details.join(' | '))}`);
          }

          if (repo.webUrl) {
            cliOutput.result(`   ${chalk.dim.cyan(`URL: ${repo.webUrl}`)}`);
          }

          cliOutput.result('');
        });
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list repositories');
  }
}

export default listAzdoRepositories;
