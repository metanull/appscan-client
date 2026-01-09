import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import TurndownService from 'turndown';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get remediation article for a specific issue converted to Markdown format
 * @param {string} issueId - Issue ID to retrieve article for
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {string} [options.output] - Output file path (prints to console if not specified)
 * @param {string} [options.language] - Programming language for article
 * @param {string} [options.api] - API framework for article
 * @param {string} [options.cveId] - CVE ID for article
 * @param {string} [options.nl] - Natural language for article
 * @param {string} [options.mode='light'] - Display mode: light or dark
 * @param {boolean} [options.enableTrainingLinks] - Include training links in article
 */
export async function getArticleMarkdown(issueId, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    cliOutput.status(`Fetching remediation article for issue: ${issueId}...`);

    const articleOptions = {
      language: options.language,
      api: options.api,
      cveId: options.cveId,
      nl: options.nl,
      mode: options.mode || 'light',
      enableTrainingLinks: options.enableTrainingLinks,
    };

    const articleHtml = await service.getArticle(issueId, articleOptions);

    cliOutput.status('Converting HTML to Markdown...\n');

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

    const markdown = turndownService.turndown(articleHtml);

    if (!options.output) {
      cliOutput.result('='.repeat(80));
      cliOutput.result(markdown);
      cliOutput.result('='.repeat(80));
    } else {
      fs.writeFileSync(options.output, markdown);
      cliOutput.success(`Markdown saved to: ${options.output}`);
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default getArticleMarkdown;
