import React, { useMemo } from 'react';
import { useWebStore } from '../store/webStore';
import { filterIssues, sortIssues } from '../utils/filters';

const IssueList = () => {
  const issues = useWebStore((state) => state.issues);
  const selectedApp = useWebStore((state) => state.selectedApp);
  const _selectedScan = useWebStore((state) => state.selectedScan);
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const selectedIssueIds = useWebStore((state) => state.selectedIssueIds);
  const filterStatus = useWebStore((state) => state.filterStatus);
  const filterSeverity = useWebStore((state) => state.filterSeverity);
  const filterIssueType = useWebStore((state) => state.filterIssueType);
  const filterJira = useWebStore((state) => state.filterJira);
  const searchText = useWebStore((state) => state.searchText);
  const filterPreset = useWebStore((state) => state.filterPreset);
  const sortBy = useWebStore((state) => state.sortBy);

  const jiraBaseUrl = process.env.JIRA_HOST || 'https://jira.example.com';

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
      {/* Toolbar */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3e3e3e',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          backgroundColor: '#252525',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>
          Vulnerabilities ({filteredAndSorted.length} / {issues.length})
          {selectedIssueIds.length > 0 && (
            <span
              style={{ marginLeft: '8px', color: '#858585', fontSize: '12px' }}
            >
              ({selectedIssueIds.length} selected)
            </span>
          )}
        </span>

        <button
          onClick={() => useWebStore.getState().setView('app-selection')}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Change Application"
        >
          📁 App
        </button>

        <button
          onClick={() => useWebStore.getState().setView('scan-selection')}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Change Scan"
        >
          🔍 Scan
        </button>

        <button
          onClick={() => useWebStore.getState().setShowFilterModal(true)}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Filter Issues"
        >
          🔧 Filter
        </button>

        <button
          onClick={() => useWebStore.getState().setShowSearchModal(true)}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Search Issues"
        >
          🔎 Search
        </button>

        <button
          onClick={() => useWebStore.getState().setShowUpdateStatusModal(true)}
          disabled={selectedIssueIds.length === 0}
          style={{
            padding: '4px 12px',
            backgroundColor:
              selectedIssueIds.length > 0 ? '#0e639c' : '#3e3e3e',
            color: selectedIssueIds.length > 0 ? '#fff' : '#858585',
            border: 'none',
            borderRadius: '3px',
            cursor: selectedIssueIds.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
          title="Update Status"
        >
          ✏️ Update
        </button>

        <button
          onClick={() => useWebStore.getState().setShowCreateJiraModal(true)}
          disabled={selectedIssueIds.length === 0}
          style={{
            padding: '4px 12px',
            backgroundColor:
              selectedIssueIds.length > 0 ? '#0e639c' : '#3e3e3e',
            color: selectedIssueIds.length > 0 ? '#fff' : '#858585',
            border: 'none',
            borderRadius: '3px',
            cursor: selectedIssueIds.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
          title="Create Jira Issue"
        >
          🎫 Jira
        </button>

        {selectedIssue && (
          <button
            onClick={() => useWebStore.getState().setShowLinksModal(true)}
            style={{
              padding: '4px 12px',
              backgroundColor: '#0e639c',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            title="View Links"
          >
            🔗 Links
          </button>
        )}

        <button
          onClick={() => useWebStore.getState().toggleContextPane()}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Toggle Context Pane"
        >
          📄 Context
        </button>

        <button
          onClick={() => useWebStore.getState().setShowHelpModal(true)}
          style={{
            padding: '4px 12px',
            backgroundColor: '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Help"
        >
          ❓ Help
        </button>
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
        <div style={{ width: '140px' }}>Actions</div>
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
                  {issue.ExternalId ? (
                    <a
                      href={`${jiraBaseUrl}/browse/${issue.ExternalId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#4fc1ff',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {issue.ExternalId}
                    </a>
                  ) : (
                    '-'
                  )}
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
                <div
                  style={{
                    width: '140px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const baseUrl =
                        process.env.APPSCAN_BASE_URL ||
                        'https://cloud.appscan.com';
                      window.open(
                        `${baseUrl}/main/myapps/${selectedApp?.Id}/issues/${issue.Id}`,
                        '_blank'
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#0e639c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                    title="Open in AppScan"
                  >
                    🐛
                  </button>
                  {issue.ExternalId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `${jiraBaseUrl}/browse/${issue.ExternalId}`,
                          '_blank'
                        );
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#0e639c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      title="Open in Jira"
                    >
                      🎫
                    </button>
                  )}
                  {issue.SourceFileUri && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(issue.SourceFileUri, '_blank');
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#0e639c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      title="Open in Azure DevOps"
                    >
                      🔗
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IssueList;
