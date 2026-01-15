#!/usr/bin/env node
// Check if upgraded client exposes Advanced Security APIs
import { getAzdoClient } from './azdo-auth.js';

(async function main(){
  try {
    const conn = await getAzdoClient();
    console.log('connection methods available:');
    console.log(' getAdvancedSecurityManagementApi:', typeof conn.getAdvancedSecurityManagementApi === 'function');
    console.log(' getAdvancedSecurityAlertApi:', typeof conn.getAdvancedSecurityAlertApi === 'function');

    if (typeof conn.getAdvancedSecurityManagementApi === 'function') {
      try {
        const mgmt = await conn.getAdvancedSecurityManagementApi();
        console.log(' mgmt API created:', !!mgmt);
      } catch (e) { console.log(' mgmt create error:', e && e.message); }
    }
    if (typeof conn.getAdvancedSecurityAlertApi === 'function') {
      try {
        const alert = await conn.getAdvancedSecurityAlertApi();
        console.log(' alert API created:', !!alert);
      } catch (e) { console.log(' alert create error:', e && e.message); }
    }

    process.exit(0);
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(2);
  }
})();