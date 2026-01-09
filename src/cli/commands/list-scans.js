import chalk from 'chalk';
import {
  initializeAppScanService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * List scans for a specific application or all scans
 * @param {string} [appId] - Application ID to filter scans (optional, lists all if not provided)
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
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
      cliOutput.success(chalk.green(`\nFound ${scans.length} scan(s):\n`));
      scans.forEach((scan, index) => {
        cliOutput.status(
          `${index + 1}. ${chalk.bold(scan.Name || 'N/A')} ${chalk.gray(`(ID: ${scan.Id || 'N/A'})`)}`
        );
        cliOutput.status(`   ${chalk.dim('Type:')} ${scan.ScanType || 'N/A'}`);
        if (scan.LatestExecution) {
          const statusColor =
            scan.LatestExecution.Status === 'Ready'
              ? 'green'
              : scan.LatestExecution.Status === 'Failed'
                ? 'red'
                : 'yellow';
          cliOutput.status(
            `   ${chalk.dim('Status:')} ${chalk[statusColor](scan.LatestExecution.Status || 'N/A')}`
          );
        }
        cliOutput.status('');
      });
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list scans');
  }
}

export default listScans;
