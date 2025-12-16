/**
 * InkApp - Main TUI Application
 * Optimized 3-pane layout with memoization and no render loops
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { useStore } from '../state/AppContext.js';
import { Layout } from './components/Layout.js';
import { Panel } from './components/Panel.js';
import { ScrollableList } from './components/ScrollableList.js';
import { AppSelectionModal } from './components/AppSelectionModal.js';
import { ScanSelectionModal } from './components/ScanSelectionModal.js';
import { IssueDetailsModal } from './components/IssueDetailsModal.js';
import { HelpModal } from './components/HelpModal.js';
import { FilterModal } from './FilterModal.js';
import { SearchModal } from './SearchModal.js';
import { LinksModal } from './components/LinksModal.js';
import { UpdateStatusModal } from './UpdateStatusModal.js';
import { CreateJiraModal } from './CreateJiraModal.js';
import { AppScanService } from '../services/appscan.js';
import { JiraService } from '../services/jira.js';
import { useCurrentIssue } from '../hooks/useCurrentIssue.js';
import { useArticleCache } from '../hooks/useArticleCache.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import logger from '../utils/logger.js';

/**
 * Context Pane - Shows selected app/scan info
 */
const ContextPane = React.memo(({ app, scan, onToggle: _onToggle }) => {
  if (!app && !scan) return null;

  return (
    <Panel title="Context [c to toggle]" borderColor="blue" width={25}>
      {app && (
        <Box flexDirection="column">
          <Text bold>App: </Text>
          <Text wrap="truncate">{app.Name || 'Unknown'}</Text>
          <Text dimColor>Issues: {app.IssueCountTotal || 0}</Text>
        </Box>
      )}
      {scan && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>Scan: </Text>
          <Text wrap="truncate">{scan.Name || 'Unknown'}</Text>
          <Text dimColor>Type: {scan.Technology || 'N/A'}</Text>
        </Box>
      )}
    </Panel>
  );
});
ContextPane.displayName = 'ContextPane';

/**
 * Vulnerability List Row - Memoized
 */
const VulnRow = React.memo(({ issue, isSelected }) => {
  const severity = issue.Severity || 'Unknown';
  const status = issue.Status || 'Unknown';
  const type = issue.IssueType || 'Unknown';

  const severityColor = {
    Critical: 'red',
    High: 'red',
    Medium: 'yellow',
    Low: 'blue',
    Informational: 'gray',
  }[severity] || 'white';

  return (
    <Box>
      <Box width={3}>
        <Text color={isSelected ? 'cyan' : undefined}>{isSelected ? '▶' : ' '}</Text>
      </Box>
      <Box width={12}>
        <Text color={severityColor} bold={isSelected}>{severity}</Text>
      </Box>
      <Box width={15}>
        <Text color={isSelected ? 'cyan' : undefined}>{status}</Text>
      </Box>
      <Box flexGrow={1}>
        <Text color={isSelected ? 'cyan' : undefined} wrap="truncate-end">
          {type}
        </Text>
      </Box>
    </Box>
  );
});
VulnRow.displayName = 'VulnRow';

/**
 * Vulnerability List Panel
 */
const VulnListPanel = React.memo(({ issues, cursor, onCursorChange: _onCursorChange, height }) => {
  const renderItem = useCallback((issue, isSelected) => {
    return <VulnRow issue={issue} isSelected={isSelected} />;
  }, []);

  return (
    <Panel title={`Vulnerabilities (${issues.length})`} borderColor="cyan" flexGrow={1}>
      <ScrollableList
        items={issues}
        cursor={cursor}
        renderItem={renderItem}
        visibleRows={height - 5}
        emptyMessage="No vulnerabilities found"
      />
    </Panel>
  );
});
VulnListPanel.displayName = 'VulnListPanel';

/**
 * Details Preview Panel
 */
const DetailsPreviewPanel = React.memo(({ issue, articleContent, loading }) => {
  if (!issue) {
    return (
      <Panel title="Details" borderColor="magenta" width={40}>
        <Text dimColor>Select an issue to view details</Text>
      </Panel>
    );
  }

  return (
    <Panel title="Details" borderColor="magenta" width={40}>
      <Box flexDirection="column">
        <Text><Text bold>Type:</Text> {issue.IssueType || 'N/A'}</Text>
        <Text><Text bold>Severity:</Text> {issue.Severity || 'N/A'}</Text>
        <Text><Text bold>Status:</Text> {issue.Status || 'N/A'}</Text>
        {issue.Location && (
          <Text wrap="truncate"><Text bold>Location:</Text> {issue.Location}</Text>
        )}
        {loading && (
          <Box marginTop={1}>
            <Spinner /> <Text> Loading article...</Text>
          </Box>
        )}
        {articleContent && !loading && (
          <Box marginTop={1}>
            <Text dimColor>Press Enter for full details</Text>
          </Box>
        )}
      </Box>
    </Panel>
  );
});
DetailsPreviewPanel.displayName = 'DetailsPreviewPanel';

/**
 * Status Bar
 */
const StatusBar = React.memo(({ error, loading, message }) => {
  return (
    <Box borderStyle="single" borderTop paddingX={1}>
      {error && <Text color="red">Error: {error}</Text>}
      {loading && !error && (
        <Box>
          <Spinner /> <Text> {message || 'Loading...'}</Text>
        </Box>
      )}
      {!error && !loading && (
        <Text dimColor>
          Press ? for help | a: App | s: Scan | f: Filter | q: Quit
        </Text>
      )}
    </Box>
  );
});
StatusBar.displayName = 'StatusBar';

