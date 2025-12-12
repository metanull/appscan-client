# AppScan Ink Triage UI

A modern, terminal-based user interface (TUI) for triaging AppScan vulnerabilities, built with [Ink](https://github.com/vadimdemedes/ink).

## Features

- 🎨 Modern, interactive terminal UI with React Ink
- 🔍 Browse applications, scans, and vulnerabilities
- 📊 Filter by status, severity, issue type, and JIRA status
- 🔎 Full-text search across issues
- ✅ Bulk operations (select multiple issues)
- 🎫 Create JIRA issues with grouping options
- 📖 View detailed vulnerability information with remediation articles
- ⌨️ Vim-style keyboard shortcuts
- 🛠️ Interactive setup wizard for easy configuration

## Quick Start

### First-time Setup

Run the setup wizard to configure your credentials:

```bash
npm run setup
```

The wizard will guide you through:
- AppScan API credentials (required)
- JIRA integration (optional)
- Confluence OWASP ASVS links (optional)

Configuration is saved to `.env` file in the project root.

### Start the Application

```bash
npm start
```

The setup wizard will automatically launch if no configuration is found.

## Configuration

### Automated Setup (Recommended)

```bash
npm run setup
```

### Manual Configuration

Create a `.env` file in the project root:

```env
# AppScan API Configuration
APPSCAN_API_KEY=your_api_key_here
APPSCAN_API_SECRET=your_api_secret_here
APPSCAN_BASE_URL=https://cloud.appscan.com

# JIRA Configuration (optional)
JIRA_HOST=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_KEY=SEC
```

### With Custom Configuration

```bash
npm start -- --config /path/to/.appscantriage.json
```

### Development Mode

```bash
npm run dev
```

## Alternative: Using the Original Interactive Mode

While the Ink TUI is being finalized, you can use the fully functional original interactive mode:

```bash
cd ..
npm start triage-report interactive
```

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

## Comment Templates

When updating vulnerability status, the app provides reusable comment templates based on vulnerability type. This saves time by avoiding repetitive typing.

### How It Works

1. When updating status, if templates exist for the vulnerability type, you'll see a selection list
2. Choose a predefined template or select "Custom message..." to type your own
3. Custom messages are automatically saved as new templates for future use
4. Templates are stored in `comment-templates.txt` and can be edited directly

### Template File Format

The `comment-templates.txt` file uses a simple format:

```
# Comments start with #
[VulnerabilityType]|Comment text

# Examples:
Cross-Site Scripting (XSS)|Input is properly sanitized and encoded before output
SQL Injection|Using parameterized queries - not vulnerable
```

### Editing Templates

You can edit `comment-templates.txt` directly in any text editor:
- Add new templates for any vulnerability type
- Remove templates you don't need
- Share templates with your team via source control
- Predefined templates are distributed with the package

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
