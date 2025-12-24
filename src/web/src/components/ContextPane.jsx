import React from 'react';
import { useWebStore } from '../store/webStore';

const ContextPane = () => {
  const selectedApp = useWebStore((state) => state.selectedApp);
  const selectedScan = useWebStore((state) => state.selectedScan);
  const issues = useWebStore((state) => state.issues);

  const isViewingAll = selectedScan?.Id === '__VIEW_ALL__';

  return (
    <div
      style={{
        width: '300px',
        minWidth: '300px',
        borderRight: '2px solid #007acc',
        padding: '12px',
        overflowY: 'auto',
        backgroundColor: '#252525',
      }}
    >
      <div
        style={{ marginBottom: '16px', color: '#007acc', fontWeight: 'bold' }}
      >
        Context [c to toggle]
      </div>

      {selectedApp && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>App:</div>
          <div>{selectedApp.Name || 'Unknown'}</div>
          <div style={{ color: '#858585', fontSize: '12px' }}>
            ID: {selectedApp.Id || 'N/A'}
          </div>
          <div style={{ color: '#858585', fontSize: '12px' }}>
            Issues: {issues.length || selectedApp.IssueCountTotal || 0}
          </div>
        </div>
      )}

      {selectedScan && !isViewingAll && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Scan:</div>
          <div>{selectedScan.Name || 'Unknown'}</div>
          <div style={{ color: '#858585', fontSize: '12px' }}>
            ID: {selectedScan.Id || 'N/A'}
          </div>
          <div style={{ color: '#858585', fontSize: '12px' }}>
            Type: {selectedScan.Technology || 'N/A'}
          </div>
        </div>
      )}

      {isViewingAll && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#4ec9b0' }}>Mode:</div>
          <div style={{ color: '#4ec9b0' }}>
            Viewing all issues across all scans
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '24px',
          padding: '12px',
          border: '1px solid #4ec9b0',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: '#4ec9b0',
            marginBottom: '8px',
          }}
        >
          Hints
        </div>
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#ce9178' }}>[Space]</span> Toggle selection
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#ce9178' }}>[Enter]</span> View details
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#ce9178' }}>[u]</span> Update status
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#ce9178' }}>[j]</span> Create Jira
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextPane;
