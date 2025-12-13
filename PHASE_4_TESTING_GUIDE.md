# Phase 4.5: Local Testing Guide - Phone Bridge

## Overview

This guide walks through testing the phone bridge implementation locally before Android deployment.

**Time Required:** 30-45 minutes
**Requirements:** Node.js 18+, npm 9+, WhatsApp on any phone

---

## Prerequisites Checklist

- [ ] Groq API key configured in `.env.buzz` (line 19)
- [ ] Supabase credentials in `.env.buzz` (lines 7-9)
- [ ] Phone bridge code updated with message sending and conversation tracking
- [ ] Git changes committed and pushed to `buzz` branch
- [ ] Node.js v18+ installed: `node --version`
- [ ] npm 9+ installed: `npm --version`

---

## Test Sequence

### Test 1: Bridge Startup and Connection

**Objective:** Verify bridge starts correctly and generates QR code

**Steps:**

```bash
cd phone_bridge
npm install
npm start
```

**Expected Output:**
```
[timestamp] INFO: Connecting to WhatsApp...
[timestamp] INFO: 🐝 Beeline Phone Bridge running on port 3001
[timestamp] INFO: 📱 Phone Model: TCL_50SE
[timestamp] INFO: 🔌 Supabase: jwwuggvkjivrnbrlhpbc
[timestamp] INFO: 🤖 AI: Grok (via Groq)
[timestamp] INFO: QR code generated (scan with another WhatsApp)
```

**Verification:**
- [ ] No errors in startup logs
- [ ] QR code displayed in terminal (2D barcode)
- [ ] Port 3001 is listening

**Action:**
- Open WhatsApp on any Android phone
- Go to Settings → Linked devices → Link a device
- Scan the QR code shown in terminal
- Bridge should show: `✅ WhatsApp connected successfully`

---

### Test 2: Health Check Endpoint

**Objective:** Verify bridge API endpoints are responding

**Prerequisites:** Bridge running from Test 1

**Steps:**

In a new terminal:
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "phoneModel": "TCL_50SE",
  "whatsappConnected": true,
  "connectionState": "open",
  "uptime": 45.23,
  "timestamp": "2025-12-13T10:30:45.123Z"
}
```

**Verification:**
- [ ] `status` is `"healthy"`
- [ ] `whatsappConnected` is `true`
- [ ] `connectionState` is `"open"`
- [ ] No errors returned

---

### Test 3: QR Generation for Vendor Signup

**Objective:** Test the `/api/generate-qr` endpoint

**Prerequisites:** Bridge connected (Test 1)

**Steps:**

```bash
curl -X POST http://localhost:3001/api/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test-vendor-001",
    "vendorData": {
      "phone": "+233501234567",
      "name": "Test Vendor"
    }
  }'
```

**Expected Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "vendorId": "test-vendor-001",
  "expiresIn": 60
}
```

**Verification:**
- [ ] Response status is 200
- [ ] `qrCode` contains base64 image data (starts with "data:image/png;base64,")
- [ ] `vendorId` matches request
- [ ] `expiresIn` is 60 seconds

---

### Test 4: Incoming Message Processing

**Objective:** Test message reception and Grok classification

**Prerequisites:**
- Bridge connected to WhatsApp (Test 1)
- Vendor registered in Supabase (any phone number)

**Steps:**

1. **Register a vendor first:**
   - If not done already, visit http://localhost:3000/signup
   - Enter test phone: +233501234567
   - Note the vendor ID from Supabase

2. **Send message from connected phone:**
   - Send a WhatsApp message to the bridge's WhatsApp number
   - Message: "I want to sell my Samsung Galaxy S23 for 3000 cedis"

**Expected Bridge Logs:**
```
[timestamp] INFO: Message from +233501234567@s.whatsapp.net: I want to sell my Samsung Galaxy S23...
[timestamp] INFO: ✅ Sent message to +233501234567
[timestamp] INFO: Product upload from Test Vendor: Selling electronics (Samsung phone)...
```

**Verification in Supabase:**

Connect to Supabase dashboard and check `messages` table:
- [ ] New row created with vendor_id
- [ ] `conversation_id` is populated (format: `vendor-id:phone-digits`)
- [ ] `sender_phone` extracted correctly (digits only)
- [ ] `message_text` contains your message
- [ ] `message_type` is `"product_upload"`
- [ ] `metadata` contains classification with confidence score

**SQL Query to verify:**
```sql
SELECT
  vendor_id,
  conversation_id,
  sender_phone,
  message_text,
  message_type,
  metadata->>'confidence' as confidence
FROM messages
WHERE vendor_id = 'YOUR_VENDOR_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 5: Message Response (Automatic Replies)

**Objective:** Verify bridge sends automatic responses

**Prerequisites:** Bridge connected, previous message sent

**Steps:**

1. Check WhatsApp on the phone you scanned QR from
2. Look for messages from the bridge account

**Expected Messages:**

For product upload message:
```
✅ Product received! Thank you for listing with Beeline.
```

For buyer inquiry (send message: "Is it still available?"):
```
📩 New buyer inquiry received! Check your dashboard for details.
```

**Verification:**
- [ ] Received automatic response message
- [ ] Message appears immediately after sending (< 5 seconds)
- [ ] Response matches the classification type

---

### Test 6: Send Message Endpoint

**Objective:** Test the `/api/send-message` endpoint for dashboard integration

**Prerequisites:** Bridge connected

**Steps:**

```bash
curl -X POST http://localhost:3001/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+233501234567",
    "message": "Your product has been sold! Congratulations 🎉"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "phone": "+233501234567"
}
```

**Verification:**
- [ ] Response status is 200
- [ ] `success` is `true`
- [ ] Message received on WhatsApp within 5 seconds
- [ ] Phone number formatted correctly

---

### Test 7: Conversation Tracking

**Objective:** Verify conversation IDs group messages correctly

**Prerequisites:** Send multiple messages (Test 4, 5, 6)

**Steps:**

Check Supabase `messages` table:

```sql
SELECT
  conversation_id,
  sender_phone,
  message_text,
  message_type,
  created_at
