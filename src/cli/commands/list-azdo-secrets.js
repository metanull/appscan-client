import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Get state name from enum value
 * @param {number} state - State enum value
 * @returns {string}
 */
function getStateName(state) {
  const states = {
    0: 'Unknown',
    1: 'Active',
    2: 'Dismissed',
    4: 'Fixed',
    8: 'AutoDismissed',
  };
  return states[state] || `Unknown(${state})`;
}

/**
 * Get file paths from alert physical locations
 * @param {Object} alert - Alert object
 * @returns {string}
 */
function getFilePaths(alert) {
  if (!alert.physicalLocations || alert.physicalLocations.length === 0) {
    return 'N/A';
  }
  const paths = alert.physicalLocations
    .map((loc) => loc.filePath)
    .filter(Boolean);
  return paths.length > 0 ? paths.join(', ') : 'N/A';
}

/**
 * Extract fingerprint data from alert
 * @param {Object} alert - Alert object with validationFingerprints
 * @returns {{ secret: string, id: string }}
 */
function extractFingerprintData(alert) {
  if (
    !alert.validationFingerprints ||
    alert.validationFingerprints.length === 0
  ) {
    return { secret: 'N/A', id: 'N/A' };
  }

  // Get most recent fingerprint (last in array typically)
  const fingerprint =
    alert.validationFingerprints[alert.validationFingerprints.length - 1];

  if (!fingerprint?.validationFingerprint) {
    return { secret: 'N/A', id: 'N/A' };
  }

  try {
    const data = JSON.parse(fingerprint.validationFingerprint);
    return {
      secret: data.secret || 'N/A',
      id: data.id || 'N/A',
    };
  } catch {
    return { secret: 'N/A', id: 'N/A' };
  }
}

/**
 * Format a secret alert for display
 * @param {Object} alert - Secret alert with metadata
 * @param {number} index - Alert index
 * @returns {string}
 */
function formatAlert(alert, index) {
  const lines = [];
  const fingerprint = extractFingerprintData(alert);

  lines.push(
    `${index + 1}. ${chalk.bold(alert.title || alert.ruleName || '(no title)')} ${chalk.gray(`[ID: ${alert.alertId}]`)}`
  );
  lines.push(
    `   Project: ${chalk.cyan(alert.projectName)} | Repository: ${chalk.yellow(alert.repositoryName)}`
  );
  lines.push(
    `   State: ${getStateName(alert.state)} | Severity: ${chalk.magenta(alert.severity || 'N/A')}`
  );
  lines.push(`   Files: ${chalk.gray(getFilePaths(alert))}`);
  if (fingerprint.secret !== 'N/A') {
    lines.push(`   Secret: ${chalk.red(fingerprint.secret)}`);
  }
  if (fingerprint.id !== 'N/A') {
    lines.push(`   Fingerprint ID: ${chalk.gray(fingerprint.id)}`);
  }

  return lines.join('\n');
}

/**
 * List all secret alerts across Azure DevOps projects and repositories
 * @param {Object} options - CLI options
 * @param {string} [options.appId] - Project ID filter
 * @param {string} [options.repositoryId] - Repository ID filter (requires appId)
 * @param {boolean} [options.includeFixed] - Include fixed alerts
 * @param {boolean} [options.includeDismissed] - Include dismissed alerts
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function listAzdoSecrets(options) {
  try {
    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    if (options.repositoryId && !options.appId) {
      throw new Error('--repositoryId requires --appId to be specified');
    }

    const scope = options.appId
      ? options.repositoryId
        ? `project ${options.appId}, repository ${options.repositoryId}`
        : `project ${options.appId}`
      : 'all projects';

    cliOutput.status(`Fetching secret alerts across ${scope}...`);

    // Progress callback for non-JSON mode
    const onProgress = options.json
      ? undefined
      : (processed, total, found) => {
          const percentage = Math.round((processed / total) * 100);
          process.stdout.write(
            `\r  Scanning: ${percentage}% (${processed}/${total} repos, ${found} secrets found)`
          );
        };

    // Streaming JSON callback - outputs NDJSON (one JSON per line) as alerts are found
    const onAlert = options.json
      ? (alert) => {
          console.log(JSON.stringify(alert));
        }
      : undefined;

    const alerts = await service.listAllSecretAlerts({
      projectId: options.appId,
      repositoryId: options.repositoryId,
      includeFixed: options.includeFixed || false,
      includeDismissed: options.includeDismissed || false,
      includeFingerprint: true,
      onProgress,
      onAlert,
    });

    // Clear progress line
    if (!options.json) {
      process.stdout.write('\r' + ' '.repeat(80) + '\r');
    }

    // In JSON mode, alerts were already streamed as NDJSON, nothing more to output
    if (options.json) {
      return;
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${alerts?.length || 0} secret alert(s):\n`)
      );

      if (alerts && alerts.length > 0) {
        // Group by project and repo for summary
        const byProject = {};
        const byRepo = {};
        const byState = {};

        for (const alert of alerts) {
          const proj = alert.projectName || 'Unknown';
          const repo = `${alert.projectName}/${alert.repositoryName}`;
          const state = getStateName(alert.state);

          byProject[proj] = (byProject[proj] || 0) + 1;
          byRepo[repo] = (byRepo[repo] || 0) + 1;
          byState[state] = (byState[state] || 0) + 1;
        }

        cliOutput.result(chalk.bold('Summary:'));
        cliOutput.result(`  By Project: ${JSON.stringify(byProject)}`);
        cliOutput.result(`  By State: ${JSON.stringify(byState)}`);
        cliOutput.result('');

        // Display alerts grouped by project/repo
        const alertsByRepo = {};
        for (const alert of alerts) {
          const key = `${alert.projectName}/${alert.repositoryName}`;
          if (!alertsByRepo[key]) {
            alertsByRepo[key] = [];
          }
          alertsByRepo[key].push(alert);
        }

        for (const [repoKey, repoAlerts] of Object.entries(alertsByRepo)) {
          cliOutput.result(
            chalk.cyan.bold(
              `\n--- ${repoKey} (${repoAlerts.length} alerts) ---\n`
            )
          );

          repoAlerts.forEach((alert, index) => {
            cliOutput.result(formatAlert(alert, index));
            cliOutput.result('');
          });
        }
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to list secret alerts');
  }
}

export default listAzdoSecrets;
