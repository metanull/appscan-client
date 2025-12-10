# AppScan Ink Triage UI

A modern, terminal-based user interface (TUI) for triaging AppScan vulnerabilities, built with [Ink](https://github.com/vadimdemedes/ink).

## Features

This Ink-based TUI provides all the features of the original `triage-report interactive` command, plus additional enhancements:

### Core Features
- **3-Pane Layout**: VS Code-inspired interface with applications/scans tree, vulnerability list, and details panel
- **Keyboard-Driven Navigation**: Efficient navigation with vim-style keybindings
- **Multi-Select**: Select multiple vulnerabilities for bulk operations
- **Real-Time Filtering**: Filter by status, severity, type, Jira presence, or text search
- **Vulnerability Grouping**: Automatic grouping by type, severity, or custom criteria
- **Article Rendering**: Sanitized HTML-to-Markdown conversion for remediation guidance
- **Jira Integration**: Create and link Jira issues directly from the UI
- **Virtual Scrolling**: Handle large vulnerability lists efficiently

### Enhanced Features (New)
- **Jira Issue Preview**: View Jira issue details without leaving the app (when implemented)
- **Better Visual Feedback**: Color-coded severity and status badges
- **Live Statistics**: Real-time counts and summaries
- **Filter Persistence**: Active filters displayed in status bar

## Installation

```bash
cd ink-triage
npm install
```

## Usage

### Basic Usage

```bash
npm start
```

### With Custom Configuration

```bash
npm start -- --config /path/to/.appscantriage.json
```

### Using the Binary

After installing dependencies, you can run:

```bash
./src/index.js
```

Or using npm:

```bash
npm link
appscan-triage-ui
```

## Keyboard Shortcuts

### Navigation
- `↑` / `k` - Move up
- `↓` / `j` - Move down  
- `Enter` - Select / View details
- `Backspace` - Go back
- `q` - Quit

### Issue Actions
- `Space` - Toggle selection
- `Ctrl+A` - Select all visible issues
- `u` - Update status (single or bulk)
- `c` - Create Jira issue for selected
- `v` - View issue details (quick)
- `V` - View issue details with article

### Filtering
- `f` - Open filter menu
- `/` - Search by text
- `DEL` - Clear all active filters

### Other
- `r` - Refresh current view
- `?` - Toggle help panel

## Architecture

### Directory Structure

```
ink-triage/
├── src/
│   ├── ui/              # React components
│   │   ├── InkApp.js    # Main app container
│   │   ├── Toolbar.js   # Top toolbar
│   │   ├── LeftNav.js   # Left navigation panel
│   │   ├── VulnList.js  # Vulnerability list
│   │   ├── VulnRow.js   # Single vulnerability row
│   │   ├── DetailsPanel.js  # Right details panel
│   │   ├── CommandBar.js    # Bottom status bar
│   │   ├── HelpPanel.js     # Help overlay
│   │   └── JiraPanel.js     # Jira creation modal
│   ├── state/           # State management
│   │   └── AppContext.js    # Zustand store
│   ├── services/        # Service wrappers
│   │   ├── appscan.js   # AppScan API wrapper
│   │   └── jira.js      # Jira API wrapper
│   ├── utils/           # Utilities
│   │   ├── issue-utils.js      # Issue grouping/formatting
│   │   └── article-processor.js # HTML/Markdown processing
│   └── index.js         # Entry point
├── tests/               # Test files
└── package.json
```

### State Management

Uses [Zustand](https://github.com/pmndrs/zustand) for global state management with a single store containing:
- Navigation state (current view, selected items)
- Data (applications, scans, issues)
- Filters (status, severity, type, Jira, search)
- UI state (loading, errors, modals)
- Selection state (multi-select tracking)

### Service Layer

The services wrap the parent package's AppScanService and JiraService to provide a clean interface for the UI:
- `AppScanService`: Authentication, listing, issue operations
- `JiraService`: Jira issue creation, search, preview

### Components

Components follow the React/Ink pattern:
- Stateless functional components
- Use hooks for state and effects
- Responsive layout with flexbox
- Accessible keyboard navigation

## Configuration

Uses the same configuration as the parent `appscan-client` package. Configuration can be provided via:
- `.env` file
- `.appscantriage.json` file
- `--config` CLI flag

Required environment variables:
- `APPSCAN_CLIENT_ID`
- `APPSCAN_CLIENT_SECRET`
- `APPSCAN_BASE_URL` (optional, defaults to EU cloud)

Optional Jira configuration:
- `JIRA_HOST`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`

## Development

### Run in Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Feature Parity Checklist

This Ink UI provides complete feature parity with `triage-report interactive`:

- [x] Application selection
- [x] Scan selection with auto-select for single scan
- [x] Scan type filtering (SAST, DAST, SCA, IAST, IAC)
- [x] Vulnerability listing
- [x] Vulnerability grouping by type
- [x] Status filtering (Open, InProgress, Noise, Passed, Fixed)
- [x] Severity filtering (Critical, High, Medium, Low, Informational)
- [x] Vulnerability type filtering
- [x] Jira link filtering (with/without)
- [x] Text search
- [x] Issue details view (quick)
- [x] Issue details view with article
- [x] Article rendering (HTML → Markdown → Terminal)
- [x] Single issue status update
- [x] Bulk issue status update
- [x] Multi-select for bulk operations
- [x] Jira issue creation (grouped by type/severity/none)
- [x] Jira issue linking to AppScan
- [x] Filter clearing
- [x] Refresh functionality
- [x] Navigation breadcrumbs
- [x] Active filter display

### Enhanced Features (Beyond Original)

- [ ] Jira issue preview in-app
- [x] Better visual feedback with badges
- [x] Live statistics and counts
- [x] Virtual scrolling for performance
- [x] Modern TUI with 3-pane layout

## Design Principles

### KISS (Keep It Simple, Stupid)
- Simple, focused components
- Clear separation of concerns
- Minimal abstraction layers

### DRY (Don't Repeat Yourself)
- Reuse parent package services
- Shared utilities for common operations
- Component composition over duplication

### Security
- HTML sanitization for articles
- No eval() or dangerous operations
- Input validation
- Secure API credential handling

### Maintainability
- Clear file organization
- Business logic separated from UI
- Comprehensive comments
- Testable components

## License

ISC
