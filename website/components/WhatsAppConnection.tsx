'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaSync, FaQrcode } from 'react-icons/fa';
import { checkWhatsAppConnection, generateReconnectionQR } from '@/lib/whatsapp';

interface WhatsAppConnectionProps {
  vendorId: string;
}

export default function WhatsAppConnection({ vendorId }: WhatsAppConnectionProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const status = await checkWhatsAppConnection(vendorId);
      setConnected(status.connected);
    } catch (err) {
      console.error('Failed to check connection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Poll connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [vendorId]);

  const handleReconnect = async () => {
    try {
      setQrLoading(true);
      setError(null);
      const result = await generateReconnectionQR(vendorId);

      if (result.success && result.qrCode) {
        setQrCode(result.qrCode);
        setShowQR(true);
        // Poll for connection status
        const pollInterval = setInterval(async () => {
          const status = await checkWhatsAppConnection(vendorId);
          if (status.connected) {
            setConnected(true);
            setShowQR(false);
            clearInterval(pollInterval);
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      } else {
        setError(result.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <>
      {/* Connection Status Card */}
      <div className={`card p-6 ${connected ? 'bg-gradient-to-br from-green-50 to-white border-2 border-green-200' : 'bg-gradient-to-br from-red-50 to-white border-2 border-red-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaWhatsapp className={`text-4xl ${connected ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h3 className="text-lg font-bold text-gray-900">WhatsApp Status</h3>
              <p className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? 'Checking...' : connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <button
            onClick={checkConnection}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
            title="Refresh status"
          >
            <FaSync className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {!connected && !loading && (
          <button
            onClick={handleReconnect}
            disabled={qrLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {qrLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                Generating QR Code...
              </>
            ) : (
              <>
                <FaQrcode />
                Reconnect WhatsApp
              </>
            )}
          </button>
        )}

        {connected && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm text-green-800 font-medium">
              Your AI employee is online and ready to chat!
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <FaWhatsapp className="text-6xl text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reconnect WhatsApp
              </h2>
              <p className="text-gray-600">
                Scan this QR code with your WhatsApp to reconnect
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-4 mb-6">
              <div className="bg-white rounded-xl p-4">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h4 className="font-bold text-blue-900 mb-2">How to Scan:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open WhatsApp on your phone</li>
                <li>Tap the three dots (:) at the top right</li>
                <li>Select "Linked Devices"</li>
                <li>Tap "Link a Device" and scan this QR code</li>
              </ol>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
