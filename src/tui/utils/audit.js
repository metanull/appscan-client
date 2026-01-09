/**
 * Centralized audit service
 * Tracks all API calls that modify data
 */

import fs from 'fs';
import path from 'path';
import { getLogsDir } from '../../utils/config-paths.js';
import logger from '../../utils/logger.js';

const LOG_DIR = getLogsDir();
const AUDIT_FILE = path.join(LOG_DIR, 'audit.log');

class AuditService {
  /**
   * Log an audit entry
   * @param {string} action - The action being performed (e.g., 'APPSCAN_UPDATE', 'JIRA_CREATE')
   * @param {object} params - Parameters of the action
   * @param {object} result - Result of the action (success/failure)
   * @param {object} metadata - Additional metadata
   */
  log(action, params = {}, result = {}, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      params: this._sanitizeParams(params),
      result: {
        success: result.success !== false,
        ...result,
      },
      metadata,
      user: process.env.USER || process.env.USERNAME || 'unknown',
    };

    const formattedEntry = JSON.stringify(entry);

    try {
      fs.appendFileSync(AUDIT_FILE, formattedEntry + '\n', 'utf8');
    } catch (err) {
      logger.error('Failed to write to audit log', err);
    }

    return entry;
  }

  /**
   * Sanitize parameters to remove sensitive information
   * @param {Object} params - Parameters to sanitize
   * @returns {Object} Sanitized parameters with sensitive fields redacted
   * @private
   */
  _sanitizeParams(params) {
    const sanitized = { ...params };

    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'apiToken',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Log AppScan issue update
   * @param {string|string[]} issueIds - Issue ID(s) being updated
   * @param {string} applicationId - Application ID
   * @param {Object} updateData - Update data
   * @param {Object} result - Result of the update operation
   * @returns {Object} Audit log entry
   */
  logAppScanUpdate(issueIds, applicationId, updateData, result) {
    return this.log(
      'APPSCAN_UPDATE',
      {
        issueIds,
        applicationId,
        updateData,
      },
      result,
      {
        issueCount: Array.isArray(issueIds) ? issueIds.length : 1,
      }
    );
  }

  /**
   * Log Jira issue creation
   * @param {string} projectKey - Jira project key
   * @param {string} summary - Issue summary
   * @param {number} issueCount - Number of issues created
   * @param {Object} result - Result of the creation operation
   * @returns {Object} Audit log entry
   */
  logJiraCreate(projectKey, summary, issueCount, result) {
    return this.log(
      'JIRA_CREATE',
      {
        projectKey,
        summary,
        issueCount,
      },
      result
    );
  }

  /**
   * Log Jira issue link
   * @param {string} issueId - AppScan issue ID
   * @param {string} applicationId - Application ID
   * @param {string} jiraKey - Jira issue key
   * @param {Object} result - Result of the link operation
   * @returns {Object} Audit log entry
   */
  logJiraLink(issueId, applicationId, jiraKey, result) {
    return this.log(
      'JIRA_LINK',
      {
        issueId,
        applicationId,
        jiraKey,
      },
      result
    );
  }

  /**
   * Log AppScan application update
   * @param {string} applicationId - Application ID
   * @param {Object} updateData - Update data
   * @param {Object} result - Result of the update operation
   * @returns {Object} Audit log entry
   */
  logAppUpdate(applicationId, updateData, result) {
    return this.log(
      'APPSCAN_APP_UPDATE',
      {
        applicationId,
        updateData,
      },
      result,
      {
        fields: Object.keys(updateData),
      }
    );
  }

  /**
   * Get audit log file path
   * @returns {string} Absolute path to the audit log file
   */
  getAuditFilePath() {
    return AUDIT_FILE;
  }

  /**
   * Read audit log entries
   * @param {number} limit - Number of entries to return
   * @returns {Array} Array of audit entries
   */
  readAuditLog(limit = 100) {
    try {
      if (!fs.existsSync(AUDIT_FILE)) {
        return [];
      }

      const content = fs.readFileSync(AUDIT_FILE, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);

      const recentLines = lines.slice(-limit);

      return recentLines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (err) {
      logger.error('Failed to read audit log', err);
      return [];
    }
  }

  /**
   * Clear audit log by removing all entries
   */
  clearAuditLog() {
    try {
      fs.writeFileSync(AUDIT_FILE, '', 'utf8');
      this.log('AUDIT_CLEARED', {}, { success: true });
    } catch (err) {
      logger.error('Failed to clear audit log', err);
    }
  }
}

export const auditService = new AuditService();
export default auditService;
