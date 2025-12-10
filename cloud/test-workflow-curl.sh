#!/bin/bash

# Simple curl test for n8n workflow
echo "🧪 Testing n8n Workflow..."
echo "URL: https://n8n-latest-4dbq.onrender.com/webhook/whatsapp"
echo ""

# Test payload
PAYLOAD='{
  "message": "Hello, my name is Joshua",
  "channel": "whatsapp",
  "conversationHistory": [],
  "vendor": {
    "name": "Test Business",
    "businessType": "general"
  },
  "timestamp": '$(date +%s)'
}'

echo "📤 Sending payload:"
echo "$PAYLOAD"
echo ""
echo "📥 Response:"

# Make the request
curl -s -X POST https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | jq . 2>/dev/null || curl -s -X POST https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo ""
echo "✅ If you see a JSON response with 'reply' field, the workflow is working!"
echo "❌ If you see an error or HTML, check the workflow in n8n UI."