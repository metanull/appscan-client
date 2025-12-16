# Ink-Triage Application - Complete Refactoring & Enhancement Plan

> **Objective**: Consolidate the application into a single unified npm package with dual-mode operation (CLI + TUI), modernized UX, and clean architecture following best practices.

---

## Table of Contents
1. [Phase 1: Project Restructuring](#phase-1-project-restructuring)
2. [Phase 2: Core Infrastructure](#phase-2-core-infrastructure)
3. [Phase 3: UI Architecture Overhaul](#phase-3-ui-architecture-overhaul)
4. [Phase 4: Keyboard & Input System](#phase-4-keyboard--input-system)
5. [Phase 5: Modal System & Selection Views](#phase-5-modal-system--selection-views)
6. [Phase 6: Main Vulnerability Screen](#phase-6-main-vulnerability-screen)
7. [Phase 7: Enhanced Features](#phase-7-enhanced-features)
8. [Phase 8: Testing & Quality](#phase-8-testing--quality)
9. [Phase 9: Documentation & Packaging](#phase-9-documentation--packaging)

---

## Phase 1: Project Restructuring

### 1.1 Consolidate Package Structure
- [ ] **1.1.1** Create unified `package.json` at root level
  - Merge dependencies from `/package.json` and `/ink-triage/package.json`
  - Set single binary entry: `"bin": { "appscan": "./dist/index.js" }`
  - Add peer dependencies: `ink@^6.5.1`, `react@^19.x`, `zustand@^5.x`
  - Keep `commander@^14.x` for CLI mode, `meow@^14.x` for TUI mode
  - Add `ink-link@^4.x` for clickable hyperlinks
  - Add `ink-use-stdout-dimensions@^1.x` for terminal size detection
  ```json
  {
    "name": "@metanull/appscan-client",
    "version": "2.0.0",
    "type": "module",
    "bin": { "appscan": "./dist/index.js" },
    "main": "dist/index.js",
    "engines": { "node": ">=20.0.0" },
    "scripts": {
      "build": "node build.js",
      "start": "npm run build && node dist/index.js",
      "triage": "npm run build && node dist/index.js triage",
      "test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest",
      "lint": "eslint src",
      "format": "prettier --write \"src/**/*.js\" \"tests/**/*.js\""
    }
  }
  ```

- [ ] **1.1.2** Reorganize directory structure
  ```
  appscan-client/
  ├── src/
  │   ├── index.js              # Single entry point (CLI + TUI router)
  │   ├── cli/                   # CLI mode commands
  │   │   ├── index.js          # Commander setup
  │   │   └── commands/         # Existing commands (moved from /src/commands)
  │   ├── tui/                   # TUI mode (moved from /ink-triage/src)
  │   │   ├── index.js          # TUI entry point
  │   │   ├── components/       # Reusable UI components
  │   │   ├── views/            # Screen views
  │   │   ├── modals/           # Modal dialogs
  │   │   └── hooks/            # Custom React hooks
  │   ├── services/             # Shared services (AppScan, Jira)
  │   ├── state/                # Zustand state management
  │   ├── utils/                # Shared utilities
  │   └── generated/            # Auto-generated API client
  ├── tests/                    # Unified test directory
  ├── doc/                      # Documentation
  ├── build.js                  # esbuild configuration
  └── package.json              # Single package.json
  ```

- [ ] **1.1.3** Create unified entry point `/src/index.js`
  ```javascript
  #!/usr/bin/env node
  import { program } from 'commander';
  import { setupCLI } from './cli/index.js';
  
  // Detect if running in TUI mode (no args or 'triage' command)
  const args = process.argv.slice(2);
  const isTuiMode = args.length === 0 || args[0] === 'triage';
  
  if (isTuiMode && !args.includes('--help') && !args.includes('-h')) {
    // Dynamic import TUI to avoid loading React for CLI-only usage
    const { startTUI } = await import('./tui/index.js');
    await startTUI(args);
  } else {
    // CLI mode with Commander
    setupCLI(program);
    program.parse(process.argv);
  }
  ```

- [ ] **1.1.4** Update `build.js` for unified build
  - Single esbuild configuration
  - Bundle all sources into `/dist`
  - Ensure external dependencies are properly marked
  - Add source maps for debugging

### 1.2 Remove Legacy Code
- [ ] **1.2.1** Archive `/ink-triage` folder contents before migration
- [ ] **1.2.2** Remove duplicate configuration files
  - Delete `/ink-triage/package.json` after merge
  - Delete `/ink-triage/eslint.config.js` (use root config)
  - Delete `/ink-triage/.prettierrc.json` (use root config)
- [ ] **1.2.3** Consolidate test files into `/tests`
  - Move `/ink-triage/tests/*` to `/tests/tui/`
  - Keep `/tests` for shared/CLI tests
- [ ] **1.2.4** Clean up documentation
  - Archive outdated docs in `/doc/archive`
  - Remove duplicates between root and `/ink-triage`

---

## Phase 2: Core Infrastructure

### 2.1 Centralized Configuration
- [ ] **2.1.1** Create `/src/utils/config-manager.js`
  ```javascript
  /**
   * Centralized configuration manager
   * - Supports .env files, JSON config files, and environment variables
   * - Windows-compatible paths
   * - Automatic setup detection
   */
  export class ConfigManager {
    constructor(options = {}) {
      this.configPath = options.configPath || this.findConfigFile();
    }
    
    findConfigFile() {
      // Check in order: CWD, user home, package root
      const locations = [
        process.cwd(),
        process.env.USERPROFILE || process.env.HOME,
        path.resolve(__dirname, '../..')
      ];
      // ... implementation
    }
    
    isConfigured() { /* ... */ }
    needsSetup() { return !this.isConfigured(); }
    getAppScanConfig() { /* ... */ }
    getJiraConfig() { /* ... */ }
  }
  ```

- [ ] **2.1.2** Update existing Config class to use ConfigManager
  - Deprecate direct `.env` file loading
  - Support JSON config file (`.appscantriage.json`)
  - Windows path normalization

### 2.2 Centralized Logging
- [ ] **2.2.1** Enhance `/src/utils/logger.js`
  ```javascript
  /**
   * Enhanced logging with:
   * - File rotation (prevent log bloat)
   * - Structured JSON format
   * - Log levels: ERROR, WARN, INFO, DEBUG
   * - Console output suppression in TUI mode
   * - Windows-compatible paths
   */
  class Logger {
    constructor() {
      this.logDir = this.ensureLogDir();
      this.logFile = path.join(this.logDir, 'app.log');
      this.maxFileSize = 5 * 1024 * 1024; // 5MB
      this.maxFiles = 3;
      this.suppressConsole = false; // Set true in TUI mode
    }
    
    setTuiMode(enabled) {
      this.suppressConsole = enabled;
    }
    
    // ... existing methods enhanced
  }
  ```

- [ ] **2.2.2** Ensure all error paths use logger
  - Replace `console.error` with `logger.error`
  - Add context objects to all log calls
  - Include stack traces for errors

### 2.3 Centralized Audit Logging
- [ ] **2.3.1** Enhance `/src/utils/audit.js`
  ```javascript
  /**
   * Audit service for write operations
   * - AppScan issue updates (status, comments)
   * - Jira issue creation/linking
   * - Bulk operations tracking
   */
  class AuditService {
    logAppScanUpdate(issueIds, appId, changes, result) { /* ... */ }
    logJiraCreate(projectKey, summary, issues, result) { /* ... */ }
    logJiraLink(issueId, appId, jiraKey, result) { /* ... */ }
    logBulkOperation(operation, count, result) { /* ... */ }
    
    // Query methods for audit trail
    getRecentOperations(limit = 50) { /* ... */ }
    getOperationsByDate(startDate, endDate) { /* ... */ }
  }
  ```

### 2.4 Service Layer Consolidation
- [ ] **2.4.1** Consolidate AppScan service
  - Move `/src/services/appscan-service.js` to shared location
  - Remove `/ink-triage/src/services/appscan.js` wrapper (inline functionality)
  - Add proper TypeScript JSDoc annotations
  ```javascript
  /**
   * @typedef {Object} Issue
   * @property {string} Id - Unique issue identifier
   * @property {string} IssueType - Type of vulnerability
   * @property {string} Severity - Critical|High|Medium|Low|Informational
   * @property {string} Status - Open|InProgress|Reopened|Noise|Passed|Fixed
   * @property {string} [ExternalId] - Jira ticket ID if linked
   * ...
   */
  ```

- [ ] **2.4.2** Consolidate Jira service
  - Similar consolidation as AppScan service
  - Ensure proper ADF (Atlassian Document Format) support
  - Handle optional `jira.js` dependency gracefully
  ```javascript
  /**
   * Jira service with ADF support
   * Uses Atlassian Document Format for rich descriptions
   * @see https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
   */
  ```

---

## Phase 3: UI Architecture Overhaul

### 3.0 Panel Refresh Architecture (CRITICAL)

> **This section addresses the infinite loop / memory leak issue directly**

- [ ] **3.0.1** Define panel communication rules
  ```javascript
  /**
   * RULES FOR PANEL COMMUNICATION:
   * 
   * 1. Panels NEVER directly communicate with each other
   * 2. Panels ONLY read from Zustand store via selectors
   * 3. Panels ONLY write to store via actions (never direct setState)
   * 4. Cursor position is THE source of truth for "current item"
   * 5. Derived values (currentIssue, filteredList) computed inline
   * 6. Async data (articles, comments) goes into cache, not direct state
   */
  ```

- [ ] **3.0.2** Create `/src/tui/hooks/useCurrentIssue.js` - derived state hook
  ```javascript
  /**
   * Hook to get current issue WITHOUT triggering infinite loops
   * Returns derived value, not state
   */
  export function useCurrentIssue() {
    // Subscribe to minimum required state
    const cursor = useStore(state => state.listCursor);
    const getFilteredIssues = useStore(state => state.getFilteredIssues);
    
    // Derive current issue - this is NOT state, just a calculation
    const filteredIssues = getFilteredIssues();
    const currentIssue = filteredIssues[cursor] ?? null;
    
    return currentIssue;
  }
  ```

- [ ] **3.0.3** Create `/src/tui/hooks/useArticleCache.js` - async data with debounce
  ```javascript
  import { useMemo, useEffect } from 'react';
  import { debounce } from '../utils/debounce.js';
  
  /**
   * Hook for fetching article content with:
   * - Debounced fetching (300ms delay)
   * - Caching (don't refetch already loaded)
   * - Loading state
   */
  export function useArticleCache(issueId) {
    const cache = useStore(state => state.articleCache);
    const setArticleCache = useStore(state => state.setArticleCache);
    const fetchArticle = useStore(state => state.fetchArticle);
    
    // Stable debounced fetch function
    const debouncedFetch = useMemo(
      () => debounce(async (id) => {
        if (!id || cache[id]) return; // Already cached or no ID
        try {
          const article = await fetchArticle(id);
          setArticleCache(id, article);
        } catch (error) {
          setArticleCache(id, { error: error.message });
        }
      }, 300),
      [] // Empty deps - function reference never changes
    );
    
    // Trigger fetch when issueId changes (debounced)
    useEffect(() => {
      if (issueId) {
        debouncedFetch(issueId);
      }
    }, [issueId, debouncedFetch]);
    
    // Return cached value (may be undefined if loading)
    return {
      article: cache[issueId],
      isLoading: issueId && !cache[issueId],
      isCached: !!cache[issueId]
    };
  }
  ```

- [ ] **3.0.4** Update Zustand store with cache slices
  ```javascript
  // In store definition
  const createCacheSlice = (set, get) => ({
    // Article cache
    articleCache: {},
    setArticleCache: (issueId, article) => set(state => ({
      articleCache: { ...state.articleCache, [issueId]: article }
    })),
    clearArticleCache: () => set({ articleCache: {} }),
    
    // Comments cache
    commentsCache: {},
    setCommentsCache: (issueId, comments) => set(state => ({
      commentsCache: { ...state.commentsCache, [issueId]: comments }
    })),
    
    // Invalidate cache when data changes
    invalidateCacheForIssue: (issueId) => set(state => {
      const newArticleCache = { ...state.articleCache };
      const newCommentsCache = { ...state.commentsCache };
      delete newArticleCache[issueId];
      delete newCommentsCache[issueId];
      return { articleCache: newArticleCache, commentsCache: newCommentsCache };
    })
  });
  ```

- [ ] **3.0.5** Create `/src/utils/debounce.js`
  ```javascript
  /**
   * Debounce function - delays execution until pause in calls
   */
  export function debounce(fn, delay) {
    let timeoutId;
    return function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  /**
   * Throttle function - limits execution rate
   */
  export function throttle(fn, limit) {
    let inThrottle = false;
    return function throttled(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }
  ```

- [ ] **3.0.6** Create optimized panel wrapper component
  ```javascript
  /**
   * Panel wrapper that prevents unnecessary re-renders
   * Uses React.memo with custom comparison
   */
  export const OptimizedPanel = React.memo(
    function OptimizedPanel({ 
      title, 
      children, 
      ...props 
    }) {
      return (
        <Panel title={title} {...props}>
          {children}
        </Panel>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison - only re-render if these change
      return prevProps.title === nextProps.title
          && prevProps.children === nextProps.children;
    }
  );
  ```

### 3.1 Terminal Dimensions Hook
- [ ] **3.1.1** Create `/src/tui/hooks/useTerminalSize.js`
  ```javascript
  import { useState, useEffect } from 'react';
  import { useStdout } from 'ink';
  
  /**
   * Hook to track terminal dimensions
   * Updates on resize, provides min/max constraints
   */
  export function useTerminalSize() {
    const { stdout } = useStdout();
    const [size, setSize] = useState({
      width: stdout?.columns || 120,
      height: stdout?.rows || 40
    });
    
    useEffect(() => {
      const handleResize = () => {
        setSize({
          width: Math.max(stdout?.columns || 80, 80),  // Min 80 cols
          height: Math.max(stdout?.rows || 24, 24)     // Min 24 rows
        });
      };
      
      stdout?.on('resize', handleResize);
      handleResize(); // Initial call
      
      return () => stdout?.off('resize', handleResize);
    }, [stdout]);
    
    return size;
  }
  ```

### 3.2 Layout System
- [ ] **3.2.1** Create `/src/tui/components/Layout.js`
  ```javascript
  /**
   * Full-screen layout component that fills terminal
   * Provides header, footer, and flexible content area
   */
  export function Layout({ header, footer, children }) {
    const { height, width } = useTerminalSize();
    const contentHeight = height - (header ? 3 : 0) - (footer ? 2 : 0);
    
    return (
      <Box flexDirection="column" width={width} height={height}>
        {header && <Box height={3}>{header}</Box>}
        <Box flexDirection="row" flexGrow={1} height={contentHeight}>
          {children}
        </Box>
        {footer && <Box height={2}>{footer}</Box>}
      </Box>
    );
  }
  ```

- [ ] **3.2.2** Create `/src/tui/components/Panel.js`
  ```javascript
  /**
   * Panel component with border, title, and scrolling
   * Respects parent dimensions
   */
  export function Panel({ 
    title, 
    width, 
    height, 
    borderColor = 'gray',
    children,
    scrollable = false
  }) {
    return (
      <Box 
        flexDirection="column" 
        width={width} 
        height={height}
        borderStyle="single"
        borderColor={borderColor}
        overflow={scrollable ? 'hidden' : 'visible'}
      >
        {title && (
          <Box paddingX={1}>
            <Text bold color={borderColor}>{title}</Text>
          </Box>
        )}
        <Box flexGrow={1} paddingX={1} overflow="hidden">
          {children}
        </Box>
      </Box>
    );
  }
  ```

### 3.3 Scrollable List Component
- [ ] **3.3.1** Create `/src/tui/components/ScrollableList.js`
  ```javascript
  /**
   * Virtual scrolling list component
   * - Renders only visible items for performance
   * - Handles keyboard navigation (up/down/pageup/pagedown/home/end)
   * - Supports multi-select mode
   * - Dynamically calculates visible count based on container height
   */
  export function ScrollableList({
    items,
    cursor,
    onCursorChange,
    renderItem,
    height,
    multiSelect = false,
    selectedIds = [],
    onToggleSelect
  }) {
    // Calculate visible window
    const visibleCount = height - 2; // Account for borders
    const startIndex = Math.max(0, cursor - Math.floor(visibleCount / 2));
    const endIndex = Math.min(items.length, startIndex + visibleCount);
    const visibleItems = items.slice(startIndex, endIndex);
    
    // Scroll indicators
    const showUpIndicator = startIndex > 0;
    const showDownIndicator = endIndex < items.length;
    
    return (
      <Box flexDirection="column" height={height}>
        {showUpIndicator && <Text dimColor>↑ {startIndex} more</Text>}
        {visibleItems.map((item, localIndex) => {
          const globalIndex = startIndex + localIndex;
          const isCursor = globalIndex === cursor;
          const isSelected = selectedIds.includes(item.Id);
          return renderItem(item, { isCursor, isSelected, index: globalIndex });
        })}
        {showDownIndicator && (
          <Text dimColor>↓ {items.length - endIndex} more</Text>
        )}
      </Box>
    );
  }
  ```

---

## Phase 4: Keyboard & Input System

### 4.1 Redesign Keyboard Manager
- [ ] **4.1.1** Rewrite `/src/tui/hooks/useKeyboard.js`
  ```javascript
  /**
   * Keyboard management system following Ink best practices
   * 
   * Key principles:
   * 1. Single useInput at top level, dispatches to handlers
   * 2. Mode-based input routing (NORMAL, INPUT, MODAL)
   * 3. Proper modifier key handling (Ctrl, Shift, Alt)
   * 4. No interference with text input fields
   */
  
  export const KeyboardMode = {
    NORMAL: 'normal',    // Global shortcuts active
    INPUT: 'input',      // Text input mode, only ESC works
    MODAL: 'modal',      // Modal has focus, delegates to modal
    DISABLED: 'disabled' // No input processing
  };
  
  // Shortcut definition format
  const shortcuts = {
    'q': { action: 'quit', modes: ['normal'] },
    'escape': { action: 'back', modes: ['normal', 'modal'] },
    'up': { action: 'cursorUp', modes: ['normal', 'modal'] },
    'down': { action: 'cursorDown', modes: ['normal', 'modal'] },
    'pageup': { action: 'pageUp', modes: ['normal', 'modal'] },
    'pagedown': { action: 'pageDown', modes: ['normal', 'modal'] },
    'home': { action: 'goToStart', modes: ['normal', 'modal'] },
    'end': { action: 'goToEnd', modes: ['normal', 'modal'] },
    'return': { action: 'select', modes: ['normal', 'modal'] },
    'space': { action: 'toggleSelect', modes: ['normal'] },
    'ctrl+a': { action: 'selectAll', modes: ['normal'] },
    'ctrl+shift+a': { action: 'clearSelection', modes: ['normal'] },
    'f': { action: 'openFilter', modes: ['normal'] },
    's': { action: 'openSearch', modes: ['normal'] },
    'l': { action: 'openLinks', modes: ['normal'] },
    'u': { action: 'openUpdateStatus', modes: ['normal'] },
    'j': { action: 'openJira', modes: ['normal'] },
    'r': { action: 'refresh', modes: ['normal'] },
    'h': { action: 'toggleHelp', modes: ['normal'] },
    '?': { action: 'toggleHelp', modes: ['normal'] },
  };
  ```

- [ ] **4.1.2** Handle modifier keys correctly
  ```javascript
  /**
   * Normalize key input to standard format
   * Handles case sensitivity and modifier combinations
   */
  function normalizeKey(input, key) {
    const parts = [];
    if (key.ctrl) parts.push('ctrl');
    if (key.shift) parts.push('shift');
    if (key.meta) parts.push('alt');
    
    // Handle special keys
    if (key.upArrow) parts.push('up');
    else if (key.downArrow) parts.push('down');
    else if (key.leftArrow) parts.push('left');
    else if (key.rightArrow) parts.push('right');
    else if (key.return) parts.push('return');
    else if (key.escape) parts.push('escape');
    else if (key.backspace) parts.push('backspace');
    else if (key.delete) parts.push('delete');
    else if (key.tab) parts.push('tab');
    else if (key.pageUp) parts.push('pageup');
    else if (key.pageDown) parts.push('pagedown');
    else if (input) parts.push(input.toLowerCase());
    
    return parts.join('+');
  }
  ```

- [ ] **4.1.3** Create input field wrapper that manages keyboard mode
  ```javascript
  /**
   * Text input wrapper that properly manages keyboard mode
   * Prevents shortcuts from interfering with typing
   */
  export function TextInputField({ value, onChange, onSubmit, placeholder }) {
    const { setMode } = useKeyboard();
    const [isFocused, setIsFocused] = useState(false);
    
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      setMode(KeyboardMode.INPUT);
    }, [setMode]);
    
    const handleBlur = useCallback(() => {
      setIsFocused(false);
      setMode(KeyboardMode.NORMAL);
    }, [setMode]);
    
    return (
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        focus={isFocused}
        // Additional handlers for focus management
      />
    );
  }
  ```

### 4.2 Navigation Key Support
- [ ] **4.2.1** Implement HOME/END key navigation
  ```javascript
  // In cursor management hook
  const goToStart = useCallback(() => {
    setListCursor(0);
  }, [setListCursor]);
  
  const goToEnd = useCallback(() => {
    setListCursor(Math.max(0, items.length - 1));
  }, [setListCursor, items.length]);
  ```

- [ ] **4.2.2** Implement PageUp/PageDown navigation
  ```javascript
  const pageSize = 10; // Or calculate based on visible area
  
  const pageUp = useCallback(() => {
    setListCursor(prev => Math.max(0, prev - pageSize));
  }, [setListCursor, pageSize]);
  
  const pageDown = useCallback(() => {
    setListCursor(prev => Math.min(items.length - 1, prev + pageSize));
  }, [setListCursor, pageSize, items.length]);
  ```

---

## Phase 5: Modal System & Selection Views

### 5.1 Enhanced Modal Component
- [ ] **5.1.1** Rewrite `/src/tui/components/Modal.js`
  ```javascript
  /**
   * Full-featured modal component
   * - Properly sized based on content and terminal dimensions
   * - Supports scrolling for large content
   * - Keyboard mode management
   * - Focus trap
   */
  export function Modal({ 
    title, 
    onClose, 
    width = '80%', 
    maxHeight = '80%',
    children,
    showCloseHint = true 
  }) {
    const { width: termWidth, height: termHeight } = useTerminalSize();
    const { setMode } = useKeyboard();
    
    // Calculate actual dimensions
    const actualWidth = typeof width === 'string' && width.endsWith('%')
      ? Math.floor(termWidth * parseInt(width) / 100)
      : width;
    const actualMaxHeight = typeof maxHeight === 'string' && maxHeight.endsWith('%')
      ? Math.floor(termHeight * parseInt(maxHeight) / 100)
      : maxHeight;
    
    // Set modal mode on mount
    useEffect(() => {
      setMode(KeyboardMode.MODAL);
      return () => setMode(KeyboardMode.NORMAL);
    }, [setMode]);
    
    // Handle ESC key
    useInput((input, key) => {
      if (key.escape && onClose) {
        onClose();
      }
    });
    
    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          flexDirection="column"
          width={actualWidth}
          maxHeight={actualMaxHeight}
          borderStyle="double"
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
          overflow="hidden"
        >
          {/* Header */}
          <Box justifyContent="space-between" marginBottom={1}>
            <Text bold color="cyan">{title}</Text>
            {showCloseHint && <Text dimColor>ESC to close</Text>}
          </Box>
          
          {/* Scrollable content */}
          <Box flexDirection="column" flexGrow={1} overflow="hidden">
            {children}
          </Box>
        </Box>
      </Box>
    );
  }
  ```

### 5.2 Application Selection Modal
- [ ] **5.2.1** Create `/src/tui/modals/AppSelectionModal.js`
  ```javascript
  /**
   * Application selection modal with:
   * - Scrollable list
   * - Search/filter by name
   * - Sort by name or issue count
   * - Hide apps with zero issues option
   */
  export function AppSelectionModal({ applications, onSelect, onClose }) {
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'issues'
    const [hideEmpty, setHideEmpty] = useState(false);
    const [cursor, setCursor] = useState(0);
    const { height } = useTerminalSize();
    
    // Filter and sort applications
    const filteredApps = useMemo(() => {
      let result = [...applications];
      
      // Filter by search
      if (searchText) {
        const lower = searchText.toLowerCase();
        result = result.filter(app => 
          app.Name.toLowerCase().includes(lower)
        );
      }
      
      // Hide empty
      if (hideEmpty) {
        result = result.filter(app => (app.TotalIssues || 0) > 0);
      }
      
      // Sort
      result.sort((a, b) => {
        if (sortBy === 'name') {
          return a.Name.localeCompare(b.Name);
        } else {
          return (b.TotalIssues || 0) - (a.TotalIssues || 0);
        }
      });
      
      return result;
    }, [applications, searchText, sortBy, hideEmpty]);
    
    // Keyboard handling for modal
    useInput((input, key) => {
      if (key.upArrow) setCursor(c => Math.max(0, c - 1));
      if (key.downArrow) setCursor(c => Math.min(filteredApps.length - 1, c + 1));
      if (key.return && filteredApps[cursor]) {
        onSelect(filteredApps[cursor]);
      }
      // Toggle sort with 'o'
      if (input === 'o') setSortBy(s => s === 'name' ? 'issues' : 'name');
      // Toggle hide empty with 'e'
      if (input === 'e') setHideEmpty(h => !h);
    });
    
    const listHeight = Math.min(height - 12, 20);
    
    return (
      <Modal title="📱 Select Application" onClose={onClose}>
        {/* Search bar */}
        <Box marginBottom={1}>
          <Text>Search: </Text>
          <TextInputField
            value={searchText}
            onChange={setSearchText}
            placeholder="Type to filter..."
          />
        </Box>
        
        {/* Options bar */}
        <Box marginBottom={1}>
          <Text dimColor>
            [O] Sort: {sortBy === 'name' ? 'Name' : 'Issues'} | 
            [E] Hide empty: {hideEmpty ? 'Yes' : 'No'} | 
            {filteredApps.length}/{applications.length} shown
          </Text>
        </Box>
        
        {/* Scrollable list */}
        <ScrollableList
          items={filteredApps}
          cursor={cursor}
          onCursorChange={setCursor}
          height={listHeight}
          renderItem={(app, { isCursor }) => (
            <Box key={app.Id}>
              <Text color={isCursor ? 'cyan' : 'white'} bold={isCursor}>
                {isCursor ? '> ' : '  '}{app.Name}
              </Text>
              <Text dimColor> ({app.TotalIssues || 0} issues)</Text>
            </Box>
          )}
        />
      </Modal>
    );
  }
  ```

### 5.3 Scan Selection Modal
- [ ] **5.3.1** Create `/src/tui/modals/ScanSelectionModal.js`
  ```javascript
  /**
   * Scan selection modal with:
   * - Scrollable list
   * - Search by name
   * - Filter by type (SAST/DAST/SCA/IAST)
   * - Sort by name, date, or issue count
   * - Hide empty scans option
   * - Show execution details
   */
  export function ScanSelectionModal({ 
    applicationName,
    scans, 
    onSelect, 
    onClose 
  }) {
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState(null); // null | 'SAST' | 'DAST' | 'SCA' | 'IAST'
    const [sortBy, setSortBy] = useState('date'); // 'name' | 'date' | 'issues'
    const [hideEmpty, setHideEmpty] = useState(true);
    const [cursor, setCursor] = useState(0);
    
    // ... similar implementation to AppSelectionModal
    // with scan-specific filtering and display
  }
  ```

### 5.4 Issue Details Modal
- [ ] **5.4.1** Convert IssueDetailsView to modal
  ```javascript
  /**
   * Full issue details modal with scrolling
   * Replaces the separate view for ENTER key
   */
  export function IssueDetailsModal({ issue, articleContent, onClose }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const { height } = useTerminalSize();
    const contentHeight = height - 8;
    
    // Handle scroll with up/down/pageup/pagedown
    useInput((input, key) => {
      if (key.upArrow) setScrollPosition(p => Math.max(0, p - 1));
      if (key.downArrow) setScrollPosition(p => p + 1);
      if (key.pageUp) setScrollPosition(p => Math.max(0, p - 10));
      if (key.pageDown) setScrollPosition(p => p + 10);
      if (input === 'g' && key.shift) setScrollPosition(0); // Go to top
      if (input === 'G') setScrollPosition(Infinity); // Go to bottom
    });
    
    return (
      <Modal title={`📋 ${issue.IssueType}`} onClose={onClose} width="90%">
        {/* Scrollable content with issue details and article */}
        <ScrollableContent scroll={scrollPosition} height={contentHeight}>
          {/* Issue metadata */}
          {/* Location details */}
          {/* Code context */}
          {/* Article content */}
          {/* Comments */}
        </ScrollableContent>
      </Modal>
    );
  }
  ```

---

## Phase 6: Main Vulnerability Screen

### 6.1 Single-Page Layout
- [ ] **6.1.1** Redesign main screen as single-page application
  ```javascript
  /**
   * Main TUI application - single-page design
   * All navigation via modals, main screen always shows vulnerabilities
   */
  export function TriageApp({ configPath }) {
    const { height, width } = useTerminalSize();
    
    // State for modals
    const [showAppModal, setShowAppModal] = useState(true); // Show on start
    const [showScanModal, setShowScanModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showJiraModal, setShowJiraModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    
    // Store state
    const selectedApp = useStore(s => s.selectedApp);
    const selectedScan = useStore(s => s.selectedScan);
    const issues = useStore(s => s.getFilteredIssues());
    
    // Show app modal if no app selected
    useEffect(() => {
      if (!selectedApp) setShowAppModal(true);
    }, [selectedApp]);
    
    // Calculate layout dimensions
    const headerHeight = 3;
    const footerHeight = 2;
    const contentHeight = height - headerHeight - footerHeight;
    
    return (
      <KeyboardProvider>
        <Layout
          header={<Header app={selectedApp} scan={selectedScan} />}
          footer={<StatusBar />}
        >
          {/* Three-pane layout */}
          <Box flexDirection="row" height={contentHeight}>
            {/* Left: Context pane (hideable) */}
            <ContextPane width="20%" />
            
            {/* Center: Vulnerability list */}
            <VulnerabilityList width="50%" height={contentHeight} />
            
            {/* Right: Details preview */}
            <DetailsPreview width="30%" height={contentHeight} />
          </Box>
          
          {/* Modals (rendered conditionally) */}
          {showAppModal && <AppSelectionModal ... />}
          {showScanModal && <ScanSelectionModal ... />}
          {showFilterModal && <FilterModal ... />}
          {showSearchModal && <SearchModal ... />}
          {showDetailsModal && <IssueDetailsModal ... />}
          {showLinksModal && <LinksModal ... />}
          {showUpdateModal && <UpdateStatusModal ... />}
          {showJiraModal && <CreateJiraModal ... />}
          {showHelpModal && <HelpModal ... />}
        </Layout>
      </KeyboardProvider>
    );
  }
  ```

### 6.2 Collapsible Context Pane
- [ ] **6.2.1** Make left pane hideable
  ```javascript
  /**
   * Context pane showing app/scan info
   * Can be hidden with 'c' key to give more space to vulnerability list
   */
  export function ContextPane({ width, hidden = false }) {
    const selectedApp = useStore(s => s.selectedApp);
    const selectedScan = useStore(s => s.selectedScan);
    
    if (hidden) {
      return null; // Or minimal indicator
    }
    
    return (
      <Panel title="📍 Context" width={width} borderColor="blue">
        {selectedApp && (
          <Box flexDirection="column">
            <Text bold>Application:</Text>
            <Text>{selectedApp.Name}</Text>
            <Text dimColor>Issues: {selectedApp.TotalIssues}</Text>
          </Box>
        )}
        {selectedScan && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Scan:</Text>
            <Text>{selectedScan.Name}</Text>
            <Text dimColor>Type: {selectedScan.Technology}</Text>
            <Text dimColor>Issues: {selectedScan.LatestExecution?.NIssuesFound}</Text>
          </Box>
        )}
      </Panel>
    );
  }
  ```

### 6.3 Dynamic Vulnerability List
- [ ] **6.3.1** Enhance VulnList with dynamic sizing and render optimization
  ```javascript
  /**
   * Vulnerability list with:
   * - Dynamic row count based on available height
   * - Memoized filtering to prevent recomputation
   * - Optimized row components with React.memo
   * - NO direct state updates from cursor changes
   */
  export function VulnerabilityList({ width, height }) {
    // Subscribe to ONLY what we need (not entire store)
    const cursor = useStore(state => state.listCursor);
    const selectedIds = useStore(state => state.selectedIssueIds, shallow);
    const setCursor = useStore(state => state.setListCursor);
    
    // Get filtered issues via selector (memoized in store)
    const issues = useStore(state => state.getFilteredIssues());
    
    // Calculate visible rows (accounting for header, stats, etc.)
    const headerLines = 3; // Title + stats
    const footerLines = 2; // Pagination info
    const rowHeight = 1; // Each issue is 1 line
    const availableRows = height - headerLines - footerLines;
    
    // Stable callback for cursor changes
    const handleCursorChange = useCallback((newCursor) => {
      setCursor(newCursor);
    }, [setCursor]);
    
    // Memoized row renderer to prevent recreation
    const renderItem = useCallback((issue, { isCursor, isSelected, index }) => (
      <VulnRow 
        key={issue.Id}
        issue={issue} 
        isCursor={isCursor}
        isSelected={isSelected}
      />
    ), []);
    
    return (
      <Panel title="🔍 Vulnerabilities" width={width} borderColor="green">
        {/* Stats header - memoized component */}
        <IssueStats issueCount={issues.length} />
        
        {/* Scrollable issue list */}
        <ScrollableList
          items={issues}
          cursor={cursor}
          onCursorChange={handleCursorChange}
          selectedIds={selectedIds}
          height={availableRows}
          renderItem={renderItem}
        />
        
        {/* Pagination footer */}
        <Text dimColor>
          {cursor + 1}/{issues.length} | 
          {selectedIds.length} selected
        </Text>
      </Panel>
    );
  }
  
  /**
   * Memoized row component - only re-renders when its specific props change
   */
  const VulnRow = React.memo(function VulnRow({ issue, isCursor, isSelected }) {
    const severityColor = getSeverityColor(issue.Severity);
    
    return (
      <Box>
        <Text color={isCursor ? 'cyan' : 'white'} bold={isCursor}>
          {isCursor ? '>' : ' '}
          {isSelected ? '●' : ' '}
        </Text>
        <Text color={severityColor}>[{issue.Severity[0]}]</Text>
        <Text wrap="truncate"> {issue.IssueType}</Text>
      </Box>
    );
  });
  
  /**
   * Memoized stats component
   */
  const IssueStats = React.memo(function IssueStats({ issueCount }) {
    return <Text dimColor>{issueCount} issues</Text>;
  });
  ```

### 6.4 Enhanced Details Preview
- [ ] **6.4.1** Fix overlapping status/severity display with render optimization
  ```javascript
  /**
   * Details preview panel with:
   * - Fixed layout (no overlap)
   * - Debounced article fetching
   * - Memoized to prevent unnecessary re-renders
   * - NO useEffect that updates state based on cursor
   */
  export const DetailsPreview = React.memo(function DetailsPreview({ width, height }) {
    // Get current issue via derived state hook (not direct subscription)
    const issue = useCurrentIssue();
    
    // Get article from cache (debounced fetch handled by hook)
    const { article, isLoading } = useArticleCache(issue?.Id);
    
    // Early return if no issue - stable, no state changes
    if (!issue) {
      return (
        <Panel title="📖 Details" width={width} borderColor="magenta">
          <Text dimColor>Select an issue to view details</Text>
        </Panel>
      );
    }
    
    return (
      <Panel title="📖 Details" width={width} borderColor="magenta">
        <Box flexDirection="column">
          {/* Issue type - full width */}
          <Text bold wrap="truncate">{issue.IssueType}</Text>
          
          {/* Metadata - each on own line (prevents overlap) */}
          <Box flexDirection="column" marginTop={1}>
            <MetadataRow label="Severity" color={getSeverityColor(issue.Severity)}>
              {issue.Severity}
            </MetadataRow>
            <MetadataRow label="Status">
              {issue.Status}
            </MetadataRow>
            {issue.ExternalId && (
              <MetadataRow label="Jira" color="blue">
                {issue.ExternalId}
              </MetadataRow>
            )}
          </Box>
          
          {/* Location */}
          {issue.Location && (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Location:</Text>
              <Text wrap="truncate">{issue.Location}</Text>
              {issue.Line && <Text dimColor>Line: {issue.Line}</Text>}
            </Box>
          )}
          
          {/* Article preview (from cache, with loading state) */}
          <Box flexDirection="column" marginTop={1}>
            {isLoading ? (
              <Text dimColor>Loading article...</Text>
            ) : article?.summary ? (
              <>
                <Text dimColor>Summary:</Text>
                <Text wrap="wrap">{article.summary.slice(0, 200)}...</Text>
              </>
            ) : null}
          </Box>
        </Box>
      </Panel>
    );
  });
  
  /**
   * Memoized metadata row - prevents re-render unless value changes
   */
  const MetadataRow = React.memo(function MetadataRow({ label, color, children }) {
    return (
      <Box>
        <Text dimColor>{label}: </Text>
        <Text color={color}>{children}</Text>
      </Box>
    );
  });
  ```

---

## Phase 7: Enhanced Features

### 7.1 Clickable Links with ink-link
- [ ] **7.1.1** Create `/src/tui/components/Link.js`
  ```javascript
  import InkLink from 'ink-link';
  
  /**
   * Clickable link component
   * Falls back to plain text in unsupported terminals
   */
  export function Link({ url, label, fallback = true }) {
    // Check if terminal supports hyperlinks
    const supportsLinks = process.env.TERM_PROGRAM !== 'Apple_Terminal';
    
    if (supportsLinks) {
      return (
        <InkLink url={url}>
          <Text color="blue" underline>{label || url}</Text>
        </InkLink>
      );
    }
    
    if (fallback) {
      return <Text color="blue">{label || url}</Text>;
    }
    
    return null;
  }
  ```

- [ ] **7.1.2** Update LinksModal to use clickable links
  ```javascript
  /**
   * Links modal with clickable hyperlinks
   */
  export function LinksModal({ issue, app, scan, onClose }) {
    const links = useMemo(() => {
      const result = [];
      
      if (issue?.SourceFileUri) {
        result.push({
          label: '🔗 Source File (Azure DevOps)',
          url: issue.SourceFileUri
        });
      }
      
      if (app) {
        result.push({
          label: '📱 AppScan Application',
          url: `https://cloud.appscan.com/main/myapps/${app.Id}`
        });
      }
      
      // ... more links
      
      return result;
    }, [issue, app, scan]);
    
    return (
      <Modal title="🔗 Links" onClose={onClose} width="70%">
        <Box flexDirection="column">
          {links.map((link, i) => (
            <Box key={i} marginY={0.5}>
              <Link url={link.url} label={link.label} />
            </Box>
          ))}
        </Box>
      </Modal>
    );
  }
  ```

### 7.2 Improved Update Status Modal
- [ ] **7.2.1** Enhance update status with comment templates
  ```javascript
  /**
   * Status update modal with:
   * - Status dropdown
   * - Comment text area
   * - Predefined comment templates
   * - Bulk update support
   */
  export function UpdateStatusModal({ 
    issues, 
    onUpdate, 
    onClose,
    templates 
  }) {
    const [status, setStatus] = useState(null);
    const [comment, setComment] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    
    const statusOptions = [
      { label: 'Open', value: 'Open' },
      { label: 'In Progress', value: 'InProgress' },
      { label: 'Noise (False Positive)', value: 'Noise' },
      { label: 'Passed (Risk Accepted)', value: 'Passed' },
      { label: 'Fixed', value: 'Fixed' },
    ];
    
    const handleTemplateSelect = (template) => {
      setComment(template.text);
      setShowTemplates(false);
    };
    
    const handleSubmit = () => {
      if (!status) return;
      onUpdate({ status, comment });
    };
    
    return (
      <Modal title="📝 Update Status" onClose={onClose}>
        <Box flexDirection="column">
          <Text>Updating {issues.length} issue(s)</Text>
          
          {/* Status selection */}
          <Box marginTop={1}>
            <Text>Status: </Text>
            <SelectInput
              items={statusOptions}
              onSelect={item => setStatus(item.value)}
            />
          </Box>
          
          {/* Comment input */}
          <Box marginTop={1} flexDirection="column">
            <Box>
              <Text>Comment: </Text>
              <Text dimColor>[T] Templates</Text>
            </Box>
            <TextInputField
              value={comment}
              onChange={setComment}
              placeholder="Optional comment..."
            />
          </Box>
          
          {/* Submit */}
          <Box marginTop={2}>
            <Text>Press [Enter] to submit, [Esc] to cancel</Text>
          </Box>
        </Box>
        
        {showTemplates && (
          <TemplateSelector
            templates={templates}
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </Modal>
    );
  }
  ```

### 7.3 Setup Wizard Enhancement
- [ ] **7.3.1** Auto-detect setup need on first run
  ```javascript
  /**
   * Entry point with automatic setup detection
   */
  export async function startTUI(args) {
    const config = new ConfigManager();
    
    if (config.needsSetup()) {
      // Show setup wizard
      const { waitUntilExit } = render(
        <SetupWizard 
          onComplete={() => {
            logger.info('Setup completed, restarting...');
            process.exit(0); // User should restart
          }}
        />
      );
      await waitUntilExit();
      return;
    }
    
    // Normal startup
    const { waitUntilExit } = render(<TriageApp config={config} />);
    await waitUntilExit();
  }
  ```

- [ ] **7.3.2** Add setup command to CLI
  ```javascript
  // In CLI setup
  program
    .command('setup')
    .description('Run interactive setup wizard')
    .option('-f, --force', 'Force re-setup even if configured')
    .action(async (options) => {
      // Launch setup wizard
    });
  ```

---

## Phase 8: Testing & Quality

### 8.0 Render Loop Prevention Tests (CRITICAL)

- [ ] **8.0.1** Create render count testing utility
  ```javascript
  // /tests/utils/renderCounter.js
  /**
   * Utility to count component renders during tests
   * Used to verify no infinite loops or excessive re-renders
   */
  export function createRenderCounter() {
    const counts = {};
    
    return {
      track: (componentName) => {
        counts[componentName] = (counts[componentName] || 0) + 1;
      },
      get: (componentName) => counts[componentName] || 0,
      getAll: () => ({ ...counts }),
      reset: () => Object.keys(counts).forEach(k => delete counts[k]),
      assertMaxRenders: (componentName, max, message) => {
        const actual = counts[componentName] || 0;
        if (actual > max) {
          throw new Error(
            `${message || componentName} rendered ${actual} times, expected max ${max}`
          );
        }
      }
    };
  }
  ```

- [ ] **8.0.2** Test cursor movement doesn't cause cascading renders
  ```javascript
  // /tests/tui/renderLoops.test.js
  import { render } from 'ink-testing-library';
  
  describe('Render loop prevention', () => {
    it('cursor movement causes exactly 1 re-render per affected component', async () => {
      const counter = createRenderCounter();
      
      // Inject counter into components for testing
      const { stdin, lastFrame } = render(
        <TriageApp renderCounter={counter} />
      );
      
      // Wait for initial render to settle
      await waitFor(() => expect(counter.get('VulnList')).toBe(1));
      
      counter.reset();
      
      // Simulate pressing down arrow 5 times rapidly
      for (let i = 0; i < 5; i++) {
        stdin.write('\x1B[B'); // Down arrow
      }
      
      // Wait for renders to settle
      await delay(100);
      
      // VulnList should render at most 5 times (once per cursor move)
      // NOT 25 times (cascading) or infinite
      counter.assertMaxRenders('VulnList', 5, 'VulnList excessive renders');
      counter.assertMaxRenders('DetailsPreview', 5, 'DetailsPreview excessive renders');
      
      // Panels that don't depend on cursor should NOT re-render
      counter.assertMaxRenders('ContextPane', 0, 'ContextPane should not re-render on cursor');
    });
    
    it('article fetch is debounced on rapid cursor movement', async () => {
      const fetchSpy = jest.spyOn(appscanService, 'getArticle');
      
      const { stdin } = render(<TriageApp />);
      
      // Move cursor rapidly through 10 items
      for (let i = 0; i < 10; i++) {
        stdin.write('\x1B[B');
        await delay(10); // Very fast
      }
      
      // Wait for debounce to settle
      await delay(500);
      
      // Should have called fetch at most 2-3 times (not 10)
      expect(fetchSpy).toHaveBeenCalledTimes(expect.lessThanOrEqual(3));
    });
    
    it('store subscription does not cause infinite loop', async () => {
      const renderCounts = { list: 0, details: 0 };
      
      // Create a test store
      const store = createStore();
      
      // Subscribe and count
      const unsubList = store.subscribe(
        state => state.listCursor,
        () => { renderCounts.list++; }
      );
      
      // Simulate 100 rapid cursor changes
      for (let i = 0; i < 100; i++) {
        store.getState().setListCursor(i);
      }
      
      // Should be exactly 100, not exponential growth
      expect(renderCounts.list).toBe(100);
      
      unsubList();
    });
  });
  ```

- [ ] **8.0.3** Test memory doesn't grow with cursor movement
  ```javascript
  it('memory usage stable during cursor navigation', async () => {
    const { stdin } = render(<TriageApp />);
    
    // Get baseline memory
    global.gc?.(); // Force GC if available
    const baseMemory = process.memoryUsage().heapUsed;
    
    // Navigate through entire list multiple times
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let i = 0; i < 100; i++) {
        stdin.write('\x1B[B'); // Down
        await delay(5);
      }
      for (let i = 0; i < 100; i++) {
        stdin.write('\x1B[A'); // Up
        await delay(5);
      }
    }
    
    global.gc?.();
    const finalMemory = process.memoryUsage().heapUsed;
    
    // Memory should not grow more than 10MB during navigation
    const growth = finalMemory - baseMemory;
    expect(growth).toBeLessThan(10 * 1024 * 1024);
  });
  ```

### 8.1 Unit Tests
- [ ] **8.1.1** Test utilities
  - `/tests/utils/config-manager.test.js`
  - `/tests/utils/logger.test.js`
  - `/tests/utils/audit.test.js`
  - `/tests/utils/issue-utils.test.js`

- [ ] **8.1.2** Test services (mocked API calls)
  - `/tests/services/appscan-service.test.js`
  - `/tests/services/jira-service.test.js`

- [ ] **8.1.3** Test state management
  - `/tests/state/store.test.js`
  - Test filters, sorting, selection logic

- [ ] **8.1.4** Test keyboard management
  - `/tests/tui/keyboard.test.js`
  - Test key normalization
  - Test mode switching
  - Test shortcut handling

### 8.2 Component Tests (with ink-testing-library)
- [ ] **8.2.1** Install test dependencies
  ```json
  {
    "devDependencies": {
      "ink-testing-library": "^4.x",
      "@testing-library/react": "^14.x"
    }
  }
  ```

- [ ] **8.2.2** Test components
  - `/tests/tui/components/ScrollableList.test.js`
  - `/tests/tui/components/Modal.test.js`
  - `/tests/tui/components/Panel.test.js`

### 8.3 Linting & Formatting
- [ ] **8.3.1** Update ESLint configuration
  ```javascript
  // eslint.config.js
  import eslintPluginReact from 'eslint-plugin-react';
  import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
  
  export default [
    {
      plugins: {
        react: eslintPluginReact,
        'react-hooks': eslintPluginReactHooks,
      },
      rules: {
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ];
  ```

- [ ] **8.3.2** Add pre-commit hooks
  ```json
  // package.json
  {
    "scripts": {
      "precommit": "npm run lint && npm run format:check && npm test"
    }
  }
  ```

### 8.4 Type Checking (JSDoc)
- [ ] **8.4.1** Add comprehensive JSDoc types
  - Define types for all API responses
  - Define types for all state objects
  - Define types for all component props

- [ ] **8.4.2** Enable TypeScript checking for JSDoc
  ```json
  // jsconfig.json
  {
    "compilerOptions": {
      "checkJs": true,
      "strictNullChecks": true
    }
  }
  ```

---

## Phase 9: Documentation & Packaging

### 9.1 Documentation
- [ ] **9.1.1** Update README.md
  - Installation instructions
  - CLI usage examples
  - TUI usage guide
  - Configuration options
  - Keyboard shortcuts reference

- [ ] **9.1.2** Create CHANGELOG.md
  - Version 2.0.0 changes
  - Breaking changes from 1.x
  - Migration guide

- [ ] **9.1.3** Create CONTRIBUTING.md
  - Development setup
  - Code style guidelines
  - Testing requirements
  - PR process

### 9.2 NPM Package
- [ ] **9.2.1** Update package.json for publishing
  ```json
  {
    "name": "@metanull/appscan-client",
    "version": "2.0.0",
    "description": "HCL AppScan Cloud CLI and TUI for vulnerability triage",
    "main": "dist/index.js",
    "bin": {
      "appscan": "./dist/index.js"
    },
    "files": [
      "dist",
      "README.md",
      "LICENSE"
    ],
    "publishConfig": {
      "registry": "https://npm.pkg.github.com"
    }
  }
  ```

- [ ] **9.2.2** Create release workflow
  - GitHub Actions for CI/CD
  - Automated npm publishing
  - Version bumping script

### 9.3 Windows Compatibility
- [ ] **9.3.1** Test on Windows PowerShell
  - Path handling
  - Terminal colors
  - Keyboard input
  - File operations

- [ ] **9.3.2** Document Windows-specific considerations
  - PowerShell execution policy
  - Terminal emulator recommendations
  - Known issues/workarounds

---

## Appendix: Keyboard Shortcuts Reference

| Key | Action | Mode |
|-----|--------|------|
| `↑` / `k` | Move cursor up | Normal, Modal |
| `↓` / `j` | Move cursor down | Normal, Modal |
| `Page Up` | Page up | Normal, Modal |
| `Page Down` | Page down | Normal, Modal |
| `Home` / `g` | Go to first item | Normal, Modal |
| `End` / `G` | Go to last item | Normal, Modal |
| `Enter` | Select/Open details | Normal, Modal |
| `Space` | Toggle multi-select | Normal |
| `Ctrl+A` | Select all | Normal |
| `Ctrl+Shift+A` | Clear selection | Normal |
| `Escape` / `b` | Back/Close | Normal, Modal |
| `a` | Change application | Normal |
| `s` | Change scan | Normal |
| `f` | Open filter | Normal |
| `/` | Open search | Normal |
| `l` | Open links | Normal |
| `u` | Update status | Normal |
| `j` | Create Jira issue | Normal |
| `c` | Toggle context pane | Normal |
| `r` | Refresh data | Normal |
| `h` / `?` | Show help | Normal |
| `q` | Quit | Normal |

---

## Estimated Timeline

| Phase | Estimated Duration | Notes |
|-------|-------------------|-------|
| Phase 1: Restructuring | 2-3 days | |
| Phase 2: Infrastructure | 2 days | |
| Phase 3: UI Architecture | 4 days | +1 day for panel optimization |
| Phase 4: Keyboard System | 2 days | |
| Phase 5: Modal System | 3 days | |
| Phase 6: Main Screen | 3 days | +1 day for render optimization |
| Phase 7: Features | 2 days | |
| Phase 8: Testing | 4 days | +1 day for render loop tests |
| Phase 9: Documentation | 1 day | |
| **Total** | **23-26 days** | |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "ink-link": "^4.1.0",
    "ink-use-stdout-dimensions": "^1.0.5"
  },
  "devDependencies": {
    "ink-testing-library": "^4.0.0"
  }
}
```

---

## Notes

1. **KISS Principle**: Each component does one thing well. No complex inheritance hierarchies.

2. **DRY Principle**: Shared utilities in `/src/utils`, shared components in `/src/tui/components`.

3. **Ink Best Practices**: 
   - Single `useInput` at root level
   - Use `useFocus`/`useFocusManager` for focus management
   - Use `useStdout` for terminal dimensions
   - Leverage Flexbox for layouts

4. **React Best Practices**:
   - Functional components with hooks
   - Memoization for expensive computations
   - Proper cleanup in useEffect

5. **Windows Compatibility**:
   - Use `path.join` for file paths
   - Handle both `/` and `\` separators
   - Test with PowerShell terminal

6. **⚠️ CRITICAL - Preventing Render Loops**:
   - **NEVER** store derived state - compute inline or with `useMemo`
   - **NEVER** use `useEffect` to update state based on other state
   - **ALWAYS** use Zustand selectors to subscribe to specific slices
   - **ALWAYS** wrap callbacks in `useCallback` before passing to children
   - **ALWAYS** use `React.memo` for list items and panels
   - **ALWAYS** debounce async fetches triggered by cursor movement
   - **ALWAYS** use stable references for functions and objects
   - **TEST** for render counts and memory stability

---

## Critical Architecture: Preventing Infinite Loops & Memory Leaks

> **⚠️ IMPORTANT**: The multi-panel layout where panels refresh when cursor moves is prone to infinite render loops and memory exhaustion. This section defines the architectural patterns that MUST be followed throughout the implementation.

### Root Cause Analysis

The original implementation caused crashes due to:
1. **Cascading State Updates**: Cursor change → panel refresh → data fetch → state update → re-render → cursor re-evaluation → loop
2. **Unstable Callback References**: Creating new function instances on every render causes child components to re-render
3. **Synchronous Side Effects**: Fetching data directly in render cycle without proper boundaries
4. **Missing Memoization**: Expensive computations (filtering, sorting) running on every render
5. **Bidirectional Data Binding**: State changes in children affecting parent state

### Architectural Patterns to Follow

#### Pattern 1: Single Source of Truth with Derived State
```javascript
// ❌ BAD: Duplicated state that can get out of sync
const [cursor, setCursor] = useState(0);
const [currentIssue, setCurrentIssue] = useState(null);

useEffect(() => {
  setCurrentIssue(issues[cursor]); // This triggers another render!
}, [cursor, issues]);

// ✅ GOOD: Derived state computed during render
const [cursor, setCursor] = useState(0);
const currentIssue = issues[cursor]; // No state, no effect, no extra render
```

#### Pattern 2: Memoized Expensive Computations
```javascript
// ❌ BAD: Filtering on every render
const filteredIssues = issues.filter(i => i.Severity === filter);

// ✅ GOOD: Memoized filtering
const filteredIssues = useMemo(() => {
  return issues.filter(i => i.Severity === filter);
}, [issues, filter]); // Only recomputes when dependencies change
```

#### Pattern 3: Stable Callback References
```javascript
// ❌ BAD: New function instance on every render
<ChildComponent onSelect={(item) => handleSelect(item)} />

// ✅ GOOD: Stable callback reference
const handleSelectCallback = useCallback((item) => {
  handleSelect(item);
}, [handleSelect]); // Or [] if handleSelect is stable

<ChildComponent onSelect={handleSelectCallback} />
```

#### Pattern 4: Async Data Fetching with Boundaries
```javascript
// ❌ BAD: Fetching in useEffect triggered by cursor
useEffect(() => {
  fetchArticle(currentIssue.Id).then(setArticle); // Triggers re-render!
}, [currentIssue]);

// ✅ GOOD: Debounced fetching with loading state
const [articleCache, setArticleCache] = useState({});
const [loadingArticle, setLoadingArticle] = useState(false);

const debouncedFetch = useMemo(
  () => debounce((issueId) => {
    if (articleCache[issueId]) return; // Already cached
    setLoadingArticle(true);
    fetchArticle(issueId)
      .then(article => {
        setArticleCache(prev => ({ ...prev, [issueId]: article }));
      })
      .finally(() => setLoadingArticle(false));
  }, 300), // 300ms debounce
  [articleCache]
);

useEffect(() => {
  if (currentIssue?.Id) {
    debouncedFetch(currentIssue.Id);
  }
}, [currentIssue?.Id, debouncedFetch]);

const article = articleCache[currentIssue?.Id]; // Derived, not state
```

#### Pattern 5: Zustand Selectors to Prevent Re-renders
```javascript
// ❌ BAD: Subscribing to entire store causes re-render on any change
const state = useStore(); // Re-renders when ANY state changes

// ✅ GOOD: Subscribe only to needed slices
const cursor = useStore(state => state.cursor);
const issues = useStore(state => state.issues);

// ✅ EVEN BETTER: Use shallow equality for objects/arrays
import { shallow } from 'zustand/shallow';
const { cursor, issues } = useStore(
  state => ({ cursor: state.cursor, issues: state.issues }),
  shallow
);
```

#### Pattern 6: Component Isolation with React.memo
```javascript
// ❌ BAD: Child re-renders whenever parent re-renders
function VulnRow({ issue, isCursor }) {
  return <Text>{issue.IssueType}</Text>;
}

// ✅ GOOD: Child only re-renders when props actually change
const VulnRow = React.memo(function VulnRow({ issue, isCursor }) {
  return <Text>{issue.IssueType}</Text>;
});

// With custom comparison for complex props
const VulnRow = React.memo(
  function VulnRow({ issue, isCursor }) { ... },
  (prevProps, nextProps) => {
    return prevProps.issue.Id === nextProps.issue.Id 
        && prevProps.isCursor === nextProps.isCursor;
  }
);
```

#### Pattern 7: Event Coalescing for Rapid Input
```javascript
// ❌ BAD: Every keypress immediately updates state
useInput((input, key) => {
  if (key.downArrow) setCursor(c => c + 1);
});

// ✅ GOOD: Batch rapid keypresses
const pendingCursorMove = useRef(0);
const flushCursorMove = useMemo(
  () => throttle(() => {
    if (pendingCursorMove.current !== 0) {
      setCursor(c => c + pendingCursorMove.current);
      pendingCursorMove.current = 0;
    }
  }, 16), // ~60fps
  [setCursor]
);

useInput((input, key) => {
  if (key.downArrow) {
    pendingCursorMove.current += 1;
    flushCursorMove();
  }
});
```

### State Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Source Data │  │ UI State    │  │ Cache       │              │
│  │ - issues[]  │  │ - cursor    │  │ - articles  │              │
│  │ - apps[]    │  │ - mode      │  │ - comments  │              │
│  │ - scans[]   │  │ - filters   │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Selectors (subscribe to specific slices)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENTS                                  │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ VulnList     │    │ DetailsPane  │    │ ContextPane  │       │
│  │              │    │              │    │              │       │
│  │ subscribes:  │    │ subscribes:  │    │ subscribes:  │       │
│  │ - issues     │    │ - cursor     │    │ - app        │       │
│  │ - cursor     │    │ - issues     │    │ - scan       │       │
│  │ - filters    │    │ - cache      │    │              │       │
│  │              │    │              │    │              │       │
│  │ derives:     │    │ derives:     │    │              │       │
│  │ - filtered   │    │ - current    │    │              │       │
│  │ - visible    │    │ - article    │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         └───────────────────┴───────────────────┘                │
│                             │                                    │
│                    NO DIRECT COMMUNICATION                       │
│                    Only through store actions                    │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Checklist

Before implementing any component, verify:

- [ ] **No derived state stored**: If a value can be computed from other state, compute it inline or with `useMemo`
- [ ] **Stable callbacks**: All callbacks passed to children wrapped in `useCallback`
- [ ] **Selective subscriptions**: Using Zustand selectors, not subscribing to entire store
- [ ] **Memoized components**: List items and panels wrapped in `React.memo`
- [ ] **Debounced fetches**: Any API call triggered by cursor movement is debounced
- [ ] **No effects updating state based on state**: Avoid `useEffect(() => setState(derived), [state])`
- [ ] **Cache for async data**: Fetched data stored in cache, not refetched on every cursor move

---