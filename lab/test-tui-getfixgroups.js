import { AppScanService } from '../src/tui/services/appscan.js';
import { Config } from '../src/utils/config.js';

async function test() {
  try {
    const config = new Config();
    const svc = new AppScanService();
    const apps = await svc.listApplications();
    console.log('apps count', apps.length);
    const appId = apps[0].Id;
    console.log('appId', appId);
    const fixGroups = await svc.getFixGroups('Application', appId, {});
    console.log('fixGroups count', fixGroups.length);
    console.log('first FG', fixGroups[0].Id, fixGroups[0].Subject);
  } catch (err) {
    console.error('Error', err);
  }
}

test();