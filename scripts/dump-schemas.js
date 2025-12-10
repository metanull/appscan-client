#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const swaggerPath = path.resolve(process.cwd(), 'doc', 'appscan-swagger-v4.json');
if (!fs.existsSync(swaggerPath)) { console.error('Swagger not found'); process.exit(1); }
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
const schemas = swagger.components?.schemas || {};
const names = ['ApplicationModel','MinScanModel','IssueModel','IssueModelPageResultModel','ScanModel','ScanExecutionModel','ReportStatusModel'];
names.forEach(name => {
  console.log('\n----- ' + name + ' -----');
  const s = schemas[name];
  if (!s) { console.log('  (not found)'); return; }
  if (s.properties) {
    Object.entries(s.properties).forEach(([k,v]) => {
      const type = v.type || (v.$ref ? 'object(ref)' : 'unknown');
      const enumv = v.enum ? JSON.stringify(v.enum) : '';
      const format = v.format ? ` format:${v.format}` : '';
      console.log(`  - ${k}: ${type}${format}${enumv ? ' enums='+enumv : ''}`);
    });
  } else {
    console.log('  (no properties)');
  }
});
console.log('\nDone');
