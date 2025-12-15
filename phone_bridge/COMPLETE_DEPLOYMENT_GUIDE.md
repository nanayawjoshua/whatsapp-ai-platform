# COMPLETE DEPLOYMENT GUIDE - BUZZ MVP LAUNCH
## From Development to Production - December 15, 2025

**Status:** READY FOR EXECUTION
**Target:** Dec 15, 2025 Launch
**Duration:** 2 hours total

---

## EXECUTIVE SUMMARY

This guide provides the complete step-by-step process to deploy the BUZZ MVP from development to production. The system is architected as:

- **Phone Bridge**: Android device running WhatsApp automation
- **Website**: Next.js app on Vercel with Supabase backend
- **Infrastructure**: Residential IP routing for WhatsApp compatibility

**Current Status:** All components built and tested locally.

---

## PHASE 1: ANDROID PHONE BRIDGE DEPLOYMENT

### 1.1 Prerequisites
- ✅ Android phone (TCL 50SE recommended)
- ✅ Termux installed from F-Droid
- ✅ SSH access configured
- ✅ Phone bridge code transferred

### 1.2 Environment Setup
```bash
# On phone via SSH:
cd ~/beeline/phone_bridge
cp .env.buzz .env
# Edit .env with your Supabase credentials
nano .env
```

### 1.3 PM2 Auto-Restart Setup (CRITICAL)
```bash
# Install PM2 globally on Android
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'beeline-phone-bridge',
    script: 'phone-bridge-server.js',
    cwd: '/data/data/com.termux/files/home/beeline/phone_bridge',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/data/data/com.termux/files/home/beeline/logs/pm2-error.log',
    out_file: '/data/data/com.termux/files/home/beeline/logs/pm2-out.log',
    log_file: '/data/data/com.termux/files/home/beeline/logs/pm2-combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p ~/beeline/logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on boot (Android-specific)
cat > ~/.termux/boot/start-bridge.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Auto-start Beeline Phone Bridge on boot
cd /data/data/com.termux/files/home/beeline/phone_bridge
pm2 resurrect
EOF

chmod +x ~/.termux/boot/start-bridge.sh
```

### 1.4 PM2 Management Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs beeline-phone-bridge

# Restart service
pm2 restart beeline-phone-bridge

# Monitor resources
pm2 monit

# Stop service
pm2 stop beeline-phone-bridge
```

### 1.5 ngrok Tunnel Setup
```bash
# Install ngrok on Android
pkg install wget unzip
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar -xzf ngrok-v3-stable-linux-arm64.tgz
mv ngrok /data/data/com.termux/files/usr/bin/

# Authenticate (get token from ngrok.com)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Start tunnel
ngrok http 3001

# Note the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 1.6 Health Verification
```bash
# Test local health
curl http://localhost:3001/health

# Test via ngrok tunnel
curl https://your-ngrok-url.ngrok.io/health

# Expected response:
{
  "status": "healthy",
  "nodeType": "addon",
  "phoneModel": "TCL_50SE",
  "batteryLevel": "85%",
  "activeWorkers": 0,
  "maxWorkers": 4
}
```

---

## PHASE 2: WEBSITE DEPLOYMENT

### 2.1 Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd whatsapp-ai-platform-beeline-main/website
vercel --prod

# Set environment variables in Vercel dashboard:
# PHONE_BRIDGE_URL=https://your-ngrok-url.ngrok.io
# NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
# NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key
```

### 2.2 Domain Configuration
```bash
# In Vercel dashboard:
# Settings → Domains → Add beeline.works
# Configure DNS records as instructed
```

### 2.3 SSL Certificate
- ✅ Automatic with Vercel
- ✅ Custom domain SSL included

---

## PHASE 3: PRODUCTION TESTING

### 3.1 End-to-End Test Flow
```bash
# 1. Visit website
open https://beeline.works

# 2. Test vendor registration
# - Enter phone number
# - Should generate QR code
# - QR should display properly

# 3. Test WhatsApp connection
# - Scan QR with WhatsApp
# - Should connect successfully
# - Should appear in Supabase vendors table

# 4. Test message handling
# - Send test message to vendor
# - Should receive AI response
# - Should log in Supabase messages table
```

### 3.2 Database Verification
```sql
-- Check Supabase dashboard
SELECT COUNT(*) FROM vendors; -- Should increase
SELECT COUNT(*) FROM messages; -- Should show activity
SELECT * FROM vendors ORDER BY created_at DESC LIMIT 5;
```

### 3.3 Performance Monitoring
```bash
# Monitor PM2 on phone
pm2 status
pm2 logs beeline-phone-bridge

# Check Vercel analytics
# Vercel Dashboard → Analytics

