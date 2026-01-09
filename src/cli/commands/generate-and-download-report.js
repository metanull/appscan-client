import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

/**
 * Generate and download a report from AppScan
 * @param {string} type - Report type: Scan, Application, or ScanExecution
 * @param {string} id - Resource ID for the report
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output metadata in JSON format
 * @param {string} [options.format='Html'] - Report format: Html, Pdf, SARIF, Xml, Csv
 * @param {string} [options.output] - Output file path (auto-generated if not specified)
 * @param {string} [options.title] - Report title
 * @param {string} [options.notes] - Report notes
 * @param {string} [options.locale='en-US'] - Report locale
 * @param {string} [options.odataFilter] - OData filter for issues
 * @param {boolean} [options.openOnly] - Include only open issues
 * @param {boolean} [options.summary] - Include summary section
 * @param {boolean} [options.details] - Include details section
 * @param {boolean} [options.discussion] - Include discussion section
 * @param {boolean} [options.overview] - Include overview section
 * @param {boolean} [options.tableOfContent] - Include table of contents
 * @param {boolean} [options.history] - Include history section
 * @param {boolean} [options.coverage] - Include coverage section
 * @param {boolean} [options.minimizeDetails] - Minimize details section
 * @param {boolean} [options.articles] - Include remediation articles
 * @param {number} [options.maxRetries=60] - Maximum retries for report generation
 * @param {number} [options.retryDelay=5000] - Delay between retries in milliseconds
 */
export async function generateAndDownloadReport(type, id, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const config = new Config(options.config);
    const service = new AppScanService(config);

    // Validate type
    const validTypes = ['Scan', 'Application', 'ScanExecution'];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`
      );
    }

    // Validate format
    const validFormats = ['Html', 'Pdf', 'SARIF', 'Xml', 'Csv'];
    const format = options.format || 'Html';
    if (!validFormats.includes(format)) {
      throw new Error(
        `Invalid format: ${format}. Must be one of: ${validFormats.join(', ')}`
      );
    }

    cliOutput.status(`Generating ${format} report for ${type}: ${id}...`);

    // Build OData filter for Status = 'Open' if requested
    let odataFilter = options.odataFilter || '';
    if (options.openOnly) {
      odataFilter = "Status eq 'Open'";
    }

    const reportOptions = {
      format,
      title: options.title,
      notes: options.notes,
      locale: options.locale || 'en-US',
      odataFilter,
      summary: options.summary,
      details: options.details,
      discussion: options.discussion,
      overview: options.overview,
      tableOfContent: options.tableOfContent,
      history: options.history,
      coverage: options.coverage,
      minimizeDetails: options.minimizeDetails,
      articles: options.articles,
      maxRetries: options.maxRetries || 60,
      retryDelay: options.retryDelay || 5000,
    };

    const result = await service.generateAndDownloadReport(
      type,
      id,
      reportOptions
    );

    cliOutput.success(`Report generated successfully (ID: ${result.reportId})`);

    // Determine file extension based on format
    const extensions = {
      Html: 'html',
      Pdf: 'pdf',
      SARIF: 'sarif',
      Xml: 'xml',
      Csv: 'csv',
    };
    const extension = extensions[format] || 'txt';

    // Save to file
    const outputPath =
      options.output || `report-${result.reportId}.${extension}`;
    fs.writeFileSync(outputPath, result.content);
    cliOutput.success(`Report saved to: ${outputPath}`);

    if (options.json) {
      cliOutput.json({
        reportId: result.reportId,
        status: result.report.Status,
        outputPath,
      });
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default generateAndDownloadReport;
