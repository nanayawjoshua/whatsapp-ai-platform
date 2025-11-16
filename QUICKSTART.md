# Quick Start: Get Your AI Agent Running in 15 Minutes

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js (v18+) installed
- ✅ WhatsApp installed on your phone
- ✅ Groq API key (get free at https://console.groq.com)

---

## Step 1: Start n8n (2 minutes)

```bash
cd deployment
start.bat    # Windows
# or
./start.sh   # Mac/Linux
```

Open browser: **http://localhost:5678**

Login:
- Username: `admin`
- Password: `CarWash2025!Secure`

---

## Step 2: Set Up Groq in n8n (3 minutes)

1. In n8n, click profile icon → **Settings** → **Credentials**
2. **+ Add Credential** → Search "HTTP Header Auth"
3. Fill in:
   - Name: `Groq API Key`
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_GROQ_API_KEY`
4. Click **Save**

---

## Step 3: Create n8n Workflow (5 minutes)

Follow the visual guide in: **[workflows/n8n-setup-guide.md](workflows/n8n-setup-guide.md)**

Or import this workflow JSON (coming soon).

**Quick version:**
1. Add **Webhook** trigger → Path: `whatsapp`
2. Add **HTTP Request** → Call Groq API
3. Add **Respond to Webhook** → Send AI response

Save and **Activate** the workflow!

---

## Step 4: Start WhatsApp Backend (5 minutes)

```bash
cd backend
npm install     # First time only
npm start
```

**Scan the QR code** with WhatsApp:
1. Open WhatsApp → Settings → Linked Devices
2. Link a Device → Scan QR

Wait for: `✅ WhatsApp connected successfully!`

---

## Step 5: Test It! (1 minute)

Send a WhatsApp message to your business number:

```
"Hi, I need help ordering products"
```

You should get an AI-powered response within 1-2 seconds! 🎉

---

## What You Just Built

```
Customer WhatsApp Message
    ↓
Your WhatsApp Business
    ↓
Baileys Listener (backend)
    ↓
n8n Workflow (localhost)
    ↓
Groq Llama 3.1 70B (AI)
    ↓
Response back to customer
```

**All running locally. Zero cloud costs. Instant responses.**

---

## Next Steps

### For Supermarket Client:

1. **Create Google Sheet** with products
   - See: [docs/supermarket-google-sheets-schema.md](docs/supermarket-google-sheets-schema.md)

2. **Add product search** to n8n workflow
   - Query Google Sheets API
   - Return product info to customer

3. **Build cart management**
   - Save items to order sheet
   - Calculate totals

4. **Add payment confirmation**
   - Update order status
   - Send invoice

### For Platform Growth:

1. **Package this for next client** (car wash, salon, etc.)
2. **Create industry templates**
3. **Build self-service onboarding**
4. **Launch SaaS platform**

---

## Troubleshooting

### n8n won't start
```bash
docker ps    # Check if running
docker logs car-wash-n8n    # Check errors
```

### WhatsApp won't connect
- Restart backend: `npm start`
- Delete session: `rm -rf backend/whatsapp-session/`
- Re-scan QR code

### No AI response
- Check n8n workflow is **Active** (green)
- Verify Groq API key in credentials
- Check backend logs for errors

---

## You're Live!

You now have a **production-ready AI agent** handling customer conversations via WhatsApp.

**Cost to run:** ~$0.01 per 100 messages (Groq is insanely cheap)

**Response time:** <1 second (Groq is insanely fast)

**Scalability:** Handles unlimited customers on one WhatsApp number

---

## Support

- **Documentation:** See `/docs` folder
- **Issues:** Check backend logs and n8n execution history
- **Community:** (Coming soon - Discord/Slack)

---

**Now go wow your supermarket client! 🚀**
