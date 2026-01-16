#!/usr/bin/env node
/**
 * azdo-05-enablement-api-new.js
 *
 * Purpose: Verify Advanced Security "enablement" at Organization, Project and Repository levels
 * using the azure-devops-node-api package (no direct REST calls).
 *
 * Behavior:
 * - Connects to Azure DevOps using env vars from .env
 * - Uses the Management/Enablement API exposed by the SDK (if available)
 * - Limits the verification to a single repository in a single project
 * - Detects enablement-related methods available on the management API and calls them
 *
 * Usage: configure `.env` (AZDO_ORG_URL and AZDO_PAT at minimum) and run
 */

import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

function short(v) {
  try {
    if (v === undefined) return '(undefined)';
    if (v === null) return '(null)';
    if (typeof v === 'string') return v;
    if (typeof v === 'boolean') return String(v);
    if (typeof v === 'object') return JSON.stringify(v, Object.keys(v).slice(0, 10), 2);
    return String(v);
  } catch (e) {
    return '(unserializable)';
  }
}

async function tryCall(api, name, ...args) {
  if (typeof api[name] !== 'function') throw new Error(`Method ${name} not a function`);
  try {
    return await api[name](...args);
  } catch (err) {
    // Re-throw in a richer error
    const e = new Error(`Invocation of ${name} failed: ${err?.message || String(err)}`);
    e.cause = err;
    throw e;
  }
}

function pickBest(candidates, pattern) {
  for (const c of candidates) {
    if (pattern.test(c)) return c;
  }
  return undefined;
}

