import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

export async function getIssueDetails(issueId, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    const locale = options.locale || 'en-US';
    const format = options.format || 'html';

    // Validate format
    if (!['html', 'xml'].includes(format.toLowerCase())) {
      throw new Error('Format must be either "html" or "xml"');
    }

    const issueDetails = await service.getIssueDetails(issueId, locale, format);

    // If output file is specified, write to file
    if (options.output) {
      fs.writeFileSync(options.output, issueDetails);
      cliOutput.success(`Issue details saved to: ${options.output}`);
    } else {
      // Output to console
      cliOutput.result(issueDetails);
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default getIssueDetails;
