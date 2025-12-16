/**
 * Centralized logging service
 * Logs all errors and warnings to both console and file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  /**
   * Format log message with timestamp and level
   */
  _format(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  /**
   * Write to log file
   */
  _writeToFile(formattedMessage) {
    try {
      fs.appendFileSync(LOG_FILE, formattedMessage + '\n', 'utf8');
    } catch (err) {
      // Fallback to console only if file write fails
      console.error('Failed to write to log file:', err.message);
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

    const formattedMessage = this._format(LOG_LEVELS.ERROR, message, errorDetails);

    console.error(formattedMessage);
    this._writeToFile(formattedMessage);

    return formattedMessage;
  }

  /**
   * Log warning - always logged to file and console
   */
  warn(message, context = {}) {
    const formattedMessage = this._format(LOG_LEVELS.WARN, message, context);

    console.warn(formattedMessage);
    this._writeToFile(formattedMessage);

    return formattedMessage;
  }

  /**
   * Log info - logged based on log level
   */
  info(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      const formattedMessage = this._format(LOG_LEVELS.INFO, message, context);

      console.log(formattedMessage);
      this._writeToFile(formattedMessage);

      return formattedMessage;
    }
  }

  /**
   * Log debug - only logged in debug mode
   */
  debug(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      const formattedMessage = this._format(LOG_LEVELS.DEBUG, message, context);

      console.debug(formattedMessage);
      this._writeToFile(formattedMessage);

      return formattedMessage;
    }
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
