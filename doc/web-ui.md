# AppScan Client - Web UI

The AppScan Client now includes a modern React-based Web UI that mirrors all the features of the Terminal UI (TUI).

## Features

The Web UI provides the same 3-pane layout and all features as the TUI:

- **Application Selection** - Browse and select applications
- **Scan Selection** - View and filter scans
- **Issue Management** - View, filter, and manage vulnerabilities
- **Context Pane** - Shows selected app/scan info (toggle with `c`)
- **Details Preview** - Quick preview of selected issue
- **Filtering** - Filter by status, severity, issue type, and Jira status
- **Search** - Full-text search across issues
- **Bulk Operations** - Multi-select and bulk update issues
- **Jira Integration** - Create, link, and unlink Jira issues
- **Keyboard Shortcuts** - Same shortcuts as TUI work in the browser

## Starting the Web UI

```bash
# Start with default port (3000)
appscan web

# Start with custom port
appscan web --port 8080
```

The server will start and display:
```
🌐 AppScan Web UI running at http://localhost:3000
Press Ctrl+C to stop
```

## Accessing the Web UI

Open your browser and navigate to:
- http://localhost:3000 (or your custom port)

## Keyboard Shortcuts

The same keyboard shortcuts from the TUI work in the Web UI:

| Key | Action |
|-----|--------|
| `a` | Change application |
| `s` | Change scan |
| `f` | Filter issues |
| `/` | Search issues |
| `l` | Show links for selected issue |
| `u` | Update status of selected issues |
| `j` | Create Jira issue for selected issues |
| `c` | Toggle context pane |
| `r` | Refresh page |
| `h` or `?` | Show help modal |
| `q` | Quit (close tab) |
| `Escape` | Go back / Close modal |
| `Space` | Toggle issue selection |
| `Enter` | View issue details |

## Architecture

The Web UI consists of:

### Backend (Express Server)
- Located in `src/web/server.js`
- Provides RESTful API endpoints
- Uses the same AppScan and Jira services as the CLI/TUI
- Serves the built React application

### Frontend (React + Vite)
- Located in `src/web/src/`
- Built with React 19 and Vite
- Uses Zustand for state management (same pattern as TUI)
- Styled to mirror the TUI's terminal aesthetic
- Responsive and accessible

### API Endpoints

The server provides the following API endpoints:

- `GET /api/applications` - List all applications
- `GET /api/applications/:appId/scans` - Get scans for an app
- `GET /api/scans/:scanId/issues` - Get issues for a scan
- `GET /api/applications/:appId/issues` - Get all issues for an app
- `GET /api/issues/:issueId/details` - Get issue details
- `GET /api/issues/:issueId/article` - Get remediation article
- `GET /api/issues/:issueId/comments` - Get issue comments
- `PUT /api/issues/:issueId/status` - Update issue status
- `PUT /api/issues/bulk/status` - Bulk update issue statuses
- `POST /api/jira/issue` - Create Jira issue
- `PUT /api/issues/:issueId/jira/link` - Link Jira issue
- `DELETE /api/issues/:issueId/jira/link` - Unlink Jira issue

## Development

To develop the Web UI:

```bash
# Install dependencies
npm install

# Start the backend server
npm run web

# In another terminal, start Vite dev server for hot reload
cd src/web
npx vite

# The dev server will proxy API calls to the backend
```

The Vite dev server runs on port 5173 by default and proxies `/api` requests to the Express server on port 3000.

## Building

The Web UI is built as part of the standard build process:

```bash
npm run build
```

This will:
1. Build the CLI/TUI with esbuild (`dist/index.js`)
2. Build the Web UI with Vite (`dist/web/`)

## Deployment

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in:
   - `dist/index.js` - The main CLI entry point (includes web server)
   - `dist/web/` - The built React application

3. Run the server:
   ```bash
   node dist/index.js web --port 3000
   ```

4. (Optional) Use a reverse proxy like nginx to handle SSL/TLS and serve the application.

## Configuration

The Web UI uses the same configuration as the CLI/TUI:

- `.env` file in the user's home directory (`.appscan-client/.env`)
- Environment variables:
  - `APPSCAN_API_KEY` - AppScan API key
  - `APPSCAN_API_SECRET` - AppScan API secret
  - `APPSCAN_BASE_URL` - AppScan base URL (default: https://cloud.appscan.com)
  - `JIRA_HOST` - Jira host URL
  - `JIRA_EMAIL` - Jira email
  - `JIRA_API_TOKEN` - Jira API token
  - `JIRA_PROJECT_KEY` - Default Jira project key
  - `WEB_PORT` - Web server port (default: 3000)

Run `appscan setup` to configure these values interactively.

## Differences from TUI

While the Web UI mirrors all TUI features, there are some minor differences:

1. **Navigation** - Uses mouse clicks in addition to keyboard shortcuts
2. **Scrolling** - Standard browser scrolling instead of terminal paging
3. **Multi-window** - Can be opened in multiple browser tabs simultaneously
4. **Visual Style** - Terminal-inspired dark theme optimized for browsers
5. **No Installation** - Can be accessed from any device with a browser

## Troubleshooting

### Port Already in Use

If you get an error that the port is already in use:

```bash
# Use a different port
appscan web --port 8080
```

### Cannot Connect to API

Ensure your `.env` file is configured correctly:

```bash
# Run the setup wizard
appscan setup

# Test the connection
appscan connection-check
```

### Web UI Not Loading

1. Check that the server is running
2. Check the browser console for errors
3. Ensure you're accessing the correct URL and port
4. Try rebuilding: `npm run build`
