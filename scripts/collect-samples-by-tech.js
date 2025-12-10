#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Config } from '../src/utils/config.js';
import { AppScanService } from '../src/services/appscan-service.js';

const outDir = path.resolve(process.cwd(), 'reports', 'api-samples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const TECH_MAP = {
  SAST: ['StaticAnalyzer'],
  DAST: ['DynamicAnalyzer','DastAutomation'],
  SCA: ['ScaAnalyzer']
};

function findByTech(items, techArray) {
  return items.find(s => s && techArray.includes(s.Technology));
}

(async () => {
  try {
    const config = new Config();
    if (!config.isValid()) {
      console.error('Missing AppScan credentials. Set APPSCAN_API_KEY and APPSCAN_API_SECRET in env or config file.');
      process.exit(2);
    }

    const service = new AppScanService(config);
    await service.authenticate();

    const allScansResp = await service.listScans();
    const scans = allScansResp?.Items || [];
    fs.writeFileSync(path.join(outDir, 'scans-all.json'), JSON.stringify(allScansResp, null, 2));

    for (const techKey of Object.keys(TECH_MAP)) {
      const techValues = TECH_MAP[techKey];
      const scan = findByTech(scans, techValues);
      if (!scan) {
        console.warn(`No scan found for ${techKey} (searched: ${techValues.join(',')})`);
        continue;
      }

      console.log(`Collecting ${techKey} sample for scan ${scan.Id} (${scan.Name})`);
      const scanDetails = await service.getScanDetails(scan.Id);
      fs.writeFileSync(path.join(outDir, `sample-${techKey.toLowerCase()}-scan.json`), JSON.stringify(scanDetails, null, 2));

      const issuesResp = await service.listIssues(scan.Id, 'Noise,Fixed,Passed');
      fs.writeFileSync(path.join(outDir, `sample-${techKey.toLowerCase()}-issues.json`), JSON.stringify(issuesResp, null, 2));

      const firstIssueId = issuesResp?.Items?.[0]?.Id;
      if (firstIssueId) {
        try {
          const article = await service.getArticle(firstIssueId);
          const outArticlePath = path.join(outDir, `sample-${techKey.toLowerCase()}-article.html`);
          fs.writeFileSync(outArticlePath, typeof article === 'string' ? article : JSON.stringify(article, null, 2));
        } catch (err) {
          console.warn(`Failed to fetch article for issue ${firstIssueId}: ${err.message}`);
        }
      } else {
        console.log(`No issues for ${techKey} scan ${scan.Id}, skipping article fetch.`);
      }
    }

    console.log('Collection complete.');
  } catch (error) {
    console.error('Error collecting samples:', error.message || error);
    process.exit(1);
  }
})();
