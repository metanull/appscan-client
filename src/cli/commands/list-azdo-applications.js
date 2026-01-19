import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List Azure DevOps projects (applications)
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listAzdoApplications(options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status('Fetching projects...');
    const projects = await service.listProjects();

    if (options.json) {
      cliOutput.json(projects || []);
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${projects?.length || 0} project(s):\n`)
      );

      if (projects && projects.length > 0) {
        projects.forEach((project, index) => {
          cliOutput.result(
            `${index + 1}. ${chalk.bold(project.name || 'N/A')} ${chalk.gray(`(ID: ${project.id || 'N/A'})`)}`
          );

          if (project.description) {
            cliOutput.result(
              `   ${chalk.dim('Description:')} ${project.description}`
            );
          }

          const details = [];
          if (project.state) details.push(`State: ${project.state}`);
          if (project.visibility)
            details.push(`Visibility: ${project.visibility}`);
          if (project.lastUpdateTime) {
            const date = new Date(project.lastUpdateTime);
            details.push(`Updated: ${date.toLocaleDateString()}`);
          }

          if (details.length > 0) {
            cliOutput.result(`   ${chalk.dim(details.join(' | '))}`);
          }

          cliOutput.result('');
        });
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list projects');
  }
}

export default listAzdoApplications;
