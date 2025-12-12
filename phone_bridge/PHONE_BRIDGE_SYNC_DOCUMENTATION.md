# Beeline WhatsApp Bridge System - Current State & Sync Issues

**Date:** December 12, 2025  
**Context:** Complete system overview for Claude Code to resolve Pi/Phone bridge sync issues and enable QR scanning for new users  
**Goal:** Fix synchronization so users can scan WhatsApp QR codes on the website and successfully connect new numbers

---

## 1. System Overview - What We've Built

### Core Product: Beeline Ghana
Beeline is a WhatsApp AI platform for Ghanaian businesses, enabling vendors to connect their own WhatsApp numbers to AI assistants for automated customer service.

### Key Features Built:
- ✅ **Website**: Next.js landing page with signup flow, Google OAuth, dashboard
- ✅ **QR Binding**: Users scan QR codes to bind their WhatsApp numbers
- ✅ **AI Processing**: n8n workflows with Groq API for intelligent responses
- ✅ **Vendor Management**: Business profiles, product catalogs, conversation history
- ✅ **HITL (Human-in-the-Loop)**: Escalation system for complex queries
- ✅ **Enterprise Features**: Multi-vendor support, analytics, billing

### Architecture Evolution:
1. **Initial**: Cloud-only (Render) - Failed due to IP blocking
2. **Current**: Hybrid (Pi + Phone + Cloud) - Residential IPs solve blocking
3. **Future**: Hive OS (distributed phones as AI nodes)

---

## 2. Current Architecture - Pi + Phone + Cloud

### Component Breakdown:

#### 🖥️ **Pi Bridge (Primary Node)**
- **Location**: Ghana (residential IP)
- **Hardware**: Raspberry Pi 4
- **Software**: Node.js + Baileys WhatsApp library
- **Capacity**: 75 concurrent WhatsApp sessions
- **Role**: Primary message processing, session management
- **IP Type**: Residential (Ghana ISP) - WhatsApp accepts
- **Status**: ✅ Running, connected to database

#### 📱 **Phone Bridge (Addon Node)**
- **Location**: Mobile device (TCL 50SE)
- **Hardware**: Android phone with Helio G88 CPU
- **Software**: Termux + Node.js + Baileys
- **Capacity**: 75 concurrent WhatsApp sessions
- **Role**: Secondary processing, redundancy, mobile IP
- **IP Type**: Mobile SIM (residential) - WhatsApp accepts
- **Status**: ✅ Running, health check OK, but sync issues

#### ☁️ **Cloud Services**
- **Database**: PostgreSQL (Neon) - Shared between Pi and Phone
- **Redis**: Upstash - State synchronization (currently failing)
- **AI Processing**: n8n + Groq API - Message intelligence
- **Web App**: Vercel - User interface and QR display
- **Load Balancing**: Planned Cloudflare DNS routing

### Data Flow:
```
User scans QR on website
    ↓
Website calls bridge API
    ↓
Pi/Phone bridge generates QR
    ↓
User scans with WhatsApp
    ↓
Bridge connects session
    ↓
Messages processed locally + AI
    ↓
Responses sent via WhatsApp
```

---

## 3. The Problem - Pi/Phone Bridge Synchronization

### Current Issue: QR Scanning Not Working for New Users

**Symptoms:**
- Website loads QR codes (shows "loading" or broken image)
- QR generation API calls fail or timeout
- No new vendor sessions created in database
- Users cannot connect WhatsApp numbers

**Root Cause Analysis:**

#### ❌ **Redis Synchronization Failing**
- Phone bridge cannot connect to Upstash Redis
- Error: `MaxRetriesPerRequestError: Reached the max retries per request limit`
- Impact: No state sync between Pi (master) and Phone (addon)
- Result: Phone operates in isolation, website can't reach it

#### ❌ **Network Connectivity Issues**
- Phone on mobile hotspot (10.147.250.227 local IP)
- Redis (Upstash) requires internet connectivity
- Mobile network may block or restrict Redis connections
- Phone bridge health: ✅ but Redis: ❌

