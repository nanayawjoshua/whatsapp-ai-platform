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

import dotenv from 'dotenv';
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
import cors from 'cors';
import Redis from 'ioredis';
import pkg from 'pg';
const { Pool } = pkg;

// PROJECT OS - Phase 3: Oxylabs Proxy Integration
// Purpose: Route all outbound HTTP requests through residential proxies to bypass WhatsApp IP blocking
// Cost: $8/GB, auto-fallback if proxy fails, Ghana IP targeting for authenticity
import { HttpsProxyAgent } from 'https-proxy-agent';

// Load environment variables
dotenv.config();

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

// PROJECT OS - Phase 1: Oxylabs Configuration
// Residential proxy setup to bypass WhatsApp IP detection
// Cost: $8/GB, Ghana targeting for authentic residential IPs
const oxylabsConfig = {
  user: process.env.OXYLABS_USER,
  pass: process.env.OXYLABS_PASS,
  enabled: !!(process.env.OXYLABS_USER && process.env.OXYLABS_PASS),
  // Ghana targeting for authentic residential IPs (reduces detection risk)
  proxyUrl: process.env.OXYLABS_USER && process.env.OXYLABS_PASS
    ? `http://${process.env.OXYLABS_USER}:${process.env.OXYLABS_PASS}@res.oxylabs.io:7777?country=gh`
    : null,
  // Cost tracking: $8/GB, alert at 5GB/month usage
  costPerGB: 8,
  alertThresholdGB: 5
};

// Usage tracking for cost monitoring (PROJECT OS - Phase 5: Iteration)
let monthlyDataUsage = 0; // Track GB used this month
const usageResetDate = new Date();
usageResetDate.setDate(1); // Reset on first of month

// PROJECT OS - Phase 3: Proxied HTTP Client
// All outbound requests go through Oxylabs residential proxies to avoid IP blocking
// Auto-fallback to direct connection if proxy fails (resilience)
async function proxiedFetch(url, options = {}) {
  // PROJECT OS - Phase 5: Cost Tracking
  // Track data usage for monthly cost monitoring
  const trackUsage = (response) => {
    if (response && response.headers) {
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const bytes = parseInt(contentLength);
        const gbUsed = bytes / (1024 * 1024 * 1024);
        monthlyDataUsage += gbUsed;

        // Alert if approaching threshold
        if (monthlyDataUsage >= oxylabsConfig.alertThresholdGB) {
          logger.warn({
            monthlyDataUsage,
            alertThreshold: oxylabsConfig.alertThresholdGB,
            estimatedCost: monthlyDataUsage * oxylabsConfig.costPerGB
          }, 'PROJECT OS - Oxylabs usage alert: Approaching monthly limit');
        }
      }
    }
  };

  // If proxy is not configured, use direct connection
  if (!oxylabsConfig.enabled || !oxylabsConfig.proxyUrl) {
    logger.debug({ url }, 'PROJECT OS - Oxylabs: Proxy not configured, using direct connection');
    const response = await fetch(url, options);
    trackUsage(response);
    return response;
  }

  try {
    // Create proxy agent for residential IP routing
    const agent = new HttpsProxyAgent(oxylabsConfig.proxyUrl);

    // Add proxy agent to fetch options
    const proxiedOptions = {
      ...options,
      agent
    };

    logger.debug({ url, proxyUrl: oxylabsConfig.proxyUrl }, 'PROJECT OS - Oxylabs: Routing through residential proxy');

    const response = await fetch(url, proxiedOptions);
    trackUsage(response);

    logger.debug({
      url,
      status: response.status,
      monthlyDataUsage,
      estimatedCost: (monthlyDataUsage * oxylabsConfig.costPerGB).toFixed(2)
    }, 'PROJECT OS - Oxylabs: Request successful via proxy');

    return response;

  } catch (proxyError) {
    // PROJECT OS - Phase 4: Resilience - Auto-fallback
    // If proxy fails, fallback to direct connection (maintains service availability)
    logger.warn({
      url,
      proxyError: proxyError.message,
      proxyUrl: oxylabsConfig.proxyUrl
    }, 'PROJECT OS - Oxylabs: Proxy failed, falling back to direct connection');

    try {
      const response = await fetch(url, options);
      trackUsage(response);
      return response;
    } catch (directError) {
      logger.error({
        url,
        proxyError: proxyError.message,
        directError: directError.message
      }, 'PROJECT OS - Oxylabs: Both proxy and direct connection failed');
      throw directError;
    }
  }
}

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

