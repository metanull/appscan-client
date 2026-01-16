#!/usr/bin/env node
/*
 Client-only script to exercise Advanced Security Alerts filter options
 Uses ONLY the `azure-devops-node-api` package + dotenv to read env vars.

 Behaviour (mirrors azdo-07-filter-alert-rest.js):
 1. List projects
 2. Find project(s) with name == 'Agora'
 3. For each such project, list repositories
 4. For each repository: collect distinct values for requested criteria, and
    run a small sample query (top=3) for the first value where applicable.

 NOTE: This script uses the client API `getAlertApi()` and
 does NOT make direct REST calls.
*/

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

function firstN(al, n = 3) { return (al || []).slice(0, n); }

function extractDependencyNames(alert) {
  const names = new Set();
  if (Array.isArray(alert.logicalLocations)) {
    for (const l of alert.logicalLocations) {
      if (l && l.fullyQualifiedName) names.add(l.fullyQualifiedName);
      else if (l && l.name) names.add(l.name);
    }
  }
  if (Array.isArray(alert.relatedLocations)) {
    for (const rl of alert.relatedLocations) if (rl && rl.logicalLocation && rl.logicalLocation.fullyQualifiedName) names.add(rl.logicalLocation.fullyQualifiedName);
  }
  return Array.from(names);
}

function extractPipelineNames(alert) {
  const names = new Set();
  if (alert.pipelineName) names.add(alert.pipelineName);
  if (alert.analysisInfo && alert.analysisInfo.pipeline) names.add(alert.analysisInfo.pipeline);
  if (Array.isArray(alert.tools)) {
    for (const t of alert.tools) if (t && t.name) names.add(t.name);
  }
  return Array.from(names).filter(Boolean);
}

function extractPhaseNames(alert) {
  const p = new Set();
  if (alert.phaseName) p.add(alert.phaseName);
  if (Array.isArray(alert.analysisInfo?.phases)) {
    for (const ph of alert.analysisInfo.phases) if (ph && ph.name) p.add(ph.name);
  }
  return Array.from(p).filter(Boolean);
}

function extractRuleIdsAndNames(alert) {
  const ids = new Set(); const names = new Set();
  if (alert.ruleId) ids.add(String(alert.ruleId));
  if (alert.rule && alert.rule.opaqueId) ids.add(String(alert.rule.opaqueId));
  if (alert.ruleName) names.add(alert.ruleName);
  if (alert.rule && alert.rule.friendlyName) names.add(alert.rule.friendlyName);
  return { ids: Array.from(ids), names: Array.from(names) };
}

function extractToolNames(alert) {
  const t = new Set();
  if (Array.isArray(alert.tools)) for (const tool of alert.tools) if (tool && tool.name) t.add(tool.name);
  return Array.from(t);
}

function extractValidity(alert) {
  return alert.validityDetails && alert.validityDetails.validityStatus ? alert.validityDetails.validityStatus : undefined;
}

function extractKeywords(alert) {
  if (!alert.title) return [];
  const items = alert.title.split(/[\W_]+/).map(s => s.trim()).filter(s => s.length > 3);
  return Array.from(new Set(items));
}

async function getAzdoClient() {
  const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
    ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
    : undefined;

  const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv || process.env.AZURE_DEVOPS_ORG_URL;
  const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;
  if (!orgUrl || !pat) throw new Error('Missing Azure DevOps env vars. Set AZDO_ORG_URL (or AZDO_OR/AZURE_DEVOPS_BASE_URL+AZURE_DEVOPS_ORG) and AZDO_PAT (or AZURE_DEVOPS_PAT)');

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  await connection.connect();
  return connection;
}

