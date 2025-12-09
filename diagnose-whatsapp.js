#!/usr/bin/env node

/**
 * WhatsApp Connection Diagnostics
 * 
 * Run this to check if everything is configured correctly
 * Usage: node diagnose-whatsapp.js
 */

const https = require('https');

function checkBridgeHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'beeline-bridge.onrender.com',
      path: '/health',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            ok: true,
            status: health.status,
            vendors: health.vendors,
            maxVendors: health.maxVendors,
            redis: health.redis,
            memory: health.memory?.heapUsed
          });
        } catch (e) {
          resolve({ ok: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ ok: false, error: e.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ ok: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 WhatsApp Connection Diagnostics\n');
  console.log('================================\n');

  console.log('1️⃣ Checking Bridge Service...');
  const health = await checkBridgeHealth();

  if (!health.ok) {
    console.log(`   ❌ FAILED: ${health.error}`);
    console.log('\n   This means the WhatsApp bridge service is not accessible.');
    console.log('   Check:');
    console.log('   - Is the bridge deployed on Render?');
    console.log('   - Does it have all environment variables set?');
    console.log('   - Is the database connection working?');
    process.exit(1);
  }

  console.log(`   ✅ Bridge is ${health.status}`);
  console.log(`   📊 Vendors: ${health.vendors}/${health.maxVendors}`);
  console.log(`   💾 Memory: ${Math.round(health.memory / 1024 / 1024)}MB`);

  if (health.redis === 'timeout') {
    console.log(`   ⚠️  Redis connection timeout (non-critical)`);
  } else if (health.redis === 'disconnected') {
    console.log(`   ⚠️  Redis disconnected (non-critical)`);
  } else {
    console.log(`   ✅ Redis: ${health.redis}`);
  }

  if (health.status !== 'healthy') {
    console.log('\n   ⚠️  Bridge status is not "healthy"!');
    console.log('   It may be restarting or having issues.');
    console.log('   Wait 30-60 seconds and try again.');
  }

  console.log('\n2️⃣ Environment Variables...');

  const env = {
    CLOUD_BRIDGE_URL: process.env.CLOUD_BRIDGE_URL,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '***set***' : '❌ NOT SET',
  };

  Object.entries(env).forEach(([key, value]) => {
    if (value === '❌ NOT SET') {
      console.log(`   ❌ ${key}: NOT SET`);
    } else if (value === '***set***') {
      console.log(`   ✅ ${key}: set`);
    } else {
      console.log(`   ℹ️  ${key}: ${value}`);
    }
  });

  if (!process.env.CLOUD_BRIDGE_URL) {
    console.log('\n   ⚠️  CLOUD_BRIDGE_URL not set!');
    console.log('   Should be: https://beeline-bridge.onrender.com');
    console.log('   Add to .env.local or Vercel dashboard');
  }

  console.log('\n3️⃣ Testing QR Generation...');
  console.log('   Would make a test request, but skipping for now.');
  console.log('   Try connecting with a test phone number instead.');

  console.log('\n✅ Diagnostics Complete!');
  console.log('\nNext Steps:');
  console.log('1. If bridge is not healthy, check Render logs');
  console.log('2. Make sure DATABASE_URL is correct in bridge .env');
  console.log('3. Try connecting with your phone number again');
  console.log('4. If still failing, check browser console for detailed error\n');
}

main().catch(console.error);
