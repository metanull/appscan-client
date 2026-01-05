import React, { useEffect, useCallback } from 'react';
import { useWebStore } from './store/webStore';
import { apiClient } from './api/client';
import Layout from './components/Layout';
import ContextPane from './components/ContextPane';
import IssueList from './components/IssueList';
import DetailsPreview from './components/DetailsPreview';
import AppSelectionModal from './components/AppSelectionModal';
import ScanSelectionModal from './components/ScanSelectionModal';
import IssueDetailsModal from './components/IssueDetailsModal';
import FilterModal from './components/FilterModal';
import SearchModal from './components/SearchModal';
import UpdateStatusModal from './components/UpdateStatusModal';
import CreateJiraModal from './components/CreateJiraModal';
import LinkJiraModal from './components/LinkJiraModal';
import UnlinkJiraModal from './components/UnlinkJiraModal';
import HelpModal from './components/HelpModal';
import LinksModal from './components/LinksModal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const view = useWebStore((state) => state.view);
  const selectedApp = useWebStore((state) => state.selectedApp);
  const selectedScan = useWebStore((state) => state.selectedScan);
  const selectedIssue = useWebStore((state) => state.selectedIssue);
  const showContextPane = useWebStore((state) => state.showContextPane);
  const loading = useWebStore((state) => state.loading);
  const error = useWebStore((state) => state.error);

  const showHelpModal = useWebStore((state) => state.showHelpModal);
  const showFilterModal = useWebStore((state) => state.showFilterModal);
  const showSearchModal = useWebStore((state) => state.showSearchModal);
  const showLinksModal = useWebStore((state) => state.showLinksModal);
  const showUpdateStatusModal = useWebStore(
    (state) => state.showUpdateStatusModal
  );
  const showCreateJiraModal = useWebStore((state) => state.showCreateJiraModal);
  const showLinkJiraModal = useWebStore((state) => state.showLinkJiraModal);
  const showUnlinkJiraModal = useWebStore((state) => state.showUnlinkJiraModal);
  const showIssueDetailsModal = useWebStore(
    (state) => state.showIssueDetailsModal
  );

  // Load initial data
  useEffect(() => {
    const loadApplications = async () => {
      try {
        useWebStore.getState().setLoading(true);
        useWebStore.getState().setError(null);
        
        const response = await apiClient.getApplications();
        useWebStore.getState().setApplications(response);
      } catch (err) {
        useWebStore.getState().setError(err.message);
      } finally {
        useWebStore.getState().setLoading(false);
      }
    };

    if (view === 'app-selection') {
      loadApplications();
    }
  }, [view]);

  // Load scans when app is selected
  useEffect(() => {
    const loadScans = async () => {
      if (!selectedApp) return;

      try {
        useWebStore.getState().setLoading(true);
        useWebStore.getState().setError(null);
        
        const scans = await apiClient.getScans(selectedApp.Id);
        useWebStore.getState().setScans(scans);
      } catch (err) {
        useWebStore.getState().setError(err.message);
      } finally {
        useWebStore.getState().setLoading(false);
      }
    };

    if (view === 'scan-selection' && selectedApp) {
      loadScans();
    }
  }, [view, selectedApp]);

  // Load issues when scan is selected
  useEffect(() => {
    const loadIssues = async () => {
      if (!selectedScan) return;

      try {
        useWebStore.getState().setLoading(true);
        const excludeStatus = useWebStore.getState().excludePassedNoise
          ? 'Noise,Passed'
          : '';

        const issues =
          selectedScan.Id === '__VIEW_ALL__'
            ? await apiClient.getAllIssuesForApp(selectedApp.Id, excludeStatus)
            : await apiClient.getIssues(selectedScan.Id, excludeStatus);

        useWebStore.getState().setIssues(issues);
      } catch (err) {
        useWebStore.getState().setError(err.message);
      } finally {
        useWebStore.getState().setLoading(false);
      }
    };

    if (view === 'issue-list' && selectedScan) {
      loadIssues();
    }
  }, [view, selectedScan, selectedApp]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    const state = useWebStore.getState();

    // Don't handle shortcuts if a modal is open or input is focused
    if (
      state.showHelpModal ||
      state.showFilterModal ||
      state.showSearchModal ||
      state.showLinksModal ||
      state.showUpdateStatusModal ||
      state.showCreateJiraModal ||
      state.showLinkJiraModal ||
      state.showUnlinkJiraModal ||
      state.showIssueDetailsModal ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA'
    ) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (state.view !== 'app-selection') {
          state.goBack();
        }
        break;
      case 'a':
        if (state.view === 'issue-list') {
          state.setView('app-selection');
        }
        break;
      case 's':
        if (state.view === 'issue-list') {
          state.setView('scan-selection');
        }
        break;
      case 'f':
        if (state.view === 'issue-list') {
          state.setShowFilterModal(true);
        }
        break;
      case '/':
        if (state.view === 'issue-list') {
          e.preventDefault();
          state.setShowSearchModal(true);
        }
        break;
      case 'l':
        if (state.view === 'issue-list' && state.selectedIssue) {
          state.setShowLinksModal(true);
        }
        break;
      case 'u':
        if (state.view === 'issue-list' && state.selectedIssueIds.length > 0) {
          state.setShowUpdateStatusModal(true);
        }
        break;
      case 'j':
        if (state.view === 'issue-list' && state.selectedIssueIds.length > 0) {
          state.setShowCreateJiraModal(true);
        }
        break;
      case 'c':
        state.toggleContextPane();
        break;
      case 'r':
        if (state.view === 'issue-list') {
          window.location.reload();
        }
        break;
      case 'h':
      case '?':
        state.setShowHelpModal(true);
        break;
      case 'q':
        window.close();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ErrorBoundary>
      <Layout>
        {showContextPane && view === 'issue-list' && <ContextPane />}

        {view === 'app-selection' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AppSelectionModal />
          </div>
        )}
        
        {view === 'scan-selection' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScanSelectionModal />
          </div>
        )}
        
        {view === 'issue-list' && (
          <>
            <IssueList />
            {showIssueDetailsModal && selectedIssue && (
              <div
                style={{
                  width: '700px',
                  minWidth: '700px',
                  borderLeft: '2px solid #007acc',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <IssueDetailsModal isPermanentPane={true} />
              </div>
            )}
          </>
        )}

        {loading && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #3e3e3e',
                  borderTop: '4px solid #007acc',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ fontSize: '16px', color: '#007acc' }}>Loading...</div>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              padding: '12px 20px',
              background: '#f44336',
              color: 'white',
              borderRadius: '4px',
              zIndex: 9999,
            }}
          >
            {error}
          </div>
        )}

        {showHelpModal && <HelpModal />}
        {showFilterModal && <FilterModal />}
        {showSearchModal && <SearchModal />}
        {showLinksModal && <LinksModal />}
        {showUpdateStatusModal && <UpdateStatusModal />}
        {showCreateJiraModal && <CreateJiraModal />}
        {showLinkJiraModal && <LinkJiraModal />}
        {showUnlinkJiraModal && <UnlinkJiraModal />}
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
