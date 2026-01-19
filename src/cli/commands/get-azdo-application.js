import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get Azure DevOps project (application) details
 * @param {string} appId - Project ID or name
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getAzdoApplication(appId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status(`Fetching project details for: ${appId}`);
    const project = await service.getProject(appId);

    if (options.json) {
      cliOutput.json(project);
    } else {
      cliOutput.result(chalk.green('\n=== Project Details ===\n'));
      cliOutput.result(`${chalk.bold('Name:')} ${project.name || 'N/A'}`);
      cliOutput.result(`${chalk.bold('ID:')} ${project.id || 'N/A'}`);

      if (project.description) {
        cliOutput.result(`${chalk.bold('Description:')} ${project.description}`);
      }

      cliOutput.result(`${chalk.bold('State:')} ${project.state || 'N/A'}`);
      cliOutput.result(
        `${chalk.bold('Visibility:')} ${project.visibility || 'N/A'}`
      );

      if (project.lastUpdateTime) {
        const date = new Date(project.lastUpdateTime);
        cliOutput.result(
          `${chalk.bold('Last Updated:')} ${date.toLocaleString()}`
        );
      }

      if (project.url) {
        cliOutput.result(`${chalk.bold('URL:')} ${project.url}`);
      }

      cliOutput.result('');
    }
  } catch (error) {
    handleCommandError(error, 'Failed to get project details');
  }
}

export default getAzdoApplication;
