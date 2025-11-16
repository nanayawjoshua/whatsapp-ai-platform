# WhatsApp Backend Service

This is the WhatsApp listener that connects your phone to the AI platform.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start the Service

```bash
npm start
```

### 3. Scan QR Code

A QR code will appear in your terminal. Scan it with WhatsApp:

1. Open WhatsApp on your phone
2. Go to **Settings** > **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code shown in terminal

### 4. Done!

Your WhatsApp is now connected. Messages will automatically forward to n8n for AI processing.

---

## How It Works

```
Customer WhatsApp
     ↓
Your WhatsApp Business Number
     ↓
Baileys (this service)
     ↓
n8n Webhook (localhost:5678/webhook/whatsapp)
     ↓
Groq AI (processes message)
     ↓
n8n sends response back
     ↓
Baileys sends to customer
```

---

## Configuration

Edit `backend/.env`:

```bash
# Where to send messages for AI processing
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp

# Your Groq API key
GROQ_API_KEY=your_key_here

# Where to save WhatsApp session
WHATSAPP_SESSION_PATH=./whatsapp-session

# Logging level (info, debug, error)
LOG_LEVEL=info
```

---

## Troubleshooting

### QR Code Won't Scan
- Make sure terminal is full screen
- Try scanning from different angle
- Restart the service: `npm start`

### Connection Keeps Dropping
- Check your internet connection
- WhatsApp may be logged in elsewhere
- Clear session and re-auth:
  ```bash
  rm -rf whatsapp-session/
  npm start
  ```

### Messages Not Forwarding
- Check n8n is running: http://localhost:5678
- Verify webhook URL in `.env`
- Check logs for errors

---

## Session Management

Your WhatsApp session is saved in `whatsapp-session/` folder.

- **Don't delete** this folder (you'll have to re-scan QR)
- **Don't commit** to Git (it's gitignored)
- **Backup** if moving to production

---

## Production Deployment

For 24/7 uptime:

1. **Use PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start index.js --name whatsapp-agent
   pm2 save
   pm2 startup
   ```

2. **Or Docker** (coming soon):
   ```bash
   docker-compose up -d whatsapp-backend
   ```

3. **Monitor logs**:
   ```bash
   pm2 logs whatsapp-agent
   ```

---

## Notes

- Uses **Baileys** (no Meta Business API needed = FREE!)
- One WhatsApp number can handle unlimited customers
- Messages are processed asynchronously
- Session persists between restarts

Ready to test? Start this service, then build the n8n workflow!
