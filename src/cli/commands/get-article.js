import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get remediation article for a specific issue in HTML format
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
 * @param {boolean} [options.debug] - Enable debug output
 */
export async function getArticle(issueId, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    cliOutput.status(`Fetching issue details for: ${issueId}...`);

    await service.ensureAuthenticated();
    const issue = await service.api.v4.Issues_GetIssue(issueId, {});

    if (options.debug) {
      cliOutput.status('Issue fields available:');
      cliOutput.status(`  IssueTypeId: ${issue.IssueTypeId}`);
      cliOutput.status(`  IssueType: ${issue.IssueType}`);
      cliOutput.status(`  Language: ${issue.Language}`);
      cliOutput.status(`  Api: ${issue.Api}`);
      cliOutput.status(`  CveId: ${issue.CveId}`);
    }

    cliOutput.status(`Fetching remediation article...`);

    const articleOptions = {
      language: options.language,
      api: options.api,
      cveId: options.cveId,
      nl: options.nl,
      mode: options.mode || 'light',
      enableTrainingLinks: options.enableTrainingLinks,
    };

    const articleHtml = await service.getArticle(issueId, articleOptions);

    if (options.output) {
      fs.writeFileSync(options.output, articleHtml);
      cliOutput.success(`Article saved to: ${options.output}`);
    } else {
      cliOutput.result(articleHtml);
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    if (options.debug && error.response) {
      cliOutput.error('Response data: ' + JSON.stringify(error.response.data));
    }
    process.exit(1);
  }
}

export default getArticle;
