import { input, confirm, password } from '@inquirer/prompts';
import chalk from 'chalk';
import { writeFileSync, existsSync } from 'fs';
import { getEnvPath } from '../../utils/config-paths.js';

/**
 * Interactive setup wizard to configure AppScan client credentials and integrations
 * @param {Object} options - CLI options
 * @param {boolean} [options.force] - Skip confirmation prompt if .env file exists
 */
export async function setup(options) {
  try {
    console.log(chalk.blue.bold('\n🔧 AppScan Client Setup\n'));
    console.log(
      chalk.gray('This wizard will help you configure your .env file.\n')
    );

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

    console.log(chalk.cyan.bold('\n📚 Confluence Configuration (Optional)\n'));
    console.log(
      chalk.gray(
        'Configure Confluence for documentation and OWASP ASVS links.\n'
      )
    );

    const configureConfluence = await confirm({
      message: 'Do you want to configure Confluence integration?',
      default: false,
    });

    let confluenceHost = '';
    let confluenceBaseUrl = '';

    if (configureConfluence) {
      confluenceHost = await input({
        message:
          'Enter your Confluence Host (e.g., https://yourcompany.atlassian.net):',
        validate: (value) => {
          if (value && !value.startsWith('http')) {
            return 'Confluence Host must start with http:// or https://';
          }
          return true;
        },
      });

      confluenceBaseUrl = await input({
        message: 'Enter your Confluence OWASP ASVS Base URL (optional):',
        default: '',
      });
    }

    console.log(
      chalk.cyan.bold('\n⚙️ Azure DevOps Configuration (Optional)\n')
    );
    console.log(
      chalk.gray('Configure Azure DevOps for project and repository links.\n')
    );

    const configureAzureDevOps = await confirm({
      message: 'Do you want to configure Azure DevOps integration?',
      default: false,
    });

    let azureDevOpsOrg = '';
    let azureDevOpsBaseUrl = 'https://dev.azure.com';

    if (configureAzureDevOps) {
      azureDevOpsOrg = await input({
        message: 'Enter your Azure DevOps Organization name:',
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Organization name is required for Azure DevOps integration';
          }
          return true;
        },
      });

      azureDevOpsBaseUrl = await input({
        message: 'Enter Azure DevOps Base URL:',
        default: 'https://dev.azure.com',
      });
    }

    const envContent = `# AppScan API Configuration
APPSCAN_API_KEY=${apiKey}
APPSCAN_API_SECRET=${apiSecret}
APPSCAN_BASE_URL=${baseUrl}

# JIRA Configuration (optional)
${jiraHost ? `JIRA_HOST=${jiraHost}` : '# JIRA_HOST=https://yourcompany.atlassian.net'}
${jiraEmail ? `JIRA_EMAIL=${jiraEmail}` : '# JIRA_EMAIL=your-email@company.com'}
${jiraApiToken ? `JIRA_API_TOKEN=${jiraApiToken}` : '# JIRA_API_TOKEN=your-api-token'}
${jiraProjectKey ? `JIRA_PROJECT_KEY=${jiraProjectKey}` : '# JIRA_PROJECT_KEY=SEC'}

# Azure DevOps Configuration (optional)
${azureDevOpsOrg ? `AZURE_DEVOPS_ORG=${azureDevOpsOrg}` : '# AZURE_DEVOPS_ORG=your-organization'}
${azureDevOpsBaseUrl && azureDevOpsOrg ? `AZURE_DEVOPS_BASE_URL=${azureDevOpsBaseUrl}` : '# AZURE_DEVOPS_BASE_URL=https://dev.azure.com'}

# Confluence Configuration (optional)
${confluenceHost ? `CONFLUENCE_HOST=${confluenceHost}` : '# CONFLUENCE_HOST=https://yourcompany.atlassian.net'}
${confluenceBaseUrl ? `CONFLUENCE_OWASP_ASVS_URL=${confluenceBaseUrl}` : '# CONFLUENCE_OWASP_ASVS_URL=https://confluence.company.com/display/SEC/OWASP-ASVS'}
`;

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
      chalk.yellow('appscan'),
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
