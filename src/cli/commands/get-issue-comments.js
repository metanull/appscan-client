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
        cliOutput.status('No comments found for this issue.');
      } else {
        comments.forEach((comment, index) => {
          cliOutput.status(chalk.bold(`Comment ${index + 1}:`));
          cliOutput.status(`  ID: ${comment.Id || 'N/A'}`);
          cliOutput.status(`  Author: ${comment.Author || 'N/A'}`);
          cliOutput.status(`  Created: ${comment.CreatedAt || 'N/A'}`);
          cliOutput.status(`  Modified: ${comment.ModifiedAt || 'N/A'}`);
          cliOutput.status(`  Source Type: ${comment.SourceType || 'N/A'}`);
          cliOutput.status(`  Comment: ${comment.Comment || 'N/A'}`);
          cliOutput.status('');
        });
      }
    }
  } catch (error) {
    cliOutput.error(chalk.red(`Error: ${error.message}`), error);
    process.exit(1);
  }
}

export default getIssueComments;