// Redis client (conversation history cache) - with graceful degradation
let redis = null;
let redisAvailable = false;

try {
  // Build redis options and enable TLS for providers that require it (e.g. Upstash)
  const redisOptions = {
    maxRetriesPerRequest: 3, // Limit retries to prevent hanging
    enableReadyCheck: false,
    connectTimeout: 15000, // 15 second connection timeout
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries, disabling Redis');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    family: 4 // Force IPv4
  };

  // Detect Upstash or rediss scheme - enable TLS if needed
  // Determine whether TLS should be enabled for the Redis client (e.g. Upstash)
  let redisClientUrl = config.redisUrl;
  try {
    const parsed = new URL(config.redisUrl);
    const scheme = parsed.protocol; // e.g. 'redis:' or 'rediss:'
    const host = parsed.hostname || '';

    // If the URL explicitly uses rediss:// or the hostname indicates Upstash, enable TLS.
    if (scheme === 'rediss:' || host.includes('upstash.io') || config.redisUrl.startsWith('rediss://')) {
      logger.info({ scheme, host }, 'Redis URL indicates TLS is required - enabling TLS for client');
      // ioredis will use tls option when provided. Set servername to avoid SNI issues.
      redisOptions.tls = { servername: host };

      // Keep the original URL as provided by the environment. ioredis accepts TLS options
      // alongside a `redis://` scheme, so rewriting the scheme is unnecessary and can
      // cause confusion with provider consoles that show `redis://`.
      logger.debug('Using provided Redis URL with TLS options (no scheme rewrite)');
    } else {
      logger.info({ scheme, host }, 'Redis URL indicates TLS is not required for the client');
    }
  } catch (e) {
    logger.debug('Could not parse REDIS_URL for TLS detection, proceeding with provided URL');
  }

  // Initialize Redis client using the original (or possibly modified) URL and options
  redis = new Redis(redisClientUrl, redisOptions);

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
    redisAvailable = false;
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
    redisAvailable = true;
  });

  redis.on('ready', () => {
    logger.info('✅ Redis ready');
    redisAvailable = true;
  });
} catch (err) {
  logger.error({ err }, 'Failed to initialize Redis, continuing without cache');
  redis = null;
  redisAvailable = false;
}

// Express app (health checks, webhooks)
const app = express();
app.use(cors());
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
      if (!sessionData) {
        return { creds: {}, keys: {} };
      }
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
// HUMAN-IN-THE-LOOP SESSION MANAGEMENT
// ============================================================================

/**
 * Track vendor activity for a specific customer conversation
 */
async function updateVendorActivity(vendorId, customerId, activityType = 'message') {
  const key = `activity:${vendorId}:${customerId}`;
  const now = Date.now();

  try {
    const activityData = {
      lastHumanActivity: now,
      lastHumanReply: activityType === 'message' ? now : undefined,
      activityType,
      timestamp: now
    };

    await redis.setex(key, 3600, JSON.stringify(activityData)); // 1hr TTL
    logger.debug({ vendorId, customerId, activityType }, 'Vendor activity updated');
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to update vendor activity');
  }
}

/**
 * Get vendor activity status for a customer
 */
async function getVendorActivity(vendorId, customerId) {
  const key = `activity:${vendorId}:${customerId}`;

  try {
    const data = await redis.get(key);
    if (!data) {
      return {
        lastHumanActivity: 0,
        lastHumanReply: 0,
        activityType: null
      };
    }

    const activity = JSON.parse(data);
    return {
      lastHumanActivity: activity.lastHumanActivity || 0,
      lastHumanReply: activity.lastHumanReply || 0,
      activityType: activity.activityType || null
    };
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to get vendor activity');
    return {
      lastHumanActivity: 0,
      lastHumanReply: 0,
      activityType: null
    };
  }
}

/**
 * Get VIP contacts list for a vendor
 */
async function getVIPContacts(vendorId) {
  try {
    const result = await db.query(
      'SELECT vip_contacts FROM vendor_settings WHERE vendor_id = $1',
      [vendorId]
    );

    if (result.rows.length === 0 || !result.rows[0].vip_contacts) {
      return [];
    }

    return result.rows[0].vip_contacts; // Array of phone numbers
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to get VIP contacts');
    return [];
  }
}

