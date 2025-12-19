#!/usr/bin/env bash

# ============================================================================
# Beeline IP Monitor Test Suite
# Tests all 3 approaches to ensure IP monitor works correctly
# ============================================================================

set -e  # Exit on error

echo "🧪 Beeline IP Monitor Test Suite"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test result function
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        FAILED=$((FAILED + 1))
    fi
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo -e "${BLUE}🔍 Pre-flight Checks${NC}"
echo "-------------------"

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} .env file exists"
else
    echo -e "${RED}❌${NC} .env file not found"
    echo ""
    echo "Please create .env file from .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Fill in your credentials"
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}❌${NC} Node.js not installed"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}❌${NC} npm not installed"
    exit 1
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules exists"
else
    echo -e "${YELLOW}⚠️${NC}  node_modules not found, running npm install..."
    npm install
fi

echo ""

# ============================================================================
# Test 1: Environment Variable Loading
# ============================================================================

echo -e "${BLUE}📋 Test 1: Environment Variable Loading${NC}"
echo "---------------------------------------"

# Source .env and check vars
export $(grep -v '^#' .env | xargs)

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    test_result 0 "CLOUDFLARE_API_TOKEN loaded"
else
    test_result 1 "CLOUDFLARE_API_TOKEN missing"
fi

if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
    test_result 0 "CLOUDFLARE_ACCOUNT_ID loaded"
else
    test_result 1 "CLOUDFLARE_ACCOUNT_ID missing"
fi

if [ -n "$SUPABASE_URL" ]; then
    test_result 0 "SUPABASE_URL loaded"
else
    test_result 1 "SUPABASE_URL missing"
fi

echo ""

# ============================================================================
# Test 2: NPM Script Approach
# ============================================================================

echo -e "${BLUE}🧪 Test 2: NPM Script Approach${NC}"
echo "------------------------------"

# Run npm script with timeout (5 seconds)
timeout 5s npm run monitor-ip > /tmp/ip-monitor-test.log 2>&1 &
NPM_PID=$!

sleep 2

# Check if process is still running
if ps -p $NPM_PID > /dev/null; then
    test_result 0 "npm run monitor-ip starts successfully"
    kill $NPM_PID 2>/dev/null
else
    test_result 1 "npm run monitor-ip failed to start"
fi

# Check logs for env var loading
if grep -q "PRESENT" /tmp/ip-monitor-test.log; then
    test_result 0 "Environment variables loaded via npm script"
else
    test_result 1 "Environment variables not loaded via npm script"
fi

# Check logs for errors
if grep -q "Missing CLOUDFLARE_API_TOKEN" /tmp/ip-monitor-test.log; then
    test_result 1 "npm script failed: Missing credentials"
else
    test_result 0 "No credential errors in npm script"
fi

echo ""

# ============================================================================
# Test 3: Shell Script Approach
# ============================================================================

echo -e "${BLUE}🧪 Test 3: Shell Script Approach${NC}"
echo "-------------------------------"

# Make sure script is executable
chmod +x start-ip-monitor.sh

# Run shell script with timeout (5 seconds)
timeout 5s ./start-ip-monitor.sh > /tmp/ip-monitor-shell-test.log 2>&1 &
SHELL_PID=$!

sleep 2

# Check if process is still running
if ps -p $SHELL_PID > /dev/null; then
    test_result 0 "start-ip-monitor.sh starts successfully"
    kill $SHELL_PID 2>/dev/null
else
    test_result 1 "start-ip-monitor.sh failed to start"
fi

# Check logs
if grep -q "Environment variables loaded" /tmp/ip-monitor-shell-test.log; then
    test_result 0 "Shell script loads environment correctly"
else
    test_result 1 "Shell script failed to load environment"
fi

echo ""

# ============================================================================
# Test 4: PM2 Ecosystem Config (if PM2 installed)
# ============================================================================

echo -e "${BLUE}🧪 Test 4: PM2 Ecosystem Config${NC}"
echo "------------------------------"

