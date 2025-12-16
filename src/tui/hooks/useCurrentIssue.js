/**
 * Hook to get current issue from cursor position and filtered list
 * Does not store derived state - computes it on the fly
 */

import { useMemo } from 'react';
import { useStore } from '../state/AppContext.js';
import { shallow } from 'zustand/shallow';
import { filterIssues } from '../utils/issue-utils.js';

export function useCurrentIssue() {
  const listCursor = useStore((state) => state.listCursor);
  const issues = useStore((state) => state.issues);
  const filterStatus = useStore((state) => state.filterStatus);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterIssueType = useStore((state) => state.filterIssueType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const sortBy = useStore((state) => state.sortBy);

  const currentIssue = useMemo(() => {
    const filteredIssues = filterIssues(issues, {
      status: filterStatus,
      severity: filterSeverity,
      issueType: filterIssueType,
      jira: filterJira,
      searchText: searchText,
      sortBy: sortBy,
    });
    return filteredIssues[listCursor] || null;
  }, [
    listCursor,
    issues,
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    searchText,
    sortBy,
  ]);

  return currentIssue;
}
