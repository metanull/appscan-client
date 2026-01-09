import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import TurndownService from 'turndown';
import cliOutput from '../../utils/cli-output.js';

/**
 * Generate HTML report from AppScan and convert to Markdown format
 * @param {string} type - Report type: Scan, Application, or ScanExecution
 * @param {string} id - Resource ID for the report
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {string} [options.output] - Output file path (prints to console if not specified)
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
export async function generateMarkdownReport(type, id, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    const validTypes = ['Scan', 'Application', 'ScanExecution'];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`
      );
    }

    cliOutput.status(`Generating HTML report for ${type}: ${id}...`);
    cliOutput.status('This may take a few minutes...\n');

    let odataFilter = options.odataFilter || '';
    if (options.openOnly) {
      odataFilter = "Status eq 'Open'";
    }

    const reportOptions = {
      format: 'Html',
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

    cliOutput.success(
      `HTML report generated successfully (ID: ${result.reportId})`
    );
    cliOutput.status('Converting to Markdown...\n');

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });

    turndownService.addRule('removeStyles', {
      filter: ['style', 'script'],
      replacement: () => '',
    });

    const markdown = turndownService.turndown(result.content);

    console.log('='.repeat(80));
    console.log(markdown);
    console.log('='.repeat(80));

    if (options.output) {
      const fs = await import('fs');
      fs.writeFileSync(options.output, markdown);
      console.log(`\nMarkdown saved to: ${options.output}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default generateMarkdownReport;