async function run() {
  try {
    const conn = await getAzdoClient();

    const core = await conn.getCoreApi();
    const projectsRaw = await core.getProjects();
    const projects = (projectsRaw || []).map(p => ({ id: p.id, name: p.name }));
    console.log('Projects found:', projects.map(p => p.name).join(', '));

    const targetProjects = projects.filter(p => p.name === 'Agora');
    if (targetProjects.length === 0) {
      console.log('No project named Agora found; aborting.');
      process.exit(0);
    }

    const git = await conn.getGitApi();

    // Get the Alert API (Advanced Security Alerts)
    const alertApi = await conn.getAlertApi();

    for (const project of targetProjects) {
      console.log('\n=== Project:', project.name, '===');
      const reposRaw = await git.getRepositories(project.id);
      const repos = (reposRaw || []).map(r => ({ id: r.id, name: r.name }));
      console.log('Repositories:', repos.map(r => r.name).join(', '));

      for (const repo of repos) {
        console.log('\n--- Repository:', repo.name, '---');
        // fetch a sample page (top 200)
        const sample = await alertApi.getAlerts(project.name, repo.id, 200);
        if (!sample || sample.length === 0) { console.log('  No alerts found; skipping'); continue; }
        console.log(`  Sample alerts fetched: ${sample.length}`);

        // 1. Alert Type
        const types = Array.from(new Set(sample.map(a => a.alertType).filter(Boolean)));
        console.log('  Alert Types:', types.slice(0,10).join(', '));
        if (types.length>0) {
          const v = types[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { alertType: v });
          console.log('   First 3 for alertType=' + v + ':', firstN(d, 3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 2. Confidence Level
        const confidences = Array.from(new Set(sample.map(a => a.confidence).filter(Boolean)));
        console.log('  Confidence Levels:', confidences.join(', '));
        if (confidences.length>0) {
          const v = confidences[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { confidenceLevels: [v] });
          console.log('   First 3 for confidence=', v, ':', firstN(d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 3. Dependency Name
        const deps = new Set(); for (const a of sample) { for (const n of extractDependencyNames(a)) deps.add(n); }
        const depsArr = Array.from(deps);
        console.log('  Dependency Names (sample):', depsArr.slice(0,10).join(', '));
        if (depsArr.length>0) {
          const v = depsArr[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { dependencyName: v });
          console.log('   First 3 for dependencyName=' + v + ':', firstN(d, 3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 4. From Date
        const fdates = Array.from(new Set(sample.map(a => a.firstSeenDate).filter(Boolean))).slice(0,10);
        console.log('  Distinct firstSeenDate (sample):', fdates.slice(0,6).join(', '));
        const fromDateFilter = '2025-06-01T00:00:00Z';
        const dfrom = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { fromDate: fromDateFilter });
        console.log('   First 3 alerts after 2025-06-01:', firstN(dfrom,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.firstSeenDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 5. Keyword
        const keywords = new Set(); for (const a of sample) for (const k of extractKeywords(a)) keywords.add(k);
        const keys = Array.from(keywords);
        console.log('  Keywords (sample):', keys.slice(0,10).join(', '));
        if (keys.length>0) {
          const k = keys[0];
          const dk = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { keywords: k });
          console.log('   First 3 for keyword=' + k + ':', firstN(dk,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 6. Pipeline Name and Phase Name
        const pnames = new Set(); for (const a of sample) for (const p of extractPipelineNames(a)) pnames.add(p);
        const pArr = Array.from(pnames);
        console.log('  Pipeline Names (sample):', pArr.slice(0,10).join(', '));
        if (pArr.length>0) {
          const v = pArr[0];
          const dp = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { pipelineName: v });
          console.log('   First 3 for pipelineName=' + v + ':', firstN(dp,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));

          // phase names for first pipeline
          const phaseNames = new Set(); for (const a of dp || []) for (const ph of extractPhaseNames(a)) phaseNames.add(ph);
          const phArr = Array.from(phaseNames);
          console.log('   Distinct phaseNames for pipeline:', phArr.slice(0,10).join(', '));
          if (phArr.length>0) {
            const ph = phArr[0];
            const dph = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { pipelineName: v, phaseName: ph });
            console.log('    First 3 for phaseName=' + ph + ':', firstN(dph,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
          }
        }

        // 7. Rule Name / Rule Id
        const ruleIds = new Set(); const ruleNames = new Set();
        for (const a of sample) { const r = extractRuleIdsAndNames(a); r.ids.forEach(i=>ruleIds.add(i)); r.names.forEach(n=>ruleNames.add(n)); }
        console.log('  RuleIds (sample):', Array.from(ruleIds).slice(0,10).join(', '));
        console.log('  RuleNames (sample):', Array.from(ruleNames).slice(0,10).join(', '));
        if (ruleIds.size>0) {
          const v = Array.from(ruleIds)[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { ruleId: v });
          console.log('   First 3 for ruleId=' + v + ':', firstN(d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 8. To Date
        const toDateFilter = '2025-06-01T00:00:00Z';
        const dto = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { toDate: toDateFilter });
        console.log('   First 3 alerts before 2025-06-01:', firstN(dto,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.firstSeenDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 9. Tool Name
        const toolNames = new Set(); for (const a of sample) for (const t of extractToolNames(a)) toolNames.add(t);
        console.log('  Tool Names (sample):', Array.from(toolNames).slice(0,10).join(', '));
        if (toolNames.size>0) {
          const v = Array.from(toolNames)[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { toolName: v });
          console.log('   First 3 for toolName=' + v + ':', firstN(d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 10. Secrets validity
        const validityVals = new Set(); for (const a of sample) { const v = extractValidity(a); if (v) validityVals.add(v); }
        console.log('  Validity values (sample):', Array.from(validityVals).join(', '));
        if (validityVals.size>0) {
          const v = Array.from(validityVals)[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { validity: [v] });
          console.log('   First 3 for validity=' + v + ':', firstN(d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 11. Alert ID
        const ids = Array.from(new Set(sample.map(a => a.alertId).filter(Boolean)));
        console.log('  Alert IDs (sample):', ids.slice(0,10).join(', '));
        if (ids.length>0) {
          const v = ids[0];
          const d = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { alertIds: [v] });
          console.log('   First 3 for alertId=' + v + ':', firstN(d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 12. Modified Since
        const modDates = Array.from(new Set(sample.map(a => a.lastSeenDate || a.fixedDate).filter(Boolean))).slice(0,10);
        console.log('  Modified dates (sample):', modDates.slice(0,6).join(', '));
        const modifiedSinceFilter = '2025-06-01T00:00:00Z';
        const dmod = await alertApi.getAlerts(project.name, repo.id, 3, undefined, { modifiedSince: modifiedSinceFilter });
        console.log('   First 3 modified since 2025-06-01:', firstN(dmod,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.fixedDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 13. Ordering: id, firstSeen, lastSeen, fixedOn, severity
        const orders = ['id','firstSeen','lastSeen','fixedOn','severity'];
        for (const o of orders) {
          const d = await alertApi.getAlerts(project.name, repo.id, 3, o);
          console.log(`   OrderBy=${o}:`, firstN(d,3).map(a=> `${a.alertId||a.id} | ${o==='severity'?a.severity:(o==='firstSeen'?a.firstSeenDate:(o==='lastSeen'?a.lastSeenDate:(o==='fixedOn'?a.fixedDate:a.alertId||a.id)))} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 14. Top: first 10 by id and by severity
        const tr1 = await alertApi.getAlerts(project.name, repo.id, 10, 'id');
        console.log('   Top 10 orderBy=id:', (tr1 || []).length);
        const tr2 = await alertApi.getAlerts(project.name, repo.id, 10, 'severity');
        console.log('   Top 10 orderBy=severity:', (tr2 || []).length);

      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
}

run();
