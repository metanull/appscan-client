import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

function normalizeScanType(tech) {
  const lower = (tech || '').toLowerCase();
  if (lower.includes('static')) return 'SAST';
  if (lower.includes('dynamic') || lower.includes('dast')) return 'DAST';
  if (lower.includes('sca')) return 'SCA';
  return 'Other';
}

function isInYear(dateStr, year) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year;
}

export async function generateYearlySummary(year, options) {
  const config = options.config
    ? Config.loadFromFile(options.config)
    : new Config();
  const service = new AppScanService(config);
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  if (Number.isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
    throw new Error(`Invalid year: ${year}`);
  }

  console.error(chalk.blue('Authenticating...'));
  await service.authenticate();

  console.error(chalk.blue(`Fetching data for year ${targetYear}...`));
  const applicationsResponse = await service.listApplications();
  const applications = applicationsResponse.Items || [];

  const summary = {
    year: targetYear,
    totalApps: 0,
    totalScans: 0,
    totalIssues: 0,
    scansByType: { SAST: 0, DAST: 0, SCA: 0, Other: 0 },
    issuesByApp: {},
    issuesByType: { SAST: 0, DAST: 0, SCA: 0, Other: 0 },
    issuesBySeverity: {},
    scans: [],
  };

  for (const app of applications) {
    const scansResponse = await service.listScans(app.Id);
    const scans = scansResponse.Items || [];

    for (const scan of scans) {
      const createdAt = scan.CreatedAt || scan.Created;
      if (!isInYear(createdAt, targetYear)) {
        continue;
      }

      const scanType = normalizeScanType(
        scan.Technology || scan.ScanType || scan.ScanTechnology
      );
      summary.totalScans += 1;
      summary.scansByType[scanType] += 1;

      const appName = app.Name || 'Unknown';
      if (!summary.issuesByApp[appName]) {
        summary.issuesByApp[appName] = {
          SAST: 0,
          DAST: 0,
          SCA: 0,
          Other: 0,
          total: 0,
        };
      }

      console.error(
        chalk.gray(
          `  Processing scan: ${scan.Name || scan.Id} (${scanType}) for ${appName}`
        )
      );

      const issuesResponse = await service.listIssues(scan.Id, 'Noise');
      const issues = issuesResponse.Items || [];

      summary.totalIssues += issues.length;
      summary.issuesByType[scanType] += issues.length;
      summary.issuesByApp[appName][scanType] += issues.length;
      summary.issuesByApp[appName].total += issues.length;

      issues.forEach((issue) => {
        const severity = issue.Severity || 'Unknown';
        summary.issuesBySeverity[severity] =
          (summary.issuesBySeverity[severity] || 0) + 1;
      });

      summary.scans.push({
        appName,
        scanName: scan.Name || 'Unknown',
        scanType,
        createdAt,
        issueCount: issues.length,
      });
    }
  }

  summary.totalApps = applications.length;

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    printSummary(summary);
  }
}

function printSummary(summary) {
  console.log(
    chalk.bold.cyan(`\n=== AppScan Yearly Summary (${summary.year}) ===\n`)
  );

  console.log(chalk.bold('Overview:'));
  console.log(`  Total Applications: ${summary.totalApps}`);
  console.log(`  Total Scans: ${summary.totalScans}`);
  console.log(`  Total Issues (excl. Noise): ${summary.totalIssues}\n`);

  console.log(chalk.bold('Scans by Type:'));
  Object.entries(summary.scansByType)
    .filter(([, count]) => count > 0)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  console.log(chalk.bold('\nIssues by Scan Type:'));
  Object.entries(summary.issuesByType)
    .filter(([, count]) => count > 0)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  if (Object.keys(summary.issuesBySeverity).length > 0) {
    console.log(chalk.bold('\nIssues by Severity:'));
    const severityOrder = [
      'Critical',
      'High',
      'Medium',
      'Low',
      'Informational',
    ];
    severityOrder.forEach((severity) => {
      if (summary.issuesBySeverity[severity]) {
        console.log(`  ${severity}: ${summary.issuesBySeverity[severity]}`);
      }
    });
    Object.entries(summary.issuesBySeverity)
      .filter(([sev]) => !severityOrder.includes(sev))
      .forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`);
      });
  }

  console.log(chalk.bold('\nIssues by Application and Scan Type:\n'));
  const sortedApps = Object.entries(summary.issuesByApp).sort(
    (a, b) => b[1].total - a[1].total
  );
  sortedApps.forEach(([appName, counts]) => {
    console.log(chalk.bold(`  ${appName}`) + ` (Total: ${counts.total})`);
    ['SAST', 'DAST', 'SCA', 'Other'].forEach((type) => {
      if (counts[type] > 0) {
        console.log(`    ${type}: ${counts[type]}`);
      }
    });
  });

  if (summary.scans.length > 0) {
    console.log(chalk.bold(`\nRecent Scans (${summary.scans.length}):\n`));
    summary.scans
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .forEach((scan) => {
        const date = new Date(scan.createdAt).toLocaleDateString();
        console.log(
          `  ${date} | ${scan.appName} | ${scan.scanName} (${scan.scanType}) | ${scan.issueCount} issues`
        );
      });
    if (summary.scans.length > 10) {
      console.log(chalk.gray(`  ... and ${summary.scans.length - 10} more`));
    }
  }

  console.log('');
}

export default generateYearlySummary;
