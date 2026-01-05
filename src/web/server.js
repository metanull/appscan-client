/**
 * Express server for Web UI
 * Serves the React web application and provides API endpoints
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { getEnvPath, getWebUIPath } from '../utils/config-paths.js';
import { AppScanService } from '../services/appscan-service.js';
import { JiraService } from '../services/jira-service.js';
import logger from '../tui/utils/logger.js';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config({ path: getEnvPath() });

/**
 * Middleware to handle API calls with unified error handling and service management
 * @param {Function} handler - Async handler function that receives (req, res, services)
 * @returns {Function} Express middleware
 */
function apiHandler(handler) {
  return async (req, res) => {
    const services = {
      appscan: null,
      jira: null,
    };

    try {
      // Initialize services lazily only when needed
      const getAppScanService = () => {
        if (!services.appscan) {
          services.appscan = new AppScanService();
        }
        return services.appscan;
      };

      const getJiraService = () => {
        if (!services.jira) {
          services.jira = new JiraService();
        }
        return services.jira;
      };

      // Execute the handler with service getters
      await handler(req, res, { getAppScanService, getJiraService });
    } catch (error) {
      logger.error(`API Error [${req.method} ${req.path}]:`, error);

      // Send appropriate error response
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.message || 'Internal server error',
        path: req.path,
      });
    }
  };
}

/**
 * Parse and normalize excludeStatus parameter
 * @param {string|string[]} excludeStatus - Status values to exclude
 * @returns {string[]} Array of status values
 */
function parseExcludeStatus(excludeStatus) {
  if (Array.isArray(excludeStatus)) {
    return excludeStatus;
  }
  if (typeof excludeStatus === 'string' && excludeStatus.trim().length > 0) {
    return excludeStatus.split(',').filter(Boolean);
  }
  return [];
}

/**
 * Start the web server
 * @param {Object} options - Server options
 * @param {number} options.port - Port to listen on
 */
export async function startWebServer(options = {}) {
  const port = options.port || process.env.WEB_PORT || 3000;
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Serve static files from dist/web
  // Use the same path resolution mechanism as config-paths.js for consistency
  const webPath = getWebUIPath();
  logger.info('Web UI path:', webPath);
  app.use(express.static(webPath));

  // API rate limiting - apply to all API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

  // API Routes
  const apiRouter = express.Router();

  // Apply rate limiting to all API routes
  apiRouter.use(apiLimiter);

  // Health check (no authentication required)
  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Get applications
  apiRouter.get(
    '/applications',
    apiHandler(async (_req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const response = await service.listApplications();
      const apps = response.Items || response || [];
      res.json(apps);
    })
  );

  // Get scans for an application
  apiRouter.get(
    '/applications/:appId/scans',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const response = await service.listScans(req.params.appId);
      const scans = response.Items || response || [];
      res.json(scans);
    })
  );

  // Get issues for a scan
  apiRouter.get(
    '/scans/:scanId/issues',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const excludeStatus = req.query.excludeStatus || 'Noise,Passed';
      const excludeArray = parseExcludeStatus(excludeStatus);
      const response = await service.listIssues(
        req.params.scanId,
        null,
        excludeArray,
        'Scan'
      );
      const issues = response.Items || response || [];
      res.json(issues);
    })
  );

  // Get all issues for an application
  apiRouter.get(
    '/applications/:appId/issues',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const excludeStatus = req.query.excludeStatus || 'Noise,Passed';
      const excludeArray = parseExcludeStatus(excludeStatus);
      const response = await service.listIssues(
        req.params.appId,
        null,
        excludeArray,
        'Application'
      );
      const issues = response.Items || response || [];
      res.json(issues);
    })
  );

  // Get issue details
  apiRouter.get(
    '/issues/:issueId/details',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const details = await service.getIssueDetails(req.params.issueId);
      res.json(details);
    })
  );

  // Get issue article
  apiRouter.get(
    '/issues/:issueId/article',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      await service.ensureAuthenticated();

      // First get the issue to have all required fields
      const issue = await service.api.v4.Issues_GetIssue(
        req.params.issueId,
        {}
      );
      if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
      }

      // Get article as markdown
      const article = await service.getIssueArticle(issue);
      res.json({ content: article });
    })
  );

  // Get issue comments
  apiRouter.get(
    '/issues/:issueId/comments',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      await service.ensureAuthenticated();
      const response = await service.api.v4.Issues_GetIssueComments(
        req.params.issueId,
        {}
      );
      const comments = response.Items || response || [];
      res.json(comments);
    })
  );

  // Update issue status
  apiRouter.put(
    '/issues/:issueId/status',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const { status, comment, externalId } = req.body;
      await service.bulkUpdateIssues(
        [req.params.issueId],
        status,
        comment,
        externalId
      );
      res.json({ success: true });
    })
  );

  // Bulk update issue statuses
  apiRouter.put(
    '/issues/bulk/status',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const { issueIds, status, comment } = req.body;
      await service.bulkUpdateIssues(issueIds, status, comment);
      res.json({ success: true });
    })
  );

  // Create Jira issue
  apiRouter.post(
    '/jira/issue',
    apiHandler(async (req, res, { getJiraService }) => {
      const jiraService = getJiraService();
      const { issues, projectKey, issueType, labels } = req.body;
      const result = await jiraService.createIssue(
        issues,
        projectKey,
        issueType,
        labels
      );
      res.json(result);
    })
  );

  // Link Jira issue
  apiRouter.put(
    '/issues/:issueId/jira/link',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      const { jiraKey } = req.body;
      await service.bulkUpdateIssues([req.params.issueId], null, null, jiraKey);
      res.json({ success: true });
    })
  );

  // Unlink Jira issue
  apiRouter.delete(
    '/issues/:issueId/jira/link',
    apiHandler(async (req, res, { getAppScanService }) => {
      const service = getAppScanService();
      await service.bulkUpdateIssues([req.params.issueId], null, null, '');
      res.json({ success: true });
    })
  );

  app.use('/api', apiRouter);

  // Rate limit for SPA fallback route to protect filesystem access
  const spaFallbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 SPA fallback requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', spaFallbackLimiter, (_req, res) => {
    res.sendFile(path.join(webPath, 'index.html'));
  });

  // Start server
  const server = app.listen(port, () => {
    console.log(`\n🌐 AppScan Web UI running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop\n');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
    });
  });

  return server;
}
