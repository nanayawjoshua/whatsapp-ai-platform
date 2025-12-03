# CLOUDFLARE TUNNEL SETUP - pi.beeline.works

**Goal:** Access your Raspberry Pi from anywhere in the world (even when lights are out at home!)

**What CloudFlare Tunnel Does:**
- Creates secure tunnel from Pi → CloudFlare → Internet
- No port forwarding needed
- No static IP needed
- SSH accessible via: `ssh pi@pi.beeline.works` from anywhere
- Free forever (CloudFlare Zero Trust)

---

## STEP 1: UPDATE NAMECHEAP NAMESERVERS (✅ Already Started!)

You're already at this step! You've set up CloudFlare for beeline.works.

### What You Did:
1. ✅ Added beeline.works to CloudFlare
2. ✅ CloudFlare gave you nameservers:
   - `hayes.ns.cloudflare.com`
   - `sky.ns.cloudflare.com`

### What You Need to Do NOW:
1. Go to Namecheap: https://www.namecheap.com
2. Log in → Domain List → **beeline.works** → **Manage**
3. Scroll to **Nameservers** section
4. Change from "Vercel DNS" to **Custom DNS**
5. Paste the two nameservers:
   ```
   hayes.ns.cloudflare.com
   sky.ns.cloudflare.com
   ```
6. Delete any other nameservers (like `ns1.vercel-dns.com`)
7. Click **Save Changes** (green button)

**How Long It Takes:**
- Usually 5-30 minutes in Ghana
- Sometimes up to 24 hours (but rare)
- You'll get an email from CloudFlare when it's active

---

## STEP 2: INSTALL CLOUDFLARED ON RASPBERRY PI

