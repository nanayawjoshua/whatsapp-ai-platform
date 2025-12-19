# 🚀 IP Monitor Deployment Guide

**Date**: December 19, 2025
**Status**: READY TO DEPLOY
**Phone IP**: `10.62.162.24` (ap0 interface)

---

## 📋 **Quick Summary**

The IP monitor automatically updates your Cloudflare tunnel route when your phone's IP changes. This solves the dynamic IP problem that was causing QR generation failures.

**All 3 approaches are now working:**
1. ✅ NPM script (simplest)
2. ✅ Shell script (validated)
3. ✅ PM2 ecosystem (production-ready)

---

## 🎯 **Deployment Steps**

### **Step 1: Prepare Files on Windows**

All files are ready in `phone_bridge/`:
- ✅ `package.json` (npm script configured)
- ✅ `ecosystem.config.js` (PM2 config with env loading)
- ✅ `start-ip-monitor.sh` (shell script launcher)
- ✅ `.env.example` (template for credentials)
- ✅ `test-ip-monitor.sh` (comprehensive test suite)

---

### **Step 2: SSH to Phone**

```bash
# From Windows terminal
ssh u0_a123@10.62.162.24  # Replace with your phone's user
# Password: (your Termux password)
```

---

### **Step 3: Update Files on Phone**

```bash
cd ~/beeline/phone_bridge

# Pull latest changes from GitHub
git pull origin beeline-main

# Or manually copy files if not using git
# (copy package.json, ecosystem.config.js, start-ip-monitor.sh, .env.example)
```

---

### **Step 4: Create/Update .env File**

```bash
# If .env doesn't exist, create from example
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Edit .env file
nano .env
```

**Required variables:**
```bash
# Cloudflare (for IP monitor)
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here

# Supabase (for bridge)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Groq (for AI)
GROQ_API_KEY=your-groq-key-here

# Server
PORT=3001
PHONE_MODEL=TCL_50SE
NODE_ENV=production
```

**Save**: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### **Step 5: Install/Update Dependencies**

```bash
# Make sure all packages are installed
npm install

# Verify dotenv is installed
npm list dotenv
# Should show: dotenv@16.4.7 (or similar)
```

---

### **Step 6: Run Test Suite**

```bash
# Make test script executable
chmod +x test-ip-monitor.sh

# Run comprehensive tests
./test-ip-monitor.sh
```

**Expected Output:**
```
🧪 Beeline IP Monitor Test Suite
==================================

🔍 Pre-flight Checks
-------------------
✅ .env file exists
✅ Node.js installed: v18.x.x
✅ npm installed: 9.x.x
✅ node_modules exists

📋 Test 1: Environment Variable Loading
---------------------------------------
✅ PASS: CLOUDFLARE_API_TOKEN loaded
✅ PASS: CLOUDFLARE_ACCOUNT_ID loaded
✅ PASS: SUPABASE_URL loaded

🧪 Test 2: NPM Script Approach
------------------------------
✅ PASS: npm run monitor-ip starts successfully
✅ PASS: Environment variables loaded via npm script
✅ PASS: No credential errors in npm script

🧪 Test 3: Shell Script Approach
-------------------------------
✅ PASS: start-ip-monitor.sh starts successfully
✅ PASS: Shell script loads environment correctly

🧪 Test 4: PM2 Ecosystem Config
------------------------------
✅ PM2 installed
✅ PASS: PM2 ecosystem starts successfully
✅ PASS: IP monitor process visible in PM2
✅ PASS: IP monitor running in PM2
✅ PASS: Environment variables loaded in PM2

🧪 Test 5: IP Detection
---------------------
✅ PASS: ap0 IP detection: 10.62.162.24
✅ PASS: ifconfig command available (fallback)

🧪 Test 6: File Permissions
-------------------------
✅ PASS: start-ip-monitor.sh is executable
✅ PASS: .env file is readable
✅ PASS: ecosystem.config.js is readable

==================================
📊 Test Summary
==================================

Passed: 18
Failed: 0
Total:  18

✅ All tests passed!
```

---

### **Step 7: Choose Deployment Approach**

#### **Option A: NPM Script** (Recommended for testing)

```bash
# Test manually first
npm run monitor-ip

# You should see:
# 🔍 Environment check:
# CLOUDFLARE_API_TOKEN: PRESENT
# CLOUDFLARE_ACCOUNT_ID: PRESENT
# 🚀 Starting IP monitoring for Cloudflare tunnel...
# 📡 Checking IP every 5 minutes
# 🌐 Domain: bridge.beeline.works
# ✅ IP unchanged: 10.62.162.24

# Stop with Ctrl+C when verified
```

#### **Option B: Background with nohup** (Simple production)

```bash
# Run in background
nohup npm run monitor-ip > logs/ip-monitor.log 2>&1 &

# Check it's running
ps aux | grep ip-monitor

# View logs
tail -f logs/ip-monitor.log

# Stop when needed
pkill -f ip-monitor.js
```

#### **Option C: PM2** (Best for production)

```bash
# Start both bridge and IP monitor
npm run start-pm2

# Check status
pm2 status

# You should see:
# ┌─────────────────────┬────┬─────────┬──────┬───────┐
# │ App name            │ id │ status  │ cpu  │ mem   │
# ├─────────────────────┼────┼─────────┼──────┼───────┤
# │ beeline-phone-bridge│ 0  │ online  │ 1%   │ 45 MB │
# │ ip-monitor          │ 1  │ online  │ 0%   │ 25 MB │
# └─────────────────────┴────┴─────────┴──────┴───────┘

# View logs
pm2 logs ip-monitor

# Restart if needed
npm run restart-pm2

# Stop when needed
npm run stop-pm2
```

