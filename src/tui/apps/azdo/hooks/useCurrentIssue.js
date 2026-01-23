/**
 * Hook to get current alert from cursor position and filtered list
 * Does not store derived state - computes it on the fly
 */

import { useMemo } from 'react';
import { useStore } from '../state/AppContext.js';
import { filterIssues } from '../utils/issue.js';

/**
 * Computes current alert based on cursor position and active filters
 * @returns {Object|null} Current alert object at cursor position after applying filters, or null if none
 */
export function useCurrentIssue() {
  const listCursor = useStore((state) => state.listCursor);
  const alerts = useStore((state) => state.alerts);
  const filterStatus = useStore((state) => state.filterStatus);
  const filterState = useStore((state) => state.filterState);
  const filterSeverity = useStore((state) => state.filterSeverity);
  const filterAlertType = useStore((state) => state.filterAlertType);
  const filterJira = useStore((state) => state.filterJira);
  const searchText = useStore((state) => state.searchText);
  const sortBy = useStore((state) => state.sortBy);

  const currentAlert = useMemo(() => {
    const filteredAlerts = filterIssues(alerts, {
      status: filterStatus,
      state: filterState,
      severity: filterSeverity,
      alertType: filterAlertType,
      jira: filterJira,
      searchText: searchText,
      sortBy: sortBy,
    });
    return filteredAlerts[listCursor] || null;
  }, [
    listCursor,
    alerts,
    filterStatus,
    filterState,
    filterSeverity,
    filterAlertType,
    filterJira,
    searchText,
    sortBy,
  ]);

  return currentAlert;
}