# Monitor Supabase usage
# Supabase Dashboard → Reports
```

---

## PHASE 4: PRODUCTION OPTIMIZATION

### 4.1 PM2 Production Configuration
```javascript
// ecosystem.config.js (production settings)
module.exports = {
  apps: [{
    name: 'beeline-phone-bridge',
    script: 'phone-bridge-server.js',
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      // Add production env vars
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 4.2 ngrok Production Setup
```bash
# Use ngrok with custom domain (paid plan)
ngrok http 3001 --subdomain=beeline-bridge

# Or use free tier with consistent URL
# Note: Free tier URLs change on restart
```

### 4.3 Backup & Recovery
```bash
# PM2 backup
pm2 save
pm2 startup

# Database backup (Supabase automatic)
# File system backup
tar -czf ~/beeline-backup-$(date +%Y%m%d).tar.gz ~/beeline/
```

---

## PHASE 5: LAUNCH PREPARATION

### 5.1 Pre-Launch Checklist
- [ ] Phone bridge running with PM2
- [ ] ngrok tunnel stable
- [ ] Website deployed on Vercel
- [ ] Domain configured (beeline.works)
- [ ] SSL certificate active
- [ ] Supabase database populated
- [ ] Test user onboarding works
- [ ] Error handling tested
- [ ] Performance benchmarks met

### 5.2 Go-Live Sequence
```bash
# 1. Final health checks
curl https://beeline.works/api/bridge/health
curl https://your-ngrok-url.ngrok.io/health

# 2. Enable public access
# Vercel: Domain is live
# ngrok: Tunnel is running

# 3. Monitor initial traffic
pm2 logs beeline-phone-bridge --lines 50
# Vercel Analytics
# Supabase Dashboard

# 4. First user test
# - Register vendor
# - Scan QR
# - Send message
# - Verify response
```

### 5.3 Emergency Rollback
```bash
# If issues occur:
# 1. Stop ngrok tunnel
pm2 stop beeline-phone-bridge

# 2. Revert Vercel deployment
vercel rollback

# 3. Debug locally
npm run dev
```

---

## TROUBLESHOOTING GUIDE

### PM2 Issues
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs beeline-phone-bridge --lines 100

# Restart specific process
pm2 restart beeline-phone-bridge

# Delete and recreate
pm2 delete beeline-phone-bridge
pm2 start ecosystem.config.js
```

### ngrok Issues
```bash
# Check tunnel status
curl http://localhost:4040/api/tunnels

# Restart tunnel
pkill ngrok
ngrok http 3001

# Check firewall
pkg install iptables
iptables -L
```

### Database Issues
```sql
-- Check Supabase connectivity
SELECT NOW();

-- Verify tables exist
\dt

-- Check recent activity
SELECT COUNT(*) FROM vendors;
SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 hour';
```

### Performance Issues
```bash
# Monitor phone resources
htop
df -h  # Disk space
free -h  # Memory

# PM2 monitoring
pm2 monit

# Restart if memory high
pm2 restart beeline-phone-bridge
```

---

## SUCCESS METRICS

### Launch Day Targets (Dec 15)
- ✅ 3-5 vendors onboarded
- ✅ QR scanning works 100%
- ✅ WhatsApp connections stable
- ✅ Message responses < 5 seconds
- ✅ No critical errors

### Week 1 Targets (Dec 15-22)
- ✅ 20+ vendors onboarded
- ✅ GHS 50K+ GMV
- ✅ 95% uptime
- ✅ User feedback collected

### Month 1 Targets (Dec 15-Jan 15)
- ✅ 50+ vendors onboarded
- ✅ GHS 500K+ GMV
- ✅ GHS 25K+ revenue
- ✅ Series A ready

---

## COST BREAKDOWN

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| **Phone** | $0 | Existing device |
| **ngrok** | $5 | Basic plan |
| **Vercel** | $0 | Hobby plan |
| **Supabase** | $25 | Pro plan |
| **Domain** | $12 | Annual |
| **Total** | **$42/month** | Production ready |

---

## FINAL CHECKLIST

### Pre-Launch (Dec 14)
- [ ] PM2 auto-restart configured
- [ ] ngrok tunnel tested
- [ ] Vercel deployment complete
- [ ] Domain DNS configured
- [ ] Supabase database ready
- [ ] Test user flow verified

### Launch Day (Dec 15)
- [ ] Monitor PM2 logs
- [ ] Watch Vercel analytics
- [ ] Check Supabase usage
- [ ] Handle first user support
- [ ] Document any issues

### Post-Launch (Dec 16+)
- [ ] Scale to 10 vendors
- [ ] Collect user feedback
- [ ] Optimize performance
- [ ] Plan Phase 6 (Jiji automation)

---

## EMERGENCY CONTACTS

**Technical Issues:**
- PM2: `pm2 logs` + restart
- ngrok: Check tunnel status
- Vercel: Redeploy if needed
- Supabase: Check dashboard

**Business Issues:**
- User onboarding: Check QR generation
- Payment issues: Verify Paystack
- Message delays: Check PM2 status

---

**LAUNCH COMMAND:**
```bash
# Execute on Dec 15, 2025
echo "🚀 Beeline BUZZ MVP Launch - December 15, 2025"
echo "Target: 50 vendors, GHS 500K GMV by Jan 10"
echo "Status: READY FOR LAUNCH"
```

**The system is production-ready. Execute the deployment sequence and launch!** 🐝

---

*Complete Deployment Guide - BUZZ MVP Launch*
*Created: December 13, 2025*
*Ready for: December 15, 2025 Launch*</content>
<parameter name="filePath">/mnt/c/Users/USER/Desktop/josh/whatsapp-ai-platform-beeline-main/whatsapp-ai-platform-beeline-main/COMPLETE_DEPLOYMENT_GUIDE.md