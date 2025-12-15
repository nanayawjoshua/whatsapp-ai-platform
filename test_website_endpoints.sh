#!/bin/bash

# BUZZ MVP - Website Endpoint Testing Script
# Tests all API endpoints for Dec 15 launch readiness

echo "🧪 BUZZ MVP - Website Endpoint Testing"
echo "======================================"
echo "Website URL: http://localhost:3006"
echo "Phone Bridge: http://10.36.210.159:3001"
echo "Timestamp: $(date)"
echo ""

BASE_URL="http://localhost:3006"
BRIDGE_URL="http://10.36.210.159:3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=${3:-200}
    local description=$4
    local data=$5

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing: $description... "

    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url" 2>/dev/null)
    fi

    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "📡 PHASE 1: Basic Website Health"
echo "---------------------------------"

# Test homepage
test_endpoint "GET" "$BASE_URL" 200 "Homepage loads"

# Test NextAuth session
test_endpoint "GET" "$BASE_URL/api/auth/session" 200 "NextAuth session endpoint"

echo ""
echo "📱 PHASE 2: Bridge Integration"
echo "-------------------------------"

# Test bridge health endpoint
test_endpoint "GET" "$BASE_URL/api/bridge/health" 200 "Bridge health check"

echo ""
echo "👤 PHASE 3: Vendor Endpoints"
echo "-----------------------------"

# Test vendor registration (without actual data - should return validation error)
test_endpoint "POST" "$BASE_URL/api/vendor/register" 400 "Vendor registration validation"

# Test vendor dashboard (should require auth)
test_endpoint "GET" "$BASE_URL/api/vendor/dashboard" 401 "Vendor dashboard (unauthenticated)"

# Test product creation (should require auth)
test_endpoint "POST" "$BASE_URL/api/products/create" 401 "Product creation (unauthenticated)"

echo ""
echo "💳 PHASE 4: Payment Endpoints"
echo "------------------------------"

# Test Paystack initialization (should require data)
test_endpoint "POST" "$BASE_URL/api/payments/initiate" 400 "Payment initiation validation"

# Test Paystack verification (should require reference)
test_endpoint "GET" "$BASE_URL/api/paystack/verify" 400 "Payment verification validation"

echo ""
echo "🔗 PHASE 5: External API Status"
echo "--------------------------------"

# Test phone bridge health (direct)
echo -n "Testing: Phone bridge health (direct)... "
bridge_response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BRIDGE_URL/health" 2>/dev/null)
bridge_code=$(echo "$bridge_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$bridge_code" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $bridge_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  SKIP${NC} (Bridge not accessible: $bridge_code)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📊 TEST RESULTS SUMMARY"
echo "========================"

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Website ready for launch.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $FAILED_TESTS TESTS FAILED. Review issues above.${NC}"
    exit 1
fi