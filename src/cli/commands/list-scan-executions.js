import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listScanExecutions(scanId, options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

    console.error(chalk.blue(`Fetching executions for scan ${scanId}...`));
    const response = await service.listScanExecutions(scanId);
    const executions = Array.isArray(response)
      ? response
      : response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(executions, null, 2));
    } else {
      console.error(
        chalk.green(`\nFound ${executions.length} execution(s):\n`)
      );
      executions.forEach((execution, index) => {
        console.log(
          `${index + 1}. ${chalk.bold('Execution ID:')} ${chalk.gray(execution.Id || 'N/A')}`
        );
        const statusColor =
          execution.Status === 'Ready'
            ? 'green'
            : execution.Status === 'Failed'
              ? 'red'
              : 'yellow';
        console.log(
          `   ${chalk.dim('Status:')} ${chalk[statusColor](execution.Status || 'N/A')}`
        );
        if (execution.StartedAt) {
          console.log(
            `   ${chalk.dim('Started:')} ${new Date(execution.StartedAt).toLocaleString()}`
          );
        }
        if (execution.CompletedAt) {
          console.log(
            `   ${chalk.dim('Completed:')} ${new Date(execution.CompletedAt).toLocaleString()}`
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

export default listScanExecutions;
