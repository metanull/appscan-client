/**
 * Hook to get current issue from cursor position and filtered list
 * Does not store derived state - computes it on the fly
 */

import { useMemo } from 'react';
import { useStore } from '../state/AppContext.js';

export function useCurrentIssue() {
  const listCursor = useStore((state) => state.listCursor);
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  
  const currentIssue = useMemo(() => {
    const filteredIssues = getFilteredIssues();
    return filteredIssues[listCursor] || null;
  }, [listCursor, getFilteredIssues]);
  
  return currentIssue;
}
