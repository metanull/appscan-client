# Lab Scripts Refactoring Plan

## Current State Analysis

### Script Inventory

#### azdo-00-connect.js
- **Purpose**: Test basic connection to Azure DevOps
- **Dependencies**: ❌ azdo-auth.js
- **Uses Package**: ✅ Via azdo-auth.js
- **Uses REST**: ❌ No
- **Self-contained**: ❌ No

#### azdo-01-check-client-apis.js
- **Purpose**: Discover all available API methods
- **Dependencies**: ❌ azdo-auth.js
- **Uses Package**: ✅ Via azdo-auth.js
- **Uses REST**: ❌ No
- **Self-contained**: ❌ No

#### azdo-02-config.js
- **Purpose**: Get basic connection and configuration info
- **Dependencies**: ❌ azdo-auth.js
- **Uses Package**: ✅ Via azdo-auth.js
- **Uses REST**: ❌ No
- **Self-contained**: ❌ No

#### azdo-03-list-projects.js
- **Purpose**: List Azure DevOps projects
- **Dependencies**: ❌ azdo-auth.js
- **Uses Package**: ✅ Via azdo-auth.js
- **Uses REST**: ❌ No
- **Self-contained**: ❌ No

#### azdo-04-list-repos.js
- **Purpose**: List repositories for first project
- **Dependencies**: ❌ azdo-auth.js
- **Uses Package**: ✅ Via azdo-auth.js
- **Uses REST**: ❌ No
- **Self-contained**: ❌ No

#### azdo-05-* (MULTIPLE VERSIONS - 4 files)
- **azdo-05-1-validate-enablement.js**
  - Purpose: Validate Advanced Security enablement using helpers
  - Dependencies: ❌ azdo-auth.js (getOrgEnablement, getProjectEnablement, getRepoEnablement)
  - Uses Package: ✅ Via azdo-auth.js
  - Uses REST: ✅ Via azdo-auth.js helpers (which use REST)
  - Self-contained: ❌ No

- **azdo-05-adv-check-client.js** (renamed from original)
  - Purpose: Check if SDK exposes Advanced Security APIs
  - Dependencies: ❌ azdo-auth.js
  - Uses Package: ✅ Via azdo-auth.js
  - Uses REST: ❌ No
  - Self-contained: ❌ No
  - **NOTE**: This was the script we just refactored!

- **azdo-05-adv-enablement-authoritative.js**
  - Purpose: Authoritative Advanced Security enablement reporter using REST
  - Dependencies: ❌ azdo-auth.js
  - Uses Package: ✅ Via azdo-auth.js
  - Uses REST: ✅ Yes (conn.rest.get)
  - Self-contained: ❌ No

- **azdo-05-adv-enablement-endpoints-check.js**
  - Purpose: Check Advanced Security enablement endpoints
  - Dependencies: ❌ azdo-auth.js
  - Uses Package: ✅ Via azdo-auth.js
  - Uses REST: ✅ Yes (conn.rest.get)
  - Self-contained: ❌ No

#### azdo-06-* (MULTIPLE VERSIONS - 3 files)
- **azdo-06-list-alerts.js**
  - Purpose: List Advanced Security alerts for first repo
  - Dependencies: ❌ azdo-auth.js
  - Uses Package: ✅ Via azdo-auth.js
  - Uses REST: ✅ Yes (conn.rest.get for alerts)
  - Self-contained: ❌ No

- **azdo-06-alerts-client.js**
  - Purpose: List alerts using REST via WebApi client
  - Dependencies: ❌ No (self-contained getAzdoClient)
  - Uses Package: ✅ Yes
  - Uses REST: ✅ Yes (conn.rest.get)
  - Self-contained: ✅ Yes (has own getAzdoClient function)

- **azdo-06-alerts-client-all.js**
  - Purpose: Fetch ALL alerts with pagination
  - Dependencies: ❌ No (self-contained getAzdoClient)
  - Uses Package: ✅ Yes
  - Uses REST: ✅ Yes (conn.rest.get with continuation tokens)
  - Self-contained: ✅ Yes (has own getAzdoClient function)

#### azdo-07-* (MULTIPLE VERSIONS - 2 files)
- **azdo-07-filter-alert-rest.js**
  - Purpose: Exercise Advanced Security Alerts filters using REST
  - Dependencies: ❌ No (self-contained getAzdoClient)
  - Uses Package: ✅ Yes
  - Uses REST: ✅ Yes (many conn.rest.get calls)
  - Self-contained: ✅ Yes

- **azdo-07-filter-alert-client.js**
  - Purpose: Exercise Advanced Security Alerts filters using AlertApi
  - Dependencies: ❌ No (self-contained getAzdoClient)
  - Uses Package: ✅ Yes (uses getAlertApi())
  - Uses REST: ❌ No (uses package API)
  - Self-contained: ✅ Yes
  - **NOTE**: This was the script we just fixed!

### Issues Identified

1. **Dependency on azdo-auth.js**: Most scripts (00-06) depend on shared utility file
2. **Multiple versions per number**: Scripts 05, 06, and 07 have multiple variants
3. **Mixed REST/Package usage**: Some scripts use REST even when package APIs exist
4. **Inconsistent patterns**: Some scripts are self-contained, others aren't
5. **Advanced Security confusion**: Multiple 05 scripts try different approaches for same goal

---

## Refactoring Proposal

