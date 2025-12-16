import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';

export async function getIssueComments(issueId, options) {
  try {
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();
    const service = new AppScanService(config);

    console.error(chalk.blue('Authenticating...'));
    await service.authenticate();

    console.error(chalk.blue(`Fetching comments for issue ${issueId}...`));

    const response = await service.api.v4.Issues_GetIssueComments(issueId, {});
    const comments = response.Items || [];

    if (options.json) {
      console.log(JSON.stringify(comments, null, 2));
    } else {
      console.error(chalk.green(`\nFound ${comments.length} comment(s):\n`));

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
