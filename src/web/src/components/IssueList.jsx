import React, { useMemo } from 'react';
import { useWebStore } from '../store/webStore';
import { filterIssues, sortIssues } from '../utils/filters';

const IssueList = () => {
  const issues = useWebStore((state) => state.issues);
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const selectedIssueIds = useWebStore((state) => state.selectedIssueIds);
  const filterStatus = useWebStore((state) => state.filterStatus);
  const filterSeverity = useWebStore((state) => state.filterSeverity);
  const filterIssueType = useWebStore((state) => state.filterIssueType);
  const filterJira = useWebStore((state) => state.filterJira);
  const searchText = useWebStore((state) => state.searchText);
  const filterPreset = useWebStore((state) => state.filterPreset);
  const sortBy = useWebStore((state) => state.sortBy);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterIssues(issues, {
      filterStatus,
      filterSeverity,
      filterIssueType,
      filterJira,
      searchText,
      filterPreset,
    });
    return sortIssues(filtered, sortBy);
  }, [
    issues,
    filterStatus,
    filterSeverity,
    filterIssueType,
    filterJira,
    searchText,
    filterPreset,
    sortBy,
  ]);

  const handleIssueClick = (issue) => {
    useWebStore.getState().setSelectedIssue(issue);
  };

  const handleIssueDoubleClick = (issue) => {
    useWebStore.getState().setSelectedIssue(issue);
    useWebStore.getState().setShowIssueDetailsModal(true);
  };

  const handleToggleSelection = (e, issueId) => {
    e.stopPropagation();
    useWebStore.getState().toggleIssueSelection(issueId);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: '#f44336',
      High: '#f44336',
      Medium: '#ff9800',
      Low: '#2196f3',
      Informational: '#9e9e9e',
    };
    return colors[severity] || '#d4d4d4';
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #3e3e3e',
        backgroundColor: '#1e1e1e',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3e3e3e',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#252525',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>
          Vulnerabilities ({filteredAndSorted.length} / {issues.length})
        </span>
        <span style={{ fontSize: '12px', color: '#858585' }}>
          {selectedIssueIds.length > 0 && `${selectedIssueIds.length} selected`}
        </span>
      </div>

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          padding: '8px 12px',
          borderBottom: '1px solid #3e3e3e',
          backgroundColor: '#2d2d2d',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#858585',
        }}
      >
        <div style={{ width: '40px' }}></div>
        <div style={{ width: '120px' }}>Severity</div>
        <div style={{ width: '120px' }}>Status</div>
        <div style={{ width: '120px' }}>Jira</div>
        <div style={{ flex: 1 }}>Issue Type</div>
      </div>

      {/* Issue rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredAndSorted.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#858585',
            }}
          >
            No issues found
          </div>
        ) : (
          filteredAndSorted.map((issue) => {
            const isSelected = selectedIssue?.Id === issue.Id;
            const isMultiSelected = selectedIssueIds.includes(issue.Id);

            return (
              <div
                key={issue.Id}
                onClick={() => handleIssueClick(issue)}
                onDoubleClick={() => handleIssueDoubleClick(issue)}
                style={{
                  display: 'flex',
                  padding: '8px 12px',
                  borderBottom: '1px solid #2d2d2d',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#264f78' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isMultiSelected}
                    onChange={(e) => handleToggleSelection(e, issue.Id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div
                  style={{
                    width: '120px',
                    color: getSeverityColor(issue.Severity),
                    fontWeight: 'bold',
                  }}
                >
                  {issue.Severity || 'Unknown'}
                </div>
                <div style={{ width: '120px' }}>
                  {issue.Status || 'Unknown'}
                </div>
                <div
                  style={{
                    width: '120px',
                    color: issue.ExternalId ? '#4ec9b0' : '#858585',
                  }}
                >
                  {issue.ExternalId || '-'}
                </div>
                <div
                  style={{
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {issue.IssueType || 'Unknown'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with keyboard hints */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #3e3e3e',
          backgroundColor: '#252525',
          fontSize: '12px',
          color: '#858585',
        }}
      >
        [Space] Toggle • [Enter] Details • [f] Filter • [/] Search • [u] Update
        • [j] Jira • [h] Help
      </div>
    </div>
  );
};

export default IssueList;