async function main() {
  try {
    // Connect to Azure DevOps
    const orgUrlFromAzureEnv = process.env.AZURE_DEVOPS_BASE_URL && process.env.AZURE_DEVOPS_ORG
      ? `${process.env.AZURE_DEVOPS_BASE_URL.replace(/\/$/, '')}/${process.env.AZURE_DEVOPS_ORG}`
      : undefined;

    const orgUrl = process.env.AZDO_ORG_URL || process.env.AZDO_OR || orgUrlFromAzureEnv;
    const pat = process.env.AZDO_PAT || process.env.AZDO_PERSONAL_ACCESS_TOKEN || process.env.AZURE_DEVOPS_PAT;

    if (!orgUrl || !pat) {
      throw new Error('Missing required environment variables: AZDO_ORG_URL and AZDO_PAT');
    }

    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    const conn = new azdev.WebApi(orgUrl, authHandler);
    await conn.connect();

    console.log('=== Advanced Security Enablement (SDK) ===\n');

    // Does the WebApi expose a management API factory?
    const mgmtFactoryNames = Object.getOwnPropertyNames(Object.getPrototypeOf(conn))
      .filter(n => n.toLowerCase().includes('management') || n.toLowerCase().includes('managementapi') || n.toLowerCase().includes('get')); // keep broad

    // Prefer known-getManagementApi
    const mgmtFactory = (typeof conn.getManagementApi === 'function') ? 'getManagementApi' : pickBest(mgmtFactoryNames, /management/i);

    if (!mgmtFactory || typeof conn[mgmtFactory] !== 'function') {
      console.error('❌ Management API factory not available on this WebApi instance. Cannot use SDK enablement APIs.');
      process.exit(1);
    }

    console.log(`Using factory: ${mgmtFactory}()`);

    const mgmt = await conn[mgmtFactory]();

    // Discover enablement-related methods on management API
    const mgmtProto = Object.getOwnPropertyNames(Object.getPrototypeOf(mgmt)).filter(n => typeof mgmt[n] === 'function');
    const enableMethods = mgmtProto.filter(n => /enable/i.test(n));

    if (!enableMethods || enableMethods.length === 0) {
      console.error('❌ No enablement-related methods were discovered on the management API instance.');
      console.error('Available methods (sample):', mgmtProto.slice(0, 40).join(', '));
      process.exit(1);
    }

    console.log('✅ Found enablement-related methods:');
    for (const m of enableMethods) console.log(`  - ${m}`);

    // Get a single project & repo to test against
    const coreApi = await conn.getCoreApi();
    const gitApi = await conn.getGitApi();

    const projects = await coreApi.getProjects();
    if (!projects || projects.length === 0) {
      console.error('No projects available to test with.');
      process.exit(1);
    }

    const targetProjectName = process.env.AZDO_PROJECT || projects[0].name;
    const project = projects.find(p => p.name === targetProjectName) || projects[0];
    console.log(`\nUsing project: ${project.name} (id: ${project.id})`);

    const repos = await gitApi.getRepositories(project.id);
    if (!repos || repos.length === 0) {
      console.error(`No repositories found in project "${project.name}".`);
      process.exit(1);
    }

    const repo = repos[0];
    console.log(`Using repository: ${repo.name} (id: ${repo.id})\n`);

    // Attempt org-level enablement check
    console.log('--- Organization-level enablement ---');
    let orgResult;
    const orgCandidates = enableMethods.filter(n => /org|organization|organizationenablement|getenablement|enablement$/i.test(n));
    // fallback to generic getEnablement
    if (orgCandidates.length === 0) orgCandidates.push(...enableMethods.filter(n => /enablement/i.test(n)));

    let invoked = false;
    for (const candidate of orgCandidates) {
      try {
        // try plausible argument lists for org-level: none, includeAllProperties flag
        const tryArgs = [[], [true]];
        for (const args of tryArgs) {
          try {
            const res = await tryCall(mgmt, candidate, ...args);
            orgResult = res;
            console.log(`Called ${candidate}(${args.map(a => short(a)).join(', ')})`);
            console.log('Org enablement result keys:', Object.keys(orgResult || {}).slice(0, 20).join(', '));
            invoked = true;
            break;
          } catch (e) {
            // continue to next args
          }
        }
      } catch (e) {
        // continue
      }
      if (invoked) break;
    }

    if (!invoked) {
      console.log('Could not invoke a management API method for organization-level enablement.');
    }

    // Attempt project-level enablement check
    console.log('\n--- Project-level enablement ---');
    let projResult;
    const projCandidates = enableMethods.filter(n => /project/i.test(n)) || [];
    invoked = false;
    for (const candidate of projCandidates.length ? projCandidates : enableMethods) {
      try {
        // try passing project name or id
        const tryArgs = [[project.name], [project.id], [project.name, true]];
        for (const args of tryArgs) {
          try {
            const res = await tryCall(mgmt, candidate, ...args);
            projResult = res;
            console.log(`Called ${candidate}(${args.map(a => short(a)).join(', ')})`);
            console.log('Project enablement result keys:', Object.keys(projResult || {}).slice(0, 20).join(', '));
            invoked = true;
            break;
          } catch (e) {
            // continue
          }
        }
      } catch (e) {
        // continue
      }
      if (invoked) break;
    }

    if (!invoked) {
      console.log('Could not invoke a management API method for project-level enablement.');
    }

    // Attempt repository-level enablement check
    console.log('\n--- Repository-level enablement ---');
    let repoResult;
    const repoCandidates = enableMethods.filter(n => /repo|repository/i.test(n)) || [];
    invoked = false;

    // helper: find entry in arrays of repo enablement statuses
    function findRepoEntry(list, repoId) {
      if (!Array.isArray(list)) return undefined;
      const rid = (repoId || '').toString().toLowerCase();
      for (const e of list) {
        if (!e || typeof e !== 'object') continue;
        // common keys
        const candidates = [e.repositoryId, e.repoId, e.id, e.repository?.id, e.repository?.repositoryId, e.repository?.repoId, e.repository?.name, e.repository?.remoteUrl];
        for (const c of candidates) {
          if (!c) continue;
          if (String(c).toLowerCase() === rid) return e;
          if (String(c).toLowerCase().includes(rid)) return e;
        }
        // also check name match
        if (e.repository && e.repository.name && String(e.repository.name).toLowerCase() === (repo.name || '').toLowerCase()) return e;
        if (e.name && String(e.name).toLowerCase() === (repo.name || '').toLowerCase()) return e;
      }
      return undefined;
    }

    function interpretEnablementObject(obj) {
      if (!obj || typeof obj !== 'object') return { state: 'unknown', reason: '(no data)' };

      // If explicit boolean field exists
      const boolKeys = ['isEnabled', 'enabled', 'isEnabledForRepo', 'enableOnCreate'];
      for (const k of boolKeys) {
        if (typeof obj[k] === 'boolean') return { state: obj[k] ? 'enabled' : 'disabled', reason: `${k}=${obj[k]}` };
      }

      // If explicit status field
      const statusKeys = ['enablementStatus', 'status', 'state', 'repoEnablementState'];
      for (const k of statusKeys) {
        if (typeof obj[k] === 'string') return { state: obj[k].toLowerCase().includes('enable') ? 'enabled' : 'disabled', reason: `${k}=${obj[k]}` };
      }

      // If object is empty but present
      if (Object.keys(obj).length === 0) return { state: 'unknown', reason: '(empty object)' };

      // Fallback: we couldn't determine
      return { state: 'unknown', reason: `keys: ${Object.keys(obj).slice(0,10).join(',')}` };
    }

    // Try invoking candidate repo methods with many argument permutations
    const triedCalls = [];
    const repoTryArgs = [[repo.id], [project.id, repo.id], [project.name, repo.id], [project.name, repo.name, repo.id], [repo.name], [project.id, repo.name]];

    for (const candidate of repoCandidates.length ? repoCandidates : enableMethods) {
      for (const args of repoTryArgs) {
        if (invoked) break;
        try {
          try {
            const res = await tryCall(mgmt, candidate, ...args);
            repoResult = res;
            console.log(`Called ${candidate}(${args.map(a => short(a)).join(', ')})`);
            console.log('Repository enablement result keys:', Object.keys(repoResult || {}).slice(0, 20).join(', '));
            invoked = true;
            break;
          } catch (e) {
            triedCalls.push({ candidate, args, error: e.message });
            // continue
          }
        } catch (e) {
          // continue
        }
      }
      if (invoked) break;
    }

    if (!invoked) {
      console.log('Could not invoke a management API method for repository-level enablement. Will attempt to locate repo records in org/project results.');
    }

    // If repoResult is empty, try to find matching repo entry in org/proj bodies
    let matchedEntry;
    matchedEntry = matchedEntry || findRepoEntry(orgResult?.reposEnablementStatus, repo.id);
    matchedEntry = matchedEntry || findRepoEntry(projResult?.reposEnablementStatus, repo.id);

    if (matchedEntry) {
      console.log('Found repository enablement entry in org/project enablement lists:');
      console.log(short(matchedEntry));
      // interpret
    } else if (repoResult && Object.keys(repoResult).length === 0) {
      console.log('Repository-level API returned an empty object for this repo.');
    }

    // Summarize with Enabled/Disabled/Unknown resolution
    function resolveStatus({ org, proj, repoEntry, repoDirect }) {
      // repoDirect wins if explicit
      if (repoDirect) {
        const r = interpretEnablementObject(repoDirect);
        return { which: 'repo', result: r };
      }
      // then repoEntry
      if (repoEntry) {
        const r = interpretEnablementObject(repoEntry);
        return { which: 'repoEntry', result: r };
      }
      // project-level
      if (proj) {
        // if project has explicit repo list, inspect
        const match = findRepoEntry(proj.reposEnablementStatus || [], repo.id);
        if (match) return { which: 'project.reposEnablementStatus', result: interpretEnablementObject(match) };
        const r = interpretEnablementObject(proj);
        return { which: 'project', result: r };
      }
      // org-level
      if (org) {
        const match = findRepoEntry(org.reposEnablementStatus || [], repo.id);
        if (match) return { which: 'org.reposEnablementStatus', result: interpretEnablementObject(match) };
        const r = interpretEnablementObject(org);
        return { which: 'org', result: r };
      }
      return { which: 'unknown', result: { state: 'unknown', reason: '(no data anywhere)' } };
    }

    const resolved = resolveStatus({ org: orgResult, proj: projResult, repoEntry: matchedEntry, repoDirect: repoResult });

    console.log('\n=== Summary ===');

    // Organization summary
    const orgSummary = interpretEnablementObject(orgResult);
    console.log('Organization-level:');
    console.log(`  state: ${orgSummary.state} - ${orgSummary.reason}`);

    // Project summary
    const projSummary = interpretEnablementObject(projResult);
    console.log('\nProject-level:');
    console.log(`  state: ${projSummary.state} - ${projSummary.reason}`);

    // Repository summary
    console.log('\nRepository-level:');
    if (resolved.result && resolved.result.state) {
      console.log(`  resolved-from: ${resolved.which}`);
      console.log(`  state: ${resolved.result.state} - ${resolved.result.reason}`);
    } else {
      console.log('  (no data)');
    }

    // If there were tried calls that failed, show a brief note
    if (triedCalls.length > 0) {
      console.log('\nNote: attempted repository API calls that failed:');
      for (const t of triedCalls.slice(0, 6)) {
        console.log(`  ${t.candidate}(${t.args.map(a => short(a)).join(', ')}): ${t.error}`);
      }
      if (triedCalls.length > 6) console.log(`  ...and ${triedCalls.length - 6} more`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
}

main();