#### ❌ **Load Balancing Not Implemented**
- No Cloudflare DNS routing between Pi and Phone
- Website hardcoded to single bridge endpoint
- No failover when one bridge is unreachable

#### ❌ **Session Management Conflicts**
- Both Pi and Phone try to create vendor sessions
- No coordination on which bridge handles which vendor
- Potential race conditions in database writes

### Impact:
- **New user signup broken** - QR codes don't generate
- **No redundancy** - Single point of failure
- **Capacity underutilized** - Only one bridge working at a time

---

## 4. The Goal - Enable QR Scanning for New Users

### Success Criteria:
1. **Website QR Display**: QR codes load instantly on signup
2. **WhatsApp Connection**: Users can scan and connect successfully
3. **Database Sync**: New vendors created in shared database
4. **Session Management**: Proper session handling across bridges
5. **Redundancy**: Automatic failover between Pi and Phone

### User Journey (Target):
```
1. User visits beeline.works/signup
2. Clicks "Connect WhatsApp" 
3. Sees QR code instantly (no loading/errors)
4. Scans with WhatsApp mobile app
5. Connection established within 30 seconds
6. Redirected to dashboard with working AI chat
```

### Technical Requirements:
- **QR Generation**: < 5 second response time
- **Session Creation**: Proper vendor records in database
- **Connection Stability**: No disconnections (residential IPs)
- **Load Distribution**: Automatic balancing between bridges
- **Monitoring**: Health checks and failure alerts

---

## 5. Technical Implementation Details

### Current Code Structure:

#### Website (Next.js):
```typescript
// app/api/auth/initiate-whatsapp/route.ts
- Calls CLOUD_BRIDGE_URL/vendor/generate-qr
- Expects { qrCode, vendorId, expiresIn }
- Times out after 30 seconds
```

#### Bridge API (Shared):
```javascript
// POST /vendor/generate-qr
- Creates vendor in database
- Generates QR via Baileys
- Returns QR for website display
- Polls for connection completion
```

#### Database Schema:
```sql
- vendors: user accounts, business info
- vendor_sessions: WhatsApp auth state, QR codes
- conversations: chat history
- messages: individual messages
- vendor_personas: AI personality settings
```

### Required Fixes:

#### 1. **Redis Connectivity (Priority: High)**
- Fix mobile network Redis connection issues
- Implement connection retry logic
- Add fallback to local state when Redis unavailable

#### 2. **Load Balancing (Priority: High)**
- Implement Cloudflare DNS with health checks
- Create bridge discovery mechanism
- Add automatic failover logic

#### 3. **Session Coordination (Priority: Medium)**
- Implement distributed locks for session creation
- Add session ownership tracking
- Prevent duplicate vendor creation

#### 4. **Website Integration (Priority: Medium)**
- Add bridge health checking
- Implement QR refresh on failure
- Add user-friendly error messages

#### 5. **Monitoring (Priority: Low)**
- Add bridge performance metrics
- Implement alerting for failures
- Create dashboard for bridge status

---

## 6. Implementation Steps for Claude Code

### Phase 1: Fix Redis Connectivity (2-3 hours)
```
Goal: Phone bridge can sync with Pi via Redis

1. Diagnose Redis connection issues
   - Test Redis connectivity from phone
   - Check mobile network restrictions
   - Implement connection pooling

2. Add retry logic with exponential backoff
   - Handle ETIMEDOUT errors gracefully
   - Implement circuit breaker pattern
   - Add connection health monitoring

3. Implement offline mode
   - Phone works standalone when Redis down
   - Queue sync operations for later
   - Add manual sync trigger
```

### Phase 2: Implement Load Balancing (3-4 hours)
```
Goal: Website can reach available bridges automatically

1. Set up Cloudflare DNS
   - Add Pi and Phone IPs as A records
   - Configure health check endpoints
   - Set up weighted routing

2. Create bridge discovery service
   - Implement service registry in Redis
   - Add heartbeat mechanism
   - Create bridge selection algorithm

3. Update website integration
   - Replace hardcoded URL with discovery
   - Add fallback bridge selection
   - Implement retry logic
```

