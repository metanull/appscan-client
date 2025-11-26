import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import { MarkdownReportGenerator } from '../reports/markdown-report.js';
import { HtmlReportGenerator } from '../reports/html-report.js';
import fs from 'fs';
import path from 'path';

export async function generateReport(type, id, options) {
  try {
    const config = options.config ? Config.loadFromFile(options.config) : new Config();
    const service = new AppScanService(config);

    console.log('Authenticating...');
    await service.authenticate();

    let report = '';
    const format = options.format || 'markdown';
    const markdownGenerator = new MarkdownReportGenerator();
    const htmlGenerator = new HtmlReportGenerator();

    switch (type) {
      case 'applications': {
        console.log('Fetching applications...');
        const applications = await service.listApplications();
        report =
          format === 'html'
            ? htmlGenerator.generateApplicationsReport(applications)
            : markdownGenerator.generateApplicationsReport(applications);
        break;
      }
      case 'scans': {
        console.log(`Fetching scans for application ${id}...`);
        const scans = await service.listScans(id);
        const appDetails = await service.getApplicationDetails(id);
        report =
          format === 'html'
            ? htmlGenerator.generateScansReport(scans, appDetails.Name)
            : markdownGenerator.generateScansReport(scans, appDetails.Name);
        break;
      }
      case 'issues': {
        console.log(`Fetching issues for scan ${id}...`);
        const issues = await service.listIssues(id);
        const scanDetails = await service.getScanDetails(id);
        report =
          format === 'html'
            ? htmlGenerator.generateIssuesReport(issues, scanDetails.Name)
            : markdownGenerator.generateIssuesReport(issues, scanDetails.Name);
        break;
      }
      case 'executions': {
        console.log(`Fetching executions for scan ${id}...`);
        const executions = await service.listScanExecutions(id);
        const scanDetails = await service.getScanDetails(id);
        report =
          format === 'html'
            ? htmlGenerator.generateScanExecutionsReport(executions, scanDetails.Name)
            : markdownGenerator.generateScanExecutionsReport(executions, scanDetails.Name);
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
      console.log(`Report saved to: ${outputPath}`);
    } else {
      console.log('\n' + report);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default generateReport;
