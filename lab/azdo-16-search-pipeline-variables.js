#!/usr/bin/env node
/**
 * azdo-16-search-pipeline-variables.js
 *
 * Purpose: Search for pipeline variables across all projects in the organization.
 * Searches both pipeline-level variables and variable groups.
 *
 * Usage:
 *   node lab/azdo-16-search-pipeline-variables.js [options]
 *
 * Options:
 *   --name <pattern>     Search by variable name (case-insensitive partial match)
 *   --value <pattern>    Search by variable value (only non-secret variables)
 *   --project <name>     Limit search to a specific project
 *   --include-secrets    Include secret variables in results (value will be hidden)
 *   --json               Output results as JSON
 *
 * Examples:
 *   node lab/azdo-16-search-pipeline-variables.js --name username
 *   node lab/azdo-16-search-pipeline-variables.js --value "myuser@domain.com"
 *   node lab/azdo-16-search-pipeline-variables.js --name password --include-secrets
 *   node lab/azdo-16-search-pipeline-variables.js --project MyProject --name api
 *
 * Note: Secret variable VALUES cannot be retrieved via the API for security reasons.
 *       You can only search by name for secrets, and the value will show as "[SECRET]".
 */

import dotenv from 'dotenv';
import fs from 'fs';
import { getEnvPath } from '../src/utils/config-paths.js';

// Load environment variables from the correct path (same as TUI)
const envPath = getEnvPath();
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Initialize proxy/TLS configuration (must be after dotenv)
await import('../src/utils/bootstrap-proxy.js');

import chalk from 'chalk';
import { AzdoService } from '../src/tui/shared/services/azdo.js';

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    searchName: undefined,
    searchValue: undefined,
    project: undefined,
    includeSecrets: false,
    useRegex: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        result.searchName = args[++i];
        break;
      case '--value':
        result.searchValue = args[++i];
        break;
      case '--project':
        result.project = args[++i];
        break;
      case '--include-secrets':
        result.includeSecrets = true;
        break;
      case '--regex':
        result.useRegex = true;
        break;
      case '--json':
        result.json = true;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  return result;
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
${chalk.bold('Azure DevOps Pipeline Variables Scanner')}

${chalk.yellow('Usage:')}
  node lab/azdo-16-search-pipeline-variables.js [options]

${chalk.yellow('Options:')}
  --name <pattern>     Search by variable name (case-insensitive partial match)
  --value <pattern>    Search by variable value (only non-secret variables)
  --project <name>     Limit search to a specific project
  --include-secrets    Include secret variables in results (value will be hidden)
  --regex              Treat --name and --value as regex patterns
  --json               Output results as JSON
  --help, -h           Show this help message

${chalk.yellow('Examples:')}
  node lab/azdo-16-search-pipeline-variables.js --name username
  node lab/azdo-16-search-pipeline-variables.js --value "myuser@domain.com"
  node lab/azdo-16-search-pipeline-variables.js --name password --include-secrets
  node lab/azdo-16-search-pipeline-variables.js --project MyProject --name api
  node lab/azdo-16-search-pipeline-variables.js --name "^API_.*KEY$" --regex

${chalk.yellow('Note:')}
  Secret variable VALUES cannot be retrieved via the API for security reasons.
  You can only search by name for secrets, and the value will show as "[SECRET]".
