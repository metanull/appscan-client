import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';
import fs from 'fs';

export async function getArticle(issueId, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    console.error(`Fetching issue details for: ${issueId}...`);

    // Get issue first to show what fields are available
    await service.ensureAuthenticated();
    const issue = await service.api.v4.Issues_GetIssue(issueId, {});

    if (options.debug) {
      console.error('Issue fields available:');
      console.error(`  IssueTypeId: ${issue.IssueTypeId}`);
      console.error(`  IssueType: ${issue.IssueType}`);
      console.error(`  Language: ${issue.Language}`);
      console.error(`  Api: ${issue.Api}`);
      console.error(`  CveId: ${issue.CveId}`);
    }

    console.error(`Fetching remediation article...`);

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
      console.error(`Article saved to: ${options.output}`);
    } else {
      console.log(articleHtml);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (options.debug && error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

export default getArticle;
