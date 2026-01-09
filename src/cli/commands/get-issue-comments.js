import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get all comments for a specific issue
 * @param {string} issueId - Issue ID to retrieve comments for
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function getIssueComments(issueId, options) {
  try {
    cliOutput.setJsonMode(options.json);
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    cliOutput.status('Authenticating...');
    await service.authenticate();

    cliOutput.status(`Fetching comments for issue ${issueId}...`);

    const response = await service.api.v4.Issues_GetIssueComments(issueId, {});
    const comments = response.Items || [];

    if (options.json) {
      cliOutput.json(comments);
    } else {
      cliOutput.success(`\nFound ${comments.length} comment(s):\n`);

      if (comments.length === 0) {
        console.log('No comments found for this issue.');
      } else {
        comments.forEach((comment, index) => {
          console.log(chalk.bold(`Comment ${index + 1}:`));
          console.log(`  ID: ${comment.Id || 'N/A'}`);
          console.log(`  Author: ${comment.Author || 'N/A'}`);
          console.log(`  Created: ${comment.CreatedAt || 'N/A'}`);
          console.log(`  Modified: ${comment.ModifiedAt || 'N/A'}`);
          console.log(`  Source Type: ${comment.SourceType || 'N/A'}`);
          console.log(`  Comment: ${comment.Comment || 'N/A'}`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

export default getIssueComments;
