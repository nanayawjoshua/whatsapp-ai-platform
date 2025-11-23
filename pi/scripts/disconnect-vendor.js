#!/usr/bin/env node

/**
 * Disconnect and remove a vendor's session
 * Usage: npm run disconnect <vendor-id>
 */

import fs from 'fs';
import path from 'path';

const vendorId = process.argv[2];
const sessionsPath = process.env.SESSIONS_PATH || './sessions';

if (!vendorId) {
  console.log(`
Usage: npm run disconnect <vendor-id>

Example:
  npm run disconnect mango-shop-001

This will:
1. Remove the vendor's WhatsApp session
2. They will need to scan QR again to reconnect
  `);
  process.exit(1);
}

const vendorPath = path.join(sessionsPath, vendorId);

if (!fs.existsSync(vendorPath)) {
  console.error(`❌ Vendor not found: ${vendorId}`);
  process.exit(1);
}

// Remove session directory
fs.rmSync(vendorPath, { recursive: true, force: true });
console.log(`✅ Vendor disconnected: ${vendorId}`);
console.log('Session removed. They can scan QR again to reconnect.');
