import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';

export async function listApplications(options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

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
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

export default listApplications;
