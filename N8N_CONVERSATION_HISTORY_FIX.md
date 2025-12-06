# Fix n8n Conversation History

## Problem
AI doesn't remember previous messages because n8n workflow isn't using the `conversationHistory` that the bridge server sends.

## What Bridge Server Sends

```json
{
  "vendorId": "vendor_123",
  "customerId": "233501234567@s.whatsapp.net",
  "message": "What's my name?",
  "channel": "whatsapp",
  "conversationHistory": [
    { "role": "user", "content": "My name is Joshua" },
    { "role": "assistant", "content": "Hello Joshua! How can I help you?" },
    { "role": "user", "content": "What's my name?" }
  ],
  "timestamp": 1733500000000,
  "aiReason": "New message"
}
```

## Current n8n Workflow (Probably)

Your n8n workflow probably looks like this:

```
Webhook → HTTP Request to Groq → Return Response
```

**HTTP Request to Groq currently:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant for {{$json.vendorId}}..."
    },
    {
      "role": "user",
      "content": "{{$json.message}}"
    }
  ]
}
```

**Problem:** Only sends the current message, no history!

## ✅ SOLUTION: Update n8n Workflow

### Step 1: Add a Code Node (Optional but Recommended)

Add a **Code** node between Webhook and HTTP Request to format the history:

```javascript
// Code node: Format Conversation History
const history = $input.item.json.conversationHistory || [];
const currentMessage = $input.item.json.message;
const vendorId = $input.item.json.vendorId;

// Build messages array for Groq
const messages = [
  {
    role: "system",
    content: `You are a helpful, professional AI assistant for a business in Ghana.

Your role is to:
- Answer customer questions professionally
- Help with appointments, pricing, and general inquiries
- Be friendly but professional
- Use proper grammar

Keep responses concise and helpful.`
  }
];

// Add conversation history
history.forEach(msg => {
  messages.push({
    role: msg.role,
    content: msg.content
  });
});

// Add current message
messages.push({
  role: "user",
  content: currentMessage
});

return {
  messages: messages,
  vendorId: vendorId
};
```

### Step 2: Update HTTP Request to Groq

**URL:** `https://api.groq.com/openai/v1/chat/completions`

**Method:** POST

**Authentication:** Bearer Token (your Groq API key)

**Body (JSON):**
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": {{ $json.messages }},
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Step 3: Return Response

Extract the AI response and return it:

```javascript
// Code node: Extract Response
const response = $input.item.json.choices[0].message.content;

return {
  reply: response
};
```

## 🚀 SIMPLER SOLUTION (No Code Node)

If you want to skip the Code node, use this in your HTTP Request:

**Body:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful, professional AI assistant for a business in Ghana."
    },
    {{ $json.conversationHistory }},
    {
      "role": "user",
      "content": "{{ $json.message }}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Note:** The `{{ $json.conversationHistory }}` will expand to an array of message objects.

## 📋 STEP-BY-STEP n8n UPDATE

1. **Open your n8n workflow**
   - Go to https://n8n-latest-4dbq.onrender.com (or wherever your n8n is)

2. **Find the Webhook node**
   - This receives the POST from bridge server

3. **Find the HTTP Request to Groq**
   - This is where you call the Groq API

4. **Update the HTTP Request Body**
   - Change from just current message to include history
   - Use one of the solutions above

5. **Test the workflow**
   - Click "Execute Workflow"
   - Send a test payload with history

6. **Activate the workflow**
   - Make sure it's active (toggle in top right)

## 🧪 TEST PAYLOAD

Use this to test your n8n workflow:

```json
{
  "vendorId": "test_hospital",
  "customerId": "233501234567@s.whatsapp.net",
  "message": "What's my name?",
  "channel": "whatsapp",
  "conversationHistory": [
    {
      "role": "user",
      "content": "My name is Joshua and I need an appointment"
    },
    {
      "role": "assistant",
      "content": "Hello Joshua! I'd be happy to help you book an appointment. What day works best for you?"
    },
    {
      "role": "user",
      "content": "What's my name?"
    }
  ],
  "timestamp": 1733500000000,
  "aiReason": "Test"
}
```

**Expected Response:**
```json
{
  "reply": "Your name is Joshua."
}
```

## ⚠️ COMMON MISTAKES

### Mistake 1: History in Wrong Format
❌ Wrong:
```json
"conversationHistory": "user: hello\nassistant: hi"
```

✅ Correct:
```json
"conversationHistory": [
  { "role": "user", "content": "hello" },
  { "role": "assistant", "content": "hi" }
]
```

### Mistake 2: Not Spreading the Array
❌ Wrong:
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    {{ $json.conversationHistory }},  // This creates nested array
    { "role": "user", "content": "..." }
  ]
}
```

✅ Correct (use spread operator):
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    ...{{ $json.conversationHistory }},  // Note the ...
    { "role": "user", "content": "..." }
  ]
}
```

### Mistake 3: Forgetting Current Message
The current message should NOT be in conversationHistory from bridge.
You must add it in n8n before sending to Groq.

## 🔍 DEBUGGING

### Check 1: Is history being sent from bridge?

Add this to your n8n webhook node output:

```javascript
// Debug: Log incoming data
console.log('Received payload:', $input.item.json);
console.log('History length:', $input.item.json.conversationHistory?.length || 0);

return $input.item.json;
```

### Check 2: Is Groq receiving history?

Look at the HTTP Request logs in n8n to see what's being sent.

### Check 3: Test with curl

```bash
curl -X POST https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test",
    "customerId": "233501234567@s.whatsapp.net",
    "message": "What did I say before?",
    "conversationHistory": [
      {"role": "user", "content": "I love pizza"},
      {"role": "assistant", "content": "That'\''s great! Pizza is delicious."}
    ]
  }'
```

## 📊 VERIFY IT'S WORKING

### Test Sequence:
1. Send: "My name is Joshua"
2. Send: "I need an appointment for Monday"
3. Send: "What's my name?"
   - ✅ Should respond: "Your name is Joshua"
4. Send: "What day did I want?"
   - ✅ Should respond: "You wanted an appointment for Monday"

### Check Redis:

```bash
# In cloud folder
node -e "
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL, { family: 4 });

redis.keys('history:*').then(keys => {
  console.log('History keys:', keys);
  if (keys.length > 0) {
    redis.get(keys[0]).then(data => {
      console.log('Sample history:', JSON.parse(data));
      redis.quit();
    });
  } else {
    console.log('No history found');
    redis.quit();
  }
});
"
```

## 🎯 FINAL CHECKLIST

- [ ] n8n workflow updated to include conversationHistory
- [ ] Tested with multi-turn conversation
- [ ] AI remembers previous messages
- [ ] Redis shows saved history
- [ ] Works with real WhatsApp messages

---

## 📞 NEED HELP?

If you're stuck, share:
1. Screenshot of your n8n workflow
2. The HTTP Request body you're using
3. Error messages from n8n logs
4. Test results from the curl command

---

**Once this is fixed, your AI will have proper conversation memory for the Monday demo!** 🎉
