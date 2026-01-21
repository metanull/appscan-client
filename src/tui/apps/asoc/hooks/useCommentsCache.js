/**
 * Hook to get comments from cache or fetch them with debounce
 * Prevents excessive API calls during rapid cursor movement
 */

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../state/AppContext.js';
import { debounce } from '../../../../utils/debounce.js';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_DEBOUNCE_DELAY = 300; // 300ms

/**
 * Caches and retrieves issue comments to minimize API calls with debounced fetching
 * @param {string} issueId - The issue ID to fetch comments for
 * @param {Function} fetchFunction - Async function that fetches comments for given ID
 * @returns {{comments: Array, loading: boolean, error: string|null, isCached: boolean}} Comments array, loading state, error message, and cache status
 */
export function useCommentsCache(issueId, fetchFunction) {
  const commentsCache = useStore((state) => state.commentsCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // use getState() to avoid setter dependency
  const debouncedFetch = useCallback(
    debounce(async (id) => {
      if (!id || !fetchFunction) return;

      setLoading(true);
      setError(null);

      try {
        const comments = await fetchFunction(id);
        useStore.getState().setCommentsCache(id, comments);
      } catch (err) {
        setError(err.message || 'Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    }, FETCH_DEBOUNCE_DELAY),
    [fetchFunction]
  );

  useEffect(() => {
    if (!issueId) {
      return;
    }

    // Check cache first
    const cached = commentsCache[issueId];
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        // Cache is fresh, don't fetch
        return;
      }
    }

    // Fetch with debounce
    debouncedFetch(issueId);

    return () => {
      debouncedFetch.cancel && debouncedFetch.cancel();
    };
  }, [issueId, commentsCache, debouncedFetch]);

  const cachedData = commentsCache[issueId];
  return {
    comments: cachedData?.comments || [],
    loading,
    error,
    isCached: !!cachedData,
  };
}
