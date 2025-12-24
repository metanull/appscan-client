import React from 'react';
import { useWebStore } from '../store/webStore';

const AppSelectionModal = () => {
  const applications = useWebStore((state) => state.applications);

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
        padding: '20px',
      }}
    >
      <h2 style={{ marginBottom: '20px', color: '#007acc' }}>
        Select Application
      </h2>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {applications.length === 0 ? (
          <div
            style={{ color: '#858585', textAlign: 'center', marginTop: '40px' }}
          >
            No applications found
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.Id}
              onClick={() => handleSelect(app)}
              style={{
                padding: '16px',
                marginBottom: '8px',
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
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {app.Name}
              </div>
              <div style={{ fontSize: '12px', color: '#858585' }}>
                Issues: {app.IssueCountTotal || 0} | Risk:{' '}
                {app.RiskRating || 'N/A'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppSelectionModal;
