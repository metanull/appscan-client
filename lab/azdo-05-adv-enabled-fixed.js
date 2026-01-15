#!/usr/bin/env node
// Improved minimal script: determine Advanced Security enablement per repo using azure-devops-node-api
// Approach: try AdvancedSecurityManagementApi (if available), else check advsec host settings, else probe advsec alerts endpoint
import { listAzdoProjects, listRepositories, getAzdoClient } from './azdo-auth.js';

function deriveOrgNameFromServerUrl(serverUrl) {
  if (!serverUrl) return undefined;
  const s = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (s.startsWith('dev.azure.com/')) return s.replace('dev.azure.com/', '');
  if (s.indexOf('.visualstudio.com') !== -1) return s.split('.')[0];
  return s;
}

(async function main(){
  try {
    const projects = await listAzdoProjects();
    if (!projects || projects.length === 0) {
      console.log('No projects'); process.exit(0);
    }

    const conn = await getAzdoClient();
    const orgName = deriveOrgNameFromServerUrl(conn.serverUrl || process.env.AZDO_ORG_URL || process.env.AZDO_OR || process.env.AZURE_DEVOPS_ORG_URL);
    const advsecBase = orgName ? `https://advsec.dev.azure.com/${orgName}` : null;

    const toCheck = projects.slice(0, Math.min(5, projects.length));

    const hasMgmtApi = typeof conn.getAdvancedSecurityManagementApi === 'function';
    let mgmtApi; if (hasMgmtApi) {
      try { mgmtApi = await conn.getAdvancedSecurityManagementApi(); } catch (_) { mgmtApi = null; }
    }

    for (const project of toCheck) {
      const repos = await listRepositories(project.name);
      console.log(`Project: ${project.name} (${repos.length} repos)`);
      for (const repo of repos) {
        let status = 'unknown';
        // 1) Try management API
        if (mgmtApi) {
          try {
            const s = await mgmtApi.getRepoAdvancedSecuritySettings(project.id, repo.id);
            if (s && typeof s === 'object' && ('enabled' in s || 'advancedSecurityEnabled' in s)) {
              const enabled = s.enabled ?? s.advancedSecurityEnabled;
              status = enabled === true ? 'enabled (management api)' : (enabled === false ? 'disabled (management api)' : 'unknown (management api)');
              console.log(repo.id, repo.name, '->', status);
              continue;
            }
          } catch (e) {
            // fallthrough to other checks
          }
        }

        // 2) Try advsec host settings endpoint
        if (advsecBase) {
          try {
            const url = `${advsecBase}/${encodeURIComponent(project.name)}/_apis/advancedsecurity/repositories/${encodeURIComponent(repo.id)}/settings?api-version=7.2-preview.1`;
            const r = await conn.rest.get(url, {});
            const data = r && (r.result || r) || null;
            if (data && (typeof data === 'object')) {
              const enabled = data.enabled ?? data.advancedSecurityEnabled;
              if (enabled === true || enabled === false) {
                status = enabled ? 'enabled (advsec settings)' : 'disabled (advsec settings)';
                console.log(repo.id, repo.name, '->', status);
                continue;
              }
            }
          } catch (e) {
            // ignore and continue
          }
        }

        // 3) Probe advsec alerts endpoint for the repo - 200 indicates service present; non-empty alerts suggests enabled
        if (advsecBase) {
          try {
            const url = `${advsecBase}/${encodeURIComponent(project.name)}/_apis/alert/repositories/${encodeURIComponent(repo.id)}/alerts?api-version=7.2-preview.1`;
            const r = await conn.rest.get(url, {});
            const data = r && (r.result || r) || null;
            if (r && (r.statusCode === 200 || r.statusCode === 204 || r.statusCode === 0)) {
              const alerts = data && data.value ? data.value : (Array.isArray(data) ? data : null);
              if (alerts) {
                if (alerts.length > 0) status = `enabled (advsec alerts, ${alerts.length} alerts)`;
                else status = 'maybe-enabled (advsec alerts returned 200, 0 alerts)';
                console.log(repo.id, repo.name, '->', status);
                continue;
              } else {
                status = 'advsec endpoint reachable (no alerts data)';
                console.log(repo.id, repo.name, '->', status);
                continue;
              }
            } else if (r && r.statusCode === 404) {
              status = 'advsec not available (404)';
              console.log(repo.id, repo.name, '->', status);
              continue;
            }
          } catch (e) {
            // ignore
          }
        }

        // 4) fallback - unknown
        console.log(repo.id, repo.name, '->', status);
      }
      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during Advanced Security investigation:', err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();