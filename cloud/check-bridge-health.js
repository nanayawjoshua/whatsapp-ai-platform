#!/usr/bin/env node

/**
 * Bridge Health Check & Wake-up
 * Attempts to revive the bridge on Render if it's sleeping
 */

import axios from 'axios';

const BRIDGE_URL = 'https://beeline-bridge.onrender.com';
const HEALTH_ENDPOINT = `${BRIDGE_URL}/health`;

async function checkBridge() {
  console.log('🔍 Checking WhatsApp Bridge Status...\n');
  console.log(`Bridge URL: ${BRIDGE_URL}`);
  console.log(`Health Endpoint: ${HEALTH_ENDPOINT}\n`);

  try {
    console.log('⏳ Attempting to reach bridge (this may take 30-60 seconds if it\'s sleeping)...\n');
    
    const startTime = Date.now();
    const response = await axios.get(HEALTH_ENDPOINT, {
      timeout: 120000, // 2 minute timeout for Render cold start
      headers: {
        'User-Agent': 'Beeline-Health-Check/1.0'
      }
    });

    const elapsed = Date.now() - startTime;
    
    console.log(`✅ Bridge is HEALTHY!\n`);
    console.log(`Status Code: ${response.status}`);
    console.log(`Response Time: ${elapsed}ms`);
    console.log(`\nBridge Status:\n`);
    
    const data = response.data;
    console.log(`  Status: ${data.status}`);
    console.log(`  Redis: ${data.redis}`);
    console.log(`  Active Vendors: ${data.vendors}/${data.maxVendors}`);
    console.log(`  Memory: ${(data.memory.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(data.memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Uptime: ${(data.uptime / 60).toFixed(1)} minutes`);
    console.log(`  Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    
    return true;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log(`⚠️  Request timed out (took > 2 minutes)`);
      console.log(`The bridge may be cold-starting on Render.`);
      console.log(`\nNext Steps:`);
      console.log(`1. Visit https://dashboard.render.com`);
      console.log(`2. Find service: "beeline-bridge"`);
      console.log(`3. Check if it's running or sleeping`);
      console.log(`4. If sleeping, visit ${BRIDGE_URL} in browser to wake it`);
      console.log(`5. Wait 30-60 seconds for cold start`);
      console.log(`6. Run this check again\n`);
      return false;
    }
    
    if (error.response?.status) {
      console.log(`❌ Bridge returned error: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`❌ Cannot reach bridge: ${error.message}`);
      console.log(`\nPossible causes:`);
      console.log(`- Bridge is sleeping (Render free tier)`);
      console.log(`- Bridge service crashed`);
      console.log(`- Network/DNS issue`);
      console.log(`- Render is down`);
      console.log(`\nTo wake up the bridge:`);
      console.log(`curl ${HEALTH_ENDPOINT}`);
      console.log(`\nOr visit in browser: ${HEALTH_ENDPOINT}`);
    }
    return false;
  }
}

checkBridge().then(success => {
  process.exit(success ? 0 : 1);
});
