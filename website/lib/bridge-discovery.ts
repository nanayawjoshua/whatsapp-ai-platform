/**
 * Bridge Discovery Client for Website
 * PROJECT OS - Phase 2: Load Balancing Integration
 *
 * Finds available bridges (Pi/Phone) for QR generation
 * Falls back to hardcoded URL if registry unavailable
 */

import Redis from 'ioredis';

interface Bridge {
  id: string;
  type: 'pi' | 'phone' | 'cloud';
  url: string;
  location: string;
  capacity: number;
  currentLoad: number;
  lastHeartbeat: number;
  status: string;
}

const BRIDGE_REGISTRY_KEY = 'beeline:bridges:registry';
const BRIDGE_HEARTBEAT_TTL = 60; // 60 seconds

let redis: Redis | null = null;
let redisAvailable = false;

/**
 * Initialize Redis connection for bridge discovery
 */
async function initRedis() {
  if (redis && redisAvailable) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not set - bridge discovery unavailable');
    return null;
  }

  try {
    const redisOptions: any = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      connectTimeout: 5000,
      retryStrategy(times: number) {
        if (times > 2) return null;
        return Math.min(times * 500, 2000);
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
      console.error('Bridge discovery Redis error:', err.message);
      redisAvailable = false;
    });

    redis.on('connect', () => {
      console.log('✅ Bridge discovery connected to Redis');
      redisAvailable = true;
    });

    // Don't wait for connection - use it opportunistically
    setTimeout(() => {
      if (!redisAvailable) {
        console.warn('Redis not available - using fallback bridge URL');
      }
    }, 3000);

    return redis;
  } catch (error: any) {
    console.error('Failed to initialize bridge discovery:', error.message);
    return null;
  }
}

/**
 * Get all healthy bridges from registry
 */
async function getHealthyBridges(): Promise<Bridge[]> {
  const client = await initRedis();
  if (!client || !redisAvailable) {
    return [];
  }

  try {
    const keys = await client.keys(`${BRIDGE_REGISTRY_KEY}:*`);
    const bridges: Bridge[] = [];

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        const bridge = JSON.parse(data);
        // Check if heartbeat is recent
        const secondsSinceHeartbeat = (Date.now() - bridge.lastHeartbeat) / 1000;
        if (secondsSinceHeartbeat < BRIDGE_HEARTBEAT_TTL) {
          bridges.push(bridge);
        }
      }
    }

    return bridges.filter(b => b.status === 'healthy');
  } catch (error: any) {
    console.error('Failed to get healthy bridges:', error.message);
    return [];
  }
}

/**
 * Select best bridge for new session
 */
async function selectBridge(): Promise<Bridge | null> {
  const bridges = await getHealthyBridges();

  if (bridges.length === 0) {
    return null;
  }

  // Filter out bridges at capacity
  const availableBridges = bridges.filter(b => b.currentLoad < b.capacity);

  if (availableBridges.length === 0) {
    console.warn('All bridges at capacity');
    return null;
  }

  // Select bridge with lowest load percentage (least-loaded strategy)
  const selectedBridge = availableBridges.reduce((best, current) => {
    const bestLoadPct = best.currentLoad / best.capacity;
    const currentLoadPct = current.currentLoad / current.capacity;
    return currentLoadPct < bestLoadPct ? current : best;
  });

  console.log(`📍 Selected bridge: ${selectedBridge.id} (load: ${selectedBridge.currentLoad}/${selectedBridge.capacity})`);
  return selectedBridge;
}

/**
 * Discover available bridge for QR generation
 * Returns bridge URL or null if none available
 *
 * Falls back to CLOUD_BRIDGE_URL env var if registry unavailable
 */
export async function discoverBridge(): Promise<string | null> {
  console.log('🔍 Discovering available bridge...');

  // Try bridge discovery via Redis registry
  try {
    const bridge = await selectBridge();
    if (bridge) {
      console.log(`✅ Found bridge via discovery: ${bridge.id} at ${bridge.url}`);
      return bridge.url;
    }
  } catch (error: any) {
    console.warn('Bridge discovery failed:', error.message);
  }

  // Fallback to hardcoded URL
  const fallbackUrl = process.env.CLOUD_BRIDGE_URL;
  if (fallbackUrl) {
    console.log(`⚠️  Using fallback bridge URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    console.log('📍 Using development bridge URL');
    return 'http://localhost:3000';
  }

  console.error('❌ No bridges available and no fallback URL configured');
  return null;
}

/**
 * Get bridge health status
 */
export async function getBridgeHealth(bridgeUrl: string): Promise<any> {
  try {
    const response = await fetch(`${bridgeUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error: any) {
    console.error('Failed to check bridge health:', error.message);
    return null;
  }
}
