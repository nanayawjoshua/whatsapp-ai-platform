#!/usr/bin/env node

/**
 * Beeline Pi Bridge — Multi-Session WhatsApp Gateway
 *
 * One Raspberry Pi handles 50+ vendor WhatsApp sessions.
 * Each vendor's real number becomes an AI employee.
 */

import 'dotenv/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import axios from 'axios';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const config = {
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://172.237.109.60/webhook/whatsapp',
  sessionsPath: process.env.SESSIONS_PATH || './sessions',
  maxVendors: parseInt(process.env.MAX_VENDORS || '50'),
  autoReconnect: process.env.AUTO_RECONNECT !== 'false',
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000'),
  logLevel: process.env.LOG_LEVEL || 'info'
};

const logger = pino({ level: config.logLevel });

// Active vendor sessions
const vendorSockets = new Map();

// Conversation memory per user (vendor-specific)
const conversationHistory = new Map();
const MAX_HISTORY = 10;

/**
 * Get conversation history key
 */
function getHistoryKey(vendorId, customerId) {
  return `${vendorId}:${customerId}`;
}

/**
 * Get conversation history for a customer
 */
function getHistory(vendorId, customerId) {
  const key = getHistoryKey(vendorId, customerId);
  if (!conversationHistory.has(key)) {
    conversationHistory.set(key, []);
  }
  return conversationHistory.get(key);
}

/**
 * Add message to conversation history
 */
function addToHistory(vendorId, customerId, role, content) {
  const key = getHistoryKey(vendorId, customerId);
  const history = getHistory(vendorId, customerId);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
  conversationHistory.set(key, history);
}

/**
 * Clear conversation history
 */
function clearHistory(vendorId, customerId) {
  const key = getHistoryKey(vendorId, customerId);
  conversationHistory.delete(key);
}

/**
 * Send message to n8n for AI processing
 */
async function processWithAI(vendorId, customerId, message, vendorConfig = {}) {
  try {
    const history = getHistory(vendorId, customerId);

    const payload = {
      vendorId,
      customerId,
      message,
      channel: 'whatsapp',
      timestamp: new Date().toISOString(),
      conversationHistory: history,
      vendorConfig
    };

    logger.info({
      vendorId,
      customerId: customerId.substring(0, 10) + '...',
      messagePreview: message.substring(0, 50),
      historyLength: history.length
    }, 'Processing message through AI');

    const response = await axios.post(config.n8nWebhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    // Save AI response to history
    const aiReply = typeof response.data === 'string' ? response.data : response.data.reply;
    if (aiReply) {
      addToHistory(vendorId, customerId, 'assistant', aiReply);
    }

    return aiReply;
  } catch (error) {
    logger.error({ vendorId, customerId, error: error.message }, 'AI processing failed');
    return null;
  }
}

/**
 * Connect a vendor's WhatsApp session
 */
async function connectVendor(vendorId) {
  const sessionPath = path.join(config.sessionsPath, vendorId);

  // Ensure session directory exists
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true, // Show QR for new sessions
    browser: ['Beeline', 'Chrome', '120.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info({ vendorId }, 'QR Code generated — vendor should scan now');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn({ vendorId, statusCode, shouldReconnect }, 'Connection closed');

      if (shouldReconnect && config.autoReconnect) {
        logger.info({ vendorId, delay: config.reconnectDelay }, 'Reconnecting...');
        setTimeout(() => connectVendor(vendorId), config.reconnectDelay);
      } else {
        vendorSockets.delete(vendorId);
        logger.info({ vendorId }, 'Session ended — vendor logged out');
      }
    }

    if (connection === 'open') {
      logger.info({ vendorId }, '✅ WhatsApp connected — AI employee is LIVE');
      vendorSockets.set(vendorId, sock);
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Skip if from self or no text content
      if (msg.key.fromMe) continue;

      const messageContent = msg.message?.conversation ||
                            msg.message?.extendedTextMessage?.text ||
                            msg.message?.imageMessage?.caption ||
                            msg.message?.videoMessage?.caption;

      if (!messageContent) continue;

      const customerId = msg.key.remoteJid;
      const customerNumber = customerId.replace('@s.whatsapp.net', '');

      logger.info({
        vendorId,
        customerNumber: customerNumber.substring(0, 6) + '****',
        message: messageContent.substring(0, 50)
      }, 'Incoming message');

      // Handle special commands
      if (messageContent.toLowerCase() === '/clear' || messageContent.toLowerCase() === '/reset') {
        clearHistory(vendorId, customerId);
        await sock.sendMessage(customerId, {
          text: '🧹 Conversation cleared. How can I help you today?'
        });
        continue;
      }

      // Add user message to history
      addToHistory(vendorId, customerId, 'user', messageContent);

      // Send typing indicator
      await sock.sendPresenceUpdate('composing', customerId);

      // Process through AI
      const aiResponse = await processWithAI(vendorId, customerId, messageContent);

      if (aiResponse) {
        // Add "Powered by Beeline" to every response
        const fullResponse = `${aiResponse}\n\n---\n_Powered by Beeline. Want your own AI employee? Say YES._`;

        await sock.sendMessage(customerId, { text: fullResponse });

        logger.info({ vendorId, customerNumber: customerNumber.substring(0, 6) + '****' }, 'Reply sent');
      } else {
        await sock.sendMessage(customerId, {
          text: '❌ Sorry, I encountered an error. Please try again.'
        });
      }

      // Clear typing indicator
      await sock.sendPresenceUpdate('paused', customerId);
    }
  });

  return sock;
}

