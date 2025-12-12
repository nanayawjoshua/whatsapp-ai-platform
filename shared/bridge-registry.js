/**
 * Bridge Registry Service
 * PROJECT OS - Phase 2: Load Balancing & Discovery
 *
 * Centralized service for bridge discovery and health monitoring
 * Allows website to find available bridges (Pi/Phone) for QR generation
 *
 * Features:
 * - Bridge registration with heartbeat
 * - Automatic health monitoring
 * - Load-balanced bridge selection
 * - Failover support
 */

import Redis from 'ioredis';

const BRIDGE_REGISTRY_KEY = 'beeline:bridges:registry';
const BRIDGE_HEARTBEAT_TTL = 60; // 60 seconds - bridge must heartbeat within this time
const BRIDGE_SELECTION_STRATEGY = 'least-loaded'; // 'round-robin' | 'least-loaded' | 'random'

let redis = null;
let redisAvailable = false;

/**
 * Initialize Redis connection for bridge registry
 */
export async function initBridgeRegistry(redisUrl) {
  if (redis && redisAvailable) return redis;

  try {
    // Build Redis options with TLS support
    const redisOptions = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('Bridge registry: Redis connection failed, registry unavailable');
          return null;
        }
        return Math.min(times * 1000, 5000);
      },
      family: 4
    };

    // Detect TLS requirement
    try {
      const parsed = new URL(redisUrl);
      const scheme = parsed.protocol;
      const host = parsed.hostname || '';

      if (scheme === 'rediss:' || host.includes('upstash.io')) {
        redisOptions.tls = { servername: host };
      }
    } catch (e) {
      console.debug('Could not parse Redis URL for TLS detection');
    }

    redis = new Redis(redisUrl, redisOptions);

    redis.on('error', (err) => {
      console.error('Bridge registry Redis error:', err.message);
      redisAvailable = false;
    });

    redis.on('connect', () => {
      console.log('✅ Bridge registry connected to Redis');
      redisAvailable = true;
    });

    redis.on('ready', () => {
      redisAvailable = true;
    });

    // Wait for connection
    await Promise.race([
      new Promise((resolve) => redis.once('ready', resolve)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    ]);

    return redis;
  } catch (error) {
    console.error('Failed to initialize bridge registry:', error.message);
    redisAvailable = false;
    return null;
  }
}

/**
 * Register a bridge in the registry
 * @param {Object} bridgeInfo - Bridge information
 * @param {string} bridgeInfo.id - Unique bridge ID (e.g., 'pi-ghana', 'phone-tcl50se')
 * @param {string} bridgeInfo.type - Bridge type ('pi' | 'phone')
 * @param {string} bridgeInfo.url - Bridge base URL
 * @param {string} bridgeInfo.location - Geographic location
 * @param {number} bridgeInfo.capacity - Max sessions this bridge can handle
 * @param {number} bridgeInfo.currentLoad - Current session count
 */
export async function registerBridge(bridgeInfo) {
  if (!redis || !redisAvailable) {
    console.warn('Bridge registry unavailable - cannot register bridge');
    return false;
  }

  try {
    const bridgeData = {
      ...bridgeInfo,
      lastHeartbeat: Date.now(),
      status: 'healthy',
      registeredAt: bridgeInfo.registeredAt || Date.now()
    };

    // Store bridge info with TTL (auto-expires if heartbeat stops)
    await redis.setex(
      `${BRIDGE_REGISTRY_KEY}:${bridgeInfo.id}`,
      BRIDGE_HEARTBEAT_TTL,
      JSON.stringify(bridgeData)
    );

    console.log(`✅ Bridge registered: ${bridgeInfo.id} (${bridgeInfo.type}) at ${bridgeInfo.url}`);
    return true;
  } catch (error) {
    console.error('Failed to register bridge:', error.message);
    return false;
  }
}

/**
 * Update bridge heartbeat (extends TTL)
 * @param {string} bridgeId - Bridge ID
 * @param {Object} healthData - Current health metrics
 */
