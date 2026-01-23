/**
 * Alert Count Cache Service
 * Provides persistent caching for project/repository alert counts
 * Stores counts by state for displaying open/in-progress/total
 */

import fs from 'fs';
import { getAlertCountCachePath } from '../../../utils/config-paths.js';
import logger from '../../../utils/logger.js';

const CACHE_FILE = getAlertCountCachePath();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * @typedef {Object} AlertCountByState
 * @property {number} open - Count of active alerts (state = active)
 * @property {number} inProgress - Count of in-progress alerts (state = dismissed, reason = unknown)
 * @property {number} total - Total count (open + inProgress)
 * @property {number} timestamp - When this count was fetched
 */

/**
 * @typedef {Object} CacheEntry
 * @property {AlertCountByState} counts - Alert counts by state
 * @property {number} timestamp - When this entry was cached
 */

/**
 * @typedef {Object} CacheData
 * @property {Object.<string, CacheEntry>} projects - Project counts keyed by project ID
 * @property {Object.<string, CacheEntry>} repositories - Repository counts keyed by "projectId:repoId"
 */

let memoryCache = null;

/**
 * Load cache from disk
 * @returns {CacheData}
 */
function loadCache() {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf8');
      memoryCache = JSON.parse(content);
      return memoryCache;
    }
  } catch (err) {
    logger.warn('Failed to load alert count cache', { error: err.message });
  }

  memoryCache = { projects: {}, repositories: {} };
  return memoryCache;
}

/**
 * Save cache to disk
 */
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryCache, null, 2), 'utf8');
  } catch (err) {
    logger.warn('Failed to save alert count cache', { error: err.message });
  }
}

/**
 * Get cached project alert counts
 * @param {string} projectId - Project ID
 * @returns {AlertCountByState|null} Cached counts or null if not cached/expired
 */
export function getProjectCounts(projectId) {
  const cache = loadCache();
  const entry = cache.projects[projectId];

  if (!entry) return null;

  return entry.counts;
}

/**
 * Get cached repository alert counts
 * @param {string} projectId - Project ID
 * @param {string} repoId - Repository ID
 * @returns {AlertCountByState|null} Cached counts or null if not cached/expired
 */
export function getRepositoryCounts(projectId, repoId) {
  const cache = loadCache();
  const key = `${projectId}:${repoId}`;
  const entry = cache.repositories[key];

  if (!entry) return null;

  return entry.counts;
}

/**
 * Set project alert counts in cache
 * @param {string} projectId - Project ID
 * @param {AlertCountByState} counts - Alert counts by state
 */
export function setProjectCounts(projectId, counts) {
  const cache = loadCache();
  cache.projects[projectId] = {
    counts,
    timestamp: Date.now(),
  };
  saveCache();
}

/**
 * Set repository alert counts in cache
 * @param {string} projectId - Project ID
 * @param {string} repoId - Repository ID
 * @param {AlertCountByState} counts - Alert counts by state
 */
export function setRepositoryCounts(projectId, repoId, counts) {
  const cache = loadCache();
  const key = `${projectId}:${repoId}`;
  cache.repositories[key] = {
    counts,
    timestamp: Date.now(),
  };
  saveCache();
}

/**
 * Check if a cache entry is still fresh
 * @param {number} timestamp - Entry timestamp
 * @returns {boolean} True if fresh
 */
export function isFresh(timestamp) {
  return Date.now() - timestamp < CACHE_TTL_MS;
}

/**
 * Get all cached project counts (for initial display)
 * @returns {Object.<string, AlertCountByState>} Map of project ID to counts
 */
export function getAllProjectCounts() {
  const cache = loadCache();
  const result = {};

  for (const [projectId, entry] of Object.entries(cache.projects)) {
    result[projectId] = entry.counts;
  }

  return result;
}

/**
 * Get all cached repository counts for a project (for initial display)
 * @param {string} projectId - Project ID
 * @returns {Object.<string, AlertCountByState>} Map of repo ID to counts
 */
export function getAllRepositoryCounts(projectId) {
  const cache = loadCache();
  const result = {};
  const prefix = `${projectId}:`;

  for (const [key, entry] of Object.entries(cache.repositories)) {
    if (key.startsWith(prefix)) {
      const repoId = key.slice(prefix.length);
      result[repoId] = entry.counts;
    }
  }

  return result;
}

/**
 * Clear all cached data
 */
export function clearCache() {
  memoryCache = { projects: {}, repositories: {} };
  saveCache();
}

/**
 * Calculate alert counts by state from a list of alerts
 * @param {Array} alerts - Array of alert objects
 * @returns {AlertCountByState} Calculated counts
 */
export function calculateCountsFromAlerts(alerts) {
  let open = 0;
  let inProgress = 0;

  for (const alert of alerts) {
    // state = 1 (Active) => open
    if (alert.state === 1 || alert.state === 'Active') {
      open++;
    }
    // state = 2 (Dismissed) + dismissedReason = 0 (Unknown) => in progress
    else if (
      (alert.state === 2 || alert.state === 'Dismissed') &&
      (alert.dismissedReason === 0 || alert.dismissedReason === 'Unknown')
    ) {
      inProgress++;
    }
  }

  return {
    open,
    inProgress,
    total: alerts.length,
    timestamp: Date.now(),
  };
}

/**
 * Utility to run async tasks in parallel batches
 * @param {Array<Function>} tasks - Array of async functions to execute
 * @param {number} batchSize - Number of concurrent tasks
 * @param {Function} [onProgress] - Optional callback called after each task completes
 * @returns {Promise<Array>} Results from all tasks
 */
export async function runInBatches(tasks, batchSize = 5, onProgress = null) {
  const results = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));

    for (const result of batchResults) {
      results.push(result);
      if (onProgress) {
        onProgress(result, results.length, tasks.length);
      }
    }
  }

  return results;
}
