/**
 * Redis Sync Utilities for Phone Bridge Clustering
 * PROJECT OS - Phase 2: Concurrent Clustering Implementation
 *
 * Handles state synchronization between Pi master and phone addon nodes
 * Uses Redis pub/sub for real-time state updates
 */

import Redis from 'ioredis';

// PROJECT OS - Phase 2: Redis Connection
let redis = null;

export async function initRedis() {
  if (redis) return redis;

  try {
    redis = new Redis(process.env.REDIS_URL);

    redis.on('connect', () => {
      console.log('🔄 Redis connected for phone sync');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    return redis;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    return null;
  }
}

// PROJECT OS - Phase 2: Sync with Pi Master
export async function syncWithMaster() {
  const redisClient = await initRedis();
  if (!redisClient) return;

  try {
    // Subscribe to master state updates
    const subscriber = redisClient.duplicate();
    await subscriber.subscribe('beeline:master:state');

    subscriber.on('message', (channel, message) => {
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
  } catch (error) {
    console.error('❌ Failed to sync with master:', error);
  }
}

// PROJECT OS - Phase 2: Publish Local State
export async function publishState(state) {
  const redisClient = await initRedis();
  if (!redisClient) return;

  try {
    const stateMessage = JSON.stringify({
      nodeId: process.env.NODE_ID || 'phone-addon-1',
      nodeType: 'addon',
      phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
      state: state,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish('beeline:addon:state', stateMessage);
  } catch (error) {
    console.error('❌ Failed to publish state:', error);
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

// PROJECT OS - Phase 2: Request Specific Data from Master
export async function requestFromMaster(dataType) {
  const redisClient = await initRedis();
  if (!redisClient) return null;

  try {
    const request = JSON.stringify({
      nodeId: process.env.NODE_ID || 'phone-addon-1',
      requestType: dataType,
      timestamp: new Date().toISOString()
    });

    await redisClient.publish('beeline:addon:request', request);

    // Wait for response (simple implementation)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000); // 5 second timeout

      const subscriber = redisClient.duplicate();
      subscriber.subscribe(`beeline:master:response:${process.env.NODE_ID || 'phone-addon-1'}`);

      subscriber.on('message', (channel, message) => {
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
  if (!redisClient) return false;

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