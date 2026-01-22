import { input, password } from '@inquirer/prompts';
import chalk from 'chalk';
import cliOutput from '../../utils/cli-output.js';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { getEnvPath } from '../../utils/config-paths.js';

const FIELDS = [
  {
    key: 'APPSCAN_API_KEY',
    label: 'AppScan API Key',
    secret: true,
    default: '',
    hint: 'Your AppScan API key',
  },
  {
    key: 'APPSCAN_API_SECRET',
    label: 'AppScan API Secret',
    secret: true,
    default: '',
    hint: 'Your AppScan API secret key',
  },
  {
    key: 'APPSCAN_BASE_URL',
    label: 'AppScan Base URL',
    secret: false,
    default: 'https://eu.cloud.appscan.com',
    hint: 'Base URL of your AppScan instance, e.g., https://cloud.appscan.com or https://eu.cloud.appscan.com',
  },
  {
    key: 'AZURE_DEVOPS_ORG',
    label: 'Azure DevOps Organization',
    secret: false,
    default: '',
    hint: 'Your Azure DevOps organization name (e.g., https://dev.azure.com/{organization})',
  },
  {
    key: 'AZURE_DEVOPS_PAT',
    label: 'Azure DevOps Personal Access Token',
    secret: true,
    default: '',
    hint: 'Generate at: https://dev.azure.com/{organization}/_usersSettings/tokens\nRequired scopes: Build (read), Release (read), Code (read)',
  },
  {
    key: 'AZURE_DEVOPS_BASE_URL',
    label: 'Azure DevOps Base URL',
    secret: false,
    default: 'https://dev.azure.com',
    hint: 'Base URL of your Azure DevOps instance',
  },
  {
    key: 'JIRA_HOST',
    label: 'JIRA Host',
    secret: false,
    default: 'https://your-domain.atlassian.net',
    hint: 'Base URL of your JIRA instance',
  },
  {
    key: 'JIRA_EMAIL',
    label: 'JIRA Email',
    secret: false,
    default: '',
    hint: 'Email address associated with your JIRA account',
  },
  {
    key: 'JIRA_API_TOKEN',
    label: 'JIRA API Token',
    secret: true,
    default: '',
    hint: 'Generate at: https://id.atlassian.com/manage-profile/security/api-tokens',
  },
  {
    key: 'JIRA_PROJECT_KEY',
    label: 'JIRA Project Key',
    secret: false,
    default: 'PROJ',
    hint: 'The key of the project where issues will be created (e.g., PROJ)',
  },
  {
    key: 'CONFLUENCE_HOST',
    label: 'Confluence Host (optional)',
    secret: false,
    default: 'https://your-domain.atlassian.net/wiki',
    hint: 'Base URL of your Confluence instance',
  },
  {
    key: 'CONFLUENCE_OWASP_ASVS_URL',
    label: 'Confluence OWASP ASVS URL (optional)',
    secret: false,
    default: '',
    hint: 'URL to the OWASP ASVS page in your Confluence (e.g., https://your-domain.atlassian.net/wiki/spaces/ASVS/pages/123456789/OWASP+ASVS)',
  },
  {
    key: 'HTTP_PROXY',
    label: 'HTTP Proxy (optional)',
    secret: false,
    default: '',
    hint: 'HTTP proxy URL (e.g., http://proxy.example.com:8080)',
  },
  {
    key: 'HTTPS_PROXY',
    label: 'HTTPS Proxy (optional)',
    secret: false,
    default: '',
    hint: 'HTTPS proxy URL (e.g., http://proxy.example.com:8080)',
  },
  {
    key: 'NO_PROXY',
    label: 'No Proxy (optional)',
    secret: false,
    default: 'localhost,127.0.0.1',
    hint: 'Comma-separated list of hosts to bypass proxy',
  },
  {
    key: 'PROXY_REJECT_UNAUTHORIZED',
    label: 'Disable TLS verification (optional)',
    secret: false,
    default: '',
    hint: 'Set to "false" to disable TLS certificate verification (for self-signed proxy certs)',
  },
  {
    key: 'PROXY_CA_CERT',
    label: 'Custom CA Certificate path (optional)',
    secret: false,
    default: '',
    hint: 'Path to a PEM file with additional CA certificates to trust (e.g., /path/to/ca-bundle.crt)',
  },
];

