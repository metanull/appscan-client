/**
 * Detectify Service
 * Handles interactions with Detectify APIs for vulnerability management
 * 
 * Detectify API Documentation: https://developer.detectify.com/v2
 * 
 * Key Concepts:
 * - Assets: Domains/IPs being monitored
 * - Vulnerabilities: Security findings detected across all assets
 * - Statuses: active, new, patched, regression, accepted_risk, false_positive
 */

import { getAxiosProxyConfig } from '../utils/proxy-config.js';

/**
 * Vulnerability Status enum
 * @readonly
 * @enum {string}
 */
export const VulnerabilityStatus = {
  Active: 'active',
  New: 'new',
  Patched: 'patched',
  Regression: 'regression',
  AcceptedRisk: 'accepted_risk',
  FalsePositive: 'false_positive',
};

/**
 * Severity enum (CVSS v2/v3)
 * @readonly
 * @enum {string}
 */
export const Severity = {
  Information: 'information',
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
};

/**
 * Scan Source enum
 * @readonly
 * @enum {string}
 */
export const ScanSource = {
  AssetMonitoring: 'asset-monitoring',
  DeepScan: 'deep-scan',
  ApplicationScanning: 'application-scanning',
  SurfaceMonitoring: 'surface-monitoring',
  ApiScanning: 'api-scanning',
};

/**
 * Status action types for updateVulnerabilityStatus
 * @readonly
 * @enum {string}
 */
export const StatusAction = {
  SetAcceptedRisk: 'setacceptedriskstatus',
  UnsetAcceptedRisk: 'unsetacceptedriskstatus',
  SetFalsePositive: 'setfalsepositivestatus',
  UnsetFalsePositive: 'unsetfalsepositivestatus',
  SetFixed: 'setfixedstatus',
  UnsetFixed: 'unsetfixedstatus',
};

