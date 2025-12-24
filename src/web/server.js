/**
 * Express server for Web UI
 * Serves the React web application and provides API endpoints
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getEnvPath } from '../utils/config-paths.js';
import { AppScanService } from '../services/appscan-service.js';
import { JiraService } from '../services/jira-service.js';
import logger from '../tui/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: getEnvPath() });

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

  // Serve static files from dist/web in production
  const distPath = path.join(__dirname, '../../dist/web');
  app.use(express.static(distPath));

  // API Routes
  const apiRouter = express.Router();

  // Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Get applications
  apiRouter.get('/applications', async (_req, res) => {
    try {
      const service = new AppScanService();
      const apps = await service.getApplications();
      res.json(apps);
    } catch (error) {
      logger.error('Error fetching applications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get scans for an application
  apiRouter.get('/applications/:appId/scans', async (req, res) => {
    try {
      const service = new AppScanService();
      const scans = await service.getScans(req.params.appId);
      res.json(scans);
    } catch (error) {
      logger.error('Error fetching scans:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get issues for a scan
  apiRouter.get('/scans/:scanId/issues', async (req, res) => {
    try {
      const service = new AppScanService();
      const excludeStatus = req.query.excludeStatus || 'Noise,Passed';
      const issues = await service.getIssues(
        req.params.scanId,
        excludeStatus.split(',').filter(Boolean)
      );
      res.json(issues);
    } catch (error) {
      logger.error('Error fetching issues:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all issues for an application
  apiRouter.get('/applications/:appId/issues', async (req, res) => {
    try {
      const service = new AppScanService();
      const excludeStatus = req.query.excludeStatus || 'Noise,Passed';
      const issues = await service.getAllIssuesForApp(
        req.params.appId,
        excludeStatus.split(',').filter(Boolean)
      );
      res.json(issues);
    } catch (error) {
      logger.error('Error fetching issues:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get issue details
  apiRouter.get('/issues/:issueId/details', async (req, res) => {
    try {
      const service = new AppScanService();
      const details = await service.getIssueDetails(req.params.issueId);
      res.json(details);
    } catch (error) {
      logger.error('Error fetching issue details:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get issue article
  apiRouter.get('/issues/:issueId/article', async (req, res) => {
    try {
      const service = new AppScanService();
      const article = await service.getIssueArticleMarkdown(req.params.issueId);
      res.json({ content: article });
    } catch (error) {
      logger.error('Error fetching article:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get issue comments
  apiRouter.get('/issues/:issueId/comments', async (req, res) => {
    try {
      const service = new AppScanService();
      const comments = await service.getIssueComments(req.params.issueId);
      res.json(comments);
    } catch (error) {
      logger.error('Error fetching comments:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update issue status
  apiRouter.put('/issues/:issueId/status', async (req, res) => {
    try {
      const service = new AppScanService();
      const { status, comment, externalId } = req.body;
      await service.updateIssueStatus(
        req.params.issueId,
        status,
        comment,
        externalId
      );
      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating issue status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk update issue statuses
  apiRouter.put('/issues/bulk/status', async (req, res) => {
    try {
      const service = new AppScanService();
      const { issueIds, status, comment } = req.body;
      await service.bulkUpdateIssueStatus(issueIds, status, comment);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error bulk updating issues:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create Jira issue
  apiRouter.post('/jira/issue', async (req, res) => {
    try {
      const jiraService = new JiraService();
      const { issues, projectKey, issueType, labels } = req.body;
      const result = await jiraService.createIssue(
        issues,
        projectKey,
        issueType,
        labels
      );
      res.json(result);
    } catch (error) {
      logger.error('Error creating Jira issue:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Link Jira issue
  apiRouter.put('/issues/:issueId/jira/link', async (req, res) => {
    try {
      const service = new AppScanService();
      const { jiraKey } = req.body;
      await service.updateIssueStatus(req.params.issueId, null, null, jiraKey);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error linking Jira issue:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Unlink Jira issue
  apiRouter.delete('/issues/:issueId/jira/link', async (req, res) => {
    try {
      const service = new AppScanService();
      await service.updateIssueStatus(req.params.issueId, null, null, '');
      res.json({ success: true });
    } catch (error) {
      logger.error('Error unlinking Jira issue:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use('/api', apiRouter);

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
