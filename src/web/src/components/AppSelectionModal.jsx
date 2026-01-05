import React, { useState, useMemo } from 'react';
import { useWebStore } from '../store/webStore';

const AppSelectionModal = () => {
  const applications = useWebStore((state) => state.applications);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'issues'

  // Helper functions matching TUI logic
  const getAppIssueCounts = (app) => {
    const inProgress = Number(app.IssuesInProgress) || 0;
    const active = Number(app.OpenIssues) || 0;
    const total = Number(app.TotalIssues) || 0;
    return { inProgress, active, total };
  };

  const getAppScanCount = (app) => {
    return (
      Number(app.ScanCount) ||
      Number(app.NumberOfScans) ||
      Number(app.TotalScans) ||
      0
    );
  };

  // Filter and sort applications
  const filteredApps = useMemo(() => {
    let filtered = [...applications];

    // Filter out applications with 0 scans
    filtered = filtered.filter((app) => getAppScanCount(app) > 0);

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.Name?.toLowerCase().includes(search) ||
          app.Description?.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.Name || '').localeCompare(b.Name || '');
      } else if (sortBy === 'issues') {
        const aCount = getAppIssueCounts(a).active;
        const bCount = getAppIssueCounts(b).active;
        return bCount - aCount; // Descending
      }
      return 0;
    });

    return filtered;
  }, [applications, searchText, sortBy]);

  const handleSelect = (app) => {
    useWebStore.getState().setSelectedApp(app);
    useWebStore.getState().setView('scan-selection');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #3e3e3e',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', color: '#007acc' }}>
          Select Application
        </h2>

        {/* Search and Sort Controls */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search applications..."
            style={{
              flex: '1 1 200px',
              padding: '8px 12px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '14px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#858585' }}>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e3e',
                borderRadius: '4px',
                color: '#cccccc',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="name">Name</option>
              <option value="issues">Active Issues</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#858585' }}>
          {filteredApps.length} of {applications.length} applications
        </div>
      </div>

      {/* Scrollable List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 20px',
        }}
      >
        {filteredApps.length === 0 ? (
          <div
            style={{
              color: '#858585',
              textAlign: 'center',
              marginTop: '40px',
              fontSize: '14px',
            }}
          >
            No applications found
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
            }}
          >
            {filteredApps.map((app) => {
              const { inProgress, active, total } = getAppIssueCounts(app);
              return (
                <div
                  key={app.Id}
                  onClick={() => handleSelect(app)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#252525',
                    border: '1px solid #3e3e3e',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d';
                    e.currentTarget.style.borderColor = '#007acc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#252525';
                    e.currentTarget.style.borderColor = '#3e3e3e';
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      fontSize: '14px',
                    }}
                  >
                    {app.Name}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#858585',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      <span
                        style={{
                          color: inProgress > 0 ? '#4ec9b0' : '#858585',
                        }}
                      >
                        {inProgress}
                      </span>{' '}
                      in progress
                    </span>
                    <span>|</span>
                    <span>
                      <span
                        style={{
                          color: active > inProgress ? '#f48771' : '#858585',
                        }}
                      >
                        {active}
                      </span>{' '}
                      active
                    </span>
                    <span>|</span>
                    <span>
                      <span style={{ color: '#858585' }}>{total}</span> total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSelectionModal;
