/**
 * Hook to get article from cache or fetch it with debounce
 * Prevents excessive API calls during rapid cursor movement
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../state/AppContext.js';
import { debounce } from '../../utils/debounce.js';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_DEBOUNCE_DELAY = 300; // 300ms

export function useArticleCache(issueId, fetchFunction) {
  const articleCache = useStore((state) => state.articleCache);
  const setArticleCache = useStore((state) => state.setArticleCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchRef = useRef(null);

  // Create debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (id) => {
      if (!id || !fetchFunction) return;

      setLoading(true);
      setError(null);

      try {
        const content = await fetchFunction(id);
        setArticleCache(id, content);
      } catch (err) {
        setError(err.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    }, FETCH_DEBOUNCE_DELAY),
    [fetchFunction, setArticleCache]
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
