# 🔧 Fix Cloudflare Tunnel - aarch64 Binary

**Issue:** Downloaded wrong binary for aarch64 architecture
**Solution:** Use correct aarch64 binary
**Time:** 5 minutes

---

## The Problem

You have `aarch64` (64-bit ARM) but the `arm64` binary you downloaded has wrong format.

---

## The Fix

### Run These Commands on Your Device:

```bash
cd ~/beeline/phone_bridge

# Remove the wrong binary
rm cloudflared-linux-arm64

# Download the correct aarch64 binary
wget https://github.com/cloudflare/cloudflared/releases/download/2024.12.0/cloudflared-linux-aarch64

# Make it executable
chmod +x cloudflared-linux-aarch64

# Verify it works
./cloudflared-linux-aarch64 --version
```

If that shows a version number, you have the right binary!

---

## Update Your Config

Create config file:
```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste this:
```yaml
tunnel: beeline-bridge
credentials-file: /root/.cloudflared/[YOUR-UUID].json

ingress:
  - hostname: bridge.beeline.works
    service: http://127.0.0.1:3001
  - service: http_status:404
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## Authenticate & Create Tunnel

```bash
./cloudflared-linux-aarch64 tunnel login

# Follow browser prompt to authorize

# Create tunnel
./cloudflared-linux-aarch64 tunnel create beeline-bridge

# Verify
./cloudflared-linux-aarch64 tunnel list
```

---

## Add Route in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. **Tunnels** → `beeline-bridge`
3. **Public Hostnames** → **Create**
4. Fill:
   - Subdomain: `bridge`
   - Domain: `beeline.works`
   - Service: `HTTP`
   - URL: `127.0.0.1:3001`
5. Save

---

## Run with PM2

```bash
npm install -g pm2

pm2 start "~/beeline/phone_bridge/cloudflared-linux-aarch64" \
  --name "cloudflare-tunnel" \
  -- tunnel run beeline-bridge

pm2 startup
pm2 save

# Verify
pm2 list
```

Should show:
- `cloudflare-tunnel` (online) ✅
- `whatsapp-bridge` (online) ✅

---

## Test

```bash
curl https://bridge.beeline.works/health
```

Should return bridge status JSON.

---

## Summary

- ✅ Downloaded correct `cloudflared-linux-aarch64` binary
- ✅ Authenticated with Cloudflare
- ✅ Created tunnel `beeline-bridge`
- ✅ Configured routes
- ✅ Running with PM2 auto-restart
- ✅ Accessible at `bridge.beeline.works`

---

## Next Steps

After tunnel is working:

1. Go to Vercel Dashboard
2. Update env var: `PHONE_BRIDGE_URL=https://bridge.beeline.works`
3. Deploy website
4. Test everything
5. Client goes live!
