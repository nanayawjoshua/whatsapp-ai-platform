# How Vendor Persona Ties to n8n: Complete Architecture

## 🎯 The Flow (End-to-End)

```
Customer sends WhatsApp message
    ↓
Bridge loads vendor settings from database
    ↓
Bridge includes vendor config in n8n webhook payload:
  {
    vendorId: "hospital_123",
    message: "I need an appointment",
    conversationHistory: [...],
    vendor: {
      name: "City Hospital",
      businessType: "services",
      personalityTone: "professional",
      systemPromptOverride: null
    }
  }
    ↓
n8n Code Node receives vendor config
    ↓
Code Node builds PERSONALIZED system prompt:
  "You are a customer service AI for City Hospital, a service provider.
   Help customers book appointments...
   PERSONALITY & TONE: Be formal, precise, and efficient..."
    ↓
Code Node includes history + vendor-specific system prompt in messages array
    ↓
Messages array sent to Groq API:
  [
    { role: "system", content: "[personalized prompt based on vendor]" },
    { role: "user", content: "My name is Sarah" },
    { role: "assistant", content: "Hello Sarah, how can City Hospital help?" },
    { role: "user", content: "I need an appointment" }
  ]
    ↓
Groq generates response with vendor's personality
    ↓
n8n returns: "Certainly! I'd be happy to help you schedule an appointment at City Hospital..."
    ↓
Bridge sends response to customer
```

---

## 🔧 Implementation: Three Parts

### PART 1: Database Columns (Already Exist)

The `vendors` table needs these fields:
```sql
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS personality_tone VARCHAR(20) DEFAULT 'friendly';
-- Values: 'friendly', 'professional', 'casual', 'formal', 'energetic'

ALTER TABLE vendor_settings ADD COLUMN IF NOT EXISTS system_prompt_override TEXT;
-- Allows vendors to provide completely custom AI personality
```

**Status:** ✅ Likely already in migration

### PART 2: Bridge Server (IMPLEMENTED)

**File:** `cloud/bridge-server.js`

**What it does:**
1. Loads vendor settings from database with `getVendorSettings()`
2. Passes vendor config to n8n in the webhook payload:

```javascript
const payload = {
  vendorId,
  customerId,
  message,
  conversationHistory,
  vendor: {
    name: vendorSettings.businessName,
    businessType: vendorSettings.businessType,
    accountType: vendorSettings.accountType,
    personalityTone: vendorSettings.personalityTone,
    systemPromptOverride: vendorSettings.systemPrompt  // ← Custom prompt if set
  }
};

await axios.post(config.n8nWebhookUrl, payload);
```

**Status:** ✅ DONE (just updated)

### PART 3: n8n Workflow (MANUAL UPDATE NEEDED)

**File:** `workflows/n8n-persona-code-node.js` (reference code provided)

#### Step 1: Update the Code Node in n8n

Replace your existing Code node (before Groq call) with the code from `workflows/n8n-persona-code-node.js`

This Code node:
1. Extracts vendor config from the webhook payload
2. Generates personalized system prompt based on:
   - Business name + type
   - Personality tone (friendly, professional, etc.)
   - Custom override if vendor provided one
3. Includes conversation history
4. Returns messages array for Groq

#### Step 2: Verify Groq HTTP Request Node

Make sure the Groq node body is set to:
```
{{ $json }}
```

This uses the Code node's output (with personalized prompt).

#### Step 3: Test It

Send test request with vendor config:
```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "hospital_123",
    "customerId": "233501234567@s.whatsapp.net",
    "message": "I need an appointment",
    "conversationHistory": [],
    "vendor": {
      "name": "City Hospital",
      "businessType": "services",
      "personalityTone": "professional",
      "systemPromptOverride": null
    }
  }'
```

Expected: AI responds professionally as City Hospital assistant

---

## 📊 How It All Ties Together

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                                       │
│                                                             │
│ vendors table:                                              │
│ ├─ vendor_id: "hospital_123"                               │
│ ├─ name: "City Hospital"                                   │
│ ├─ business_type: "services"                               │
│ ├─ personality_tone: "professional"                        │
│ └─ account_type: "enterprise"                              │
│                                                             │
│ vendor_settings table:                                      │
│ ├─ vendor_id: "hospital_123"                               │
│ ├─ system_prompt_override: null (or custom text)           │
│ └─ ai_enabled: true                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Bridge loads settings
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BRIDGE (cloud/bridge-server.js)                             │
│                                                             │
│ 1. getConversationHistory(vendorId, customerId)            │
│    → Loads from Redis                                       │
│                                                             │
│ 2. getVendorSettings(vendorId)  ← NEW                      │
│    → Loads from database:                                   │
│      - name, businessType, personalityTone                  │
│      - systemPromptOverride                                 │
│                                                             │
│ 3. Creates payload with:                                    │
│    - vendor config + conversation history                  │
│    - Sends to n8n webhook                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ POST to n8n webhook
                   │ {
                   │   vendorId: "hospital_123",
                   │   message: "I need appointment",
                   │   conversationHistory: [...],
                   │   vendor: {
                   │     name: "City Hospital",
                   │     businessType: "services",
                   │     personalityTone: "professional"
                   │   }
                   │ }
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ n8n WORKFLOW                                                │
│                                                             │
│ 1. Webhook node receives payload                           │
│                                                             │
│ 2. Code Node (n8n-persona-code-node.js):                   │
│    ├─ Extract vendor config                                │
│    ├─ Generate personalized system prompt:                 │
│    │  "You are City Hospital service AI.                   │
│    │   Be professional and efficient..."                   │
│    ├─ Include conversation history                         │
│    └─ Return messages array                                │
│                                                             │
│ 3. HTTP Request to Groq API:                               │
│    ├─ Body: {{ $json }}                                    │
│    ├─ Sends: [system prompt, ...history]                  │
│    └─ Groq generates response with personality             │
│                                                             │
│ 4. Respond to Webhook:                                     │
│    └─ Returns AI response                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ AI response
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ BRIDGE (response handling)                                  │
│                                                             │
│ 1. Receives AI response from n8n                           │
│ 2. Saves to conversation history (Redis)                   │
│ 3. Sends to customer on WhatsApp                           │
│ 4. Response reflects vendor's personality ✅               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎭 Vendor Persona Examples