/**
 * Get vendor AI settings (silence timeout, etc.)
 */
async function getVendorSettings(vendorId) {
  try {
    const result = await db.query(
      `SELECT 
        vs.ai_silence_timeout, 
        vs.ai_enabled,
        v.vendor_id,
        v.name,
        v.business_type,
        v.account_type,
        v.personality_tone,
        vs.system_prompt_override
      FROM vendor_settings vs
      LEFT JOIN vendors v ON v.vendor_id = vs.vendor_id
      WHERE vs.vendor_id = $1`,
      [vendorId]
    );

    if (result.rows.length === 0) {
      return {
        silenceTimeout: 5,
        aiEnabled: true,
        vendorId,
        businessName: 'Our Business',
        businessType: 'general',
        personalityTone: 'friendly',
        systemPrompt: null
      };
    }

    const row = result.rows[0];
    return {
      silenceTimeout: row.ai_silence_timeout || 5,
      aiEnabled: row.ai_enabled !== false,
      vendorId: row.vendor_id,
      businessName: row.name || 'Our Business',
      businessType: row.business_type || 'general',
      accountType: row.account_type || 'business',
      personalityTone: row.personality_tone || 'friendly',
      systemPrompt: row.system_prompt_override
    };
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to get vendor settings');
    return {
      silenceTimeout: 5,
      aiEnabled: true,
      vendorId,
      businessName: 'Our Business',
      businessType: 'general',
      personalityTone: 'friendly',
      systemPrompt: null
    };
  }
}

/**
 * CORE LOGIC: Decide if AI should respond based on priority rules
 *
 * Priority Rules (in order):
 * 1. Vendor typing or active in last 60 seconds → AI silent
 * 2. Message starts with /ai or ! → Force AI response
 * 3. Customer is VIP/pinned → Forward to vendor only, AI silent
 * 4. Long silence (> X minutes) → AI responds
 * 5. Message is media/voice/location → Vendor only
 * 6. Default → AI responds
 */