### Goals
- ✅ One script per number
- ✅ Self-contained (no dependencies)
- ✅ Use package APIs exclusively (no direct REST calls)
- ✅ Simple and educational

### New Scripts to Create

#### ✅ azdo-00-connect-new.js
**Purpose**: Test basic connection to Azure DevOps
**Approach**: Inline connection logic, use WebApi.connect()
**Package APIs**: WebApi.connect()

#### ✅ azdo-01-check-apis-new.js
**Purpose**: Discover and verify all available API methods
**Approach**: Keep existing logic but make self-contained
**Package APIs**: WebApi introspection + test instantiation

#### ✅ azdo-02-config-new.js
**Purpose**: Get basic connection and organization configuration
**Approach**: Use CoreApi to get projects and connection data
**Package APIs**: WebApi.connect(), getCoreApi(), getProjects()

#### ✅ azdo-03-list-projects-new.js
**Purpose**: List all Azure DevOps projects
**Approach**: Use CoreApi
**Package APIs**: getCoreApi(), getProjects()

#### ✅ azdo-04-list-repos-new.js
**Purpose**: List repositories for a project
**Approach**: Use GitApi
**Package APIs**: getCoreApi(), getGitApi(), getRepositories()

#### ⚠️ azdo-05-advanced-security-new.js
**Purpose**: Check Advanced Security API availability and test basic operations
**Approach**: **PROBLEM - No package API for Advanced Security Management/Enablement!**
**Options**:
  1. Skip this script (Advanced Security management not in package)
  2. Document that management API requires REST calls
  3. Focus on what IS available: AlertApi
**Recommended**: Check if AlertApi exists, show it works

#### ✅ azdo-06-list-alerts-new.js
**Purpose**: List Advanced Security alerts for repositories
**Approach**: Use AlertApi.getAlerts()
**Package APIs**: getAlertApi(), getAlerts()

#### ✅ azdo-07-filter-alerts-new.js
**Purpose**: Demonstrate alert filtering and search capabilities
**Approach**: Use AlertApi.getAlerts() with criteria parameter
**Package APIs**: getAlertApi(), getAlerts() with SearchCriteria
**Note**: Already implemented correctly in azdo-07-filter-alert-client.js

---

## Implementation Details

### Common Pattern for All Scripts

```javascript
#!/usr/bin/env node
import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

/**
 * Create and connect to Azure DevOps WebApi client
 * Reads from .env: AZDO_ORG_URL, AZDO_PAT
 */
async function connect() {
  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR;
  const pat = process.env.AZDO_PAT;
  
  if (!orgUrl || !pat) {
    throw new Error('Missing env vars: AZDO_ORG_URL and AZDO_PAT required');
  }
  
  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

(async function main() {
  try {
    const conn = await connect();
    
    // Script-specific logic here
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
```

### Script-Specific Notes

#### azdo-05 Challenge
The Advanced Security **Management** APIs (for checking/configuring enablement) are NOT available in the azure-devops-node-api package. Only the **Alert** APIs are available.

**Options**:
1. **Rename azdo-05**: Focus on "Alert API Discovery" instead of enablement
2. **Document limitation**: Note that management requires REST calls
3. **Use existing working script**: azdo-05-adv-check-client.js already does this well

**Recommendation**: Create `azdo-05-alert-api-new.js` that:
- Tests if getAlertApi() exists
- Creates an AlertApi instance
- Shows basic alert retrieval
- Documents that management APIs require REST

#### azdo-06 vs azdo-07
- **06**: Simple alert listing (basic getAlerts call)
- **07**: Advanced filtering and criteria (complex getAlerts with parameters)

This distinction makes sense and should be preserved.

---

## Migration Strategy

### Phase 1: Create New Scripts
1. Create all `*-new.js` scripts in lab/ directory
2. Test each new script individually
3. Document any limitations found

### Phase 2: Validation
1. Run all new scripts to ensure they work
2. Compare output with old scripts
3. Document differences

### Phase 3: Deprecation
1. Add deprecation notices to old scripts
2. Update any documentation
3. Eventually remove old scripts

---

## Files to Create

1. `lab/azdo-00-connect-new.js` - Replace azdo-00-connect.js
2. `lab/azdo-01-check-apis-new.js` - Replace azdo-01-check-client-apis.js
3. `lab/azdo-02-config-new.js` - Replace azdo-02-config.js
4. `lab/azdo-03-list-projects-new.js` - Replace azdo-03-list-projects.js
5. `lab/azdo-04-list-repos-new.js` - Replace azdo-04-list-repos.js
6. `lab/azdo-05-alert-api-new.js` - Replace all azdo-05-* variants (4 files)
7. `lab/azdo-06-list-alerts-new.js` - Replace all azdo-06-* variants (3 files)
8. `lab/azdo-07-filter-alerts-new.js` - Can reuse azdo-07-filter-alert-client.js

**Total**: 7-8 new scripts to replace 15 existing scripts

---

## Key Findings

### Package API Availability

✅ **Available in Package**:
- AlertApi (Advanced Security Alerts)
- BuildApi
- CoreApi (Projects)
- GitApi (Repositories)
- And 27 others

❌ **NOT Available in Package**:
- Advanced Security Management API (enablement settings)
- Advanced Security configuration/settings endpoints

### REST API Requirements

Some Azure DevOps features require REST calls because they're not exposed in the package:
- Advanced Security enablement/configuration
- Some advanced filtering options
- Newer preview APIs

**Decision**: Focus new scripts on what's available in the package. Document REST requirements where needed.
