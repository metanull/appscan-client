import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function listApplications(options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.log('Authenticating...');
    await service.authenticate();

    console.log('Fetching applications...');
    const applications = await service.listApplications();

    if (options.json) {
      console.log(JSON.stringify(applications, null, 2));
    } else {
      console.log(`\nFound ${applications.length} application(s):\n`);
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.Name || 'N/A'} (ID: ${app.Id || 'N/A'})`);
        if (app.Description) {
          console.log(`   Description: ${app.Description}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default listApplications;
