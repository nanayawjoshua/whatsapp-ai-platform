import { useState, useCallback } from 'react';

/**
 * Bridge Availability Hook
 *
 * Client-side JS to ensure bridge is awake before making requests
 * Usage in Next.js/React:
 *   import { useBridgeAvailable } from '@/lib/hooks/use-bridge-available'
 *
 *   const BridgeSignup = () => {
 *     const { ensureBridgeAwake, isAwake } = useBridgeAvailable()
 *     
 *     const handleSignup = async () => {
 *       await ensureBridgeAwake()
 *       // Bridge is now awake, proceed with signup
 *     }
 *   }
 */

export async function ensureBridgeAwake(bridgeUrl: string = '/api/bridge/health'): Promise<boolean> {
  const maxRetries = 3;
  let delay = 2000; // Start with 2 second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Checking bridge availability (attempt ${attempt}/${maxRetries})...`);
      
      const response = await fetch(bridgeUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log('✅ Bridge is ready!');
        return true;
      }
    } catch (error) {
      console.warn(`⚠️  Attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 2, 10000); // Exponential backoff
      }
    }
  }

  console.error('❌ Bridge is not responding');
  return false;
}

/**
 * React Hook for bridge availability
 */
export function useBridgeAvailable() {
  const [isAwake, setIsAwake] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const ensureBridgeAwake = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const available = await ensureBridgeAwake('/api/bridge/health');
      setIsAwake(available);
      return available;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { ensureBridgeAwake, isAwake, isChecking };
}

export default ensureBridgeAwake;
