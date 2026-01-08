/**
 * CLI Output Utility
 * Manages console output for CLI commands, distinguishing between:
 * - UI/Status messages (suppressed when --json flag is used)
 * - Result output (always shown)
 * Integrates with logger to automatically log warnings and errors.
 */

import chalk from 'chalk';
import logger from './logger.js';

class CliOutput {
  constructor() {
    this.jsonMode = false;
  }

  /**
   * Enable JSON mode - suppresses all UI/status messages
   * @param {boolean} enabled - Whether JSON mode is enabled
   */
  setJsonMode(enabled) {
    this.jsonMode = enabled;
  }

  /**
   * Output status message (blue color) - suppressed in JSON mode
   * @param {string} message - Status message to display
   */
  status(message) {
    if (!this.jsonMode) {
      console.error(chalk.blue(message));
    }
  }

  /**
   * Output success message (green color) - suppressed in JSON mode
   * @param {string} message - Success message to display
   */
  success(message) {
    if (!this.jsonMode) {
      console.error(chalk.green(message));
    }
  }

  /**
   * Output warning message (yellow color) - suppressed in JSON mode
   * Automatically logged to file via logger
   * @param {string} message - Warning message to display
   */
  warning(message) {
    // Always log warnings to file
    logger.warn(message);

    if (!this.jsonMode) {
      console.error(chalk.yellow(message));
    }
  }

  /**
   * Output error message (red color) - always shown, even in JSON mode
   * Automatically logged to file via logger
   * Errors go to stderr
   * @param {string} message - Error message to display
   * @param {Error} [error] - Optional error object for detailed logging
   */
  error(message, error = null) {
    // Always log errors to file with full details
    logger.error(message, error);

    // Always show errors, even in JSON mode
    console.error(chalk.red(message));
  }

  /**
   * Output result data - always shown
   * Results go to stdout for proper piping
   * @param {string} data - Data to output
   */
  result(data) {
    console.log(data);
  }

  /**
   * Output JSON result - always shown
   * @param {any} data - Data to stringify and output
   * @param {number} indent - JSON indentation (default: 2)
   */
  json(data, indent = 2) {
    console.log(JSON.stringify(data, null, indent));
  }
}

// Export singleton instance
export const cliOutput = new CliOutput();
export default cliOutput;
