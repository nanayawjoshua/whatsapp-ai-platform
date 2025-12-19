#!/usr/bin/env node

/**
 * BEELINE: Auto IP Update Script
 * Automatically updates Cloudflare tunnel route when phone IP changes
 *
 * This solves the dynamic IP problem by detecting IP changes and
 * updating the Cloudflare tunnel route via API.
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

// Debug: Check if env vars loaded
console.log('🔍 Environment check:');
console.log('CLOUDFLARE_API_TOKEN:', process.env.CLOUDFLARE_API_TOKEN ? 'PRESENT' : 'MISSING');
console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID ? 'PRESENT' : 'MISSING');
console.log('Working directory:', process.cwd());
console.log('.env file exists:', fs.existsSync('.env'));

// Configuration
const CONFIG = {
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  tunnelId: 'beeline-bridge', // Your tunnel name
  routeHostname: 'bridge.beeline.works',
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
  ipCacheFile: path.join(process.cwd(), 'current_ip.txt')
};

/**
 * Get current WiFi IP address
 */
function getCurrentIP() {
  try {
    // Try wlan0 first (WiFi) - Android/Termux compatible
    const result = execSync('ip addr show wlan0 2>/dev/null | grep "inet " | head -1 | awk \'{print $2}\' | cut -d/ -f1', { encoding: 'utf8' });
    const ip = result.trim();
    if (ip && ip !== '127.0.0.1' && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return ip;
    }

    // Fallback: Try ap0 (Android hotspot)
    try {
      const apResult = execSync('ip addr show ap0 2>/dev/null | grep "inet " | head -1 | awk \'{print $2}\' | cut -d/ -f1', { encoding: 'utf8' });
      const apIp = apResult.trim();
      if (apIp && apIp !== '127.0.0.1' && apIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return apIp;
      }
    } catch (e) {
      // ap0 not available, continue
    }

    // Last fallback: Try general interface detection
    try {
      const ifconfigResult = execSync('ifconfig 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | head -1 | awk \'{print $2}\'', { encoding: 'utf8' });
      const fallbackIp = ifconfigResult.trim();
      if (fallbackIp && fallbackIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return fallbackIp;
      }
    } catch (e) {
      // ifconfig not available or failed
    }

    return null;
  } catch (error) {
    console.error('Failed to get IP:', error.message);
    return null;
  }
}

/**
 * Get cached IP from file
 */
function getCachedIP() {
  try {
    if (fs.existsSync(CONFIG.ipCacheFile)) {
      return fs.readFileSync(CONFIG.ipCacheFile, 'utf8').trim();
    }
  } catch (error) {
    console.error('Failed to read cached IP:', error.message);
  }
  return null;
}

/**
 * Save IP to cache file
 */
function saveCachedIP(ip) {
  try {
    fs.writeFileSync(CONFIG.ipCacheFile, ip);
  } catch (error) {
    console.error('Failed to save cached IP:', error.message);
  }
}

/**
 * Update Cloudflare tunnel route
 */
async function updateCloudflareRoute(newIP) {
  const serviceUrl = `http://${newIP}:3001`;

  try {
    console.log(`🔄 Updating Cloudflare route to: ${serviceUrl}`);

    // First, get the tunnel ID
    const tunnelsResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/tunnels`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.cloudflareApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tunnelsResponse.ok) {
      throw new Error(`Failed to get tunnels: ${tunnelsResponse.status}`);
    }

    const tunnelsData = await tunnelsResponse.json();
    const tunnel = tunnelsData.result.find(t => t.name === CONFIG.tunnelId);

    if (!tunnel) {
      throw new Error(`Tunnel '${CONFIG.tunnelId}' not found`);
    }

    // Get current routes
    const routesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/tunnels/${tunnel.id}/routes`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.cloudflareApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!routesResponse.ok) {
      throw new Error(`Failed to get routes: ${routesResponse.status}`);
    }

    const routesData = await routesResponse.json();
    const existingRoute = routesData.result.find(r => r.hostname === CONFIG.routeHostname);

    if (existingRoute) {
      // Update existing route
      const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/tunnels/${tunnel.id}/routes/${existingRoute.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CONFIG.cloudflareApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostname: CONFIG.routeHostname,
          service: serviceUrl,
          tls: false // HTTP, not HTTPS
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Failed to update route: ${errorData.errors?.[0]?.message || updateResponse.status}`);
      }

      console.log(`✅ Updated existing route for ${CONFIG.routeHostname}`);
    } else {
      // Create new route
      const createResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/tunnels/${tunnel.id}/routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.cloudflareApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostname: CONFIG.routeHostname,
          service: serviceUrl,
          tls: false
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Failed to create route: ${errorData.errors?.[0]?.message || createResponse.status}`);
      }

      console.log(`✅ Created new route for ${CONFIG.routeHostname}`);
    }

  } catch (error) {
    console.error('❌ Cloudflare API error:', error.message);
    throw error;
  }
}

/**
 * Main monitoring loop
 */
async function monitorIP() {
  console.log('🚀 Starting IP monitoring for Cloudflare tunnel...');
  console.log(`📡 Checking IP every ${CONFIG.checkInterval / 1000 / 60} minutes`);
  console.log(`🌐 Domain: ${CONFIG.routeHostname}`);

  while (true) {
    try {
      const currentIP = getCurrentIP();
      const cachedIP = getCachedIP();

      if (!currentIP) {
        console.warn('⚠️ Could not detect current IP address');
      } else if (currentIP !== cachedIP) {
        console.log(`📍 IP changed: ${cachedIP} → ${currentIP}`);

        // Update Cloudflare route
        await updateCloudflareRoute(currentIP);

        // Save new IP to cache
        saveCachedIP(currentIP);

        console.log(`✅ Cloudflare route updated successfully`);
      } else {
        console.log(`✅ IP unchanged: ${currentIP}`);
      }
    } catch (error) {
      console.error('❌ IP monitoring error:', error.message);
    }

    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
}

// Validate configuration
if (!CONFIG.cloudflareApiToken) {
  console.error('❌ Missing CLOUDFLARE_API_TOKEN environment variable');
  process.exit(1);
}

if (!CONFIG.accountId) {
  console.error('❌ Missing CLOUDFLARE_ACCOUNT_ID environment variable');
  process.exit(1);
}

// Start monitoring
monitorIP().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});