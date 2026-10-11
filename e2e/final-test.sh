#!/bin/bash
API="http://localhost:4000/api"
PASSED=0
FAILED=0
ISSUES=""

pass() { echo "✅ $1"; ((PASSED++)); }
fail() { echo "❌ $1: $2"; ((FAILED++)); ISSUES="$ISSUES\n- $1: $2"; }

echo "🧪 FINAL E2E API TESTING"
echo "========================"
echo ""

# Login
TOKEN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"dev@wtws.dev","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
TUTOR_TOKEN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"amina@wtws.dev","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "📋 Core API Tests"
curl -s "$API/health" | grep -q '"ok":true' && pass "Health" || fail "Health" "Not healthy"
[ -n "$TOKEN" ] && pass "Student Login" || fail "Student Login" "No token"
[ -n "$TUTOR_TOKEN" ] && pass "Tutor Login" || fail "Tutor Login" "No token"
curl -s "$API/auth/me" -H "Authorization: Bearer $TOKEN" | grep -q '"name"' && pass "Get Profile" || fail "Get Profile" "Failed"
curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"x"}' | grep -q '401' && pass "Invalid Login Rejected" || fail "Invalid Login" "Not rejected"
curl -s "$API/auth/me" | grep -q '401' && pass "Unauthorized Rejected" || fail "Unauthorized" "Not rejected"

echo -e "\n📋 Tutors API"
curl -s "$API/tutors" | grep -q '"slug"' && pass "Tutors List" || fail "Tutors List" "Failed"
curl -s "$API/tutors/dev-patel" | grep -q '"name":"Dev Patel"' && pass "Tutor by Slug" || fail "Tutor by Slug" "Failed"
curl -s "$API/tutors/meta" | grep -q '"subjects"' && pass "Tutor Meta" || fail "Tutor Meta" "Failed"
curl -s "$API/tutors/me" -H "Authorization: Bearer $TOKEN" | grep -q '"slug"' && pass "Tutor Me" || fail "Tutor Me" "Failed"

echo -e "\n📋 Jobs API"
curl -s "$API/jobs" | grep -qE '^\[' && pass "Jobs List" || fail "Jobs List" "Failed"
curl -s "$API/jobs/mine" -H "Authorization: Bearer $TOKEN" | grep -qE '^\[' && pass "My Jobs" || fail "My Jobs" "Failed"

# Post Job with unique title
UNIQUE_TITLE="Need tutor $(date +%s)"
JOB_RESP=$(curl -s -X POST "$API/jobs" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{
  \"type\": \"TUTORING\",
  \"title\": \"$UNIQUE_TITLE\",
  \"description\": \"Looking for a tutor to help me understand physics concepts better. Need someone patient and experienced.\",
  \"subject\": \"Physics\",
  \"level\": \"High school\",
  \"modes\": [\"ONLINE\"],
  \"visibility\": \"PUBLIC\"
}")
JOB_ID=$(echo "$JOB_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$JOB_ID" ] && pass "Post Job" || fail "Post Job" "$JOB_RESP"

# Get Job
[ -n "$JOB_ID" ] && curl -s "$API/jobs/$JOB_ID" | grep -q '"title"' && pass "Get Job by ID" || fail "Get Job" "Failed"

# Job Applicants
[ -n "$JOB_ID" ] && curl -s "$API/jobs/$JOB_ID/applicants" -H "Authorization: Bearer $TOKEN" | grep -qE '^\[' && pass "Job Applicants" || fail "Job Applicants" "Failed"

echo -e "\n📋 Wallet & Payments"
curl -s "$API/wallet" -H "Authorization: Bearer $TOKEN" | grep -q '"coinBalance"' && pass "Wallet" || fail "Wallet" "Failed"
curl -s "$API/payments/packs" | grep -q '"packs"' && pass "Payment Packs" || fail "Payment Packs" "Failed"

echo -e "\n📋 Notifications & Messages"
curl -s "$API/notifications" -H "Authorization: Bearer $TOKEN" | grep -qE '^\[' && pass "Notifications" || fail "Notifications" "Failed"
curl -s "$API/conversations" -H "Authorization: Bearer $TOKEN" | grep -qE '^\[' && pass "Conversations" || fail "Conversations" "Failed"

echo -e "\n📋 Bookings & Reviews"
curl -s "$API/bookings" -H "Authorization: Bearer $TOKEN" | grep -qE '^\[' && pass "Bookings" || fail "Bookings" "Failed"
curl -s "$API/bookings/reviews" -H "Authorization: Bearer $TOKEN" | grep -q '"given"' && pass "Reviews" || fail "Reviews" "Failed"

echo -e "\n📋 Profile & Settings"
curl -s -X PATCH "$API/auth/profile" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Dev Patel"}' | grep -q '"name"' && pass "Update Profile" || fail "Update Profile" "Failed"

echo -e "\n📋 Flags (Report)"
curl -s -X POST "$API/flags" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"targetId":"cmtq6i2eh0000ijm0mrittrot","targetType":"USER","reason":"SPAM"}' | grep -qE '"id"|"already"' && pass "Report User" || fail "Report User" "Failed"

echo ""
echo "================================"
echo "📊 RESULTS: $PASSED passed, $FAILED failed"
[ $FAILED -gt 0 ] && echo -e "\n🐛 ISSUES:$ISSUES"
echo "================================"
