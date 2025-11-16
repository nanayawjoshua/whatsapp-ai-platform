# n8n Local Deployment Guide

This directory contains everything needed to run n8n locally in Docker - **zero cloud costs**.

## Quick Start (Windows)

```bash
cd deployment
start.bat
```

Access n8n at: **http://localhost:5678**

## Quick Start (Mac/Linux)

```bash
cd deployment
chmod +x start.sh
./start.sh
```

Access n8n at: **http://localhost:5678**

---

## First-Time Setup

### 1. Install Prerequisites

- **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop)
  - Windows: Make sure WSL2 is enabled
  - Mac/Linux: Just install Docker

### 2. Configure Environment

```bash
cd deployment
cp .env.example .env
```

Edit `.env` file and change:
- `N8N_PASSWORD` - Use a strong password
- `N8N_USER` - Keep as "admin" or change

### 3. Start n8n

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### 4. First Login

1. Open browser: http://localhost:5678
2. Login with credentials from your `.env` file
3. You'll see the n8n dashboard

---

## Exposing n8n to the Internet (for WhatsApp webhooks)

Since WhatsApp needs to send messages to your n8n webhooks, you need a public URL.

### Option 1: Cloudflare Tunnel (Recommended - FREE)

**Why:** Free, secure, no port forwarding, works behind any firewall

```bash
# Install cloudflared
# Windows (using Chocolatey):
choco install cloudflared

# Mac:
brew install cloudflared

# Linux:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Start tunnel
cloudflared tunnel --url http://localhost:5678
```

You'll get a public URL like: `https://random-name.trycloudflare.com`

**Update your .env:**
```bash
WEBHOOK_URL=https://your-cloudflare-url.trycloudflare.com
```

Restart n8n: `docker-compose restart`

### Option 2: ngrok (FREE tier available)

```bash
# Install ngrok from ngrok.com
# Start tunnel
ngrok http 5678
```

Get your public URL from ngrok terminal.

### Option 3: Deploy to Railway/Fly.io (Free tier)

When you're ready to go 24/7, migrate to cloud (instructions coming in Day 7).

---

## Daily Operations

### Start n8n
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

### Stop n8n
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f n8n
```

### Restart n8n
```bash
docker-compose restart
```

### Backup Data
```bash
# Mac/Linux
chmod +x backup.sh
./backup.sh

# Windows - manual backup:
# Your data is in Docker volume: whatsapp-ai-platform_n8n_data
# Backups saved to: deployment/n8n-backups/
```

### Update n8n to Latest Version
```bash
docker-compose pull
docker-compose up -d
```

---

## File Structure

```
deployment/
├── docker-compose.yml      # Docker configuration
├── .env.example           # Template for environment variables
├── .env                   # Your actual config (gitignored)
├── start.sh               # Startup script (Mac/Linux)
├── start.bat              # Startup script (Windows)
├── backup.sh              # Backup script
├── n8n-backups/           # Backup storage (gitignored)
└── README.md             # This file
```

---

## Troubleshooting

### n8n won't start

**Check Docker is running:**
```bash
docker info
```

**Check logs:**
```bash
docker-compose logs n8n
```

**Nuclear option (fresh start):**
```bash
docker-compose down -v  # ⚠️ Deletes all data!
docker-compose up -d
```

### Can't access localhost:5678

- Check Windows Firewall
- Try: http://127.0.0.1:5678
- Check if port is already in use: `netstat -ano | findstr :5678`

### Cloudflare tunnel disconnects

- Tunnel URLs change on restart
- For permanent URL, sign up for Cloudflare Zero Trust (still free)
- Or use Railway/Fly.io for production

---

## Cost Breakdown

| Component | Local (Docker) | Cloud (n8n.cloud) |
|-----------|----------------|-------------------|
| n8n hosting | **$0** | $20-50/month |
| Cloudflare Tunnel | **$0** | N/A |
| Total | **$0** | $20-50/month |

**Savings:** $240-600/year by running locally!

---

## Production Considerations

When you get your first paying customers:

1. **24/7 Uptime**: Migrate to Railway/Fly.io (Day 7 plan)
2. **Database**: Switch from SQLite to PostgreSQL (uncomment in docker-compose.yml)
3. **Backups**: Automate daily backups to Google Drive/Dropbox
4. **Monitoring**: Set up uptime alerts (UptimeRobot - free tier)
5. **SSL/HTTPS**: Cloudflare Tunnel handles this automatically

---

## Next Steps

Once n8n is running:
1. ✅ Build your first workflow (Day 1)
2. ✅ Set up WhatsApp webhook listener (Day 1-2)
3. ✅ Connect to Claude/OpenAI API (Day 2)
4. ✅ Integrate Google Sheets (Day 3)

Good luck building! 🚀
