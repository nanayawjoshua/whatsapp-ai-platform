# 🌐 Cloudflare Tunnel Setup - For Your beeline.works

**Status:** Domain is already in Cloudflare ✅
**Next Step:** Create tunnel for bridge
**Time:** 15 minutes

---

## You Already Have ✅

- Domain: `beeline.works`
- Status: Active in Cloudflare
- Account: nanayawjoshua@gmail.com

---

## STEP 1: Create Tunnel in Cloudflare Dashboard

### Go to Cloudflare:
1. Visit https://dash.cloudflare.com
2. Select **beeline.works**
3. Left sidebar → **Networks** (or look for **Tunnels**)
4. Click **Create a tunnel**
5. Choose connector type: **Cloudflared**
6. Click **Create tunnel**

### Name Your Tunnel:
```
Name: beeline-bridge
```
Click **Save tunnel**

### You'll See:
- Tunnel token and credentials
- Instructions to install cloudflared
- Copy and save the tunnel ID/credentials

---

## STEP 2: Install & Run on Your Device

### SSH to Device:
```bash
ssh -p 8022 u0_a290@10.36.210.159
```

### Download Cloudflared:
```bash
cd ~/beeline/phone_bridge

wget https://github.com/cloudflare/cloudflared/releases/download/2024.12.0/cloudflared-linux-arm64

chmod +x cloudflared-linux-arm64
```

### Authenticate:
```bash
./cloudflared-linux-arm64 tunnel login
```

This opens browser → Authorize with your Cloudflare account → Credentials saved automatically

### Verify Tunnel:
```bash
./cloudflared-linux-arm64 tunnel list
```

Should show: `beeline-bridge` with a UUID

---

## STEP 3: Configure Tunnel

### Create Config File:
```bash
mkdir -p ~/.cloudflared

nano ~/.cloudflared/config.yml
```

### Paste This:
```yaml
tunnel: beeline-bridge
credentials-file: /root/.cloudflared/[YOUR-UUID].json

ingress:
  - hostname: bridge.beeline.works
    service: http://127.0.0.1:3001
  - service: http_status:404
```

Replace `[YOUR-UUID]` with your tunnel ID from Step 2.

### Save File:
Press `Ctrl+X` → `Y` → `Enter`

---

## STEP 4: Add Route in Cloudflare Dashboard

### In Cloudflare Dashboard:
1. **Tunnels** → Select `beeline-bridge`
2. Click **Public Hostnames** tab
3. Click **Create public hostname**

### Fill In:
```
Subdomain: bridge
Domain: beeline.works
Service Type: HTTP
URL: 127.0.0.1:3001
```

Click **Save hostname**

### Result:
- Shows `bridge.beeline.works` → `127.0.0.1:3001`
- Status shows as connected

---

## STEP 5: Run with PM2

### Install PM2:
```bash
npm install -g pm2
```

### Start Tunnel with PM2:
```bash
pm2 start "~/beeline/phone_bridge/cloudflared-linux-arm64" \
  --name "cloudflare-tunnel" \
  -- tunnel run beeline-bridge
```

### Setup Auto-Start on Boot:
```bash
pm2 startup
pm2 save
```

### Verify Running:
```bash
pm2 list
```

Should show:
- `cloudflare-tunnel` (status: online) ✅
- `whatsapp-bridge` (status: online) ✅

---

## STEP 6: Test the Tunnel

### Test from Terminal:
```bash
curl https://bridge.beeline.works/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "phoneModel": "TCL_50SE",
  "whatsappConnected": true,
  "connectionState": "open"
}
```

If you get this → **Tunnel is working!** ✅

### If You Get Error:

**Check tunnel logs:**
```bash
pm2 logs cloudflare-tunnel
```

**Check bridge is running:**
```bash
ps aux | grep phone-bridge
```

**Restart if needed:**
```bash
pm2 restart cloudflare-tunnel
```

---

## STEP 7: Verify in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. **Tunnels** → `beeline-bridge`
3. Should show:
   - **Status:** Connected ✅ (green dot)
   - **Public Hostnames:** `bridge.beeline.works`
   - **Connected:** Just now

---

## STEP 8: Update Environment for Production

When you deploy to Vercel, change this env variable:

**From (local development):**
```
PHONE_BRIDGE_URL=http://10.36.210.159:3001
```

**To (production with tunnel):**
```
PHONE_BRIDGE_URL=https://bridge.beeline.works
```

Then redeploy on Vercel.

---

## Troubleshooting

### Tunnel Won't Start
```bash
# Check if cloudflared is in the right place
ls -la ~/beeline/phone_bridge/cloudflared-linux-arm64

# Use full absolute path
pm2 start "/root/beeline/phone_bridge/cloudflared-linux-arm64" \
  --name "cloudflare-tunnel" \
  -- tunnel run beeline-bridge

# Check logs
pm2 logs cloudflare-tunnel
```

### 502 Bad Gateway Error
```bash
# Verify bridge is running
pgrep -f "phone-bridge-server.js"

# If not running, start it
pm2 start phone-bridge-server.js --name "whatsapp-bridge"

# Verify port 3001 is listening
netstat -tulpn | grep 3001
```

### DNS Not Resolving bridge.beeline.works
```bash
# Check DNS
nslookup bridge.beeline.works

# If not resolved, wait 5-30 minutes for propagation
# Or manually check tunnel status in Cloudflare dashboard
```

### Tunnel Shows Disconnected in Dashboard
```bash
# Check tunnel process
pm2 list

# View logs for errors
pm2 logs cloudflare-tunnel

# Restart tunnel
pm2 restart cloudflare-tunnel
```

---

## Commands Reference

```bash
# List all PM2 processes
pm2 list

# View tunnel logs
pm2 logs cloudflare-tunnel

# View bridge logs
pm2 logs whatsapp-bridge

# Restart tunnel
pm2 restart cloudflare-tunnel

# Restart bridge
pm2 restart whatsapp-bridge

# Test tunnel
curl https://bridge.beeline.works/health

# Check what's listening on port 3001
netstat -tulpn | grep 3001

# SSH to device
ssh -p 8022 u0_a290@10.36.210.159
```

---

## Success Checklist

- [ ] Domain `beeline.works` is in Cloudflare (Active)
- [ ] Tunnel `beeline-bridge` created in Cloudflare
- [ ] Config file created: `~/.cloudflared/config.yml`
- [ ] Route created: `bridge.beeline.works` → `127.0.0.1:3001`
- [ ] PM2 installed: `npm list -g pm2`
- [ ] Cloudflare tunnel running: `pm2 list` shows "cloudflare-tunnel" online
- [ ] Bridge running: `pm2 list` shows "whatsapp-bridge" online
- [ ] Tunnel accessible: `curl https://bridge.beeline.works/health` returns bridge status
- [ ] Dashboard shows: Connected ✅ (green dot) in Cloudflare

---

## Next Step

After tunnel is working:

1. Go to Vercel Dashboard
2. Update env var: `PHONE_BRIDGE_URL=https://bridge.beeline.works`
3. Deploy website
4. Test at `https://beeline.works`
5. Client can signup and scan QR!

---

## You Now Have

✅ Website: `https://beeline.works` (Vercel)
✅ Bridge: `https://bridge.beeline.works` (Cloudflare Tunnel)
✅ Both with auto-restart via PM2
✅ Admin dashboard monitoring everything
✅ Client ready to go live!

Total time remaining: 45 minutes to full deployment
