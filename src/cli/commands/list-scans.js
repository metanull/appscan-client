import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';

export async function listScans(appId, options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

    const target = appId ? `application ${appId}` : 'all applications';
    console.error(chalk.blue(`Fetching scans for ${target}...`));
    const response = await service.listScans(appId);
    const scans = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(scans, null, 2));
    } else {
      console.error(chalk.green(`\nFound ${scans.length} scan(s):\n`));
      scans.forEach((scan, index) => {
        console.log(
          `${index + 1}. ${chalk.bold(scan.Name || 'N/A')} ${chalk.gray(`(ID: ${scan.Id || 'N/A'})`)}`
        );
        console.log(`   ${chalk.dim('Type:')} ${scan.ScanType || 'N/A'}`);
        if (scan.LatestExecution) {
          const statusColor =
            scan.LatestExecution.Status === 'Ready'
              ? 'green'
              : scan.LatestExecution.Status === 'Failed'
                ? 'red'
                : 'yellow';
          console.log(
            `   ${chalk.dim('Status:')} ${chalk[statusColor](scan.LatestExecution.Status || 'N/A')}`
          );
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

export default listScans;
