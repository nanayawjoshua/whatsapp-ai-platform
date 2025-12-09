# Bridge Uptime & Availability Strategy

## Problem

**Render Free Tier:** Services sleep after 15 minutes of no traffic
- Client signs up → bridge is cold
- QR generation request times out (69+ seconds)
- Poor user experience

**Solution:** Multi-layer availability assurance

---

## Architecture: 4 Layers

### Layer 1: Frontend Pre-Flight Check
**File:** `website/lib/hooks/use-bridge-available.ts`

Frontend checks if bridge is awake BEFORE attempting signup:

```typescript
const BridgeSignup = () => {
  const { ensureBridgeAwake } = useBridgeAvailable()
  
  const handleSignup = async () => {
    // Step 1: Check if bridge is awake
    const isReady = await ensureBridgeAwake()
    
    if (!isReady) {
      showError('Bridge is starting up, please wait...')
      return
    }
    
    // Step 2: Proceed with signup (bridge is definitely awake)
    proceedWithQRGeneration()
  }
}
```

**Benefits:**
- User gets instant feedback if bridge is sleeping
- App can show loading state while bridge wakes
- No silent timeouts

---

### Layer 2: API Health Proxy
**File:** `website/app/api/bridge/health/route.ts`

Frontend → Next.js API → Bridge

This proxy layer:
- Shields frontend from direct bridge calls
- Provides consistent response format
- Can add logging/monitoring
- Can implement circuit breaker pattern

```typescript
GET /api/bridge/health
Response: {
  status: 'available' | 'sleeping' | 'unavailable',
  bridge: { status, vendors, memory, uptime },
  checkedAt: timestamp
}
```

---

### Layer 3: Request-Time Wake-Up
**File:** `website/app/api/auth/initiate-whatsapp/route.ts`

When client submits phone number:

```typescript
// Step 1: Ping bridge health endpoint (with retries)
while (attempts < maxAttempts) {
  const health = await fetch(`${bridgeUrl}/health`)
  if (health.ok) break
  
  // Exponential backoff: 2s → 4s → 8s
  await sleep(delay)
  delay *= 2
}

// Step 2: Bridge is definitely awake - proceed with QR request
const qr = await fetch(`${bridgeUrl}/vendor/generate-qr`, { ... })
```

**Flow:**
```
Client clicks "Scan WhatsApp"
  ↓
Frontend pings /api/bridge/health
  ↓
Shows loading: "Starting WhatsApp service..."
  ↓
POST /api/auth/initiate-whatsapp
  ├─ Ping bridge 3 times with exponential backoff
  ├─ Bridge wakes up
  └─ Generate QR code
  ↓
QR displayed to user (worst case: 15-20 seconds)
```

---

### Layer 4: Keep-Alive Service
**File:** `cloud/keep-bridge-alive.js`

Scheduled job that pings bridge every 10 minutes:

```bash
node cloud/keep-bridge-alive.js
```

Or deploy as serverless cron job (preferred):
- EasyCron (free)
- AWS Lambda + CloudWatch Events
- Google Cloud Scheduler
- Render cron jobs (if available)

**Configuration:**
```
Ping interval: 10 minutes
Render sleep timeout: 15 minutes
Buffer: 5 minutes (safe)
```

---

## Implementation Status

### ✅ Implemented

- [x] `bridge-client.js` - Reusable bridge client with retry logic
- [x] `website/app/api/auth/initiate-whatsapp/route.ts` - Ping before QR request
- [x] `website/app/api/bridge/health/route.ts` - Health proxy endpoint
- [x] `website/lib/hooks/use-bridge-available.ts` - Frontend hook
- [x] `cloud/keep-bridge-alive.js` - Standalone keep-alive service

### ⏳ Deployment Tasks

1. **Start Keep-Alive Service** (Choose One)
   
   **Option A: Local Cron** (for development)
   ```bash
   cd cloud
   node keep-bridge-alive.js
   ```
   Keep this running in background on your dev machine
   
   **Option B: EasyCron** (FREE, recommended for production)
   - Go to https://www.easycron.com
   - Create new cron job
   - URL: `https://beeline.works/api/bridge/health`
   - Interval: Every 10 minutes
   - Status: Will ping bridge every 10 min, keeping it awake

   **Option C: Render Cron** (if available on paid plan)
   - Deploy keep-bridge-alive.js as scheduled job
   - Run every 10 minutes

