#!/usr/bin/env node

/**
 * List all connected vendors
 * Usage: npm run list-vendors
 */

import fs from 'fs';
import path from 'path';

const sessionsPath = process.env.SESSIONS_PATH || './sessions';

if (!fs.existsSync(sessionsPath)) {
  console.log('\n📭 No vendors connected yet.\n');
  console.log('Run: npm run add-vendor <vendor-id>');
  process.exit(0);
}

const vendors = fs.readdirSync(sessionsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => {
    const vendorPath = path.join(sessionsPath, dirent.name);
    const credsPath = path.join(vendorPath, 'creds.json');
    const hasSession = fs.existsSync(credsPath);
    return {
      id: dirent.name,
      hasSession,
      sessionPath: vendorPath
    };
  });

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🐝 BEELINE VENDORS                                          ║
╚══════════════════════════════════════════════════════════════╝
`);

if (vendors.length === 0) {
  console.log('📭 No vendors found.\n');
  console.log('Run: npm run add-vendor <vendor-id>');
} else {
  console.log(`Total: ${vendors.length} vendor(s)\n`);
  vendors.forEach((v, i) => {
    const status = v.hasSession ? '✅ Connected' : '⏳ Pending scan';
    console.log(`${i + 1}. ${v.id} — ${status}`);
  });
  console.log('');
}
