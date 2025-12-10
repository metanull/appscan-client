#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const swaggerPath = path.resolve(process.cwd(), 'doc', 'appscan-swagger-v4.json');
if (!fs.existsSync(swaggerPath)) {
  console.error('Swagger file not found:', swaggerPath);
  process.exit(2);
}
const raw = fs.readFileSync(swaggerPath, 'utf8');
const swagger = JSON.parse(raw);
const schemas = (swagger.components && swagger.components.schemas) || {};
const keys = Object.keys(schemas);
console.log('Found', keys.length, 'schemas');

const interesting = keys.filter(k => /Issue|Scan|App|Application|Report|Article/i.test(k));
console.log('\nSchemas matching Issue/Scan/App/Report/Article:');
interesting.forEach(k => console.log(' -', k));

function printPathInfo(p) {
  const methods = swagger.paths[p];
  if (!methods) return;
  console.log('\nPath:', p);
  Object.entries(methods).forEach(([m, op]) => {
    console.log('  ', m.toUpperCase(), '-', op.operationId || op.summary || '');
    if (op.responses) {
      Object.entries(op.responses).forEach(([status, resp]) => {
        const content = resp.content || {};
        Object.entries(content).forEach(([type, body]) => {
          const schema = body.schema || {};
          if (schema.$ref) {
            console.log(`    ${status} -> ${type} -> ref: ${schema.$ref}`);
          } else if (schema.items && schema.items.$ref) {
            console.log(`    ${status} -> ${type} -> items ref: ${schema.items.$ref}`);
          }
        });
      });
    }
  });
}

['/api/v4/Apps','/api/v4/Scans','/api/v4/Issues','/api/v4/Reports/Article'].forEach(printPathInfo);

// Also search for any path containing /Apps, /Scans, /Issues, /Reports/Article
console.log('\nPaths containing Apps/Scans/Issues/Reports/Article:');
Object.keys(swagger.paths).filter(p => /\/api\/v4\/(Apps|Scans|Issues|Reports\/Article)/i.test(p)).forEach(p => console.log(' -', p));

// Print enum fields for a few chosen schemas if present
const enumsToInspect = ['IssueModel','MinScanModel','ScanModel','ApplicationModel','AppModel','IssueDetails','IssueViewModel','MinIssueModel'];
console.log('\nInspecting enum-containing schemas (best-effort):');
enumsToInspect.forEach(name => {
  if (schemas[name]) {
    const s = schemas[name];
    const enumFields = [];
    if (s.properties) {
      Object.entries(s.properties).forEach(([prop, def]) => {
        if (def && def.enum) {
          enumFields.push({ prop, enum: def.enum });
        }
      });
    }
    if (enumFields.length) {
      console.log(`\nSchema: ${name}`);
      enumFields.forEach(e => console.log(` - ${e.prop}: ${JSON.stringify(e.enum)}`));
    }
  }
});

console.log('\nDone.');
