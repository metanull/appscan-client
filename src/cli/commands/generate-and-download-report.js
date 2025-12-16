import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import fs from 'fs';

export async function generateAndDownloadReport(type, id, options) {
  try {
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

    console.log(`Generating ${format} report for ${type}: ${id}...`);

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

    console.log(`Report generated successfully (ID: ${result.reportId})`);

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
    console.log(`Report saved to: ${outputPath}`);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            reportId: result.reportId,
            status: result.report.Status,
            outputPath,
          },
          null,
          2
        )
      );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default generateAndDownloadReport;
