/**
 * ASVS Utility Functions
 * Handle ASVS control references stored in AppScan issue comments
 * Format: [ASVS:label:url]
 */

/**
 * Create ASVS comment string
 * @param {string} label - ASVS label (e.g., "asvs1.2.3")
 * @param {string} url - Confluence URL
 * @returns {string} Formatted comment
 */
export function createAVSComment(label, url) {
  return `[ASVS:${label}:${url}]`;
}

/**
 * Parse ASVS info from issue comments
 * @param {Array} comments - Array of comment objects
 * @returns {Object|null} {label, url} or null if not found
 */
export function parseAVSFromComments(comments) {
  if (!comments || !Array.isArray(comments)) return null;

  for (const comment of comments) {
    const text = comment.Comment || '';
    const match = text.match(/\[ASVS:([^:]+):([^\]]+)\]/);
    if (match) {
      return {
        label: match[1],
        url: match[2],
      };
    }
  }

  return null;
}

/**
 * Check if issue has ASVS control
 * @param {Object} issue - Issue object with comments
 * @returns {boolean}
 */
export function hasAVSControl(issue) {
  return parseAVSFromComments(issue.comments) !== null;
}
