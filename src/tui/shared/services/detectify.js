/**
 * Detectify Service Wrapper for TUI
 * Provides UI-specific helpers and audit logging for write operations
 */

import { DetectifyService as ParentDetectifyService, VulnerabilityStatus, StatusAction } from '../../../services/detectify-service.js';
import { auditService } from '../../shared/utils/audit.js';
import logger from '../../../utils/logger.js';
import { Config } from '../../../utils/config.js';

export { VulnerabilityStatus, StatusAction };

export class DetectifyService {
  /**
   * @param {string|null} configPath - Optional path to config file
   */
  constructor(configPath = null) {
    this.config = configPath ? Config.loadFromFile(configPath) : new Config();
    this.service = new ParentDetectifyService();

    logger.info('TUI DetectifyService initialized', {
      hasApiKey: !!process.env.DETECTIFY_API_KEY,
      baseUrl: process.env.DETECTIFY_BASE_URL || 'https://api.detectify.com',
    });
  }

  // ==========================================
  // Delegated Read Methods (no modification)
  // ==========================================

  /**
   * Test connection to Detectify API
   * @returns {Promise<boolean>} True if connected successfully
   */
  async testConnection() {
    return this.service.testConnection();
  }

  /**
   * Retrieves all assets from Detectify
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Response with assets array
   */
  async listAssets(options = {}) {
    return this.service.listAssets(options);
  }

  /**
   * Get all assets (handles pagination)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All assets
   */
  async getAllAssets(options = {}) {
    return this.service.getAllAssets(options);
  }

  /**
   * Retrieves vulnerabilities from Detectify
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Response with vulnerabilities array and pagination
   */
  async listVulnerabilities(options = {}) {
    return this.service.listVulnerabilities(options);
  }

  /**
   * Get all vulnerabilities (handles pagination)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} All vulnerabilities
   */
  async getAllVulnerabilities(options = {}) {
    return this.service.getAllVulnerabilities(options);
  }

  /**
   * Retrieves a specific vulnerability
   * @param {string} uuid - Vulnerability UUID
   * @returns {Promise<Object>} Vulnerability object
   */
  async getVulnerability(uuid) {
    return this.service.getVulnerability(uuid);
  }

  /**
   * Get vulnerability summary statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Summary with counts
   */
  async getVulnerabilitySummary(options = {}) {
    return this.service.getVulnerabilitySummary(options);
  }

  // ==========================================
  // Write Methods (with audit logging)
  // ==========================================

  /**
   * Set vulnerability status to accepted_risk
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async setAcceptedRisk(uuid, context = {}) {
    logger.info('Setting vulnerability to accepted_risk', { uuid, ...context });
    
    const result = await this.service.setAcceptedRisk(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: context.oldStatus || 'unknown',
      newStatus: 'accepted_risk',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Unset accepted_risk status
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async unsetAcceptedRisk(uuid, context = {}) {
    logger.info('Unsetting accepted_risk status', { uuid, ...context });
    
    const result = await this.service.unsetAcceptedRisk(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: 'accepted_risk',
      newStatus: 'active',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Set vulnerability status to false_positive
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async setFalsePositive(uuid, context = {}) {
    logger.info('Setting vulnerability to false_positive', { uuid, ...context });
    
    const result = await this.service.setFalsePositive(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: context.oldStatus || 'unknown',
      newStatus: 'false_positive',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Unset false_positive status
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async unsetFalsePositive(uuid, context = {}) {
    logger.info('Unsetting false_positive status', { uuid, ...context });
    
    const result = await this.service.unsetFalsePositive(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: 'false_positive',
      newStatus: 'active',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Set vulnerability status to patched (fixed)
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async setFixed(uuid, context = {}) {
    logger.info('Setting vulnerability to patched', { uuid, ...context });
    
    const result = await this.service.setFixed(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: context.oldStatus || 'unknown',
      newStatus: 'patched',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Unset patched status
   * @param {string} uuid - Vulnerability UUID
   * @param {Object} context - Context for audit logging
   * @returns {Promise<Object>} Response
   */
  async unsetFixed(uuid, context = {}) {
    logger.info('Unsetting patched status', { uuid, ...context });
    
    const result = await this.service.unsetFixed(uuid);
    
    auditService.logStatusChange({
      source: 'detectify',
      vulnerabilityId: uuid,
      oldStatus: 'patched',
      newStatus: 'active',
      title: context.title,
      host: context.host,
    });
    
    return result;
  }

  /**
   * Update vulnerability status (convenience method)
   * @param {string} uuid - Vulnerability UUID
   * @param {string} targetStatus - Target status: accepted_risk, false_positive, patched, or active
   * @param {Object} context - Context for audit logging (should include currentStatus)
   * @returns {Promise<Object>} Response
   */
  async updateStatus(uuid, targetStatus, context = {}) {
    const currentStatus = context.currentStatus || context.oldStatus;
    const normalizedTarget = targetStatus.toLowerCase().replace(/[_-]/g, '');
    
    // If reverting to active, need to unset current status
    if (normalizedTarget === 'active') {
      if (currentStatus === 'accepted_risk') {
        return this.unsetAcceptedRisk(uuid, context);
      } else if (currentStatus === 'false_positive') {
        return this.unsetFalsePositive(uuid, context);
      } else if (currentStatus === 'patched') {
        return this.unsetFixed(uuid, context);
      }
      // Already active, nothing to do
      return { success: true, noChange: true };
    }

    // If already in a resolved state, unset first
    if (['accepted_risk', 'false_positive', 'patched'].includes(currentStatus)) {
      if (currentStatus === 'accepted_risk') {
        await this.service.unsetAcceptedRisk(uuid);
      } else if (currentStatus === 'false_positive') {
        await this.service.unsetFalsePositive(uuid);
      } else if (currentStatus === 'patched') {
        await this.service.unsetFixed(uuid);
      }
    }

    // Now set the target status
    if (normalizedTarget === 'acceptedrisk') {
      return this.setAcceptedRisk(uuid, context);
    } else if (normalizedTarget === 'falsepositive') {
      return this.setFalsePositive(uuid, context);
    } else if (normalizedTarget === 'patched' || normalizedTarget === 'fixed') {
      return this.setFixed(uuid, context);
    }

    throw new Error(`Invalid target status: ${targetStatus}`);
  }
}

export default DetectifyService;
