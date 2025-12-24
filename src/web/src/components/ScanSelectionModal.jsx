import React, { useMemo } from 'react';
import { useWebStore } from '../store/webStore';
import { filterScans } from '../utils/filters';

const ScanSelectionModal = () => {
  const scans = useWebStore((state) => state.scans);
  const selectedApp = useWebStore((state) => state.selectedApp);
  const scanSearchText = useWebStore((state) => state.scanSearchText);
  const scanFilterType = useWebStore((state) => state.scanFilterType);
  const hideEmptyScans = useWebStore((state) => state.hideEmptyScans);

  const filteredScans = useMemo(
    () =>
      filterScans(scans, { scanSearchText, scanFilterType, hideEmptyScans }),
    [scans, scanSearchText, scanFilterType, hideEmptyScans]
  );

  const handleSelect = (scan) => {
    useWebStore.getState().setSelectedScan(scan);
    useWebStore.getState().setView('issue-list');
  };

  const handleBack = () => {
    useWebStore.getState().goBack();
  };

  const handleViewAll = () => {
    const allScan = {
      Id: '__VIEW_ALL__',
      Name: 'All Issues',
      _isViewAll: true,
    };
    useWebStore.getState().setSelectedScan(allScan);
    useWebStore.getState().setView('issue-list');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#007acc' }}>Select Scan - {selectedApp?.Name}</h2>
        <button
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3e3e3e',
            color: '#d4d4d4',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      <button
        onClick={handleViewAll}
        style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#252525',
          color: '#4ec9b0',
          border: '2px solid #4ec9b0',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        View All Issues (All Scans)
      </button>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredScans.length === 0 ? (
          <div
            style={{ color: '#858585', textAlign: 'center', marginTop: '40px' }}
          >
            No scans found
          </div>
        ) : (
          filteredScans.map((scan) => (
            <div
              key={scan.Id}
              onClick={() => handleSelect(scan)}
              style={{
                padding: '16px',
                marginBottom: '8px',
                backgroundColor: '#252525',
                border: '1px solid #3e3e3e',
                borderRadius: '4px',
                cursor: 'pointer',
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
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {scan.Name}
              </div>
              <div style={{ fontSize: '12px', color: '#858585' }}>
                Type: {scan.Technology || 'N/A'} | Issues:{' '}
                {scan.LatestExecution?.NIssuesFound || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScanSelectionModal;
