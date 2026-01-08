import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import TurndownService from 'turndown';
import cliOutput from '../../utils/cli-output.js';

export async function generateMarkdownReport(type, id, options) {
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

    cliOutput.status(`Generating HTML report for ${type}: ${id}...`);
    cliOutput.status('This may take a few minutes...\n');

    // Build OData filter for Status = 'Open' if requested
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

    // Convert HTML to Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });

    // Add custom rules for better conversion
    turndownService.addRule('removeStyles', {
      filter: ['style', 'script'],
      replacement: () => '',
    });

    const markdown = turndownService.turndown(result.content);

    // Output to console
    console.log('='.repeat(80));
    console.log(markdown);
    console.log('='.repeat(80));

    // Optionally save to file
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
