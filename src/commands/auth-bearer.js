import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function authBearer(options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    const token = await service.authenticate();

    console.log(token);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default authBearer;