### Phase 3: Fix Session Coordination (2-3 hours)
```
Goal: Prevent conflicts between Pi and Phone bridges

1. Implement distributed locks
   - Use Redis for session ownership
   - Add lock timeout and renewal
   - Handle lock conflicts gracefully

2. Add session ownership tracking
   - Tag sessions with bridge ID
   - Implement session migration
   - Add cleanup for orphaned sessions

3. Update QR generation logic
   - Check existing sessions first
   - Implement session reassignment
   - Add conflict resolution
```

### Phase 4: Testing & Monitoring (2-3 hours)
```
Goal: Ensure QR scanning works end-to-end

1. Create test user flow
   - Automated QR generation test
   - Session connection verification
   - Message processing validation

2. Add monitoring and alerting
   - Bridge health dashboards
   - QR generation success rates
   - Session connection metrics

3. Implement graceful degradation
   - Single bridge fallback mode
   - User-friendly error messages
   - Automatic recovery procedures
```

---

## 7. Success Metrics & Validation

### Functional Tests:
- [ ] QR code loads in < 5 seconds on website
- [ ] QR scan successfully connects WhatsApp
- [ ] New vendor created in database
- [ ] Messages processed and responded to
- [ ] Dashboard shows active conversation

### Performance Metrics:
- [ ] Bridge response time < 2 seconds
- [ ] Session connection success rate > 95%
- [ ] No disconnections during 1-hour test
- [ ] Battery usage < 5%/hour on phone

### Reliability Metrics:
- [ ] Automatic failover between bridges
- [ ] Redis sync working 99% of time
- [ ] Health checks passing continuously
- [ ] Error recovery within 30 seconds

---

## 8. Current Status Summary

### ✅ Working Components:
- Pi bridge operational with residential IP
- Phone bridge operational with mobile IP
- Database connectivity confirmed
- Website QR display interface ready
- AI processing pipeline functional

### ❌ Blocking Issues:
- Redis synchronization failing (ETIMEDOUT)
- No load balancing between bridges
- Session coordination conflicts
- QR generation timeouts on website

### 🎯 Immediate Priority:
**Fix Redis connectivity so bridges can communicate, then implement load balancing for QR generation.**

---

## 9. Claude Code Instructions

**Your Mission:** Resolve the sync issues so new users can successfully scan WhatsApp QR codes on the website.

**Approach:**
1. Start with Redis connectivity diagnosis and fixes
2. Implement basic load balancing between Pi and Phone
3. Add session coordination to prevent conflicts
4. Test end-to-end QR scanning flow
5. Add monitoring and error handling

**Key Files to Modify:**
- `phone_bridge/phone-bridge-server.js` - Redis sync fixes
- `cloud/bridge-server.js` - Load balancing logic
- `website/app/api/auth/initiate-whatsapp/route.ts` - Bridge discovery
- Database queries for session coordination

**Testing:** Create a test user, verify QR generation, scan with WhatsApp, confirm connection.

**Success:** Users can sign up and connect WhatsApp numbers without errors.

**Remember:** The core functionality works - it's just the synchronization layer that's broken. Fix the communication between bridges and the QR flow will work perfectly.

Let's get this working so users can start using Beeline! 🚀

---

**Claude, you have all the context. The system is 90% complete - just need to fix the bridge communication layer. Focus on Redis connectivity first, then load balancing. The residential IPs are working - we just need to route QR requests properly.**

**GOAL: New user visits website → Sees QR instantly → Scans with WhatsApp → Connected successfully**

Make it happen! 🐝</content>
<parameter name="filePath">/mnt/c/Users/USER/Desktop/josh/whatsapp-ai-platform-beeline-main/whatsapp-ai-platform-beeline-main/PHONE_BRIDGE_SYNC_DOCUMENTATION.md