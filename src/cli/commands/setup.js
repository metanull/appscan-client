import { input, confirm, password } from '@inquirer/prompts';
import chalk from 'chalk';
import { writeFileSync, existsSync } from 'fs';
import { getEnvPath } from '../../utils/config-paths.js';

export async function setup(options) {
  try {
    console.log(chalk.blue.bold('\n🔧 AppScan Client Setup\n'));
    console.log(
      chalk.gray('This wizard will help you configure your .env file.\n')
    );

    // Check if .env already exists
    const envPath = getEnvPath();
    if (existsSync(envPath) && !options.force) {
      const overwrite = await confirm({
        message: '.env file already exists. Do you want to overwrite it?',
        default: false,
      });

      if (!overwrite) {
        console.log(
          chalk.yellow(
            '\n⚠️  Setup cancelled. Use --force to skip this prompt.\n'
          )
        );
        return;
      }
    }

    // AppScan Configuration
    console.log(chalk.cyan.bold('\n📡 AppScan API Configuration\n'));

    const apiKey = await input({
      message: 'Enter your AppScan API Key:',
      required: true,
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'API Key is required';
        }
        return true;
      },
    });

    const apiSecret = await password({
      message: 'Enter your AppScan API Secret:',
      required: true,
      mask: '*',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'API Secret is required';
        }
        return true;
      },
    });

    const baseUrl = await input({
      message: 'Enter AppScan Base URL:',
      default: 'https://cloud.appscan.com',
    });

    // JIRA Configuration (optional)
    console.log(chalk.cyan.bold('\n🎫 JIRA Configuration (Optional)\n'));
    console.log(
      chalk.gray(
        'Configure JIRA to create issues from vulnerability reports.\n'
      )
    );

    const configureJira = await confirm({
      message: 'Do you want to configure JIRA integration?',
      default: false,
    });

    let jiraHost = '';
    let jiraEmail = '';
    let jiraApiToken = '';
    let jiraProjectKey = '';

    if (configureJira) {
      jiraHost = await input({
        message:
          'Enter your JIRA Host (e.g., https://yourcompany.atlassian.net):',
        validate: (value) => {
          if (value && !value.startsWith('http')) {
            return 'JIRA Host must start with http:// or https://';
          }
          return true;
        },
      });

      jiraEmail = await input({
        message: 'Enter your JIRA Email:',
        validate: (value) => {
          if (value && !value.includes('@')) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      });

      jiraApiToken = await password({
        message: 'Enter your JIRA API Token:',
        mask: '*',
      });

      jiraProjectKey = await input({
        message: 'Enter your JIRA Project Key (e.g., SEC):',
      });
    }

    // Confluence OWASP ASVS Configuration (optional)
    console.log(
      chalk.cyan.bold('\n📚 Confluence OWASP ASVS Configuration (Optional)\n')
    );
    console.log(
      chalk.gray(
        'Configure links to your Confluence OWASP ASVS documentation.\n'
      )
    );

    const configureConfluence = await confirm({
      message: 'Do you want to configure Confluence OWASP ASVS links?',
      default: false,
    });

    let confluenceBaseUrl = '';

    if (configureConfluence) {
      confluenceBaseUrl = await input({
        message: 'Enter your Confluence OWASP ASVS Base URL:',
        default: '',
      });
    }

    // Create .env content
    const envContent = `# AppScan API Configuration
APPSCAN_API_KEY=${apiKey}
APPSCAN_API_SECRET=${apiSecret}
APPSCAN_BASE_URL=${baseUrl}

# JIRA Configuration (optional)
${jiraHost ? `JIRA_HOST=${jiraHost}` : '# JIRA_HOST=https://yourcompany.atlassian.net'}
${jiraEmail ? `JIRA_EMAIL=${jiraEmail}` : '# JIRA_EMAIL=your-email@company.com'}
${jiraApiToken ? `JIRA_API_TOKEN=${jiraApiToken}` : '# JIRA_API_TOKEN=your-api-token'}
${jiraProjectKey ? `JIRA_PROJECT_KEY=${jiraProjectKey}` : '# JIRA_PROJECT_KEY=SEC'}

# Confluence Configuration (optional)
${confluenceBaseUrl ? `CONFLUENCE_OWASP_ASVS_URL=${confluenceBaseUrl}` : '# CONFLUENCE_OWASP_ASVS_URL=https://confluence.company.com/display/SEC/OWASP-ASVS'}
`;

    // Write .env file
    writeFileSync(envPath, envContent, 'utf8');

    console.log(chalk.green.bold('\n✅ Setup complete!\n'));
    console.log(chalk.gray(`Configuration saved to: ${envPath}\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(
      chalk.white('  1. Run'),
      chalk.yellow('appscan connection-check'),
      chalk.white('to verify your setup')
    );
    console.log(
      chalk.white('  2. Run'),
      chalk.yellow('appscan triage'),
      chalk.white('to start triaging vulnerabilities\n')
    );
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log(chalk.yellow('\n⚠️  Setup cancelled by user.\n'));
      process.exit(0);
    }
    console.error(chalk.red(`\n❌ Error during setup: ${error.message}\n`));
    process.exit(1);
  }
}

export default setup;
