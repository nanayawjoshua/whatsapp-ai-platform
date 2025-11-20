#!/usr/bin/env node

/**
 * WhatsApp AI Agent Platform - Backend Service
 *
 * This service:
 * 1. Connects to WhatsApp using Baileys (no Meta Business API needed!)
 * 2. Listens for incoming messages
 * 3. Forwards them to n8n webhook for processing
 * 4. Sends AI responses back to customers
 */

import 'dotenv/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import axios from 'axios';

// Configuration
const config = {
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp',
  sessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Logger
const logger = pino({ level: config.logLevel });

// Message store (keeps message history)
// Note: makeInMemoryStore removed in newer Baileys versions - not needed for MVP
// const store = makeInMemoryStore({ logger });

// Global socket reference
let sock;

/**
 * Initialize WhatsApp connection
 */
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Show QR in terminal
    logger: pino({ level: 'silent' }) // Reduce Baileys noise
  });

  // Save session on update
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Show QR code for initial pairing
    if (qr) {
      console.log('\n📱 WhatsApp QR Code (scan with your phone):\n');
      qrcode.generate(qr, { small: true });
      console.log('\nOpen WhatsApp > Settings > Linked Devices > Link a Device\n');
    }

    // Connection opened successfully
    if (connection === 'open') {
      const phone = sock.user?.id.split(':')[0];
      logger.info({ phone }, '✅ WhatsApp connected successfully!');
      console.log(`\n✅ WhatsApp Business connected: +${phone}`);
      console.log(`📨 Ready to receive messages...\n`);
    }

    // Connection closed
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      logger.warn({
        statusCode: lastDisconnect?.error?.output?.statusCode,
        shouldReconnect
      }, 'WhatsApp connection closed');

      if (shouldReconnect) {
        console.log('🔄 Reconnecting to WhatsApp...');
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('❌ Logged out. Delete session and restart to re-authenticate.');
      }
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return; // Only process new messages

    for (const msg of messages) {
      await handleIncomingMessage(msg);
    }
  });

  // Bind store to socket events (disabled - store not available in newer Baileys)
  // store.bind(sock.ev);
}

/**
 * Handle incoming WhatsApp message
 */
async function handleIncomingMessage(msg) {
  try {
    // Ignore messages from yourself
    if (msg.key.fromMe) return;

    // Extract message details
    const from = msg.key.remoteJid; // Customer's WhatsApp ID
    const messageText = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        '';

    // Ignore empty messages
    if (!messageText.trim()) {
      logger.debug({ from }, 'Ignored empty message');
      return;
    }

    const customerPhone = from.split('@')[0]; // Extract phone number

    logger.info({
      from: customerPhone,
      message: messageText
    }, 'Received message');

    console.log(`\n📩 Message from +${customerPhone}:`);
    console.log(`   "${messageText}"`);

    // Forward to n8n webhook
    const payload = {
      from: from,
      phone: customerPhone,
      message: messageText,
      timestamp: new Date().toISOString(),
      messageId: msg.key.id
    };

    try {
      const response = await axios.post(config.n8nWebhookUrl, payload, {
        timeout: 30000, // 30 second timeout
        headers: { 'Content-Type': 'application/json' }
      });

      const aiResponse = response.data?.response || response.data?.message;

      if (aiResponse) {
        await sendMessage(from, aiResponse);
        console.log(`   ✅ AI replied: "${aiResponse.substring(0, 50)}..."`);
      } else {
        logger.warn({ response: response.data }, 'No AI response in webhook reply');
      }

    } catch (webhookError) {
      logger.error({
        error: webhookError.message,
        url: config.n8nWebhookUrl
      }, 'Failed to call n8n webhook');

      // Send fallback message to customer
      const fallbackMsg = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
      await sendMessage(from, fallbackMsg);
    }

  } catch (error) {
    logger.error({ error: error.message }, 'Error handling message');
  }
}

/**
 * Send message via WhatsApp
 */
async function sendMessage(to, text) {
  try {
    await sock.sendMessage(to, { text });
    logger.info({ to, text }, 'Message sent');
  } catch (error) {
    logger.error({ error: error.message, to }, 'Failed to send message');
    throw error;
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  if (sock) {
    await sock.logout();
  }
  process.exit(0);
});

// Start the service
console.log('🚀 WhatsApp AI Agent Platform - Starting...\n');
console.log(`   n8n Webhook: ${config.n8nWebhookUrl}`);
console.log(`   Session Path: ${config.sessionPath}\n`);

connectToWhatsApp().catch(err => {
  logger.error({ error: err.message }, 'Failed to start');
  process.exit(1);
});
