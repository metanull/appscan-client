# Ink-Triage Refactoring Plan

> **Goal**: Consolidate CLI + TUI into a single npm package with improved UX, proper keyboard handling, modal-based navigation, and no render loops.

---

## Prerequisites

Before starting, understand these core principles that prevent infinite loops:

1. **Never store derived state** - If a value can be computed from other state, compute it inline with `useMemo`
2. **Debounce async fetches** - Any API call triggered by cursor movement must be debounced (300ms)
3. **Use Zustand selectors** - Subscribe only to specific state slices, never the entire store
4. **Memoize components** - Wrap list items and panels in `React.memo`
5. **Stable callbacks** - Wrap callbacks in `useCallback` before passing to children

---

## Tasks

### 1. Merge Package Structure
- [ ] Create single `package.json` at root with merged dependencies from both `/package.json` and `/ink-triage/package.json`
- [ ] Set binary entry: `"bin": { "appscan": "./dist/index.js" }`
- [ ] Add dependencies: `ink-link@^4.x`, `ink-use-stdout-dimensions@^1.x`
- [ ] Update `build.js` to bundle everything into `/dist`

### 2. Reorganize Source Files
- [ ] Move `/ink-triage/src/*` to `/src/tui/`
- [ ] Keep `/src/commands/` as `/src/cli/commands/`
- [ ] Keep `/src/services/` and `/src/utils/` as shared code
- [ ] Move `/ink-triage/tests/*` to `/tests/tui/`
- [ ] Delete `/ink-triage` folder after migration

### 3. Create Unified Entry Point
- [ ] Create `/src/index.js` that routes to CLI (commander) or TUI (ink) based on arguments
- [ ] No args or `triage` command → launches TUI
- [ ] Other commands → handled by CLI

### 4. Add Debounce/Throttle Utilities
- [ ] Create `/src/utils/debounce.js` with `debounce()` and `throttle()` functions

### 5. Add Cache to Zustand Store
- [ ] Add `articleCache: {}` and `commentsCache: {}` to store
- [ ] Add `setArticleCache(issueId, data)` action
- [ ] Add `invalidateCacheForIssue(issueId)` action

### 6. Create Terminal Size Hook
- [ ] Create `/src/tui/hooks/useTerminalSize.js` using `useStdout` from Ink
- [ ] Returns `{ width, height }` and updates on terminal resize

### 7. Create Derived State Hooks
- [ ] Create `useCurrentIssue()` hook - computes current issue from cursor + filtered list (no state)
- [ ] Create `useArticleCache(issueId)` hook - returns cached article, fetches with debounce if missing

### 8. Refactor Keyboard Manager
- [ ] Single `useInput` at app root level
- [ ] Mode-based routing: NORMAL (shortcuts active), INPUT (text entry), MODAL (delegates to modal)
- [ ] Support HOME, END, PageUp, PageDown keys
- [ ] Properly handle Ctrl/Shift modifiers

### 9. Create Base UI Components
- [ ] `Layout` - full-screen container with header/footer slots
- [ ] `Panel` - bordered box with title, used for each pane
- [ ] `ScrollableList` - virtual scrolling, only renders visible items, handles cursor navigation
- [ ] `Modal` - centered overlay, manages keyboard mode, supports ESC to close

### 10. Create Selection Modals
- [ ] `AppSelectionModal` - scrollable list with search, sort by name/issues, hide empty option
- [ ] `ScanSelectionModal` - same features plus filter by scan type (SAST/DAST/SCA/IAST)
- [ ] `IssueDetailsModal` - scrollable view of full issue details + article content

### 11. Create Action Modals
- [ ] `FilterModal` - filter by severity, status, type, etc.
- [ ] `SearchModal` - text search across issues
- [ ] `LinksModal` - clickable hyperlinks using `ink-link`
- [ ] `UpdateStatusModal` - status dropdown + comment field + templates
- [ ] `CreateJiraModal` - create Jira issue form
- [ ] `HelpModal` - keyboard shortcuts reference

### 12. Build Main Screen
- [ ] Single-page design: context pane (left), vulnerability list (center), details preview (right)
- [ ] Context pane shows selected app/scan info, toggleable with `c` key
- [ ] Vulnerability list uses `ScrollableList` with memoized row components
- [ ] Details preview uses `useCurrentIssue()` and `useArticleCache()` - no direct state updates
- [ ] All navigation via modals (press `a` for app, `s` for scan, `f` for filter, etc.)

### 13. Apply Render Optimization to All Panels
- [ ] Wrap each panel component in `React.memo`
- [ ] Wrap each list item component in `React.memo`
- [ ] Use Zustand selectors (not `useStore()` without selector)
- [ ] Ensure no `useEffect` updates state based on other state

### 14. Fix Layout Issues
- [ ] Status and Severity on separate lines (prevents overlap)
- [ ] Dynamic row count based on terminal height
- [ ] Proper text truncation with `wrap="truncate"`

### 15. Auto-Setup Detection
- [ ] Check for `.env` or config file on startup
- [ ] If missing, launch setup wizard automatically
- [ ] Add `--setup` CLI flag to force wizard

### 16. Add Tests for Render Stability
- [ ] Test: cursor movement causes max 1 re-render per affected component
- [ ] Test: rapid cursor movement triggers max 2-3 API calls (debounced)
- [ ] Test: memory stable during navigation (no leaks)

### 17. Update Documentation
- [ ] Update README with new usage instructions
- [ ] Document keyboard shortcuts
- [ ] Remove outdated docs

### 18. Final Cleanup
- [ ] Run linter and fix issues
- [ ] Test on Windows PowerShell
- [ ] Verify all keyboard shortcuts work

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Move cursor |
| `PageUp/PageDown` | Page navigation |
| `Home/End` | Go to first/last |
| `Enter` | Open details modal |
| `Space` | Toggle selection |
| `Ctrl+A` | Select all |
| `Escape` | Close modal / go back |
| `a` | Change application |
| `s` | Change scan |
| `f` | Filter |
| `/` | Search |
| `l` | Links |
| `u` | Update status |
| `j` | Create Jira |
| `c` | Toggle context pane |
| `r` | Refresh |
| `h` or `?` | Help |
| `q` | Quit |

---

## Dependencies to Add

```json
{
  "ink-link": "^4.1.0",
  "ink-use-stdout-dimensions": "^1.0.5"
}
```
