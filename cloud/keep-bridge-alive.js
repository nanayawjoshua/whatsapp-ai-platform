/**
 * Bridge Keep-Alive Service
 * Prevents Render from sleeping the bridge service
 * 
 * Problem: Render free tier sleeps services after 15 min of inactivity
 * Solution: Ping every 10 minutes to keep service awake
 * 
 * Usage:
 *   node keep-bridge-alive.js
 * 
 * Better: Deploy as serverless cron job on EasyCron or similar
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BRIDGE_URL = process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // Ping every 10 minutes (Render sleep is after 15 min)
const HEALTH_ENDPOINT = `${BRIDGE_URL}/health`;

let isRunning = false;

async function pingBridge() {
  try {
    const startTime = Date.now();
    const response = await axios.get(HEALTH_ENDPOINT, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Beeline-Keep-Alive/1.0'
      }
    });

    const elapsed = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    if (response.status === 200) {
      const data = response.data;
      console.log(`[${timestamp}] ✅ Keep-alive ping successful`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Vendors: ${data.vendors}/${data.maxVendors}`);
      console.log(`   Response time: ${elapsed}ms`);
      return true;
    } else {
      console.log(`[${timestamp}] ⚠️  Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Keep-alive ping failed: ${error.message}`);
    return false;
  }
}

async function startKeepAlive() {
  console.log('🔄 Starting Bridge Keep-Alive Service');
  console.log(`   Bridge: ${BRIDGE_URL}`);
  console.log(`   Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);
  console.log(`   Purpose: Prevent Render cold sleep\n`);

  isRunning = true;

  // Initial ping
  await pingBridge();

  // Set up recurring ping
  setInterval(async () => {
    if (isRunning) {
      await pingBridge();
    }
  }, PING_INTERVAL);

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping keep-alive service...');
    isRunning = false;
    process.exit(0);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startKeepAlive();
}

export { pingBridge, startKeepAlive };
