/**
 * BUZZ: WhatsApp Connection Utilities
 * Simplified for phone bridge - single WhatsApp instance
 */

const PHONE_BRIDGE_URL = process.env.PHONE_BRIDGE_URL || 'http://localhost:3001';

/**
 * BUZZ: Check vendor-specific WhatsApp connection status
 */
export async function checkWhatsAppConnection(vendorId: string): Promise<{
  connected: boolean;
  lastActive?: string;
}> {
  try {
    // Check vendor-specific connection status
    const response = await fetch(`${PHONE_BRIDGE_URL}/vendor/${vendorId}/status`, {
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
      connected: data.connected,
      lastActive: data.connected ? new Date().toISOString() : undefined,
    };
  } catch (error) {
    console.error('Failed to check vendor connection:', error);
    return { connected: false };
  }
}

/**
 * BUZZ: Generate QR code for vendor reconnection
 * Recreates WhatsApp session for disconnected vendor
 */
export async function generateReconnectionQR(vendorId: string): Promise<{
  success: boolean;
  qrCode?: string;
  error?: string;
}> {
  try {
    // Get vendor details from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, name, phone')
      .eq('id', vendorId)
      .single();

    if (error || !vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    // Generate new QR code via phone bridge
    const response = await fetch(`${PHONE_BRIDGE_URL}/api/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId: vendor.id,
        vendorData: {
          phone: vendor.phone,
          name: vendor.name,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Bridge error: ${errorText}` };
    }

    const data = await response.json();

    return {
      success: true,
      qrCode: data.qrCode,
    };
  } catch (error: any) {
    console.error('QR reconnection failed:', error);
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