async function shouldAIRespond(message, vendorId, customerId) {
  const now = Date.now();

  // Get vendor activity status
  const activity = await getVendorActivity(vendorId, customerId);
  const vendorSettings = await getVendorSettings(vendorId);

  // Check if AI is globally disabled for this vendor
  if (!vendorSettings.aiEnabled) {
    logger.info({ vendorId, customerId }, 'AI disabled for vendor - forwarding to human');
    return { shouldRespond: false, reason: 'ai_disabled' };
  }

  // PRIORITY 1: Human typing or active in last 60 seconds
  if (now - activity.lastHumanActivity < 60_000) {
    logger.info({
      vendorId,
      customerId,
      timeSinceActivity: (now - activity.lastHumanActivity) / 1000
    }, 'Vendor recently active - AI stays silent');
    return { shouldRespond: false, reason: 'vendor_active' };
  }

  const messageText = message.message?.conversation ||
                      message.message?.extendedTextMessage?.text ||
                      '';

  // PRIORITY 2: Force AI with command prefix
  if (messageText.startsWith('/ai ') || messageText.startsWith('!')) {
    logger.info({ vendorId, customerId }, 'Force AI command detected');
    return { shouldRespond: true, reason: 'force_command', message: messageText.replace(/^(\/ai |!)/, '') };
  }

  // PRIORITY 3: VIP contacts → never AI
  const vipContacts = await getVIPContacts(vendorId);
  if (vipContacts.includes(customerId)) {
    logger.info({ vendorId, customerId }, 'VIP contact - forwarding to vendor only');
    return { shouldRespond: false, reason: 'vip_contact' };
  }

  // PRIORITY 4: Long silence → AI takes over
  const silenceMs = vendorSettings.silenceTimeout * 60_000;
  if (activity.lastHumanReply === 0 || (now - activity.lastHumanReply > silenceMs)) {
    logger.info({
      vendorId,
      customerId,
      silenceMinutes: vendorSettings.silenceTimeout
    }, 'Silence timeout exceeded - AI responding');
    return { shouldRespond: true, reason: 'silence_timeout' };
  }

  // PRIORITY 5: Media/voice/location → human only
  const messageType = Object.keys(message.message || {})[0];
  const humanOnlyTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'locationMessage', 'stickerMessage'];

  if (humanOnlyTypes.includes(messageType)) {
    logger.info({ vendorId, customerId, messageType }, 'Media message - forwarding to vendor only');
    return { shouldRespond: false, reason: 'media_message', messageType };
  }

  // PRIORITY 6: Default - AI responds
  logger.info({ vendorId, customerId }, 'Default rule - AI responding');
  return { shouldRespond: true, reason: 'default' };
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
    }
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
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
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
      if (!msg.message || msg.key.fromMe) {
        // Track vendor's own messages as human activity
        if (msg.key.fromMe && msg.key.remoteJid) {
          await updateVendorActivity(vendorId, msg.key.remoteJid, 'message');
          logger.debug({ vendorId, customerId: msg.key.remoteJid }, 'Vendor sent message - activity tracked');
        }
        continue;
      }

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

      // HUMAN-IN-THE-LOOP: Check if AI should respond
      const aiDecision = await shouldAIRespond(msg, vendorId, customerId);

      if (!aiDecision.shouldRespond) {
        logger.info({
          vendorId,
          customerId,
          reason: aiDecision.reason,
          messageType: aiDecision.messageType
        }, '🧑 Human mode - AI staying silent');

        // PROJECT OS - Phase 3: Forward to n8n via Oxylabs proxy
        // Bypasses WhatsApp IP detection for vendor notifications
        try {
          await proxiedFetch(config.n8nWebhookUrl, {
            method: 'POST',
            body: JSON.stringify({
              event: 'vendor_notification',
              vendorId,
              customerId,
              message: messageContent,
              reason: aiDecision.reason,
              messageType: aiDecision.messageType || 'text',
              timestamp: Date.now(),
              rawMessage: msg.message
            }),
            headers: { 'Content-Type': 'application/json' },
            // Note: proxiedFetch handles timeout internally, but we keep this for reference
            signal: AbortSignal.timeout(5000)
          });

          logger.info({ vendorId, customerId }, 'Message forwarded to vendor for manual handling');
        } catch (error) {
          logger.error({ vendorId, customerId, error }, 'Failed to notify vendor');
        }

        continue;
      }

      // Load conversation history from Redis
      const history = await getConversationHistory(vendorId, customerId);

      // AI MODE: Forward to n8n for AI processing
      try {
        await sock.sendPresenceUpdate('composing', customerId);

        // Use overridden message if force command was used
        const finalMessage = aiDecision.message || messageContent;

        // Get vendor settings for persona
        const vendorSettings = await getVendorSettings(vendorId);

        const payload = {
          vendorId,
          customerId,
          message: finalMessage,
          channel: 'whatsapp',
          conversationHistory: history,
          timestamp: Date.now(),
          aiReason: aiDecision.reason,
          // Vendor persona configuration
          vendor: {
            name: vendorSettings.businessName,
            businessType: vendorSettings.businessType,
            accountType: vendorSettings.accountType,
            personalityTone: vendorSettings.personalityTone,
            systemPromptOverride: vendorSettings.systemPrompt
          }
        };

        logger.debug({ payload }, 'PROJECT OS - Phase 3: Forwarding to n8n via Oxylabs proxy for AI response');

        // PROJECT OS - Phase 3: Route AI requests through residential proxy
        // Prevents WhatsApp from detecting cloud IP patterns
        const response = await proxiedFetch(config.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        const aiResponse = responseData.reply;

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

        logger.info({ vendorId, customerId, reason: aiDecision.reason }, '✅ AI response sent');

      } catch (error) {
        logger.error({ vendorId, customerId, error }, 'Failed to process message with AI');
        await sock.sendMessage(customerId, {
          text: '⏳ Connection issue. Your message is saved, I\'ll reply soon!'
        });
      }
    }
  });

  vendorSockets.set(vendorId, sock);

  // Give Baileys a moment to start connection and emit QR
  // This is a workaround for the async nature of Baileys connection
  await new Promise(resolve => setTimeout(resolve, 2000));

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
    // Check database
    await db.query('SELECT 1');

    // Check Redis with timeout (optional, don't fail if unavailable)
    let redisStatus = 'unavailable';
    if (redis && redisAvailable) {
      try {
        await Promise.race([
          redis.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ]);
        redisStatus = 'connected';
      } catch (err) {
        redisStatus = 'timeout';
        logger.warn('Redis ping timeout in health check');
      }
    }

    // PROJECT OS - Phase 5: Health check includes Oxylabs status
    // Monitor proxy health and usage for cost control
    res.json({
      status: 'healthy',
      redis: redisStatus,
      vendors: vendorSockets.size,
      maxVendors: config.maxVendors,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      // PROJECT OS - Oxylabs monitoring
      oxylabs: {
        enabled: oxylabsConfig.enabled,
        monthlyDataUsageGB: monthlyDataUsage.toFixed(4),
        estimatedCostUSD: (monthlyDataUsage * oxylabsConfig.costPerGB).toFixed(2),
        alertThresholdGB: oxylabsConfig.alertThresholdGB,
        status: oxylabsConfig.enabled ? 'active' : 'disabled'
      }
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Generate QR code for new vendor onboarding
app.post('/vendor/generate-qr', async (req, res) => {
  console.log('🔄 Received /vendor/generate-qr request:', req.body);
  const { vendorId, vendorData } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId required' });
  }

  if (vendorSockets.size >= config.maxVendors) {
    return res.status(503).json({ error: 'Server at capacity, please try another instance' });
  }

  try {
    logger.info({ vendorId, vendorData }, 'Generating QR code for vendor');

    // Extract vendor data from request (sent from website after payment)
    const name = vendorData?.name || 'New Vendor';
    const phone = vendorData?.phone || vendorId;
    const email = vendorData?.email || null;
    const businessType = vendorData?.businessType || null;
    const accountType = vendorData?.accountType || 'business'; // personal, business, or enterprise

    // Check if vendor with this phone already exists
    const existingVendor = await db.query(
      `SELECT vendor_id FROM vendors WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    let finalVendorId = vendorId;
    if (existingVendor.rows.length > 0) {
      // Use existing vendor ID
      finalVendorId = existingVendor.rows[0].vendor_id;
      logger.info({ phone, existingVendorId: finalVendorId }, 'Using existing vendor for phone');
    } else {
      // Create new vendor record
      await db.query(
        `INSERT INTO vendors (vendor_id, name, phone, email, business_type, account_type, subscription_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [vendorId, name, phone, email, businessType, accountType, 'trial']
      );
    }

    // Create initial session record
    await db.query(
      `INSERT INTO vendor_sessions (vendor_id, status, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (vendor_id) DO NOTHING`,
      [finalVendorId, 'initializing']
    );

    logger.info({ vendorId: finalVendorId }, 'About to connect vendor...');
    // Connect (will generate QR)
    await connectVendor(finalVendorId);
    logger.info({ vendorId: finalVendorId }, 'Connect vendor completed');

    // Wait for QR to be generated (polling)
    let attempts = 0;
    while (attempts < 30) {
      const result = await db.query(
        'SELECT qr_code FROM vendor_sessions WHERE vendor_id = $1',
        [finalVendorId]
      );

      if (result.rows[0]?.qr_code) {
        return res.json({
          qrCode: result.rows[0].qr_code,
          vendorId: finalVendorId,
          expiresIn: 60
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    res.status(408).json({ error: 'QR generation timeout' });
  } catch (error) {
    logger.error({ vendorId, finalVendorId, error }, 'Failed to generate QR');
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
// HUMAN-IN-THE-LOOP API ENDPOINTS
// ============================================================================

// Update vendor AI settings
app.post('/vendor/settings', async (req, res) => {
  const { vendorId, aiEnabled, silenceTimeout } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId required' });
  }

  try {
    await db.query(
      `INSERT INTO vendor_settings (vendor_id, ai_enabled, ai_silence_timeout)
       VALUES ($1, $2, $3)
       ON CONFLICT (vendor_id)
       DO UPDATE SET ai_enabled = $2, ai_silence_timeout = $3`,
      [vendorId, aiEnabled !== undefined ? aiEnabled : true, silenceTimeout || 5]
    );

    logger.info({ vendorId, aiEnabled, silenceTimeout }, 'Vendor settings updated');

    res.json({
      success: true,
      settings: {
        aiEnabled: aiEnabled !== undefined ? aiEnabled : true,
        silenceTimeout: silenceTimeout || 5
      }
    });
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to update vendor settings');
    res.status(500).json({ error: error.message });
  }
});

// Get vendor settings
app.get('/vendor/settings/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  try {
    const settings = await getVendorSettings(vendorId);
    const vipContacts = await getVIPContacts(vendorId);

    res.json({
      success: true,
      settings: {
        aiEnabled: settings.aiEnabled,
        silenceTimeout: settings.silenceTimeout,
        vipContacts: vipContacts || []
      }
    });
  } catch (error) {
    logger.error({ vendorId, error }, 'Failed to get vendor settings');
    res.status(500).json({ error: error.message });
  }
});

// Add VIP contact
app.post('/vendor/vip/add', async (req, res) => {
  const { vendorId, contactId } = req.body;

  if (!vendorId || !contactId) {
    return res.status(400).json({ error: 'vendorId and contactId required' });
  }

  try {
    // Get current VIP contacts
    const currentVIPs = await getVIPContacts(vendorId);

    // Add new contact if not already VIP
    if (!currentVIPs.includes(contactId)) {
      currentVIPs.push(contactId);
    }

    await db.query(
      `INSERT INTO vendor_settings (vendor_id, vip_contacts)
       VALUES ($1, $2)
       ON CONFLICT (vendor_id)
       DO UPDATE SET vip_contacts = $2`,
      [vendorId, currentVIPs]
    );

    logger.info({ vendorId, contactId }, 'VIP contact added');

    res.json({
      success: true,
      vipContacts: currentVIPs
    });
  } catch (error) {
    logger.error({ vendorId, contactId, error }, 'Failed to add VIP contact');
    res.status(500).json({ error: error.message });
  }
});

// Remove VIP contact
app.post('/vendor/vip/remove', async (req, res) => {
  const { vendorId, contactId } = req.body;

  if (!vendorId || !contactId) {
    return res.status(400).json({ error: 'vendorId and contactId required' });
  }

  try {
    // Get current VIP contacts
    const currentVIPs = await getVIPContacts(vendorId);

    // Remove contact
    const updatedVIPs = currentVIPs.filter(c => c !== contactId);

    await db.query(
      `UPDATE vendor_settings SET vip_contacts = $1 WHERE vendor_id = $2`,
      [updatedVIPs, vendorId]
    );

    logger.info({ vendorId, contactId }, 'VIP contact removed');

    res.json({
      success: true,
      vipContacts: updatedVIPs
    });
  } catch (error) {
    logger.error({ vendorId, contactId, error }, 'Failed to remove VIP contact');
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger AI response for a specific conversation
app.post('/vendor/force-ai', async (req, res) => {
  const { vendorId, customerId } = req.body;

  if (!vendorId || !customerId) {
    return res.status(400).json({ error: 'vendorId and customerId required' });
  }

  try {
    // Clear recent activity to allow AI
    await redis.del(`activity:${vendorId}:${customerId}`);

    logger.info({ vendorId, customerId }, 'AI force-enabled for conversation');

    res.json({
      success: true,
      message: 'AI will respond to next customer message'
    });
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to force AI');
    res.status(500).json({ error: error.message });
  }
});

// Pause AI for a conversation (vendor taking over)
app.post('/vendor/pause-ai', async (req, res) => {
  const { vendorId, customerId, durationMinutes } = req.body;

  if (!vendorId || !customerId) {
    return res.status(400).json({ error: 'vendorId and customerId required' });
  }

  try {
    // Update activity to mark vendor as active
    await updateVendorActivity(vendorId, customerId, 'manual_pause');

    // If duration specified, set expiry
    if (durationMinutes && durationMinutes > 0) {
      const key = `activity:${vendorId}:${customerId}`;
      await redis.expire(key, durationMinutes * 60);
    }

    logger.info({ vendorId, customerId, durationMinutes }, 'AI paused for conversation');

    res.json({
      success: true,
      message: `AI paused${durationMinutes ? ` for ${durationMinutes} minutes` : ''}`
    });
  } catch (error) {
    logger.error({ vendorId, customerId, error }, 'Failed to pause AI');
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
    // DISABLED: Prevents auto-reconnect loop for old test sessions
    // Vendors will connect when they request new QR codes
    // await connectAllVendors();

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
