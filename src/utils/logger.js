/**
 * Centralized logging service
 * Logs all errors and warnings to both console and file
 */

import fs from 'fs';
import path from 'path';
import { getLogsDir } from './config-paths.js';

const LOG_DIR = getLogsDir();
const LOG_FILE = path.join(LOG_DIR, 'app.log');

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.debugCallback = null; // Callback for debug UI
    this.tuiMode = false; // Set to true when running in TUI to disable console output
  }

  /**
   * Enable TUI mode - disables console output to prevent interfering with Ink rendering
   */
  setTuiMode(enabled) {
    this.tuiMode = enabled;
  }

  /**
   * Register a callback to be called when logs are written
   * Used by UI to display debug messages in real-time
   */
  setDebugCallback(callback) {
    this.debugCallback = callback;
  }

  /**
   * Format log message with timestamp and level
   */
  _format(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr =
      Object.keys(context).length > 0 ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  /**
   * Write to log file and optionally to debug callback
   */
  _writeToFile(formattedMessage) {
    try {
      fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
    } catch {
      // Silently fail if file write fails to avoid interfering with TUI
      // The error is not logged to console to prevent disrupting Ink rendering
    }

    // Call debug callback if registered (for UI debug bar)
    if (this.debugCallback) {
      try {
        this.debugCallback(formattedMessage);
      } catch {
        // Silently fail if callback errors to avoid breaking logging
      }
    }
  }

  /**
   * Log error - always logged to file and console
   */
  error(message, error = null, context = {}) {
    const errorDetails = error
      ? {
          message: error.message,
          stack: error.stack,
          ...context,
        }
      : context;

    const formattedMessage = this._format(
      LOG_LEVELS.ERROR,
      message,
      errorDetails
    );

    // Only write to console if not in TUI mode
    if (!this.tuiMode) {
      console.error(formattedMessage);
    }
    this._writeToFile(formattedMessage);

    return formattedMessage;
  }

  /**
   * Log warning - always logged to file and console
   */
  warn(message, context = {}) {
    const formattedMessage = this._format(LOG_LEVELS.WARN, message, context);

    // Only write to console if not in TUI mode
    if (!this.tuiMode) {
      console.warn(formattedMessage);
    }
    this._writeToFile(formattedMessage);

    return formattedMessage;
  }

  /**
   * Log info - logged based on log level
   */
  info(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      const formattedMessage = this._format(LOG_LEVELS.INFO, message, context);

      // Only write to console if not in TUI mode
      if (!this.tuiMode) {
        console.log(formattedMessage);
      }
      this._writeToFile(formattedMessage);

      return formattedMessage;
    }
  }

  /**
   * Log debug - logged based on log level, but always calls debug callback
   */
  debug(message, context = {}) {
    const formattedMessage = this._format(LOG_LEVELS.DEBUG, message, context);

    // Always send to debug callback if registered (for UI debug bar)
    if (this.debugCallback) {
      try {
        this.debugCallback(formattedMessage);
      } catch {
        // Silently fail if callback errors to avoid breaking logging
      }
    }

    // Only log to file/console if log level allows
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      // Only write to console if not in TUI mode
      if (!this.tuiMode) {
        console.debug(formattedMessage);
      }
      this._writeToFile(formattedMessage);
    }

    return formattedMessage;
  }

  /**
   * Check if message should be logged based on log level
   */
  _shouldLog(level) {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Get log file path
   */
  getLogFilePath() {
    return LOG_FILE;
  }

  /**
   * Clear log file
   */
  clearLogs() {
    try {
      fs.writeFileSync(LOG_FILE, '', 'utf8');
      this.info('Log file cleared');
    } catch (err) {
      this.error('Failed to clear log file', err);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