/**
 * Parse existing .env file
 */
const parseExistingEnv = (envPath) => {
  try {
    if (!existsSync(envPath)) {
      return {};
    }
    const content = readFileSync(envPath, 'utf8');
    const config = {};
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          config[key.trim()] = valueParts
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    });
    return config;
  } catch {
    return {};
  }
};

/**
 * Mask secret values for display
 */
const maskValue = (value) => {
  if (!value) return '';
  return '***';
};

/**
 * Interactive setup wizard to configure AppScan client credentials and integrations
 * @param {Object} options - CLI options
 */
export async function setup(_options) {
  try {
    cliOutput.status(chalk.blue.bold('\n🔧 AppScan Client Setup\n'));

    const envPath = getEnvPath();
    const existingConfig = parseExistingEnv(envPath);
    const newConfig = { ...existingConfig };

    // Process each field
    for (const field of FIELDS) {
      const existingValue = existingConfig[field.key];
      const displayValue = field.secret
        ? maskValue(existingValue)
        : existingValue || chalk.dim('(empty)');

      // Build single-line prompt
      let promptMsg = chalk.cyan(field.label);
      if (field.hint) {
        promptMsg += chalk.gray(` (${field.hint})`);
      }
      if (existingValue) {
        promptMsg += chalk.yellow(`: ${displayValue}`);
      }

      // Prompt for new value (Enter = keep existing, type = new value)
      let newValue;
      if (field.secret) {
        newValue = await password({
          message: promptMsg,
          mask: '*',
        });
      } else {
        newValue = await input({
          message: promptMsg,
          default: '',
        });
      }

      // If empty input and we have existing value, keep existing
      // Otherwise use the new value (which could be empty string)
      if (newValue === '' && existingValue) {
        newConfig[field.key] = existingValue;
      } else {
        newConfig[field.key] = newValue;
      }
    }

    // Build .env content dynamically from FIELDS
    const lines = ['# AppScan Client Configuration', ''];

    // Group fields by category
    const categories = [
      { name: 'AppScan API Configuration', prefix: 'APPSCAN_' },
      { name: 'Azure DevOps Configuration', prefix: 'AZURE_DEVOPS_' },
      { name: 'JIRA Configuration', prefix: 'JIRA_' },
      { name: 'Confluence Configuration', prefix: 'CONFLUENCE_' },
      {
        name: 'HTTP Proxy Configuration',
        keys: [
          'HTTP_PROXY',
          'HTTPS_PROXY',
          'NO_PROXY',
          'PROXY_REJECT_UNAUTHORIZED',
        ],
      },
    ];

    for (const category of categories) {
      const categoryFields = category.keys
        ? FIELDS.filter((f) => category.keys.includes(f.key))
        : FIELDS.filter((f) => f.key.startsWith(category.prefix));
      if (categoryFields.length > 0) {
        lines.push(`# ${category.name}`);
        for (const field of categoryFields) {
          lines.push(
            `${field.key}=${newConfig[field.key] || field.default || ''}`
          );
        }
        lines.push('');
      }
    }

    writeFileSync(envPath, lines.join('\n'), 'utf8');

    cliOutput.success(chalk.green.bold('\n✅ Setup complete!\n'));
    cliOutput.status(chalk.gray(`Configuration saved to: ${envPath}\n`));
    cliOutput.status(chalk.cyan('Next steps:'));
    cliOutput.status(
      chalk.white('  1. Run') +
        ' ' +
        chalk.yellow('appscan connection-check') +
        ' ' +
        chalk.white('to verify your setup')
    );
    cliOutput.status(
      chalk.white('  2. Run') +
        ' ' +
        chalk.yellow('appscan') +
        ' ' +
        chalk.white('to start triaging vulnerabilities\n')
    );
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      cliOutput.warning(chalk.yellow('\n⚠️  Setup cancelled by user.\n'));
      process.exit(0);
    }
    cliOutput.error(
      chalk.red(`\n❌ Error during setup: ${error.message}\n`),
      error
    );
    process.exit(1);
  }
}

export default setup;