FROM messages
WHERE vendor_id = 'YOUR_VENDOR_ID'
ORDER BY conversation_id, created_at;
```

**Expected Output:**
```
conversation_id       | sender_phone | message_text              | message_type
xxxx-xxxx:233...      | 233...       | I want to sell...         | product_upload
xxxx-xxxx:233...      | 233...       | Is it still available?    | buyer_inquiry
xxxx-xxxx:233...      | 233...       | Your product has been...  | other
```

**Verification:**
- [ ] All messages from same conversation have same `conversation_id`
- [ ] `sender_phone` is consistent within conversation
- [ ] Messages are grouped by conversation in dashboard query

---

### Test 8: Error Handling

**Objective:** Test bridge error handling

**Steps:**

1. **Test with missing parameters:**
   ```bash
   curl -X POST http://localhost:3001/api/send-message \
     -H "Content-Type: application/json" \
     -d '{"phone": "+233501234567"}'
   ```
   Expected: 400 error with message about missing "message" parameter

2. **Test with disconnected bridge:**
   - Stop the bridge (Ctrl+C)
   - Try health check: `curl http://localhost:3001/health`
   Expected: Connection refused error

3. **Test with invalid JSON:**
   ```bash
   curl -X POST http://localhost:3001/api/generate-qr \
     -H "Content-Type: application/json" \
     -d '{invalid json}'
   ```
   Expected: 400 error

**Verification:**
- [ ] Proper error messages returned
- [ ] No server crashes
- [ ] Bridge recovers after errors

---

## Performance Checks

### Message Processing Time

Send message and measure time from log to WhatsApp receipt:

**Target:** < 5 seconds
**Acceptable:** < 10 seconds

```bash
# Log timestamp when message received
# Check WhatsApp timestamp when response arrives
# Time difference should be < 5s
```

### Connection Stability

Let bridge run for 1 hour and check:
- [ ] No errors in logs
- [ ] Health check still returns `healthy`
- [ ] Can still send/receive messages
- [ ] Uptime increases correctly

---

## Debugging Common Issues

### Issue: "WhatsApp not connected" error

**Causes:**
- QR code not scanned properly
- Whatsapp account already logged in elsewhere
- Baileys version mismatch

**Solutions:**
1. Logout from other WhatsApp Web sessions
2. Delete `phone_bridge/auth_info` folder
3. Restart bridge and rescan QR code

### Issue: Messages not being received

**Causes:**
- Vendor not found in Supabase
- Phone number format mismatch
- RLS policy blocking queries

**Solutions:**
1. Verify vendor exists: `SELECT * FROM vendors WHERE phone = '+233...'`
2. Check phone format matches (with + prefix)
3. Ensure RLS policy allows queries

### Issue: Groq classification failing

**Causes:**
- Groq API key invalid
- Rate limit exceeded
- Network connectivity issue

**Solutions:**
1. Check API key in `.env.buzz`
2. Verify you have 30+ requests/minute available
3. Check internet connection

### Issue: Bridge crashes on startup

**Causes:**
- Port 3001 already in use
- Missing environment variables
- Node version too old

**Solutions:**
```bash
# Check port 8080 in use
lsof -i :3001

# Kill process using port
kill -9 <PID>

# Verify env vars
cat .env.buzz | grep SUPABASE

# Check Node version
node --version  # Should be >= 18.0.0
```

---

## Success Criteria (Pass All Tests)

✅ Test 1: Bridge starts and connects to WhatsApp
✅ Test 2: Health check returns healthy status
✅ Test 3: QR code generated for vendor signup
✅ Test 4: Messages received and classified by Groq
✅ Test 5: Automatic responses sent back via WhatsApp
✅ Test 6: Send message endpoint works from dashboard
✅ Test 7: Conversation IDs group messages correctly
✅ Test 8: Error handling works gracefully

---

## Next Steps After Passing Tests

Once all 8 tests pass locally:

1. **Task 4.6:** Deploy to Android with Termux + ngrok
   - Install Termux on TCL 50SE
   - Setup Node.js in Termux
   - Clone repo and run bridge
   - Create ngrok tunnel for public access

2. **Task 4.7:** End-to-end production test
   - Test vendor registration flow on Vercel
   - Verify Vercel can reach Android bridge via ngrok
   - Test full message flow in production

3. **Phase 5:** Integrate improvements
   - Image classification for product photos
   - Conversation context in prompts
   - Better classification accuracy

---

## Test Results Template

Save this for records:

```
Date: 2025-12-13
Tester: Joshua
Environment: Windows, Node 18.16.0

Test 1 (Startup):        ✅ PASS
Test 2 (Health):         ✅ PASS
Test 3 (QR Gen):         ✅ PASS
Test 4 (Messaging):      ✅ PASS
Test 5 (Responses):      ✅ PASS
Test 6 (Send API):       ✅ PASS
Test 7 (Conversations):  ✅ PASS
Test 8 (Errors):         ✅ PASS

Overall: ✅ READY FOR ANDROID DEPLOYMENT

Issues Found: None
Notes: All tests passed successfully
```

---

## Support

For debugging help:
1. Check bridge logs for error messages
2. Query Supabase directly to verify data
3. Review commit `cb8f23a` for code changes
4. Check plan file: `C:\Users\USER\.claude\plans\joyful-knitting-firefly.md`
