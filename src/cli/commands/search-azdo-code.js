import chalk from 'chalk';
import {
  initializeAzdoService,
  handleCommandError,
} from '../../utils/cli-common.js';
import cliOutput from '../../utils/cli-output.js';

/**
 * Format a code search result for display
 * @param {Object} result - Code search result
 * @param {number} index - Result index
 * @returns {string}
 */
function formatResult(result, index) {
  const lines = [];
  lines.push(
    `${index + 1}. ${chalk.bold(result.fileName)} ${chalk.gray(`[${result.path}]`)}`
  );
  lines.push(
    `   Project: ${chalk.cyan(result.project?.name || 'N/A')} | Repository: ${chalk.yellow(result.repository?.name || 'N/A')}`
  );

  if (result.versions && result.versions.length > 0) {
    const branches = result.versions.map((v) => v.branchName).join(', ');
    lines.push(`   Branch: ${chalk.magenta(branches)}`);
  }

  if (result.matches?.content && result.matches.content.length > 0) {
    lines.push(`   Matches: ${result.matches.content.length} occurrence(s)`);
  }

  return lines.join('\n');
}

/**
 * Search code across Azure DevOps repositories
 * @param {string} searchText - The search text
 * @param {Object} options - CLI options
 * @param {string} [options.appId] - Project ID filter
 * @param {string} [options.repositoryId] - Repository ID filter
 * @param {string} [options.path] - Path filter
 * @param {string} [options.branch] - Branch filter
 * @param {number} [options.top] - Number of results to return
 * @param {number} [options.skip] - Number of results to skip
 * @param {string} [options.config] - Path to config file
 * @param {boolean} [options.json] - Output in JSON format
 */
export async function searchAzdoCode(searchText, options) {
  try {
    if (!searchText) {
      throw new Error('Search text is required');
    }

    cliOutput.setJsonMode(options.json);
    const { service } = await initializeAzdoService(options.config);

    cliOutput.status(`Searching for: "${searchText}"`);

    const searchOptions = {
      projectId: options.appId,
      repositoryId: options.repositoryId,
      path: options.path,
      branch: options.branch,
      top: options.top ? parseInt(options.top, 10) : 50,
      skip: options.skip ? parseInt(options.skip, 10) : 0,
      includeSnippet: true,
    };

    const response = await service.codeSearch(searchText, searchOptions);

    if (options.json) {
      cliOutput.json(response);
    } else {
      cliOutput.result(
        chalk.green(`\nFound ${response.count || 0} result(s):\n`)
      );

      if (response.infoCode && response.infoCode !== 0) {
        const infoCodes = {
          1: 'Account is being reindexed',
          2: 'Account indexing has not started',
          3: 'Invalid Request',
          4: 'Prefix wildcard query not supported',
          5: 'MultiWords with code facet not supported',
          6: 'Account is being onboarded',
          7: 'Account is being onboarded or reindexed',
          8: 'Top value trimmed to max allowed',
          9: 'Branches are being indexed',
          10: 'Faceting not enabled',
        };
        const infoMessage =
          infoCodes[response.infoCode] || `Code: ${response.infoCode}`;
        cliOutput.result(chalk.yellow(`Note: ${infoMessage}\n`));
      }

      if (response.results && response.results.length > 0) {
        for (let i = 0; i < response.results.length; i++) {
          cliOutput.result(formatResult(response.results[i], i));
          cliOutput.result('');
        }

        // Show facets summary
        if (response.facets) {
          cliOutput.result(chalk.bold('\nSummary:'));
          if (response.facets.Project) {
            const projects = response.facets.Project.map(
              (p) => `${p.name} (${p.resultCount})`
            ).join(', ');
            cliOutput.result(`  Projects: ${projects}`);
          }
          if (response.facets.Repository) {
            const repos = response.facets.Repository.map(
              (r) => `${r.name} (${r.resultCount})`
            ).join(', ');
            cliOutput.result(`  Repositories: ${repos}`);
          }
        }

        // Pagination info
        const showing = Math.min(searchOptions.top, response.results.length);
        const from = searchOptions.skip + 1;
        const to = searchOptions.skip + showing;
        cliOutput.result(
          chalk.gray(`\nShowing ${from}-${to} of ${response.count} results`)
        );
      }
    }
  } catch (error) {
    handleCommandError(error, 'Failed to search code');
  }
}

export default searchAzdoCode;
