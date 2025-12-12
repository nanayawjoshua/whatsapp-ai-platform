/**
 * Session Worker Thread
 * PROJECT OS - Phase 2: Concurrent Session Processing
 *
 * Handles individual WhatsApp sessions in isolated threads
 * Prevents blocking and enables parallelism on phone hardware
 * Uses 4 threads on TCL 50SE (Helio G88 octa-core optimized)
 */

import { parentPort, workerData } from 'worker_threads';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

// PROJECT OS - Phase 2: Worker Configuration
const workerId = workerData.workerId;
const sessionId = `session_${workerId}_${Date.now()}`;

console.log(`🧵 Session Worker ${workerId} started (Session: ${sessionId})`);

// PROJECT OS - Phase 2: Session State Management
let sock = null;
let isConnected = false;
let authState = null;

// PROJECT OS - Phase 2: Baileys Socket Creation (Phone-Optimized)
async function createSocket(vendorId) {
  try {
    // Use memory-based auth state for phone (no file system writes)
    authState = {
      creds: {},
      keys: {}
    };

    // Phone-optimized Baileys configuration
    sock = makeWASocket({
      version: [2, 3000, 1015901307], // Latest stable
      logger: pino({ level: 'silent' }), // Minimal logging for phone
      printQRInTerminal: false, // QR handled by main thread
      auth: {
        creds: authState.creds,
        keys: authState.keys
      },
      // Phone optimizations
      markOnlineOnConnect: false, // Reduce battery usage
      syncFullHistory: false, // Faster startup
      generateHighQualityLinkPreview: false, // Reduce processing
      // Connection optimizations for mobile
      connectTimeoutMs: 20000, // Faster timeout on mobile
      keepAliveIntervalMs: 15000, // More frequent keep-alive
      // Memory optimization
      maxMsgCacheSize: 50, // Smaller cache for phone RAM
      maxCommitsCacheSize: 20
    });

    // PROJECT OS - Phase 2: Connection Event Handlers
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Send QR to main thread for display
        parentPort.postMessage({
          type: 'qr_generated',
          sessionId,
          qr,
          vendorId
        });
      }

      if (connection === 'open') {
        isConnected = true;
        console.log(`✅ Worker ${workerId}: WhatsApp connected for ${vendorId}`);

        parentPort.postMessage({
          type: 'connected',
          sessionId,
          vendorId
        });
      }

      if (connection === 'close') {
        isConnected = false;
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;

        console.log(`❌ Worker ${workerId}: WhatsApp disconnected for ${vendorId}`);

        parentPort.postMessage({
          type: 'disconnected',
          sessionId,
          vendorId,
          shouldReconnect
        });
      }
    });

    // PROJECT OS - Phase 2: Message Handler
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === 'notify') {
        // Process message in worker thread
        const result = await processMessage(msg, vendorId);

        parentPort.postMessage({
          type: 'message_processed',
          sessionId,
          vendorId,
          messageId: msg.key.id,
          result
        });
      }
    });

    // PROJECT OS - Phase 2: Auth State Updates
    sock.ev.on('creds.update', (creds) => {
      authState.creds = creds;
      // Send updated creds to main thread for persistence
      parentPort.postMessage({
        type: 'creds_updated',
        sessionId,
        creds
      });
    });

    return sock;
  } catch (error) {
    console.error(`❌ Worker ${workerId}: Failed to create socket:`, error);
    parentPort.postMessage({
      type: 'error',
      sessionId,
      error: error.message
    });
    return null;
  }
}

// PROJECT OS - Phase 2: Message Processing Logic
async function processMessage(msg, vendorId) {
  try {
    const messageContent = msg.message?.conversation ||
                          msg.message?.extendedTextMessage?.text ||
                          '[Media message]';

    console.log(`📨 Worker ${workerId}: Processing message for ${vendorId}: ${messageContent.substring(0, 50)}...`);

    // Basic AI processing (placeholder - will integrate with n8n)
    let response = '';

    if (messageContent.toLowerCase().includes('hello') || messageContent.toLowerCase().includes('hi')) {
      response = 'Hello! How can I help you today? 🐝';
    } else if (messageContent.toLowerCase().includes('price') || messageContent.toLowerCase().includes('cost')) {
      response = 'I\'d be happy to help with pricing! Could you tell me what you\'re looking for?';
    } else {
      response = 'Thanks for your message! Let me check with my team and get back to you soon.';
    }

    // Send response
    if (sock && isConnected) {
      await sock.sendMessage(msg.key.remoteJid, { text: response });
      console.log(`📤 Worker ${workerId}: Response sent to ${vendorId}`);
    }

    return {
      success: true,
      response,
      processingTime: Date.now() - msg.messageTimestamp * 1000
    };

  } catch (error) {
    console.error(`❌ Worker ${workerId}: Message processing error:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// PROJECT OS - Phase 2: Send Message Function
async function sendMessage(recipient, message) {
  if (!sock || !isConnected) {
    throw new Error('Socket not connected');
  }

  return await sock.sendMessage(recipient, { text: message });
}

// PROJECT OS - Phase 2: Worker Message Handler
parentPort.on('message', async (task) => {
  try {
    const { action, data } = task;

    switch (action) {
      case 'create_socket':
        const socket = await createSocket(data.vendorId);
        parentPort.postMessage({
          type: 'socket_created',
          sessionId,
          success: !!socket
        });
        break;

      case 'send_message':
        const result = await sendMessage(data.recipient, data.message);
        parentPort.postMessage({
          type: 'message_sent',
          sessionId,
          result
        });
        break;

      case 'disconnect':
        if (sock) {
          sock.logout();
          sock = null;
          isConnected = false;
        }
        parentPort.postMessage({
          type: 'disconnected',
          sessionId
        });
        break;

      default:
        parentPort.postMessage({
          type: 'error',
          sessionId,
          error: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      sessionId,
      error: error.message
    });
  }
});

console.log(`✅ Session Worker ${workerId} ready (Session: ${sessionId})`);