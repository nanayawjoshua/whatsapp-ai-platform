#!/usr/bin/env node

/**
 * BEELINE: Multi-Vendor WhatsApp Bridge
 * Each vendor connects their own WhatsApp number independently
 *
 * Features:
 * - Multiple WhatsApp sessions (one per vendor)
 * - Individual QR code generation per vendor
 * - Message routing to Supabase per vendor
 * - Grok API for message classification
 * - Session persistence per vendor
 *
 * Architecture:
 * - Each vendor gets their own auth_info_<vendorId>/ directory
 * - Separate Baileys socket connection per vendor
 * - QR codes generated on-demand during signup
 */

import dotenv from 'dotenv';
import express from 'express';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { shouldUseAI } from './message-classifier.js';
import { sessionMonitor } from './session-monitor.js';

dotenv.config();

const logger = pino();
const app = express();
app.use(express.json());

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  port: process.env.PORT || 3001,
  phoneModel: process.env.PHONE_MODEL || 'TCL_50SE',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
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
// BAILEYS MULTI-SESSION SETUP
// ============================================================================

import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';

// Store all vendor sessions in memory
// Format: { vendorId: { socket, qr, state, connectionState } }
const vendorSessions = new Map();

// Lazy AI filter statistics
let messageStats = {
  total: 0,
  instantReplies: 0,
  aiCalls: 0,
  lastReset: new Date()
};

/**
 * Create or retrieve WhatsApp connection for a specific vendor
 */
async function connectVendorWhatsApp(vendorId) {
  try {
    // Check if session already exists
    if (vendorSessions.has(vendorId)) {
      const session = vendorSessions.get(vendorId);
      if (session.connectionState === 'open') {
        logger.info(`Vendor ${vendorId} already connected`);
        return session;
      }
    }

    logger.info(`Creating WhatsApp connection for vendor ${vendorId}...`);

    // Create vendor-specific auth directory
    const authDir = path.join('./phone_bridge', `auth_info_${vendorId}`);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: ['Beeline', 'Chrome', '120.0.0'],
      connectTimeoutMs: 60000,
    });

    // Session object for this vendor
    const session = {
      socket,
      qr: null,
      connectionState: 'connecting',
      vendorId,
      authDir,
    };

    vendorSessions.set(vendorId, session);

    // Handle connection updates
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        session.qr = qr;
        logger.info(`QR code generated for vendor ${vendorId}`);
      }

      if (connection === 'open') {
        logger.info(`✅ Vendor ${vendorId} WhatsApp connected successfully`);
        session.connectionState = 'open';
        session.qr = null;

        // Update vendor status in database
        await supabase
          .from('vendors')
          .update({
            status: 'active',
            whatsapp_connected_at: new Date().toISOString()
          })
          .eq('id', vendorId);
      }

      if (connection === 'close') {
        session.connectionState = 'closed';
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          const reconnectDelay = 5000;
          logger.warn(`Vendor ${vendorId} connection closed (status: ${statusCode}), reconnecting in ${reconnectDelay}ms...`);
          setTimeout(() => connectVendorWhatsApp(vendorId), reconnectDelay);
        } else {
          logger.error(`Vendor ${vendorId} logged out, removing session`);
          vendorSessions.delete(vendorId);

          // Update vendor status
          await supabase
            .from('vendors')
            .update({ status: 'disconnected' })
            .eq('id', vendorId);
        }
      }
    });

    // Handle credentials update
    socket.ev.on('creds.update', saveCreds);

    // Handle incoming messages for this vendor
    socket.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      if (!message.message) return;

      logger.info(`Message for vendor ${vendorId} from ${message.key.remoteJid}`);
      await routeVendorMessage(vendorId, message);
    });

    return session;
  } catch (error) {
    logger.error(error, `Failed to connect vendor ${vendorId} WhatsApp`);
    throw error;
  }
}

/**
 * Route incoming message to the correct vendor's database
 */
