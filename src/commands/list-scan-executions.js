import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listScanExecutions(scanId, options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.log('Authenticating...');
    await service.authenticate();

    console.log(`Fetching executions for scan ${scanId}...`);
    const response = await service.listScanExecutions(scanId);
    const executions = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(executions, null, 2));
    } else {
      console.log(`\nFound ${executions.length} execution(s):\n`);
      executions.forEach((execution, index) => {
        console.log(`${index + 1}. Execution ID: ${execution.Id || 'N/A'}`);
        console.log(`   Status: ${execution.Status || 'N/A'}`);
        if (execution.StartedAt) {
          console.log(`   Started: ${new Date(execution.StartedAt).toLocaleString()}`);
        }
        if (execution.CompletedAt) {
          console.log(
            `   Completed: ${new Date(execution.CompletedAt).toLocaleString()}`
          );
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default listScanExecutions;
