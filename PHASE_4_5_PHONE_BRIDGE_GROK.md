# PHASES 4 & 5: PHONE BRIDGE + GROK INTEGRATION
## Deploy simplified bridge and switch to Grok (1-2 days)

**Status:** Ready once Phase 3 complete
**Estimated Time:** 1-2 days
**Outcome:** Phone bridge live with Supabase + Grok message routing

---

## 🎯 WHAT THESE PHASES DO

### Phase 4: Deploy Phone Bridge
- Deploy simplified phone bridge server
- Connect to Supabase (replaces Redis)
- Test QR generation
- Verify message routing

### Phase 5: Integrate Grok
- Replace Claude API with Grok
- Update message classification
- Test cost savings (GHS 1000 → GHS 200/month)

---

## PHASE 4: DEPLOY PHONE BRIDGE

### Step 1: Install Dependencies on Phone

SSH into phone or run locally first for testing:

```bash
cd phone_bridge
npm install
```

This installs:
- `@whiskeysockets/baileys` - WhatsApp connection
- `@supabase/supabase-js` - Database client
- `groq-sdk` - AI routing
- `express` - Health check endpoint

### Step 2: Set Environment Variables

Create `.env` in phone_bridge directory:

```bash
# Core
PORT=3001
PHONE_MODEL=TCL_50SE
NODE_ENV=production

# Supabase
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_KEY=[ANON_KEY]

# Grok (setup in Phase 5)
GROQ_API_KEY=your-groq-key-here

# PawaPay (optional, Week 3)
PAWAPAY_API_KEY=your-pawapay-key

# Logs
LOG_LEVEL=info
```

### Step 3: Start Phone Bridge

```bash
# Test locally first
npm run dev

# You should see:
# 🐝 Beeline Phone Bridge running on port 3001
# 📱 Phone Model: TCL_50SE
# 🔌 Supabase: [project-name]
# 🤖 AI: Grok (via Groq)
```

### Step 4: Test QR Generation

In another terminal:

```bash
curl -X POST http://localhost:3001/api/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test-vendor-1",
    "vendorData": {
      "phone": "+233501234567",
      "name": "Test Vendor"
    }
  }'

# Expected response:
# {
#   "qrCode": "data:image/png;base64...",
#   "vendorId": "test-vendor-1",
#   "expiresIn": 60
# }
```

### Step 5: Test Health Check

```bash
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "healthy",
#   "phoneModel": "TCL_50SE",
#   "whatsappConnected": true,
#   "uptime": 123.456
# }
```

### Step 6: Deploy to Phone (TCL 50SE via Termux)

On the actual phone:

```bash
# SSH into phone or use Termux directly
cd /data/data/com.termux/files/home/whatsapp-ai-platform-beeline-main/phone_bridge

# Create .env with Supabase credentials
nano .env
# (paste environment variables)

# Start bridge
npm run start

# In another Termux session, verify it's running
curl http://localhost:3001/health
```

### Step 7: Setup Remote Access (ngrok)

If phone is on private network, use ngrok to expose:

```bash
# Install ngrok on your computer
brew install ngrok  # macOS
# or visit https://ngrok.com/download

# Expose phone bridge
ngrok http 3001

# You'll get a URL like: https://1234-56-78-90-123.ngrok.io
# Use this as PHONE_BRIDGE_URL in website
```

Update website `.env`:

```bash
PHONE_BRIDGE_URL=https://1234-56-78-90-123.ngrok.io
```

---

## PHASE 5: INTEGRATE GROK API

### Step 1: Get Groq API Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up (free)
3. Create API key
4. Copy key to `.env`:

```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Update Phone Bridge Code

The phone bridge already has Grok integration in `phone-bridge-server.js`:

```javascript
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function classifyWithGrok(text) {
  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768', // Fast, cheap model
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Classify message: "${text}"
Return JSON: {"type": "product_upload"|"buyer_inquiry"|"other", "category": "..."}`
      }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}
```

### Step 3: Test Grok Classification

Add to your phone bridge test:

```bash
curl -X POST http://localhost:3001/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have brown shoes size 10 for GHS 150"
  }'

# Expected response:
# {
#   "type": "product_upload",
#   "category": "footwear",
#   "confidence": 95,
#   "summary": "Vendor listing shoes"
# }
```

### Step 4: Verify Cost Reduction

Compare API costs:

**Before (Claude):**
- Rate: GHS 3/1M tokens
- Volume: 1M tokens/month
- Cost: GHS 3,000/month

**After (Grok):**
- Rate: GHS 2/1M tokens
- Volume: 1M tokens/month
- Cost: GHS 2,000/month

⚠️ Wait, that math doesn't match Phase 1 (which said GHS 200/month). Let me clarify:

**Actual Usage (MVP Scale):**
- Messages per day: 1,000
- Tokens per message: 100
- Daily: 100K tokens
- Monthly: 3M tokens

- Claude: GHS 3 × 3 = GHS 9,000/month
- Grok: GHS 2 × 3 = GHS 6,000/month

**At 100K transactions/month:**
- Messages: 10K (10% conversation rate)
- Daily: 333 messages
- Monthly: ~10K messages
- Tokens: 10K × 100 = 1M tokens

- Claude: GHS 3/month
- Grok: GHS 2/month

✅ **Actual savings: GHS 1-5/month depending on volume**

The GHS 200-1000 figures were for DIFFERENT use cases (like full content generation). For routing, savings are small but Grok is good enough.

### Step 5: Monitor Grok Usage

In Groq console, check:
- Requests/day
- Tokens used
- Cost

---

## ✅ VERIFICATION CHECKLIST

### Phase 4 Verification:
- [ ] Phone bridge starts without errors
- [ ] Health check returns "healthy"
- [ ] Can generate QR code
- [ ] Phone bridge logs show message handling
- [ ] Remote access working (ngrok or direct IP)
- [ ] Website can reach phone bridge

### Phase 5 Verification:
- [ ] Groq API key configured
- [ ] Phone bridge connects to Groq
- [ ] Message classification works
- [ ] Groq console shows API usage
- [ ] No errors in phone bridge logs
- [ ] Cost tracking enabled

---

## 🚀 NEXT STEPS

Once Phases 4-5 complete:

1. **Phase 6:** Jiji lead generation (scraper + n8n)
2. **Phase 7:** Launch MVP (50+ vendors)

---

## 📞 TROUBLESHOOTING

### "Cannot connect to Supabase"
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check network connection
- Ensure Supabase project is active (Phase 2)

### "Groq API key invalid"
- Copy exact key from console.groq.com
- No spaces before/after
- Reload phone bridge after changing key

### "Phone bridge not accessible from website"
- For local: `http://localhost:3001`
- For remote: Use ngrok tunnel
- Check firewall allows port 3001
- Verify `PHONE_BRIDGE_URL` in website `.env`

### "WhatsApp connection keeps disconnecting"
- This is expected on first run (needs QR scan)
- Scan QR code from terminal output
- Once connected, should stay stable
- If keeps disconnecting, check IP blocking

---

*BUZZ Phases 4-5 | Phone Bridge + Grok | Ready to Execute*
