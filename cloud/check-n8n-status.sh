#!/bin/bash
echo "🔍 n8n Workflow Status Check"
echo "=============================="
echo ""

# Check if n8n is responding
echo "1. Testing n8n service..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://n8n-latest-4dbq.onrender.com/health || echo "n8n service not responding"

echo ""
echo "2. Testing webhook endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://n8n-latest-4dbq.onrender.com/webhook/whatsapp || echo "Webhook not responding"

echo ""
echo "3. Testing with minimal payload..."
RESPONSE=$(curl -s -X POST https://n8n-latest-4dbq.onrender.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}')

if [[ $RESPONSE == *"reply"* ]]; then
  echo "✅ Workflow responding!"
  echo "Response: $RESPONSE"
else
  echo "❌ Workflow error:"
  echo "$RESPONSE"
fi