/**
 * Load and connect all existing vendor sessions
 */
async function loadAllVendors() {
  if (!fs.existsSync(config.sessionsPath)) {
    fs.mkdirSync(config.sessionsPath, { recursive: true });
    logger.info('Created sessions directory');
    return;
  }

  const vendors = fs.readdirSync(config.sessionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  logger.info({ vendorCount: vendors.length, maxVendors: config.maxVendors }, 'Loading vendor sessions');

  for (const vendorId of vendors) {
    if (vendorSockets.size >= config.maxVendors) {
      logger.warn({ vendorId }, 'Max vendors reached — skipping');
      continue;
    }

    try {
      await connectVendor(vendorId);
      // Stagger connections to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      logger.error({ vendorId, error: error.message }, 'Failed to connect vendor');
    }
  }
}

/**
 * Add a new vendor (generates QR code)
 */
async function addVendor(vendorId) {
  if (vendorSockets.size >= config.maxVendors) {
    throw new Error(`Max vendors (${config.maxVendors}) reached`);
  }

  if (vendorSockets.has(vendorId)) {
    throw new Error(`Vendor ${vendorId} already connected`);
  }

  logger.info({ vendorId }, 'Adding new vendor — QR code will appear');
  return await connectVendor(vendorId);
}

/**
 * Main startup
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🐝 BEELINE PI BRIDGE                                       ║
║   WhatsApp AI Employee Gateway                               ║
║                                                              ║
║   Cloud Brain: ${config.n8nWebhookUrl.padEnd(35)}     ║
║   Max Vendors: ${String(config.maxVendors).padEnd(35)}     ║
║   Sessions: ${config.sessionsPath.padEnd(38)}     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Load existing vendor sessions
  await loadAllVendors();

  // If no vendors, prompt to add first one
  if (vendorSockets.size === 0) {
    console.log('\n📱 No vendors connected yet.');
    console.log('Run: npm run add-vendor <vendor-id>');
    console.log('Example: npm run add-vendor mango-shop-001\n');
  }

  logger.info({ activeVendors: vendorSockets.size }, '🚀 Beeline Pi Bridge is running');
}

// Export for scripts
export { addVendor, vendorSockets, config };

// Run if main module
main().catch(error => {
  logger.error({ error: error.message }, 'Fatal error');
  process.exit(1);
});
