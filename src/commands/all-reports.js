import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import { MarkdownReportGenerator } from '../reports/markdown-report.js';
import { HtmlReportGenerator } from '../reports/html-report.js';

const DEFAULT_OUTPUT_DIR = './reports';

// Simple single-line status helper to reduce verbosity
function writeStatus(msg) {
  try {
    process.stderr.write(`\r${msg}`);
  } catch (e) {
    console.error(msg);
  }
}

function clearStatusLine() {
  try {
    process.stderr.write('\r\x1b[K');
  } catch (e) {}
}

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
  if (!value) {
    return 'unknown-date';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown-date';
  }
  return date.toISOString().replace(/:/g, '-');
}

export async function generateAllReports(options) {
  const config = options.config
    ? Config.loadFromFile(options.config)
    : new Config();
  const service = new AppScanService(config);
  const format = options.html ? 'html' : 'markdown';
  const reportConfig = { grouped: options.grouped !== false, columns: options.columns };
  const excludeStatus = options.excludeStatus ?? 'Noise';
  const technologyFilter = normalizeTechnologyFilter(options.technology);
  const markdownGenerator = new MarkdownReportGenerator();
  const htmlGenerator = new HtmlReportGenerator();
  const outDir = path.resolve(options.outdir || DEFAULT_OUTPUT_DIR);
  writeStatus('Authenticating...');
  await service.authenticate();
  writeStatus('Authenticated');

  ensureEmptyDirectory(outDir);

  writeStatus('Fetching applications...');
  const applicationsResponse = await service.listApplications();
  const applications = applicationsResponse.Items || [];

  let reportCount = 0;
  const reportIndex = [];

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

      const scanName = scan.Name || 'Unknown Scan';
      const scanMeta = {
        appId: scan.ApplicationId ?? scan.AppId ?? app.Id ?? 'unknown-app',
        id: scan.Id ?? scan.ScanId ?? 'unknown-scan',
        technology: scanTechnology,
        appName:
          scan.Application?.Name ||
          scan.ApplicationName ||
          scan.AppName ||
          app.Name ||
          'unknown-app',
      };

      writeStatus(`Generating report for scan ${scanName} (${scanTechnology})...`);

      const issuesResponse = await service.listIssues(scan.Id, excludeStatus);
      let issues = issuesResponse.Items || [];

      // Filter by minimum severity if specified
      const minSeverity = parseInt(options.minSeverity || '3', 10);
      if (!Number.isNaN(minSeverity)) {
        issues = issues.filter((issue) => {
          const severityValue = issue.SeverityValue ?? 0;
          return severityValue >= minSeverity;
        });
      }

      if ((issues || []).length === 0) {
        clearStatusLine();
        console.warn(
          `Warning: no issues found for scan ${scanName} (app: ${scanMeta.appName}) with current filters` +
            (excludeStatus ? ` (excluded status: ${excludeStatus})` : '') +
            (options.minSeverity ? ` (minSeverity: ${options.minSeverity})` : '')
        );
        continue;
      }

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
      const timestamp = formatTimestamp(scan.CreatedAt);
      const fileName = `${sanitizeFileName(prefix)}-${timestamp}.${format === 'html' ? 'html' : 'md'}`;
      const outputPath = path.join(outDir, fileName);

      clearStatusLine();
      fs.writeFileSync(outputPath, reportContent, 'utf-8');
      console.error(chalk.green(`Report saved: ${outputPath}`));
      reportCount += 1;

      reportIndex.push({
        fileName,
        appName: scanMeta.appName,
        technology: scanTechnology,
        scanName,
        timestamp: scan.CreatedAt || 'unknown-date',
      });
    }
  }

  // Generate index.md
  if (reportIndex.length > 0) {
    let indexContent = '# AppScan Reports Index\n\n';
    indexContent += `Generated: ${new Date().toISOString()}\n\n`;
    indexContent += '## Reports\n\n';
    indexContent += '| Application | Technology | Scan | Created | Link |\n';
    indexContent += '|-------------|------------|------|---------|------|\n';
    reportIndex.forEach((entry) => {
      const timestamp = entry.timestamp !== 'unknown-date'
        ? new Date(entry.timestamp).toLocaleString()
        : 'unknown-date';
      indexContent += `| ${entry.appName} | ${entry.technology} | ${entry.scanName} | ${timestamp} | [View](./${entry.fileName}) |\n`;
    });
    const indexPath = path.join(outDir, 'index.md');
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    console.error(chalk.green(`Index created: ${indexPath}`));
  }

  clearStatusLine();
  console.error(chalk.green(`Generated ${reportCount} report(s) in ${outDir}`));
}

export default generateAllReports;
