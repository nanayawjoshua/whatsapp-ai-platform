/**
 * BEELINE GHANA - CLOUD BRIDGE SERVICE
 *
 * Thin WhatsApp gateway that forwards messages to n8n for AI processing.
 * This service ONLY handles:
 * 1. Baileys WhatsApp sessions (multi-vendor)
 * 2. Message receiving/sending
 * 3. Session persistence (PostgreSQL)
 * 4. Conversation history (Redis)
 *
 * Business logic (persona, products, AI) runs in n8n (unchanged).
 *
 * Capacity: 75-80 vendors per 512MB instance
 * Scaling: Horizontal via Render auto-scaling
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import axios from 'axios';
import express from 'express';
import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  port: process.env.PORT || 3000,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
  maxVendors: parseInt(process.env.MAX_VENDORS || '75'),
  environment: process.env.NODE_ENV || 'production'
};

// Logger
const logger = pino({
  level: config.logLevel,
  transport: config.environment === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

// PostgreSQL connection pool
const db = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.environment === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Redis client (conversation history cache)
const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));
redis.on('connect', () => logger.info('✅ Redis connected'));

// Express app (health checks, webhooks)
const app = express();
app.use(express.json());

// Active WhatsApp sockets (in-memory)
const vendorSockets = new Map();

// ============================================================================
// POSTGRESQL SESSION STORAGE (replaces useMultiFileAuthState)
// ============================================================================

/**
 * Custom auth state that stores Baileys sessions in PostgreSQL
 * Instead of: const { state, saveCreds } = await useMultiFileAuthState('./sessions')
 */
async function usePostgresAuthState(vendorId) {
  // Load existing session from database
  const loadState = async () => {
    try {
      const result = await db.query(
        'SELECT session_data FROM vendor_sessions WHERE vendor_id = $1',
        [vendorId]
      );

      if (result.rows.length === 0) {
        logger.info({ vendorId }, 'No existing session found, will create new');
        return { creds: {}, keys: {} };
      }

      const sessionData = result.rows[0].session_data;
      return {
        creds: sessionData.creds || {},
        keys: sessionData.keys || {}
      };
    } catch (error) {
      logger.error({ vendorId, error }, 'Failed to load session from database');
      return { creds: {}, keys: {} };
    }
  };

  const state = await loadState();

  // Save credentials to database
  const saveCreds = async () => {
    try {
      await db.query(
        `INSERT INTO vendor_sessions (vendor_id, session_data, last_active)
         VALUES ($1, $2, NOW())
         ON CONFLICT (vendor_id)
         DO UPDATE SET session_data = $2, last_active = NOW()`,
        [vendorId, { creds: state.creds, keys: state.keys }]
      );
      logger.debug({ vendorId }, 'Session saved to database');
    } catch (error) {
      logger.error({ vendorId, error }, 'Failed to save session to database');
    }
  };

  return {
    state: {
      creds: state.creds,
      keys: state.keys
    },
    saveCreds
  };
}

// ============================================================================
// REDIS CONVERSATION HISTORY (replaces in-memory Map)
// ============================================================================

async function getConversationHistory(vendorId, customerId) {
  const key = `history:${vendorId}:${customerId}`;
  try {
    const history = await redis.get(key);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to load history from Redis');
    return [];
  }
}

async function saveConversationHistory(vendorId, customerId, history) {
  const key = `history:${vendorId}:${customerId}`;
  try {
    // Keep last 10 messages only
    const trimmed = history.slice(-10);
    await redis.setex(key, 86400, JSON.stringify(trimmed)); // 24hr TTL
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to save history to Redis');
  }
}

// ============================================================================
// WHATSAPP CONNECTION (per vendor)
// ============================================================================

