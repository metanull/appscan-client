/**
 * Comment Templates Service
 * Manages loading, saving, and retrieving comment templates for vulnerability types
 */

import fs from 'fs';
import { getCommentTemplatesPath } from '../../utils/config-paths.js';
import logger from '../../utils/logger.js';

// Path to templates file (uses config directory for installed packages)
const TEMPLATES_FILE = getCommentTemplatesPath();

/**
 * Parse templates file into structured data
 * @returns {Map<string, string[]>} Map of issue type to array of comment templates
 */
export function loadTemplates() {
  const templates = new Map();

  try {
    if (!fs.existsSync(TEMPLATES_FILE)) {
      // Create empty file if it doesn't exist
      fs.writeFileSync(
        TEMPLATES_FILE,
        '# Comment Templates for AppScan Triage\n# Format: [IssueType]|Comment text\n\n',
        'utf8'
      );
      return templates;
    }

    const content = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse format: IssueType|Comment
      const separatorIndex = trimmed.indexOf('|');
      if (separatorIndex === -1) {
        continue; // Invalid format, skip
      }

      const issueType = trimmed.substring(0, separatorIndex).trim();
      const comment = trimmed.substring(separatorIndex + 1).trim();

      if (!issueType || !comment) {
        continue; // Skip if either part is empty
      }

      if (!templates.has(issueType)) {
        templates.set(issueType, []);
      }
      templates.get(issueType).push(comment);
    }
  } catch (error) {
    logger.error('Error loading templates', error);
  }

  return templates;
}

/**
 * Save a new template to the file
 * @param {string} issueType - The vulnerability type
 * @param {string} comment - The comment text
 */
export function saveTemplate(issueType, comment) {
  try {
    if (!issueType || !comment) {
      return;
    }

    // Load existing templates to check for duplicates
    const existing = loadTemplates();
    const existingComments = existing.get(issueType) || [];

    // Don't save if already exists
    if (existingComments.includes(comment)) {
      return;
    }

    // Append new template to file
    const newLine = `${issueType}|${comment}\n`;
    fs.appendFileSync(TEMPLATES_FILE, newLine, 'utf8');
  } catch (error) {
    logger.error('Error saving template', error);
  }
}

/**
 * Get templates for a specific issue type
 * @param {string} issueType - The vulnerability type
 * @returns {string[]} Array of comment templates
 */
export function getTemplatesForType(issueType) {
  const templates = loadTemplates();
  return templates.get(issueType) || [];
}

/**
 * Get templates for multiple issue types (for bulk updates)
 * Returns common templates that apply to all types
 * @param {string[]} issueTypes - Array of vulnerability types
 * @returns {string[]} Array of common comment templates
 */
export function getCommonTemplates(issueTypes) {
  if (!issueTypes || issueTypes.length === 0) {
    return [];
  }

  const templates = loadTemplates();

  if (issueTypes.length === 1) {
    return templates.get(issueTypes[0]) || [];
  }

  // Find templates that exist for all issue types
  const firstTypeTemplates = templates.get(issueTypes[0]) || [];

  return firstTypeTemplates.filter((template) =>
    issueTypes.every((type) => {
      const typeTemplates = templates.get(type) || [];
      return typeTemplates.includes(template);
    })
  );
}
