import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';

export async function listApplications(options) {
  try {
    const { service } = await initializeAppScanService(options.config);

    console.error(chalk.blue('Fetching applications...'));
    const response = await service.listApplications();
    const applications = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(applications, null, 2));
    } else {
      console.error(
        chalk.green(`\nFound ${applications.length} application(s):\n`)
      );
      applications.forEach((app, index) => {
        console.log(
          `${index + 1}. ${chalk.bold(app.Name || 'N/A')} ${chalk.gray(`(ID: ${app.Id || 'N/A'})`)}`
        );
        if (app.Description) {
          console.log(`   ${chalk.dim('Description:')} ${app.Description}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list applications');
  }
}

export default listApplications;
