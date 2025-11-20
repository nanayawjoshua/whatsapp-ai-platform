#!/usr/bin/env node

/**
 * Beelyne AI Platform - Unified Inbound Webhook
 *
 * ONE webhook for ALL channels:
 * - Telegram
 * - WhatsApp (Baileys)
 * - SMS/iMessage (Twilio) - coming soon
 *
 * Auto-detects channel, normalizes format, routes to n8n
 */

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import pino from 'pino';

// Configuration
const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp',
  port: process.env.PORT || 3000
};

// Logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Conversation Memory (in-memory for MVP - will move to Redis/DB for production)
// Structure: { "user_id": [ {role: "user", content: "..."}, {role: "assistant", content: "..."} ] }
const conversationHistory = new Map();
const MAX_HISTORY = 10; // Keep last 10 messages per user

// Initialize Telegram Bot
const telegramBot = new TelegramBot(config.telegramToken, { polling: true });

logger.info('🐝 Beelyne AI Platform - Unified Webhook Starting...');
logger.info({
  channels: ['Telegram'],
  n8nWebhook: config.n8nWebhookUrl,
  conversationMemory: 'Enabled (in-memory)'
});

/**
 * Get conversation history for a user
 */
function getHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

/**
 * Add message to conversation history
 */
function addToHistory(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content });

  // Keep only last MAX_HISTORY messages
  if (history.length > MAX_HISTORY) {
    history.shift(); // Remove oldest
  }

  conversationHistory.set(userId, history);
}

/**
 * Clear conversation history for a user
 */
function clearHistory(userId) {
  conversationHistory.delete(userId);
  logger.info({ userId }, 'Conversation history cleared');
}

/**
 * Send message to n8n for AI processing
 */
async function processWithAI(channel, from, message, metadata = {}) {
  try {
    // Get conversation history
    const history = getHistory(from);

    const payload = {
      from,
      message,
      channel,
      timestamp: new Date().toISOString(),
      conversationHistory: history, // ← Send history to n8n!
      ...metadata
    };

    logger.info({
      channel,
      from,
      message: message.substring(0, 50),
      historyLength: history.length,
      history: history  // ← Log the actual history content
    }, 'Processing message');

    const response = await axios.post(config.n8nWebhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 second timeout
    });

    logger.info({ channel, status: response.status }, 'Message sent to n8n');

    // ✅ IMPORTANT: Save the AI response to conversation history
    // n8n returns plain text response now (not JSON)
    const aiReply = typeof response.data === 'string' ? response.data : response.data.reply;
    if (aiReply) {
      addToHistory(from, 'assistant', aiReply);
      logger.info({ from, replyLength: aiReply.length }, 'AI response saved to history');
    }

    return response.data;

  } catch (error) {
    logger.error({
      channel,
      error: error.message,
      stack: error.stack
    }, 'Failed to process with AI');
    throw error;
  }
}

/**
 * Send reply back to customer via correct channel
 */
async function sendReply(channel, to, message) {
  try {
    switch (channel) {
      case 'telegram':
        await telegramBot.sendMessage(to, message, { parse_mode: 'Markdown' });
        logger.info({ channel, to }, 'Reply sent');
        break;

      case 'whatsapp':
        // TODO: Implement WhatsApp reply when Baileys is integrated
        logger.warn({ channel }, 'WhatsApp replies not yet implemented');
        break;

      case 'sms':
        // TODO: Implement SMS reply when Twilio is integrated
        logger.warn({ channel }, 'SMS replies not yet implemented');
        break;

      default:
        logger.error({ channel }, 'Unknown channel');
    }
  } catch (error) {
    logger.error({ channel, error: error.message }, 'Failed to send reply');
  }
}

/**
 * TELEGRAM Handler
 */
telegramBot.on('message', async (msg) => {
  try {
    // Ignore non-text messages for now
    if (!msg.text) {
      logger.debug({ type: msg.type }, 'Ignoring non-text message');
      return;
    }

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name || 'User';
    const message = msg.text;

    // Handle special commands
    if (message === '/clear' || message === '/reset') {
      clearHistory(`${userId}`);
      await telegramBot.sendMessage(chatId, '🧹 Conversation history cleared! Starting fresh.');
      return;
    }

    // Add user message to history
    addToHistory(`${userId}`, 'user', message);

    // Send typing indicator
    await telegramBot.sendChatAction(chatId, 'typing');

    // Process with AI
    try {
      await processWithAI('telegram', `${userId}`, message, {
        username,
        chat_id: chatId,
        message_id: msg.message_id
      });

      // Note: The AI response will be sent back via the n8n workflow's HTTP Request node
      // which calls Telegram's sendMessage API directly
      logger.info({ userId, chatId }, 'Message forwarded to n8n workflow');

    } catch (aiError) {
      // Fallback response if n8n fails
      await telegramBot.sendMessage(
        chatId,
        '❌ Sorry, I encountered an error processing your message. Please try again in a moment.'
      );
    }

  } catch (error) {
    logger.error({ error: error.message }, 'Telegram message handler error');
  }
});

// Handle errors
telegramBot.on('polling_error', (error) => {
  logger.error({ error: error.message }, 'Telegram polling error');
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  telegramBot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  telegramBot.stopPolling();
  process.exit(0);
});

logger.info('✅ Beelyne AI Platform is running!');
logger.info('📱 Telegram bot is listening for messages...');
logger.info('🤖 Messages will be forwarded to n8n for AI processing');
logger.info('');
logger.info('Ready to receive your first message! Try messaging @beelyne_ai_bot on Telegram');
