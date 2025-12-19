#!/data/data/com.termux/files/usr/bin/bash

# Beeline One-Click Installer
# Deploy bridge to new phones in 2 minutes (vs. 15 minutes manual)
#
# Features:
# - Auto-install all dependencies
# - Configure environment variables
# - Set up auto-start on boot
# - Test bridge functionality
# - Provide status and logs

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/nanayawjoshua/whatsapp-ai-platform.git"
BRIDGE_DIR="$HOME/beeline-bridge"
PHONE_MODEL=$(getprop ro.product.model 2>/dev/null || echo "Android Phone")

echo -e "${BLUE}🐝 Beeline Bridge One-Click Installer${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "📱 Target Device: ${PHONE_MODEL}"
echo -e "📂 Install Location: ${BRIDGE_DIR}"
echo ""

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}❌ This script must run in Termux${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${BLUE}➤${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

# Function to print error
print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check available storage
print_status "Checking available storage..."
AVAILABLE_MB=$(df /data | tail -1 | awk '{print int($4/1024)}')
if [ $AVAILABLE_MB -lt 500 ]; then
    print_warning "Low storage: ${AVAILABLE_MB}MB available (500MB+ recommended)"
    echo "Continue anyway? (y/N)"
    read -r continue_install
    if [[ ! "$continue_install" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Storage OK: ${AVAILABLE_MB}MB available"
fi

# Update Termux packages
print_status "Updating Termux packages..."
pkg update -y >/dev/null 2>&1
pkg upgrade -y >/dev/null 2>&1
print_success "Termux packages updated"

# Install dependencies
print_status "Installing system dependencies..."
pkg install -y nodejs-lts git nano termux-api openssh >/dev/null 2>&1
print_success "System dependencies installed"

# Setup storage access
print_status "Setting up storage access..."
termux-setup-storage
print_success "Storage access configured"

# Clone or update repository
if [ -d "$BRIDGE_DIR" ]; then
    print_warning "Bridge directory exists, updating..."
    cd "$BRIDGE_DIR"
    git pull origin beeline-main >/dev/null 2>&1
    print_success "Repository updated"
else
    print_status "Cloning Beeline repository..."
    git clone "$REPO_URL" "$BRIDGE_DIR" >/dev/null 2>&1
    cd "$BRIDGE_DIR"
    print_success "Repository cloned"
fi

# Navigate to phone_bridge directory
cd phone_bridge

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install >/dev/null 2>&1
print_success "Node.js dependencies installed"

# Setup environment variables
print_status "Configuring environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env created from example"
    else
        touch .env
        print_success "Empty .env created"
    fi

    echo ""
    print_warning "Environment variables need to be configured!"
    echo ""
    echo "Required variables:"
    echo "  SUPABASE_URL=https://your-project.supabase.co"
    echo "  SUPABASE_KEY=your-anon-key"
    echo "  GROQ_API_KEY=your-groq-key"
    echo "  CLOUDFLARE_API_TOKEN=your-cf-token"
    echo "  CLOUDFLARE_ACCOUNT_ID=your-account-id"
    echo ""
    echo "Edit with: nano ~/beeline-bridge/phone_bridge/.env"
    echo ""
    echo "Continue with basic setup? (y/N)"
    read -r continue_setup
    if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
        echo "Please configure .env and run: npm run start-pm2"
        exit 0
    fi
else
    print_success ".env already exists"
fi

# Setup auto-start on boot
print_status "Setting up auto-start on boot..."
mkdir -p ~/.termux/boot

cat > ~/.termux/boot/start-beeline-bridge.sh << 'BOOTSCRIPT'
#!/data/data/com.termux/files/usr/bin/sh
# Beeline Bridge Auto-Start

# Enable wake lock to prevent sleep
termux-wake-lock

# Start bridge
cd ~/beeline-bridge/phone_bridge
nohup npm run start-pm2 > bridge-boot.log 2>&1 &

echo "Beeline bridge auto-started at $(date)" >> bridge-boot.log
BOOTSCRIPT

chmod +x ~/.termux/boot/start-beeline-bridge.sh
print_success "Auto-start configured"

# Test bridge startup
print_status "Testing bridge startup..."
timeout 30s npm run monitor-ip >/dev/null 2>&1 &
BRIDGE_PID=$!
sleep 5

if ps -p $BRIDGE_PID > /dev/null 2>&1; then
    print_success "Bridge started successfully"
    kill $BRIDGE_PID 2>/dev/null || true
else
    print_warning "Bridge startup test inconclusive (may need env config)"
fi

# Create convenience scripts
print_status "Creating convenience scripts..."

cat > ~/start-bridge.sh << 'STARTSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/beeline-bridge/phone_bridge
npm run start-pm2
STARTSCRIPT
chmod +x ~/start-bridge.sh

cat > ~/stop-bridge.sh << 'STOPSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/beeline-bridge/phone_bridge
npm run stop-pm2
STOPSCRIPT
chmod +x ~/stop-bridge.sh

cat > ~/bridge-status.sh << 'STATUSSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
echo "🐝 Beeline Bridge Status"
echo "======================="
echo ""
echo "📊 PM2 Processes:"
pm2 list | grep -E "(beeline|ip-monitor)" || echo "No bridge processes running"
echo ""
echo "🌐 Health Check:"
curl -s http://localhost:3001/health | head -10 || echo "Bridge not responding"
echo ""
echo "📈 Message Stats:"
curl -s http://localhost:3001/stats/messages | jq '.rates' 2>/dev/null || echo "Stats not available"
echo ""
echo "🎯 Quick Commands:"
echo "  ~/start-bridge.sh    - Start bridge"
echo "  ~/stop-bridge.sh     - Stop bridge"
echo "  pm2 logs             - View logs"
echo "  pm2 monit            - Monitor resources"
STATUSSCRIPT
chmod +x ~/bridge-status.sh

print_success "Convenience scripts created"

# Final instructions
echo ""
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure environment: nano ~/beeline-bridge/phone_bridge/.env"
echo "   2. Start bridge: ~/start-bridge.sh"
echo "   3. Check status: ~/bridge-status.sh"
echo "   4. View logs: pm2 logs"
echo ""
echo "🔄 Bridge will auto-start on phone reboot"
echo "📞 Support: https://beeline.works/support"
echo ""
echo -e "${BLUE}🐝 Beeline is ready to buzz! 🚀${NC}"

# Optional: Ask to start bridge now
echo ""
echo "Start bridge now? (y/N)"
read -r start_now
if [[ "$start_now" =~ ^[Yy]$ ]]; then
    print_status "Starting bridge..."
    ~/start-bridge.sh
    sleep 3
    ~/bridge-status.sh
fi