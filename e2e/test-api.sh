#!/bin/bash
# API and UI Test Script

API_URL="http://localhost:4000/api"
WEB_URL="http://localhost:3000"
PASSED=0
FAILED=0

pass() { echo "✅ $1"; ((PASSED++)); }
fail() { echo "❌ $1"; ((FAILED++)); }

echo "🚀 Starting API & UI Tests..."
echo "================================"

# Test 1: Health Check
echo -e "\n📋 Test 1: API Health Check"
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q '"ok":true'; then
  pass "API is healthy"
else
  fail "API health check failed"
  exit 1
fi

# Test 2: Login API
echo -e "\n📋 Test 2: Login API"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@wtws.dev","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  pass "Login successful, token received"
else
  fail "Login failed: $LOGIN_RESPONSE"
  exit 1
fi

# Test 3: Get User Info
echo -e "\n📋 Test 3: Get User Info (Auth)"
ME_RESPONSE=$(curl -s "$API_URL/auth/me" -H "Authorization: Bearer $TOKEN")
USER_NAME=$(echo "$ME_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
if [ -n "$USER_NAME" ]; then
  pass "User info retrieved: $USER_NAME"
else
  fail "Failed to get user info"
fi

# Test 4: Get Tutors List
echo -e "\n📋 Test 4: Get Tutors List"
TUTORS=$(curl -s "$API_URL/tutors")
if echo "$TUTORS" | grep -q '"slug"'; then
  TUTOR_COUNT=$(echo "$TUTORS" | grep -o '"slug"' | wc -l | tr -d ' ')
  pass "Tutors list retrieved, count: $TUTOR_COUNT"
else
  fail "Failed to get tutors"
fi

# Test 5: Get Jobs List
echo -e "\n📋 Test 5: Get Jobs List"
JOBS=$(curl -s "$API_URL/jobs")
if echo "$JOBS" | grep -qE '^\['; then
  JOB_COUNT=$(echo "$JOBS" | grep -o '"id"' | wc -l | tr -d ' ')
  pass "Jobs list retrieved, count: $JOB_COUNT"
else
  fail "Failed to get jobs"
fi

# Test 6: Get Wallet
echo -e "\n📋 Test 6: Get Wallet (Auth)"
WALLET=$(curl -s "$API_URL/wallet" -H "Authorization: Bearer $TOKEN")
if echo "$WALLET" | grep -q '"coinBalance"'; then
  BALANCE=$(echo "$WALLET" | grep -o '"coinBalance":[0-9]*' | cut -d':' -f2)
  pass "Wallet retrieved, balance: $BALANCE coins"
else
  fail "Failed to get wallet"
fi

# Test 7: Get Notifications
echo -e "\n📋 Test 7: Get Notifications (Auth)"
NOTIFS=$(curl -s "$API_URL/notifications" -H "Authorization: Bearer $TOKEN")
if echo "$NOTIFS" | grep -qE '^\['; then
  NOTIF_COUNT=$(echo "$NOTIFS" | grep -o '"id"' | wc -l | tr -d ' ')
  pass "Notifications retrieved, count: $NOTIF_COUNT"
else
  fail "Failed to get notifications"
fi

# Test 8: Get Conversations
echo -e "\n📋 Test 8: Get Conversations (Auth)"
CONVOS=$(curl -s "$API_URL/conversations" -H "Authorization: Bearer $TOKEN")
if echo "$CONVOS" | grep -qE '^\['; then
  CONVO_COUNT=$(echo "$CONVOS" | grep -o '"id"' | wc -l | tr -d ' ')
  pass "Conversations retrieved, count: $CONVO_COUNT"
else
  fail "Failed to get conversations"
fi

# Test 9: Get Bookings
echo -e "\n📋 Test 9: Get Bookings (Auth)"
BOOKINGS=$(curl -s "$API_URL/bookings" -H "Authorization: Bearer $TOKEN")
if echo "$BOOKINGS" | grep -qE '^\['; then
  BOOKING_COUNT=$(echo "$BOOKINGS" | grep -o '"id"' | wc -l | tr -d ' ')
  pass "Bookings retrieved, count: $BOOKING_COUNT"
else
  fail "Failed to get bookings"
fi

# Test 10: Invalid Login
echo -e "\n📋 Test 10: Invalid Login (should fail)"
INVALID_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')
if echo "$INVALID_LOGIN" | grep -q '"statusCode":401'; then
  pass "Invalid login correctly rejected"
else
  fail "Invalid login not rejected properly"
fi

# Test 11: Get Tutor Profile
echo -e "\n📋 Test 11: Get Tutor Profile"
TUTOR=$(curl -s "$API_URL/tutors/dev-patel")
if echo "$TUTOR" | grep -q '"name":"Dev Patel"'; then
  pass "Tutor profile retrieved: Dev Patel"
else
  fail "Failed to get tutor profile"
fi

# Test 12: Get My Jobs
echo -e "\n📋 Test 12: Get My Jobs (Auth)"
MY_JOBS=$(curl -s "$API_URL/jobs/mine" -H "Authorization: Bearer $TOKEN")
if echo "$MY_JOBS" | grep -qE '^\['; then
  MY_JOB_COUNT=$(echo "$MY_JOBS" | grep -o '"id"' | wc -l | tr -d ' ')
  pass "My jobs retrieved, count: $MY_JOB_COUNT"
else
  fail "Failed to get my jobs"
fi

# Test 13: Get Tutor Meta
echo -e "\n📋 Test 13: Get Tutor Meta"
META=$(curl -s "$API_URL/tutors/meta")
if echo "$META" | grep -q '"subjects"'; then
  pass "Tutor meta retrieved"
else
  fail "Failed to get tutor meta"
fi

# Test 14: Get Payment Packs
echo -e "\n📋 Test 14: Get Payment Packs"
PACKS=$(curl -s "$API_URL/payments/packs")
if echo "$PACKS" | grep -q '"packs"'; then
  PACK_COUNT=$(echo "$PACKS" | grep -o '"coins"' | wc -l | tr -d ' ')
  pass "Payment packs retrieved, count: $PACK_COUNT"
else
  fail "Failed to get payment packs"
fi

# Test 15: Unauthorized Access
echo -e "\n📋 Test 15: Unauthorized Access (should fail)"
UNAUTH=$(curl -s "$API_URL/auth/me")
if echo "$UNAUTH" | grep -q '"statusCode":401'; then
  pass "Unauthorized access correctly rejected"
else
  fail "Unauthorized access not rejected"
fi

echo -e "\n================================"
echo "📊 Results: $PASSED passed, $FAILED failed"
echo "🏁 All API tests completed!"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
