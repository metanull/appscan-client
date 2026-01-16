#!/usr/bin/env node
/*
 DO NOT USE THIS SCRIPT AS A TEMPLATE IT IS FOR TESTING PURPOSE ONLY;
 ACTUAL scripts MUST use the azure-devops-node-api package instead of direct API calls!
 
 Experiment Self-contained script to exercise Advanced Security Alerts filter options.

 Behaviour:
 1. List projects
 2. Select project
 3. For each such project, list repositories
 4. For each repository: collect distinct values for requested criteria, and
    run a small sample query (top=3) for the first value where applicable.

 NOTE: This script uses the documented advsec REST endpoint under advsec.dev.azure.com
       via the connection.rest client (part of the azure-devops-node-api package).
*/

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

function deriveOrgNameFromServerUrl(serverUrl) {
  if (!serverUrl) return undefined;
  const s = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (s.startsWith('dev.azure.com/')) return s.replace('dev.azure.com/', '');
  if (s.indexOf('.visualstudio.com') !== -1) return s.split('.')[0];
  return s;
}

async function getAzdoClient() {
  // Accept several env var variants
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

function qs(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) for (const item of v) p.append(k, item);
    else p.append(k, String(v));
  }
  return p.toString();
}

async function pageAllAlerts(conn, advBase, projectName, repoId, params = {}, max = 5000) {
  // page through all alerts and return an array (up to max)
  const out = [];
  let continuation = null;
  const pageTop = params.top || 500;
  do {
    const qp = new URLSearchParams();
    if (continuation) qp.set('continuationToken', continuation);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) for (const it of v) qp.append(k, it); else qp.append(k, String(v));
    }
    qp.set('top', String(pageTop));
    const url = `${advBase}/${encodeURIComponent(projectName)}/_apis/alert/repositories/${encodeURIComponent(repoId)}/alerts?api-version=7.2-preview.1&${qp.toString()}`;
    const r = await conn.rest.get(url, {});
    const d = r && r.result ? r.result : r;
    const al = d && d.value ? d.value : (Array.isArray(d) ? d : []);
    for (const a of al) out.push(a);
    continuation = r && r.headers && (r.headers['x-ms-continuationtoken'] || r.headers['X-Ms-ContinuationToken']) ? (r.headers['x-ms-continuationtoken'] || r.headers['X-Ms-ContinuationToken']) : null;
    if (out.length >= max) break;
  } while (continuation);
  return out.slice(0, max);
}

function firstN(al, n = 3) { return (al || []).slice(0, n); }

function extractDependencyNames(alert) {
  const names = new Set();
  if (Array.isArray(alert.logicalLocations)) {
    for (const l of alert.logicalLocations) {
      if (l && l.fullyQualifiedName) names.add(l.fullyQualifiedName);
      else if (l && l.name) names.add(l.name);
    }
  }
  // also check related locations
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
  // simple split and return unique words longer than 3 chars
  const items = alert.title.split(/[^\w-]+/).map(s => s.trim()).filter(s => s.length > 3);
  return Array.from(new Set(items));
}