2. **Update Frontend** (Signup Page)
   ```typescript
   import { useBridgeAvailable } from '@/lib/hooks/use-bridge-available'
   
   const SignupForm = () => {
     const { ensureBridgeAwake, isChecking } = useBridgeAvailable()
     
     const handleSubmit = async (phone) => {
       setLoading(true)
       const ready = await ensureBridgeAwake()
       
       if (!ready) {
         setError('Service starting, please try again...')
         return
       }
       
       // Submit phone signup
       submitPhoneSignup(phone)
     }
     
     return (
       <form onSubmit={handleSubmit}>
         <input type="tel" placeholder="+233..." />
         <button disabled={isChecking}>
           {isChecking ? 'Starting service...' : 'Get WhatsApp QR'}
         </button>
       </form>
     )
   }
   ```

---

## User Experience Timeline

### Scenario: Client Signs Up

**Timeline (with keep-alive):**
```
T+0:00   Client clicks "Scan WhatsApp"
T+0:10   Frontend pings /api/bridge/health
         Bridge is awake (keep-alive ran 2 min ago) ✅
T+0:15   POST /api/auth/initiate-whatsapp
         Bridge generates QR immediately
T+0:20   QR displayed to user ✅
```

**Result:** 20 seconds total (good UX)

---

**Scenario WITHOUT keep-alive:**
```
T+0:00   Client clicks "Scan WhatsApp"
T+0:05   Frontend pings /api/bridge/health
         Bridge is sleeping ❌
         Starts wake-up sequence
T+0:10   Retry #1: Still waking...
T+0:20   Retry #2: Almost there...
T+0:40   Retry #3: Bridge is finally awake ✅
T+0:45   POST /api/auth/initiate-whatsapp
         Generate QR
T+1:00   QR displayed to user ⚠️ (60 seconds - bad UX)
```

**Result:** 60 seconds total (poor UX)

---

## Monitoring & Debugging

### Check Bridge Status
```bash
curl https://beeline-bridge.onrender.com/health
```

### Check Keep-Alive
```bash
# If running locally
tail -f keep-alive.log

# If using EasyCron
# Check "Execution Log" in EasyCron dashboard
```

### Frontend Health Endpoint
```bash
curl https://beeline.works/api/bridge/health
```

Expected response:
```json
{
  "status": "available",
  "bridge": {
    "status": "healthy",
    "vendors": 0,
    "maxVendors": 75
  },
  "checkedAt": "2025-12-09T11:15:30.123Z"
}
```

---

## Production Checklist

- [ ] Deploy `keep-bridge-alive.js` as cron job (EasyCron)
- [ ] Verify cron job runs every 10 minutes
- [ ] Update signup page to use `useBridgeAvailable` hook
- [ ] Test signup flow with bridge awake
- [ ] Test signup flow with fresh bridge start (stop keep-alive for 20 min)
- [ ] Monitor `/api/bridge/health` endpoint for errors
- [ ] Add alerting if keep-alive cron fails

---

## Cost Impact

| Component | Cost | Notes |
|-----------|------|-------|
| Render Bridge | Free | Sleeps after 15 min inactivity |
| EasyCron Keep-Alive | Free | 100+ free API calls/month |
| Keep-Alive Service | $0 | Just HTTP GET requests |
| **Total** | **$0** | Zero additional cost |

---

## Alternative: Upgrade Render Plan

If reliability is critical:

| Plan | Cost | Cold Sleep | Benefit |
|------|------|-----------|---------|
| Free | $0 | 15 min | Current |
| Starter | $7/month | Never | No cold starts |
| Pro | $12/month | Never | Always hot |

**Recommendation:** Start with free + EasyCron keep-alive. Upgrade to Starter ($7/mo) only if keep-alive fails or you want guaranteed <1s response times.

---

## Summary

✅ **With Keep-Alive + Pre-Flight Checks:**
- Bridge always awake (keep-alive pings every 10 min)
- Client gets instant feedback (pre-flight check)
- Request completes in 15-20 seconds
- Professional user experience

🔄 **How It Works:**
1. EasyCron hits `/api/bridge/health` every 10 min (free)
2. Bridge wakes up, stays awake
3. Client signs up → instant QR generation
4. Zero additional cost

**Next Step:** Set up EasyCron cron job pointing to `https://beeline.works/api/bridge/health`
