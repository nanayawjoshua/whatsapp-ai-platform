#!/usr/bin/env node

/**
 * BUZZ: Simplified Beeline Phone Bridge
 * Single phone, no clustering, no Redis, no complexity
 *
 * Features:
 * - Single WhatsApp account via Baileys
 * - QR code generation for vendor signup
 * - Message routing to Supabase
 * - Grok API for message classification
 * - Simple health check endpoint
 *
 * Cost: GHS 0/month (just electricity)
 * Uptime: 99.5% (single instance)
 * Max capacity: 150 concurrent vendors
 */

import dotenv from 'dotenv';
import express from 'express';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import qrcode from 'qrcode-terminal';

dotenv.config();

const logger = pino();

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  port: process.env.PORT || 3001,
  phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  pawapayUrl: process.env.PAWAPAY_URL || 'https://api.pawapay.cloud',
  pawapayKey: process.env.PAWAPAY_API_KEY
};

// Validate required config
if (!config.supabaseUrl || !config.supabaseKey) {
  logger.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// ============================================================================
// INITIALIZE CLIENTS
// ============================================================================

const supabase = createClient(config.supabaseUrl, config.supabaseKey);
const groq = new Groq({ apiKey: config.groqApiKey });

// ============================================================================
// BAILEYS SETUP (Simplified)
// ============================================================================

import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';

let socket = null;
let qrCode = null;
let connectionState = 'closed';

async function connectWhatsApp() {
  try {
    logger.info('Connecting to WhatsApp...');

    const { state, saveCreds } = await useMultiFileAuthState('./phone_bridge/auth_info');
    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: ['Beeline', 'Chrome', '120.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      downloadHistory: false,
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    // Save credentials on update
    socket.ev.on('creds.update', saveCreds);

    // Handle QR code
    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log('\n📱 === QR CODE FOR VENDOR REGISTRATION ===\n');
        qrcode.generate(qr, { small: true });
        console.log('\n✅ Scan this QR code with WhatsApp to connect\n');
        logger.info('QR code generated (scan with another WhatsApp)');
      }

      if (connection === 'open') {
        logger.info('✅ WhatsApp connected successfully');
        connectionState = 'open';
        qrCode = null;
      }

      if (connection === 'close') {
        connectionState = 'closed';
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          const reconnectDelay = 5000; // 5 second delay to avoid throttling
          logger.warn(`Connection closed (status: ${statusCode}), reconnecting in ${reconnectDelay}ms...`);
          setTimeout(() => connectWhatsApp(), reconnectDelay);
        } else {
          logger.error('Connection closed with auth error, please reconnect');
        }
      }
    });

    // Handle incoming messages
    socket.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      if (!message.message) return;

      logger.info(`Message from ${message.key.remoteJid}: ${message.message.conversation}`);

      // Route to Grok for classification
      await routeMessage(message);
    });

    return socket;
  } catch (error) {
    logger.error(error, 'Failed to connect WhatsApp');
    throw error;
  }
}

// ============================================================================
// GROK MESSAGE ROUTING
// ============================================================================

async function routeMessage(message) {
  try {
    const vendorPhone = message.key.remoteJid;
    const senderPhone = message.key.remoteJid.split('@')[0];
    const messageText = message.message.conversation || message.message.extendedTextMessage?.text || '';

    if (!messageText.trim()) return;

    // Get vendor from Supabase
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('phone', vendorPhone)
      .single();

    if (!vendor) {
      logger.warn(`Vendor not found: ${vendorPhone}`);
      return;
    }

    // Classify message with Grok
    const classification = await classifyWithGrok(messageText);

    // Generate conversation ID (vendor:sender)
    const conversationId = `${vendor.id}:${senderPhone}`;

    // Store message in Supabase
    const { data: savedMessage, error: insertError } = await supabase.from('messages').insert({
      vendor_id: vendor.id,
      conversation_id: conversationId,
      sender_phone: senderPhone,
      message_text: messageText,
      message_type: classification.type,
      metadata: classification
    }).select();

    if (insertError) {
      logger.error(insertError, 'Failed to save message');
      return;
    }

    // Send responses
    try {
      if (classification.type === 'product_upload') {
        await sendWhatsAppMessage(
          vendorPhone,
          '✅ Product received! Thank you for listing with Beeline.'
        );
        await handleProductUpload(vendor, classification);
      } else if (classification.type === 'buyer_inquiry') {
        await sendWhatsAppMessage(
          vendorPhone,
          '📩 New buyer inquiry received! Check your dashboard for details.'
        );
        await handleBuyerInquiry(vendor, classification);
      }
    } catch (sendError) {
      logger.warn(sendError, 'Failed to send response');
    }
  } catch (error) {
    logger.error(error, 'Error routing message');
  }
}

