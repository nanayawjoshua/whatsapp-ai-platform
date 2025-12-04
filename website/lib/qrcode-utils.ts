/**
 * QR Code Utilities
 *
 * Helper functions to convert Baileys QR strings to displayable images
 */

import QRCode from 'qrcode';

/**
 * Convert a QR code string to a data URL (base64 image)
 *
 * @param qrString - The QR code string from Baileys
 * @returns Promise<string> - Data URL for the QR code image
 */
export async function generateQRCodeImage(qrString: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(qrString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction for WhatsApp
    });

    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code image:', error);
    throw new Error('Failed to generate QR code image');
  }
}

/**
 * Generate QR code as SVG string
 *
 * @param qrString - The QR code string from Baileys
 * @returns Promise<string> - SVG string
 */
export async function generateQRCodeSVG(qrString: string): Promise<string> {
  try {
    const svg = await QRCode.toString(qrString, {
      type: 'svg',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return svg;
  } catch (error) {
    console.error('Failed to generate QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Fetch QR code from API and generate vendor WhatsApp session
 *
 * @param vendorId - Unique vendor identifier (usually payment reference)
 * @param vendorData - Vendor information from signup form
 * @returns Promise with QR code image data URL
 */
export async function fetchVendorQRCode(
  vendorId: string,
  vendorData?: {
    name: string;
    phone: string;
    email: string;
    businessType: string;
    personality: string;
  }
): Promise<{
  qrCodeImage: string;
  qrCodeRaw: string;
  vendorId: string;
  expiresIn: number;
}> {
  try {
    const response = await fetch('/api/vendor/generate-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId,
        vendorData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch QR code');
    }

    const data = await response.json();

    // Convert raw QR string to image
    const qrCodeImage = await generateQRCodeImage(data.qrCode);

    return {
      qrCodeImage,
      qrCodeRaw: data.qrCode,
      vendorId: data.vendorId,
      expiresIn: data.expiresIn,
    };
  } catch (error: any) {
    console.error('Failed to fetch vendor QR code:', error);
    throw new Error(error.message || 'Failed to fetch QR code');
  }
}

/**
 * Check if vendor's WhatsApp is connected
 *
 * @param vendorId - Unique vendor identifier
 * @returns Promise with connection status
 */
export async function checkVendorConnectionStatus(vendorId: string): Promise<{
  connected: boolean;
  status: string;
}> {
  try {
    const response = await fetch(`/api/vendor/generate-qr?vendorId=${vendorId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }

    const data = await response.json();

    return {
      connected: data.connected || false,
      status: data.status || 'unknown',
    };
  } catch (error) {
    console.error('Failed to check vendor connection:', error);
    return {
      connected: false,
      status: 'error',
    };
  }
}
