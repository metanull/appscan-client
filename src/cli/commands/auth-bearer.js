import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Authenticate with AppScan and output bearer token
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 */
export async function authBearer(options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    const token = await service.authenticate();

    cliOutput.result(token);
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default authBearer;
