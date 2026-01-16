# Lab Scripts Refactoring - Implementation Summary

## ✅ Refactoring Complete

8 new self-contained scripts have been created to replace 15 existing scripts.

## New Scripts Created

All scripts are:
- ✅ **Self-contained** (no dependencies on azdo-auth.js or other shared files)
- ✅ **Package-only** (use azure-devops-node-api exclusively, no direct REST calls)
- ✅ **Simple** (clear, educational, easy to understand)
- ✅ **Properly documented** (JSDoc headers explaining purpose and APIs used)

### Script Mapping

| New Script | Replaces | Purpose |
|------------|----------|---------|
| `azdo-00-connect-new.js` | `azdo-00-connect.js` | Test basic connection |
| `azdo-01-check-apis-new.js` | `azdo-01-check-client-apis.js` | Discover available API methods |
| `azdo-02-config-new.js` | `azdo-02-config.js` | Get connection and org config |
| `azdo-03-list-projects-new.js` | `azdo-03-list-projects.js` | List all projects |
| `azdo-04-list-repos-new.js` | `azdo-04-list-repos.js` | List repositories |
| `azdo-05-alert-api-new.js` | `azdo-05-1-validate-enablement.js`<br>`azdo-05-adv-check-client.js`<br>`azdo-05-adv-enablement-authoritative.js`<br>`azdo-05-adv-enablement-endpoints-check.js` | Test Alert API availability |
| `azdo-06-list-alerts-new.js` | `azdo-06-list-alerts.js`<br>`azdo-06-alerts-client.js`<br>`azdo-06-alerts-client-all.js` | List Advanced Security alerts |
| `azdo-07-filter-alerts-new.js` | `azdo-07-filter-alert-rest.js`<br>`azdo-07-filter-alert-client.js`* | Demonstrate alert filtering |

*Note: `azdo-07-filter-alert-client.js` was already fixed to use package APIs correctly and serves as the basis for the new script.

## Scripts Removed from Scope

The following scripts are NOT numbered and remain as-is (they serve different purposes):
- `azdo-auth.js` - Shared utilities (can be kept for reference)
- `azdo-adv.js` - Advanced use case
- `azdo-adv-alerts.js` - Advanced use case
- `azdo-repos.js` - Specific repo operations
- `azdo-token-check.js` - Token validation

## Package API Coverage

### ✅ Available and Used
- **AlertApi** - Advanced Security Alerts (azdo-05, 06, 07)
- **CoreApi** - Projects and teams (azdo-02, 03, 04, 05, 06, 07)
- **GitApi** - Repositories (azdo-04, 05, 06, 07)
- **WebApi** - Connection and introspection (azdo-00, 01, 02)

### ❌ NOT Available in Package
- **Advanced Security Management API** - Enablement settings
  - Organization enablement
  - Project enablement  
  - Repository enablement
  - Configuration management

These features require direct REST API calls to:
- `https://advsec.dev.azure.com/{org}/_apis/management/enablement`
- `https://advsec.dev.azure.com/{org}/{project}/_apis/management/enablement`
- `https://advsec.dev.azure.com/{org}/{project}/_apis/advancedsecurity/repositories/{repoId}/settings`

## Key Features of New Scripts

### 1. Self-Contained Connection Logic
Every script includes its own connection function:

```javascript
async function main() {
  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR;
  const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN;
  
  if (!orgUrl || !pat) {
    throw new Error('Missing required environment variables');
  }
  
  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const conn = new azdev.WebApi(orgUrl, authHandler);
  await conn.connect();
  
  // ... script logic
}
```

### 2. Environment Variable Support
All scripts support:
- `AZDO_ORG_URL` or `AZDO_OR` - Organization URL
- `AZDO_PAT` or `AZDO_PERSONAL_ACCESS_TOKEN` - Personal Access Token
- `AZDO_PROJECT` - Optional target project (where applicable)

### 3. Clear Error Handling
Consistent error handling pattern:

```javascript
try {
  // ... logic
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
```

### 4. Educational Output
Each script provides informative console output showing:
- What API is being used
- What data is being retrieved
- Summary statistics
- Example results

## Testing Recommendations

Test each script in sequence to learn the APIs progressively:

```bash
# 1. Test connection
node lab/azdo-00-connect-new.js

# 2. Discover available APIs
node lab/azdo-01-check-apis-new.js

# 3. Get org configuration
node lab/azdo-02-config-new.js

# 4. List projects
node lab/azdo-03-list-projects-new.js

# 5. List repositories
node lab/azdo-04-list-repos-new.js
# Or specify project:
AZDO_PROJECT="MyProject" node lab/azdo-04-list-repos-new.js

# 6. Test Alert API
node lab/azdo-05-alert-api-new.js

# 7. List alerts
node lab/azdo-06-list-alerts-new.js

# 8. Demonstrate filtering
AZDO_PROJECT="Agora" node lab/azdo-07-filter-alerts-new.js
```

## Migration Path

### Phase 1: Validation (Current)
- ✅ New scripts created
- ⏳ Test all new scripts
- ⏳ Compare output with old scripts

### Phase 2: Transition
- Add README documenting new scripts
- Add deprecation warnings to old scripts
- Update any external documentation

### Phase 3: Cleanup
- Archive old scripts to `lab/deprecated/`
- Rename new scripts (remove `-new` suffix)
- Update `azdo-auth.js` with deprecation notice

## Important Notes

### Advanced Security Limitations
The `azdo-05-alert-api-new.js` script documents an important limitation:

> **Advanced Security MANAGEMENT APIs are NOT available in azure-devops-node-api**
> 
> Only the Alert APIs (getAlertApi) are available for:
> - Listing alerts
> - Getting alert details
> - Filtering alerts
> - Updating alert state
>
> Management operations (checking/setting enablement) require direct REST calls.

This is documented in the script itself to help users understand the package's capabilities.

### Why This Refactoring Matters

1. **Educational Value**: Each script is a standalone example of how to use specific APIs
2. **Maintainability**: No shared dependencies means each script is independent
3. **Correctness**: Using package APIs instead of REST ensures compatibility with API changes
4. **Simplicity**: Clear, focused scripts are easier to understand and modify
5. **Discoverability**: Progressive numbering makes it easy to learn step-by-step

## Files Created

- ✅ `lab/REFACTORING_PLAN.md` - Detailed analysis and planning document
- ✅ `lab/REFACTORING_SUMMARY.md` - This implementation summary
- ✅ `lab/azdo-00-connect-new.js`
- ✅ `lab/azdo-01-check-apis-new.js`
- ✅ `lab/azdo-02-config-new.js`
- ✅ `lab/azdo-03-list-projects-new.js`
- ✅ `lab/azdo-04-list-repos-new.js`
- ✅ `lab/azdo-05-alert-api-new.js`
- ✅ `lab/azdo-06-list-alerts-new.js`
- ✅ `lab/azdo-07-filter-alerts-new.js`

## Next Steps

1. **Test the new scripts** with your Azure DevOps environment
2. **Review the output** to ensure they meet your needs
3. **Decide on migration timeline** for transitioning away from old scripts
4. **Update documentation** as needed
5. **Consider renaming** old scripts to `.deprecated.js` or moving to `lab/deprecated/`
