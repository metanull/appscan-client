import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listScans(appId, options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.log('Authenticating...');
    await service.authenticate();

    console.log(`Fetching scans for application ${appId}...`);
    const scans = await service.listScans(appId);

    if (options.json) {
      console.log(JSON.stringify(scans, null, 2));
    } else {
      console.log(`\nFound ${scans.length} scan(s):\n`);
      scans.forEach((scan, index) => {
        console.log(`${index + 1}. ${scan.Name || 'N/A'} (ID: ${scan.Id || 'N/A'})`);
        console.log(`   Type: ${scan.ScanType || 'N/A'}`);
        if (scan.LatestExecution) {
          console.log(`   Status: ${scan.LatestExecution.Status || 'N/A'}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default listScans;
