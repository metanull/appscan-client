#!/usr/bin/env node
import dotenv from 'dotenv';
import { listFirstProjectRepoAlerts } from './azdo-adv.js';

dotenv.config();

async function main() {
  const apiVersion = process.argv[2] || '7.2-preview.1';
  const r = await listFirstProjectRepoAlerts({ apiVersion });
  console.log('status:', r.status);
  if (r.status === 200) {
    console.log(
      'alerts count:',
      Array.isArray(r.data?.value) ? r.data.value.length : 'unknown'
    );
    console.log(
      'sample:',
      JSON.stringify(
        Array.isArray(r.data?.value) ? r.data.value.slice(0, 5) : r.data,
        null,
        2
      )
    );
  } else {
    console.log('body sample keys:', Object.keys(r.data || {}).slice(0, 10));
    console.log('raw body:', JSON.stringify(r.data || {}).slice(0, 1000));
  }
}

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(2);
});