export class DetectifyService {
  /**
   * Create DetectifyService instance
   * @param {Object} [config] - Configuration object
   * @param {string} [config.apiKey] - Detectify API key
   * @param {string} [config.baseUrl] - Detectify API base URL
   */
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.DETECTIFY_API_KEY;
    this.baseUrl = config.baseUrl || process.env.DETECTIFY_BASE_URL || 'https://api.detectify.com';
    this.proxyConfig = undefined;
  }

  /**
   * Initialize the service (load proxy config, validate credentials)
   * @returns {Promise<void>}
   */
  async connect() {
    if (!this.apiKey) {
      throw new Error(
        'Missing Detectify API key. Set DETECTIFY_API_KEY environment variable.'
      );
    }
    
    // Pre-load proxy configuration
    if (!this.proxyConfig) {
      this.proxyConfig = await getAxiosProxyConfig();
    }
  }

  /**
   * Make an authenticated request to the Detectify API
   * @private
   * @param {string} endpoint - API endpoint (e.g., '/rest/v2/vulnerabilities/')
   * @param {Object} [options] - Fetch options
   * @returns {Promise<Object|null>} Response data or null for empty responses
   */
  async _request(endpoint, options = {}) {
    await this.connect();
    
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'X-Detectify-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const fetchOptions = {
      ...options,
      headers,
    };

    // Apply proxy if configured (for Node.js fetch with agent)
    // Note: Native fetch doesn't support proxy directly; use undici or node-fetch for proxy support
    
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `Detectify API error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error?.message) {
          errorMessage = `Detectify API error: ${errorJson.error.message} (code: ${errorJson.error.code})`;
        }
      } catch {
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    return { success: true, status: response.status };
  }

  /**
   * Build query string from parameters
   * @private
   * @param {Object} params - Query parameters
   * @returns {string} Query string (without leading ?)
   */
  _buildQueryString(params) {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      
      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, item);
        }
      } else {
        searchParams.append(key, value);
      }
    }
    
    return searchParams.toString();
  }

  // ==================== Assets ====================

  /**
   * List root assets (domains/IPs)
   * @param {Object} [options] - Options
   * @param {number} [options.pageSize=100] - Page size
   * @param {string} [options.marker] - Pagination marker
   * @param {string} [options.from] - Filter by creation date (ISO 8601)
   * @param {boolean} [options.includeSubdomains=false] - Include subdomains
   * @returns {Promise<Object>} Response with assets array and pagination info
   */
  async listAssets(options = {}) {
    const params = {
      pageSize: options.pageSize || 100,
      marker: options.marker,
      from: options.from,
      include_subdomains: options.includeSubdomains,
    };
    
    const queryString = this._buildQueryString(params);
    const endpoint = `/rest/v2/assets/${queryString ? '?' + queryString : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get all assets (handles pagination automatically)
   * @param {Object} [options] - Options
   * @param {boolean} [options.includeSubdomains=false] - Include subdomains
   * @returns {Promise<Array>} All assets
   */
  async getAllAssets(options = {}) {
    const allAssets = [];
    let marker;
    
    do {
      const response = await this.listAssets({
        ...options,
        marker,
        pageSize: 100,
      });
      
      if (response.assets) {
        allAssets.push(...response.assets);
      }
      
      marker = response.has_more ? response.next_marker : undefined;
    } while (marker);
    
    return allAssets;
  }

  // ==================== Vulnerabilities ====================

  /**
   * List vulnerabilities with filtering
   * @param {Object} [options] - Filter options
   * @param {number} [options.pageSize=100] - Page size (max 100)
   * @param {string} [options.marker] - Pagination marker
   * @param {string[]} [options.severity] - Severity filter (information, low, medium, high)
   * @param {string[]} [options.severityV3] - CVSS v3 severity filter (includes critical)
   * @param {string[]} [options.status] - Status filter (active, new, patched, regression, accepted_risk, false_positive)
   * @param {string[]} [options.scanSource] - Scan source filter (asset-monitoring, deep-scan, application-scanning, etc.)
   * @param {string[]} [options.assetToken] - Asset token filter
   * @param {string[]} [options.host] - Host filter
   * @param {string} [options.createdAfter] - Filter by creation date (ISO 8601)
   * @param {string} [options.createdBefore] - Filter by creation date (ISO 8601)
   * @param {string} [options.updatedAfter] - Filter by update date (ISO 8601)
   * @param {string} [options.updatedBefore] - Filter by update date (ISO 8601)
   * @returns {Promise<Object>} Response with vulnerabilities array and pagination info
   */
  async listVulnerabilities(options = {}) {
    const params = {
      pageSize: options.pageSize || 100,
      marker: options.marker,
      'severity[]': options.severity,
      'severityV3[]': options.severityV3,
      'status[]': options.status,
      'scan_source[]': options.scanSource,
      'asset_token[]': options.assetToken,
      'host[]': options.host,
      created_after: options.createdAfter,
      created_before: options.createdBefore,
      updated_after: options.updatedAfter,
      updated_before: options.updatedBefore,
    };
    
    const queryString = this._buildQueryString(params);
    const endpoint = `/rest/v2/vulnerabilities/${queryString ? '?' + queryString : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get all vulnerabilities (handles pagination automatically)
   * @param {Object} [options] - Filter options (same as listVulnerabilities)
   * @param {Function} [options.onProgress] - Progress callback (fetchedCount, totalCount)
   * @param {Function} [options.onBatch] - Batch callback called with each batch of vulnerabilities for progressive loading
   * @returns {Promise<Array>} All vulnerabilities matching filters
   */
  async getAllVulnerabilities(options = {}) {
    const { onProgress, onBatch, ...filterOptions } = options;
    const allVulnerabilities = [];
    let marker;
    let totalCount;
    
    do {
      const response = await this.listVulnerabilities({
        ...filterOptions,
        marker,
        pageSize: 100,
      });
      
      if (response.vulnerabilities) {
        allVulnerabilities.push(...response.vulnerabilities);
        
        // Call batch callback for progressive loading
        if (onBatch) {
          onBatch(response.vulnerabilities, allVulnerabilities, response.total_vulnerabilities);
        }
      }
      
      if (totalCount === undefined && response.total_vulnerabilities !== undefined) {
        totalCount = response.total_vulnerabilities;
      }
      
      if (onProgress) {
        onProgress(allVulnerabilities.length, totalCount);
      }
      
      marker = response.has_more ? response.next_marker : undefined;
    } while (marker);
    
    return allVulnerabilities;
  }

  /**
   * Get vulnerability by UUID
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Vulnerability details
   */
  async getVulnerability(uuid) {
    if (!uuid) {
      throw new Error('Vulnerability UUID is required');
    }
    
    const response = await this._request(`/rest/v2/vulnerabilities/uuid/${uuid}/`);
    return response.vulnerability;
  }

  /**
   * Update vulnerability status
   * @param {string} uuid - Vulnerability UUID
   * @param {string} action - Status action (from StatusAction enum)
   * @returns {Promise<Object>} Response
   */
  async updateVulnerabilityStatus(uuid, action) {
    if (!uuid) {
      throw new Error('Vulnerability UUID is required');
    }
    
    const validActions = Object.values(StatusAction);
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
    }
    
    return this._request(`/rest/v2/vulnerabilities/uuid/${uuid}/${action}/`, {
      method: 'POST',
    });
  }

  /**
   * Set vulnerability status to "accepted_risk"
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async setAcceptedRisk(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.SetAcceptedRisk);
  }

  /**
   * Unset "accepted_risk" status (reverts to active)
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async unsetAcceptedRisk(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.UnsetAcceptedRisk);
  }

  /**
   * Set vulnerability status to "false_positive"
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async setFalsePositive(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.SetFalsePositive);
  }

  /**
   * Unset "false_positive" status (reverts to active)
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async unsetFalsePositive(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.UnsetFalsePositive);
  }

  /**
   * Set vulnerability status to "patched" (manual fix)
   * Note: This results in "patched" status, not "fixed"
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async setFixed(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.SetFixed);
  }

  /**
   * Unset "patched" status (reverts to active)
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Response
   */
  async unsetFixed(uuid) {
    return this.updateVulnerabilityStatus(uuid, StatusAction.UnsetFixed);
  }

  /**
   * Set vulnerability status by target status name
   * Convenience method that maps status names to the correct set action
   * @param {string} uuid - Vulnerability UUID
   * @param {string} status - Target status: 'accepted_risk', 'false_positive', or 'patched'/'fixed'
   * @returns {Promise<Object>} Response
   */
  async setStatus(uuid, status) {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '');
    
    switch (normalizedStatus) {
      case 'acceptedrisk':
        return this.setAcceptedRisk(uuid);
      case 'falsepositive':
        return this.setFalsePositive(uuid);
      case 'patched':
      case 'fixed':
        return this.setFixed(uuid);
      default:
        throw new Error(`Cannot set status to "${status}". Use 'accepted_risk', 'false_positive', or 'patched'/'fixed'.`);
    }
  }

  /**
   * Unset/revert vulnerability status (returns to active)
   * Convenience method that maps status names to the correct unset action
   * @param {string} uuid - Vulnerability UUID
   * @param {string} status - Status to unset: 'accepted_risk', 'false_positive', or 'patched'/'fixed'
   * @returns {Promise<Object>} Response
   */
  async unsetStatus(uuid, status) {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '');
    
    switch (normalizedStatus) {
      case 'acceptedrisk':
        return this.unsetAcceptedRisk(uuid);
      case 'falsepositive':
        return this.unsetFalsePositive(uuid);
      case 'patched':
      case 'fixed':
        return this.unsetFixed(uuid);
      default:
        throw new Error(`Cannot unset status "${status}". Use 'accepted_risk', 'false_positive', or 'patched'/'fixed'.`);
    }
  }

  // ==================== Scan Profiles ====================

  /**
   * List Application Scan Profiles
   * @returns {Promise<Array>} List of scan profiles
   */
  async listScanProfiles() {
    return this._request('/rest/v2/profiles/');
  }

  /**
   * Get scan profiles for a specific asset
   * @param {string} assetToken - Asset token
   * @returns {Promise<Array>} List of scan profiles
   */
  async getScanProfilesForAsset(assetToken) {
    if (!assetToken) {
      throw new Error('Asset token is required');
    }
    return this._request(`/rest/v2/profiles/${assetToken}/`);
  }

  // ==================== Utility Methods ====================

  /**
   * Test connection to Detectify API
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this.listAssets({ pageSize: 1 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get summary statistics for vulnerabilities
   * @param {Object} [options] - Filter options (same as listVulnerabilities)
   * @returns {Promise<Object>} Summary with counts by severity, status, etc.
   */
  async getVulnerabilitySummary(options = {}) {
    const vulnerabilities = await this.getAllVulnerabilities(options);
    
    const summary = {
      total: vulnerabilities.length,
      bySeverity: {},
      byStatus: {},
      byScanSource: {},
      byHost: {},
    };
    
    for (const vuln of vulnerabilities) {
      const severity = vuln.severity || 'unknown';
      const status = vuln.status || 'unknown';
      const scanSource = vuln.scan_source || 'unknown';
      const host = vuln.host || 'unknown';
      
      summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1;
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
      summary.byScanSource[scanSource] = (summary.byScanSource[scanSource] || 0) + 1;
      summary.byHost[host] = (summary.byHost[host] || 0) + 1;
    }
    
    return summary;
  }
}

export default DetectifyService;
