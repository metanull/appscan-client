#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Config } from '../src/utils/config.js';
import { AppScanService } from '../src/services/appscan-service.js';

const outDir = path.resolve(process.cwd(), 'reports', 'api-samples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  try {
    const config = new Config();
    if (!config.isValid()) {
      console.error('Missing AppScan credentials. Set APPSCAN_API_KEY and APPSCAN_API_SECRET in env or config file.');
      process.exit(2);
    }

    const service = new AppScanService(config);
    console.log('Authenticating...');
    await service.authenticate();
    console.log('Authenticated');

    console.log('Listing applications...');
    const apps = await service.listApplications();
    fs.writeFileSync(path.join(outDir, 'applications.json'), JSON.stringify(apps, null, 2));
    console.log('Saved applications.json');

    const firstAppId = apps?.Items?.[0]?.Id;
    if (!firstAppId) {
      console.warn('No applications found, stopping.');
      process.exit(0);
    }

    console.log('Listing scans for first application:', firstAppId);
    const scans = await service.listScans(firstAppId);
    fs.writeFileSync(path.join(outDir, 'scans.json'), JSON.stringify(scans, null, 2));
    console.log('Saved scans.json');

    const firstScanId = scans?.Items?.[0]?.Id;
    if (!firstScanId) {
      console.warn('No scans found for the application, stopping.');
      process.exit(0);
    }

    console.log('Listing issues for scan:', firstScanId);
    const issues = await service.listIssues(firstScanId, 'Noise,Fixed,Passed');
    fs.writeFileSync(path.join(outDir, 'issues.json'), JSON.stringify(issues, null, 2));
    console.log('Saved issues.json');

    const firstIssueId = issues?.Items?.[0]?.Id;
    if (firstIssueId) {
      console.log('Fetching article for first issue:', firstIssueId);
      const article = await service.getArticle(firstIssueId);
      fs.writeFileSync(path.join(outDir, 'article.html'), typeof article === 'string' ? article : JSON.stringify(article, null, 2));
      console.log('Saved article.html');
    } else {
      console.warn('No issues found to fetch article for.');
    }

    console.log('Sample collection complete. Files saved to:', outDir);
  } catch (error) {
    console.error('Error collecting samples:', error.message || error);
    process.exit(1);
  }
})();
