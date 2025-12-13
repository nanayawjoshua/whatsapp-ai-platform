/**
 * BUZZ: WhatsApp Connection Utilities
 * Simplified for phone bridge - single WhatsApp instance
 */

const PHONE_BRIDGE_URL = process.env.PHONE_BRIDGE_URL || 'http://localhost:3001';

/**
 * BUZZ: Check phone bridge health (not vendor-specific)
 */
export async function checkWhatsAppConnection(vendorId: string): Promise<{
  connected: boolean;
  lastActive?: string;
}> {
  try {
    // BUZZ: Phone bridge is single instance, check overall health
    const response = await fetch(`${PHONE_BRIDGE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { connected: false };
    }

    const data = await response.json();
    return {
      connected: data.status === 'healthy',
      lastActive: data.timestamp,
    };
  } catch (error) {
    console.error('Failed to check phone bridge health:', error);
    return { connected: false };
  }
}

/**
 * BUZZ: Generate QR code for vendor registration
 * Phone bridge handles single WhatsApp instance
 */
export async function generateReconnectionQR(vendorId: string): Promise<{
  success: boolean;
  qrCode?: string;
  error?: string;
}> {
  try {
    // BUZZ: QR generation happens during registration, not reconnection
    // This function is kept for compatibility but redirects to registration flow
    return {
      success: false,
      error: 'BUZZ: Use vendor registration for QR codes. Phone bridge handles single WhatsApp instance.'
    };
  } catch (error: any) {
    console.error('QR generation not available in BUZZ:', error);
    return { success: false, error: error.message };
  }
}

/**
 * BUZZ: Disconnect not applicable
 * Phone bridge handles single WhatsApp instance
 */
export async function disconnectWhatsApp(vendorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // BUZZ: Single WhatsApp instance, no per-vendor disconnect
    return {
      success: false,
      error: 'BUZZ: Phone bridge manages single WhatsApp instance. Cannot disconnect individual vendors.'
    };
  } catch (error: any) {
    console.error('Disconnect not available in BUZZ:', error);
    return { success: false, error: error.message };
  }
}
