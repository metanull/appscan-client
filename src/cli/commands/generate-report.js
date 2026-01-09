import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import { MarkdownReportGenerator } from '../../reports/markdown-report.js';
import { HtmlReportGenerator } from '../../reports/html-report.js';
import fs from 'fs';
import path from 'path';
import cliOutput from '../../utils/cli-output.js';

/**
 * Generate report from AppScan data
 * @param {string} type - Report type: applications, scans, issues, executions
 * @param {string} id - Resource ID (required for scans, issues, executions)
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {string} [options.format='markdown'] - Output format: markdown, html
 * @param {string} [options.output] - Output file path (prints to console if not specified)
 * @param {string} [options.excludeStatus='Noise'] - Comma-separated statuses to exclude (issues only)
 * @param {string} [options.minSeverity='3'] - Minimum severity integer 0-5 (issues only)
 * @param {boolean} [options.grouped] - Apply grouped sorting (issues only)
 * @param {string} [options.columns] - Force columns: sast, dast, sca, all (issues only)
 */
export async function generateReport(type, id, options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    cliOutput.status('Authenticating...');
    await service.authenticate();
    cliOutput.status('Authenticated');

    let report = '';
    const format = options.format || 'markdown';
    const markdownGenerator = new MarkdownReportGenerator();
    const htmlGenerator = new HtmlReportGenerator();

    switch (type) {
      case 'applications': {
        cliOutput.status('Fetching applications...');
        const response = await service.listApplications();
        const applications = response.Items || [];
        report =
          format === 'html'
            ? await htmlGenerator.generateApplicationsReport(applications)
            : await markdownGenerator.generateApplicationsReport(applications);
        break;
      }
      case 'scans': {
        cliOutput.status(`Fetching scans for application ${id}...`);
        const response = await service.listScans(id);
        const scans = response.Items || [];
        const appDetails = await service.getApplicationDetails(id);
        const appName = appDetails?.Name || 'Unknown Application';
        report =
          format === 'html'
            ? await htmlGenerator.generateScansReport(scans, appName)
            : await markdownGenerator.generateScansReport(scans, appName);
        break;
      }
      case 'issues': {
        const excludeStatus =
          options.excludeStatus !== undefined ? options.excludeStatus : 'Noise';
        if (excludeStatus) {
          cliOutput.status(
            `Fetching issues for scan ${id} (excluding status: ${excludeStatus})...`
          );
        } else {
          cliOutput.status(`Fetching issues for scan ${id}...`);
        }

        const response = await service.listIssues(id, excludeStatus);
        let issues = response.Items || [];

        const minSeverity = parseInt(options.minSeverity || '3', 10);
        if (!Number.isNaN(minSeverity)) {
          issues = issues.filter((issue) => {
            const severityValue = issue.SeverityValue ?? 0;
            return severityValue >= minSeverity;
          });
        }

        if ((issues || []).length === 0) {
          cliOutput.warning(
            `Warning: no issues found for scan ${id} with current filters` +
              (excludeStatus ? ` (excluded status: ${excludeStatus})` : '') +
              (options.minSeverity
                ? ` (minSeverity: ${options.minSeverity})`
                : '')
          );
          return;
        }

        const scanDetailsResponse = await service.getScanDetails(id);
        const scanDetails = scanDetailsResponse.Items?.[0] || {};
        const scanName = scanDetails.Name || 'Unknown Scan';
        const scanMeta = {
          appId: scanDetails.ApplicationId ?? scanDetails.AppId,
          id: scanDetails.Id ?? scanDetails.ScanId,
          technology:
            scanDetails.Technology ??
            scanDetails.ScanType ??
            scanDetails.ScanTechnology,
          appName:
            scanDetails.Application?.Name ??
            scanDetails.ApplicationName ??
            scanDetails.AppName,
        };
        const reportConfig = {
          grouped: options.grouped ?? false,
          columns: options.columns,
        };
        const markdownService = reportConfig.grouped ? service : null;
        report =
          format === 'html'
            ? await htmlGenerator.generateIssuesReport(
                issues,
                scanName,
                reportConfig,
                markdownService,
                scanMeta
              )
            : await markdownGenerator.generateIssuesReport(
                issues,
                scanName,
                reportConfig,
                markdownService,
                scanMeta
              );
        break;
      }
      case 'executions': {
        cliOutput.status(`Fetching executions for scan ${id}...`);
        const response = await service.listScanExecutions(id);
        const executions = response.Items || [];
        const scanDetailsResponse = await service.getScanDetails(id);
        const scanName = scanDetailsResponse.Items?.[0]?.Name || 'Unknown Scan';
        report =
          format === 'html'
            ? await htmlGenerator.generateScanExecutionsReport(
                executions,
                scanName
              )
            : await markdownGenerator.generateScanExecutionsReport(
                executions,
                scanName
              );
        break;
      }
      default:
        throw new Error(
          `Unknown report type: ${type}. Valid types are: applications, scans, issues, executions`
        );
    }

    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, report, 'utf-8');
      cliOutput.success(`Report saved to: ${outputPath}`);
    } else {
      cliOutput.result(report);
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default generateReport;
