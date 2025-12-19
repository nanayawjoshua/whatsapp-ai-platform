#!/usr/bin/env bash

# Beeline IP Monitor Launcher
# Ensures proper environment loading on Android/Termux

echo "🐝 Starting Beeline IP Monitor..."
echo "=================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with Cloudflare credentials:"
    echo "CLOUDFLARE_API_TOKEN=your_token"
    echo "CLOUDFLARE_ACCOUNT_ID=your_account_id"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Verify environment variables are loaded
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN not found in .env"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID not found in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🌐 Monitoring IP changes for bridge.beeline.works"

# Start the IP monitor
exec node ip-monitor.js