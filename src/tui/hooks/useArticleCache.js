/**
 * Hook to get article from cache or fetch it with debounce
 * Prevents excessive API calls during rapid cursor movement
 */

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../state/AppContext.js';
import { debounce } from '../../utils/debounce.js';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_DEBOUNCE_DELAY = 300; // 300ms

export function useArticleCache(issueId, fetchFunction) {
  const articleCache = useStore((state) => state.articleCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create debounced fetch function - use getState() to avoid setter dependency
  const debouncedFetch = useCallback(
    debounce(async (id) => {
      if (!id || !fetchFunction) return;

      setLoading(true);
      setError(null);

      try {
        const content = await fetchFunction(id);
        useStore.getState().setArticleCache(id, content); // Use getState() instead of prop
      } catch (err) {
        setError(err.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    }, FETCH_DEBOUNCE_DELAY),
    [fetchFunction] // Only depend on fetchFunction, not setArticleCache
  );

  useEffect(() => {
    if (!issueId) {
      return;
    }

    // Check cache first
    const cached = articleCache[issueId];
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
  }, [issueId, articleCache, debouncedFetch]);

  const cachedData = articleCache[issueId];
  return {
    content: cachedData?.content || null,
    loading,
    error,
    isCached: !!cachedData,
  };
}