if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅${NC} PM2 installed"

    # Try to start with PM2
    npm run start-pm2 > /tmp/pm2-test.log 2>&1
    PM2_START_RESULT=$?

    sleep 3

    if [ $PM2_START_RESULT -eq 0 ]; then
        test_result 0 "PM2 ecosystem starts successfully"

        # Check PM2 status
        if pm2 list | grep -q "ip-monitor"; then
            test_result 0 "IP monitor process visible in PM2"

            # Check if running
            if pm2 list | grep -q "ip-monitor.*online"; then
                test_result 0 "IP monitor running in PM2"
            else
                test_result 1 "IP monitor not running in PM2"
            fi
        else
            test_result 1 "IP monitor not found in PM2"
        fi

        # Check logs for env vars
        pm2 logs ip-monitor --lines 10 --nostream > /tmp/pm2-logs.log 2>&1
        if grep -q "PRESENT" /tmp/pm2-logs.log; then
            test_result 0 "Environment variables loaded in PM2"
        else
            test_result 1 "Environment variables not loaded in PM2"
        fi

        # Stop PM2 processes
        npm run stop-pm2 > /dev/null 2>&1
    else
        test_result 1 "PM2 ecosystem failed to start"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  PM2 not installed, skipping PM2 tests"
    echo "   Install with: npm install -g pm2"
fi

echo ""

# ============================================================================
# Test 5: IP Detection
# ============================================================================

echo -e "${BLUE}🧪 Test 5: IP Detection${NC}"
echo "---------------------"

# Test IP detection methods
if command -v ip &> /dev/null; then
    IP_WLAN0=$(ip addr show wlan0 2>/dev/null | grep "inet " | head -1 | awk '{print $2}' | cut -d/ -f1 || echo "")
    if [ -n "$IP_WLAN0" ] && [ "$IP_WLAN0" != "127.0.0.1" ]; then
        test_result 0 "wlan0 IP detection: $IP_WLAN0"
    else
        test_result 1 "wlan0 IP detection failed"
    fi
else
    test_result 1 "'ip' command not available"
fi

if command -v ifconfig &> /dev/null; then
    test_result 0 "ifconfig command available (fallback)"
else
    test_result 1 "ifconfig command not available"
fi

echo ""

# ============================================================================
# Test 6: File Permissions
# ============================================================================

echo -e "${BLUE}🧪 Test 6: File Permissions${NC}"
echo "-------------------------"

if [ -x "start-ip-monitor.sh" ]; then
    test_result 0 "start-ip-monitor.sh is executable"
else
    test_result 1 "start-ip-monitor.sh is not executable"
fi

if [ -r ".env" ]; then
    test_result 0 ".env file is readable"
else
    test_result 1 ".env file is not readable"
fi

if [ -r "ecosystem.config.js" ]; then
    test_result 0 "ecosystem.config.js is readable"
else
    test_result 1 "ecosystem.config.js is not readable"
fi

echo ""

# ============================================================================
# Test Summary
# ============================================================================

echo "=================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================================="
echo ""
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🚀 IP Monitor is ready to use. Choose one approach:"
    echo ""
    echo "   Option 1 (Recommended - Simple):"
    echo "      npm run monitor-ip"
    echo ""
    echo "   Option 2 (Background with nohup):"
    echo "      nohup npm run monitor-ip > logs/ip-monitor.log 2>&1 &"
    echo ""
    echo "   Option 3 (Shell script):"
    echo "      ./start-ip-monitor.sh"
    echo ""
    if command -v pm2 &> /dev/null; then
        echo "   Option 4 (PM2 - Production):"
        echo "      npm run start-pm2"
        echo ""
    fi
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Check the output above for details."
    echo "Common fixes:"
    echo "  - Ensure .env file has all required variables"
    echo "  - Run 'npm install' to install dependencies"
    echo "  - Check that Cloudflare credentials are valid"
    echo ""
    exit 1
fi
