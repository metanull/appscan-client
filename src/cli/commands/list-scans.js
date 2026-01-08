import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

export async function listScans(appId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAppScanService(options.config);

    const target = appId ? `application ${appId}` : 'all applications';
    cliOutput.status(`Fetching scans for ${target}...`);
    const response = await service.listScans(appId);
    const scans = response.Items || [];

    if (options.json) {
      cliOutput.json(scans);
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
    handleCommandError(error, 'Failed to list scans');
  }
}

export default listScans;
