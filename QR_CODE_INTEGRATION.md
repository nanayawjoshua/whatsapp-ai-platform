# QR Code Integration - Complete Guide

**Date:** December 4, 2024
**Status:** ✅ Implementation Complete - Ready for Testing
**Integration:** Website → Cloud Bridge → Baileys WhatsApp

---

## 🎯 What We Built

Successfully integrated **real-time WhatsApp QR code generation** into the vendor signup flow, connecting the payment-enabled website to the cloud-based WhatsApp infrastructure.

### Architecture Flow

```
User pays GHS 99 (Paystack)
        ↓
Payment verified
        ↓
Website calls /api/vendor/generate-qr
        ↓
Proxies to Cloud Bridge /vendor/generate-qr
        ↓
Cloud Bridge creates Baileys WhatsApp session
        ↓
QR code generated and stored in PostgreSQL
        ↓
Website receives QR string
        ↓
Converts to displayable image (qrcode library)
        ↓
User scans with WhatsApp
        ↓
Connection status polled every 3 seconds
        ↓
AI employee goes LIVE! 🐝
```

---

## 📁 Files Created/Modified

### New Files

#### 1. `/website/app/api/vendor/generate-qr/route.ts`
**Purpose:** Proxy endpoint between website and cloud bridge
**Methods:**
- `POST` - Generate QR code for new vendor
- `GET` - Check connection status (TODO: needs cloud bridge endpoint)

**Request:**
```typescript
POST /api/vendor/generate-qr
{
  "vendorId": "payment_reference_123",
  "vendorData": {
    "name": "Kwame Mensah",
    "phone": "+233241234567",
    "email": "kwame@example.com",
    "businessType": "supermarket",
    "personality": "casual"
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "qrCode": "raw_qr_string_from_baileys",
  "vendorId": "payment_reference_123",
  "expiresIn": 60
}
```

#### 2. `/website/lib/qrcode-utils.ts`
**Purpose:** QR code utilities and helpers
**Functions:**
- `generateQRCodeImage(qrString)` - Convert raw QR to base64 image
- `generateQRCodeSVG(qrString)` - Convert to SVG
- `fetchVendorQRCode(vendorId, vendorData)` - Fetch and convert QR
- `checkVendorConnectionStatus(vendorId)` - Poll connection status

**Example Usage:**
```typescript
import { fetchVendorQRCode } from '@/lib/qrcode-utils';

const { qrCodeImage, expiresIn } = await fetchVendorQRCode(
  'vendor_123',
  { name: 'Kwame', phone: '+233...', ... }
);

// qrCodeImage is a data:image/png;base64,... URL
<img src={qrCodeImage} alt="Scan me" />
```

### Modified Files

#### 3. `/website/app/signup/page.tsx`
**Changes:**
- Added state: `qrCodeImage`, `isLoadingQR`, `qrError`, `isConnected`
- Added `generateVendorQRCode()` function - fetches QR after payment
- Added `startConnectionPolling()` - polls every 3s for WhatsApp connection
- Updated Step 4 UI to display real QR code with loading/error states
- Added retry button on QR generation failure

**User Experience:**
1. User completes payment (step 3)
2. Step 4 loads with "Generating QR Code..." spinner
3. QR appears in ~5-10 seconds
4. User scans with WhatsApp
5. Icon changes from ⏳ → ✓ and message says "Connected!"
6. QR fades to 30% opacity when connected

#### 4. `/website/package.json`
**Added Dependencies:**
- `qrcode: ^1.5.4` - Generate QR code images
- `@types/qrcode: ^1.5.5` - TypeScript types

#### 5. `/website/.env.local` & `.env.example`
**Added:**
```bash
# Cloud Bridge URL (WhatsApp Gateway Service)
CLOUD_BRIDGE_URL=http://localhost:3000  # For local testing
# CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com  # For production
```

---

## 🔧 Cloud Bridge (Already Existed!)

The cloud bridge server already had everything needed:

