# Beeline Raspberry Pi — WhatsApp Bridge

## Hardware Required
- Raspberry Pi 4 (4GB recommended) or Pi 5
- MTN SIM card (data enabled)
- USB LTE dongle (Huawei E3372 or similar) OR WiFi connection
- MicroSD card (32GB+)
- Power supply

## What This Does
One Raspberry Pi = WhatsApp bridge for 50+ vendors.

Each vendor scans a QR code ONCE → their WhatsApp session lives on the Pi.
All messages route through our n8n brain in the cloud (172.237.109.60).

## Architecture
```
Customer WhatsApp
    ↓
Vendor's Real Number (their own phone number)
    ↓
Raspberry Pi (Baileys multi-session)
    ↓
Linode Cloud (n8n + Groq AI)
    ↓
Response back through Pi
    ↓
Customer sees reply from vendor's number
```

## Setup Instructions

### 1. Flash Ubuntu Server 24.04 to SD Card
- Use Raspberry Pi Imager
- Select "Ubuntu Server 24.04 LTS (64-bit)"
- Configure WiFi/SSH in advanced settings

### 2. Boot Pi and SSH In
```bash
ssh ubuntu@<pi-ip-address>
```

### 3. Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

### 4. Clone Beeline
```bash
git clone https://github.com/nanayawjoshua/whatsapp-ai-platform.git
cd whatsapp-ai-platform/pi
npm install
```

### 5. Configure Environment
```bash
cp .env.example .env
nano .env
# Set N8N_WEBHOOK_URL=http://172.237.109.60/webhook/whatsapp
```

### 6. Start the Bridge
```bash
npm start
```

### 7. Onboard First Vendor
- Pi generates QR code
- Vendor scans with their WhatsApp
- Session saved to `sessions/<vendor-id>/`
- Done. Their number is now AI-powered.

## Multi-Session Management

Each vendor gets their own session folder:
```
sessions/
├── vendor-001/
│   └── creds.json
├── vendor-002/
│   └── creds.json
└── vendor-003/
    └── creds.json
```

Maximum ~50 sessions per Pi (limited by RAM/CPU).
Scale = add more Pis.

## Commands
- `npm start` — Start bridge
- `npm run add-vendor` — Generate new QR for vendor onboarding
- `npm run list-vendors` — Show all connected vendors
- `npm run disconnect <vendor-id>` — Remove a vendor's session