export async function heartbeat(bridgeId, healthData = {}) {
  if (!redis || !redisAvailable) {
    return false;
  }

  try {
    const key = `${BRIDGE_REGISTRY_KEY}:${bridgeId}`;
    const existingData = await redis.get(key);

    if (!existingData) {
      console.warn(`Bridge ${bridgeId} not found in registry - re-register required`);
      return false;
    }

    const bridgeData = JSON.parse(existingData);
    bridgeData.lastHeartbeat = Date.now();
    bridgeData.currentLoad = healthData.currentLoad || bridgeData.currentLoad || 0;
    bridgeData.status = healthData.status || 'healthy';
    bridgeData.uptime = healthData.uptime;
    bridgeData.batteryLevel = healthData.batteryLevel;

    // Extend TTL
    await redis.setex(key, BRIDGE_HEARTBEAT_TTL, JSON.stringify(bridgeData));

    console.debug(`💓 Heartbeat: ${bridgeId} (load: ${bridgeData.currentLoad}/${bridgeData.capacity})`);
    return true;
  } catch (error) {
    console.error(`Failed to update heartbeat for ${bridgeId}:`, error.message);
    return false;
  }
}

/**
 * Get all healthy bridges from registry
 */
export async function getHealthyBridges() {
  if (!redis || !redisAvailable) {
    console.warn('Bridge registry unavailable - cannot get bridges');
    return [];
  }

  try {
    const keys = await redis.keys(`${BRIDGE_REGISTRY_KEY}:*`);
    const bridges = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const bridge = JSON.parse(data);
        // Check if heartbeat is recent (within TTL)
        const secondsSinceHeartbeat = (Date.now() - bridge.lastHeartbeat) / 1000;
        if (secondsSinceHeartbeat < BRIDGE_HEARTBEAT_TTL) {
          bridges.push(bridge);
        }
      }
    }

    return bridges.filter(b => b.status === 'healthy');
  } catch (error) {
    console.error('Failed to get healthy bridges:', error.message);
    return [];
  }
}

/**
 * Select best bridge for new session based on load balancing strategy
 * @returns {Object|null} Selected bridge info or null if none available
 */
export async function selectBridge() {
  const bridges = await getHealthyBridges();

  if (bridges.length === 0) {
    console.warn('No healthy bridges available for QR generation');
    return null;
  }

  // Filter out bridges at capacity
  const availableBridges = bridges.filter(b => b.currentLoad < b.capacity);

  if (availableBridges.length === 0) {
    console.warn('All bridges at capacity');
    return null;
  }

  let selectedBridge;

  switch (BRIDGE_SELECTION_STRATEGY) {
    case 'least-loaded':
      // Select bridge with lowest current load percentage
      selectedBridge = availableBridges.reduce((best, current) => {
        const bestLoad = best.currentLoad / best.capacity;
        const currentLoadPct = current.currentLoad / current.capacity;
        return currentLoadPct < bestLoad ? current : best;
      });
      break;

    case 'round-robin':
      // Simple round-robin (stateful, would need persistent counter)
      selectedBridge = availableBridges[Math.floor(Math.random() * availableBridges.length)];
      break;

    case 'random':
      // Random selection
      selectedBridge = availableBridges[Math.floor(Math.random() * availableBridges.length)];
      break;

    default:
      selectedBridge = availableBridges[0];
  }

  console.log(`📍 Selected bridge: ${selectedBridge.id} (load: ${selectedBridge.currentLoad}/${selectedBridge.capacity})`);
  return selectedBridge;
}

/**
 * Deregister a bridge from registry
 * @param {string} bridgeId - Bridge ID to remove
 */
export async function deregisterBridge(bridgeId) {
  if (!redis || !redisAvailable) {
    return false;
  }

  try {
    await redis.del(`${BRIDGE_REGISTRY_KEY}:${bridgeId}`);
    console.log(`❌ Bridge deregistered: ${bridgeId}`);
    return true;
  } catch (error) {
    console.error(`Failed to deregister bridge ${bridgeId}:`, error.message);
    return false;
  }
}

/**
 * Get bridge info by ID
 */
export async function getBridgeInfo(bridgeId) {
  if (!redis || !redisAvailable) {
    return null;
  }

  try {
    const data = await redis.get(`${BRIDGE_REGISTRY_KEY}:${bridgeId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to get bridge info for ${bridgeId}:`, error.message);
    return null;
  }
}

/**
 * Check if bridge registry is available
 */
export function isRegistryAvailable() {
  return redisAvailable;
}
