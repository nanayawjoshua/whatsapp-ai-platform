#!/bin/bash

# Beeline MVP Quick Launch Script
# Run this to verify everything is ready for launch

echo "🐝 BEELINE MVP LAUNCH VERIFICATION"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Git status
echo "📦 Checking Git status..."
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✓${NC} All changes committed"
else
    echo -e "${YELLOW}⚠${NC} You have uncommitted changes"
    git status --short
fi
echo ""

# Check 2: Latest commit
echo "📝 Latest commit:"
git log -1 --oneline
echo ""

# Check 3: Remote sync
echo "🌐 Checking remote sync..."
git fetch origin beeline-main
LOCAL=$(git rev-parse beeline-main)
REMOTE=$(git rev-parse origin/beeline-main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓${NC} Local branch is up to date with remote"
else
    echo -e "${RED}✗${NC} Local branch is behind/ahead of remote"
    echo "Run: git pull origin beeline-main"
fi
echo ""

# Check 4: Bridge status
echo "🔌 Checking WhatsApp Bridge..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"phone-bridge-server"' || echo "")
    if [ -n "$PM2_STATUS" ]; then
        echo -e "${GREEN}✓${NC} WhatsApp bridge found in PM2"
        pm2 status | grep phone-bridge-server
    else
        echo -e "${RED}✗${NC} WhatsApp bridge NOT running"
        echo "Run: cd phone_bridge && pm2 start phone-bridge-server.js --name phone-bridge-server"
    fi
else
    echo -e "${YELLOW}⚠${NC} PM2 not found (might be on different server)"
fi
echo ""

# Check 5: Cloudflare Tunnel
echo "🌍 Checking Cloudflare Tunnel..."
if command -v cloudflared &> /dev/null; then
    TUNNEL_STATUS=$(cloudflared tunnel list 2>/dev/null | grep -i "active" || echo "")
    if [ -n "$TUNNEL_STATUS" ]; then
        echo -e "${GREEN}✓${NC} Cloudflare tunnel active"
    else
        echo -e "${RED}✗${NC} Cloudflare tunnel NOT active"
        echo "Check: cloudflared tunnel list"
    fi
else
    echo -e "${YELLOW}⚠${NC} cloudflared not found (might be on different server)"
fi
echo ""

# Check 6: Important files exist
echo "📁 Verifying key files..."
FILES=(
    "website/app/dashboard/products/page.tsx"
    "website/app/api/vendor/products/route.ts"
    "phone_bridge/inventory-handler.js"
    "supabase/migrations/20250117_create_products_table.sql"
    "MVP_LAUNCH_SETUP.md"
    "MVP_TESTING_CHECKLIST.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file MISSING"
    fi
done
echo ""

# Check 7: Node modules
echo "📦 Checking dependencies..."
if [ -d "website/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} node_modules missing"
    echo "Run: cd website && npm install"
fi
echo ""

# Summary
echo "======================================"
echo "📋 SETUP CHECKLIST"
echo "======================================"
echo ""
echo "Complete these steps in order:"
echo ""
echo "1. [ ] Run database migration in Supabase"
echo "       → See MVP_LAUNCH_SETUP.md Section 1"
echo ""
echo "2. [ ] Create 'product-images' storage bucket"
echo "       → See MVP_LAUNCH_SETUP.md Section 2"
echo ""
echo "3. [ ] Update Google OAuth redirect URIs"
echo "       → Add: https://beeline.works/api/auth/callback/google"
echo ""
echo "4. [ ] Verify Vercel environment variables"
echo "       → Check NEXTAUTH_URL, GOOGLE_CLIENT_ID, etc."
echo ""
echo "5. [ ] Start/verify WhatsApp bridge"
echo "       → pm2 status | grep phone-bridge"
echo ""
echo "6. [ ] Verify Cloudflare tunnel"
echo "       → cloudflared tunnel list"
echo ""
echo "7. [ ] Test with MVP_TESTING_CHECKLIST.md"
echo ""
echo "======================================"
echo "🚀 WHEN ALL CHECKED → GO LIVE!"
echo "======================================"
echo ""

# Helpful links
echo "📚 Helpful Links:"
echo "   • Website: https://beeline.works"
echo "   • Signup: https://beeline.works/signup"
echo "   • Login: https://beeline.works/login"
echo "   • Products: https://beeline.works/dashboard/products"
echo "   • Admin: https://beeline.works/admin/login"
echo ""

# Final message
echo "💡 Next Steps:"
echo "   1. Read: MVP_LAUNCH_SETUP.md"
echo "   2. Complete setup steps"
echo "   3. Run: MVP_TESTING_CHECKLIST.md"
echo "   4. Launch! 🎉"
echo ""
