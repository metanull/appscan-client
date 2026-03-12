# SIEM Architecture Proposal

**Document Version:** 1.0  
**Date:** February 4, 2026  
**Status:** Draft Proposal

---

## Executive Summary

This document proposes an architecture for a lightweight Security Information and Event Management (SIEM) application focused on Application Security (AppSec). The architecture is designed to be **modular**, **extensible**, and **maintainable**, enabling integration with multiple security information providers (AZDO, ASOC, Detectify) and work trackers (Jira, GitHub).

The design leverages lessons learned from the existing `@metanull/appscan-client` codebase while introducing clean abstractions, clear boundaries, and a more robust data model.

---

## Table of Contents

1. [Goals & Design Principles](#1-goals--design-principles)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Canonical Data Models](#3-canonical-data-models)
4. [Provider Interface (Security Information Sources)](#4-provider-interface-security-information-sources)
5. [Work Tracker Interface](#5-work-tracker-interface)
6. [Core Component](#6-core-component)
7. [Client Components (CLI & TUI)](#7-client-components-cli--tui)
8. [Storage Layer](#8-storage-layer)
9. [Event System & Correlation](#9-event-system--correlation)
10. [Framework Recommendations](#10-framework-recommendations)
11. [Project Structure](#11-project-structure)
12. [Testing Strategy](#12-testing-strategy)
13. [Migration Strategy](#13-migration-strategy)
14. [Open Questions & Considerations](#14-open-questions--considerations)

---

## 1. Goals & Design Principles

### Primary Goals

| Goal | Description |
|------|-------------|
| **Modularity** | Each provider/tracker is a standalone module with no cross-dependencies |
| **Extensibility** | Adding a new provider or tracker requires implementing a defined interface |
| **Maintainability** | Clear separation of concerns; small, focused modules |
| **Testability** | All business logic is unit-testable without external dependencies |
| **Single Binary** | The app is delivered as an NPM package with a single binary entry point |

### Design Principles

- **KISS (Keep It Simple, Stupid)**: Prefer simple, explicit code over clever abstractions
- **DRY (Don't Repeat Yourself)**: Shared logic in utilities; provider-specific logic in providers
- **Composition over Inheritance**: Use interfaces and composition, not deep class hierarchies
- **Dependency Injection**: Services receive dependencies via constructor, not global imports
- **Pure Functions First**: Keep business logic in pure functions; isolate side effects
- **Fail Fast & Loud**: Validate early; provide clear error messages

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────┐   ┌─────────────────────┐                          │
│  │     CLI Client      │   │     TUI Client      │   (Future: Web, API)     │
│  │   (Commander.js)    │   │    (Framework TBD)  │                          │
│  └──────────┬──────────┘   └──────────┬──────────┘                          │
└─────────────┼────────────────────────┼──────────────────────────────────────┘
              │                        │
              ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CORE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         EventManager                                 │    │
│  │    - Aggregates security events from all providers                  │    │
│  │    - Applies normalization & enrichment                             │    │
│  │    - Manages correlations & tags                                    │    │
│  └──────────┬──────────────────────────────────────┬───────────────────┘    │
│             │                                      │                         │
│  ┌──────────▼──────────┐              ┌───────────▼───────────┐             │
│  │   StorageService    │              │  CorrelationEngine    │             │
│  │  (SQLite / JSON)    │              │  (Event Linking)      │             │
│  └─────────────────────┘              └───────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
              │                                      │
              ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PROVIDER LAYER                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ AzdoProvider    │  │ AsocProvider    │  │ DetectifyProvider│  + Future   │
│  │ implements      │  │ implements      │  │ implements       │             │
│  │ ISecurityProvider│ │ ISecurityProvider│ │ ISecurityProvider│             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │ JiraTracker     │  │ GitHubTracker   │  + Future                         │
│  │ implements      │  │ implements      │                                   │
│  │ IWorkTracker    │  │ IWorkTracker    │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Canonical Data Models

All data flows through **canonical models** that normalize vendor-specific data into a unified structure.

### 3.1 SoftwareSystem

Represents an application/project known to the security provider.

```javascript
/**
 * @typedef {Object} SoftwareSystem
 * @property {string} id - Unique identifier (provider-specific)
 * @property {string} providerId - Provider identifier (e.g., 'azdo', 'asoc')
 * @property {string} name - Human-readable name
 * @property {string} [description] - Optional description
 * @property {string} [url] - URL to view in provider's web UI
 * @property {Record<string, unknown>} metadata - Provider-specific metadata (JSON)
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
```

### 3.2 SecurityContainer

Optional logical grouping (scans, repositories) within a SoftwareSystem.

```javascript
/**
 * @typedef {Object} SecurityContainer
 * @property {string} id - Unique identifier
 * @property {string} providerId - Provider identifier
 * @property {string} softwareSystemId - Parent software system ID
 * @property {string} name - Human-readable name
 * @property {string} type - Container type ('repository', 'scan', 'pipeline', etc.)
 * @property {string} [url] - URL to view in provider's web UI
 * @property {Record<string, unknown>} metadata - Provider-specific metadata
 * @property {Date} lastScannedAt - Last scan/check timestamp
 */
```

### 3.3 SecurityEvent

The core entity representing a security finding.

```javascript
/**
 * @typedef {Object} SecurityEvent
 * @property {string} id - Unique identifier (composite: providerId + providerEventId)
 * @property {string} providerId - Provider identifier
 * @property {string} providerEventId - Original ID from provider
 * @property {string} softwareSystemId - Parent software system
 * @property {string} [containerId] - Optional container (scan/repo)
 * @property {string} title - Event title
 * @property {string} [description] - Markdown description
 * @property {Severity} severity - Normalized severity
 * @property {EventState} state - Current state
 * @property {EventType} type - Event type classification
 * @property {string} [ruleId] - Rule/signature identifier
 * @property {Location} [location] - Code location (file, line, etc.)
 * @property {string} [remediation] - Markdown remediation guidance
 * @property {string} [url] - URL to view in provider's web UI
 * @property {string[]} tags - Associated tag IDs
 * @property {string} [workItemId] - Linked work tracker item ID
 * @property {string} [fingerprint] - Deduplication fingerprint
 * @property {Record<string, unknown>} providerData - Raw provider data (JSON)
 * @property {Date} firstSeenAt - First detection timestamp
 * @property {Date} lastSeenAt - Last detection timestamp
 * @property {Date} updatedAt - Last modification timestamp
 */

/**
 * @typedef {'critical' | 'high' | 'medium' | 'low' | 'informational'} Severity
 */

/**
 * @typedef {'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'} EventState
 */

/**
 * @typedef {'vulnerability' | 'secret' | 'dependency' | 'license' | 'misconfiguration' | 'code_quality'} EventType
 */

/**
 * @typedef {Object} Location
 * @property {string} [filePath] - File path
 * @property {number} [startLine] - Start line number
 * @property {number} [endLine] - End line number
 * @property {string} [snippet] - Code snippet (markdown)
 * @property {string} [commitSha] - Git commit SHA
 * @property {string} [branch] - Git branch
 */
```

### 3.4 Comment

User or system comments on events.

```javascript
/**
 * @typedef {Object} Comment
 * @property {string} id - Unique identifier
 * @property {string} eventId - Parent security event ID
 * @property {string} author - Author identifier/name
 * @property {string} content - Markdown content
 * @property {string} source - Origin ('user', 'provider', 'system')
 * @property {Date} createdAt - Creation timestamp
 */
```

### 3.5 Tag

Labels for categorization.

```javascript
/**
 * @typedef {Object} Tag
 * @property {string} id - Unique identifier (slug)
 * @property {string} name - Display name
 * @property {string} [color] - Hex color code
 * @property {string} [description] - Tag description
 */
```

### 3.6 EventCorrelation

Links between related events.

```javascript
/**
 * @typedef {Object} EventCorrelation
 * @property {string} id - Unique identifier
 * @property {string} sourceEventId - Source event ID
 * @property {string} targetEventId - Target event ID
 * @property {string} type - Correlation type ('duplicate', 'related', 'caused_by', 'same_issue')
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} [reason] - Human-readable reason
 * @property {Date} createdAt - Creation timestamp
 */
```

---

## 4. Provider Interface (Security Information Sources)

### 4.1 Interface Definition

All security providers implement `ISecurityProvider`:

```javascript
/**
 * Security Information Provider Interface
 * @interface ISecurityProvider
 */

/**
 * @typedef {Object} ISecurityProvider
 * @property {string} id - Provider identifier ('azdo', 'asoc', 'detectify')
 * @property {string} name - Human-readable provider name
 * @property {() => Promise<void>} connect - Establish connection
 * @property {() => Promise<void>} disconnect - Close connection
 * @property {() => Promise<boolean>} isConnected - Check connection status
 * @property {() => Promise<SoftwareSystem[]>} listSoftwareSystems - List all systems
 * @property {(id: string) => Promise<SoftwareSystem>} getSoftwareSystem - Get single system
 * @property {(systemId: string) => Promise<SecurityContainer[]>} listContainers - List containers
 * @property {(systemId: string, containerId?: string, options?: QueryOptions) => Promise<SecurityEvent[]>} listEvents - List events
 * @property {(eventId: string) => Promise<SecurityEvent>} getEvent - Get single event
 * @property {(eventId: string, update: EventUpdate) => Promise<SecurityEvent>} updateEvent - Update event
 * @property {(eventId: string) => Promise<Comment[]>} getComments - Get event comments
 * @property {(eventId: string, comment: string) => Promise<Comment>} addComment - Add comment
 * @property {ProviderCapabilities} capabilities - Provider capabilities
 */

/**
 * @typedef {Object} ProviderCapabilities
 * @property {boolean} supportsContainers - Has container concept
 * @property {boolean} supportsComments - Supports comments
 * @property {boolean} supportsSeverityUpdate - Can update severity
 * @property {boolean} supportsStateUpdate - Can update state
 * @property {boolean} supportsBulkUpdate - Supports bulk operations
 * @property {string[]} supportedEventTypes - Supported event types
 */

/**
 * @typedef {Object} QueryOptions
 * @property {Severity[]} [severities] - Filter by severities
 * @property {EventState[]} [states] - Filter by states
 * @property {EventType[]} [types] - Filter by types
 * @property {string} [search] - Text search
 * @property {number} [limit] - Max results
 * @property {number} [offset] - Pagination offset
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortOrder] - Sort order
 */

/**
 * @typedef {Object} EventUpdate
 * @property {EventState} [state] - New state
 * @property {Severity} [severity] - New severity
 * @property {string} [comment] - Comment to add
 * @property {string} [dismissReason] - Reason for dismissal
 */
```

### 4.2 Provider Implementations

Each provider extends a base class that provides common functionality:

```javascript
/**
 * Base class for security providers
 * Handles common patterns: retry, caching, normalization
 */
export class BaseSecurityProvider {
  constructor(config) {
    this.config = config;
    this._connected = false;
  }

  // Template methods for subclasses
  async _doConnect() { throw new Error('Not implemented'); }
  async _doDisconnect() { throw new Error('Not implemented'); }
  async _fetchSoftwareSystems() { throw new Error('Not implemented'); }
  async _fetchContainers(systemId) { throw new Error('Not implemented'); }
  async _fetchEvents(systemId, containerId, options) { throw new Error('Not implemented'); }
  
  // Normalization hooks (each provider overrides)
  _normalizeSystem(raw) { throw new Error('Not implemented'); }
  _normalizeContainer(raw) { throw new Error('Not implemented'); }
  _normalizeEvent(raw) { throw new Error('Not implemented'); }
  
  // Common implementations
  async connect() { /* retry logic + _doConnect() */ }
  async disconnect() { /* cleanup + _doDisconnect() */ }
  async listSoftwareSystems() { /* fetch + normalize */ }
  async listEvents(systemId, containerId, options) { /* fetch + normalize */ }
}
```

### 4.3 Provider Mapping (Current → Canonical)

| Concept | AZDO | ASOC | Detectify |
|---------|------|------|-----------|
| **SoftwareSystem** | Project | Application | Domain/Asset Group |
| **SecurityContainer** | Repository | Scan | (none) |
| **SecurityEvent** | Alert | Issue/Vulnerability | Vulnerability |
| **Severity** | 0-7 enum | String | CVSS-based string |
| **State** | Numeric flags | Status string | Status string |
| **EventType** | alertType enum | IssueType | Category |

---

## 5. Work Tracker Interface

### 5.1 Interface Definition

```javascript
/**
 * Work Tracker Interface
 * @interface IWorkTracker
 */

/**
 * @typedef {Object} IWorkTracker
 * @property {string} id - Tracker identifier ('jira', 'github')
 * @property {string} name - Human-readable name
 * @property {() => Promise<void>} connect - Establish connection
 * @property {(options: CreateWorkItemOptions) => Promise<WorkItem>} createWorkItem - Create item
 * @property {(itemId: string) => Promise<WorkItem>} getWorkItem - Get item
 * @property {(itemId: string, update: WorkItemUpdate) => Promise<WorkItem>} updateWorkItem - Update
 * @property {(query: string) => Promise<WorkItem[]>} searchWorkItems - Search items
 * @property {(eventId: string, itemId: string) => Promise<void>} linkEvent - Link event to item
 * @property {(eventId: string, itemId: string) => Promise<void>} unlinkEvent - Unlink event
 * @property {WorkTrackerCapabilities} capabilities - Tracker capabilities
 */

/**
 * @typedef {Object} CreateWorkItemOptions
 * @property {string} projectKey - Project identifier
 * @property {string} title - Item title
 * @property {string} description - Markdown description
 * @property {string} [itemType] - Item type (Bug, Story, Task)
 * @property {string} [priority] - Priority level
 * @property {string[]} [labels] - Labels/tags
 * @property {string} [assignee] - Assignee identifier
 * @property {string[]} [eventIds] - Events to link
 */

/**
 * @typedef {Object} WorkItem
 * @property {string} id - Tracker item ID
 * @property {string} key - Human-readable key (e.g., PROJ-123)
 * @property {string} url - URL to item
 * @property {string} title - Item title
 * @property {string} state - Item state
 * @property {string[]} linkedEventIds - Linked security event IDs
 */

/**
 * @typedef {Object} WorkTrackerCapabilities
 * @property {boolean} supportsLabels - Supports labels
 * @property {boolean} supportsPriority - Supports priority
 * @property {boolean} supportsAssignee - Supports assignee
 * @property {boolean} supportsCustomFields - Supports custom fields
 * @property {number} maxDescriptionLength - Max description length
 */
```

---

## 6. Core Component

The Core provides a unified façade over all providers and manages local state.

### 6.1 EventManager

```javascript
/**
 * Central manager for security events across all providers
 */
export class EventManager {
  constructor(options) {
    this.storage = options.storage;
    this.providers = new Map(); // id → ISecurityProvider
    this.trackers = new Map();  // id → IWorkTracker
  }

  // Provider management
  registerProvider(provider) { /* ... */ }
  unregisterProvider(providerId) { /* ... */ }
  getProvider(providerId) { /* ... */ }
  listProviders() { /* ... */ }

  // Tracker management
  registerTracker(tracker) { /* ... */ }
  unregisterTracker(trackerId) { /* ... */ }
  getTracker(trackerId) { /* ... */ }

  // Unified operations (delegates to providers + stores locally)
  async syncSoftwareSystems(providerId) { /* ... */ }
  async syncEvents(providerId, systemId, containerId) { /* ... */ }
  async getAllEvents(options) { /* query local storage */ }
  async getEvent(eventId) { /* local + provider enrichment */ }
  async updateEvent(eventId, update) { /* update provider + local */ }

  // Work item linking
  async createWorkItem(trackerId, options) { /* ... */ }
  async linkEventToWorkItem(eventId, itemId) { /* ... */ }

  // Correlation
  async correlateEvents(eventId) { /* ... */ }
  async findDuplicates(event) { /* ... */ }

  // Tags
  async addTag(eventId, tagId) { /* ... */ }
  async removeTag(eventId, tagId) { /* ... */ }
}
```

### 6.2 Provider Registry

```javascript
/**
 * Factory for creating and configuring providers
 */
export class ProviderRegistry {
  static providers = new Map();

  static register(id, factory) {
    this.providers.set(id, factory);
  }

  static create(id, config) {
    const factory = this.providers.get(id);
    if (!factory) throw new Error(`Unknown provider: ${id}`);
    return factory(config);
  }

  static list() {
    return Array.from(this.providers.keys());
  }
}

// Registration (typically in provider module)
ProviderRegistry.register('azdo', (config) => new AzdoProvider(config));
ProviderRegistry.register('asoc', (config) => new AsocProvider(config));
ProviderRegistry.register('detectify', (config) => new DetectifyProvider(config));
```

---

## 7. Client Components (CLI & TUI)

### 7.1 CLI Client

The CLI remains based on **Commander.js** — it's mature, well-tested, and fits the use case.

```javascript
// cli/index.js
import { Command } from 'commander';
import { EventManager } from '../core/event-manager.js';
import { createCommands } from './commands/index.js';

export function createCli(eventManager) {
  const program = new Command();
  
  // Register command groups
  createCommands(program, eventManager);
  
  return program;
}

// Commands follow a consistent pattern
export function createSyncCommand(eventManager) {
  return new Command('sync')
    .description('Sync events from a provider')
    .option('-p, --provider <id>', 'Provider ID')
    .option('-s, --system <id>', 'Software system ID')
    .action(async (options) => {
      await eventManager.syncEvents(options.provider, options.system);
    });
}
```

### 7.2 TUI Client — Framework Recommendation

**Current State:** The existing TUI uses Ink + React + Zustand. This works but has challenges:
- React's reconciliation model is complex for terminal UIs
- Ink's rendering can be unpredictable with large lists
- Zustand works well but requires discipline to avoid infinite loops

**Recommendation:** Evaluate alternatives but don't rush to change.

| Framework | Pros | Cons |
|-----------|------|------|
| **Ink + React** (current) | Familiar, component model, hooks | Complex, render issues, heavy |
| **Blessed** | Mature, powerful widgets | Callback-heavy, old API style |
| **Neo-blessed** | Blessed fork, maintained | Same complexity as blessed |
| **Inquirer.js** | Simple prompts, well-tested | Not a full TUI framework |
| **Custom with ANSI** | Full control, lightweight | High effort, reinventing wheels |

**Proposal:** Continue with Ink+React for now, but:
1. Isolate TUI from business logic completely
2. Use a thin "presenter" layer between Core and UI
3. Consider Ink+React as a replaceable implementation detail

### 7.3 Presenter Pattern

Decouple UI from Core with presenters:

```javascript
/**
 * Presenter transforms domain data for UI consumption
 */
export class EventListPresenter {
  constructor(eventManager, options = {}) {
    this.eventManager = eventManager;
    this.pageSize = options.pageSize || 50;
  }

  async getPage(pageNumber, filters) {
    const events = await this.eventManager.getAllEvents({
      ...filters,
      limit: this.pageSize,
      offset: pageNumber * this.pageSize,
    });
    
    return {
      items: events.map(e => this.formatEventForList(e)),
      total: events.total,
      page: pageNumber,
      pageCount: Math.ceil(events.total / this.pageSize),
    };
  }

  formatEventForList(event) {
    return {
      id: event.id,
      title: truncate(event.title, 60),
      severity: formatSeverity(event.severity),
      state: formatState(event.state),
      provider: event.providerId,
      hasWorkItem: !!event.workItemId,
      // UI-specific computed properties
      severityColor: SEVERITY_COLORS[event.severity],
      stateIcon: STATE_ICONS[event.state],
    };
  }
}
```

---

## 8. Storage Layer

### 8.1 Storage Interface

```javascript
/**
 * Storage Interface
 * @interface IStorage
 */

/**
 * @typedef {Object} IStorage
 * @property {() => Promise<void>} initialize - Initialize storage
 * @property {() => Promise<void>} close - Close storage
 * @property {(event: SecurityEvent) => Promise<void>} saveEvent - Save event
 * @property {(events: SecurityEvent[]) => Promise<void>} saveEvents - Bulk save
 * @property {(id: string) => Promise<SecurityEvent|undefined>} getEvent - Get event
 * @property {(options: QueryOptions) => Promise<{items: SecurityEvent[], total: number}>} queryEvents - Query
 * @property {(id: string) => Promise<void>} deleteEvent - Delete event
 * @property {(system: SoftwareSystem) => Promise<void>} saveSystem - Save system
 * @property {(options: QueryOptions) => Promise<SoftwareSystem[]>} querySystems - Query systems
 */
```

### 8.2 Implementation Options

**Option A: SQLite (Recommended)**
```javascript
// Uses better-sqlite3 for sync operations or sqlite3 for async
// Provides ACID, queries, and reasonable performance
```

**Option B: JSON Files**
```javascript
// Simple, portable, debuggable
// Good for small datasets (<10k events)
// Use with indexing for acceptable query performance
```

**Recommendation:** Start with SQLite for robustness; JSON export/import for portability.

### 8.3 Schema (SQLite)

```sql
-- Core tables
CREATE TABLE software_systems (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_containers (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  software_system_id TEXT NOT NULL REFERENCES software_systems(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  metadata JSON,
  last_scanned_at DATETIME,
  UNIQUE(provider_id, software_system_id, id)
);

CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  software_system_id TEXT NOT NULL REFERENCES software_systems(id),
  container_id TEXT REFERENCES security_containers(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT NOT NULL,
  rule_id TEXT,
  location JSON,
  remediation TEXT,
  url TEXT,
  fingerprint TEXT,
  work_item_id TEXT,
  provider_data JSON,
  first_seen_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, provider_event_id)
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  description TEXT
);

CREATE TABLE event_tags (
  event_id TEXT NOT NULL REFERENCES security_events(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY(event_id, tag_id)
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES security_events(id),
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_correlations (
  id TEXT PRIMARY KEY,
  source_event_id TEXT NOT NULL REFERENCES security_events(id),
  target_event_id TEXT NOT NULL REFERENCES security_events(id),
  type TEXT NOT NULL,
  confidence REAL NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_events_severity ON security_events(severity);
CREATE INDEX idx_events_state ON security_events(state);
CREATE INDEX idx_events_type ON security_events(type);
CREATE INDEX idx_events_system ON security_events(software_system_id);
CREATE INDEX idx_events_fingerprint ON security_events(fingerprint);
CREATE INDEX idx_events_work_item ON security_events(work_item_id);
```

---

## 9. Event System & Correlation

### 9.1 Event Bus (Internal)

For decoupling components, use a simple event bus:

```javascript
/**
 * Simple event emitter for internal events
 */
export class EventBus {
  #listeners = new Map();

  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.#listeners.get(event)?.delete(handler);
  }

  emit(event, data) {
    this.#listeners.get(event)?.forEach(handler => handler(data));
  }
}

// Usage
eventBus.on('event:created', (event) => { /* update UI, log, etc. */ });
eventBus.on('event:updated', (event) => { /* sync with provider */ });
```

### 9.2 Correlation Engine

```javascript
/**
 * Identifies related/duplicate events
 */
export class CorrelationEngine {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Find potential duplicates for an event
   */
  async findDuplicates(event) {
    const candidates = [];

    // Strategy 1: Same fingerprint
    if (event.fingerprint) {
      const byFingerprint = await this.storage.queryEvents({
        fingerprint: event.fingerprint,
        excludeId: event.id,
      });
      candidates.push(...byFingerprint.items.map(e => ({
        event: e,
        confidence: 1.0,
        reason: 'Same fingerprint',
      })));
    }

    // Strategy 2: Same rule + similar location
    if (event.ruleId && event.location?.filePath) {
      const byRule = await this.storage.queryEvents({
        ruleId: event.ruleId,
        filePath: event.location.filePath,
        excludeId: event.id,
      });
      candidates.push(...byRule.items.map(e => ({
        event: e,
        confidence: 0.8,
        reason: 'Same rule and file',
      })));
    }

    // Strategy 3: Title similarity (fuzzy)
    // ... implement fuzzy matching

    return candidates;
  }

  /**
   * Create correlation between events
   */
  async correlate(sourceId, targetId, type, confidence, reason) {
    await this.storage.saveCorrelation({
      id: generateId(),
      sourceEventId: sourceId,
      targetEventId: targetId,
      type,
      confidence,
      reason,
      createdAt: new Date(),
    });
  }
}
```

---

## 10. Framework Recommendations

### 10.1 Core Dependencies

| Purpose | Recommended | Reason |
|---------|-------------|--------|
| **CLI Framework** | Commander.js | Mature, familiar, works well |
| **Configuration** | dotenv + custom Config class | Simple, flexible |
| **HTTP Client** | Native fetch (Node 20+) | No extra deps, modern |
| **Database** | better-sqlite3 | Fast, synchronous, reliable |
| **Logging** | Custom (existing logger) | Already works, keep it |
| **Testing** | Vitest | Fast, modern, compatible |
| **Build** | esbuild | Fast, simple, already used |

### 10.2 TUI Framework

**Keep Ink + React** for now with strict patterns:
- Use Zustand correctly (subscribe to data, not setters)
- Memoize aggressively
- Keep components small and focused
- Consider moving to a simpler model later if needed

### 10.3 What NOT to Add

- Express/Fastify (no web server needed)
- Redux (Zustand is simpler)
- GraphQL (overkill for local app)
- TypeScript (adds complexity; JSDoc provides types)
- Class-based OOP hierarchies (prefer composition)

---

## 11. Project Structure

```
src/
├── index.js                    # Entry point (dispatches to CLI/TUI)
├── core/
│   ├── event-manager.js        # Central coordinator
│   ├── correlation-engine.js   # Event correlation
│   ├── event-bus.js            # Internal pub/sub
│   └── index.js                # Core exports
├── models/
│   ├── security-event.js       # Model definitions + validation
│   ├── software-system.js
│   ├── security-container.js
│   ├── comment.js
│   ├── tag.js
│   └── index.js
├── providers/
│   ├── base-provider.js        # Base class
│   ├── provider-registry.js    # Factory/registry
│   ├── azdo/
│   │   ├── azdo-provider.js    # ISecurityProvider impl
│   │   ├── azdo-normalizer.js  # Data normalization
│   │   ├── azdo-client.js      # API client (thin wrapper)
│   │   └── index.js
│   ├── asoc/
│   │   ├── asoc-provider.js
│   │   ├── asoc-normalizer.js
│   │   ├── asoc-client.js
│   │   └── index.js
│   ├── detectify/
│   │   ├── detectify-provider.js
│   │   ├── detectify-normalizer.js
│   │   ├── detectify-client.js
│   │   └── index.js
│   └── index.js                # Registers all providers
├── trackers/
│   ├── base-tracker.js         # Base class
│   ├── tracker-registry.js     # Factory/registry
│   ├── jira/
│   │   ├── jira-tracker.js     # IWorkTracker impl
│   │   ├── jira-formatter.js   # Description builder
│   │   └── index.js
│   ├── github/
│   │   ├── github-tracker.js
│   │   └── index.js
│   └── index.js
├── storage/
│   ├── storage-interface.js    # Interface definition
│   ├── sqlite-storage.js       # SQLite implementation
│   ├── json-storage.js         # JSON file implementation
│   ├── migrations/             # Database migrations
│   │   ├── 001-initial.js
│   │   └── ...
│   └── index.js
├── cli/
│   ├── cli-entry.js            # CLI bootstrap
│   ├── commands/
│   │   ├── sync.js             # Sync commands
│   │   ├── list.js             # List commands
│   │   ├── update.js           # Update commands
│   │   ├── triage.js           # Triage workflow
│   │   ├── setup.js            # Setup wizard
│   │   └── index.js            # Command registration
│   └── presenters/             # CLI output formatters
│       ├── event-presenter.js
│       └── table-formatter.js
├── tui/
│   ├── tui-entry.js            # TUI bootstrap
│   ├── presenters/             # TUI data transformers
│   │   ├── event-list-presenter.js
│   │   └── detail-presenter.js
│   ├── components/             # Reusable UI components
│   │   ├── Panel.js
│   │   ├── ScrollableList.js
│   │   └── ...
│   ├── views/                  # Screen-level components
│   │   ├── EventListView.js
│   │   ├── EventDetailView.js
│   │   └── ...
│   ├── state/                  # Zustand stores
│   │   ├── app-store.js
│   │   └── ui-store.js
│   └── hooks/                  # Custom hooks
│       ├── useEvents.js
│       └── useKeyboard.js
├── utils/
│   ├── config.js               # Configuration
│   ├── logger.js               # Logging
│   ├── validators.js           # Input validation
│   ├── formatters.js           # Text formatting
│   └── ...
└── generated/                  # Auto-generated code (API clients)
    └── ...

tests/
├── unit/
│   ├── core/
│   ├── providers/
│   ├── trackers/
│   └── storage/
├── integration/
│   └── ...
└── fixtures/
    └── ...
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

- **Models:** Validation, normalization
- **Providers:** Normalizers with fixture data (no network)
- **Trackers:** Formatters, description builders
- **Storage:** Query building, data transformation
- **CLI Commands:** Output formatting

### 12.2 Integration Tests

- Storage operations with real SQLite
- Provider → EventManager flow with mocked HTTP
- CLI command execution

### 12.3 Mocking Strategy

```javascript
// providers/azdo/__mocks__/azdo-client.js
export function createMockAzdoClient() {
  return {
    listProjects: vi.fn().mockResolvedValue([/* fixture data */]),
    listAlerts: vi.fn().mockResolvedValue([/* fixture data */]),
    // ...
  };
}

// In tests
import { createMockAzdoClient } from './__mocks__/azdo-client.js';

describe('AzdoProvider', () => {
  it('normalizes alerts to security events', async () => {
    const mockClient = createMockAzdoClient();
    const provider = new AzdoProvider({ client: mockClient });
    
    const events = await provider.listEvents('project-1', 'repo-1');
    
    expect(events[0]).toMatchObject({
      id: expect.stringMatching(/^azdo:/),
      severity: 'high',
      state: 'open',
    });
  });
});
```

### 12.4 Test Coverage Targets

| Area | Target |
|------|--------|
| Models & Validators | 95% |
| Normalizers | 90% |
| Storage queries | 85% |
| Core EventManager | 80% |
| CLI commands | 70% |
| TUI components | 50% (visual) |

---

## 13. Migration Strategy

### Phase 1: Foundation (4-6 weeks)
1. Define models and interfaces
2. Implement storage layer
3. Create provider base class
4. Migrate AzdoService → AzdoProvider

### Phase 2: Providers (4-6 weeks)
1. Migrate AsocService → AsocProvider
2. Migrate DetectifyService → DetectifyProvider
3. Implement JiraTracker

### Phase 3: Core (2-4 weeks)
1. Implement EventManager
2. Implement CorrelationEngine
3. Wire up providers + storage

### Phase 4: Clients (4-6 weeks)
1. Refactor CLI to use EventManager
2. Refactor TUI to use presenters
3. Ensure backward compatibility with existing commands

### Phase 5: Polish & Migration (2-4 weeks)
1. Data migration tools (existing cache → SQLite)
2. Documentation
3. Performance optimization

---

## 14. Open Questions & Considerations

### 14.1 Decisions Needed

1. **Offline-first vs Sync-on-demand:**
   - Current: Sync-on-demand (fetch from providers each time)
   - Proposed: Offline-first with periodic sync
   - Decision: Start with sync-on-demand, add offline capability later

2. **ID Generation:**
   - Option A: `${providerId}:${providerEventId}` (simple, deterministic)
   - Option B: UUID (globally unique, but loses provenance)
   - Recommendation: Option A

3. **State Management (TUI):**
   - Keep Zustand but extract business state from UI state
   - Consider signal-based reactivity (Preact Signals) for simpler model

4. **Severity Normalization:**
   - Different providers use different scales
   - Recommendation: Map all to 5-level scale (critical/high/medium/low/informational)

### 14.2 Future Considerations

- **Web UI:** Could add later using same presenters
- **API Server:** Could expose Core as REST/GraphQL if needed
- **Multi-tenancy:** Not in scope; single-user local app

### 14.3 Risks

| Risk | Mitigation |
|------|------------|
| Scope creep | Start minimal; extend as needed |
| Breaking changes | Maintain CLI command compatibility |
| Performance (large datasets) | Use SQLite + proper indexing |
| Provider API changes | Isolate in normalizers; version adapters |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Provider** | Integration with a security information source (AZDO, ASOC, Detectify) |
| **Tracker** | Integration with a work management system (Jira, GitHub Issues) |
| **SoftwareSystem** | A logical application/project (maps to AZDO Project, ASOC Application) |
| **SecurityContainer** | A grouping within a system (repository, scan) |
| **SecurityEvent** | A security finding (alert, vulnerability, issue) |
| **Correlation** | A relationship between two events |
| **Presenter** | Transforms domain data for UI consumption |

---

## Appendix B: Example Provider Implementation

```javascript
// providers/azdo/azdo-provider.js
import { BaseSecurityProvider } from '../base-provider.js';
import { AzdoClient } from './azdo-client.js';
import { normalizeAlert, normalizeProject, normalizeRepository } from './azdo-normalizer.js';

export class AzdoProvider extends BaseSecurityProvider {
  static id = 'azdo';
  static name = 'Azure DevOps';
  static capabilities = {
    supportsContainers: true,
    supportsComments: true,
    supportsSeverityUpdate: false,
    supportsStateUpdate: true,
    supportsBulkUpdate: true,
    supportedEventTypes: ['vulnerability', 'secret', 'dependency', 'license'],
  };

  constructor(config) {
    super(config);
    this.client = config.client || new AzdoClient(config);
  }

  get id() { return AzdoProvider.id; }
  get name() { return AzdoProvider.name; }
  get capabilities() { return AzdoProvider.capabilities; }

  async _doConnect() {
    await this.client.connect();
  }

  async _doDisconnect() {
    await this.client.disconnect();
  }

  async _fetchSoftwareSystems() {
    return await this.client.listProjects();
  }

  async _fetchContainers(systemId) {
    return await this.client.listRepositories(systemId);
  }

  async _fetchEvents(systemId, containerId, options) {
    return await this.client.listAlerts(systemId, containerId, options);
  }

  _normalizeSystem(project) {
    return normalizeProject(project);
  }

  _normalizeContainer(repository) {
    return normalizeRepository(repository);
  }

  _normalizeEvent(alert) {
    return normalizeAlert(alert);
  }

  // Provider-specific operations
  async updateAlert(projectId, alertId, update) {
    const result = await this.client.updateAlert(projectId, alertId, update);
    return this._normalizeEvent(result);
  }
}
```

---

**Document End**
