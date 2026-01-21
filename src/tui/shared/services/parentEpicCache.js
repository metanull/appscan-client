/**
 * Parent Epic Cache Service
 * Simple in-memory cache for parent EPIC references
 */

const epicCache = [];

/**
 * Load parent epic cache
 * @returns {Array<string>} Array of epic keys
 */
export function loadParentEpics() {
  return [...epicCache];
}

/**
 * Save parent epic to cache
 * @param {string} epicKey - The epic key (e.g., "SEC-123")
 */
export function saveParentEpic(epicKey) {
  if (!epicKey || !epicKey.trim()) {
    return;
  }

  const trimmedKey = epicKey.trim();

  if (epicCache.includes(trimmedKey)) {
    return;
  }

  epicCache.push(trimmedKey);

  if (epicCache.length > 10) {
    epicCache.shift();
  }
}

/**
 * Get the most recently used parent epic
 * @returns {string|null} The most recent epic key or null
 */
export function getLastUsedEpic() {
  return epicCache.length > 0 ? epicCache[epicCache.length - 1] : null;
}