### Example 1: Friendly Retail Store

**Database:**
```sql
INSERT INTO vendors (vendor_id, name, business_type, personality_tone) 
VALUES ('store_123', 'Happy Market', 'retail', 'friendly');
```

**System Prompt Generated:**
```
You are a customer service AI for Happy Market, a retail business.
Help customers find products, answer questions about pricing...
PERSONALITY & TONE: Be warm, approachable, and conversational
```

**Example Response:**
- Customer: "Do you have milk?"
- AI: "Yes! 😊 We have fresh milk in the dairy section. Would you like to know about our current prices?"

---

### Example 2: Professional Hospital

**Database:**
```sql
INSERT INTO vendors (vendor_id, name, business_type, personality_tone) 
VALUES ('hospital_456', 'City Hospital', 'services', 'professional');
```

**System Prompt Generated:**
```
You are a customer service AI for City Hospital, a service provider.
Help customers book appointments, learn about services...
PERSONALITY & TONE: Be formal, precise, and efficient
```

**Example Response:**
- Customer: "Do you have dermatology?"
- AI: "Yes. City Hospital offers comprehensive dermatology services. To schedule a consultation, please provide your preferred date and time."

---

### Example 3: Custom Override

**Database:**
```sql
UPDATE vendor_settings 
SET system_prompt_override = 'You are a sarcastic but helpful coffee shop barista. Make jokes about coffee while helping customers order. Stay under 50 words.'
WHERE vendor_id = 'cafe_789';
```

**System Prompt Used:**
```
(The custom text from database)
```

**Example Response:**
- Customer: "Can I get a cappuccino?"
- AI: "Ah, finally someone with taste! ☕ One cappuccino coming right up. That'll be GHS 15. Want a pastry with that?"

---

## ✅ Verification Checklist

### Database Ready
- [ ] `vendors` table has `personality_tone` column
- [ ] `vendor_settings` table has `system_prompt_override` column
- [ ] Sample vendors have personality_tone set

### Bridge Ready
- [ ] `getVendorSettings()` loads vendor config
- [ ] Vendor config included in n8n payload
- [ ] Bridge logs show vendor name when processing

### n8n Ready
- [ ] Code node updated with persona logic
- [ ] Groq body is `{{ $json }}`
- [ ] Workflow activated

### Testing
- [ ] Send message with vendor config
- [ ] AI response uses vendor name
- [ ] Response matches personality tone
- [ ] Custom override works (if set)

---

## 🚀 How to Add a New Vendor

### Step 1: Create Vendor Record
```sql
INSERT INTO vendors (vendor_id, name, business_type, personality_tone, account_type)
VALUES (
  'bakery_789',
  'Sweet Breads Bakery',
  'retail',
  'friendly',
  'business'
);
```

### Step 2: Create Settings Record
```sql
INSERT INTO vendor_settings (vendor_id, ai_enabled, ai_silence_timeout)
VALUES ('bakery_789', true, 5);
```

### Step 3: Generate WhatsApp QR
```bash
curl -X POST https://bridge.example.com/vendor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "bakery_789",
    "vendorData": {
      "name": "Sweet Breads Bakery",
      "businessType": "retail",
      "accountType": "business"
    }
  }'
```

### Step 4: Vendor is Live!
- AI will automatically use their personality
- Conversation history is separate per vendor
- They can override system prompt anytime

---

## 🔄 Production Checklist

Before Monday hospital demo:

- [ ] Database columns exist (personality_tone, system_prompt_override)
- [ ] Bridge updated with getVendorSettings() changes ✅
- [ ] Bridge includes vendor config in n8n payload ✅
- [ ] n8n Code node updated with persona logic (manual)
- [ ] Test with hospital vendor config
- [ ] Monitor bridge logs for vendor data
- [ ] Verify AI uses correct personality

---

## 📝 Summary

**The binding:**
1. Vendor signs up → Creates vendor record with personality_tone
2. Bridge loads vendor config on each message
3. Bridge sends vendor config to n8n
4. n8n Code node generates personalized system prompt
5. Groq AI responds with vendor's personality
6. Customer sees vendor's unique voice

**Result:** Each AI agent has its own personality, tied to that vendor's configuration!
