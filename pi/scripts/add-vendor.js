#!/usr/bin/env node

/**
 * Add a new vendor to Beeline
 * Usage: npm run add-vendor <vendor-id>
 * Example: npm run add-vendor mango-shop-001
 */

import 'dotenv/config';
import { addVendor } from '../index.js';

const vendorId = process.argv[2];

if (!vendorId) {
  console.log(`
Usage: npm run add-vendor <vendor-id>

Example:
  npm run add-vendor mango-shop-001
  npm run add-vendor supermarket-accra
  npm run add-vendor pharmacy-kumasi

The vendor will need to scan the QR code with their WhatsApp.
Their session will be saved and auto-reconnect on Pi restart.
  `);
  process.exit(1);
}

// Validate vendor ID
if (!/^[a-z0-9-]+$/.test(vendorId)) {
  console.error('❌ Vendor ID must be lowercase alphanumeric with hyphens only');
  console.error('Example: mango-shop-001');
  process.exit(1);
}

console.log(`\n🐝 Adding vendor: ${vendorId}`);
console.log('📱 QR code will appear below — vendor should scan with WhatsApp\n');

try {
  await addVendor(vendorId);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
