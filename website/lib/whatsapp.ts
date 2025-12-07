/**
 * WhatsApp Connection Utilities
 * Functions for managing WhatsApp connection status and QR code generation
 */

const CLOUD_BRIDGE_URL = process.env.NEXT_PUBLIC_CLOUD_BRIDGE_URL || process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com';

/**
 * Check if vendor's WhatsApp is connected
 */
export async function checkWhatsAppConnection(vendorId: string): Promise<{
  connected: boolean;
  lastActive?: string;
}> {
  try {
    const response = await fetch(`${CLOUD_BRIDGE_URL}/vendor/${vendorId}/status`, {
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
      connected: data.connected || false,
      lastActive: data.lastActive,
    };
  } catch (error) {
    console.error('Failed to check WhatsApp connection:', error);
    return { connected: false };
  }
}

/**
 * Generate new QR code for WhatsApp reconnection
 */
export async function generateReconnectionQR(vendorId: string): Promise<{
  success: boolean;
  qrCode?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${CLOUD_BRIDGE_URL}/vendor/${vendorId}/reconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to generate QR code' };
    }

    const data = await response.json();
    return {
      success: true,
      qrCode: data.qrCodeImage,
    };
  } catch (error: any) {
    console.error('Failed to generate reconnection QR:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Disconnect WhatsApp session
 */
export async function disconnectWhatsApp(vendorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${CLOUD_BRIDGE_URL}/vendor/${vendorId}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to disconnect' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to disconnect WhatsApp:', error);
    return { success: false, error: error.message };
  }
}
