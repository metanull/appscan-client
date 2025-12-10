# Quick Reference Guide

**Project:** Unified AppScan Triage & Reporting Tool  
**Date:** December 10, 2025  
**Status:** ✅ Analysis Complete | Implementation Ready

---

## 📄 Documents Created

| Document | Size | Purpose | Audience |
|----------|------|---------|----------|
| `IMPLEMENTATION_PLAN.md` | 1,393 lines | Complete technical specification | Development Teams |
| `ANALYSIS_SUMMARY.md` | 500+ lines | Detailed analysis of findings | Technical Leads |
| `EXECUTIVE_SUMMARY.md` | 300+ lines | High-level overview | Stakeholders/Managers |
| `DELIVERABLES.md` | 400+ lines | Complete checklist | Project Managers |
| **QUICK_REFERENCE.md** (this file) | Brief | Fast lookup guide | All Audiences |

---

## 🎯 Key Information at a Glance

### What's Being Built
A new unified CLI command: `appscan triage-report`
- **Purpose:** Consolidate 18 fragmented commands into cohesive triage workflow
- **Scope:** 8 subcommands + interactive UI
- **Impact:** Maintenance-friendly, consistent UX, extensible design

### Command Structure
```bash
appscan triage-report
├── query              # Query apps, scans, issues, articles
├── status             # Generate status reports
├── update             # Update single issue
├── bulk-update        # Update multiple by ID
├── bulk-update-filter # Update by filter criteria
├── create-jira        # Create grouped Jira issues
├── find-jira          # Find linked Jira issues
└── interactive        # Guided triage workflow
```

### Effort Estimate
- **Total:** 20 days
- **Team:** 2-3 developers
- **Phases:** 5 (Query → Update → Jira → Interactive → Testing)
- **Risk Level:** Medium (Jira integration & interactive UI are complex)

---

## 📋 Implementation Checklist

### Before Starting
- [ ] Read `IMPLEMENTATION_PLAN.md` (Sections 1-3)
- [ ] Review `doc/appscan-api-responses.md`
- [ ] Examine `reports/api-samples/` directories
- [ ] Study existing code in `src/services/` and `src/commands/`
- [ ] Understand AppScan API enums and mappings

### Phase 1: Query & Filtering (3 days)
- [ ] Create `QueryBuilder` class
- [ ] Implement `query` subcommand
  - [ ] Applications query
  - [ ] Scans query
  - [ ] Scan executions query
  - [ ] Vulnerabilities query (with filtering)
  - [ ] Articles query
- [ ] Create `Formatter` utilities (JSON, table, markdown)
- [ ] Unit tests for QueryBuilder

### Phase 2: Status & Update (2 days)
- [ ] Create `status` subcommand
- [ ] Create `update` subcommand (single)
- [ ] Create `bulk-update` subcommand (by IDs)
- [ ] Create `bulk-update-filter` subcommand (by criteria)
- [ ] Integration tests with mock data

### Phase 3: Jira Integration (5 days)
- [ ] Create `JiraDescriptionBuilder` class
- [ ] Create `ArticleMarkdownConverter` class
- [ ] Implement `create-jira` subcommand
  - [ ] Single grouping strategy
  - [ ] Multiple grouping strategies
  - [ ] Content limit enforcement
  - [ ] Auto-linking (ExternalId)
- [ ] Implement `find-jira` subcommand
- [ ] Implement `link-jira` subcommand
- [ ] Tests (content limit edge cases)

### Phase 4: Interactive Workflow (4 days)
- [ ] Create interactive UI helpers (`InteractiveUI` class)
- [ ] Implement `interactive` subcommand
  - [ ] App selection
  - [ ] Scan selection with type filtering
  - [ ] Vulnerability multi-select
  - [ ] Filter/sort/search menu
  - [ ] Action menu (update, create-jira, view details)
- [ ] User testing and refinement

### Phase 5: Testing & Documentation (6 days)
- [ ] Complete unit test suite
- [ ] Complete integration test suite
- [ ] Manual testing against real AppScan
- [ ] Create `doc/triage-report.md` (command reference)
- [ ] Update `README.md` with new command
- [ ] Code review and refinement