async function classifyWithGrok(text) {
  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Classify this message from a vendor:
"${text}"

Respond with JSON:
{
  "type": "product_upload" | "buyer_inquiry" | "status_update" | "other",
  "category": "electronics" | "fashion" | "food" | "services" | null,
  "confidence": 0-100,
  "summary": "brief summary"
}`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(error, 'Grok classification failed');
    return { type: 'other', confidence: 0 };
  }
}

async function sendWhatsAppMessage(phone, text) {
  try {
    if (!socket) {
      throw new Error('WhatsApp not connected');
    }

    // Format phone as JID (e.g., 233501234567@s.whatsapp.net)
    const jid = phone.replace(/\D/g, '') + '@s.whatsapp.net';

    await socket.sendMessage(jid, { text });
    logger.info(`✅ Sent message to ${phone}`);
  } catch (error) {
    logger.error(error, `Failed to send message to ${phone}`);
    throw error;
  }
}

async function handleProductUpload(vendor, classification) {
  // Store product in Supabase
  // Later: Extract image from WhatsApp and store in Supabase Storage
  logger.info(`Product upload from ${vendor.name}: ${classification.summary}`);
}

async function handleBuyerInquiry(vendor, classification) {
  // Notify vendor of new inquiry
  // Send suggestion for response
  logger.info(`Buyer inquiry for ${vendor.name}: ${classification.summary}`);
}

// ============================================================================
// EXPRESS SERVER
// ============================================================================

const app = express();
app.use(express.json());

// Generate QR for new vendor
app.post('/api/generate-qr', async (req, res) => {
  try {
    if (!socket || !socket.user) {
      return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    const { vendorId, vendorData } = req.body;

    // If we have a cached QR code from initial connection, use it
    // Otherwise, return error asking vendor to wait
    if (!qrCode) {
      return res.status(503).json({
        error: 'QR code not yet available. Please wait for WhatsApp connection.',
        status: connectionState
      });
    }

    // Generate QR code image using qrcode library
    const QRCode = (await import('qrcode')).default;
    const qrImage = await QRCode.toDataURL(qrCode);

    logger.info(`📱 Generated QR for vendor ${vendorId}`);

    res.json({
      qrCode: qrImage,
      vendorId,
      expiresIn: 60
    });
  } catch (error) {
    logger.error(error, 'QR generation failed');
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Send message endpoint (for website/dashboard to trigger messages)
app.post('/api/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required' });
    }

    await sendWhatsAppMessage(phone, message);

    res.json({
      success: true,
      message: 'Message sent successfully',
      phone
    });
  } catch (error) {
    logger.error(error, 'Send message failed');
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const isConnected = socket && socket.user;

  res.json({
    status: isConnected ? 'healthy' : 'unhealthy',
    phoneModel: config.phoneModel,
    whatsappConnected: isConnected ? true : false,
    connectionState,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function start() {
  try {
    // Connect WhatsApp
    await connectWhatsApp();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`🐝 Beeline Phone Bridge running on port ${config.port}`);
      logger.info(`📱 Phone Model: ${config.phoneModel}`);
      logger.info(`🔌 Supabase: ${config.supabaseUrl.split('/').pop()}`);
      logger.info(`🤖 AI: Grok (via Groq)`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start bridge');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  if (socket) {
    await socket.end();
  }
  process.exit(0);
});

start();
