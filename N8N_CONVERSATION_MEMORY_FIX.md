# Fix: n8n Conversation Memory Not Working

**Problem:** AI doesn't remember previous messages. Every response is generic without context.

**Root Cause:** n8n workflow not using `conversationHistory` sent by bridge.

**Status:** Bridge sends history correctly → n8n ignores it

---

## 🔧 Step-by-Step Fix for n8n Workflow

Access your n8n at: **http://localhost:5678** (local) or Render URL (production)

### Step 1: Open Your WhatsApp Workflow

1. Click **Workflows** in top menu
2. Find and open your WhatsApp workflow (usually called "WhatsApp" or "Webhook")
3. Look for these nodes:
   - **Webhook** (incoming messages)
   - **Code** or **HTTP Request** (Groq call)
   - **Respond to Webhook** (response)

---

### Step 2: Add/Update the Code Node (Before Groq Call)

**If no Code node exists:**
1. Click **+ Node** between Webhook and Groq HTTP Request
2. Search for **"Code"**
3. Select it → click to add

**Node configuration:**
- **Language:** JavaScript
- **Execution Type:** Run Once for All Items

**Paste this code:**

```javascript
// Extract conversation history and build messages array
const input = $input.all()[0].json;
const history = input.conversationHistory || [];
const currentMessage = input.message;
const vendorId = input.vendorId;
const customerId = input.customerId;

// Build messages array for Groq
const messages = [
  {
    role: "system",
    content: `You are a helpful customer service AI for a business in Ghana.
- Remember all previous messages in this conversation
- Be friendly, helpful, and professional
- Answer questions based on conversation context
- If customer asks "what did I say earlier?", refer back to previous messages
- Keep responses concise (under 100 words)
- If you don't know, say "I'll connect you with the owner"`
  },
  ...history  // Spread existing conversation (from user or previous AI)
];

return {
  json: {
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: 0.7,
    max_tokens: 500,
    // Pass along metadata for logging
    vendorId: vendorId,
    customerId: customerId,
    historyLength: history.length
  }
};
```

**Connect:**
- Input: From **Webhook** node
- Output: To **Groq HTTP Request** node

---

### Step 3: Update Groq HTTP Request Node

**Configuration:**
- **Method:** POST
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Authentication:** Select your Groq credentials
- **Body Type:** JSON

**Body (CRITICAL - use expression NOT hardcoded JSON):**

```json
{{ $json }}
```

⚠️ **IMPORTANT:** Just use `{{ $json }}` - NOT the full hardcoded message object. This makes it use the Code node's output.

---

### Step 4: Extract Response (Code Node #2)

**Before "Respond to Webhook" node, add another Code node:**

```javascript
// Extract AI response from Groq
const response = $input.all()[0].json;
const aiMessage = response.choices[0].message.content;
const vendorId = $input.all()[0].json.vendorId;
const customerId = $input.all()[0].json.customerId;

return {
  json: {
    reply: aiMessage,
    vendorId: vendorId,
    customerId: customerId,
    model: response.model,
    usage: response.usage
  }
};
```

---

### Step 5: Update Respond to Webhook Node

**Configuration:**
- **Respond With:** Text (NOT JSON)
- **Response Body:** 

```
{{ $json.reply }}
```

---

### Step 6: Test It!

1. **Save workflow** (⌘S / Ctrl+S)
2. **Activate** (toggle green switch at top)
3. **Send test webhook:**

```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test_hospital",
    "customerId": "233501234567@s.whatsapp.net",
    "message": "My name is Joshua",
    "conversationHistory": [
      {"role": "user", "content": "My name is Joshua"}
    ]
  }'
```

4. **Second message (should remember name):**

```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test_hospital",
    "customerId": "233501234567@s.whatsapp.net",
    "message": "What is my name?",
    "conversationHistory": [
      {"role": "user", "content": "My name is Joshua"},
      {"role": "assistant", "content": "Hello! Joshua is a great name."}
    ]
  }'
```

Expected response: AI should mention "Joshua" from previous message!

---

## ✅ What This Fixes

| Before | After |
|--------|-------|
| ❌ "Hello, I'm here to help" (every time) | ✅ "Hi Joshua, what can I do for you?" |
| ❌ Asks for customer name repeatedly | ✅ Remembers name from first message |
| ❌ No context from previous messages | ✅ References earlier parts of conversation |
| ❌ Can't answer "what did I ask?" | ✅ Knows full conversation history |

---

## 🔍 Troubleshooting

### Symptom: Still getting generic responses

**Check:**
1. Is `conversationHistory` empty in n8n logs?
   - Bridge might not be sending it → Check cloud/.env has N8N_WEBHOOK_URL
   
2. Is Code node executing?
   - Click Code node → Run execution to see output
   - Should show `historyLength: X` in output
   
3. Is Groq node using Code output?
   - Body should be `{{ $json }}` NOT hardcoded JSON
   - Run execution → should show messages array with history

### Symptom: n8n says "Expression not valid"

**Fix:**
- Don't quote the expression: ✅ `{{ $json }}` NOT ❌ `"{{ $json }}"`
- Set Body Type to "JSON" before entering expressions

### Symptom: History shows but AI ignores it

**Check Groq prompt:**
- System message must explicitly say "remember previous messages"
- Test with direct Groq API call with sample history

---

## 🚀 Verification Checklist

- [ ] Code node #1 builds messages array with history
- [ ] Groq body is `{{ $json }}`
- [ ] Code node #2 extracts AI response
- [ ] Respond to Webhook outputs plain text
- [ ] Test curl shows AI remembers context
- [ ] Deploy to production (if on Render)

---

## 📊 Monitor Conversation Flow

Check n8n logs to verify:
```
Input → Code #1 → Groq API → Code #2 → Respond to Webhook
  ✓ history received
        ✓ messages built
                   ✓ response parsed
                              ✓ text extracted
```

All arrows should show green execution.