---

## 🔑 Critical API Details

### Authentication
```bash
POST /api/v4/Account/ApiKeyLogin
Body: { "KeyId": "...", "KeySecret": "..." }
Response: { "Token": "...", "..." }
→ Use in: Authorization: Bearer <token>
```

### Key Endpoints
```
GET /api/v4/Apps?$top=100
GET /api/v4/Scans?$filter=AppId eq <id>&$top=100
GET /api/v4/Issues/{scope}/{scopeId}?$filter=...&$top=100
PUT /api/v4/Issues/{scope}/{scopeId}  (for updates)
GET /api/v4/Reports/Article/?issuetype=<id>
```

### Must-Know Enum Mappings
```javascript
// Scan Technology (normalize these!)
"StaticAnalyzer" ↔ "SAST"
"DynamicAnalyzer" ↔ "DAST"
"ScaAnalyzer" ↔ "SCA"
"IASTAnalyzer" ↔ "IAST"

// Issue Status (triage lifecycle)
"Open" → Not reviewed
"Noise" → False positive
"InProgress" → True positive (create Jira)
"Passed" → True positive (accepted)
"Fixed" → True positive (already fixed)

// Severity
"Informational", "Low", "Medium", "High", "Critical"
```

---

## ⚠️ Critical Constraints

### DO NOT
- ❌ Modify existing commands
- ❌ Require external resource access
- ❌ Hard-code Jira configuration
- ❌ Log secrets or tokens
- ❌ Create 18 separate subcommands (consolidate!)

### MUST DO
- ✅ Use existing services (AppScanService, JiraService)
- ✅ Follow project code style
- ✅ Test with provided mock data
- ✅ Enforce Jira 32KB content limit
- ✅ Normalize enum values
- ✅ Batch operations by application
- ✅ Write comprehensive tests

---

## 📚 Key Files & References

### Specification Files (NEW)
- `IMPLEMENTATION_PLAN.md` — Complete technical spec
- `ANALYSIS_SUMMARY.md` — Detailed analysis
- `EXECUTIVE_SUMMARY.md` — High-level overview

### API Documentation
- `doc/appscan-api-responses.md` — API reference
- `doc/appscan-swagger-v4.json` — OpenAPI spec
- `reports/api-samples/` — Real response examples

### Existing Reference Code
- `src/services/appscan-service.js` — API client
- `src/services/jira-service.js` — Jira client
- `src/commands/triage.js` — Interactive workflow example
- `src/commands/create-jira-issue.js` — Jira creation patterns
- `src/commands/update-issue-status.js` — Update logic
- `src/utils/config.js` — Configuration
- `src/utils/triage-ui.js` — UI helpers

### Triage Requirements
- `doc/triage-requirements.md` — Detailed requirements
- `doc/triage.md` — Command documentation

---

## 🧪 Testing Strategy

### Unit Tests (Priority: HIGH)
- QueryBuilder filter generation
- JiraDescriptionBuilder size limits
- Formatter output validation
- Enum mapping correctness

### Integration Tests (Priority: HIGH)
- Query commands with mock data
- Update operations (single & bulk)
- Jira issue creation
- Content limit enforcement

### Manual Tests (Priority: MEDIUM)
- Interactive UI workflow
- Real AppScan API (with test tenant)
- Jira issue creation (test project)
- Edge cases (large datasets, special chars)

### Test Data
- Use `/reports/api-samples/*.json` as fixtures
- Create additional test data for edge cases
- Mock Jira API responses

---

## 🚀 Getting Started

### Step 1: Understand the Vision
```
Read: EXECUTIVE_SUMMARY.md (10 mins)
Then: IMPLEMENTATION_PLAN.md Sections 1-3 (30 mins)
```

### Step 2: Understand the APIs
```
Read: doc/appscan-api-responses.md (30 mins)
View: reports/api-samples/*.json (20 mins)
Study: src/services/appscan-service.js (20 mins)
```

