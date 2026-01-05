/**
 * Issue filtering and sorting utilities
 * Mirrors TUI filtering logic
 */

export function filterIssues(
  issues,
  {
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    searchText,
    filterPreset,
  }
) {
  let filtered = [...issues];

  // Apply status filter
  if (filterStatus) {
    filtered = filtered.filter((issue) => issue.Status === filterStatus);
  }

  // Apply severity filter
  if (filterSeverity) {
    filtered = filtered.filter((issue) => issue.Severity === filterSeverity);
  }

  // Apply issue type filter
  if (filterIssueType) {
    filtered = filtered.filter((issue) => issue.IssueType === filterIssueType);
  }

  // Apply JIRA filter
  if (filterJira === 'with') {
    filtered = filtered.filter((issue) => issue.ExternalId);
  } else if (filterJira === 'without') {
    filtered = filtered.filter((issue) => !issue.ExternalId);
  }

  // Apply preset filters
  if (filterPreset) {
    switch (filterPreset) {
      case 'active':
        filtered = filtered.filter((issue) =>
          ['Open', 'InProgress', 'Reopened'].includes(issue.Status)
        );
        break;
      case 'inactive':
        filtered = filtered.filter((issue) =>
          ['Noise', 'Passed', 'Fixed'].includes(issue.Status)
        );
        break;
      case 'pending':
        filtered = filtered.filter(
          (issue) => issue.Status === 'Open' && !issue.ExternalId
        );
        break;
      case 'processed':
        filtered = filtered.filter((issue) => issue.ExternalId);
        break;
      case 'low':
        filtered = filtered.filter((issue) =>
          ['Low', 'Informational'].includes(issue.Severity)
        );
        break;
      case 'medium':
        filtered = filtered.filter((issue) => issue.Severity === 'Medium');
        break;
      case 'high':
        filtered = filtered.filter((issue) =>
          ['High', 'Critical'].includes(issue.Severity)
        );
        break;
      case 'assigned':
        filtered = filtered.filter((issue) => issue.ExternalId);
        break;
      case 'unassigned':
        filtered = filtered.filter((issue) => !issue.ExternalId);
        break;
    }
  }

  // Apply search text
  if (searchText) {
    const search = searchText.toLowerCase();
    filtered = filtered.filter(
      (issue) =>
        issue.IssueType?.toLowerCase().includes(search) ||
        issue.Location?.toLowerCase().includes(search) ||
        issue.Status?.toLowerCase().includes(search) ||
        issue.Severity?.toLowerCase().includes(search)
    );
  }

  return filtered;
}

export function sortIssues(issues, sortBy = 'severity') {
  const severityOrder = {
    Critical: 5,
    High: 4,
    Medium: 3,
    Low: 2,
    Informational: 1,
  };

  const sorted = [...issues];

  switch (sortBy) {
    case 'severity':
      sorted.sort(
        (a, b) =>
          (severityOrder[b.Severity] || 0) - (severityOrder[a.Severity] || 0)
      );
      break;
    case 'name':
      sorted.sort((a, b) =>
        (a.IssueType || '').localeCompare(b.IssueType || '')
      );
      break;
    case 'status':
      sorted.sort((a, b) => (a.Status || '').localeCompare(b.Status || ''));
      break;
  }

  return sorted;
}

export function filterScans(
  scans,
  { scanSearchText, scanFilterType, hideEmptyScans }
) {
  let filtered = [...scans];

  // Apply search text
  if (scanSearchText) {
    const search = scanSearchText.toLowerCase();
    filtered = filtered.filter(
      (scan) =>
        scan.Name?.toLowerCase().includes(search) ||
        scan.Technology?.toLowerCase().includes(search)
    );
  }

  // Apply technology filter
  if (scanFilterType) {
    filtered = filtered.filter((scan) => scan.Technology === scanFilterType);
  }

  // Hide empty scans
  if (hideEmptyScans) {
    filtered = filtered.filter(
      (scan) => (scan.LatestExecution?.NIssuesFound || 0) > 0
    );
  }

  return filtered;
}