### Endpoint: `POST /vendor/generate-qr`
**Location:** `cloud/bridge-server.js` (lines 382-432)
**What it does:**
1. Creates initial session record in PostgreSQL
2. Calls `connectVendor(vendorId)` which initializes Baileys
3. Baileys generates QR code (saved to database)
4. Polls database for up to 30 seconds waiting for QR
5. Returns QR string to caller

**Request:**
```json
POST http://localhost:3000/vendor/generate-qr
{
  "vendorId": "payment_ref_123",
  "vendorData": { ... }
}
```

**Response:**
```json
{
  "qrCode": "2@BqFN...",  // Raw Baileys QR string
  "vendorId": "payment_ref_123",
  "expiresIn": 60
}
```

### Database Integration
**Table:** `vendor_sessions`
**Columns:**
- `vendor_id` - Primary key (payment reference)
- `session_data` - JSONB (Baileys credentials)
- `qr_code` - TEXT (the QR string)
- `status` - TEXT (initializing, waiting_for_scan, connected, logged_out)
- `last_active` - TIMESTAMP
- `created_at` - TIMESTAMP

**QR Storage Flow:**
```javascript
// When Baileys emits QR (bridge-server.js:203-208)
sock.ev.on('connection.update', async (update) => {
  const { qr } = update;

  if (qr) {
    await db.query(
      'UPDATE vendor_sessions SET qr_code = $1, status = $2 WHERE vendor_id = $3',
      [qr, 'waiting_for_scan', vendorId]
    );
  }
});
```

---

## 🚀 Deployment Instructions

### Step 1: Install Dependencies

```bash
cd website
npm install
```

This installs:
- `qrcode@^1.5.4`
- `@types/qrcode@^1.5.5`

### Step 2: Environment Variables

**For Local Testing:**
```bash
# website/.env.local
CLOUD_BRIDGE_URL=http://localhost:3000
```

**For Production (Vercel):**
Go to Vercel dashboard → beeline.works → Settings → Environment Variables:
```
CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com
```

### Step 3: Deploy Cloud Bridge (If Not Already)

```bash
# From project root
cd cloud

# Test locally first
npm install
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."
export N8N_WEBHOOK_URL="https://n8n-latest-4dbq.onrender.com/webhook/whatsapp"
npm start

# Should see:
# ✅ PostgreSQL connected
# ✅ Redis connected
# 🚀 Beeline Bridge Server running
```

**Deploy to Render:**
1. Push `cloud/` code to GitHub
2. Render dashboard → New → Web Service
3. Connect GitHub repo
4. Select `cloud/bridge-server.js` as start command
5. Add environment variables
6. Deploy

### Step 4: Test Locally

**Terminal 1: Start Cloud Bridge**
```bash
cd cloud
npm start
# Runs on http://localhost:3000
```

**Terminal 2: Start Website**
```bash
cd website
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3: Test QR Generation**
```bash
curl -X POST http://localhost:3000/vendor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"vendorId": "test_vendor_001"}'