### Step 3: Understand the Current Implementation
```
Read: src/commands/triage.js (30 mins)
Read: src/commands/create-jira-issue.js (20 mins)
Read: doc/triage-requirements.md (20 mins)
```

### Step 4: Start Coding
```
Phase 1: QueryBuilder class (2 days)
Phase 2: Query subcommand (1 day)
Then proceed with remaining phases
```

---

## 📊 Success Metrics

✅ Implementation is successful when:

| Criteria | Target | Check |
|----------|--------|-------|
| All 8 subcommands working | 100% | [ ] |
| API queries return valid JSON | 100% | [ ] |
| Filtering works (status/severity/name/date) | 100% | [ ] |
| Bulk ops batch by application | 100% | [ ] |
| Jira descriptions < 32KB | 100% | [ ] |
| Interactive UI responsive | 100% | [ ] |
| Unit tests passing | 100% | [ ] |
| Integration tests passing | 100% | [ ] |
| Documentation complete | 100% | [ ] |
| No existing commands modified | 100% | [ ] |

---

## 💡 Pro Tips for Development

### Query Building
- Always normalize technology enums (StaticAnalyzer→SAST, etc.)
- Use OData filters: `$filter=Status eq 'Open' and Severity eq 'High'`
- Implement pagination with `$top` and `$skip`
- Batch queries by application to avoid N+1 calls

### Jira Integration
- Check description size BEFORE creating issue
- Truncate gracefully if over 32KB
- Extract unique comments (dedup)
- Always set ExternalId for traceability
- Handle Jira failures without crashing main workflow

### Interactive UI
- Keep prompts simple and clear
- Provide escape hatches (back, cancel, refresh)
- Show counts for visibility
- Use color coding for severity

### Testing
- Use mock data from `/reports/api-samples/`
- Test edge cases (empty results, special chars, very large datasets)
- Verify content limits with oversized data
- Test filter combinations

---

## ❓ FAQ

**Q: Do I need access to real AppScan?**  
A: No for development. Mock data in `reports/api-samples/` is sufficient. Final integration testing will need access.

**Q: What if Jira integration fails?**  
A: Triage should continue. Log error to stderr, show warning, let user retry or skip.

**Q: How do I handle the 32KB Jira limit?**  
A: Check size before creating. If over limit, truncate issue list and add "N more..." note.

**Q: Should I modify existing commands?**  
A: No. Create only a new command. Do not touch existing code (except extending services).

**Q: What about pagination?**  
A: Implement for queries. Use `--limit` and `--offset` flags. Batch by app for updates.

**Q: How do I validate enum values?**  
A: Check against documented lists in API spec. Test with real data samples.

---

## 📞 Getting Help

### For API Questions
→ Check: `doc/appscan-api-responses.md`  
→ Or: `reports/api-samples/*.json` (real examples)

### For Requirements Questions
→ Check: `IMPLEMENTATION_PLAN.md` Section 2 (Functional Reqs)  
→ Or: `doc/triage-requirements.md`

### For Architecture Questions
→ Check: `IMPLEMENTATION_PLAN.md` Section 7 (Implementation Details)  
→ Or: `ANALYSIS_SUMMARY.md` Section 5 (Design Synthesis)

### For Code Examples
→ Check: `src/services/` and `src/commands/` (reference implementations)  
→ Or: `IMPLEMENTATION_PLAN.md` Section 7 (code snippets)

---

## ✨ You've Got This!

Everything you need to succeed is documented. The specification is complete, APIs are clear, examples are provided, and the architecture is solid.

**Start with:** `IMPLEMENTATION_PLAN.md` Sections 1-3  
**Then move to:** Your preferred phase in the implementation checklist

**Timeline:** 20 days for 2-3 developers  
**Complexity:** Medium (some tricky parts, but well-specified)  
**Outcome:** A modern, maintainable, unified triage tool 🎉

---

**Last Updated:** December 10, 2025  
**Status:** Ready to Start Development ✅
