#!/usr/bin/env node
// Minimal script: list security threats (alerts) and group them by category using documented fields
// Uses SDK rest client and documented filters; inspects first 5 projects and up to 5 repos each
import { listAzdoProjects, listRepositories, getAzdoClient } from './azdo-auth.js';

const TOP = 200;

const FILTER_CRITERIA = [
  'criteria.alertType', 'criteria.confidenceLevels', 'criteria.dependencyName', 'criteria.fromDate',
  'criteria.hasLinkedWorkItems', 'criteria.keywords', 'criteria.licenseName', 'criteria.modifiedSince',
  'criteria.onlyDefaultBranch', 'criteria.phaseId', 'criteria.phaseName', 'criteria.pipelineName',
  'criteria.ref', 'criteria.ruleId', 'criteria.ruleName', 'criteria.severities', 'criteria.states',
  'criteria.toDate', 'criteria.toolName', 'criteria.validity', 'expand', 'orderBy', 'top'
];

function deriveOrgNameFromServerUrl(serverUrl) {
  if (!serverUrl) return undefined;
  const s = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (s.startsWith('dev.azure.com/')) return s.replace('dev.azure.com/', '');
  if (s.indexOf('.visualstudio.com') !== -1) return s.split('.')[0];
  return s;
}

(async function main(){
  try {
    console.log('Alert grouping criteria available (from docs):');
    console.log('- By alertType (secret, code, dependency, unknown)');
    console.log('- By severity (low, medium, high, critical, etc.)');
    console.log('- By toolName, ruleName, ruleId');
    console.log('- By state (active, dismissed, fixed, autoDismissed)');
    console.log('- Other filters: confidenceLevels, validity, hasLinkedWorkItems, keywords, date ranges, branch/ref, pipeline info');
    console.log('---');

    const conn = await getAzdoClient();
    const orgName = deriveOrgNameFromServerUrl(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL);
    if (!orgName) throw new Error('Cannot determine org name');
    const advBase = `https://advsec.dev.azure.com/${orgName}`;

    const projects = await listAzdoProjects();
    const toCheckProjects = projects.slice(0, Math.min(5, projects.length));

    for (const project of toCheckProjects) {
      console.log('Project:', project.name);
      const repos = await listRepositories(project.name);
      const toCheckRepos = repos.slice(0, Math.min(5, repos.length));

      // accumulator
      const byType = new Map(); // alertType -> severity -> count and sample

      for (const repo of toCheckRepos) {
        const url = `${advBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1&top=${TOP}`;
        try {
          const r = await conn.rest.get(url, {});
          const data = r && r.result ? r.result : r;
          const alerts = data && data.value ? data.value : (Array.isArray(data) ? data : []);
          console.log(`  ${repo.name}: ${alerts.length} alerts`);

          for (const a of alerts) {
            const type = a.alertType || 'unknown';
            const severity = a.severity || 'undefined';
            const tool = Array.isArray(a.tools) && a.tools.length>0 ? a.tools[0].name : '(no-tool)';
            if (!byType.has(type)) byType.set(type, new Map());
            const sevMap = byType.get(type);
            const key = severity;
            if (!sevMap.has(key)) sevMap.set(key, { count: 0, sample: null, tools: new Map() });
            const entry = sevMap.get(key);
            entry.count += 1;
            if (!entry.sample) entry.sample = { id: a.alertId || a.id, title: a.title || a.ruleName || '(no title)', repo: repo.name, tool, severity };
            // track tool breakdown
            const tools = entry.tools;
            tools.set(tool, (tools.get(tool) || 0) + 1);
          }

        } catch (e) {
          console.log(`  ${repo.name}: error fetching alerts: ${e && e.message ? e.message : String(e)}`);
        }
      }

      // print summary per project
      console.log('Summary by alertType and severity:');
      for (const [type, sevMap] of byType.entries()) {
        console.log(`- ${type}:`);
        for (const [sev, info] of sevMap.entries()) {
          console.log(`  - ${sev}: ${info.count} alerts; example: ${info.sample.id} | ${info.sample.title} | tool=${info.sample.tool}`);
          // tool breakdown
          const toolEntries = Array.from(info.tools.entries()).sort((a,b)=>b[1]-a[1]);
          console.log('    top tools:', toolEntries.slice(0,3).map(t=>`${t[0]}(${t[1]})`).join(', '));
        }
      }

      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();