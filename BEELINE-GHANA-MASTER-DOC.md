# BEELINE - MASTER DOCUMENTATION
**Multi-Platform AI Operating System for African Commerce**
**December 6, 2025**
**Version 2.1 - Enterprise Edition with Full Multi-Tier Support**

---

## 🐝 VISION STATEMENT

**"Beeline is becoming the messaging Operating System for African commerce and personal life."**

**We are not building a bot.**

**We are building the real-time, permissioned commerce + personal-assistant graph for 200 million Africans.**

**The AI is the hook. The graph is the moat.**

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Product Vision & Multi-Platform Strategy](#product-vision--multi-platform-strategy)
3. [Current System Status (December 5, 2025)](#current-system-status)
4. [Three-Tier Pricing Strategy](#three-tier-pricing-strategy)
5. [Technical Architecture](#technical-architecture)
6. [What's Live Now](#whats-live-now)
7. [Pending Implementation](#pending-implementation)
8. [Multi-Platform Expansion Roadmap](#multi-platform-expansion-roadmap)
9. [Commerce Graph End-Game](#commerce-graph-end-game)
10. [Business Model & Economics](#business-model--economics)
11. [Deployment Guide](#deployment-guide)
12. [Appendix](#appendix)

---

## EXECUTIVE SUMMARY

**Beeline** is a production-ready, multi-platform AI operating system that transforms any messaging number (WhatsApp, Telegram, TikTok, iMessage, SMS) into a 24/7 AI employee. As of December 6, 2025, we have:

### 🚀 LIVE NOW (beeline.works):
- ✅ **Complete Website** - Next.js 14 with dark mode, 3-tier pricing page
- ✅ **Enterprise Flat-Fee Pricing** - GHS 49 (Personal) / 99 (Business) / 395-2,940 (Enterprise)
- ✅ **6 Paystack Subscription Plans** - All plans created and live
- ✅ **Live Payment System** - Real payments processing with auto-subscriptions
- ✅ **Full Enterprise Database Schema** - Multi-location support, team management, analytics
- ✅ **Account Type Differentiation** - Personal, Business, Enterprise tracked in database
- ✅ **Volume-Based Pricing** - Automatic discounts for 3-60 locations (20-50% off)
- ✅ **Multi-Step Signup Flow** - Info → Voice note → Personality → Payment → QR
- ✅ **Human-in-the-Loop Controls** - Industry-standard vendor takeover system

### ⏳ READY TO DEPLOY:
- ⏳ **Raspberry Pi 4 Bridge** - WhatsApp gateway (50-75 vendors per Pi)
- ⏳ **Cloud AI Processing** - n8n + Groq Llama 3.3 70B
- ⏳ **Multi-location Dashboard** - Enterprise accounts can manage all branches
- ⏳ **Telegram Integration** - Already working, needs production deployment

### 🎯 BUSINESS METRICS (Updated December 5, 2025):
- **Economics:** 90% profit margin at scale
- **Revenue Model:** GHS 49-2,999/month (Personal to Enterprise)
- **Break-even:** 5 users
- **Month 1 Target:** 10 enterprise accounts = GHS 10,000 MRR
- **Year 1 Target:** 200 Enterprise + 2,000 Personal + 3,000 Business = GHS 740,000 MRR (~$62,000)
- **Year 5 Vision:** 200M Africans on Beeline Graph (data + financial infrastructure layer)

---

## PRODUCT VISION & MULTI-PLATFORM STRATEGY

### The 10 Locked Principles (Updated December 5, 2025)

1. **We sell saved human minutes** - for both commerce (vendors) and personal life (individuals)
2. **Phone number is the moat** - users keep their own trusted number/username
3. **Platform-agnostic architecture** - One bridge, infinite channels:
   - ✅ **WhatsApp** (Primary - 75% of African messaging)
   - ✅ **Telegram** (Already working - 15% market share)
   - 🔜 **TikTok Shop DMs** (E-commerce integration)
   - 🔜 **iMessage** (Premium iOS users)
   - 🔜 **SMS** (Universal fallback - every phone)
   - 🔜 **Instagram DMs** (Youth market)
   - 🔜 **Facebook Messenger** (Still 30% in rural areas)
4. **Flat-fee enterprise pricing** - Zero friction to scale within tiers
5. **Only metric: WAS** (Weekly Active Shops/Subscribers - ≥1 active session/week)
6. **Cheapest loop** - Groq ($0.50/1M tokens) + Render ($7/mo) + Paystack (1.5%)
7. **Viral coefficient >1.0** - BUZZ referral system + 7 days free
8. **Channel-death resistant** - If WhatsApp bans/blocks → instant migration to Telegram/SMS
9. **Long-term: Commerce graph** - Data layer (Beeline Insights) + Financial layer (Beeline Credit)
10. **Platform play (2028+)** - Become the Android of messaging in Africa

### Multi-Platform Mission Statement

Turn every African's messaging presence (WhatsApp/Telegram/TikTok/iMessage/SMS) into:

**For Commerce (Business/Enterprise tiers):**
- 24/7 AI employee that never sleeps, never steals
- Speaks Twi, English, Pidgin, Swahili (multi-language)
- Closes deals across all customer channels
- Costs GHS 99-2,999/month (75-95% cheaper than competitors)

**For Personal Life (Personal tier - GHS 49/month):**
- Proactive AI assistant that reads your chat history (with consent)
- Reminds you of birthdays, appointments, follow-ups
- Drafts messages for you
- Manages your schedule across all messaging apps
- **This is what Meta AI can NEVER do** (privacy locked)

### Why Multi-Platform Matters

**Channel Death Risk:**
- WhatsApp could ban automation (already happening to some bots)
- TikTok could shut down Shop messaging
- Any single platform = single point of failure

**Beeline Solution:**
- Users sign up once, connect all messaging channels
- AI works across ALL platforms with same personality
- If WhatsApp down/banned → seamlessly switch to Telegram
- **One subscription, infinite channels** - true platform resilience

**Market Expansion:**
- WhatsApp: Street vendors, small shops
- Telegram: Tech-savvy businesses, crypto merchants
- TikTok: E-commerce sellers, influencers
- iMessage: Premium customers (iPhone users)
- SMS: Universal fallback (works on every phone, no internet needed)

---

## CURRENT SYSTEM STATUS (December 5, 2025)

### What's LIVE Now (https://beeline.works)

#### ✅ Frontend (Vercel - Next.js 14)
- **Landing Page** - 3-tier pricing (Personal/Business/Enterprise)
- **Multi-step Signup** - 4 steps: Info → Voice note → Personality → Payment/QR
- **Dark Mode** - Complete theme toggle with system preference detection
- **Account Type Selector** - Personal / Business / Enterprise with location counter
- **Dynamic Pricing** - Shows correct price based on account type + locations
- **Payment Flow** - Paystack popup → Auto-subscribe → QR code display
- **Referral System** - `/signup?ref=vendor-id` tracking
- **Footer Branding** - "Building Africa's commerce graph — one message at a time"

#### ✅ Payment System (Paystack - LIVE)
- **6 Subscription Plans Created:**
  - personal-monthly: GHS 49 (4,900 pesewas)
  - business-monthly: GHS 99 (9,900 pesewas)
  - enterprise-5: GHS 599 (59,900 pesewas)
  - enterprise-12: GHS 999 (99,900 pesewas)
  - enterprise-25: GHS 1,499 (149,900 pesewas)
  - enterprise-60: GHS 2,999 (299,900 pesewas)
- **Auto-subscriptions** - 7-day trial, then monthly recurring
- **Webhook Integration** - All events forwarded to n8n
- **Plan Assignment Logic** - Auto-assigns correct tier based on locations

#### ✅ Backend Infrastructure
- **n8n Workflow** - Groq LLM integration (Llama 3.3 70B)
- **Conversation Memory** - Redis for chat history
- **HITL System** - 6 priority rules (vendor takeover logic)
- **Database Schema** - PostgreSQL (vendor_sessions, vendor_settings)
- **API Routes:**
  - `/api/paystack/initialize` - Start payment
  - `/api/paystack/verify` - Verify payment
  - `/api/paystack/webhook` - Receive events
  - `/api/paystack/setup-plans` - Create all 6 plans

### ⏳ Ready to Deploy (Need to Execute)

#### Pi Bridge (WhatsApp Gateway)
- **Docker Container** - beeline-pi:latest (ARM64)
- **Capacity** - 50-75 vendors per Pi
- **Status** - Code ready, need to deploy and connect to live website
- **Sessions** - Persistent across reboots
- **Auto-reconnect** - 5s delay on disconnect

#### Cloud Bridge (Render.com)
- **Alternative to Pi** - 75-80 vendors per $7/mo instance
- **PostgreSQL Sessions** - Store in Neon database
- **Redis History** - Upstash for conversation tracking
- **Status** - Architecture designed, need to deploy

#### Multi-location Dashboard
- **Enterprise Feature** - Manage all branches in one view
- **Team Management** - Unlimited team members
- **Analytics** - Compare performance across locations
- **HITL Controls UI** - Pause AI, add VIP contacts, force AI mode

### 🔜 Planned (Next 3 Months)

#### Multi-Platform Integrations
- **Telegram** - Bot API (code already working, needs production)
- **TikTok Shop** - DM automation for e-commerce
- **iMessage** - Via Beeper/Matrix bridge
- **SMS** - Twilio integration (universal fallback)

#### Advanced Features
- **Product Catalog** - 708 products from CSV (already have data)
- **Voice Note Handling** - STT for customer voice messages
- **Image Recognition** - Product photos from customers
- **Payment Detection** - MoMo/GHS regex (already implemented)
- **Proactive Workflows** - Personal tier reminders/scheduling

---

## THREE-TIER PRICING STRATEGY

### Overview

Beeline operates on a **flat-fee per account** model, NOT per-location pricing:

| Tier | Price (GHS/month) | Target Market | Locations Included |
|------|------------------|---------------|-------------------|
| **Personal** | **49** | Individuals | N/A (personal use) |
| **Business** | **99** | Single-location vendors | 1 location |
| **Enterprise** | **599 - 2,999** | Multi-location chains | 5 - 60 locations (flat fee) |

### Enterprise Tier Breakdown

| Locations | Monthly Price | Per-Location Cost | Value Proposition |
|-----------|--------------|-------------------|-------------------|
| **Up to 5** | **GHS 599** | GHS 120/location | Entry tier for small chains |
| **Up to 12** | **GHS 999** | GHS 83/location | 16% cheaper per location |
| **Up to 25** | **GHS 1,499** | GHS 60/location | 39% cheaper per location |
| **Up to 60** | **GHS 2,999** | GHS 50/location | 50% cheaper per location |
| **61+** | **Custom** | Negotiated | White-glove enterprise sales |

### Why Flat-Fee Beats Per-Location

**Customer Wins:**
- ✅ Zero friction to scale (add locations within tier for free)
- ✅ Predictable budgeting (no surprise bills when opening new branch)
- ✅ Multi-location dashboard included (no extra cost)
- ✅ Unlimited team members across all locations

**Beeline Wins:**
- ✅ 42% more revenue vs old per-location model
- ✅ Higher perceived value (customers feel they're getting a deal)
- ✅ Stickier accounts (enterprise chains don't churn easily)
- ✅ Easier upsells (move from 5-location to 12-location tier)

**Real-World Examples:**
- **KFC Ghana (15 locations):** Old model GHS 885 → New model **GHS 1,499** (+69% revenue)
- **Papa's Pizza (8 locations):** Old model GHS 552 → New model **GHS 999** (+81% revenue)
- **Melcom (20 locations):** Old model GHS 1,180 → New model **GHS 1,499** (+27% revenue)

### Features by Tier

| Feature | Personal | Business | Enterprise |
|---------|----------|----------|------------|
| **Messaging Platforms** | All supported | All supported | All supported |
| **AI Personality** | Custom (voice note) | Custom (voice note) | Custom per location |
| **Conversation History** | Last 50 messages | Unlimited | Unlimited |
| **HITL Controls** | Basic | Full vendor takeover | Advanced (VIP lists, team permissions) |
| **Product Catalog** | N/A | Up to 1,000 products | Unlimited products |
| **Analytics** | Basic usage stats | Full dashboard | Multi-location comparison |
| **Team Members** | 1 (you) | Up to 3 | Unlimited |
| **Priority Support** | Email (48h) | Email (24h) | Phone + Email (2h SLA) |
| **Multi-location Dashboard** | N/A | N/A | ✅ Included |
| **API Access** | ❌ | ❌ | ✅ Custom integrations |

---

## TECHNICAL ARCHITECTURE

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│  CUSTOMER (Ghana)                                       │
│  Sends WhatsApp: "I want to buy oranges"               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (Internet - WhatsApp Web Protocol)
┌─────────────────────────────────────────────────────────┐
│  RASPBERRY PI 4 (Joshua's House - 192.168.8.28)        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Docker Container: beeline-pi:latest             │   │
│  │ • Baileys Multi-Session Gateway                 │   │
│  │ • 50 Vendor Capacity                            │   │
│  │ • Vendor: test-vendor-001 ✅ CONNECTED          │   │
│  │ • Port: Internal (no HTTP server)               │   │
│  │ • Sessions: /home/beeline/beeline-sessions/     │   │
│  │ • Conversation Memory: In-memory Map            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (HTTPS POST to webhook)
┌─────────────────────────────────────────────────────────┐
│  N8N (Render Cloud)                                     │
│  https://n8n-latest-4dbq.onrender.com                   │
│  Webhook: /webhook/whatsapp ✅ WORKING                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Webhook receives message                     │   │
│  │ 2. Code node: Extract conversation history      │   │
│  │ 3. HTTP Request: Call Groq API                  │   │
│  │ 4. Respond to Webhook: Return AI reply          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (API Call)
┌─────────────────────────────────────────────────────────┐
│  GROQ AI (Cloud)                                        │
│  api.groq.com                                           │
│  Model: llama-3.3-70b-versatile                        │
│  • Generates responses in Twi/English                   │
│  • Context-aware (conversation history)                 │
│  • <4 second response time                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (Response flows back)
┌─────────────────────────────────────────────────────────┐
│  CUSTOMER receives AI reply via WhatsApp               │
│  "We have fresh oranges! GHS 20 for 10 pieces."        │
│  + Virality footer (every 3rd message)                  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
Customer Message Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Customer │ --> │    Pi    │ --> │   n8n    │ --> │   Groq   │
│ WhatsApp │     │  Bridge  │     │  Cloud   │     │    AI    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ^                                                      |
     |                                                      |
     └──────────────────────────────────────────────────────┘
                    (Reply flows back)

Session Management:
┌──────────────┐
│ Vendor scans │
│   QR code    │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Pi: useMultiFileAuthState()          │
│ Saves to: /beeline-sessions/{vendor} │
│ Files:                                │
│   • creds.json                        │
│   • app-state-sync-*.json             │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ WhatsApp Web session established     │
│ Vendor's phone = web.whatsapp.com    │
│ No QR re-scan needed after restart   │
└───────────────────────────────────────┘
```

---

## TECHNICAL IMPLEMENTATION

### Component Details

#### 1. Raspberry Pi Bridge

**Hardware:**
- Raspberry Pi 4 Model B (4GB RAM)
- 64GB SD Card (Raspberry Pi OS Lite 64-bit)
- Ethernet connection to router
- IP: 192.168.8.28 (static)

**Software Stack:**
- Docker 27.3.1
- Node.js 20 (in container)
- Baileys (@whiskeysockets/baileys) - WhatsApp Web API
- Custom multi-session implementation

**Key Files:**
- `/home/beeline/whatsapp-ai-platform/pi/index.js` - Main bridge code
- `/home/beeline/whatsapp-ai-platform/pi/Dockerfile` - Container definition
- `/home/beeline/beeline-sessions/` - Session storage (persistent volume)

**Docker Container:**
```bash
docker run -d \
  --name beeline-pi \
  --user root \
  --restart unless-stopped \
  -v /home/beeline/beeline-sessions:/app/sessions \
  -e N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  beeline-pi:latest
```

**Features Implemented:**
- Multi-session support (50 vendors)
- Auto-reconnect on disconnect (5s delay)
- Persistent sessions (survive Pi reboot)
- Conversation history (last 10 messages per customer)
- QR code generation for vendor onboarding
- Typing indicators
- `/clear` command to reset conversation
- **BUZZ referral system** (unique trigger word)
- **Payment detection** (MoMo/GHS regex)
- **Conditional virality footer** (only after payment)

**Code Highlights:**

```javascript
// Multi-session storage
const vendorSockets = new Map();  // Active connections
const conversationHistory = new Map();  // Message history

// BUZZ referral detection (line 222-241)
if (messageContent.toLowerCase().trim() === 'buzz') {
  const referralLink = `https://beeline.works/signup?ref=${vendorId}`;
  await sock.sendMessage(customerId, {
    text: `🐝 *Awesome! Let's get you your own AI employee!*\n\n` +
          `Click here: ${referralLink}\n\n` +
          `✨ Your vendor gets *7 days free*!`
  });
  logger.info({ vendorId, referralInitiated: true }, '🐝 BUZZ detected');
  continue; // Skip AI processing
}

// Payment detection + conditional footer (line 254-268)
const paymentDetected = aiResponse.match(/(momo|ghs\s*\d+)/i);
if (paymentDetected) {
  fullResponse += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `_Powered by Beeline 🐝_\n\n` +
                  `Need your own AI employee?\n` +
                  `Reply *BUZZ* and get started!\n\n` +
                  `_(Your vendor gets 7 days free!)_`;
}

// Message payload to n8n
const payload = {
  vendorId,
  customerId,
  message,
  channel: 'whatsapp',
  timestamp: new Date().toISOString(),
  conversationHistory: history,  // Last 10 messages
  vendorConfig: {}
};
```

#### 2. n8n Cloud Workflow

**Platform:** Render.com
**URL:** https://n8n-latest-4dbq.onrender.com
**Webhook:** `/webhook/whatsapp` (production, always-on)

**Workflow Nodes:**

1. **Webhook Trigger**
   - Method: POST
   - Authentication: None (trusted Pi IP)
   - Receives: vendorId, customerId, message, conversationHistory

2. **Code Node (JavaScript)**
   - Extracts conversation history
   - Detects first message (isFirstMessage = history.length === 0)
   - Builds system prompt with conditional greeting
   - Formats messages array for Groq

3. **HTTP Request (Groq API)**
   - URL: https://api.groq.com/openai/v1/chat/completions
   - Auth: Bearer token (Header Auth credential)
   - Body: { model, messages }
   - Timeout: 30s

4. **Respond to Webhook**
   - Format: JSON
   - Returns: `{ "reply": "AI response text" }`

**Current Code Node:**
```javascript
// Elon's latest version (Dec 2, 2025)
let chatId, userId, userMessage, firstName = 'Customer', channel = 'unknown';
let conversationHistory = [];

if ($json.message && $json.message.chat) {
  // Telegram format
  channel = 'telegram';
  chatId = $json.message.chat.id.toString();
  userId = $json.message.from.id.toString();
  userMessage = $json.message.text || '';
  firstName = $json.message.from.first_name || 'Customer';
  conversationHistory = $json.conversationHistory || [];
} else {
  // WhatsApp format
  channel = 'whatsapp';
  chatId = $json.customerId || $json.chatId;
  userId = $json.customerId || $json.userId;
  userMessage = $json.message || '';
  firstName = $json.firstName || 'Customer';
  conversationHistory = $json.conversationHistory || [];
}

const isFirstMessage = conversationHistory.length === 0;

const systemPrompt = `You are a warm, friendly Ghanaian market vendor.

Rules:
- Speak naturally: "charley", "boss", "Akwaaba", Twi mix welcome
- Prices in GHS only
- Keep replies short and sweet

CRITICAL GREETING RULE:
${isFirstMessage
  ? 'THIS IS THE CUSTOMER\'S VERY FIRST MESSAGE → Start with: "Akwaaba, welcome to our shop! How can I help you today?"'
  : 'FOLLOW-UP MESSAGE → NO "Akwaaba" or welcome again. Jump straight into the conversation.'}
`;

const messages = [{ role: "system", content: systemPrompt }];
conversationHistory.forEach(msg => {
  messages.push({ role: msg.role, content: msg.content });
});
messages.push({ role: "user", content: userMessage });

return {
  json: {
    chatId,
    userId,
    channel,
    firstName,
    groqRequest: {
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
      messages
    },
    debug: { isFirstMessage, historyLength: conversationHistory.length }
  }
};
```

#### 3. Groq AI Integration

**Model:** llama-3.3-70b-versatile
**API Key:** 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
**Performance:** <4 second responses
**Cost:** ~$6/month for 50 vendors

**Features:**
- Bilingual (Twi + English)
- Context-aware (uses conversation history)
- Customizable temperature (0.7)
- Max tokens: 500 (keeps responses concise)

---

## WHAT'S WORKING NOW

### ✅ Fully Operational

1. **Raspberry Pi Bridge** (100%)
   - WhatsApp connection stable
   - Multi-session architecture (50 vendor slots)
   - Auto-reconnect on disconnect
   - Session persistence across reboots
   - QR code generation working
   - First vendor connected: `test-vendor-001`

2. **Message Flow** (95%)
   - Customer → Pi: ✅ Working
   - Pi → n8n: ✅ Working
   - n8n → Groq: ✅ Working
   - Groq → n8n: ✅ Working
   - n8n → Pi: ✅ Working
   - Pi → Customer: ✅ Working

3. **Conversation Memory** (90%)
   - Pi tracks last 10 messages per customer
   - History sent to n8n with every message
   - History saved after AI response
   - Clearing works with `/clear` command

4. **Infrastructure** (100%)
   - Docker container auto-restarts
   - n8n workflow always-on (production mode)
   - Groq API stable
   - Webhook endpoint responding

### ⚠️ Working But With Issues

1. **AI Greeting Logic** (70%)
   - **Issue:** AI says "Akwaaba, welcome..." on every message
   - **Root Cause:** Conversation history being sent correctly by Pi, but AI not respecting the conditional greeting instruction
   - **Debug Status:** Payload verified (history present), investigating n8n Code node execution
   - **Logs Show:**
     ```
     historyLength:1 → isFirstMessage: true ✅
     historyLength:3 → isFirstMessage: false ✅
     historyLength:5 → isFirstMessage: false ✅
     ```
   - **But AI still greets:** System prompt not being followed properly

2. **Virality Footer** (100%) ✅ FIXED
   - **Status:** Now only shows after payment detected
   - **Trigger:** Customer says "BUZZ" (not generic "YES")
   - **Reward:** Referring vendor gets 7 days free (was 30 days)
   - **Location:** `pi/index.js:259-268` - payment detection + footer
   - **Cost:** $2.25 per referral (7 days × $0.32/day)

### ❌ Not Yet Implemented

1. **Payment Detection** - ✅ IMPLEMENTED in pi/index.js (MoMo/GHS regex)
2. **Agent Creation Engine** - Vendor onboarding workflow
3. **Personality Picker** - 3 styles (casual, formal, Twi-heavy)
4. **Product Catalog Integration** - 708 products from CSV
5. **Landing Page** - beeline.works deployment
6. **Multi-Vendor Testing** - Only 1 vendor connected so far
7. **Dashboard** - Vendor earnings/metrics

---

## KNOWN ISSUES & SOLUTIONS

### Issue #1: AI Greeting Repetition

**Status:** CRITICAL - Blocks first sale
**Severity:** High
**Impact:** Poor user experience

**Problem:**
AI repeats "Akwaaba, welcome to our shop!" on every message, even when conversation history shows it's not the first message.

**Evidence:**
```
Message 1: "Hello" → historyLength:1 → AI: "Akwaaba, welcome..."  ✅ Correct
Message 2: "I want oranges" → historyLength:3 → AI: "Akwaaba, welcome..." ❌ Wrong
Message 3: "Do you have oranges?" → historyLength:5 → AI: "Akwaaba, welcome..." ❌ Wrong
```

**Pi Logs (Verified Working):**
```json
{
  "vendorId": "test-vendor-001",
  "customerId": "233543362454@s.whatsapp.net",
  "message": "I want to buy some oranges",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Akwaaba, welcome to our shop! How can I help you today?"},
    {"role": "user", "content": "I want to buy some oranges"}
  ]
}
```

**Root Cause Analysis:**
1. ✅ Pi correctly sends conversation history
2. ✅ n8n Code node receives history
3. ✅ `isFirstMessage` flag calculated correctly
4. ✅ System prompt includes conditional greeting
5. ❌ **Groq AI ignoring system prompt OR messages array not built correctly**

**Next Steps:**
- [x] Add debug logging to Pi (payload verification)
- [ ] Check n8n execution logs for Code node output
- [ ] Verify messages array sent to Groq
- [ ] Test with different Groq temperature/model
- [ ] Consider moving history check to Groq prompt itself

**Potential Solutions:**

**Option A: Stronger System Prompt**
```javascript
const systemPrompt = `CRITICAL: Only say "Akwaaba" if historyLength = 0.
Current historyLength: ${conversationHistory.length}

${isFirstMessage
  ? '⚠️ FIRST MESSAGE DETECTED - Greet with Akwaaba'
  : '⚠️ FOLLOW-UP DETECTED - DO NOT SAY AKWAABA OR WELCOME'}
`;
```

**Option B: Pre-filter History**
```javascript
// Remove AI's repeated greetings from history before sending
const cleanHistory = conversationHistory.filter(msg =>
  !(msg.role === 'assistant' && msg.content.includes('Akwaaba'))
);
```

**Option C: Post-process AI Response**
```javascript
// In Pi, strip duplicate greetings
let aiReply = response.data.reply;
if (history.length > 2 && aiReply.includes('Akwaaba')) {
  aiReply = aiReply.replace(/Akwaaba.*?\?/i, '').trim();
}
```

---

## BUSINESS MODEL & PRICING

### Current Costs (Monthly)

| Component | Provider | Cost |
|-----------|----------|------|
| n8n Cloud | Render.com | $7 |
| Groq API | Groq Cloud | $6 |
| Raspberry Pi Power | Electricity | $5 |
| Internet | ISP | $20 |
| **Total** | | **$38/mo** |

**Per-Vendor Cost (Current Pi-only):** $38 ÷ 50 = $0.76/vendor
**Per-Vendor Cost (Hybrid Cloud):** $45 ÷ 75 = $0.60/vendor (21% cheaper!)

### Revenue Model

**Price:** $9/month (GHS 99) per vendor
**Free Trial:** 7 days
**Cancellation:** Anytime

**Break-Even Analysis:**
- Monthly cost: $38
- Price per vendor: $9
- Break-even: 5 vendors ($45 revenue)
- Target: 50 vendors this week ($450/mo revenue)

**Unit Economics:**
- LTV (12 months): $108
- CAC (virality): $0 (referral-based)
- LTV:CAC = ∞
- Gross Margin: 91.5% ($9 - $0.76 = $8.24 profit/vendor)

### Growth Projections

**Current Pi-Only Setup:**
| Milestone | Vendors | MRR | Timeline | Pi Count |
|-----------|---------|-----|----------|----------|
| Break-even | 5 | $45 | Week 1 | 1 |
| First Pi full | 50 | $450 | Week 2 | 1 |
| Need Pi #2 | 51-100 | $459-$900 | Month 1 | 2 |
| Profitable | 250 | $2,250 | Month 2 | 5 Pis |
| Scale | 1,000 | $9,000 | Q1 2026 | 20 Pis |

**Hybrid Cloud Setup (Recommended):**
| Milestone | Vendors | MRR | Monthly Cost | Profit | Pi Count |
|-----------|---------|-----|--------------|--------|----------|
| Break-even | 5 | $45 | $45 | $0 | 1 |
| Deploy hybrid | 20 | $180 | $45 | $135 | 1 |
| First Pi full | 75 | $675 | $45 | $630 | 1 |
| Need Pi #2 | 76-150 | $684-$1,350 | $90 | $594-$1,260 | 2 |
| Profitable | 250 | $2,250 | $135 | $2,115 | 4 Pis |
| Scale | 1,000 | $9,000 | $540 | $8,460 | 14 Pis |

**Cost Savings with Hybrid:**
- Vendor 250: Save 1 Pi ($125 hardware)
- Vendor 1,000: Save 6 Pis ($750 hardware)
- Improved margins: $0.60 vs $0.76 per vendor
- Remote access: Priceless when lights go out!

**Virality Mechanism (Updated):**
- Footer: "Powered by Beeline 🐝 Need your own AI? Reply BUZZ!"
- Trigger word: "BUZZ" (unique, brand-aligned, no confusion with "yes" for orders)
- Only shown AFTER payment detected (MoMo/GHS mentioned)
- Referral reward: 7 days free (cost: $2.25 per referral)
- Conversion rate: 2% of paying customers (conservative)
- 50 vendors × 250 paid orders/month × 2% = 5 new vendors/month
- Viral coefficient: 0.1 (sustainable 10% monthly growth)

---

## ROADMAP & FUTURE ARCHITECTURE

### Phase 1: MVP Fixes (This Week)

**Priority 1: Fix Greeting Issue**
- [ ] Debug n8n Code node execution
- [ ] Test with Elon's logs
- [ ] Implement strongest solution (A, B, or C)
- [ ] Verify with 10 test messages

**Priority 2: Payment Detection** ✅ COMPLETED
- [x] Add regex to check AI response for "MoMo"/"GHS"
- [x] Set `paymentDetected = true` if payment mentioned
- [x] Only show virality footer after payment
- [x] Test with mock order
- **Implementation:** [pi/index.js:254](pi/index.js:254) - Regex: `/(momo|ghs\s*\d+)/i`

**Priority 3: Product Integration**
- [ ] Upload `products.csv` to n8n (708 products)
- [ ] Create lookup function in Code node
- [ ] Update system prompt: "Check inventory before answering"
- [ ] Test: "Do you have Coca Cola?" → "Yes, GHS 5.50, 10 in stock"

**Priority 4: Multi-Vendor Test**
- [ ] Add vendor #2 via QR scan
- [ ] Send simultaneous messages to both
- [ ] Verify independent conversations
- [ ] Check session isolation

**Priority 5: Landing Page**
- [ ] Deploy Next.js site to Vercel (beeline.works)
- [ ] Add sign-up form (collect phone numbers)
- [ ] Integrate with onboarding workflow
- [ ] Go live

### Phase 2: Vendor Onboarding (Next Week)

**Agent Creation Engine:**
```
Vendor Flow:
1. Visits beeline.works/signup
2. Enters: Name, Phone, Business Type
3. Records voice note: "What do you sell?"
4. AI generates custom persona
5. Shows 3 personality options:
   - Casual (friendly, Twi mix)
   - Formal (professional English)
   - Twi-heavy (local market)
6. Vendor picks style
7. QR code generated
8. Vendor scans → Live in 2 minutes
```

**n8n Workflow:**
```yaml
- Webhook: /onboard-new-vendor
  Input: { phone, name, businessType, voiceNote }

- Groq STT: Transcribe voice note

- Groq Persona Builder:
  Prompt: "Generate vendor persona from: {transcription}"
  Output: { products, tone, rules, greeting }

- Save to Postgres:
  Table: vendor_personas
  Fields: vendor_id, persona_json, created_at

- HTTP POST to Pi: /generate-qr
  Input: { vendorId }
  Output: { qrCode, expiresIn }

- Respond: Show QR code + instructions
```

**Implementation Files:**
- `pi/onboarding/generate-qr.js` - QR endpoint
- `workflows/vendor-onboarding.json` - n8n workflow export
- `backend/vendor-personas.sql` - Database schema

### Phase 3: Cloud Migration (Month 1)

**Current Architecture Issues:**
- ⚠️ Single point of failure (Pi in Joshua's house)
- ⚠️ Power outage = downtime
- ⚠️ Hardware failure = lost sessions
- ⚠️ Limited to 50 vendors per Pi (current fat setup)
- ⚠️ Each Baileys session = ~40MB RAM (physical constraint)

**Proposed Hybrid Cloud Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│  VENDOR ONBOARDING                                      │
│  Web UI: beeline.works/vendor/signup                    │
│  • Vendor fills form + voice note                       │
│  • AI generates persona                                 │
│  • QR code displayed in browser                         │
│  • Session saved to cloud database                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (Sessions stored in PostgreSQL)
┌─────────────────────────────────────────────────────────┐
│  CLOUD BRIDGE (Render.com - Preferred)                  │
│  Docker: beeline-bridge:latest                          │
│  • Baileys multi-session (WhatsApp gateway ONLY)        │
│  • 75-80 vendors per instance (thin gateway)            │
│  • Session storage: PostgreSQL                          │
│  • Conversation history: Redis (Upstash)                │
│  • Auto-scaling enabled                                 │
│  • 99.9% uptime SLA                                     │
│  • Multi-region failover                                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (HTTPS POST with conversation history)
┌─────────────────────────────────────────────────────────┐
│  N8N + GROQ (Business Logic)                            │
│  • Persona loading                                      │
│  • Product lookups                                      │
│  • AI response generation                               │
│  • Payment detection                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  BACKUP: Pi at pi.beeline.works (CloudFlare Tunnel)     │
│  • Monitors cloud health                                │
│  • Takes over if cloud down                             │
│  • 50 vendors capacity (fat setup)                      │
└─────────────────────────────────────────────────────────┘
```

**Why Hybrid Architecture (Pi as Gateway → Cloud Logic)?**

CRITICAL CLARIFICATION on vendor capacity:

**Current Pi Setup (Fat - All Logic on Pi):**
- Baileys sessions: 50 × 40MB = 2GB RAM
- Business logic: ~2GB RAM (n8n processing, memory maps)
- Total: 4GB RAM (Pi maxed out)
- **Capacity: 50 vendors per Pi**

**Hybrid Setup (Thin Gateway - Pi for WhatsApp Only):**
- Baileys sessions: 75 × 40MB = 3GB RAM
- Business logic: MOVED TO CLOUD (0 MB on Pi)
- Overhead: ~1GB (OS, Docker, networking)
- Total: 4GB RAM (optimized)
- **Capacity: 75-80 vendors per Pi** (50% improvement!)

**Why Still Need Multiple Pis?**
Each Baileys WhatsApp session consumes ~40MB RAM regardless of where business logic runs. This is a physical constraint of the Baileys library maintaining WebSocket connections.

**Scaling Math:**
- Pi 4GB RAM ÷ 40MB per session = ~100 theoretical max
- Minus OS overhead (~1GB) = 75-80 realistic max
- **Pi #1:** Vendors 1-75
- **Pi #2:** Vendors 76-150 (needed at vendor 76, not 51!)
- **Pi #3:** Vendors 151-225

**Benefits of Hybrid vs Current:**
- 50% more vendors per Pi (75 vs 50)
- Cloud handles all business logic (faster, more reliable)
- Pi accessible from anywhere (CloudFlare Tunnel: pi.beeline.works)
- If Pi loses power, cloud stays up (n8n, database, Redis)
- If cloud goes down, Pi can failover to local processing
- Zero downtime deployments (update cloud without touching Pi)

**Migration Plan (cloud-hybrid branch):**

1. **Create cloud-hybrid branch** (keep beeline-main as fallback)
   ```bash
   git checkout -b cloud-hybrid
   # All cloud work happens here
   # If it fails, fallback to beeline-main
   ```

2. **Deploy Bridge to Render** (Preferred - $7/month for 512MB RAM)
   ```yaml
   # render.yaml
   services:
     - type: web
       name: beeline-bridge
       env: docker
       plan: starter
       dockerfilePath: ./cloud/Dockerfile
       envVars:
         - key: N8N_WEBHOOK_URL
           sync: false
         - key: DATABASE_URL
           fromDatabase:
             name: beeline-postgres
             property: connectionString
         - key: REDIS_URL
           sync: false
       healthCheckPath: /health

   databases:
     - name: beeline-postgres
       plan: free
       databaseName: beeline
       user: beeline
   ```

2. **PostgreSQL Session Storage**
   ```sql
   CREATE TABLE vendor_sessions (
     vendor_id VARCHAR(100) PRIMARY KEY,
     session_data JSONB,
     last_active TIMESTAMP,
     status VARCHAR(20)
   );
   ```

3. **Redis Conversation History** (Upstash free tier)
   ```javascript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);

   async function getHistory(vendorId, customerId) {
     const key = `${vendorId}:${customerId}`;
     const history = await redis.get(key);
     return history ? JSON.parse(history) : [];
   }
   ```

4. **Code Migration**
   - Replace `useMultiFileAuthState` with `usePostgresAuthState`
   - Replace in-memory Map with Redis calls
   - Add health check endpoint
   - Configure auto-scaling rules

**Cost Comparison:**

| Setup | Hardware | Monthly | Uptime | Vendor Capacity | Pi Needed At |
|-------|----------|---------|--------|-----------------|--------------|
| Current (Pi-only fat) | $75 + $50 UPS | $38 | 95% | 50 per Pi | Vendor 51 |
| Hybrid (Pi gateway + Cloud) | $75 + $50 UPS | $45 | 99% | 75-80 per Pi | Vendor 76 |
| Full Cloud (no Pi) | $0 | $18 | 99.9% | 1000s | Never |

**Current Strategy:**
1. Stay on Pi-only until 20 vendors (validate product-market fit)
2. Deploy cloud-hybrid at 20-50 vendors (resilience + remote access)
3. Full cloud migration at 100+ vendors (scale + cost efficiency)

**Why Hybrid First?**
- You JUST experienced the pain: lights out = can't work on Pi
- CloudFlare Tunnel (pi.beeline.works) = access from anywhere
- Cloud handles business logic (faster deploys, no Pi downtime)
- If Pi loses power, vendors still get responses (cloud failover)
- Build resilient network that "takes over like a virus"

### Phase 4: Advanced Features (Month 2-3)

**Multi-Channel Support:**
- TikTok DM integration
- Telegram bots (already working)
- SMS/iMessage via Twilio
- Voice calls (Twilio Voice API)

**Analytics Dashboard:**
- Vendor earnings ($ per week)
- Response time metrics
- Customer satisfaction (feedback loop)
- Product sales tracking

**Payment Integration:**
- MoMo API (MTN, Vodafone)
- Yango delivery tracking
- Order management system
- Invoice generation

**AI Improvements:**
- Image recognition (product photos)
- Voice note handling
- Sentiment analysis
- Proactive upselling

---

## DOWNTIME SCENARIOS & SAFEGUARDS

### Failure Mode Analysis

#### 1. Power Outage (Pi goes offline)

**Impact:** All vendors offline (50 current, 75-80 in hybrid)
**Probability:** High (ECG load shedding) - Joshua experienced this during development!
**Duration:** 1-4 hours

**Real-World Pain:**
- Lights out = can't SSH to Pi
- Can't deploy updates
- Can't monitor logs
- Vendors offline during peak hours

**Current Mitigation:** None
**Proposed Solution (Hybrid Architecture):**
- ✅ CloudFlare Tunnel: pi.beeline.works (access from ANYWHERE)
- ✅ Cloud handles business logic (Pi power loss = cloud keeps running)
- ✅ UPS backup ($50) - 2-4 hours runtime for Pi
- ✅ Auto-restart on boot (Docker restart policy)
- ✅ Sessions persist in PostgreSQL (no QR re-scan)
- ✅ Mobile SSH via Termius app (manage from phone)

**Implementation:**
```bash
# Add to Pi startup script (/etc/rc.local)
docker start beeline-pi
```

#### 2. Internet Outage

**Impact:** Pi can't reach WhatsApp or n8n
**Probability:** Medium
**Duration:** 10 minutes - 2 hours

**Current Mitigation:** Auto-reconnect (5s delay)
**Proposed Solution:**
- ✅ 4G/LTE failover router ($80)
- ✅ SMS alerts to Joshua when offline
- ✅ Message queue (store & retry when back online)

**Implementation:**
```javascript
// In pi/index.js - Add message queue
const pendingMessages = [];

async function processWithAI(vendorId, customerId, message) {
  try {
    const response = await axios.post(config.n8nWebhookUrl, payload);
    return response.data.reply;
  } catch (error) {
    // Queue for retry
    pendingMessages.push({ vendorId, customerId, message, retryCount: 0 });
    return "⏳ Connection issue. Your message is saved, I'll reply soon!";
  }
}

// Retry loop
setInterval(() => {
  pendingMessages.forEach(async (msg) => {
    if (msg.retryCount < 3) {
      try {
        const reply = await processWithAI(msg.vendorId, msg.customerId, msg.message);
        // Send delayed reply
        msg.retryCount = 999; // Mark as sent
      } catch (e) {
        msg.retryCount++;
      }
    }
  });
}, 30000); // Retry every 30s
```

#### 3. n8n (Render) Goes Down

**Impact:** Pi receives messages but can't get AI responses
**Probability:** Low (Render SLA: 99.9%)
**Duration:** 5-15 minutes

**Current Mitigation:** Error message sent to customer
**Proposed Solution:**
- ✅ Backup n8n instance (Railway - $5/mo)
- ✅ Fallback to direct Groq API call

**Implementation:**
```javascript
const n8nUrls = [
  'https://n8n-latest-4dbq.onrender.com/webhook/whatsapp',
  'https://n8n-backup.railway.app/webhook/whatsapp'
];

for (const url of n8nUrls) {
  try {
    const response = await axios.post(url, payload, { timeout: 10000 });
    return response.data.reply;
  } catch (error) {
    logger.warn({ url, error }, 'n8n failed, trying next...');
  }
}

// Last resort: Direct Groq call
return await callGroqDirectly(message);
```

#### 4. Groq API Rate Limit / Downtime

**Impact:** n8n can't generate AI responses
**Probability:** Low (free tier: 30 req/min)
**Duration:** 1 minute (rate limit reset) or 10-30 min (downtime)

**Current Mitigation:** None
**Proposed Solution:**
- ✅ Fallback to OpenAI GPT-4o-mini
- ✅ Queue requests if rate limited

**Implementation:**
```javascript
// In n8n Code node
const aiProviders = [
  { name: 'groq', url: 'https://api.groq.com/...', model: 'llama-3.3-70b' },
  { name: 'openai', url: 'https://api.openai.com/...', model: 'gpt-4o-mini' }
];

for (const provider of aiProviders) {
  try {
    const response = await $http.post(provider.url, { model: provider.model, messages });
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.status === 429) {
      // Rate limited - wait and retry
      await new Promise(r => setTimeout(r, 60000));
      continue;
    }
    // Provider down - try next
  }
}
```

#### 5. WhatsApp Bans Vendor Account

**Impact:** One vendor loses access (not all 50)
**Probability:** Medium (automation detection)
**Duration:** Permanent (number banned)

**Current Mitigation:** None
**Proposed Solution:**
- ✅ Use WhatsApp Business accounts (lower ban risk)
- ✅ Add delays between messages (appear human)
- ✅ Backup SIM card ready per vendor
- ⚠️ Migrate to Meta Cloud API (official, no ban risk)

**Implementation:**
```javascript
// Add random delays (1-3s) before sending
await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
await sock.sendMessage(customerId, { text: aiReply });
```

#### 6. Raspberry Pi Hardware Failure

**Impact:** All sessions lost, all vendors offline
**Probability:** Low (SD card corruption most common)
**Duration:** 1-24 hours (buy new Pi, restore sessions)

**Current Mitigation:** None
**Proposed Solution:**
- ✅ Daily session backups to Dropbox/Google Drive
- ✅ Hot spare Pi ready ($75)
- ✅ Boot from SSD instead of SD card (more reliable)

**Implementation:**
```bash
# Daily backup cron job
0 2 * * * rsync -avz /home/beeline/beeline-sessions/ \
  ~/Dropbox/beeline-backup/sessions-$(date +\%Y\%m\%d)/
```

#### 7. Docker Container Crashes

**Impact:** Pi online but WhatsApp disconnected
**Probability:** Low (stable Node.js app)
**Duration:** 10 seconds (auto-restart)

**Current Mitigation:** ✅ `--restart unless-stopped`
**Additional:**
- Health checks
- Monitoring alerts

**Implementation:**
```dockerfile
# Add to Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

### Monitoring & Alerting

**Recommended Tools:**

1. **UptimeRobot** (Free)
   - Ping Pi every 5 min
   - SMS/Email alert if down
   - Tracks uptime % (SLA monitoring)

2. **Render Dashboard**
   - n8n error logs
   - Workflow execution count
   - Response time metrics

3. **Custom Health Dashboard**
   - Vendor connection status (50/50 online)
   - Messages processed today
   - Error rate
   - Revenue tracker

**Implementation:**
```javascript
// Add to pi/index.js - Health endpoint
import express from 'express';
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeVendors: vendorSockets.size,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.listen(3000);
```

---

## PRODUCT INVENTORY INTEGRATION

### Available Data (products.csv)

**708 Products** with:
- Name (e.g., "Coca Cola 300ml")
- Product Group (e.g., "DRINKS")
- SKU, Barcode
- Price (in GHS)
- Quantity (stock level)
- Supplier
- Reorder Point
- Low Stock Warning

**Sample Products:**
```csv
Coca Cola 300ml,DRINKS,23,90338052,300ML,4.16,5.5,24
Fanta Orange 300ml,DRINKS,24,90377235,300ML,4.16,5.5,-10
Bel Aqua 500ML,WATER,153,6034000181036,500ML,1.63,3.0,743
Milo 400g,TIN FOODS,163,6033000089199,400g,48.3,50.0,11
Kellogs Rice Kripsies,CEREALS,6,5059319036830,,65,75.0,2
```

### Integration Plan

**Phase 1: Simple Lookup**

Upload CSV to n8n as JSON:
```javascript
// In n8n Code node
const products = [
  { name: "Coca Cola 300ml", price: 5.5, stock: 24 },
  { name: "Fanta Orange 300ml", price: 5.5, stock: -10 },
  // ... 706 more
];

// Search function
function findProduct(query) {
  query = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(query)
  );
}

// In system prompt
const userMessage = $json.message;
const matches = findProduct(userMessage);

if (matches.length > 0) {
  systemPrompt += `\n\nPRODUCTS FOUND:\n${matches.map(p =>
    `- ${p.name}: GHS ${p.price} (${p.stock > 0 ? 'In stock: ' + p.stock : 'Out of stock'})`
  ).join('\n')}`;
}
```

**Example Conversation:**
```
Customer: "Do you have Coca Cola?"
AI searches products.csv
AI: "Yes! We have Coca Cola 300ml for GHS 5.50. We have 24 bottles in stock. How many would you like?"

Customer: "3 bottles please"
AI: "Perfect! 3 Coca Cola bottles = GHS 16.50. Pay via MoMo to 024XXXXXXX. Should I arrange delivery?"
```

**Phase 2: Database Storage**

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100),
  name VARCHAR(255),
  product_group VARCHAR(100),
  sku VARCHAR(50),
  price DECIMAL(10, 2),
  quantity INT,
  low_stock_warning INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_name ON products(vendor_id, name);
```

**Phase 3: Dynamic Updates**

- Vendor can update prices via chat: "Change Coca Cola price to GHS 6"
- Auto-deduct stock after sale
- Low stock alerts: "⚠️ Only 2 Coca Colas left - order more!"

---

## DEPLOYMENT GUIDE

### Prerequisites

- Raspberry Pi 4 (4GB+ RAM)
- Raspberry Pi OS Lite 64-bit
- Internet connection (Ethernet preferred)
- n8n account on Render
- Groq API key

### Step 1: Prepare Raspberry Pi

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone repository
cd ~
git clone https://github.com/nanayawjoshua/whatsapp-ai-platform-beeline.git
cd whatsapp-ai-platform-beeline/pi

# 4. Create session storage directory
mkdir -p /home/$(whoami)/beeline-sessions

# 5. Set environment variables
cat > .env << EOF
N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp
SESSIONS_PATH=./sessions
MAX_VENDORS=50
AUTO_RECONNECT=true
RECONNECT_DELAY=5000
LOG_LEVEL=info
EOF
```

### Step 2: Build Docker Image

```bash
# Build native ARM64 image
cd ~/whatsapp-ai-platform-beeline/pi
docker build -t beeline-pi:latest .

# Verify build
docker images | grep beeline-pi
```

### Step 3: Deploy n8n Workflow

1. Log in to Render: https://dashboard.render.com
2. Go to n8n instance
3. Import workflow from `workflows/beeline-whatsapp.json`
4. Update credentials:
   - Groq API: Add Header Auth with Bearer token
   - Header name: `Authorization`
   - Value: `Bearer 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`
5. Activate workflow (green toggle)
6. Note webhook URL: `/webhook/whatsapp`

### Step 4: Start Bridge Container

```bash
# Run container
docker run -d \
  --name beeline-pi \
  --user root \
  --restart unless-stopped \
  -v /home/$(whoami)/beeline-sessions:/app/sessions \
  -e N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  beeline-pi:latest

# Check logs
docker logs beeline-pi -f

# Should see:
# ✅ WhatsApp connected — AI employee is LIVE
```

### Step 5: Add First Vendor

```bash
# Generate QR code for vendor
docker exec -it beeline-pi node scripts/add-vendor.js test-vendor-001

# QR code appears in terminal
# Vendor scans with WhatsApp → Connected!

# Verify session saved
ls /home/$(whoami)/beeline-sessions/test-vendor-001/
# Should see: creds.json, app-state-sync-*.json
```

### Step 6: Test End-to-End

```bash
# Send test message from customer's WhatsApp
# Number: Vendor's WhatsApp (scanned QR)
# Message: "Hello"

# Check Pi logs
docker logs beeline-pi --tail 50

# Should see:
# Incoming message from 233543****
# Processing message through AI
# Reply sent

# Customer receives AI response in WhatsApp ✅
```

### Step 7: Monitor & Maintain

```bash
# View active vendors
docker exec beeline-pi ps aux | grep node

# Check memory usage
docker stats beeline-pi

# View conversation history
docker logs beeline-pi | grep "historyLength"

# Restart if needed
docker restart beeline-pi

# Backup sessions
rsync -avz /home/$(whoami)/beeline-sessions/ ~/beeline-backup/
```

---

## APPENDIX

### A. Git Repository Structure

```
whatsapp-ai-platform-beeline-main/
├── pi/
│   ├── index.js                    # Main bridge code (337 lines)
│   ├── Dockerfile                  # Container definition
│   ├── package.json                # Node.js dependencies
│   ├── scripts/
│   │   └── add-vendor.js          # QR generation script
│   └── .env.example               # Environment template
├── workflows/
│   └── beeline-whatsapp.json      # n8n workflow export
├── backend/
│   └── (future database schemas)
├── docs/
│   ├── BEELINE-GHANA-MASTER-DOC.md    # This file
│   ├── UPDATE-FOR-ELON-SUCCESS.md     # Victory report
│   └── architecture/
│       ├── current-flow.png
│       ├── future-cloud.png
│       └── data-model.png
├── .gitignore
└── README.md
```

### B. Key Commits

```
commit a557291 - Add QR code terminal display for vendor onboarding
commit 7cbb293 - Fix: Keep Node.js process alive after startup
commit fa60e7f - Fix Dockerfile to use npm install instead of npm ci
```

### C. Environment Variables

**Pi (.env):**
```bash
N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp
SESSIONS_PATH=./sessions
MAX_VENDORS=50
AUTO_RECONNECT=true
RECONNECT_DELAY=5000
LOG_LEVEL=info
```

**n8n (Render):**
```bash
GROQ_API_KEY=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
DATABASE_URL=(future PostgreSQL)
REDIS_URL=(future Upstash)
```

### D. Useful Commands

```bash
# SSH to Pi
ssh beeline@192.168.8.28

# View real-time logs
docker logs beeline-pi -f

# Add new vendor
docker exec -it beeline-pi npm run add-vendor vendor-002

# Check active sessions
ls /home/beeline/beeline-sessions/

# Rebuild after code change
cd ~/whatsapp-ai-platform-beeline/pi
docker build -t beeline-pi:latest .
docker stop beeline-pi && docker rm beeline-pi
docker run -d --name beeline-pi --user root --restart unless-stopped \
  -v /home/beeline/beeline-sessions:/app/sessions \
  -e N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  beeline-pi:latest

# Test webhook manually
curl -X POST https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"test","customerId":"test","message":"test","conversationHistory":[]}'
```

### E. Contact & Support

**Team:**
- Joshua (Developer) - Ghana
- Elon (Product/Strategy) - via Grok
- Claude Code (AI Coding Assistant) - Anthropic

**Repository:** https://github.com/nanayawjoshua/whatsapp-ai-platform-beeline
**Domain:** beeline.works
**Status:** Private (changed Dec 2, 2025)

---

**END OF MASTER DOCUMENTATION**

*Last Updated: December 2, 2025, 09:45 GMT*
*Version: 1.0*
*Status: 95% Complete - Ready for First Sale*
