/**
 * Redis Sync Utilities for Phone Bridge Clustering
 * PROJECT OS - Phase 2: Concurrent Clustering Implementation
 *
 * Handles state synchronization between Pi master and phone addon nodes
 * Uses Redis pub/sub for real-time state updates
 *
 * FIXED: Added retry logic, TLS support, and graceful degradation for mobile networks
 */

import Redis from 'ioredis';

// PROJECT OS - Phase 2: Redis Connection
let redis = null;
let redisAvailable = false;
let connectionAttempts = 0;
const MAX_INITIAL_RETRIES = 5;

// PROJECT OS - Phase 1 FIX: Robust Redis initialization with TLS and retry logic
export async function initRedis() {
  if (redis && redisAvailable) return redis;

  try {
    connectionAttempts++;

    // Build Redis options with mobile-optimized settings
    const redisOptions = {
      maxRetriesPerRequest: 3, // Limit retries to prevent hanging on mobile networks
      enableReadyCheck: false,
      connectTimeout: 15000, // 15 second timeout for mobile networks
      retryStrategy(times) {
        if (times > 3) {
          console.warn(`⚠️  Redis connection failed after ${times} retries, entering offline mode`);
          redisAvailable = false;
          return null; // Stop retrying after 3 attempts
        }
        const delay = Math.min(times * 1000, 5000); // Exponential backoff: 1s, 2s, 3s, max 5s
        console.log(`🔄 Redis retry attempt ${times}, waiting ${delay}ms...`);
        return delay;
      },
      reconnectOnError(err) {
        console.log('🔄 Redis reconnect on error:', err.message);
        return true; // Always attempt reconnection
      },
      family: 4 // Force IPv4 (mobile networks prefer IPv4)
    };

    // Detect Upstash or rediss scheme - enable TLS if needed
    let redisClientUrl = process.env.REDIS_URL;
    try {
      const parsed = new URL(process.env.REDIS_URL);
      const scheme = parsed.protocol; // e.g. 'redis:' or 'rediss:'
      const host = parsed.hostname || '';

      // If the URL explicitly uses rediss:// or the hostname indicates Upstash, enable TLS
      if (scheme === 'rediss:' || host.includes('upstash.io') || process.env.REDIS_URL.startsWith('rediss://')) {
        console.log(`🔒 Detected TLS-required Redis (${host}) - enabling TLS`);
        redisOptions.tls = { servername: host };
      }
    } catch (e) {
      console.debug('Could not parse REDIS_URL for TLS detection, proceeding with provided URL');
    }

    // Initialize Redis client
    redis = new Redis(redisClientUrl, redisOptions);

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      redisAvailable = false;

      // MOBILE NETWORK FIX: Common mobile network errors
      if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
        console.warn('⚠️  Mobile network may be blocking Redis. Switching to offline mode.');
        console.warn('💡 Tip: Try connecting to WiFi or check mobile data settings');
      }
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected for phone sync');
      redisAvailable = true;
      connectionAttempts = 0; // Reset counter on successful connection
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready for phone sync');
      redisAvailable = true;
    });

    redis.on('close', () => {
      console.warn('⚠️  Redis connection closed');
      redisAvailable = false;
    });

    // Wait for connection or timeout
    await Promise.race([
      new Promise((resolve) => redis.once('ready', resolve)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
    ]);

    return redis;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);

    // Graceful degradation: Allow phone to operate offline
    if (connectionAttempts < MAX_INITIAL_RETRIES) {
      console.log(`🔄 Will retry Redis connection on next sync attempt (${connectionAttempts}/${MAX_INITIAL_RETRIES})`);
    } else {
      console.warn('⚠️  Max Redis retries reached. Phone bridge running in OFFLINE MODE');
      console.warn('💡 State sync disabled. Restart to retry Redis connection.');
    }

    redisAvailable = false;
    return null;
  }
}

