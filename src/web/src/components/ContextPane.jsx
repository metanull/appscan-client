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
        position: 'relative',
      }}
    >
      <div
        style={{
          marginBottom: '16px',
          color: '#007acc',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>Context</span>
        <button
          onClick={() => useWebStore.getState().toggleContextPane()}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#007acc',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px',
          }}
          title="Hide Context Pane"
        >
          &#xab;&#xab;
        </button>
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
    </div>
  );
};

export default ContextPane;
