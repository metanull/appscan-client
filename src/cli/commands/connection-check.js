import chalk from 'chalk';
import { AppScanService } from '../../services/appscan-service.js';
import { Config } from '../../utils/config.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Check AppScan API connection and validate configuration
 * @param {Object} options - CLI options
 * @param {string} [options.config] - Path to config file
 */
export async function connectionCheck(options) {
  try {
    cliOutput.result(chalk.blue.bold('\n🔍 AppScan Connection Check\n'));

    // Load configuration
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();

    // Check if configuration exists
    cliOutput.result(chalk.cyan('📋 Configuration Status:'));

    const hasApiKey = !!config.getApiKey();
    const hasApiSecret = !!config.getApiSecret();

    const apiKeyStatus = hasApiKey
      ? chalk.green('✓ Set')
      : chalk.red('✗ Not set');
    const apiSecretStatus = hasApiSecret
      ? chalk.green('✓ Set')
      : chalk.red('✗ Not set');
    const baseUrlStatus = config.getBaseUrl()
      ? chalk.green(`✓ ${config.getBaseUrl()}`)
      : chalk.yellow('⚠ Using default');

    cliOutput.result(`  API Key:     ${apiKeyStatus}`);
    cliOutput.result(`  API Secret:  ${apiSecretStatus}`);
    cliOutput.result(`  Base URL:    ${baseUrlStatus}`);

    if (!config.isValid()) {
      cliOutput.result(chalk.red.bold('\n❌ Configuration incomplete!\n'));
      cliOutput.result(
        chalk.yellow('Please run: ') +
          chalk.cyan('appscan setup') +
          chalk.yellow(' to configure your credentials.\n')
      );
      process.exit(1);
    }

    // Test JIRA configuration if present
    cliOutput.result(chalk.cyan('\n🎫 JIRA Configuration:'));

    if (config.isJiraValid()) {
      cliOutput.result(
        `  Host:        ${chalk.green('✓')} ${config.getJiraHost()}`
      );
      cliOutput.result(
        `  Email:       ${chalk.green('✓')} ${config.getJiraEmail()}`
      );
      cliOutput.result(`  API Token:   ${chalk.green('✓ Set')}`);
      cliOutput.result(
        `  Project Key: ${config.getJiraProjectKey() ? chalk.green('✓') + ' ' + config.getJiraProjectKey() : chalk.yellow('⚠ Not set')}`
      );
    } else {
      cliOutput.result(chalk.gray('  Not configured (optional)'));
    }

    // Test AppScan API connection
    cliOutput.result(chalk.cyan('\n🔐 Testing AppScan API Connection...\n'));

    const service = new AppScanService(config);

    try {
      // Authenticate
      cliOutput.result(chalk.gray('  → Authenticating...'));
      await service.authenticate();
      cliOutput.result(chalk.green('  ✓ Authentication successful'));

      // Test API access by listing applications
      cliOutput.result(chalk.gray('  → Testing API access...'));
      const apps = await service.listApplications();
      cliOutput.result(
        chalk.green(
          `  ✓ API access confirmed (${apps.Items?.length || 0} applications found)`
        )
      );

      // Display sample of applications
      if (apps.Items && apps.Items.length > 0) {
        cliOutput.result(chalk.cyan('\n📱 Sample Applications:'));
        apps.Items.slice(0, 3).forEach((app) => {
          cliOutput.result(chalk.white(`  • ${app.Name || app.Id}`));
        });
        if (apps.Items.length > 3) {
          cliOutput.result(
            chalk.gray(`  ... and ${apps.Items.length - 3} more`)
          );
        }
      }

      cliOutput.result(chalk.green.bold('\n✅ Connection check passed!\n'));
      cliOutput.result(chalk.cyan('You can now use:'));
      cliOutput.result(
        chalk.white('  • ') +
          chalk.yellow('appscan triage') +
          chalk.white(' - Start triaging vulnerabilities')
      );
      cliOutput.result(
        chalk.white('  • ') +
          chalk.yellow('appscan scans') +
          chalk.white(' - List all scans')
      );
      cliOutput.result(
        chalk.white('  • ') +
          chalk.yellow('appscan apps') +
          chalk.white(' - List all applications\n')
      );
    } catch (error) {
      cliOutput.result(chalk.red.bold('\n❌ Connection check failed!\n'));
      cliOutput.error(`Error: ${error.message}\n`, error);

      cliOutput.result(chalk.yellow('Troubleshooting tips:'));
      cliOutput.result(
        chalk.white('  1. Verify your API credentials are correct')
      );
      cliOutput.result(
        chalk.white('  2. Check that your API key has not expired')
      );
      cliOutput.result(
        chalk.white('  3. Ensure you have network access to ') +
          chalk.cyan(config.getBaseUrl())
      );
      cliOutput.result(
        chalk.white('  4. Run ') +
          chalk.cyan('appscan setup') +
          chalk.white(' to reconfigure\n')
      );

      process.exit(1);
    }
  } catch (error) {
    cliOutput.error(`\n❌ Error: ${error.message}\n`, error);
    process.exit(1);
  }
}

export default connectionCheck;