async function connectVendor(vendorId) {
  if (vendorSockets.has(vendorId)) {
    logger.warn({ vendorId }, 'Vendor already connected, skipping');
    return vendorSockets.get(vendorId);
  }

  logger.info({ vendorId }, 'Connecting vendor to WhatsApp...');

  const { state, saveCreds } = await usePostgresAuthState(vendorId);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }), // Suppress Baileys logs
    printQRInTerminal: false, // QR generated via API endpoint
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // Connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info({ vendorId }, 'QR code generated (save to database for web display)');
      await db.query(
        'UPDATE vendor_sessions SET qr_code = $1, status = $2 WHERE vendor_id = $3',
        [qr, 'waiting_for_scan', vendorId]
      );
    }

    if (connection === 'open') {
      logger.info({ vendorId }, '✅ WhatsApp connected!');
      await db.query(
        'UPDATE vendor_sessions SET status = $1, last_active = NOW() WHERE vendor_id = $2',
        ['connected', vendorId]
      );
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.warn({ vendorId, shouldReconnect }, 'WhatsApp disconnected');

      if (shouldReconnect) {
        vendorSockets.delete(vendorId);
        setTimeout(() => connectVendor(vendorId), 5000);
      } else {
        await db.query(
          'UPDATE vendor_sessions SET status = $1 WHERE vendor_id = $2',
          ['logged_out', vendorId]
        );
        vendorSockets.delete(vendorId);
      }
    }
  });

  // Incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const customerId = msg.key.remoteJid;
      const messageContent = msg.message.conversation ||
                            msg.message.extendedTextMessage?.text ||
                            '';

      logger.info({ vendorId, customerId, messageContent }, '📨 Message received');

      // Handle BUZZ referral trigger (no AI needed)
      if (messageContent.toLowerCase().trim() === 'buzz') {
        const referralLink = `https://beeline.works/signup?ref=${vendorId}`;
        await sock.sendMessage(customerId, {
          text: `🐝 *Awesome! Let's get you your own AI employee!*\n\n` +
                `Click here: ${referralLink}\n\n` +
                `✨ Your vendor gets *7 days free* as a thank you!\n\n` +
                `Join hundreds of vendors already using Beeline to grow their business 24/7.`
        });
        logger.info({ vendorId, customerId, referralInitiated: true }, '🐝 BUZZ detected');
        continue;
      }

      // Handle /clear command (reset conversation)
      if (messageContent.toLowerCase().trim() === '/clear') {
        await redis.del(`history:${vendorId}:${customerId}`);
        await sock.sendMessage(customerId, {
          text: '🔄 Conversation reset! Ask me anything.'
        });
        logger.info({ vendorId, customerId }, 'Conversation cleared');
        continue;
      }

      // Load conversation history from Redis
      const history = await getConversationHistory(vendorId, customerId);

      // Forward to n8n for AI processing
      try {
        await sock.sendPresenceUpdate('composing', customerId);

        const payload = {
          vendorId,
          customerId,
          message: messageContent,
          channel: 'whatsapp',
          conversationHistory: history,
          timestamp: Date.now()
        };

        logger.debug({ payload }, 'Forwarding to n8n');

        const response = await axios.post(config.n8nWebhookUrl, payload, {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        });

        const aiResponse = response.data.reply;

        // Payment detection (triggers virality footer)
        const paymentDetected = aiResponse.match(/(momo|ghs\s*\d+)/i);
        let fullResponse = aiResponse;

        if (paymentDetected) {
          fullResponse += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `_Powered by Beeline 🐝_\n\n` +
                          `Need your own AI employee?\n` +
                          `Reply *BUZZ* and get started!\n\n` +
                          `_(Your vendor gets 7 days free!)_\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━`;
          logger.info({ vendorId, paymentDetected: true }, 'Payment detected - showing virality footer');
        }

        // Send AI response to customer
        await sock.sendMessage(customerId, { text: fullResponse });

        // Save conversation history to Redis
        history.push({ role: 'user', content: messageContent });
        history.push({ role: 'assistant', content: aiResponse });
        await saveConversationHistory(vendorId, customerId, history);

        logger.info({ vendorId, customerId }, '✅ AI response sent');

      } catch (error) {
        logger.error({ vendorId, customerId, error }, 'Failed to process message with AI');
        await sock.sendMessage(customerId, {
          text: '⏳ Connection issue. Your message is saved, I\'ll reply soon!'
        });
      }
    }
  });

  vendorSockets.set(vendorId, sock);
  return sock;
}

// ============================================================================
// STARTUP: Connect All Active Vendors
// ============================================================================

async function connectAllVendors() {
  try {
    const result = await db.query(
      'SELECT vendor_id FROM vendor_sessions WHERE status != $1 ORDER BY last_active DESC',
      ['logged_out']
    );

    logger.info({ count: result.rows.length }, 'Connecting vendors on startup...');

    for (const row of result.rows) {
      await connectVendor(row.vendor_id);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Stagger connections
    }

    logger.info('✅ All vendors connected');
  } catch (error) {
    logger.error({ error }, 'Failed to connect vendors on startup');
  }
}

// ============================================================================
// EXPRESS API ENDPOINTS
// ============================================================================

// Health check (used by Render)
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();

    res.json({
      status: 'healthy',
      vendors: vendorSockets.size,
      maxVendors: config.maxVendors,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Generate QR code for new vendor onboarding
app.post('/vendor/generate-qr', async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId required' });
  }

  if (vendorSockets.size >= config.maxVendors) {
    return res.status(503).json({ error: 'Server at capacity, please try another instance' });
  }

  try {
    logger.info({ vendorId }, 'Generating QR code for new vendor');

    // Create initial session record
    await db.query(
      `INSERT INTO vendor_sessions (vendor_id, status, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (vendor_id) DO NOTHING`,
      [vendorId, 'initializing']
    );

    // Connect (will generate QR)
    await connectVendor(vendorId);

    // Wait for QR to be generated (polling)
    let attempts = 0;
    while (attempts < 30) {
      const result = await db.query(
        'SELECT qr_code FROM vendor_sessions WHERE vendor_id = $1',
        [vendorId]
      );

      if (result.rows[0]?.qr_code) {
        return res.json({
          qrCode: result.rows[0].qr_code,
          vendorId,
          expiresIn: 60
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    res.status(408).json({ error: 'QR generation timeout' });
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to generate QR');
    res.status(500).json({ error: error.message });
  }
});

// Disconnect vendor (logout)
app.post('/vendor/disconnect', async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId required' });
  }

  try {
    const sock = vendorSockets.get(vendorId);
    if (sock) {
      await sock.logout();
      vendorSockets.delete(vendorId);
    }

    await db.query(
      'UPDATE vendor_sessions SET status = $1 WHERE vendor_id = $2',
      ['logged_out', vendorId]
    );

    res.json({ success: true, vendorId });
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to disconnect vendor');
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function start() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected');

    // Connect all vendors from database
    await connectAllVendors();

    // Start Express server
    app.listen(config.port, () => {
      logger.info({ port: config.port }, '🚀 Beeline Bridge Server running');
      logger.info({
        maxVendors: config.maxVendors,
        environment: config.environment,
        n8nUrl: config.n8nWebhookUrl
      }, 'Configuration loaded');
    });

  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');

  // Disconnect all vendors
  for (const [vendorId, sock] of vendorSockets.entries()) {
    try {
      await sock.end();
      logger.info({ vendorId }, 'Vendor disconnected');
    } catch (error) {
      logger.error({ vendorId, error }, 'Failed to disconnect vendor');
    }
  }

  await db.end();
  await redis.quit();
  process.exit(0);
});

start();