async function routeVendorMessage(vendorId, message) {
  try {
    const senderPhone = message.key.remoteJid.split('@')[0];
    const messageText = message.message.conversation || message.message.extendedTextMessage?.text || '';

    if (!messageText.trim()) return;

    // Update statistics
    messageStats.total++;

    // Check if we can use instant reply (lazy AI filter)
    const aiCheck = shouldUseAI(messageText);

    if (!aiCheck.useAI && aiCheck.reply) {
      messageStats.instantReplies++;
      // Send instant reply without calling AI
      logger.info(`💬 Instant reply to ${senderPhone}: ${aiCheck.replyType}`);
      const session = vendorSessions.get(vendorId);
      if (session && session.connectionState === 'open') {
        await sendWhatsAppMessage(vendorId, senderPhone, aiCheck.reply);
      }

      // Still store message for conversation history
      const conversationId = `${vendorId}:${senderPhone}`;
      await supabase.from('messages').insert({
        vendor_id: vendorId,
        conversation_id: conversationId,
        sender_phone: senderPhone,
        message_text: messageText,
        message_type: 'instant_reply',
        classified_category: aiCheck.replyType,
        classified_confidence: aiCheck.confidence || 1.0,
        ai_suggested_response: aiCheck.reply
      });

      return; // Skip AI processing
    }

    // Use AI for complex messages
    messageStats.aiCalls++;
    logger.info(`🤖 AI processing for ${senderPhone}: ${aiCheck.reason || 'complex'}`);
    const classification = await classifyWithGrok(messageText);

    // Generate conversation ID
    const conversationId = `${vendorId}:${senderPhone}`;

    // Store message in Supabase
    const { error: insertError } = await supabase.from('messages').insert({
      vendor_id: vendorId,
      conversation_id: conversationId,
      sender_phone: senderPhone,
      message_text: messageText,
      message_type: classification.type,
      classified_category: classification.type,
      classified_confidence: classification.confidence,
      ai_suggested_response: classification.suggestedResponse,
      metadata: classification
    });

    if (insertError) {
      logger.error(insertError, 'Failed to save message');
      return;
    }

    // Send auto-responses based on message type
    const session = vendorSessions.get(vendorId);
    if (session && session.connectionState === 'open') {
      if (classification.type === 'product_upload') {
        await sendWhatsAppMessage(vendorId, senderPhone, '✅ Product received! Thank you for listing with Beeline.');
      } else if (classification.type === 'buyer_inquiry') {
        await sendWhatsAppMessage(vendorId, senderPhone, '📩 New buyer inquiry received! Check your dashboard for details.');
      }
    }
  } catch (error) {
    logger.error(error, 'Failed to route message');
  }
}

/**
 * Classify message using Grok AI
 */
async function classifyWithGrok(messageText) {
  if (!config.groqApiKey) {
    return { type: 'general', confidence: 0 };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a message classifier for a marketplace. Classify messages as: product_upload, buyer_inquiry, payment_confirmation, or general. Respond with JSON: {"type": "...", "confidence": 0-1}'
        },
        {
          role: 'user',
          content: messageText
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"type":"general","confidence":0}');
    return result;
  } catch (error) {
    logger.error(error, 'Grok classification failed');
    return { type: 'general', confidence: 0 };
  }
}

/**
 * Send WhatsApp message from vendor's account
 */
