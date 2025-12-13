#!/bin/bash

# PROJECT OS - Phase 1: Phone Bridge Setup Script
# Purpose: Install and configure Beeline bridge on Android phone via Termux
# Target: TCL 50SE (Android 9+, Helio G88, 6-12GB RAM)
# Cost: Free (uses existing phone)
# Time: 10-15 minutes

echo "🐝 Beeline Phone Bridge Setup"
echo "============================="
echo "Target: TCL 50SE (Addon Node)"
echo "Purpose: Residential IP bridge for WhatsApp sessions"
echo ""

# Check if running on Android/Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo "❌ ERROR: This script must be run in Termux on Android"
    echo "Install Termux from F-Droid or Google Play"
    exit 1
fi

echo "✅ Running in Termux on Android"

# Update packages
echo "📦 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install Node.js (LTS)
echo "📦 Installing Node.js LTS..."
pkg install nodejs-lts -y

# Install Git
echo "📦 Installing Git..."
pkg install git -y

# Redis removed - BUZZ simplified version doesn't need sync
# OpenMP removed - single instance, no parallelism needed

# Install wake lock for background persistence
echo "📦 Installing Termux API for wake lock..."
pkg install termux-api -y

# Clone repository
echo "📥 Cloning Beeline repository..."
cd ~
git clone https://github.com/nanayawjoshua/whatsapp-ai-platform.git beeline
cd beeline

# Copy BUZZ simplified configuration
echo "⚙️  Setting up BUZZ phone bridge configuration..."
cp phone_bridge/.env.buzz .env

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "🎉 BUZZ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Verify .env has correct Supabase credentials (already copied)"
echo "2. Run: node phone_bridge/phone-bridge-server.js"
echo "3. Scan QR code with WhatsApp when prompted"
echo "4. Test: curl localhost:3001/health"
echo ""
echo "For background operation:"
echo "nohup node phone_bridge/phone-bridge-server.js &"
echo "termux-wake-lock"
echo ""
echo "Monitor: tail -f nohup.out"