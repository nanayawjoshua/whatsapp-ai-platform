#!/usr/bin/env node

/**
 * Beeline Phone Bridge Server
 * PROJECT OS - Phase 3: Phone-Optimized Bridge Implementation
 *
 * Runs Beeline bridge on Android phones as addon nodes
 * Features:
 * - Residential mobile IP (SIM rotation bypasses blocks)
 * - Battery optimization and monitoring
 * - Worker thread concurrency (4 threads for TCL 50SE)
 * - Redis sync with Pi master
 * - Local AI processing (future)
 * - Wake lock persistence
 *
 * Target: TCL 50SE (Helio G88, 6-12GB RAM, 5010mAh battery)
 * Capacity: 75-150 sessions per phone
 */

import dotenv from 'dotenv';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// PROJECT OS - Phase 1: Phone-Specific Imports
import { checkBattery, acquireWakeLock, releaseWakeLock } from './utils/phone-utils.js';
import { syncWithMaster, publishState } from './utils/redis-sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

// PROJECT OS - Phase 1: Phone Configuration Validation
const phoneConfig = {
  nodeType: process.env.NODE_TYPE || 'addon',
  phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
  cpuCores: parseInt(process.env.CPU_CORES || '8'),
  maxSessions: parseInt(process.env.MAX_SESSIONS || '75'),
  workerThreads: parseInt(process.env.WORKER_THREADS || '4'),
  batteryMonitor: process.env.BATTERY_MONITOR === 'true',
  ipRotation: process.env.IP_ROTATION === 'true'
};

console.log('🐝 Beeline Phone Bridge Server');
console.log('==============================');
console.log(`📱 Phone Model: ${phoneConfig.phoneModel}`);
console.log(`🔄 Node Type: ${phoneConfig.nodeType}`);
console.log(`⚡ CPU Cores: ${phoneConfig.cpuCores}`);
console.log(`👥 Max Sessions: ${phoneConfig.maxSessions}`);
console.log(`🧵 Worker Threads: ${phoneConfig.workerThreads}`);
console.log('');

// Validate phone environment
if (!process.env.NODE_TYPE) {
  console.error('❌ ERROR: NODE_TYPE not set. Use NODE_TYPE=addon for phones');
  process.exit(1);
}

// PROJECT OS - Phase 3: Battery & Performance Monitoring
async function monitorBattery() {
  if (!phoneConfig.batteryMonitor) return;

  const batteryLevel = await checkBattery();
  console.log(`🔋 Battery Level: ${batteryLevel}%`);

  if (batteryLevel < 20) {
    console.log('⚠️  Low battery detected - pausing non-essential operations');
    // Pause background sync, reduce worker threads
    return false;
  }

  return true;
}

// PROJECT OS - Phase 3: Worker Thread Pool for Concurrency
class WorkerPool {
  constructor(size) {
    this.size = size;
    this.workers = [];
    this.queue = [];
    this.activeTasks = 0;

    this.initializeWorkers();
  }

  initializeWorkers() {
    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(path.join(__dirname, 'workers/session-worker.js'), {
        workerData: { workerId: i }
      });

      worker.on('message', (result) => {
        this.activeTasks--;
        this.processQueue();
      });

      worker.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
        this.activeTasks--;
        this.processQueue();
      });

      this.workers.push(worker);
    }
  }

  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0 || this.activeTasks >= this.size) return;

    const { task, resolve, reject } = this.queue.shift();
    this.activeTasks++;

    // Find available worker
    const availableWorker = this.workers.find(w => !w.busy);
    if (availableWorker) {
      availableWorker.busy = true;
      availableWorker.postMessage(task);

      availableWorker.once('message', (result) => {
        availableWorker.busy = false;
        resolve(result);
      });

      availableWorker.once('error', (error) => {
        availableWorker.busy = false;
        reject(error);
      });
    } else {
      // All workers busy, put back in queue
      this.queue.unshift({ task, resolve, reject });
    }
  }

  shutdown() {
    this.workers.forEach(worker => worker.terminate());
  }
}

// PROJECT OS - Phase 3: IP Rotation for Mobile SIM
async function rotateIP() {
  if (!phoneConfig.ipRotation) return;

  console.log('🔄 Rotating IP via mobile SIM...');

  try {
    // Toggle airplane mode briefly to get new IP
    execSync('termux-api AirplaneMode --enable');
    await new Promise(resolve => setTimeout(resolve, 2000));
    execSync('termux-api AirplaneMode --disable');

    console.log('✅ IP rotation complete');
  } catch (error) {
    console.warn('⚠️  IP rotation failed (may not have termux-api)');
  }
}

// PROJECT OS - Phase 3: Main Phone Bridge Logic
async function startPhoneBridge() {
  console.log('🚀 Starting Phone Bridge Server...');

  // Acquire wake lock for persistence
  await acquireWakeLock();

  // Initialize worker pool
  const workerPool = new WorkerPool(phoneConfig.workerThreads);
  console.log(`🧵 Initialized ${phoneConfig.workerThreads} worker threads`);

  // Start battery monitoring
  const batteryOk = await monitorBattery();
  if (!batteryOk) {
    console.log('⚠️  Starting in low-power mode');
  }

  // Sync with Pi master (if addon node)
  if (phoneConfig.nodeType === 'addon') {
    console.log('🔄 Syncing with Pi master...');
    await syncWithMaster();
  }

  // IP rotation test
  if (phoneConfig.ipRotation) {
    await rotateIP();
  }

  // Health check endpoint
  const express = await import('express');
  const app = express.default();

  app.get('/health', async (req, res) => {
    const batteryLevel = phoneConfig.batteryMonitor ? await checkBattery() : null;

    res.json({
      status: 'healthy',
      nodeType: phoneConfig.nodeType,
      phoneModel: phoneConfig.phoneModel,
      batteryLevel: batteryLevel ? `${batteryLevel}%` : 'unknown',
      activeWorkers: workerPool.activeTasks,
      maxWorkers: phoneConfig.workerThreads,
      sessions: 0, // TODO: Track active sessions
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  const port = process.env.HEALTH_CHECK_PORT || 3001;
  app.listen(port, () => {
    console.log(`🏥 Health check available at http://localhost:${port}/health`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down phone bridge...');
    await releaseWakeLock();
    workerPool.shutdown();
    process.exit(0);
  });

  console.log('✅ Phone bridge ready!');
  console.log(`📱 Node Type: ${phoneConfig.nodeType}`);
  console.log(`🔋 Battery Monitoring: ${phoneConfig.batteryMonitor ? 'Enabled' : 'Disabled'}`);
  console.log(`🔄 IP Rotation: ${phoneConfig.ipRotation ? 'Enabled' : 'Disabled'}`);
  console.log('');

  // Keep alive
  setInterval(async () => {
    await monitorBattery();
    await publishState({ uptime: process.uptime(), batteryLevel: await checkBattery() });
  }, 60000); // Every minute
}

// PROJECT OS - Phase 4: Error Handling & Startup
startPhoneBridge().catch(error => {
  console.error('❌ Failed to start phone bridge:', error);
  process.exit(1);
});