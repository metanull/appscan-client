import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import fs from 'fs';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get detailed information for a specific issue in HTML or XML format
 * @param {string} issueId - Issue ID to retrieve details for
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 * @param {string} [options.locale='en-US'] - Locale for issue details
 * @param {string} [options.format='html'] - Output format: html or xml
 * @param {string} [options.output] - Output file path (prints to console if not specified)
 */
export async function getIssueDetails(issueId, options) {
  try {
    const config = new Config(options.config);
    const service = new AppScanService(config);

    const locale = options.locale || 'en-US';
    const format = options.format || 'html';

    if (!['html', 'xml'].includes(format.toLowerCase())) {
      throw new Error('Format must be either "html" or "xml"');
    }

    const issueDetails = await service.getIssueDetails(issueId, locale, format);

    if (options.output) {
      fs.writeFileSync(options.output, issueDetails);
      cliOutput.success(`Issue details saved to: ${options.output}`);
    } else {
      cliOutput.result(issueDetails);
    }
  } catch (error) {
    cliOutput.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default getIssueDetails;
