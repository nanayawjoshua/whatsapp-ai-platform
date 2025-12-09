/**
 * Bridge Availability Manager
 * Ensures bridge is awake before making requests
 * Implements: ping-before-request pattern with exponential backoff
 */

import axios from 'axios';
import pino from 'pino';

const logger = pino();

export class BridgeClient {
  constructor(bridgeUrl) {
    this.bridgeUrl = bridgeUrl;
    this.healthEndpoint = `${bridgeUrl}/health`;
    this.maxRetries = 3;
    this.baseDelay = 2000; // Start with 2 second delay
    this.maxWaitTime = 120000; // Max 2 minutes total wait
  }

  /**
   * Ping bridge to wake it up if sleeping
   * Returns true if bridge becomes available
   */
  async ensureBridgeAwake() {
    logger.info('🌐 Ensuring bridge is awake...');
    
    const startTime = Date.now();
    let lastError;
    let delay = this.baseDelay;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug({ attempt }, `Pinging bridge health endpoint (attempt ${attempt}/${this.maxRetries})`);
        
        const response = await axios.get(this.healthEndpoint, {
          timeout: 5000, // 5 second timeout per attempt
          validateStatus: (status) => status < 500 // Accept any status < 500
        });

        if (response.status === 200) {
          const elapsed = Date.now() - startTime;
          logger.info({ elapsed }, `✅ Bridge is awake (${elapsed}ms)`);
          return true;
        }
      } catch (error) {
        lastError = error;
        const elapsed = Date.now() - startTime;

        if (elapsed > this.maxWaitTime) {
          logger.error({ elapsed }, `⏱️ Max wait time exceeded (${elapsed}ms)`);
          return false;
        }

        if (attempt < this.maxRetries) {
          logger.warn({ 
            attempt, 
            delay, 
            error: error.code || error.message 
          }, `Retrying in ${delay}ms...`);
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Exponential backoff: 2s → 5s → 10s
          delay = Math.min(delay * 2, 10000);
        }
      }
    }

    logger.error({ lastError: lastError?.message }, `❌ Bridge did not wake up after ${this.maxRetries} attempts`);
    return false;
  }

  /**
   * Make request to bridge with automatic wake-up
   * Usage: await bridgeClient.request('POST', '/vendor/generate-qr', { vendorId, vendorData })
   */
  async request(method, path, data = null) {
    // Step 1: Ensure bridge is awake
    const awake = await this.ensureBridgeAwake();
    if (!awake) {
      throw new Error('Bridge service is not responding. Please try again later.');
    }

    // Step 2: Make actual request
    const url = `${this.bridgeUrl}${path}`;
    try {
      logger.info({ method, path }, `Making request to bridge...`);
      
      const response = await axios({
        method,
        url,
        data,
        timeout: 30000, // 30 second timeout for actual request
        headers: { 'Content-Type': 'application/json' }
      });

      logger.info({ method, path, status: response.status }, `✅ Bridge request successful`);
      return response.data;
    } catch (error) {
      logger.error({ method, path, error: error.message }, `❌ Bridge request failed`);
      throw error;
    }
  }
}

/**
 * Render helper: Auto-wake bridge using GET request
 * Render sleeps services that have no traffic for 15 minutes
 * This ensures the service wakes up
 */
export async function wakeRenderService(bridgeUrl) {
  try {
    // A simple GET request to any endpoint will wake the service
    await axios.get(`${bridgeUrl}/health`, { timeout: 10000 });
    logger.info('✅ Service wake-up signal sent');
    return true;
  } catch (error) {
    logger.warn({ error: error.message }, 'Wake-up signal failed (service may already be awake)');
    return false;
  }
}

export default BridgeClient;
