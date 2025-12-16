import chalk from 'chalk';
import { AppScanService } from '../services/appscan-service.js';
import { Config } from '../utils/config.js';

export async function connectionCheck(options) {
  try {
    console.log(chalk.blue.bold('\n🔍 AppScan Connection Check\n'));

    // Load configuration
    const config = options.config
      ? Config.loadFromFile(options.config)
      : new Config();

    // Check if configuration exists
    console.log(chalk.cyan('📋 Configuration Status:'));

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

    console.log(`  API Key:     ${apiKeyStatus}`);
    console.log(`  API Secret:  ${apiSecretStatus}`);
    console.log(`  Base URL:    ${baseUrlStatus}`);

    if (!config.isValid()) {
      console.log(chalk.red.bold('\n❌ Configuration incomplete!\n'));
      console.log(
        chalk.yellow('Please run:'),
        chalk.cyan('appscan setup'),
        chalk.yellow('to configure your credentials.\n')
      );
      process.exit(1);
    }

    // Test JIRA configuration if present
    console.log(chalk.cyan('\n🎫 JIRA Configuration:'));

    if (config.isJiraValid()) {
      console.log(`  Host:        ${chalk.green('✓')} ${config.getJiraHost()}`);
      console.log(
        `  Email:       ${chalk.green('✓')} ${config.getJiraEmail()}`
      );
      console.log(`  API Token:   ${chalk.green('✓ Set')}`);
      console.log(
        `  Project Key: ${config.getJiraProjectKey() ? chalk.green('✓') + ' ' + config.getJiraProjectKey() : chalk.yellow('⚠ Not set')}`
      );
    } else {
      console.log(chalk.gray('  Not configured (optional)'));
    }

    // Test AppScan API connection
    console.log(chalk.cyan('\n🔐 Testing AppScan API Connection...\n'));

    const service = new AppScanService(config);

    try {
      // Authenticate
      console.log(chalk.gray('  → Authenticating...'));
      await service.authenticate();
      console.log(chalk.green('  ✓ Authentication successful'));

      // Test API access by listing applications
      console.log(chalk.gray('  → Testing API access...'));
      const apps = await service.listApplications();
      console.log(
        chalk.green(
          `  ✓ API access confirmed (${apps.Items?.length || 0} applications found)`
        )
      );

      // Display sample of applications
      if (apps.Items && apps.Items.length > 0) {
        console.log(chalk.cyan('\n📱 Sample Applications:'));
        apps.Items.slice(0, 3).forEach((app) => {
          console.log(chalk.white(`  • ${app.Name || app.Id}`));
        });
        if (apps.Items.length > 3) {
          console.log(chalk.gray(`  ... and ${apps.Items.length - 3} more`));
        }
      }

      console.log(chalk.green.bold('\n✅ Connection check passed!\n'));
      console.log(chalk.cyan('You can now use:'));
      console.log(
        chalk.white('  •'),
        chalk.yellow('appscan triage'),
        chalk.white('- Start triaging vulnerabilities')
      );
      console.log(
        chalk.white('  •'),
        chalk.yellow('appscan scans'),
        chalk.white('- List all scans')
      );
      console.log(
        chalk.white('  •'),
        chalk.yellow('appscan apps'),
        chalk.white('- List all applications\n')
      );
    } catch (error) {
      console.log(chalk.red.bold('\n❌ Connection check failed!\n'));
      console.log(chalk.red(`Error: ${error.message}\n`));

      console.log(chalk.yellow('Troubleshooting tips:'));
      console.log(chalk.white('  1. Verify your API credentials are correct'));
      console.log(chalk.white('  2. Check that your API key has not expired'));
      console.log(
        chalk.white('  3. Ensure you have network access to'),
        chalk.cyan(config.getBaseUrl())
      );
      console.log(
        chalk.white('  4. Run'),
        chalk.cyan('appscan setup'),
        chalk.white('to reconfigure\n')
      );

      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}

export default connectionCheck;
