/**
 * Phone Utilities for Android Bridge
 * PROJECT OS - Phase 3: Phone-Specific Optimizations
 *
 * Handles battery monitoring, wake locks, and Android-specific features
 * Uses Termux API for native Android integration
 */

// PROJECT OS - Phase 3: Battery Monitoring
export async function checkBattery() {
  try {
    // Use Termux API to get battery status
    const { execSync } = await import('child_process');
    const result = execSync('termux-battery-status', { encoding: 'utf8' });
    const batteryData = JSON.parse(result);

    return batteryData.percentage || 100; // Default to 100 if unknown
  } catch (error) {
    console.warn('⚠️  Battery check failed (Termux API not available)');
    return 100; // Assume full battery if check fails
  }
}

// PROJECT OS - Phase 3: Wake Lock for Persistence
export async function acquireWakeLock() {
  try {
    const { execSync } = await import('child_process');
    execSync('termux-wake-lock');
    console.log('🔒 Wake lock acquired (screen will stay awake)');
  } catch (error) {
    console.warn('⚠️  Wake lock failed (may drain battery faster)');
  }
}

export async function releaseWakeLock() {
  try {
    const { execSync } = await import('child_process');
    execSync('termux-wake-unlock');
    console.log('🔓 Wake lock released');
  } catch (error) {
    console.warn('⚠️  Wake unlock failed');
  }
}

// PROJECT OS - Phase 3: CPU Load Monitoring
export async function checkCpuLoad() {
  try {
    const { execSync } = await import('child_process');
    const result = execSync('cat /proc/loadavg', { encoding: 'utf8' });
    const loadAvg = result.split(' ')[0];
    return parseFloat(loadAvg);
  } catch (error) {
    return 0; // Default if check fails
  }
}

// PROJECT OS - Phase 3: Memory Usage (Phone-Optimized)
export function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  return {
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024) // MB
  };
}

// PROJECT OS - Phase 3: IP Rotation via Mobile Data
export async function rotateMobileIP() {
  try {
    const { execSync } = await import('child_process');

    // Disable mobile data
    execSync('termux-api MobileData --disable');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enable mobile data (gets new IP)
    execSync('termux-api MobileData --enable');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📱 Mobile IP rotated');
    return true;
  } catch (error) {
    console.warn('⚠️  Mobile IP rotation failed:', error.message);
    return false;
  }
}

// PROJECT OS - Phase 3: Network Type Detection
export async function getNetworkType() {
  try {
    const { execSync } = await import('child_process');
    const result = execSync('termux-api NetworkInfo', { encoding: 'utf8' });
    const networkInfo = JSON.parse(result);

    return {
      type: networkInfo.type || 'unknown', // wifi, mobile, etc.
      isConnected: networkInfo.isConnected || false,
      ip: networkInfo.ip || null
    };
  } catch (error) {
    return { type: 'unknown', isConnected: true, ip: null };
  }
}

// PROJECT OS - Phase 3: Phone Health Report
export async function getPhoneHealth() {
  const [battery, cpuLoad, memory, network] = await Promise.all([
    checkBattery(),
    checkCpuLoad(),
    getMemoryUsage(),
    getNetworkType()
  ]);

  return {
    battery: `${battery}%`,
    cpuLoad: cpuLoad.toFixed(2),
    memory,
    network,
    timestamp: new Date().toISOString(),
    phoneModel: process.env.PHONE_MODEL || 'Unknown'
  };
}