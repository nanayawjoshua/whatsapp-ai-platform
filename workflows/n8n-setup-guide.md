# n8n Setup Guide: WhatsApp → Groq AI → Response

## Step 1: Access n8n

1. Open browser: **http://localhost:5678**
2. Login:
   - Username: `admin`
   - Password: `CarWash2025!Secure`

You should see the n8n dashboard.

---

## Step 2: Add Groq Credentials

Before creating workflows, add your Groq API key:

1. Click your profile icon (top right) → **Settings**
2. Go to **Credentials** tab
3. Click **+ Add Credential**
4. Search for **"HTTP Header Auth"**
5. Fill in:
   - **Name**: `Groq API Key`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer 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`
6. Click **Save**

---

## Step 3: Create Your First Workflow

### Workflow: Simple WhatsApp → Groq Echo Bot

This workflow receives WhatsApp messages and responds with Groq AI.

#### Node 1: Webhook Trigger

1. Click **+ Add Node** (or press Tab)
2. Search for **"Webhook"**
3. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `whatsapp`
   - **Respond**: `Using 'Respond to Webhook' Node`
4. **Copy the webhook URL** (you'll see it like: `http://localhost:5678/webhook/whatsapp`)
5. Save the node

#### Node 2: Extract Message Data

1. Add node → **Code** → **"Run Once for All Items"**
2. Paste this code:

```javascript
// Extract WhatsApp message data
const input = $input.all()[0].json;

return {
  json: {
    customerPhone: input.phone,
    customerMessage: input.message,
    from: input.from,
    timestamp: input.timestamp
  }
};
```

3. Connect Webhook node to this Code node

#### Node 3: Call Groq API

1. Add node → **HTTP Request**
2. Configure:
   - **Method**: `POST`
   - **URL**: `https://api.groq.com/openai/v1/chat/completions`
   - **Authentication**: Select the "Groq API Key" credential you created
   - **Send Body**: ✅ Enabled
   - **Body Content Type**: `JSON`
   - **Specify Body**: `Using JSON`
   - **JSON Body**:

```json
{
  "model": "llama-3.1-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant for a supermarket in Ghana. Help customers order products via WhatsApp. Be friendly, concise, and professional. Always confirm what the customer wants before proceeding."
    },
    {
      "role": "user",
      "content": "={{ $json.customerMessage }}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

3. Connect Code node to HTTP Request node

#### Node 4: Extract AI Response

1. Add node → **Code** → **"Run Once for All Items"**
2. Paste this code:

```javascript
// Extract Groq AI response
const groqResponse = $input.all()[0].json;
const aiMessage = groqResponse.choices[0].message.content;

return {
  json: {
    response: aiMessage,
    model: groqResponse.model,
    usage: groqResponse.usage
  }
};
```

3. Connect HTTP Request node to this Code node

#### Node 5: Respond to Webhook

1. Add node → **Respond to Webhook**
2. Configure:
   - **Respond With**: `JSON`
   - **Response Body**: Click "Add Field" and select "Use Expression"
   - **Expression**:

```javascript
{
  "success": true,
  "response": "={{ $json.response }}",
  "phone": "={{ $('Extract Message Data').item.json.customerPhone }}",
  "timestamp": "={{ $now }}"
}
```

3. Connect the Extract AI Response node to this node

---

## Step 4: Save & Activate Workflow

1. Click **Save** (top right)
2. Name it: `WhatsApp Groq AI Agent`
3. Click the **Active** toggle (turn it ON - should be green)

---

## Step 5: Test the Workflow

### Method 1: Test with n8n's Test Feature

1. Click the **Webhook** node
2. Click **Listen for Test Event**
3. In another terminal, send a test request:

```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from": "233241234567@s.whatsapp.net",
    "phone": "233241234567",
    "message": "Hello, I need help ordering products",
    "timestamp": "2025-01-15T14:30:00Z"
  }'
```

4. Check n8n - you should see the workflow execute!
5. Check the response - it should contain Groq's AI reply

### Method 2: Test with WhatsApp (Full Integration)

1. In backend terminal: `npm start`
2. Scan QR code with your WhatsApp
3. Send a message to your WhatsApp Business number
4. Watch the magic happen! ✨

---

## Troubleshooting

### Workflow Not Executing

- ✅ Check workflow is **Active** (green toggle)
- ✅ Verify webhook URL in `backend/.env` matches n8n webhook
- ✅ Check n8n logs: `docker logs -f car-wash-n8n`

### Groq API Errors

- ✅ Verify API key is correct in credentials
- ✅ Check you have Groq credits (free tier: 14,400 requests/day)
- ✅ Test API key directly:
  ```bash
  curl https://api.groq.com/openai/v1/models \
    -H "Authorization: Bearer YOUR_API_KEY"
  ```

### Backend Can't Reach n8n

- ✅ Check n8n is running: `docker ps`
- ✅ Verify n8n is on port 5678: http://localhost:5678
- ✅ Check firewall isn't blocking localhost

---

## Next Steps

### Add More Features:

1. **Product Search** (query Google Sheets)
2. **Cart Management** (save customer orders)
3. **Payment Confirmation** (update order status)
4. **Delivery Tracking** (send automated updates)

### Advanced Workflows:

- **Intent Detection** (route to different workflows)
- **Conversation Memory** (remember past messages)
- **Multi-tenant** (serve multiple businesses)

---

## Workflow Visualization

```
┌─────────────────┐
│  WhatsApp Msg   │
│  from Customer  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  n8n Webhook    │  ← Receives POST from backend
│  Trigger        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract Data   │  ← Parse customer message
│  (Code Node)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Call Groq AI   │  ← Send to Llama 3.1 70B
│  (HTTP Request) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract Reply  │  ← Get AI response
│  (Code Node)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Response  │  ← Reply to webhook
│  to Webhook     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend sends  │
│  to WhatsApp    │
└─────────────────┘
```

---

## Cost Tracking

Each message costs approximately:

- **Groq Llama 3.1 70B**: ~$0.0001 per message
- **n8n**: $0 (self-hosted)
- **WhatsApp**: $0 (using Baileys)

**Total: ~$0.0001 per customer conversation**

At 1,000 messages/day: **$3/month**
At 10,000 messages/day: **$30/month**

Compare to ChatGPT API: **$150-300/month** for same volume!

---

## You're Ready! 🚀

Your setup:
- ✅ n8n running locally
- ✅ Groq API connected
- ✅ WhatsApp backend ready
- ✅ First workflow built

Now start the backend (`npm start` in backend folder) and test with a real WhatsApp message!