---

### **Step 8: Verify IP Monitoring Works**

```bash
# Check logs to confirm monitoring started
tail -f logs/ip-monitor.log  # if using nohup
# OR
pm2 logs ip-monitor          # if using PM2

# You should see periodic checks:
# ✅ IP unchanged: 10.62.162.24
# (every 5 minutes)
```

---

### **Step 9: Test IP Change Detection**

**Simulate IP change** (for testing):

```bash
# Manual test: Create a cached IP file with different IP
echo "192.168.1.100" > current_ip.txt

# Restart monitor
# Option A (npm): pkill -f ip-monitor && npm run monitor-ip
# Option B (PM2): npm run restart-pm2

# Check logs - should see:
# 📍 IP changed: 192.168.1.100 → 10.62.162.24
# 🔄 Updating Cloudflare route to: http://10.62.162.24:3001
# ✅ Updated existing route for bridge.beeline.works
# ✅ Cloudflare route updated successfully
```

**Real test**: Wait for actual IP change (network switch, reboot, etc.)

---

### **Step 10: Configure Auto-Start on Boot**

```bash
# Create/update boot script
mkdir -p ~/.termux/boot

cat > ~/.termux/boot/start-beeline.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Keep CPU awake
termux-wake-lock

# Wait for network
sleep 10

# Start services with PM2
cd ~/beeline/phone_bridge
npm run start-pm2

echo "Beeline services auto-started at $(date)" >> ~/beeline-boot.log
EOF

chmod +x ~/.termux/boot/start-beeline.sh

# Test boot script
~/.termux/boot/start-beeline.sh

# Verify services started
pm2 status
```

---

## 📊 **Monitoring & Maintenance**

### **Check Status**

```bash
# PM2 approach
pm2 status
pm2 logs ip-monitor --lines 20

# nohup approach
ps aux | grep ip-monitor
tail -f logs/ip-monitor.log
```

### **View Logs**

```bash
# Last 50 lines
tail -50 logs/ip-monitor.log

# Follow logs in real-time
tail -f logs/ip-monitor.log

# PM2 logs
pm2 logs ip-monitor --lines 50
```

### **Restart Services**

```bash
# PM2 approach
npm run restart-pm2

# nohup approach
pkill -f ip-monitor.js
nohup npm run monitor-ip > logs/ip-monitor.log 2>&1 &
```

### **Stop Services**

```bash
# PM2 approach
npm run stop-pm2

# nohup approach
pkill -f ip-monitor.js
```

---

## 🔍 **Troubleshooting**

### **Issue: "Missing CLOUDFLARE_API_TOKEN"**

**Cause**: .env file not loaded or missing variables

**Fix**:
```bash
# Check if .env exists and has correct vars
cat .env | grep CLOUDFLARE

# Should show:
# CLOUDFLARE_API_TOKEN=...
# CLOUDFLARE_ACCOUNT_ID=...

# If missing, edit .env
nano .env
```

---

### **Issue: "Could not detect current IP address"**

**Cause**: IP detection commands failed

**Fix**:
```bash
# Test IP detection manually
ifconfig | grep "inet "

# or
ip addr show ap0 | grep "inet "

# Should show: inet 10.62.162.24
```

---

### **Issue: "Failed to update route"**

**Cause**: Invalid Cloudflare credentials or tunnel not found

**Fix**:
```bash
# Verify tunnel exists
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/tunnels"

# Should return JSON with your tunnel
# Look for "beeline-bridge" in the response
```

---

### **Issue: PM2 not loading .env**

**Cause**: Old ecosystem.config.js (before my fixes)

**Fix**:
```bash
# Pull latest version from git
git pull origin beeline-main

# Or verify ecosystem.config.js has:
head -5 ecosystem.config.js

# Should show:
# const dotenv = require('dotenv');
# const path = require('path');
# ...
# const envConfig = dotenv.config(...).parsed || {};

# If not, update the file
```

---

## ✅ **Success Criteria**

IP monitor is working correctly when:

1. ✅ Test suite passes all tests (`./test-ip-monitor.sh`)
2. ✅ Monitor starts without "Missing" errors
3. ✅ Logs show "PRESENT" for all env vars
4. ✅ Current IP detected (e.g., `10.62.162.24`)
5. ✅ Periodic checks every 5 minutes
6. ✅ IP changes trigger Cloudflare updates
7. ✅ Auto-starts on phone reboot (if configured)
8. ✅ QR generation works reliably

---

## 📱 **Your Current Phone Setup**

Based on `ifconfig` output:

```
ap0: 10.62.162.24 (Hotspot/WiFi interface)
ccmni0: 10.82.213.151 (Mobile data)
lo: 127.0.0.1 (Loopback)
```

**Primary interface**: `ap0` at `10.62.162.24`

The IP monitor will:
- Detect IP from `ap0` interface
- Update Cloudflare tunnel route
- Save IP to `current_ip.txt`
- Check every 5 minutes for changes

---

## 🎯 **Next Steps**

After IP monitor is deployed and verified:

1. ✅ IP monitor running (this guide)
2. ⏭️ Run database migration (DATABASE_FIXES_COMPLETE.md)
3. ⏭️ Create storage bucket
4. ⏭️ Test complete signup flow
5. ⏭️ MVP launch 🚀

---

**Created**: December 19, 2025
**Phone IP**: 10.62.162.24
**Status**: READY TO DEPLOY
**All files committed**: ✅ beeline-main branch