# Should return QR code after 5-10 seconds:
# {"qrCode":"2@BqFN...","vendorId":"test_vendor_001","expiresIn":60}
```

**Test in Browser:**
1. Go to http://localhost:3001/signup
2. Fill steps 1-3 (use test payment in dev mode)
3. On step 4, QR should appear
4. Scan with WhatsApp on your phone
5. Watch for "Connected!" message

---

## 🧪 Testing Checklist

### Local Testing

- [ ] `npm install` in `/website` succeeds
- [ ] No TypeScript errors in `app/signup/page.tsx`
- [ ] No TypeScript errors in `lib/qrcode-utils.ts`
- [ ] Cloud bridge starts without errors
- [ ] Website dev server starts
- [ ] `/api/vendor/generate-qr` endpoint accessible
- [ ] QR generation endpoint returns QR string
- [ ] QR string converts to image successfully

### End-to-End Testing

- [ ] Complete signup steps 1-3
- [ ] Payment succeeds (use Paystack test mode first)
- [ ] Step 4 shows "Generating QR Code..." spinner
- [ ] QR code appears within 10 seconds
- [ ] QR code is scannable (not corrupted)
- [ ] Scan with WhatsApp app
- [ ] WhatsApp connects to Baileys session
- [ ] "Connected!" message appears
- [ ] Vendor can receive test messages
- [ ] Vendor can send test messages

### Error Handling Testing

- [ ] Cloud bridge down → shows error message
- [ ] QR generation timeout → shows retry button
- [ ] Invalid vendor ID → returns 400 error
- [ ] Server at capacity → returns 503 error
- [ ] Connection polling fails gracefully

### Production Testing (After Deploy)

- [ ] Vercel env vars configured
- [ ] Cloud bridge deployed to Render
- [ ] PostgreSQL and Redis connected
- [ ] HTTPS endpoints work
- [ ] Payment → QR flow works end-to-end
- [ ] Multiple vendors can sign up simultaneously
- [ ] Capacity limits respected (75 vendors per instance)

---

## 🔍 How Connection Polling Works

After QR is generated, the website polls every 3 seconds to check if WhatsApp was scanned:

```typescript
// In signup page
const startConnectionPolling = (vendorId: string) => {
  const pollInterval = setInterval(async () => {
    const status = await checkVendorConnectionStatus(vendorId);

    if (status.connected) {
      setIsConnected(true);
      clearInterval(pollInterval);  // Stop polling
    }
  }, 3000);  // Every 3 seconds

  // Stop after 5 minutes
  setTimeout(() => clearInterval(pollInterval), 300000);
};
```

**Future Enhancement:**
Replace polling with WebSocket or Server-Sent Events for real-time updates when vendor connects.

---

## 📊 Database Schema Used

```sql
-- vendor_sessions table (already exists in cloud/migrations/001_initial_schema.sql)

