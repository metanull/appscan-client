# SIEM Architecture Proposal v2

**Document Version:** 2.0  
**Date:** February 4, 2026  
**Status:** Draft Proposal

---

## Executive Summary

This document proposes an architecture for a lightweight, **offline-capable** Security Information and Event Management (SIEM) application focused on Application Security (AppSec). 

The architecture is built around a **Core** that serves as the **single source of truth** for all security data. The Core:
- Stores all data locally (SQLite)
- Works fully offline with previously loaded data
- Syncs with external sources asynchronously in the background
- Exposes a unified API to **Client** applications
- Loads **Source plugins** to fetch and push data to external providers
- Uses a **signal-based** notification system for reactivity

**Key Design Decision:** Sources and Clients are **plugins** (separate npm packages). This proposal defines the Core, its interfaces, and the plugin system — **not** the implementation of specific Sources or Clients.

---

## Table of Contents

1. [Goals & Design Principles](#1-goals--design-principles)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Core Component](#3-core-component)
4. [Canonical Data Models](#4-canonical-data-models)
5. [Source Plugin Interface](#5-source-plugin-interface)
6. [Work Tracker Plugin Interface](#6-work-tracker-plugin-interface)
7. [Client Communication Analysis](#7-client-communication-analysis)
8. [Client Interface](#8-client-interface)
9. [Settings & Configuration](#9-settings--configuration)
10. [Storage Layer](#10-storage-layer)
11. [Synchronization Engine](#11-synchronization-engine)
12. [Signal System](#12-signal-system)
13. [Plugin System](#13-plugin-system)
14. [Project Structure](#14-project-structure)
15. [Testing Strategy](#15-testing-strategy)
16. [Scope & Non-Goals](#16-scope--non-goals)

---

## 1. Goals & Design Principles

### Primary Goals

| Goal | Description |
|------|-------------|
| **Offline-First** | Core works fully with local data; network is optional |
| **Local Data Ownership** | All data, metadata, links, and enrichments live in the Core |
| **Plugin Architecture** | Sources, Work Trackers, and Clients are separate npm packages |
| **Single User** | Designed for local, single-user operation |
| **Agnostic Clients** | Clients interact with Core without understanding its internals |

### Design Principles

- **Core is the Store**: Clients query the Core, never the Sources directly
- **Async Background Sync**: Data fetching happens in background; Core notifies clients when ready
- **Track Local Changes**: Core knows what changed locally and needs syncing upstream
- **Signal-Based Reactivity**: Framework-agnostic notification system (no React, no Zustand in Core)
- **KISS**: Simple interfaces; plugins handle complexity
- **DRY**: Shared models; no duplication across plugins
- **Plugin Isolation**: Plugins are independent; Core doesn't break when a plugin fails

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                                │
│         (Separate npm packages / processes communicating with Core)          │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  CLI Client │  │  TUI Client │  │  Web Client │  │   Future    │         │
│  │  (plugin)   │  │  (plugin)   │  │  (plugin)   │  │   Clients   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          │         Client Interface (API + Signals)         │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CORE                                        │
│                        (npm package: @metanull/siem-core)                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Client API                                   │    │
│  │   - Query local data (events, systems, containers)                  │    │
│  │   - Request operations (update state, add tag, link work item)      │    │
│  │   - Subscribe to signals (data changes, sync status)                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌──────────────────┐  ┌───────────┴───────────┐  ┌──────────────────┐      │
│  │  Settings Store  │  │    Event Store        │  │   Signal Hub     │      │
│  │  - Credentials   │  │    (SQLite)           │  │   (EventEmitter) │      │
│  │  - Proxy config  │  │    - All local data   │  │   - Notifications│      │
│  │  - Source configs│  │    - Change tracking  │  │   - Pub/Sub      │      │
│  └──────────────────┘  └───────────────────────┘  └──────────────────┘      │
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Sync Engine                                     │    │
│  │   - Background polling (configurable intervals)                     │    │
│  │   - Push local changes to sources                                   │    │
│  │   - Conflict detection                                              │    │
│  └──────────────────────────────────┬──────────────────────────────────┘    │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Source Plugin     │  │   Source Plugin     │  │   Source Plugin     │
│   @metanull/siem-source-azdo │  │   @metanull/siem-source-asoc │  │ @metanull/siem-source-detect │
│                     │  │                     │  │                     │
│ Implements:         │  │ Implements:         │  │ Implements:         │
│ - ISecuritySource   │  │ - ISecuritySource   │  │ - ISecuritySource   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│  Tracker Plugin     │  │  Tracker Plugin     │
│  @metanull/siem-tracker-jira │  │ @metanull/siem-tracker-github│
│                     │  │                     │
│ Implements:         │  │ Implements:         │
│ - IWorkTracker      │  │ - IWorkTracker      │
└─────────────────────┘  └─────────────────────┘
```

### Data Flow

```
1. FETCH (Background)
   Source Plugin ──(raw data)──► Sync Engine ──(normalized)──► Event Store ──(signal)──► Clients

2. QUERY (On-demand)
   Client ──(query)──► Client API ──(SQL)──► Event Store ──(results)──► Client

3. UPDATE (User action)
   Client ──(command)──► Client API ──► Event Store (local) + mark dirty
                                    ──► Signal "pending sync"
   
4. SYNC (Background or triggered)
   Sync Engine ──(dirty records)──► Source Plugin ──(updateState)──► External System
              ──(confirm)──► Event Store (clear dirty) ──(signal)──► Clients
```

---

## 3. Core Component

The Core is the heart of the system. It is a **standalone npm package** that:

1. **Stores all data locally** in SQLite
2. **Tracks local modifications** for later sync
3. **Loads Source plugins** to fetch and push data
4. **Exposes a Client API** for queries and commands
5. **Emits signals** when data changes or operations complete
6. **Manages settings** including credentials and proxy configuration

### Core Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Data Storage** | Persistent local storage of all security events and metadata |
| **Change Tracking** | Know what changed locally and needs syncing |
| **Plugin Loading** | Discover, load, and manage Source/Tracker plugins |
| **Background Sync** | Periodically poll sources; push pending changes |
| **Client API** | Unified query/command interface for all clients |
| **Signal Emission** | Notify clients of data changes, sync status, errors |
| **Settings Management** | Store credentials, proxy config, sync intervals |
| **Normalization** | Convert source-specific data to canonical models |

### Core Does NOT

- Implement any specific Source (that's a plugin)
- Implement any Client UI (that's a separate package)
- Make assumptions about how clients render data
- Require network connectivity to serve queries

---

## 4. Canonical Data Models

All data in the Core uses these normalized models. Sources transform their data to these models.

### 4.1 SecurityEvent

The core entity representing a security finding.

```javascript
/**
 * @typedef {Object} SecurityEvent
 * @property {string} id - UUID (globally unique, generated by Core)
 * @property {string} sourceId - Source plugin identifier (e.g., 'azdo', 'asoc')
 * @property {string} sourceEventId - Original ID from the source
 * @property {string} softwareSystemId - Parent software system UUID
 * @property {string} [containerId] - Optional container UUID
 * 
 * @property {string} title - Event title
 * @property {string} [description] - Markdown description
 * @property {Severity} severity - Normalized 5-level severity
 * @property {EventState} state - Current triage state
 * @property {EventType} type - Event type classification
 * 
 * @property {string} [ruleId] - Rule/signature identifier
 * @property {Location} [location] - Code location
 * @property {string} [remediation] - Markdown remediation guidance
 * @property {string} [url] - URL to view in source's web UI
 * @property {string} [fingerprint] - Deduplication fingerprint
 * 
 * @property {Record<string, unknown>} sourceData - Raw source data (JSON)
 * @property {Record<string, unknown>} metadata - User-added metadata (JSON)
 * 
 * @property {Date} firstSeenAt - First detection timestamp
 * @property {Date} lastSeenAt - Last detection timestamp  
 * @property {Date} syncedAt - Last sync with source
 * @property {Date} updatedAt - Last local modification
 * 
 * @property {boolean} isDirty - Has local changes pending sync
 * @property {string} [pendingState] - State change waiting to sync
 */

/**
 * Normalized severity levels (5-level scale)
 * @typedef {'critical' | 'high' | 'medium' | 'low' | 'informational'} Severity
 */

/**
 * Triage states (Core-managed, synced to sources)
 * @typedef {'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'} EventState
 */

/**
 * Event type classification
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

### 4.2 SoftwareSystem

Represents an application/project known to a source.

```javascript
/**
 * @typedef {Object} SoftwareSystem
 * @property {string} id - UUID (generated by Core)
 * @property {string} sourceId - Source plugin identifier
 * @property {string} sourceSystemId - Original ID from source
 * @property {string} name - Human-readable name
 * @property {string} [description] - Optional description
 * @property {string} [url] - URL to view in source's web UI
 * @property {Record<string, unknown>} sourceData - Raw source data
 * @property {Record<string, unknown>} metadata - User-added metadata
 * @property {Date} syncedAt - Last sync timestamp
 * @property {Date} updatedAt - Last local modification
 */
```

### 4.3 SecurityContainer

Optional logical grouping within a SoftwareSystem.

```javascript
/**
 * @typedef {Object} SecurityContainer
 * @property {string} id - UUID (generated by Core)
 * @property {string} sourceId - Source plugin identifier
 * @property {string} sourceContainerId - Original ID from source
 * @property {string} softwareSystemId - Parent system UUID
 * @property {string} name - Human-readable name
 * @property {string} type - Container type ('repository', 'scan', 'pipeline')
 * @property {string} [url] - URL to view in source's web UI
 * @property {Record<string, unknown>} sourceData - Raw source data
 * @property {Date} lastScannedAt - Last scan timestamp
 * @property {Date} syncedAt - Last sync timestamp
 */
```

### 4.4 Tag

User-defined labels for categorization (lives only in Core).

```javascript
/**
 * @typedef {Object} Tag
 * @property {string} id - UUID
 * @property {string} name - Display name (unique)
 * @property {string} [color] - Hex color code
 * @property {string} [description] - Tag description
 * @property {Date} createdAt - Creation timestamp
 */
```

### 4.5 EventTag (Junction)

```javascript
/**
 * @typedef {Object} EventTag
 * @property {string} eventId - SecurityEvent UUID
 * @property {string} tagId - Tag UUID
 * @property {Date} createdAt - When tag was applied
 */
```

### 4.6 Comment

User or system comments (lives in Core, optionally synced to sources).

```javascript
/**
 * @typedef {Object} Comment
 * @property {string} id - UUID
 * @property {string} eventId - Parent SecurityEvent UUID
 * @property {string} author - Author name
 * @property {string} content - Markdown content
 * @property {'local' | 'source' | 'system'} origin - Where comment originated
 * @property {boolean} syncedToSource - Whether pushed to source
 * @property {Date} createdAt - Creation timestamp
 */
```

### 4.7 WorkItemLink

Link between SecurityEvent and external work tracker item.

```javascript
/**
 * @typedef {Object} WorkItemLink
 * @property {string} id - UUID
 * @property {string} eventId - SecurityEvent UUID
 * @property {string} trackerId - Work tracker plugin ID (e.g., 'jira')
 * @property {string} workItemId - External item ID (e.g., 'PROJ-123')
 * @property {string} workItemUrl - URL to the work item
 * @property {string} [workItemTitle] - Cached title
 * @property {string} [workItemState] - Cached state
 * @property {Date} createdAt - When link was created
 * @property {Date} syncedAt - Last sync with tracker
 */
```

### 4.8 EventCorrelation

Links between related events (lives only in Core).

```javascript
/**
 * @typedef {Object} EventCorrelation
 * @property {string} id - UUID
 * @property {string} sourceEventId - Source event UUID
 * @property {string} targetEventId - Target event UUID
 * @property {'duplicate' | 'related' | 'caused_by' | 'same_issue'} type
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} [reason] - Human-readable reason
 * @property {Date} createdAt - Creation timestamp
 */
```

---

## 5. Source Plugin Interface

Sources are **plugins** (separate npm packages) that the Core loads to interact with external security information providers.

### 5.1 Key Constraints

| Constraint | Description |
|------------|-------------|
| **Read Operations** | Each source defines what it can read (systems, containers, events) |
| **Update State** | **ALL sources MUST support updating event state** — this is mandatory |
| **Other Updates** | Optional: severity update, comments, etc. |
| **Pagination** | Source handles internally; Core receives complete datasets |
| **Credentials** | Core passes credentials to source; source never stores them |
| **Proxy** | Core passes proxy config; source uses it for all HTTP |

### 5.2 Interface Definition

```javascript
/**
 * Security Source Plugin Interface
 * @interface ISecuritySource
 */

/**
 * @typedef {Object} ISecuritySource
 * 
 * === Identity ===
 * @property {string} id - Unique source identifier (e.g., 'azdo')
 * @property {string} name - Human-readable name
 * @property {string} version - Plugin version
 * 
 * === Lifecycle ===
 * @property {(config: SourceConfig) => Promise<void>} initialize
 *   Initialize with credentials and proxy config from Core
 * 
 * @property {() => Promise<void>} dispose
 *   Cleanup resources
 * 
 * @property {() => Promise<ConnectionStatus>} testConnection
 *   Verify credentials and connectivity
 * 
 * === Read Operations ===
 * @property {() => Promise<RawSoftwareSystem[]>} fetchSoftwareSystems
 *   Fetch all systems (handles pagination internally)
 * 
 * @property {(systemId: string) => Promise<RawSecurityContainer[]>} fetchContainers
 *   Fetch containers for a system (if supported)
 * 
 * @property {(systemId: string, containerId?: string) => Promise<RawSecurityEvent[]>} fetchEvents
 *   Fetch all events (handles pagination internally)
 * 
 * @property {(systemId: string, eventId: string) => Promise<RawSecurityEvent>} fetchEventDetail
 *   Fetch detailed event data
 * 
 * === Write Operations ===
 * @property {(systemId: string, eventId: string, newState: EventState, comment?: string) => Promise<void>} updateEventState
 *   Update event state in source — MANDATORY, all sources must implement
 * 
 * === Capabilities ===
 * @property {SourceCapabilities} capabilities
 *   Declares what this source supports
 */

/**
 * @typedef {Object} SourceConfig
 * @property {Record<string, string>} credentials - Source-specific credentials
 * @property {ProxyConfig} [proxy] - HTTP proxy configuration
 * @property {Record<string, unknown>} [options] - Source-specific options
 */

/**
 * @typedef {Object} ProxyConfig
 * @property {string} [httpProxy] - HTTP proxy URL
 * @property {string} [httpsProxy] - HTTPS proxy URL
 * @property {string[]} [noProxy] - Hosts to bypass proxy
 * @property {bool} [verifyCertificate] - (default: true) If certificate validity must be verified
 * @property {string} [additionalCACertificate] - Path to additional trusted Root CA
 */

/**
 * @typedef {Object} SourceCapabilities
 * @property {boolean} hasContainers - Source has container concept
 * @property {boolean} canUpdateSeverity - Can update severity
 * @property {boolean} canAddComments - Can add comments to events
 * @property {boolean} canFetchComments - Can retrieve comments
 * @property {EventType[]} supportedEventTypes - Event types this source provides
 * @property {Record<EventState, string>} stateMapping - Maps canonical states to source states
 */

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} connected - Whether connection succeeded
 * @property {string} [error] - Error message if failed
 * @property {string} [user] - Authenticated user info
 * @property {Record<string, unknown>} [details] - Additional connection details
 */

/**
 * Raw data from source (before normalization)
 * Each source defines its own structure
 */
/**
 * @typedef {Object} RawSoftwareSystem
 * @property {string} id - Source-specific ID
 * @property {string} name - Name
 * @property {Record<string, unknown>} [raw] - Full raw data from source API
 */

/**
 * @typedef {Object} RawSecurityContainer
 * @property {string} id - Source-specific ID
 * @property {string} systemId - Parent system ID
 * @property {string} name - Name
 * @property {string} type - Container type
 * @property {Record<string, unknown>} [raw] - Full raw data
 */

/**
 * @typedef {Object} RawSecurityEvent
 * @property {string} id - Source-specific ID
 * @property {string} systemId - Parent system ID
 * @property {string} [containerId] - Parent container ID
 * @property {string} title - Event title
 * @property {string} severity - Source-specific severity
 * @property {string} state - Source-specific state
 * @property {string} type - Source-specific type
 * @property {Record<string, unknown>} raw - Full raw data from source API
 */
```

### 5.3 Source Normalization

Each source plugin includes a **normalizer** that converts raw data to canonical models:

```javascript
/**
 * Normalizer interface (implemented within each source plugin)
 */

/**
 * @typedef {Object} ISourceNormalizer
 * @property {(raw: RawSoftwareSystem) => Partial<SoftwareSystem>} normalizeSystem
 * @property {(raw: RawSecurityContainer) => Partial<SecurityContainer>} normalizeContainer
 * @property {(raw: RawSecurityEvent) => Partial<SecurityEvent>} normalizeEvent
 * @property {(canonicalState: EventState) => string} mapStateToSource
 * @property {(sourceState: string) => EventState} mapStateFromSource
 * @property {(sourceSeverity: string | number) => Severity} mapSeverity
 */
```

### 5.4 Example: AZDO Source Plugin Structure

```
@metanull/siem-source-azdo/
├── package.json
├── src/
│   ├── index.js          # Exports plugin
│   ├── azdo-source.js    # ISecuritySource implementation
│   ├── azdo-client.js    # API client (uses azure-devops-node-api)
│   ├── azdo-normalizer.js # Data normalization
│   └── azdo-mappings.js  # State/severity mappings
└── tests/
    └── ...
```

---

## 6. Work Tracker Plugin Interface

Work Trackers are plugins for Jira, GitHub Issues, etc.

### 6.1 Interface Definition

```javascript
/**
 * Work Tracker Plugin Interface
 * @interface IWorkTracker
 */

/**
 * @typedef {Object} IWorkTracker
 * 
 * === Identity ===
 * @property {string} id - Unique tracker identifier (e.g., 'jira')
 * @property {string} name - Human-readable name
 * @property {string} version - Plugin version
 * 
 * === Lifecycle ===
 * @property {(config: TrackerConfig) => Promise<void>} initialize
 * @property {() => Promise<void>} dispose
 * @property {() => Promise<ConnectionStatus>} testConnection
 * 
 * === Operations ===
 * @property {(options: CreateWorkItemOptions) => Promise<WorkItemResult>} createWorkItem
 * @property {(workItemId: string) => Promise<WorkItemResult>} getWorkItem
 * @property {(workItemId: string, update: WorkItemUpdate) => Promise<WorkItemResult>} updateWorkItem
 * @property {(query: string) => Promise<WorkItemResult[]>} searchWorkItems
 * 
 * === Capabilities ===
 * @property {TrackerCapabilities} capabilities
 */

/**
 * @typedef {Object} TrackerConfig
 * @property {Record<string, string>} credentials
 * @property {ProxyConfig} [proxy]
 * @property {Record<string, unknown>} [options]
 */

/**
 * @typedef {Object} CreateWorkItemOptions
 * @property {string} projectKey - Project identifier
 * @property {string} title - Item title
 * @property {string} description - Markdown description
 * @property {string} [itemType] - Bug, Story, Task, etc.
 * @property {string} [priority] - Priority level
 * @property {string[]} [labels] - Labels/tags
 * @property {string} [assignee] - Assignee identifier
 */

/**
 * @typedef {Object} WorkItemResult
 * @property {string} id - Tracker item ID
 * @property {string} key - Human-readable key (e.g., PROJ-123)
 * @property {string} url - URL to item
 * @property {string} title - Item title
 * @property {string} state - Item state
 */

/**
 * @typedef {Object} TrackerCapabilities
 * @property {boolean} supportsLabels
 * @property {boolean} supportsPriority
 * @property {boolean} supportsAssignee
 * @property {boolean} supportsCustomFields
 * @property {number} maxDescriptionLength
 * @property {string[]} supportedItemTypes
 */
```

---

## 7. Client Communication Analysis

### 7.1 Requirements

Clients need to:
1. **Query local data** — fast, synchronous-feeling
2. **Execute commands** — update state, add tags, create links
3. **Receive notifications** — when data changes, sync completes, errors occur
4. **Work independently** — no knowledge of Core internals
5. **Future: Web UI** — served locally by Node.js

### 7.2 Options Analysis

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. In-Process Library** | Client imports Core as npm dependency, runs in same Node.js process | Fastest, simplest, direct events, no serialization | Clients must be Node.js |
| **B. HTTP REST API** | Core runs HTTP server, clients make REST calls | Language agnostic, web-ready | Server overhead, API versioning, latency |
| **C. IPC (Unix sockets / Named pipes)** | Separate processes communicate via local sockets | Process isolation, still fast | Platform complexity, protocol design |
| **D. Shared SQLite + File Watcher** | Clients read SQLite directly, watch for changes | Very simple reads | Limited signaling, write conflicts |
| **E. WebSocket Only** | Core runs WebSocket server for bidirectional communication | Real-time, web-compatible | Still needs server, more complex than events |
| **F. Hybrid: Library + Optional Server** | CLI/TUI use library; Web uses thin server | Best of both | Two paths to maintain |

### 7.3 Recommendation: Hybrid Approach (Option F)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIMARY: In-Process Library                   │
│                                                                  │
│  CLI Client ────────┐                                           │
│                     ├───► Core Library (same process)           │
│  TUI Client ────────┘     - Direct function calls               │
│                           - EventEmitter for signals            │
│                           - Zero serialization overhead         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SECONDARY: Thin Server (for Web)              │
│                                                                  │
│  Web Client ───(HTTP/WS)───► Server Wrapper                     │
│                              └──► Core Library                  │
│                                                                  │
│  Server Wrapper provides:                                        │
│  - REST endpoints for queries/commands                          │
│  - WebSocket for signal forwarding                              │
│  - Minimal logic (pure passthrough to Core)                     │
└─────────────────────────────────────────────────────────────────┘
```

**Rationale:**
1. **CLI and TUI** — These are Node.js applications. Using Core as a library is simplest, fastest, and most reliable.
2. **Web UI** — Requires some server layer anyway (to serve HTML/JS). Adding a thin wrapper that exposes Core API is straightforward.
3. **No premature complexity** — We don't build the server until needed. Core API design is the same either way.

### 7.4 Server Wrapper (Future, Not in Scope Now)

When Web UI is needed:

```javascript
// @metanull/siem-server (future package)
import { createCore } from '@metanull/siem-core';
import express from 'express';
import { WebSocketServer } from 'ws';

const core = createCore({ /* config */ });

// REST endpoints
app.get('/api/events', (req, res) => {
  const events = core.queryEvents(req.query);
  res.json(events);
});

app.post('/api/events/:id/state', (req, res) => {
  await core.updateEventState(req.params.id, req.body.state);
  res.json({ ok: true });
});

// WebSocket for signals
core.signals.on('*', (signal) => {
  wss.clients.forEach(client => client.send(JSON.stringify(signal)));
});
```

---

## 8. Client Interface

The Core exposes a **Client API** that all clients (CLI, TUI, Web wrapper) use.

### 8.1 Core Instance

```javascript
/**
 * Create and initialize Core instance
 * @param {CoreOptions} options
 * @returns {Promise<ICore>}
 */
export async function createCore(options) {
  const core = new Core(options);
  await core.initialize();
  return core;
}

/**
 * @typedef {Object} CoreOptions
 * @property {string} dataDir - Directory for SQLite database and settings
 * @property {string[]} [pluginPaths] - Additional paths to search for plugins
 * @property {boolean} [autoSync] - Enable automatic background sync (default: true)
 * @property {number} [syncIntervalMs] - Sync interval in milliseconds (default: 300000 = 5 min)
 */
```

### 8.2 Core API

```javascript
/**
 * Core API Interface
 * @interface ICore
 */

/**
 * @typedef {Object} ICore
 * 
 * === Lifecycle ===
 * @property {() => Promise<void>} initialize - Initialize Core
 * @property {() => Promise<void>} shutdown - Graceful shutdown
 * 
 * === Signals ===
 * @property {SignalHub} signals - Signal subscription hub
 * 
 * === Settings ===
 * @property {ISettingsManager} settings - Settings management
 * 
 * === Sources ===
 * @property {ISourceManager} sources - Source plugin management
 * 
 * === Trackers ===
 * @property {ITrackerManager} trackers - Work tracker management
 * 
 * === Data Queries (local data only) ===
 * @property {(options?: QueryOptions) => SecurityEvent[]} queryEvents
 * @property {(id: string) => SecurityEvent | undefined} getEvent
 * @property {(options?: QueryOptions) => SoftwareSystem[]} querySystems
 * @property {(id: string) => SoftwareSystem | undefined} getSystem
 * @property {(systemId: string) => SecurityContainer[]} getContainers
 * @property {(eventId: string) => Comment[]} getComments
 * @property {(eventId: string) => Tag[]} getTags
 * @property {(eventId: string) => WorkItemLink[]} getWorkItemLinks
 * @property {(eventId: string) => EventCorrelation[]} getCorrelations
 * @property {() => Tag[]} getAllTags
 * 
 * === Data Commands ===
 * @property {(eventId: string, state: EventState, comment?: string) => Promise<void>} updateEventState
 *   Updates locally + marks dirty for sync
 * 
 * @property {(eventId: string, tagId: string) => Promise<void>} addTag
 * @property {(eventId: string, tagId: string) => Promise<void>} removeTag
 * @property {(name: string, color?: string) => Promise<Tag>} createTag
 * @property {(tagId: string) => Promise<void>} deleteTag
 * 
 * @property {(eventId: string, content: string) => Promise<Comment>} addComment
 * @property {(sourceId: string, targetId: string, type: string) => Promise<EventCorrelation>} correlateEvents
 * 
 * @property {(eventId: string, trackerId: string, options: CreateWorkItemOptions) => Promise<WorkItemLink>} createAndLinkWorkItem
 * @property {(eventId: string, trackerId: string, workItemId: string) => Promise<WorkItemLink>} linkWorkItem
 * @property {(linkId: string) => Promise<void>} unlinkWorkItem
 * 
 * === Sync Control ===
 * @property {(sourceId?: string) => Promise<void>} syncNow
 *   Trigger immediate sync (all sources or specific source)
 * 
 * @property {() => Promise<void>} pushPendingChanges
 *   Push all dirty records to their sources
 * 
 * @property {() => SyncStatus} getSyncStatus
 *   Get current sync status
 * 
 * === Statistics ===
 * @property {() => DashboardStats} getStats
 */

/**
 * @typedef {Object} QueryOptions
 * @property {string} [sourceId] - Filter by source
 * @property {string} [systemId] - Filter by software system
 * @property {string} [containerId] - Filter by container
 * @property {Severity[]} [severities] - Filter by severities
 * @property {EventState[]} [states] - Filter by states
 * @property {EventType[]} [types] - Filter by event types
 * @property {string[]} [tagIds] - Filter by tags
 * @property {boolean} [hasWorkItem] - Filter by work item presence
 * @property {boolean} [isDirty] - Filter by sync status
 * @property {string} [search] - Full-text search
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortOrder] - Sort direction
 * @property {number} [limit] - Max results
 * @property {number} [offset] - Pagination offset
 */

/**
 * @typedef {Object} SyncStatus
 * @property {boolean} isSyncing - Sync in progress
 * @property {Date} [lastSyncAt] - Last successful sync
 * @property {number} pendingChanges - Count of dirty records
 * @property {Record<string, SourceSyncStatus>} sources - Per-source status
 */

/**
 * @typedef {Object} SourceSyncStatus
 * @property {boolean} connected - Source is connected
 * @property {Date} [lastSyncAt] - Last sync for this source
 * @property {number} pendingChanges - Dirty records for this source
 * @property {string} [error] - Last error if any
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalEvents - Total events in store
 * @property {Record<Severity, number>} bySeverity - Count by severity
 * @property {Record<EventState, number>} byState - Count by state
 * @property {Record<string, number>} bySource - Count by source
 * @property {number} pendingSync - Events pending sync
 * @property {number} withWorkItems - Events linked to work items
 */
```

### 8.3 Settings Manager

```javascript
/**
 * @typedef {Object} ISettingsManager
 * 
 * === Proxy ===
 * @property {() => ProxyConfig} getProxy
 * @property {(config: ProxyConfig) => Promise<void>} setProxy
 * 
 * === Source Credentials ===
 * @property {(sourceId: string) => Record<string, string>} getSourceCredentials
 * @property {(sourceId: string, credentials: Record<string, string>) => Promise<void>} setSourceCredentials
 * @property {(sourceId: string) => Promise<void>} clearSourceCredentials
 * 
 * === Tracker Credentials ===
 * @property {(trackerId: string) => Record<string, string>} getTrackerCredentials
 * @property {(trackerId: string, credentials: Record<string, string>) => Promise<void>} setTrackerCredentials
 * 
 * === Source Options ===
 * @property {(sourceId: string) => Record<string, unknown>} getSourceOptions
 * @property {(sourceId: string, options: Record<string, unknown>) => Promise<void>} setSourceOptions
 * 
 * === Sync Settings ===
 * @property {() => SyncSettings} getSyncSettings
 * @property {(settings: Partial<SyncSettings>) => Promise<void>} setSyncSettings
 */

/**
 * @typedef {Object} SyncSettings
 * @property {boolean} autoSync - Enable automatic sync
 * @property {number} syncIntervalMs - Sync interval in ms
 * @property {string[]} enabledSources - Which sources to sync
 */
```

### 8.4 Source Manager

```javascript
/**
 * @typedef {Object} ISourceManager
 * @property {() => SourceInfo[]} listSources - List registered sources
 * @property {(sourceId: string) => SourceInfo | undefined} getSource
 * @property {(sourceId: string) => Promise<ConnectionStatus>} testConnection
 * @property {(sourceId: string) => Promise<void>} enable
 * @property {(sourceId: string) => Promise<void>} disable
 */

/**
 * @typedef {Object} SourceInfo
 * @property {string} id - Source identifier
 * @property {string} name - Human-readable name
 * @property {string} version - Plugin version
 * @property {boolean} enabled - Whether source is enabled
 * @property {boolean} configured - Whether credentials are set
 * @property {SourceCapabilities} capabilities
 */
```

---

## 9. Settings & Configuration

### 9.1 Settings Storage

Settings are stored in a **separate SQLite table** (or JSON file) within the Core's data directory.

```javascript
// Settings are encrypted at rest for credentials
// Uses Node.js crypto with machine-specific key

const settings = {
  proxy: {
    httpProxy: 'http://proxy.example.com:8080',
    httpsProxy: 'http://proxy.example.com:8080',
    noProxy: ['localhost', '127.0.0.1']
  },
  sync: {
    autoSync: true,
    syncIntervalMs: 300000, // 5 minutes
    enabledSources: ['azdo', 'asoc']
  },
  sources: {
    azdo: {
      credentials: {
        organization: 'myorg',
        pat: 'encrypted:...'
      },
      options: {
        baseUrl: 'https://dev.azure.com'
      }
    },
    asoc: {
      credentials: {
        apiKey: 'encrypted:...',
        apiSecret: 'encrypted:...'
      }
    }
  },
  trackers: {
    jira: {
      credentials: {
        host: 'https://mycompany.atlassian.net',
        email: 'user@example.com',
        apiToken: 'encrypted:...'
      }
    }
  }
};
```

### 9.2 Credential Security

- Credentials are **encrypted at rest** using Node.js `crypto`
- Encryption key derived from machine ID or user-provided passphrase
- Credentials are **never logged**
- Credentials passed to plugins **in memory only**

---

## 10. Storage Layer

### 10.1 SQLite Schema

```sql
-- Software Systems
CREATE TABLE software_systems (
  id TEXT PRIMARY KEY,                    -- UUID
  source_id TEXT NOT NULL,                -- e.g., 'azdo', 'asoc'
  source_system_id TEXT NOT NULL,         -- ID from source
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  source_data JSON,                       -- Raw data from source
  metadata JSON,                          -- User-added metadata
  synced_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, source_system_id)
);

-- Security Containers
CREATE TABLE security_containers (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  source_container_id TEXT NOT NULL,
  software_system_id TEXT NOT NULL REFERENCES software_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  source_data JSON,
  last_scanned_at DATETIME,
  synced_at DATETIME,
  UNIQUE(source_id, source_container_id)
);

-- Security Events
CREATE TABLE security_events (
  id TEXT PRIMARY KEY,                    -- UUID
  source_id TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  software_system_id TEXT NOT NULL REFERENCES software_systems(id) ON DELETE CASCADE,
  container_id TEXT REFERENCES security_containers(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  state TEXT NOT NULL CHECK(state IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
  type TEXT NOT NULL,
  
  rule_id TEXT,
  location JSON,                          -- {filePath, startLine, endLine, snippet, ...}
  remediation TEXT,
  url TEXT,
  fingerprint TEXT,
  
  source_data JSON NOT NULL,              -- Raw data from source
  metadata JSON,                          -- User-added metadata
  
  first_seen_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  synced_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Change tracking
  is_dirty INTEGER DEFAULT 0,             -- Has local changes
  pending_state TEXT,                     -- State change waiting to sync
  pending_comment TEXT,                   -- Comment to send with state change
  
  UNIQUE(source_id, source_event_id)
);

-- Tags (local only)
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Event-Tag junction
CREATE TABLE event_tags (
  event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(event_id, tag_id)
);

-- Comments
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  origin TEXT NOT NULL CHECK(origin IN ('local', 'source', 'system')),
  synced_to_source INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Work Item Links
CREATE TABLE work_item_links (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  tracker_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  work_item_url TEXT NOT NULL,
  work_item_title TEXT,
  work_item_state TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at DATETIME,
  UNIQUE(event_id, tracker_id, work_item_id)
);

-- Event Correlations
CREATE TABLE event_correlations (
  id TEXT PRIMARY KEY,
  source_event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  target_event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('duplicate', 'related', 'caused_by', 'same_issue')),
  confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_event_id, target_event_id, type)
);

-- Settings (encrypted values)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,                    -- JSON, encrypted for credentials
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sync Log
CREATE TABLE sync_log (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  operation TEXT NOT NULL,                -- 'fetch', 'push'
  status TEXT NOT NULL,                   -- 'success', 'error'
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  records_affected INTEGER,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_events_source ON security_events(source_id);
CREATE INDEX idx_events_system ON security_events(software_system_id);
CREATE INDEX idx_events_container ON security_events(container_id);
CREATE INDEX idx_events_severity ON security_events(severity);
CREATE INDEX idx_events_state ON security_events(state);
CREATE INDEX idx_events_type ON security_events(type);
CREATE INDEX idx_events_dirty ON security_events(is_dirty) WHERE is_dirty = 1;
CREATE INDEX idx_events_fingerprint ON security_events(fingerprint);
CREATE INDEX idx_comments_event ON comments(event_id);
CREATE INDEX idx_work_links_event ON work_item_links(event_id);
CREATE INDEX idx_correlations_source ON event_correlations(source_event_id);
CREATE INDEX idx_correlations_target ON event_correlations(target_event_id);
```

### 10.2 Storage Interface

```javascript
/**
 * @typedef {Object} IStorage
 * @property {() => Promise<void>} initialize
 * @property {() => Promise<void>} close
 * 
 * === Events ===
 * @property {(event: SecurityEvent) => Promise<void>} upsertEvent
 * @property {(events: SecurityEvent[]) => Promise<void>} upsertEvents
 * @property {(id: string) => Promise<SecurityEvent | undefined>} getEvent
 * @property {(options: QueryOptions) => Promise<{items: SecurityEvent[], total: number}>} queryEvents
 * @property {(id: string, update: Partial<SecurityEvent>) => Promise<void>} updateEvent
 * @property {(sourceId: string) => Promise<SecurityEvent[]>} getDirtyEvents
 * @property {(id: string) => Promise<void>} clearDirty
 * 
 * === Systems & Containers ===
 * @property {(system: SoftwareSystem) => Promise<void>} upsertSystem
 * @property {(container: SecurityContainer) => Promise<void>} upsertContainer
 * @property {(options: QueryOptions) => Promise<SoftwareSystem[]>} querySystems
 * @property {(systemId: string) => Promise<SecurityContainer[]>} getContainers
 * 
 * === Tags ===
 * @property {(tag: Tag) => Promise<void>} createTag
 * @property {(id: string) => Promise<void>} deleteTag
 * @property {() => Promise<Tag[]>} getAllTags
 * @property {(eventId: string, tagId: string) => Promise<void>} addEventTag
 * @property {(eventId: string, tagId: string) => Promise<void>} removeEventTag
 * @property {(eventId: string) => Promise<Tag[]>} getEventTags
 * 
 * === Comments ===
 * @property {(comment: Comment) => Promise<void>} addComment
 * @property {(eventId: string) => Promise<Comment[]>} getComments
 * 
 * === Work Items ===
 * @property {(link: WorkItemLink) => Promise<void>} addWorkItemLink
 * @property {(id: string) => Promise<void>} removeWorkItemLink
 * @property {(eventId: string) => Promise<WorkItemLink[]>} getWorkItemLinks
 * 
 * === Correlations ===
 * @property {(correlation: EventCorrelation) => Promise<void>} addCorrelation
 * @property {(eventId: string) => Promise<EventCorrelation[]>} getCorrelations
 * 
 * === Settings ===
 * @property {(key: string) => Promise<unknown | undefined>} getSetting
 * @property {(key: string, value: unknown) => Promise<void>} setSetting
 * 
 * === Sync Log ===
 * @property {(entry: SyncLogEntry) => Promise<void>} logSync
 * @property {(sourceId?: string) => Promise<SyncLogEntry[]>} getSyncLog
 */
```

---

## 11. Synchronization Engine

### 11.1 Responsibilities

1. **Background Polling** — Periodically fetch fresh data from sources
2. **Push Changes** — Send local changes (dirty records) to sources
3. **Conflict Detection** — Identify when source data changed while local changes pending
4. **Status Tracking** — Report sync progress and errors

### 11.2 Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       SYNC ENGINE                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Scheduler (setInterval)                                 │    │
│  │  - Every N minutes, trigger sync for enabled sources    │    │
│  └─────────────────────────────┬───────────────────────────┘    │
│                                │                                 │
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  For each enabled source:                                │    │
│  │                                                          │    │
│  │  1. PUSH pending changes                                 │    │
│  │     - Get dirty records for this source                 │    │
│  │     - For each: call source.updateEventState()          │    │
│  │     - On success: clear dirty flag                      │    │
│  │     - On failure: log error, keep dirty                 │    │
│  │                                                          │    │
│  │  2. FETCH fresh data                                     │    │
│  │     - Fetch systems, containers, events                 │    │
│  │     - Normalize to canonical models                     │    │
│  │     - Upsert to storage (merge, don't overwrite local) │    │
│  │     - Emit 'data:updated' signal                        │    │
│  │                                                          │    │
│  │  3. Record sync timestamp                                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Merge Strategy

When syncing, **local metadata and enrichments are preserved**:

```javascript
function mergeEvent(existingLocal, incomingFromSource) {
  return {
    // From source (always update)
    ...incomingFromSource,
    
    // Preserve local UUID (don't change)
    id: existingLocal.id,
    
    // Preserve local enrichments
    metadata: existingLocal.metadata,
    
    // Keep local state if dirty (pending sync)
    state: existingLocal.isDirty ? existingLocal.state : incomingFromSource.state,
    
    // Keep dirty flag
    isDirty: existingLocal.isDirty,
    pendingState: existingLocal.pendingState,
    pendingComment: existingLocal.pendingComment,
    
    // Update timestamps
    lastSeenAt: incomingFromSource.lastSeenAt,
    syncedAt: new Date(),
    updatedAt: existingLocal.isDirty ? existingLocal.updatedAt : new Date(),
  };
}
```

### 11.4 Conflict Handling

```javascript
/**
 * @typedef {Object} SyncConflict
 * @property {string} eventId - Event UUID
 * @property {string} field - Field in conflict (e.g., 'state')
 * @property {unknown} localValue - Value user set locally
 * @property {unknown} remoteValue - Value from source
 * @property {'local_wins' | 'remote_wins' | 'manual'} resolution
 */

// Default: local wins (user intent takes precedence)
// Signal emitted so client can notify user of conflict
```

---

## 12. Signal System

### 12.1 Design Goals

- **Framework Agnostic** — No React, no Zustand, no RxJS
- **Simple** — Built on Node.js EventEmitter
- **Typed** — Well-defined signal types
- **Filterable** — Clients can subscribe to specific signals

### 12.2 Signal Hub

```javascript
import { EventEmitter } from 'node:events';

/**
 * Signal Hub for Core → Client communication
 */
export class SignalHub extends EventEmitter {
  /**
   * Emit a typed signal
   * @param {SignalType} type
   * @param {SignalPayload} payload
   */
  emit(type, payload) {
    super.emit(type, payload);
    super.emit('*', { type, payload }); // Wildcard for catch-all
  }

  /**
   * Subscribe to a signal type
   * @param {SignalType} type
   * @param {(payload: SignalPayload) => void} handler
   * @returns {() => void} Unsubscribe function
   */
  on(type, handler) {
    super.on(type, handler);
    return () => this.off(type, handler);
  }

  /**
   * Subscribe to all signals
   * @param {(signal: {type: SignalType, payload: SignalPayload}) => void} handler
   * @returns {() => void} Unsubscribe function
   */
  onAny(handler) {
    super.on('*', handler);
    return () => this.off('*', handler);
  }
}
```

### 12.3 Signal Types

```javascript
/**
 * @typedef {'data:events:updated' | 'data:events:added' | 'data:events:removed' |
 *           'data:systems:updated' | 'data:containers:updated' |
 *           'sync:started' | 'sync:progress' | 'sync:completed' | 'sync:error' |
 *           'sync:conflict' | 'sync:push:success' | 'sync:push:error' |
 *           'source:connected' | 'source:disconnected' | 'source:error' |
 *           'tracker:connected' | 'tracker:disconnected' |
 *           'operation:started' | 'operation:completed' | 'operation:error'
 * } SignalType
 */

/**
 * Signal Payloads
 */

// data:events:updated
{ 
  eventIds: string[],
  source: 'sync' | 'local'
}

// data:events:added
{
  events: SecurityEvent[],
  sourceId: string
}

// sync:started
{
  sourceId: string | null,  // null = all sources
  operation: 'fetch' | 'push' | 'full'
}

// sync:progress
{
  sourceId: string,
  phase: 'fetching' | 'normalizing' | 'storing' | 'pushing',
  current: number,
  total: number
}

// sync:completed
{
  sourceId: string | null,
  duration: number,
  recordsUpdated: number,
  recordsPushed: number
}

// sync:error
{
  sourceId: string,
  error: string,
  retryable: boolean
}

// sync:conflict
{
  conflicts: SyncConflict[]
}

// operation:completed
{
  operation: string,
  target: string,
  result: unknown
}
```

### 12.4 Client Usage Example

```javascript
const core = await createCore({ dataDir: './data' });

// Subscribe to specific signals
const unsubscribe = core.signals.on('data:events:updated', ({ eventIds }) => {
  console.log(`Events updated: ${eventIds.join(', ')}`);
  // Refresh UI
});

// Subscribe to all sync signals
core.signals.on('sync:progress', ({ phase, current, total }) => {
  console.log(`Sync progress: ${phase} ${current}/${total}`);
});

// Catch-all for logging
core.signals.onAny(({ type, payload }) => {
  logger.debug(`Signal: ${type}`, payload);
});

// Cleanup
unsubscribe();
```

---

## 13. Plugin System

### 13.1 Plugin Discovery

Plugins are npm packages that follow a naming convention and export a standard interface.

```javascript
/**
 * Plugin discovery paths:
 * 1. Built-in plugins (bundled with core)
 * 2. Global npm packages matching pattern @metanull/siem-source-* or @metanull/siem-tracker-*
 * 3. Local node_modules
 * 4. Custom paths specified in CoreOptions.pluginPaths
 */

/**
 * Plugin package.json must include:
 */
{
  "name": "@metanull/siem-source-azdo",
  "siem": {
    "type": "source",       // or "tracker"
    "id": "azdo",
    "displayName": "Azure DevOps"
  },
  "main": "./dist/index.js"
}
```

### 13.2 Plugin Loading

```javascript
/**
 * @typedef {Object} IPluginLoader
 * @property {() => Promise<PluginInfo[]>} discoverPlugins
 * @property {(pluginPath: string) => Promise<ISecuritySource | IWorkTracker>} loadPlugin
 * @property {(pluginId: string) => Promise<void>} unloadPlugin
 */

/**
 * @typedef {Object} PluginInfo
 * @property {string} id - Plugin identifier
 * @property {string} name - Display name
 * @property {'source' | 'tracker'} type
 * @property {string} version
 * @property {string} path - Path to plugin
 * @property {boolean} loaded - Whether currently loaded
 */
```

### 13.3 Plugin Isolation

Plugins run in the same process but are isolated:
- Each plugin has its own dependency scope
- Plugin errors are caught and don't crash Core
- Plugins cannot access Core internals directly

```javascript
// Core catches plugin errors
async function safePluginCall(plugin, method, ...args) {
  try {
    return await plugin[method](...args);
  } catch (error) {
    core.signals.emit('source:error', {
      sourceId: plugin.id,
      error: error.message,
    });
    logger.error(`Plugin ${plugin.id} error in ${method}`, error);
    return undefined;
  }
}
```

### 13.4 Example Source Plugin Package

```
@metanull/siem-source-azdo/
├── package.json
│   {
│     "name": "@metanull/siem-source-azdo",
│     "version": "1.0.0",
│     "siem": {
│       "type": "source",
│       "id": "azdo",
│       "displayName": "Azure DevOps Advanced Security"
│     },
│     "main": "./src/index.js",
│     "peerDependencies": {
│       "@metanull/siem-core": "^1.0.0"
│     },
│     "dependencies": {
│       "azure-devops-node-api": "^15.0.0"
│     }
│   }
├── src/
│   ├── index.js              # Exports createPlugin factory
│   ├── azdo-source.js        # ISecuritySource implementation
│   ├── client.js             # Azure DevOps API wrapper
│   ├── normalizer.js         # Data normalization
│   └── mappings.js           # State/severity mappings
└── tests/
    └── ...

// src/index.js
export function createPlugin() {
  return new AzdoSource();
}

export const pluginInfo = {
  id: 'azdo',
  name: 'Azure DevOps Advanced Security',
  type: 'source',
  version: '1.0.0',
};
```

---

## 14. Project Structure

```
@metanull/siem-core/
├── package.json
├── src/
│   ├── index.js                    # Public API exports
│   ├── core.js                     # Core implementation
│   │
│   ├── models/                     # Canonical data models
│   │   ├── security-event.js
│   │   ├── software-system.js
│   │   ├── security-container.js
│   │   ├── tag.js
│   │   ├── comment.js
│   │   ├── work-item-link.js
│   │   ├── event-correlation.js
│   │   └── index.js
│   │
│   ├── storage/                    # SQLite storage layer
│   │   ├── storage.js              # IStorage implementation
│   │   ├── migrations/
│   │   │   ├── 001-initial.js
│   │   │   └── ...
│   │   ├── queries/                # SQL query builders
│   │   │   ├── events.js
│   │   │   ├── systems.js
│   │   │   └── ...
│   │   └── index.js
│   │
│   ├── sync/                       # Sync engine
│   │   ├── sync-engine.js
│   │   ├── scheduler.js
│   │   ├── conflict-resolver.js
│   │   └── index.js
│   │
│   ├── signals/                    # Signal system
│   │   ├── signal-hub.js
│   │   ├── signal-types.js
│   │   └── index.js
│   │
│   ├── plugins/                    # Plugin management
│   │   ├── plugin-loader.js
│   │   ├── source-manager.js
│   │   ├── tracker-manager.js
│   │   └── index.js
│   │
│   ├── settings/                   # Settings management
│   │   ├── settings-manager.js
│   │   ├── credential-store.js    # Encrypted storage
│   │   └── index.js
│   │
│   ├── interfaces/                 # TypeScript-style interfaces (JSDoc)
│   │   ├── security-source.js      # ISecuritySource
│   │   ├── work-tracker.js         # IWorkTracker
│   │   └── index.js
│   │
│   └── utils/
│       ├── uuid.js
│       ├── logger.js
│       ├── crypto.js               # Encryption helpers
│       └── validation.js
│
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/

# Separate plugin packages (examples, not part of core)
@metanull/siem-source-azdo/
@metanull/siem-source-asoc/
@metanull/siem-source-detectify/
@metanull/siem-tracker-jira/
@metanull/siem-tracker-github/
@metanull/siem-client-cli/
@metanull/siem-client-tui/
@metanull/siem-client-web/
```

---

## 15. Testing Strategy

### 15.1 Core Testing

| Layer | Test Type | What to Test |
|-------|-----------|--------------|
| **Models** | Unit | Validation, normalization |
| **Storage** | Integration | CRUD, queries, migrations |
| **Sync Engine** | Unit + Integration | Merge logic, conflict detection |
| **Signal Hub** | Unit | Emission, subscription |
| **Plugin Loader** | Integration | Discovery, loading, error handling |
| **Settings** | Unit | Encryption, retrieval |

### 15.2 Plugin Testing

Each plugin tests its own:
- API client behavior
- Data normalization
- State/severity mapping
- Error handling

### 15.3 Mock Source for Testing

```javascript
// @metanull/siem-source-mock — for Core testing
export function createMockSource(options = {}) {
  return {
    id: 'mock',
    name: 'Mock Source',
    version: '1.0.0',
    capabilities: {
      hasContainers: true,
      canUpdateSeverity: false,
      canAddComments: false,
      canFetchComments: false,
      supportedEventTypes: ['vulnerability'],
      stateMapping: { open: 'Open', resolved: 'Closed', dismissed: 'Dismissed' },
    },
    
    async initialize(config) { /* no-op */ },
    async dispose() { /* no-op */ },
    async testConnection() { return { connected: true }; },
    
    async fetchSoftwareSystems() {
      return options.systems || [
        { id: 'sys-1', name: 'System 1', raw: {} }
      ];
    },
    
    async fetchContainers(systemId) {
      return options.containers || [];
    },
    
    async fetchEvents(systemId, containerId) {
      return options.events || [
        { id: 'evt-1', systemId, title: 'Test Event', severity: 'high', state: 'open', type: 'vulnerability', raw: {} }
      ];
    },
    
    async updateEventState(systemId, eventId, state, comment) {
      options.onUpdateState?.({ systemId, eventId, state, comment });
    },
  };
}
```

---

## 16. Scope & Non-Goals

### 16.1 In Scope (This Design)

| Item | Description |
|------|-------------|
| **Core package** | @metanull/siem-core with storage, sync, signals, plugin system |
| **Interfaces** | ISecuritySource, IWorkTracker, full API |
| **Plugin system** | Discovery, loading, lifecycle |
| **Data models** | All canonical models with validation |
| **Storage** | SQLite implementation with migrations |
| **Settings** | Credential storage, proxy config |
| **Signal system** | Framework-agnostic pub/sub |

### 16.2 Not In Scope (Separate Packages)

| Item | Description |
|------|-------------|
| **Source plugins** | @metanull/siem-source-azdo, @metanull/siem-source-asoc, etc. |
| **Tracker plugins** | @metanull/siem-tracker-jira, @metanull/siem-tracker-github |
| **Client applications** | @metanull/siem-client-cli, @metanull/siem-client-tui |
| **Web server** | @metanull/siem-server (future) |
| **Web UI** | @metanull/siem-client-web (future) |

### 16.3 Explicit Non-Goals

- **Multi-user / multi-tenant** — Single user, local app
- **API server** — Not now; future thin wrapper if needed
- **Cloud deployment** — Local desktop application
- **Real-time streaming** — Background polling is sufficient
- **Backward compatibility** — New app, fresh start

---

## Appendix A: Complete ISecuritySource Example

```javascript
// Full example of how a source plugin would be implemented

/**
 * Azure DevOps Security Source Plugin
 * @implements {ISecuritySource}
 */
export class AzdoSource {
  static id = 'azdo';
  static name = 'Azure DevOps Advanced Security';
  static version = '1.0.0';

  constructor() {
    this.client = null;
    this.config = null;
  }

  get id() { return AzdoSource.id; }
  get name() { return AzdoSource.name; }
  get version() { return AzdoSource.version; }

  get capabilities() {
    return {
      hasContainers: true,           // Has repositories
      canUpdateSeverity: false,      // AZDO doesn't support
      canAddComments: true,          // Can add dismissal comments
      canFetchComments: false,       // Can't fetch existing
      supportedEventTypes: ['vulnerability', 'secret', 'dependency', 'license'],
      stateMapping: {
        open: 'Active',
        acknowledged: 'Active',      // No direct mapping
        in_progress: 'Active',
        resolved: 'Fixed',
        dismissed: 'Dismissed',
      },
    };
  }

  async initialize(config) {
    this.config = config;
    this.client = new AzdoClient({
      organization: config.credentials.organization,
      pat: config.credentials.pat,
      proxy: config.proxy,
    });
  }

  async dispose() {
    this.client = null;
  }

  async testConnection() {
    try {
      const org = await this.client.getOrganization();
      return {
        connected: true,
        user: org.authenticatedUser,
        details: { instanceId: org.instanceId },
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async fetchSoftwareSystems() {
    const projects = await this.client.listProjects();
    return projects.map(p => ({
      id: p.id,
      name: p.name,
      raw: p,
    }));
  }

  async fetchContainers(systemId) {
    const repos = await this.client.listRepositories(systemId);
    return repos.map(r => ({
      id: r.id,
      systemId,
      name: r.name,
      type: 'repository',
      raw: r,
    }));
  }

  async fetchEvents(systemId, containerId) {
    const alerts = await this.client.listAlerts(systemId, containerId);
    return alerts.map(a => ({
      id: String(a.alertId),
      systemId,
      containerId,
      title: a.title || a.ruleName,
      severity: this.mapSeverityFromSource(a.severity),
      state: this.mapStateFromSource(a.state),
      type: this.mapTypeFromSource(a.alertType),
      raw: a,
    }));
  }

  async fetchEventDetail(systemId, eventId) {
    const alert = await this.client.getAlert(systemId, eventId, { expand: true });
    return {
      id: String(alert.alertId),
      systemId,
      containerId: alert.repositoryId,
      title: alert.title || alert.ruleName,
      severity: this.mapSeverityFromSource(alert.severity),
      state: this.mapStateFromSource(alert.state),
      type: this.mapTypeFromSource(alert.alertType),
      raw: alert,
    };
  }

  async updateEventState(systemId, eventId, newState, comment) {
    const sourceState = this.capabilities.stateMapping[newState];
    await this.client.updateAlert(systemId, eventId, {
      state: sourceState,
      dismissalComment: comment,
    });
  }

  // Private mapping methods
  mapSeverityFromSource(sourceSeverity) {
    const map = {
      0: 'low',       // Low
      1: 'medium',    // Medium
      2: 'high',      // High
      3: 'critical',  // Critical
    };
    return map[sourceSeverity] || 'medium';
  }

  mapStateFromSource(sourceState) {
    const map = {
      1: 'open',      // Active
      2: 'dismissed', // Dismissed
      4: 'resolved',  // Fixed
    };
    return map[sourceState] || 'open';
  }

  mapTypeFromSource(sourceType) {
    const map = {
      1: 'dependency',
      2: 'secret',
      3: 'vulnerability',
      4: 'license',
    };
    return map[sourceType] || 'vulnerability';
  }
}

// Plugin entry point
export function createPlugin() {
  return new AzdoSource();
}

export const pluginInfo = {
  id: AzdoSource.id,
  name: AzdoSource.name,
  type: 'source',
  version: AzdoSource.version,
};
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Core** | The central component that stores data and coordinates plugins |
| **Source** | Plugin that fetches security data from an external provider |
| **Tracker** | Plugin that creates/manages work items in external systems |
| **Client** | Application that interacts with Core (CLI, TUI, Web) |
| **Signal** | Notification emitted by Core when something changes |
| **Dirty** | A record with local changes pending sync to source |
| **Canonical Model** | Normalized data structure used by Core |
| **Normalization** | Converting source-specific data to canonical models |

---

**Document End**
