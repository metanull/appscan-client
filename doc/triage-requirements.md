# Triage - Requirements & Design

Overview

The `triage` command is the primary interactive tool to help security teams review and manage vulnerabilities found by AppScan. It must support efficient human workflows, accurate issue linking, and safe Jira integration.

Goals

- Provide a fast and intuitive terminal-based triage workflow.
- Make it simple to inspect, group, and update issues in bulk.
- Support safe and compact Jira issue creation.
- Provide traceability between Jira tickets and AppScan issues.

Stakeholders

- Security engineers and triage teams
- Developers receiving Jira tickets for remediation
- Maintainers of the CLI (devs)

Functional Requirements

1. Authentication
   - Must authenticate to AppScan via configured credentials (.env or explicit config file)
   - Validate connection early and inform user if missing/incorrect credentials

2. Scan selection and filtering
   - List scans (optionally filtered by Technology `--scan-type` with values: `StaticAnalyzer`, `DynamicAnalyzer`, `ScaAnalyzer`)
   - Display app name, scan type, and scan name compactly. Sort scan list *alphabetically* by scan name.
   - Allow quick selection of a scan (via interactive prompt)

3. Issue loading and display
   - For selected scan, fetch issues excluding `Noise` by default.
   - Display grouped summary or a detailed grouping by issue type.
   - Show context snippet (short string) beside each issue item in the UI.
   - Show a single link to view the Scan in AppScan at the top of issue list.

4. Actions on issues
   - Update selected issues' status in bulk and optionally add comments.
   - Create Jira issue(s): support creating for (a) all true positives and (b) only selected items.
   - Viewing issue details inline.

5. Jira creation specifics
   - Jira integration is optional and enabled by environment (.env) settings.
   - Jira descriptions must be compact and built to avoid Jira CONTENT_LIMIT_EXCEEDED errors (approx 32KB).
   - For each issue type group, include a short bullet list of items: severity, short path, optional line number and short inline code context.
   - After each issue-type block include a remediation link for that issue type (AppScan article link) — not embedding the article HTML in the Jira description.
   - Include a final section with unique AppScan comments (deduplicated) in quoted blocks.
   - Create and set ExternalId in AppScan issues with the Jira key where possible.

6. Traceability & Links
   - Each issue bullet must contain a short link (display text shortened — e.g., `project/repo/path`) and the absolute URL as the link target.
   - Display a scan-level AppScan URL near the issue list top for human navigation.

7. Performance & API load
   - Avoid making N separate API calls per scan when listing scans.
   - Load scan list without preloading issue counts; only fetch detail for the selected scan.

8. Extensibility
   - Keep Jira creation logic isolated in a single function (DRY) and well-tested.
   - Expose straightforward hooks for adding new triage actions (e.g., auto-assign, label templates).

9. Error handling
   - Clear error messages for missing config, unreachable AppScan, or Jira errors.
   - Fall back gracefully when Jira is misconfigured (do not crash the triage loop).
   - Show helpful next steps in the UI message (e.g., run `appscan setup`).

10. UX
   - Provide clear, color-coded outputs to group severities.
   - Show counts for each group and clear prompts at each step.
   - Provide `Refresh` and `Back` actions without losing progress.

11. Security
   - Avoid logging secrets. Do not write API tokens into debug outputs.
   - When writing Jira issue content, escape or sanitize inputs to avoid injection into ADF.

12. Tests & CI
   - Unit tests for formatting utilities, Jira description builder, and triage UI helpers.
   - Integration tests for end-to-end flow with a sandbox AppScan account and a Jira test project (optional in CI, expensive).
   - Mock HTTP responses for unit/integration tests (do not store real tokens in CI).

Implementation Notes & Architecture

- `src/commands/triage.js` — driving workflow; prompts orchestrated here. Keep logic thin and move heavy pieces into helpers.
- `src/utils/triage-ui.js` — prompt builders, formatters, colorized output. Keep this focused on display concerns so it is testable.
- `src/services/jira-service.js` — thin wrapper around jira.js. Convert Markdown snippets to ADF carefully; prefer inline code and simple nodes to avoid huge doc trees.
- `src/services/appscan-service.js` — API interaction layer; triage should rely on this for fetching lists and issue details.
- Keep JIRA creation logic centralized and testable (unit tests for different lengths and content limits).

Acceptance Criteria

- Users can run `appscan triage` and complete a triage flow from scan selection to Jira creation without exceeding Jira content limits for typical scans.
- All problematic content is truncated/sanitized automatically and documented.
- The triage flow avoids fetching counts for every scan at list time, ensuring responsiveness.
- Unit tests cover the content-builder, comment deduplication, and formatting rules.

Next steps for maintainers

- Add tests for Jira description generation (size-limit checks, multiple issue types with remediations, comment deduplication).
- Consider feature flags for long-running operations (e.g., bulk triage across many scans).
- Add instrumentation/logging for slow API operations to identify future performance optimizations.