async function run() {
  try {
    const conn = await getAzdoClient();

    const core = await conn.getCoreApi();
    const projectsRaw = await core.getProjects();
    const projects = (projectsRaw || []).map(p => ({ id: p.id, name: p.name }));
    console.log('Projects found:', projects.map(p => p.name).join(', '));

    const orgName = deriveOrgNameFromServerUrl(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL);
    if (!orgName) throw new Error('Cannot determine org name for advsec endpoint');
    const advBase = `https://advsec.dev.azure.com/${orgName}`;

    const targetProjects = projects.filter(p => p.name === 'Agora');
    if (targetProjects.length === 0) {
      console.log('No project named Agora found; aborting.');
      process.exit(0);
    }

    const git = await conn.getGitApi();

    for (const project of targetProjects) {
      console.log('\n=== Project:', project.name, '===');
      const reposRaw = await git.getRepositories(project.id);
      const repos = (reposRaw || []).map(r => ({ id: r.id, name: r.name }));
      console.log('Repositories:', repos.map(r => r.name).join(', '));

      for (const repo of repos) {
        console.log('\n--- Repository:', repo.name, '---');
        // fetch a sample page (top 500) and also try to pull up to 2000 for distinct gathering
        const sample = await pageAllAlerts(conn, advBase, project.name, repo.id, { top: 200 }, 2000);
        if (!sample || sample.length === 0) { console.log('  No alerts found; skipping'); continue; }
        console.log(`  Sample alerts fetched: ${sample.length}`);

        // 1. Alert Type
        const types = Array.from(new Set(sample.map(a => a.alertType).filter(Boolean)));
        console.log('  Alert Types:', types.slice(0,10).join(', '));
        if (types.length>0) {
          const v = types[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.alertType': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for alertType=' + v + ':', firstN(d && d.value ? d.value : d, 3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 2. Confidence Level
        const confidences = Array.from(new Set(sample.map(a => a.confidence).filter(Boolean)));
        console.log('  Confidence Levels:', confidences.join(', '));
        if (confidences.length>0) {
          const v = confidences[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.confidenceLevels': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for confidence=', v, ':', firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 3. Dependency Name
        const deps = new Set(); for (const a of sample) { for (const n of extractDependencyNames(a)) deps.add(n); }
        const depsArr = Array.from(deps);
        console.log('  Dependency Names (sample):', depsArr.slice(0,10).join(', '));
        if (depsArr.length>0) {
          const v = depsArr[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.dependencyName': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for dependencyName=' + v + ':', firstN(d && d.value ? d.value : d, 3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 4. From Date (distinct firstSeenDate)
        const fdates = Array.from(new Set(sample.map(a => a.firstSeenDate).filter(Boolean))).slice(0,10);
        console.log('  Distinct firstSeenDate (sample):', fdates.slice(0,6).join(', '));
        // list the first 3 alerts occured after 2025-06-01
        const fromDateFilter = '2025-06-01T00:00:00Z';
        const urlFrom = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.fromDate': fromDateFilter, top: 3})}`;
        const rfrom = await conn.rest.get(urlFrom, {});
        const dfrom = rfrom && rfrom.result ? rfrom.result : rfrom;
        console.log('   First 3 alerts after 2025-06-01:', firstN(dfrom && dfrom.value ? dfrom.value : dfrom,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.firstSeenDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 5. Keyword
        const keywords = new Set(); for (const a of sample) for (const k of extractKeywords(a)) keywords.add(k);
        const keys = Array.from(keywords);
        console.log('  Keywords (sample):', keys.slice(0,10).join(', '));
        if (keys.length>0) {
          const k = keys[0];
          const urlk = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.keywords': k, top: 3})}`;
          const rk = await conn.rest.get(urlk, {});
          const dk = rk && rk.result ? rk.result : rk;
          console.log('   First 3 for keyword=' + k + ':', firstN(dk && dk.value ? dk.value : dk,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 6. Pipeline Name and Phase Name
        const pnames = new Set(); for (const a of sample) for (const p of extractPipelineNames(a)) pnames.add(p);
        const pArr = Array.from(pnames);
        console.log('  Pipeline Names (sample):', pArr.slice(0,10).join(', '));
        if (pArr.length>0) {
          const v = pArr[0];
          const urlp = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.pipelineName': v, top: 3})}`;
          const rp = await conn.rest.get(urlp, {});
          const dp = rp && rp.result ? rp.result : rp;
          console.log('   First 3 for pipelineName=' + v + ':', firstN(dp && dp.value ? dp.value : dp,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));

          // phase names for first pipeline
          const phaseNames = new Set(); for (const a of (dp && dp.value ? dp.value : dp)) for (const ph of extractPhaseNames(a)) phaseNames.add(ph);
          const phArr = Array.from(phaseNames);
          console.log('   Distinct phaseNames for pipeline:', phArr.slice(0,10).join(', '));
          if (phArr.length>0) {
            const ph = phArr[0];
            const urlph = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.pipelineName': v, 'criteria.phaseName': ph, top: 3})}`;
            const rph = await conn.rest.get(urlph, {});
            const dph = rph && rph.result ? rph.result : rph;
            console.log('    First 3 for phaseName=' + ph + ':', firstN(dph && dph.value ? dph.value : dph,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
          }
        }

        // 7. Rule Name / Rule Id
        const ruleIds = new Set(); const ruleNames = new Set();
        for (const a of sample) { const r = extractRuleIdsAndNames(a); r.ids.forEach(i=>ruleIds.add(i)); r.names.forEach(n=>ruleNames.add(n)); }
        console.log('  RuleIds (sample):', Array.from(ruleIds).slice(0,10).join(', '));
        console.log('  RuleNames (sample):', Array.from(ruleNames).slice(0,10).join(', '));
        if (ruleIds.size>0) {
          const v = Array.from(ruleIds)[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.ruleId': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for ruleId=' + v + ':', firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 8. To Date (before 2025-06-01)
        const toDateFilter = '2025-06-01T00:00:00Z';
        const urlTo = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.toDate': toDateFilter, top: 3})}`;
        const rto = await conn.rest.get(urlTo, {});
        const dto = rto && rto.result ? rto.result : rto;
        console.log('   First 3 alerts before 2025-06-01:', firstN(dto && dto.value ? dto.value : dto,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.firstSeenDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 9. Tool Name
        const toolNames = new Set(); for (const a of sample) for (const t of extractToolNames(a)) toolNames.add(t);
        console.log('  Tool Names (sample):', Array.from(toolNames).slice(0,10).join(', '));
        if (toolNames.size>0) {
          const v = Array.from(toolNames)[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.toolName': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for toolName=' + v + ':', firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 10. Secrets validity
        const validityVals = new Set(); for (const a of sample) { const v = extractValidity(a); if (v) validityVals.add(v); }
        console.log('  Validity values (sample):', Array.from(validityVals).join(', '));
        if (validityVals.size>0) {
          const v = Array.from(validityVals)[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.validity': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for validity=' + v + ':', firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 11. Alert ID
        const ids = Array.from(new Set(sample.map(a => a.alertId).filter(Boolean)));
        console.log('  Alert IDs (sample):', ids.slice(0,10).join(', '));
        if (ids.length>0) {
          const v = ids[0];
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.alertIds': v, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log('   First 3 for alertId=' + v + ':', firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 12. Modified Since - use lastModifiedDate or updated Date approximation
        const modDates = Array.from(new Set(sample.map(a => a.lastSeenDate || a.fixedDate).filter(Boolean))).slice(0,10);
        console.log('  Modified dates (sample):', modDates.slice(0,6).join(', '));
        const modifiedSinceFilter = '2025-06-01T00:00:00Z';
        const urlMod = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'criteria.modifiedSince': modifiedSinceFilter, top: 3})}`;
        const rmod = await conn.rest.get(urlMod, {});
        const dmod = rmod && rmod.result ? rmod.result : rmod;
        console.log('   First 3 modified since 2025-06-01:', firstN(dmod && dmod.value ? dmod.value : dmod,3).map(a=> `${a.alertId||a.id} | ${a.lastSeenDate||a.fixedDate||'(no date)'} | ${a.title||a.ruleName||'(no title)'}`));

        // 13. Ordering: id, firstSeen, lastSeen, fixedOn, severity
        const orders = ['id','firstSeen','lastSeen','fixedOn','severity'];
        for (const o of orders) {
          const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({'orderBy': o, top: 3})}`;
          const r = await conn.rest.get(url, {});
          const d = r && r.result ? r.result : r;
          console.log(`   OrderBy=${o}:`, firstN(d && d.value ? d.value : d,3).map(a=> `${a.alertId||a.id} | ${o==='severity'?a.severity:(o==='firstSeen'?a.firstSeenDate:(o==='lastSeen'?a.lastSeenDate:(o==='fixedOn'?a.fixedDate:a.alertId||a.id)))} | ${a.title||a.ruleName||'(no title)'}`));
        }

        // 14. Top: first 10 by id and by severity
        const topByIdUrl = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({top: 10, orderBy: 'id'})}`;
        const tr1 = await conn.rest.get(topByIdUrl, {});
        const dtr1 = tr1 && tr1.result ? tr1.result : tr1;
        console.log('   Top 10 orderBy=id:', (dtr1 && dtr1.value ? dtr1.value : dtr1).length);

        const topBySeverityUrl = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&${qs({top: 10, orderBy: 'severity'})}`;
        const tr2 = await conn.rest.get(topBySeverityUrl, {});
        const dtr2 = tr2 && tr2.result ? tr2.result : tr2;
        console.log('   Top 10 orderBy=severity:', (dtr2 && dtr2.value ? dtr2.value : dtr2).length);

      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
}

run();
