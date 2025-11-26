import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import { MarkdownReportGenerator } from '../reports/markdown-report.js';
import { HtmlReportGenerator } from '../reports/html-report.js';
import fs from 'fs';
import path from 'path';

export async function generateReport(type, id, options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

    let report = '';
    const format = options.format || 'markdown';
    const markdownGenerator = new MarkdownReportGenerator();
    const htmlGenerator = new HtmlReportGenerator();

    switch (type) {
      case 'applications': {
        console.error(chalk.blue('Fetching applications...'));
        const response = await service.listApplications();
        const applications = response.Items || [];
        report =
          format === 'html'
            ? htmlGenerator.generateApplicationsReport(applications)
            : markdownGenerator.generateApplicationsReport(applications);
        break;
      }
      case 'scans': {
        console.error(chalk.blue(`Fetching scans for application ${id}...`));
        const response = await service.listScans(id);
        const scans = response.Items || [];
        const appDetailsResponse = await service.getApplicationDetails(id);
        const appName =
          appDetailsResponse.Items?.[0]?.Name || 'Unknown Application';
        report =
          format === 'html'
            ? htmlGenerator.generateScansReport(scans, appName)
            : markdownGenerator.generateScansReport(scans, appName);
        break;
      }
      case 'issues': {
        // Handle exclude-status option
        const excludeStatus =
          options.excludeStatus !== undefined ? options.excludeStatus : 'Noise';

        if (excludeStatus) {
          console.error(
            chalk.blue(
              `Fetching issues for scan ${id} (excluding status: ${excludeStatus})...`
            )
          );
        } else {
          console.error(chalk.blue(`Fetching issues for scan ${id}...`));
        }

        const response = await service.listIssues(id, excludeStatus);
        const issues = response.Items || [];
        const scanDetailsResponse = await service.getScanDetails(id);
        const scanName = scanDetailsResponse.Items?.[0]?.Name || 'Unknown Scan';
        report =
          format === 'html'
            ? htmlGenerator.generateIssuesReport(issues, scanName)
            : markdownGenerator.generateIssuesReport(issues, scanName);
        break;
      }
      case 'executions': {
        console.error(chalk.blue(`Fetching executions for scan ${id}...`));
        const response = await service.listScanExecutions(id);
        const executions = response.Items || [];
        const scanDetailsResponse = await service.getScanDetails(id);
        const scanName = scanDetailsResponse.Items?.[0]?.Name || 'Unknown Scan';
        report =
          format === 'html'
            ? htmlGenerator.generateScanExecutionsReport(executions, scanName)
            : markdownGenerator.generateScanExecutionsReport(
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
      console.error(chalk.green(`Report saved to: ${outputPath}`));
    } else {
      console.log(report);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

export default generateReport;
