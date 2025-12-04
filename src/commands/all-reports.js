import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import { MarkdownReportGenerator } from '../reports/markdown-report.js';
import { HtmlReportGenerator } from '../reports/html-report.js';

const DEFAULT_OUTPUT_DIR = './reports';

function normalizeTechnologyFilter(value) {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

function ensureEmptyDirectory(outDir) {
  if (fs.existsSync(outDir)) {
    const stat = fs.statSync(outDir);
    if (!stat.isDirectory()) {
      throw new Error(`Output path ${outDir} exists but is not a directory`);
    }
    if (fs.readdirSync(outDir).length > 0) {
      throw new Error(`Output directory ${outDir} already exists and is not empty`);
    }
  } else {
    fs.mkdirSync(outDir, { recursive: true });
  }
}

function sanitizeFileName(value) {
  if (!value) {
    return 'report';
  }
  return value
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 255);
}

function formatTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().replace(/:/g, '-');
  }
  return date.toISOString().replace(/:/g, '-');
}

export async function generateAllReports(options) {
  const config = options.config
    ? Config.loadFromFile(options.config)
    : new Config();
  const service = new AppScanService(config);
  const format = options.html ? 'html' : 'markdown';
  const reportConfig = { grouped: options.grouped ?? false };
  const excludeStatus = options.excludeStatus ?? 'Noise';
  const technologyFilter = normalizeTechnologyFilter(options.technology);
  const markdownGenerator = new MarkdownReportGenerator();
  const htmlGenerator = new HtmlReportGenerator();
  const outDir = path.resolve(options.outdir || DEFAULT_OUTPUT_DIR);

  console.error(chalk.blue('Authenticating...'));
  await service.authenticate();

  ensureEmptyDirectory(outDir);

  console.error(chalk.blue('Fetching applications...'));
  const applicationsResponse = await service.listApplications();
  const applications = applicationsResponse.Items || [];

  let reportCount = 0;

  for (const app of applications) {
    const scansResponse = await service.listScans(app.Id);
    const scans = scansResponse.Items || [];

    for (const scan of scans) {
      const scanTechnology =
        scan.Technology || scan.ScanType || scan.ScanTechnology || 'Unknown';
      if (
        technologyFilter.length > 0 &&
        !technologyFilter.includes(scanTechnology.toLowerCase())
      ) {
        continue;
      }

      console.error(
        chalk.blue(`Generating report for scan ${scan.Name || scan.Id} (${scanTechnology})...`)
      );

      const issuesResponse = await service.listIssues(
        scan.Id,
        excludeStatus
      );
      const issues = issuesResponse.Items || [];

      const scanDetailsResponse = await service.getScanDetails(scan.Id);
      const scanDetails = scanDetailsResponse.Items?.[0] || {};
      const scanName = scanDetails.Name || scan.Name || 'Unknown Scan';
      const scanMeta = {
        appId:
          scanDetails.ApplicationId ?? scanDetails.AppId ?? app.Id ?? 'unknown-app',
        id: scanDetails.Id ?? scanDetails.ScanId ?? scan.Id ?? 'unknown-scan',
        technology: scanTechnology,
        appName:
          scanDetails.Application?.Name ||
          scanDetails.ApplicationName ||
          scanDetails.AppName ||
          app.Name ||
          'unknown-app',
      };

      const reportContent =
        format === 'html'
          ? await htmlGenerator.generateIssuesReport(
              issues,
              scanName,
              reportConfig,
              service,
              scanMeta
            )
          : await markdownGenerator.generateIssuesReport(
              issues,
              scanName,
              reportConfig,
              service,
              scanMeta
            );

      const prefix = `${scanMeta.appName || 'app'}-${scanTechnology}-${scanName}`;
      const timestamp = formatTimestamp(scan.CreatedAt || scanDetails.CreatedAt);
      const fileName = `${sanitizeFileName(prefix)}-${timestamp}.${format === 'html' ? 'html' : 'md'}`;
      const outputPath = path.join(outDir, fileName);

      fs.writeFileSync(outputPath, reportContent, 'utf-8');
      console.error(chalk.green(`Report saved: ${outputPath}`));
      reportCount += 1;
    }
  }

  console.error(chalk.green(`Generated ${reportCount} report(s) in ${outDir}`));
}

export default generateAllReports;