// PROJECT OS - Phase 2: Sync with Pi Master (with offline mode)
export async function syncWithMaster() {
  const redisClient = await initRedis();

  // OFFLINE MODE: Phone can operate without Redis sync
  if (!redisClient || !redisAvailable) {
    console.warn('⚠️  Redis unavailable - phone bridge running in OFFLINE mode');
    console.warn('💡 QR generation and sessions will work, but no state sync with Pi');
    return false;
  }

  try {
    // Subscribe to master state updates
    const subscriber = redisClient.duplicate();
    await subscriber.subscribe('beeline:master:state');

    subscriber.on('message', (_channel, message) => {
      try {
        const masterState = JSON.parse(message);
        console.log('🔄 Received state update from Pi master:', masterState);

        // Update local state based on master
        updateLocalState(masterState);
      } catch (error) {
        console.error('❌ Failed to parse master state:', error);
      }
    });

    // Request initial sync
    await redisClient.publish('beeline:addon:request_sync', JSON.stringify({
      nodeId: process.env.NODE_ID || 'phone-addon-1',
      nodeType: 'addon',
      phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
      timestamp: new Date().toISOString()
    }));

    console.log('✅ Subscribed to Pi master sync');
    return true;
  } catch (error) {
    console.error('❌ Failed to sync with master:', error);
    console.warn('⚠️  Continuing in offline mode');
    return false;
  }
}

// PROJECT OS - Phase 2: Publish Local State (with offline mode)
export async function publishState(state) {
  const redisClient = await initRedis();

  // OFFLINE MODE: Skip state publishing if Redis unavailable
  if (!redisClient || !redisAvailable) {
    console.debug('⚠️  Redis unavailable - skipping state publish');
    return false;
  }

  try {
    const stateMessage = JSON.stringify({
      nodeId: process.env.NODE_ID || 'phone-addon-1',
      nodeType: 'addon',
      phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
      state: state,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish('beeline:addon:state', stateMessage);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish state:', error);
    return false;
  }
}

// PROJECT OS - Phase 2: Update Local State from Master
function updateLocalState(masterState) {
  try {
    // Update local vendor personas if changed
    if (masterState.personas) {
      console.log('📝 Updating local personas from master');
      // TODO: Implement persona sync
    }

    // Update local HITL settings
    if (masterState.hitl) {
      console.log('🎯 Updating HITL settings from master');
      // TODO: Implement HITL sync
    }

    // Update enterprise configurations
    if (masterState.enterprise) {
      console.log('🏢 Updating enterprise config from master');
      // TODO: Implement enterprise sync
    }

  } catch (error) {
    console.error('❌ Failed to update local state:', error);
  }
}

// PROJECT OS - Phase 2: Request Specific Data from Master (with offline mode)
export async function requestFromMaster(dataType) {
  const redisClient = await initRedis();

  // OFFLINE MODE: Return null if Redis unavailable
  if (!redisClient || !redisAvailable) {
    console.debug(`⚠️  Redis unavailable - cannot request ${dataType} from master`);
    return null;
  }

  try {
    const request = JSON.stringify({
      nodeId: process.env.NODE_ID || 'phone-addon-1',
      requestType: dataType,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish('beeline:addon:request', request);

    // Wait for response (simple implementation)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️  Timeout waiting for ${dataType} from master`);
        resolve(null);
      }, 5000); // 5 second timeout

      const subscriber = redisClient.duplicate();
      subscriber.subscribe(`beeline:master:response:${process.env.NODE_ID || 'phone-addon-1'}`);

      subscriber.on('message', (_channel, message) => {
        clearTimeout(timeout);
        subscriber.unsubscribe();
        resolve(JSON.parse(message));
      });
    });
  } catch (error) {
    console.error('❌ Failed to request from master:', error);
    return null;
  }
}

// PROJECT OS - Phase 2: Health Check Sync
export async function reportHealth(healthData) {
  await publishState({
    health: healthData,
    lastHealthCheck: new Date().toISOString()
  });
}

// PROJECT OS - Phase 2: Session Migration (for load balancing)
export async function migrateSession(sessionId, targetNode) {
  const redisClient = await initRedis();

  // OFFLINE MODE: Cannot migrate without Redis
  if (!redisClient || !redisAvailable) {
    console.warn(`⚠️  Redis unavailable - cannot migrate session ${sessionId}`);
    return false;
  }

  try {
    await redisClient.publish('beeline:migrate', JSON.stringify({
      sessionId,
      fromNode: process.env.NODE_ID || 'phone-addon-1',
      toNode: targetNode,
      timestamp: new Date().toISOString()
    }));

    return true;
  } catch (error) {
    console.error('❌ Failed to migrate session:', error);
    return false;
  }
}

// PROJECT OS - Phase 1 FIX: Export Redis availability status
export function isRedisAvailable() {
  return redisAvailable;
}

// PROJECT OS - Phase 1 FIX: Get Redis connection stats
export function getRedisStats() {
  return {
    connected: redisAvailable,
    connectionAttempts,
    maxRetries: MAX_INITIAL_RETRIES,
    status: redisAvailable ? 'online' : 'offline'
  };
}