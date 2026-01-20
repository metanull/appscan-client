/**
 * Hook to get current alert from cursor position and filtered list
 * Does not store derived state - computes it on the fly
 */

import { useMemo } from 'react';
import { useAzdoStore } from '../state/AppContextAzdo.js';
import { filterAlerts } from '../utils/azdo-issue-utils.js';

/**
 * Computes current alert based on cursor position and active filters
 * @returns {Object|null} Current alert object at cursor position after applying filters, or null if none
 */
export function useCurrentAlert() {
  const listCursor = useAzdoStore((state) => state.listCursor);
  const alerts = useAzdoStore((state) => state.alerts);
  const filterState = useAzdoStore((state) => state.filterState);
  const filterSeverity = useAzdoStore((state) => state.filterSeverity);
  const filterAlertType = useAzdoStore((state) => state.filterAlertType);
  const filterJira = useAzdoStore((state) => state.filterJira);
  const searchText = useAzdoStore((state) => state.searchText);
  const sortBy = useAzdoStore((state) => state.sortBy);

  const currentAlert = useMemo(() => {
    const filteredAlerts = filterAlerts(alerts, {
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
    filterState,
    filterSeverity,
    filterAlertType,
    filterJira,
    searchText,
    sortBy,
  ]);

  return currentAlert;
}