`);
}

/**
 * Format a variable match for display
 * @param {Object} match - Variable match object
 * @returns {string} Formatted string
 */
function formatMatch(match) {
  const lines = [];
  lines.push(chalk.cyan.bold(`Variable: ${match.variableName}`));
  lines.push(chalk.gray('  Project:        ') + chalk.white(match.projectName));

  if (match.source === 'pipeline') {
    lines.push(
      chalk.gray('  Pipeline:       ') +
        chalk.white(`${match.pipelinePath}${match.pipelineName}`) +
        chalk.dim(` (ID: ${match.pipelineId})`)
    );
  } else if (match.source === 'variableGroup') {
    if (match.pipelineName) {
      lines.push(
        chalk.gray('  Pipeline:       ') +
          chalk.white(`${match.pipelinePath}${match.pipelineName}`) +
          chalk.dim(` (ID: ${match.pipelineId})`)
      );
    }
    lines.push(
      chalk.gray('  Variable Group: ') +
        chalk.white(match.variableGroupName) +
        chalk.dim(` (ID: ${match.variableGroupId})`)
    );
  }

  if (match.isSecret) {
    lines.push(chalk.gray('  Value:          ') + chalk.red('[SECRET]'));
  } else {
    lines.push(
      chalk.gray('  Value:          ') + chalk.green(match.variableValue || '(empty)')
    );
  }

  lines.push(chalk.gray('  Source:         ') + chalk.dim(match.source));

  return lines.join('\n');
}

async function main() {
  const args = parseArgs();

  if (!args.searchName && !args.searchValue) {
    console.error(
      chalk.red('Error: You must specify at least --name or --value to search for.')
    );
    console.log(chalk.gray('Use --help for usage information.'));
    process.exit(1);
  }

  if (args.searchValue && args.includeSecrets) {
    console.log(
      chalk.yellow(
        'Note: Searching by value only works for non-secret variables. Secret values are not accessible via the API.'
      )
    );
  }

  try {
    if (!args.json) {
      console.log(chalk.cyan.bold('Azure DevOps Pipeline Variables Scanner'));
      console.log(chalk.gray('Using TUI AzdoService\n'));
    }

    // Initialize the AzdoService
    const azdoService = new AzdoService();

    // Determine which projects to scan
    let projects;
    if (args.project) {
      // Search specific project
      if (!args.json) {
        console.log(chalk.yellow(`Searching in project: ${args.project}`));
      }
      projects = [{ name: args.project, id: args.project }];
    } else {
      // Get all projects
      if (!args.json) {
        console.log(chalk.yellow('Fetching projects...'));
      }
      projects = await azdoService.listProjects();
      if (!args.json) {
        console.log(chalk.green(`Found ${projects.length} projects\n`));
      }
    }

    const allResults = [];
    let totalPipelines = 0;
    let totalVariableGroups = 0;

    // Progress tracking
    const totalProjects = projects.length;
    let processedProjects = 0;

    for (const project of projects) {
      processedProjects++;

      if (!args.json) {
        const percentage = Math.round((processedProjects / totalProjects) * 100);
        const barLength = 40;
        const filledLength = Math.round((percentage / 100) * barLength);
        const bar =
          chalk.cyan('█'.repeat(filledLength)) +
          chalk.gray('░'.repeat(barLength - filledLength));

        process.stdout.write(
          `\r[${bar}] ${chalk.bold(percentage + '%')} | ${processedProjects}/${totalProjects} projects | ${chalk.yellow(allResults.length)} matches`
        );
      }

      try {
        // Search pipeline variables
        const pipelineResults = await azdoService.searchPipelineVariables(
          project.name,
          {
            searchName: args.searchName,
            searchValue: args.searchValue,
            includeSecrets: args.includeSecrets,
            useRegex: args.useRegex,
          }
        );

        // Count unique pipelines
        const pipelineIds = new Set(pipelineResults.map((r) => r.pipelineId));
        totalPipelines += pipelineIds.size;

        allResults.push(...pipelineResults);

        // Search variable groups (standalone, not linked to pipelines)
        const groupResults = await azdoService.searchVariableGroups(
          project.name,
          {
            searchName: args.searchName,
            searchValue: args.searchValue,
            includeSecrets: args.includeSecrets,
            useRegex: args.useRegex,
          }
        );

        // Count unique variable groups
        const groupIds = new Set(groupResults.map((r) => r.variableGroupId));
        totalVariableGroups += groupIds.size;

        // Add group results that aren't already included via pipeline search
        for (const groupResult of groupResults) {
          const alreadyIncluded = allResults.some(
            (r) =>
              r.variableGroupId === groupResult.variableGroupId &&
              r.variableName === groupResult.variableName
          );
          if (!alreadyIncluded) {
            allResults.push(groupResult);
          }
        }
      } catch (error) {
        // Skip projects with no access or errors
        if (!args.json && error.statusCode !== 404) {
          // Silently skip - common for projects without pipelines
        }
      }
    }

    if (!args.json) {
      // Clear progress line
      console.log('\n');
    }

    // Output results
    if (args.json) {
      console.log(
        JSON.stringify(
          {
            searchCriteria: {
              name: args.searchName,
              value: args.searchValue,
              includeSecrets: args.includeSecrets,
              useRegex: args.useRegex,
              project: args.project,
            },
            summary: {
              totalMatches: allResults.length,
              projectsScanned: projects.length,
              pipelinesScanned: totalPipelines,
              variableGroupsScanned: totalVariableGroups,
            },
            results: allResults,
          },
          null,
          2
        )
      );
    } else {
      if (allResults.length === 0) {
        console.log(chalk.gray('No matching variables found.'));
      } else {
        console.log(
          chalk.green.bold(`Found ${allResults.length} matching variable(s):\n`)
        );
        console.log(chalk.gray('─'.repeat(80)));

        for (const match of allResults) {
          console.log(formatMatch(match));
          console.log(chalk.gray('─'.repeat(80)));
        }

        // Summary
        console.log(chalk.bold('\nSummary:'));
        console.log(
          chalk.gray('  Projects scanned:       ') + chalk.white(projects.length)
        );
        console.log(
          chalk.gray('  Pipelines scanned:      ') + chalk.white(totalPipelines)
        );
        console.log(
          chalk.gray('  Variable groups scanned:') + chalk.white(totalVariableGroups)
        );
        console.log(
          chalk.gray('  Total matches:          ') +
            chalk.green.bold(allResults.length)
        );

        // Group by source
        const bySource = allResults.reduce((acc, r) => {
          acc[r.source] = (acc[r.source] || 0) + 1;
          return acc;
        }, {});
        console.log(
          chalk.gray('  From pipelines:         ') +
            chalk.white(bySource.pipeline || 0)
        );
        console.log(
          chalk.gray('  From variable groups:   ') +
            chalk.white(bySource.variableGroup || 0)
        );

        // Secret vs non-secret
        const secretCount = allResults.filter((r) => r.isSecret).length;
        const nonSecretCount = allResults.length - secretCount;
        console.log(
          chalk.gray('  Secret variables:       ') + chalk.yellow(secretCount)
        );
        console.log(
          chalk.gray('  Non-secret variables:   ') + chalk.white(nonSecretCount)
        );
      }
    }

    process.exit(0);
  } catch (err) {
    if (args.json) {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    } else {
      console.error(chalk.red.bold('\nError: ') + chalk.red(err.message));
      if (err.stack) {
        console.error(chalk.gray('\nStack trace:'));
        console.error(chalk.gray(err.stack));
      }
    }
    process.exit(1);
  }
}

main();
