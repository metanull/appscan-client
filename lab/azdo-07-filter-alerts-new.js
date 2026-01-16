#!/usr/bin/env node
/**
 * azdo-07-filter-alerts-new.js
 *
 * Purpose: Demonstrate Advanced Security Alert filtering and search capabilities
 * Package APIs: getAlertApi(), getAlerts() with SearchCriteria
 *
 * This script demonstrates various filtering options available in the Alert API.
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

// Helper functions for extracting data from alerts
function extractKeywords(alert) {
  if (!alert.title) return [];
  const items = alert.title
    .split(/[\W_]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  return Array.from(new Set(items));
}

async function main() {
  try {
    // Connect to Azure DevOps
    const orgUrlFromAzureEnv =
      process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
        ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
        : undefined;

    const orgUrl =
      process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
    const pat =
      process.env.AZDO_PAT ||
      process.env.AZDO_PERSONAL_ACCESS_TOKEN ||
      process.env.AZURE_DEVOPS_PAT;

    if (!orgUrl || !pat) {
      throw new Error(
        'Missing required environment variables: AZDO_ORG_URL and AZDO_PAT'
      );
    }

    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    const conn = new azdev.WebApi(orgUrl, authHandler);
    await conn.connect();

    // Get APIs
    const alertApi = await conn.getAlertApi();
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();

    console.log('=== Advanced Security Alert Filtering Demo ===\n');

    // Get target project
    const targetProjectName = process.env.AZDO_PROJECT || 'Agora';
    const projects = await coreApi.getProjects();
    const project = projects.find((p) => p.name === targetProjectName);

    if (!project) {
      console.log(`Project "${targetProjectName}" not found.`);
      console.log('Set AZDO_PROJECT env var to specify a different project.');
      process.exit(1);
    }

    console.log(`Project: ${project.name}\n`);

    // Get repositories
    const repos = await gitApi.getRepositories(project.id);
    if (!repos || repos.length === 0) {
      console.log('No repositories found.');
      process.exit(0);
    }

    console.log(`Found ${repos.length} repository(ies)\n`);

    // Helper: fetch ALL alerts using AlertApi.getAlerts and continuation tokens
    async function fetchAllAlertsUsingApi(
      alertApi,
      projectName,
      repositoryId,
      criteria = {},
      pageTop = Number(process.env.AZDO_ALERTS_PAGE_TOP) || 100
    ) {
      const all = [];
      let continuation = undefined;
      do {
        const page = await alertApi.getAlerts(
          projectName,
          repositoryId,
          pageTop,
          undefined,
          criteria,
          continuation
        );
        let pageAlerts = [];
        if (!page) pageAlerts = [];
        else if (Array.isArray(page)) pageAlerts = page;
        else if (Array.isArray(page.value)) pageAlerts = page.value;
        else if (Array.isArray(page.result)) pageAlerts = page.result;
        else pageAlerts = Array.isArray(page) ? page : [];

        all.push(...pageAlerts);

        // Attempt to detect continuation token in various shapes
        let next = null;
        if (page) {
          next =
            page.continuationToken ||
            (page.__continuation &&
              (page.__continuation.continuationToken ||
                page.__continuation.token)) ||
            null;
        }
        if (!next && Array.isArray(page) && page.continuationToken)
          next = page.continuationToken;
        if (!next && pageAlerts.length > 0) {
          const a0 = pageAlerts[0];
          if (a0 && (a0.__continuation || a0.continuationToken))
            next = a0.__continuation || a0.continuationToken;
        }
        continuation = next || undefined;
      } while (continuation);
      return all;
    }

    // Process first repository with alerts
    for (const repo of repos) {
      console.log(`--- Repository: ${repo.name} ---\n`);

      try {
        // Fetch ALL alerts (no sampling) using the AlertApi's continuation-token support
        const allAlerts = await fetchAllAlertsUsingApi(
          alertApi,
          project.name,
          repo.id
        );

        if (!allAlerts || allAlerts.length === 0) {
          console.log('  No alerts found, skipping\n');
          continue;
        }

        console.log(`  Total alerts: ${allAlerts.length} alert(s)\n`);

        // 1. Filter by Alert Type (derived from the full set)
        const types = Array.from(
          new Set(allAlerts.map((a) => a.alertType).filter(Boolean))
        );
        if (types.length > 0) {
          console.log('  📋 Filter by Alert Type:');
          console.log(`    Available types: ${types.join(', ')}`);
          // Demonstrate fetching ALL alert results for that type as well
          const typeAlerts = await fetchAllAlertsUsingApi(
            alertApi,
            project.name,
            repo.id,
            { alertType: types[0] }
          );
          console.log(
            `    Results for type=${types[0]}: ${typeAlerts?.length || 0} alert(s)`
          );
          if (typeAlerts && typeAlerts.length > 0) {
            console.log(
              `      Example: ${typeAlerts[0].title || typeAlerts[0].ruleName || '(no title)'}`
            );
          }
          console.log();
        }

        // 2. Filter by Severity
        const severities = Array.from(
          new Set(allAlerts.map((a) => a.severity).filter(Boolean))
        );
        if (severities.length > 0) {
          console.log('  ⚠️  Order by Severity:');
          const sevAlerts = await alertApi.getAlerts(
            project.name,
            repo.id,
            5,
            'severity'
          );
          console.log(
            `    Top 5 by severity: ${sevAlerts?.length || 0} alert(s)`
          );
          if (sevAlerts && sevAlerts.length > 0) {
            for (const alert of sevAlerts) {
              console.log(
                `      [Severity ${alert.severity}] ${alert.title || alert.ruleName || '(no title)'}`
              );
            }
          }
          console.log();
        }

        // 3. Filter by Keyword
        const allKeywords = new Set();
        allAlerts.forEach((a) =>
          extractKeywords(a).forEach((k) => allKeywords.add(k))
        );
        const keywords = Array.from(allKeywords).slice(0, 5);

        if (keywords.length > 0) {
          console.log('  🔍 Filter by Keyword:');
          console.log(`    Sample keywords: ${keywords.join(', ')}`);
          // Demonstrate full results for the keyword
          const keywordAlerts = await fetchAllAlertsUsingApi(
            alertApi,
            project.name,
            repo.id,
            { keywords: keywords[0] }
          );
          console.log(
            `    Results for keyword="${keywords[0]}": ${keywordAlerts?.length || 0} alert(s)`
          );
          console.log();
        }

        // 4. Filter by Date Range
        console.log('  📅 Filter by Date:');
        const fromDate = '2025-01-01T00:00:00Z';
        const dateAlerts = await fetchAllAlertsUsingApi(
          alertApi,
          project.name,
          repo.id,
          { fromDate }
        );
        console.log(
          `    Alerts since ${fromDate}: ${dateAlerts?.length || 0} alert(s)`
        );
        console.log();

        // 5. Order By Options
        console.log('  🔢 Order By Options:');
        const orderOptions = ['id', 'firstSeen', 'lastSeen', 'severity'];
        for (const order of orderOptions) {
          const ordered = await alertApi.getAlerts(
            project.name,
            repo.id,
            3,
            order
          );
          console.log(
            `    orderBy="${order}": ${ordered?.length || 0} alert(s)`
          );
          if (ordered && ordered.length > 0) {
            const first = ordered[0];
            const value =
              order === 'severity'
                ? first.severity
                : order === 'firstSeen'
                  ? first.firstSeenDate
                  : order === 'lastSeen'
                    ? first.lastSeenDate
                    : first.alertId || first.id;
            console.log(`      First: ${value}`);
          }
        }
        console.log();

        // 6. Alert ID Filter
        const alertIds = allAlerts
          .slice(0, 3)
          .map((a) => a.alertId)
          .filter(Boolean);
        if (alertIds.length > 0) {
          console.log('  🆔 Filter by Alert IDs:');
          const idAlerts = await fetchAllAlertsUsingApi(
            alertApi,
            project.name,
            repo.id,
            { alertIds }
          );
          console.log(
            `    Requested ${alertIds.length} specific alert(s): ${idAlerts?.length || 0} found`
          );
          console.log();
        }

        console.log(
          '  ✅ Filtering demonstration complete for this repository\n'
        );

        // Only demo on first repo with alerts
        break;
      } catch (err) {
        if (err.statusCode === 404) {
          console.log('  ℹ️  Advanced Security not enabled or no alerts\n');
        } else {
          console.log(`  ❌ Error: ${err.message}\n`);
        }
      }
    }

    console.log('=== Summary ===');
    console.log('Available filtering options demonstrated:');
    console.log('  • Alert Type');
    console.log('  • Severity (with ordering)');
    console.log('  • Keywords');
    console.log('  • Date ranges (fromDate, toDate)');
    console.log('  • Order by (id, firstSeen, lastSeen, severity)');
    console.log('  • Specific Alert IDs');
    console.log(
      '\nRefer to AlertApi.getAlerts() SearchCriteria for more options.'
    );

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
