import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import TurndownService from 'turndown';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

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

    const markdown = turndownService.turndown(articleHtml);

    // Output to console
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
