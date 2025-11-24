# Beeline — Your AI Employee Lives in Your Phone Number

> **One Raspberry Pi + One SIM = AI employee for 50+ merchants**

Beeline turns your existing phone number into a 24/7 AI employee that works on WhatsApp, Telegram, SMS — no new number, no app, no hiring.

## The Physics

```
Customer WhatsApp Message
    ↓
Vendor's Real Phone Number (their trusted number)
    ↓
Raspberry Pi (Baileys multi-session) ← One Pi = 50+ vendors
    ↓
Render Cloud (n8n + Groq Llama-3.3-70B)
    ↓
AI Response with full conversation memory
    ↓
Back through Pi → Customer
    ↓
Looks 100% like the vendor typed it
```

**Cost per vendor:** $9/month flat
**Hardware:** One Raspberry Pi 4 + MTN SIM serves first 1,000 vendors
**Response time:** <4 seconds
**Memory:** 8+ turn conversations, survives interruptions

## First Principles (non-negotiable)

1. **Phone number is the moat** — Merchants use their own trusted number. We NEVER give them a new one.
2. **One bridge, infinite channels** — WhatsApp today, TikTok DMs, Instagram, RCS in <48 hours.
3. **Only metric: WAS** — Weekly Active Shops (≥1 paid order in last 7 days).
4. **Cheapest loop** — Groq inference + message in/out + MoMo + Yango.
5. **Viral coefficient >1.0** — Every reply ends with referral. 30 days free for every signup.
6. **Channel-death resistant** — One-click fallback to Meta Cloud API / Twilio / TikTok.
7. **The real product** — In 5-10 years: commerce graph of 200M+ African merchants.

## What Works TODAY (November 24, 2025)

- ✅ **Full cloud Telegram bot** — zero laptop dependency, runs 24/7 on Render
- ✅ **Dual-channel architecture** — Telegram (cloud-native) + WhatsApp (Pi-ready)
- ✅ **Ghana-localized AI** — GHS pricing, MoMo payments, Yango delivery, "Akwaaba" greetings
- ✅ **Groq Llama-3.3-70B** — <600ms response time
- ✅ **n8n workflow** — Telegram Trigger → Code → Groq → IF → Response routing
- ✅ **Render cloud brain** — [n8n-latest-4dbq.onrender.com](https://n8n-latest-4dbq.onrender.com)
- ✅ **Pi multi-session Baileys** — code ready in `pi/index.js`
- ✅ **Viral footer** — "Powered by Beeline" on every message
- ✅ **Live bot** — [@beelyne_ai_bot](https://t.me/beelyne_ai_bot) on Telegram

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER CLOUD ($7/mo)                     │
│                                                             │
│   ┌─────────────┐                                          │
│   │  Telegram   │ ←── Cloud-native (no hardware needed)    │
│   │  Trigger    │                                          │
│   └──────┬──────┘                                          │
│          │                                                  │
│          ▼                                                  │
│   ┌──────────────────────────────────────────────────┐     │
│   │                    n8n Workflow                   │     │
│   │  Code → Groq API → IF (channel?) → Response      │     │
│   └──────────────────────────────────────────────────┘     │
│          ▲                    │                             │
│          │                    ├──→ Telegram Send            │
│   ┌──────┴──────┐             └──→ Respond to Webhook       │
│   │   Webhook   │                                          │
│   │  /whatsapp  │                                          │
│   └──────┬──────┘                                          │
│          │                                                  │
└──────────┼──────────────────────────────────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      RASPBERRY PI                           │
│                   (Physical Device)                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Vendor #1   │  │ Vendor #2   │  │ Vendor #50  │  ...   │
│  │ WhatsApp    │  │ WhatsApp    │  │ WhatsApp    │        │
│  │ (Baileys)   │  │ (Baileys)   │  │ (Baileys)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** Telegram runs 100% in cloud. WhatsApp needs Pi for session persistence.

## Quick Start — Raspberry Pi

```bash
# On your Raspberry Pi
git clone https://github.com/nanayawjoshua/whatsapp-ai-platform.git
cd whatsapp-ai-platform/pi
npm install
cp .env.example .env
nano .env  # Set N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp

# Add first vendor
npm run add-vendor mango-shop-001
# QR code appears → vendor scans with WhatsApp → LIVE
```

## Vendor Onboarding (45 seconds)

1. Vendor gets WhatsApp: "Say YES to start your AI employee"
2. Vendor says YES → QR code sent
3. Vendor scans QR (30 seconds)
4. Voice note: "Tell me what you sell"
5. AI builds catalog from voice → Done

## Commands

```bash
npm run add-vendor <id>      # Onboard new vendor
npm run list-vendors         # Show all connected vendors
npm run disconnect <id>      # Remove vendor session
```

## Every AI Reply Includes

```
[AI's helpful response here]

---
_Powered by Beeline. Want your own AI employee? Say YES._
```

Viral coefficient built into every message.

## Pricing

**$9/month flat.** No tiers. No per-message fees.

Includes:
- Unlimited messages
- Conversation memory
- 24/7 availability
- All channels (WhatsApp, Telegram, SMS)

## Privacy

- Chat text deleted after 7 days
- Only order data kept (encrypted)
- Vendor types `/disconnect` → session wiped instantly
- We never see customer phone numbers in logs

## Roadmap

### This Week
- [ ] First street vendor live (mango seller)
- [ ] First supermarket with real inventory
- [ ] First MoMo payment through AI
- [ ] Yango delivery integration

### This Month
- [ ] 10 WAS (Weekly Active Shops)
- [ ] Voice note catalog building
- [ ] Insurance vertical
- [ ] TikTok DM channel

### This Year
- [ ] 1,000 WAS
- [ ] 10 Raspberry Pis across Ghana
- [ ] Expand to Nigeria, Kenya
- [ ] $100K MRR

## Tech Stack

| Layer | Technology | Cost |
|-------|------------|------|
| AI Brain | Groq Llama-3.3-70B | $0.27/1M tokens |
| Orchestration | n8n (self-hosted) | Free |
| WhatsApp | Baileys (multi-session) | Free |
| Cloud | Render Starter | $7/mo |
| Hardware | Raspberry Pi 4 | $55 one-time |
| Payments | MTN MoMo | 1% fee |
| Delivery | Yango API | Per-delivery |

**Total infrastructure cost for 50 vendors:** ~$12/month

## The Vision

Beeline is not a chatbot.

Beeline is the commerce operating system for the next billion merchants.

One Raspberry Pi in Accra. One in Lagos. One in Nairobi.

Each one turns 50 phone numbers into AI employees.

**WAS this week: 1 (and growing)**

---

Built with 🐝 in Ghana

[GitHub](https://github.com/nanayawjoshua/whatsapp-ai-platform) · [Report Issue](https://github.com/nanayawjoshua/whatsapp-ai-platform/issues)
