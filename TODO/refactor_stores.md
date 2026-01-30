User: the TUI AZDO app loads Projects, Repositories and Alerts via the API. The system works well, but it is not optimal.
E.g. loading the list of projects triggers refreshing the list of alerts from the start; instead of loading first the one I have just selected (and potentially modified)
What are React/Ink recommended option to keep data in memory (to make it faster); and to allow transparent/permanent reloading.

Propose options, don't implement. Options must covers the three stores: Projects, Repositories, Alerts.
Beware of the alert filtering (we use the api with filter to make it faster, but our store should contain the entire data sets)

What are the option to persist extra data locally? E.g. I would like add custom state/tags and comments to any entity. But the AZO api doesn't permit it.
The same technique could be used also in the ASOC TUI; it would open many new possibilities.

GitHub Copilot: I'll explore the current TUI architecture to understand how data is managed, then provide recommendations. 

Read [](file:///e%3A/appscan-client/src/tui)

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo)

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/state)

Read [](file:///e%3A/appscan-client/src/tui/shared)

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/state/AppContext.js#1-1), lines 1 to 200

Read [](file:///e%3A/appscan-client/src/tui/shared/services)

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/state/AppContext.js#200-200), lines 200 to 410

Read [](file:///e%3A/appscan-client/src/tui/shared/services/azdo.js#1-1), lines 1 to 150

Read [](file:///e%3A/appscan-client/src/tui/shared/services/alertCountCache.js#1-1), lines 1 to 100

Searched for regex `useEffect.*loadProjects|useEffect.*loadRepositories|useEffect.*loadAlerts` (`**/src/tui/**`), no results

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/hooks)

Searched for text `useEffect` (`**/src/tui/**/*.js`), 20 results

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/main.js#200-200), lines 200 to 600

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/hooks/useDetailedEntityLoader.js#1-1), lines 1 to 100

Read [](file:///e%3A/appscan-client/src/tui/apps/azdo/main.js#600-600), lines 600 to 900

Now let me check the ASOC TUI to see if there's a similar pattern and look at the alertCountCache for more context: 

Read [](file:///e%3A/appscan-client/src/tui/shared/services/alertCountCache.js#100-100), lines 100 to 236

Read [](file:///e%3A/appscan-client/src/tui/apps)

Read [](file:///e%3A/appscan-client/src/tui/apps/asoc)

Read [](file:///e%3A/appscan-client/src/tui/apps/asoc/state/AppContext.js#1-1), lines 1 to 150

Now I have a comprehensive understanding of the current architecture. Let me provide you with the options:

---

## Architecture Recommendations for TUI Data Management

Based on my analysis of your current Zustand-based architecture in both AZDO and ASOC TUIs, here are the recommended options:

---

### **Part 1: In-Memory Caching & Smart Refresh Strategies**

#### **Option A: Zustand Slices with Normalization (Recommended)**

Transform your current flat stores into normalized entity stores:

```
stores/
├── projectStore.js    → { entities: {[id]: project}, ids: [], lastFetched, ... }
├── repositoryStore.js → { entities: {[projectId:repoId]: repo}, byProject: {[pid]: [ids]}, ... }
├── alertStore.js      → { entities: {[key]: alert}, byRepo: {...}, filters: {...} }
└── uiStore.js         → { view, cursors, selections, loading, ... }
```

**Benefits:**
- Deduplication: same entity referenced from multiple places
- Partial updates: update one alert without re-rendering entire list
- Selective reloading: refresh only the current context first
- Compatible with your existing Zustand patterns

**Cons:**
- Requires refactoring existing store structure
- More complex selectors needed

---

#### **Option B: TanStack Query (React Query) Integration**

Add a query layer on top of Zustand for data fetching:

| Concern | Handler |
|---------|---------|
| Server state (API data) | TanStack Query |
| Client state (UI, filters, selections) | Zustand (as today) |

**Benefits:**
- Built-in caching with stale-while-revalidate
- Background refetching (transparent/permanent reload)
- Request deduplication
- Automatic garbage collection
- `queryClient.setQueryData()` for optimistic updates after mutations

**Smart refresh example:**
```javascript
// When selecting a project, prioritize its data
queryClient.invalidateQueries(['alerts', projectId, repoId], { refetchType: 'active' })
```

**Cons:**
- Adds a dependency
- Learning curve for query keys and cache management
- Requires adapting Ink's rendering cycle (no Suspense support in Ink)

---

#### **Option C: Custom Cache Layer with Priority Queue**

Extend your existing alertCountCache.js pattern into a full caching service:

```
CacheService
├── inMemory: Map<key, {data, timestamp, staleAt}>
├── priorityQueue: Queue<{key, priority}>  // for background refresh
├── get(key) → cached | stale | miss
├── set(key, data, ttl)
├── invalidate(key | pattern)
└── backgroundRefresh() → process queue in order
```

**Refresh Strategy:**
1. On project select → immediate fetch for **current project's repos**
2. Queue other projects for background refresh (low priority)
3. On alert update → refresh **current repo's alerts** first, then cascade

**Benefits:**
- Full control, no new dependencies
- Integrates naturally with your existing cache files
- Works well with Ink's non-browser environment

**Cons:**
- More code to maintain
- Must implement staleness/invalidation logic manually

---

### **Part 2: Handling Alert Filtering (API vs Store)**

Your current approach uses **API-level filtering** (e.g., `listAlerts(..., { type: 'secret' })`), but the store should contain the **full dataset** for client-side filtering.

#### **Recommended Approach: Layered Filtering**

```
┌──────────────────────────────────────────────────┐
│  API Layer (Coarse Filter)                       │
│  └─ fetch alerts with minimal server filter      │
│     (e.g., just alertType if huge dataset)       │
├──────────────────────────────────────────────────┤
│  Store Layer (Full Dataset)                      │
│  └─ stores ALL alerts for current repo/project   │
├──────────────────────────────────────────────────┤
│  Selector Layer (Fine Filter)                    │
│  └─ getFilteredAlerts() applies UI filters       │
│     (status, severity, jira, search, etc.)       │
└──────────────────────────────────────────────────┘
```

**Implementation options:**

| Option | Description | Trade-off |
|--------|-------------|-----------|
| **Full fetch** | Fetch all alerts, filter client-side | Higher initial load, faster subsequent filters |
| **Pagination** | Fetch in pages, merge into store | Lower initial latency, more complexity |
| **Smart preload** | Fetch current filter, background-fetch remaining | Best UX, most complex |

For **smart preload**:
1. Fetch alerts matching current filter (fast initial display)
2. Background-fetch remaining alerts (merge into store)
3. `getFilteredAlerts()` returns from full dataset once available

---

### **Part 3: Local Custom Metadata Persistence**

Since Azure DevOps API doesn't support custom fields, you need a **local metadata store** for tags, comments, and custom states.

#### **Option A: JSON File Store (Simple)**

Extend your existing pattern from alertCountCache.js:

```
~/.appscan/
├── azdo-metadata.json
│   └─ { alerts: { [alertKey]: { tags: [], notes: '', customStatus: '' } } }
├── asoc-metadata.json
│   └─ { issues: { [issueId]: { ... } } }
└── config.json (existing)
```

**Key structure:**
```javascript
// alertKey = `${orgId}:${projectId}:${repoId}:${alertId}`
{
  "alerts": {
    "org:proj:repo:123": {
      "tags": ["security-review", "deferred"],
      "notes": "Discussed with team on 2026-01-15",
      "customStatus": "pending-review",
      "priority": 2,
      "assignee": "john.doe",
      "createdAt": "2026-01-10T...",
      "updatedAt": "2026-01-28T..."
    }
  }
}
```

**Benefits:**
- Simple, no dependencies
- Portable (can be committed to repo or shared)
- Matches your existing caching pattern

**Cons:**
- No querying (must load all into memory)
- No concurrent write protection
- Scaling issues with large datasets

---

#### **Option B: SQLite with better-sqlite3 (Recommended for scale)**

```
~/.appscan/metadata.db

Tables:
├── entity_metadata (entity_type, entity_key, json_data, updated_at)
├── tags (entity_type, entity_key, tag)
├── comments (entity_type, entity_key, comment, created_at, author)
└── custom_fields (entity_type, entity_key, field_name, field_value)
```

**Benefits:**
- Efficient queries (find all alerts with tag "security-review")
- Handles large datasets
- Atomic transactions
- Can query across entities (e.g., all alerts assigned to person X)

**Cons:**
- Adds a native dependency (better-sqlite3 needs compilation)
- More complex setup

---

#### **Option C: LevelDB / RocksDB via level package**

Key-value store with prefix scanning:

```
Keys:
  azdo:alert:{projectId}:{repoId}:{alertId} → { metadata }
  azdo:alert:tag:{tag}:{alertId}           → "" (index)
  asoc:issue:{scanId}:{issueId}            → { metadata }
```

**Benefits:**
- No schema needed, flexible
- Efficient prefix scans
- Pure JS bindings available

**Cons:**
- Index management is manual
- Less familiar API

---

### **Part 4: Unified Metadata Service Architecture**

Create a **shared service** for both AZDO and ASOC TUIs:

```
src/services/
└── local-metadata/
    ├── index.js          → facade (auto-selects backend)
    ├── json-backend.js   → simple JSON file
    ├── sqlite-backend.js → SQLite (optional)
    └── types.js          → TypeScript/JSDoc types
```

**API Surface:**
```javascript
// Get/set metadata for any entity
getMetadata(entityType, entityKey) → { tags, notes, customFields, ... }
setMetadata(entityType, entityKey, data) → void
addTag(entityType, entityKey, tag) → void
removeTag(entityType, entityKey, tag) → void
addComment(entityType, entityKey, comment) → void

// Query across entities
findByTag(entityType, tag) → [entityKeys]
findByCustomField(entityType, field, value) → [entityKeys]

// Merge with API data
enrichEntity(entity, entityType) → entity with metadata
```

---

### **Summary Matrix**

| Need | Recommended Option | Alternative |
|------|-------------------|-------------|
| **In-memory caching** | Option A (Normalized Zustand) | Option C (Custom cache) |
| **Smart refresh** | Priority-based invalidation | TanStack Query (if comfortable with deps) |
| **Full dataset filtering** | Layered approach with background preload | Pagination with merge |
| **Local metadata** | JSON file (simple) or SQLite (scale) | LevelDB (middle ground) |
| **Cross-TUI sharing** | Unified metadata service | Separate but similar implementations |

---

Would you like me to elaborate on any specific option or discuss implementation details for a particular approach?