/**
 * Main InkApp Component
 */
export const InkApp = ({ configPath }) => {
  const { exit } = useApp();
  const { height } = useTerminalSize();

  // Services
  const [appScanService] = useState(() => new AppScanService(configPath));
  const [jiraService] = useState(() => new JiraService(appScanService.getConfig()));

  // Zustand state
  const selectedApp = useStore((state) => state.selectedApp);
  const selectedScan = useStore((state) => state.selectedScan);
  const applications = useStore((state) => state.applications);
  const scans = useStore((state) => state.scans);
  const listCursor = useStore((state) => state.listCursor);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const getFilteredIssues = useStore((state) => state.getFilteredIssues);
  
  // Local UI state
  const [showContextPane, setShowContextPane] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // null | 'app' | 'scan' | 'filter' | 'search' | 'help' | etc.

  // Get current issue and article using hooks
  const currentIssue = useCurrentIssue();
  const { content: articleContent, loading: articleLoading } = useArticleCache(
    currentIssue?.Id,
    useCallback(async (id) => {
      const article = await appScanService.getArticle(id);
      return article;
    }, [appScanService])
  );

  // Filtered issues
  const filteredIssues = useMemo(() => getFilteredIssues(), [getFilteredIssues]);

  // Keyboard handling
  useInput((input, key) => {
    // Modal open - don't handle shortcuts
    if (activeModal) return;

    // Quit
    if (input === 'q') {
      exit();
      return;
    }

    // Help
    if (input === 'h' || input === '?') {
      setActiveModal('help');
      return;
    }

    // Toggle context pane
    if (input === 'c') {
      setShowContextPane((prev) => !prev);
      return;
    }

    // App selection
    if (input === 'a') {
      setActiveModal('app');
      return;
    }

    // Scan selection
    if (input === 's' && selectedApp) {
      setActiveModal('scan');
      return;
    }

    // Filter
    if (input === 'f' && filteredIssues.length > 0) {
      setActiveModal('filter');
      return;
    }

    // Search
    if (input === '/') {
      setActiveModal('search');
      return;
    }

    // Links
    if (input === 'l' && currentIssue) {
      setActiveModal('links');
      return;
    }

    // Update status
    if (input === 'u' && currentIssue) {
      setActiveModal('update');
      return;
    }

    // Create Jira
    if (input === 'j' && currentIssue) {
      setActiveModal('jira');
      return;
    }

    // Details modal
    if (key.return && currentIssue) {
      setActiveModal('details');
      return;
    }

    // Navigation
    if (key.upArrow) {
      useStore.getState().moveCursorUp();
      return;
    }

    if (key.downArrow) {
      useStore.getState().moveCursorDown();
      return;
    }
  });

  // Main layout
  return (
    <Layout
      header={null}
      footer={<StatusBar error={error} loading={loading} message="Ready" />}
    >
      <Box flexDirection="row" height={height - 2}>
        {/* Context Pane */}
        {showContextPane && <ContextPane app={selectedApp} scan={selectedScan} />}

        {/* Vulnerability List */}
        <VulnListPanel
          issues={filteredIssues}
          cursor={listCursor}
          height={height}
        />

        {/* Details Preview */}
        <DetailsPreviewPanel
          issue={currentIssue}
          articleContent={articleContent}
          loading={articleLoading}
        />
      </Box>

      {/* Modals */}
      {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'app' && (
        <AppSelectionModal
          applications={applications}
          onSelect={(app) => {
            useStore.getState().setSelectedApp(app);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'scan' && (
        <ScanSelectionModal
          scans={scans}
          onSelect={(scan) => {
            useStore.getState().setSelectedScan(scan);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'filter' && (
        <FilterModal
          issues={filteredIssues}
          onSelect={(filterType, value) => {
            if (filterType === 'status') useStore.getState().setFilterStatus(value);
            else if (filterType === 'severity') useStore.getState().setFilterSeverity(value);
            else if (filterType === 'type') useStore.getState().setFilterIssueType(value);
            else if (filterType === 'jira') useStore.getState().setFilterJira(value);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'search' && (
        <SearchModal
          currentSearch={useStore.getState().searchText}
          onSearch={(text) => useStore.getState().setSearchText(text)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'links' && currentIssue && (
        <LinksModal
          issue={currentIssue}
          config={appScanService.getConfig()}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'update' && currentIssue && (
        <UpdateStatusModal
          issueCount={1}
          issues={[currentIssue]}
          onUpdate={async (status, comment) => {
            await appScanService.updateIssueStatus(currentIssue.Id, status, comment);
            logger.info('Status updated');
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'jira' && currentIssue && (
        <CreateJiraModal
          issues={[currentIssue]}
          defaultProjectKey={jiraService.getProjectKey()}
          onCreate={async (projectKey, groupBy, issues) => {
            await jiraService.createIssues(projectKey, groupBy, issues);
            logger.info('Jira issue created');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'details' && currentIssue && (
        <IssueDetailsModal
          issue={currentIssue}
          articleContent={articleContent}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Layout>
  );
};

export default InkApp;