CREATE TABLE vendor_sessions (
  vendor_id TEXT PRIMARY KEY,
  session_data JSONB,           -- Baileys credentials
  qr_code TEXT,                  -- QR string for display
  status TEXT DEFAULT 'initializing',  -- initializing, waiting_for_scan, connected, logged_out
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example data after QR generation:
-- vendor_id: "paystack_ref_abc123"
-- session_data: {"creds": {...}, "keys": {...}}
-- qr_code: "2@BqFN..."
-- status: "waiting_for_scan"
```

---

## 🐛 Troubleshooting

### Problem: QR Code Not Appearing

**Symptoms:**
- Step 4 shows "Generating QR Code..." forever
- Console error: "Failed to fetch QR code"

**Solutions:**
1. Check cloud bridge is running: `curl http://localhost:3000/health`
2. Check `CLOUD_BRIDGE_URL` environment variable is set
3. Check cloud bridge logs for errors
4. Verify PostgreSQL is connected
5. Check vendor capacity (max 75 per instance)

**Debug:**
```bash
# Check cloud bridge health
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","vendors":0,"maxVendors":75,...}

# Test QR generation directly
curl -X POST http://localhost:3000/vendor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"test_001"}'
```

### Problem: QR Code Shows but Won't Scan

**Symptoms:**
- QR appears but WhatsApp says "Invalid QR code"
- QR image is corrupted or pixelated

**Solutions:**
1. Check QR string is not truncated in database
2. Verify `qrcode` library version (should be 1.5.4)
3. Check error correction level is set to 'H'
4. Ensure QR string is passed as-is (no JSON escaping issues)

**Debug:**
```typescript
// In lib/qrcode-utils.ts
console.log('Raw QR string length:', qrString.length);
console.log('QR string preview:', qrString.substring(0, 50));
```

### Problem: Connection Status Never Updates

**Symptoms:**
- QR scans successfully
- WhatsApp connects
- But website still shows ⏳ (not ✓)

**Solutions:**
1. Connection polling endpoint not implemented yet (see TODO below)
2. Workaround: Manual refresh after scanning
3. Implement `/vendor/status` endpoint in cloud bridge

**TODO:**
Add this endpoint to `cloud/bridge-server.js`:

```javascript
app.get('/vendor/status/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  try {
    const result = await db.query(
      'SELECT status FROM vendor_sessions WHERE vendor_id = $1',
      [vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const status = result.rows[0].status;
    const connected = status === 'connected';

    res.json({ vendorId, status, connected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Problem: Multiple QR Requests

**Symptoms:**
- User refreshes page
- Multiple Baileys sessions created for same vendor
- Database has duplicate entries

**Solutions:**
1. Cloud bridge already handles this with `ON CONFLICT DO NOTHING`
2. Disconnect old session before creating new one
3. Add idempotency key to requests

---

## 🔒 Security Considerations

### ✅ Already Implemented

1. **Server-Side QR Generation:** QR created in secure cloud environment, not client browser
2. **Payment Verification:** QR only generated after Paystack payment verification
3. **Vendor ID Uniqueness:** Uses payment reference as vendor ID (unique per transaction)
4. **Database Isolation:** Each vendor's session stored separately in PostgreSQL
5. **No QR Logging:** QR codes not logged to console in production

### ⚠️ TODO (Future Security Enhancements)

1. **Rate Limiting:** Limit QR generation requests per IP/user
2. **QR Expiration:** Expire QR codes after 60 seconds (Baileys default)
3. **Session Encryption:** Encrypt `session_data` JSONB in database
4. **Audit Logging:** Track all QR generation attempts
5. **CORS Configuration:** Restrict API access to beeline.works domain only

---

## 📈 Performance Metrics

### Expected Performance

**QR Generation Time:**
- Cold start (no existing session): 5-10 seconds
- Warm start (reconnecting): 2-3 seconds
- Timeout threshold: 30 seconds

**Database Queries Per Signup:**
1. Insert initial session record: 1 query
2. Poll for QR code (max 30 attempts): 30 queries
3. Update session on connection: 1 query
**Total:** ~32 queries per vendor

**Memory Usage Per Vendor:**
- Baileys session: ~40MB RAM
- QR code string: ~500 bytes
- Session data: ~2-5KB
**Total per vendor:** ~40MB

**Capacity:**
- 512MB Render instance: 75 vendors
- 1GB Render instance: 150 vendors

---

## 🎉 Success Criteria

### ✅ Implementation Complete

- [x] QR generation endpoint exists
- [x] Website proxies to cloud bridge
- [x] QR string converts to image
- [x] UI displays QR with loading states
- [x] Error handling implemented
- [x] Retry mechanism added
- [x] Connection polling started (basic)
- [x] Environment variables configured
- [x] Documentation written

### 🔄 Pending Testing

- [ ] Install npm packages
- [ ] Test local development
- [ ] Test QR scanning
- [ ] Test connection status updates
- [ ] Deploy to staging
- [ ] Test end-to-end in production
- [ ] Load test (multiple simultaneous signups)

### 🚀 Ready for Production

Once all testing passes:
- [ ] Deploy cloud bridge to Render
- [ ] Configure Vercel env vars
- [ ] Push website to production
- [ ] Monitor first 10 real signups
- [ ] Gather user feedback
- [ ] Iterate on UX improvements

---

## 📞 Next Steps

### Immediate (This Week)

1. **Install Dependencies:**
   ```bash
   cd website && npm install
   ```

2. **Test Locally:**
   - Start cloud bridge
   - Start website
   - Complete signup flow
   - Scan QR with test WhatsApp

3. **Fix Connection Status:**
   - Add `/vendor/status/:vendorId` endpoint to cloud bridge
   - Update website polling to use new endpoint

### Short Term (Next 2 Weeks)

1. **Deploy Cloud Bridge:** Get it running on Render with real database
2. **Production Testing:** Test with 5-10 real vendors
3. **Voice Note Recording:** Implement Web Audio API for step 2
4. **Product Catalog:** Integrate 708 products CSV

### Long Term (Next Month)

1. **Vendor Dashboard:** Build management portal
2. **Analytics:** Track QR scan success rate
3. **Subscription Management:** Integrate with Paystack recurring billing
4. **Scale Testing:** Test with 50+ simultaneous signups

---

**Status:** ✅ Ready for Testing
**Integration Complexity:** Medium
**Time to Complete:** ~3 hours (Done!)
**Next Blocker:** npm install + local testing

🐝🇬🇭 Let's make this work!
