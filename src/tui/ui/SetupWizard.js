/**
 * SetupWizard Component
 * Interactive setup wizard for configuring AppScan and JIRA credentials
 */

import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STEPS = {
  WELCOME: 'welcome',
  APPSCAN_KEY: 'appscan_key',
  APPSCAN_SECRET: 'appscan_secret',
  APPSCAN_URL: 'appscan_url',
  JIRA_CONFIRM: 'jira_confirm',
  JIRA_HOST: 'jira_host',
  JIRA_EMAIL: 'jira_email',
  JIRA_TOKEN: 'jira_token',
  JIRA_PROJECT: 'jira_project',
  CONFLUENCE_CONFIRM: 'confluence_confirm',
  CONFLUENCE_URL: 'confluence_url',
  SAVE: 'save',
  COMPLETE: 'complete',
};

export const SetupWizard = ({ onComplete, onCancel }) => {
  const { exit } = useApp();
  const [step, setStep] = useState(STEPS.WELCOME);
  const [config, setConfig] = useState({
    apiKey: '',
    apiSecret: '',
    baseUrl: 'https://cloud.appscan.com',
    jiraHost: '',
    jiraEmail: '',
    jiraApiToken: '',
    jiraProjectKey: '',
    confluenceUrl: '',
  });
  const [inputValue, setInputValue] = useState('');
  const [configureJira, setConfigureJira] = useState(false);
  const [configureConfluence, setConfigureConfluence] = useState(false);

  useInput((input, key) => {
    if ((input === 'q' || input === 'b') && step === STEPS.WELCOME) {
      if (onCancel) {
        onCancel();
      } else {
        exit();
      }
      return;
    }

    if (step === STEPS.WELCOME) {
      if (key.return) {
        setStep(STEPS.APPSCAN_KEY);
      }
      return;
    }

    if (step === STEPS.JIRA_CONFIRM) {
      if (input === 'y' || input === 'Y') {
        setConfigureJira(true);
        setStep(STEPS.JIRA_HOST);
      } else if (input === 'n' || input === 'N') {
        setConfigureJira(false);
        setStep(STEPS.CONFLUENCE_CONFIRM);
      }
      return;
    }

    if (step === STEPS.CONFLUENCE_CONFIRM) {
      if (input === 'y' || input === 'Y') {
        setConfigureConfluence(true);
        setStep(STEPS.CONFLUENCE_URL);
      } else if (input === 'n' || input === 'N') {
        setConfigureConfluence(false);
        setStep(STEPS.SAVE);
      }
      return;
    }

    if (step === STEPS.SAVE) {
      if (key.return) {
        saveConfiguration();
      }
      return;
    }

    if (step === STEPS.COMPLETE) {
      if (key.return) {
        if (onComplete) {
          onComplete();
        } else {
          exit();
        }
      }
      return;
    }
  });

  const handleSubmit = () => {
    switch (step) {
      case STEPS.APPSCAN_KEY:
        if (inputValue.trim()) {
          setConfig({ ...config, apiKey: inputValue });
          setInputValue('');
          setStep(STEPS.APPSCAN_SECRET);
        }
        break;
      case STEPS.APPSCAN_SECRET:
        if (inputValue.trim()) {
          setConfig({ ...config, apiSecret: inputValue });
          setInputValue('');
          setStep(STEPS.APPSCAN_URL);
        }
        break;
      case STEPS.APPSCAN_URL:
        setConfig({ ...config, baseUrl: inputValue || 'https://cloud.appscan.com' });
        setInputValue('');
        setStep(STEPS.JIRA_CONFIRM);
        break;
      case STEPS.JIRA_HOST:
        setConfig({ ...config, jiraHost: inputValue });
        setInputValue('');
        setStep(STEPS.JIRA_EMAIL);
        break;
      case STEPS.JIRA_EMAIL:
        setConfig({ ...config, jiraEmail: inputValue });
        setInputValue('');
        setStep(STEPS.JIRA_TOKEN);
        break;
      case STEPS.JIRA_TOKEN:
        setConfig({ ...config, jiraApiToken: inputValue });
        setInputValue('');
        setStep(STEPS.JIRA_PROJECT);
        break;
      case STEPS.JIRA_PROJECT:
        setConfig({ ...config, jiraProjectKey: inputValue });
        setInputValue('');
        setStep(STEPS.CONFLUENCE_CONFIRM);
        break;
      case STEPS.CONFLUENCE_URL:
        setConfig({ ...config, confluenceUrl: inputValue });
        setInputValue('');
        setStep(STEPS.SAVE);
        break;
    }
  };

  const saveConfiguration = () => {
    try {
      // Create .env file in the appscan-client root directory
      // When running from ink-triage/, go up one level
      const envPath = path.resolve(process.cwd(), '../.env');
      const envContent = `# AppScan API Configuration
APPSCAN_API_KEY=${config.apiKey}
APPSCAN_API_SECRET=${config.apiSecret}
APPSCAN_BASE_URL=${config.baseUrl}

# JIRA Configuration (optional)
${config.jiraHost ? `JIRA_HOST=${config.jiraHost}` : '# JIRA_HOST=https://yourcompany.atlassian.net'}
${config.jiraEmail ? `JIRA_EMAIL=${config.jiraEmail}` : '# JIRA_EMAIL=your-email@company.com'}
${config.jiraApiToken ? `JIRA_API_TOKEN=${config.jiraApiToken}` : '# JIRA_API_TOKEN=your-api-token'}
${config.jiraProjectKey ? `JIRA_PROJECT_KEY=${config.jiraProjectKey}` : '# JIRA_PROJECT_KEY=SEC'}

# Confluence Configuration (optional)
${config.confluenceUrl ? `CONFLUENCE_OWASP_ASVS_URL=${config.confluenceUrl}` : '# CONFLUENCE_OWASP_ASVS_URL=https://confluence.company.com/display/SEC/OWASP-ASVS'}
`;

      fs.writeFileSync(envPath, envContent, 'utf8');
      setStep(STEPS.COMPLETE);
    } catch (error) {
      console.error('Failed to save configuration:', error.message);
      exit();
    }
  };

  const getPrompt = () => {
    switch (step) {
      case STEPS.APPSCAN_KEY:
        return 'Enter your AppScan API Key:';
      case STEPS.APPSCAN_SECRET:
        return 'Enter your AppScan API Secret:';
      case STEPS.APPSCAN_URL:
        return 'Enter AppScan Base URL:';
      case STEPS.JIRA_HOST:
        return 'Enter your JIRA Host (e.g., https://yourcompany.atlassian.net):';
      case STEPS.JIRA_EMAIL:
        return 'Enter your JIRA Email:';
      case STEPS.JIRA_TOKEN:
        return 'Enter your JIRA API Token:';
      case STEPS.JIRA_PROJECT:
        return 'Enter your JIRA Project Key (e.g., SEC):';
      case STEPS.CONFLUENCE_URL:
        return 'Enter your Confluence OWASP ASVS Base URL:';
      default:
        return '';
    }
  };

  const getDefaultValue = () => {
    if (step === STEPS.APPSCAN_URL) {
      return 'https://cloud.appscan.com';
    }
    return '';
  };

  const renderInputStep = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan">{getPrompt()}</Text>
      <Box marginTop={1}>
        <Text color="green">&gt; </Text>
        <TextInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder={getDefaultValue()}
          mask={step === STEPS.APPSCAN_SECRET || step === STEPS.JIRA_TOKEN ? '*' : undefined}
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press Enter to continue</Text>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="double" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">
          🔧 AppScan Triage Setup Wizard
        </Text>
      </Box>

      {step === STEPS.WELCOME && (
        <Box flexDirection="column" padding={1}>
          <Text color="yellow">Welcome to the AppScan Triage Setup!</Text>
          <Text marginTop={1}>This wizard will help you configure your credentials.</Text>
          <Box marginTop={2} flexDirection="column">
            <Text dimColor>You will need:</Text>
            <Text dimColor> • AppScan API Key and Secret</Text>
            <Text dimColor> • (Optional) JIRA credentials for creating issues</Text>
            <Text dimColor> • (Optional) Confluence OWASP ASVS documentation URL</Text>
          </Box>
          <Box marginTop={2}>
            <Text color="green">Press Enter to start or 'q' to quit</Text>
          </Box>
        </Box>
      )}

      {(step === STEPS.APPSCAN_KEY ||
        step === STEPS.APPSCAN_SECRET ||
        step === STEPS.APPSCAN_URL ||
        step === STEPS.JIRA_HOST ||
        step === STEPS.JIRA_EMAIL ||
        step === STEPS.JIRA_TOKEN ||
        step === STEPS.JIRA_PROJECT ||
        step === STEPS.CONFLUENCE_URL) &&
        renderInputStep()}

      {step === STEPS.JIRA_CONFIRM && (
        <Box flexDirection="column" padding={1}>
          <Text color="cyan">Do you want to configure JIRA integration?</Text>
          <Text dimColor marginTop={1}>
            JIRA integration allows you to create issues directly from vulnerabilities.
          </Text>
          <Box marginTop={2}>
            <Text color="green">Press 'y' for Yes or 'n' for No</Text>
          </Box>
        </Box>
      )}

      {step === STEPS.CONFLUENCE_CONFIRM && (
        <Box flexDirection="column" padding={1}>
          <Text color="cyan">Do you want to configure Confluence OWASP ASVS links?</Text>
          <Text dimColor marginTop={1}>
            This adds links to your OWASP ASVS documentation in Confluence.
          </Text>
          <Box marginTop={2}>
            <Text color="green">Press 'y' for Yes or 'n' for No</Text>
          </Box>
        </Box>
      )}

      {step === STEPS.SAVE && (
        <Box flexDirection="column" padding={1}>
          <Text color="yellow">Review your configuration:</Text>
          <Box marginTop={1} flexDirection="column">
            <Text>
              • AppScan API Key: <Text color="green">***{config.apiKey.slice(-4)}</Text>
            </Text>
            <Text>
              • AppScan Base URL: <Text color="green">{config.baseUrl}</Text>
            </Text>
            {configureJira && (
              <>
                <Text>
                  • JIRA Host: <Text color="green">{config.jiraHost}</Text>
                </Text>
                <Text>
                  • JIRA Email: <Text color="green">{config.jiraEmail}</Text>
                </Text>
                <Text>
                  • JIRA Project: <Text color="green">{config.jiraProjectKey}</Text>
                </Text>
              </>
            )}
            {configureConfluence && (
              <Text>
                • Confluence URL: <Text color="green">{config.confluenceUrl}</Text>
              </Text>
            )}
          </Box>
          <Box marginTop={2}>
            <Text color="green">Press Enter to save configuration</Text>
          </Box>
        </Box>
      )}

      {step === STEPS.COMPLETE && (
        <Box flexDirection="column" padding={1}>
          <Text color="green">✅ Setup complete!</Text>
          <Text marginTop={1}>Configuration saved to .env file</Text>
          <Box marginTop={2} flexDirection="column">
            <Text color="cyan">Next steps:</Text>
            <Text dimColor> • The application will now load your credentials</Text>
            <Text dimColor> • You can start triaging vulnerabilities</Text>
          </Box>
          <Box marginTop={2}>
            <Text color="green">Press Enter to continue</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SetupWizard;