async function sendWhatsAppMessage(vendorId, phone, message) {
  const session = vendorSessions.get(vendorId);

  if (!session || session.connectionState !== 'open') {
    throw new Error(`Vendor ${vendorId} not connected`);
  }

  const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
  await session.socket.sendMessage(jid, { text: message });
  logger.info(`Message sent from vendor ${vendorId} to ${phone}`);
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Generate QR code for vendor signup
 * Creates new WhatsApp session for this vendor
 */
app.post('/vendor/generate-qr', async (req, res) => {
  try {
    const { vendorId, vendorData } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required' });
    }

    logger.info(`📱 Generating QR for vendor ${vendorId}`);

    // Save vendor to Supabase
    const { error: vendorError } = await supabase
      .from('vendors')
      .upsert({
        id: vendorId,
        phone: vendorData?.phone,
        name: vendorData?.name || 'New Vendor',
        business_type: vendorData?.businessType || 'retail',
        account_type: vendorData?.accountType || 'personal',
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (vendorError) {
      logger.error(vendorError, 'Failed to save vendor');
    }

    // Create WhatsApp connection for this vendor
    const session = await connectVendorWhatsApp(vendorId);

    // Wait for QR code generation (max 30 seconds)
    const startTime = Date.now();
    while (!session.qr && (Date.now() - startTime) < 30000) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!session.qr) {
      return res.status(408).json({ error: 'QR code generation timeout' });
    }

    // Generate QR code image
    const QRCode = (await import('qrcode')).default;
    const qrImage = await QRCode.toDataURL(session.qr);

    logger.info(`✅ QR code ready for vendor ${vendorId}`);

    res.json({
      qrCode: qrImage,
      vendorId,
      expiresIn: 60
    });
  } catch (error) {
    logger.error(error, 'Vendor QR generation failed');
    res.status(500).json({ error: 'QR generation failed' });
  }
});

/**
 * Message classification statistics
 */
app.get('/stats/messages', async (req, res) => {
  const instantReplyRate = messageStats.total > 0
    ? ((messageStats.instantReplies / messageStats.total) * 100).toFixed(1)
    : '0.0';

  const aiCallRate = messageStats.total > 0
    ? ((messageStats.aiCalls / messageStats.total) * 100).toFixed(1)
    : '0.0';

  res.json({
    messageStats,
    rates: {
      instantReplyRate: `${instantReplyRate}%`,
      aiCallRate: `${aiCallRate}%`,
      costSavings: `~${Math.round(parseFloat(instantReplyRate) * 0.7)}% reduction in API costs`
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Session health statistics
 */
app.get('/stats/sessions', async (req, res) => {
  const stats = sessionMonitor.getStats();
  const sessions = Array.from(vendorSessions.entries()).map(([vendorId, session]) => ({
    vendorId,
    state: session.connectionState,
    hasQR: !!session.qr,
    uptime: stats.uptime[vendorId] ? Math.floor((Date.now() - stats.uptime[vendorId].startTime) / 1000) : 0
  }));

  res.json({
    sessionStats: stats,
    sessions,
    timestamp: new Date().toISOString()
  });
});

/**
 * Classify message using Grok AI
 */
app.post('/vendor/send-message', async (req, res) => {
  try {
    const { vendorId, phone, message } = req.body;

    if (!vendorId || !phone || !message) {
      return res.status(400).json({ error: 'vendorId, phone, and message are required' });
    }

    await sendWhatsAppMessage(vendorId, phone, message);

    res.json({
      success: true,
      message: 'Message sent successfully',
      vendorId,
      phone
    });
  } catch (error) {
    logger.error(error, 'Send message failed');
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get vendor session status
 */
app.get('/vendor/:vendorId/status', async (req, res) => {
  const { vendorId } = req.params;
  const session = vendorSessions.get(vendorId);

  let qrCode = null;
  if (session && session.qr) {
    // Generate QR code image if QR exists
    const QRCode = (await import('qrcode')).default;
    qrCode = await QRCode.toDataURL(session.qr);
  }

  res.json({
    vendorId,
    connected: session ? session.connectionState === 'open' : false,
    state: session ? session.connectionState : 'not_found',
    hasQR: session ? !!session.qr : false,
    qrCode: qrCode
  });
});

/**
 * Health check
 */
app.get('/health', async (req, res) => {
  const connectedVendors = Array.from(vendorSessions.values())
    .filter(s => s.connectionState === 'open').length;

  res.json({
    status: 'healthy',
    phoneModel: config.phoneModel,
    totalVendors: vendorSessions.size,
    connectedVendors,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function start() {
  try {
    // Load existing vendor sessions from database
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('status', 'active');

    if (!error && vendors) {
      logger.info(`Found ${vendors.length} active vendors, reconnecting...`);
      for (const vendor of vendors) {
        connectVendorWhatsApp(vendor.id).catch(err => {
          logger.error(err, `Failed to reconnect vendor ${vendor.id}`);
        });
      }
    }

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`🐝 Beeline Multi-Vendor Bridge running on port ${config.port}`);
      logger.info(`📱 Phone Model: ${config.phoneModel}`);
      logger.info(`🔌 Supabase: ${config.supabaseUrl.split('/').pop()}`);
      logger.info(`🤖 AI: Grok (via Groq)`);
      logger.info(`👥 Multi-vendor mode enabled`);
    });

    // Start session health monitoring
    sessionMonitor.start();
    logger.info('✅ Session health monitoring enabled (30s intervals)');
  } catch (error) {
    logger.error(error, 'Failed to start bridge');
    process.exit(1);
  }
}

start();