**Once nameservers are updated** (you'll get email), SSH into your Pi and run:

```bash
# Download cloudflared for Raspberry Pi (ARM64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64

# Make it executable
chmod +x cloudflared-linux-arm64

# Move to system path
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
```

**Expected Output:**
```
cloudflared version 2024.12.2 (built 2024-12-02-1234 UTC)
```

---

## STEP 3: LOGIN TO CLOUDFLARE (From Your Pi)

```bash
cloudflared tunnel login
```

**What Happens:**
1. A URL appears in the terminal (looks like: `https://dash.cloudflare.com/...`)
2. **OPEN THAT URL ON YOUR PHONE** (copy it from terminal)
3. Log in to CloudFlare (same account you used for beeline.works)
4. You'll see: "Select a domain"
5. Click **beeline.works**
6. Click **Authorize**

**Expected Output on Pi:**
```
You have successfully logged in.
Cert saved to: /home/pi/.cloudflared/cert.pem
```

---

## STEP 4: CREATE THE TUNNEL

```bash
cloudflared tunnel create beeline-pi
```

**Expected Output:**
```
Tunnel credentials written to /home/pi/.cloudflared/8f2a9c1d-3e4b-5f6g-7h8i-9j0k1l2m3n4o.json
Created tunnel beeline-pi with id 8f2a9c1d-3e4b-5f6g-7h8i-9j0k1l2m3n4o
```

**IMPORTANT:** Copy that Tunnel ID (the long string like `8f2a9c1d-3e4b-5f6g-7h8i-9j0k1l2m3n4o`)

---

## STEP 5: CONFIGURE DNS (Map pi.beeline.works → Tunnel)

Replace `YOUR_TUNNEL_ID` with the ID from Step 4:

```bash
cloudflared tunnel route dns YOUR_TUNNEL_ID pi.beeline.works
```

**Example:**
```bash
cloudflared tunnel route dns 8f2a9c1d-3e4b-5f6g-7h8i-9j0k1l2m3n4o pi.beeline.works
```

**Expected Output:**
```
Added CNAME pi.beeline.works which will route to this tunnel's ID
```

---

## STEP 6: CREATE TUNNEL CONFIG FILE

```bash
nano ~/.cloudflared/config.yml
```

**Paste this (replace `YOUR_TUNNEL_ID` with your actual ID):**

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/pi/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # SSH access via pi.beeline.works
  - hostname: pi.beeline.works
    service: ssh://localhost:22

  # HTTP access (for future web dashboard)
  - hostname: dashboard.beeline.works
    service: http://localhost:3001

  # Catch-all rule (required)
  - service: http_status:404
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## STEP 7: START THE TUNNEL (Test Mode)

```bash
cloudflared tunnel run beeline-pi
```

**Expected Output:**
```
2024-12-03T10:15:30Z INF Starting tunnel tunnelID=8f2a9c1d...
2024-12-03T10:15:32Z INF Connection registered connIndex=0
2024-12-03T10:15:32Z INF Connection registered connIndex=1
2024-12-03T10:15:32Z INF Connection registered connIndex=2
2024-12-03T10:15:32Z INF Connection registered connIndex=3
```

**Test It:**
1. Open a NEW terminal on your laptop
2. Try to SSH: `ssh pi@pi.beeline.works`
3. You should see Pi's login prompt!

**If it works:** Press `Ctrl+C` on the Pi to stop the test tunnel.

---

## STEP 8: RUN TUNNEL AS SERVICE (Auto-Start on Boot)

```bash
# Install as systemd service
sudo cloudflared service install

# Start it now
sudo systemctl start cloudflared

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

**Expected Output:**
```
● cloudflared.service - cloudflared
   Loaded: loaded
   Active: active (running)
```

---

## STEP 9: TEST FROM ANYWHERE!

**From Your Laptop (connected to any WiFi):**
```bash
ssh pi@pi.beeline.works
```

**From Your Phone (using Termius app):**
1. Download Termius app (iOS/Android)
2. Add new host:
   - Hostname: `pi.beeline.works`
   - Username: `pi`
   - Password: (your Pi password)
3. Connect!

**Test Scenario:**
1. Turn off your home WiFi on phone
2. Use mobile data (4G)
3. SSH to pi.beeline.works
4. Should still work! 🎉

---

## TROUBLESHOOTING

### "Connection refused" when SSH to pi.beeline.works

**Check if tunnel is running:**
```bash
sudo systemctl status cloudflared
```

If inactive:
```bash
sudo systemctl restart cloudflared
```

### "Tunnel ID not found"

Make sure you replaced `YOUR_TUNNEL_ID` in Step 6 with the actual ID from Step 4.

### Nameservers not updated yet

Check status:
```bash
dig beeline.works NS
```

Should show:
```
beeline.works.  3600  IN  NS  hayes.ns.cloudflare.com.
beeline.works.  3600  IN  NS  sky.ns.cloudflare.com.
```

If it still shows Vercel nameservers, wait 30 more minutes.

### Forgot Tunnel ID?

```bash
cloudflared tunnel list
```

Shows all your tunnels with IDs.

---

## WHAT YOU GET AFTER THIS

✅ **Access Pi from anywhere:**
- `ssh pi@pi.beeline.works` from any device, any network

✅ **No more "lights out" problems:**
- Deploy code even when home power is off (from laptop on mobile data)

✅ **Deploy cloud hybrid architecture:**
- Pi can forward messages to cloud bridge
- Monitor logs remotely
- Update code without being home

✅ **Future-proof:**
- Add web dashboard at `dashboard.beeline.works`
- Vendor onboarding UI at `signup.beeline.works`
- All through same tunnel

---

## NEXT STEPS (After Tunnel Works)

1. **Create cloud-hybrid branch:**
   ```bash
   ssh pi@pi.beeline.works
   cd /home/pi/beeline-ai
   git checkout -b cloud-hybrid
   ```

2. **Push to GitHub:**
   ```bash
   git push origin cloud-hybrid
   ```

3. **Deploy cloud bridge to Render:**
   - Connect GitHub repo
   - Select cloud-hybrid branch
   - render.yaml will auto-deploy

4. **Update Pi to forward to cloud:**
   - Edit `pi/index.js`
   - Change n8n webhook to cloud bridge URL
   - Restart Docker container

5. **Build resilient network:**
   - Cloud handles business logic
   - Pi handles WhatsApp gateway
   - Access from anywhere
   - "Take over like a virus" 🐝🇬🇭

---

**Status Check:**
- [ ] Nameservers updated on Namecheap (waiting for propagation)
- [ ] cloudflared installed on Pi
- [ ] Tunnel created (waiting for your Tunnel ID)
- [ ] Config file created
- [ ] Service running
- [ ] SSH works from anywhere

**Reply with your Tunnel ID when you get it!**

Then we'll proceed with cloud-hybrid deployment. 🚀
