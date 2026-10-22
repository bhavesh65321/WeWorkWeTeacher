#!/bin/bash
API="http://localhost:4000/api"
PASSED=0
FAILED=0
ISSUES=""

pass() { echo "✅ $1"; ((PASSED++)); }
fail() { echo "❌ $1: $2"; ((FAILED++)); ISSUES="$ISSUES\n- $1: $2"; }

echo "🧪 COMPREHENSIVE API TESTING"
echo "============================"
echo ""

# 1. Health
echo "📋 1. Health Check"
R=$(curl -s "$API/health")
echo "$R" | grep -q '"ok":true' && pass "Health OK" || fail "Health" "API not healthy"

# 2. Login Student
echo -e "\n📋 2. Login Student"
R=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"dev@wtws.dev","password":"password123"}')
TOKEN=$(echo "$R" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ -n "$TOKEN" ] && pass "Student login" || fail "Student login" "No token"

# 3. Login Tutor
echo -e "\n📋 3. Login Tutor"
R=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"amina@wtws.dev","password":"password123"}')
TUTOR_TOKEN=$(echo "$R" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ -n "$TUTOR_TOKEN" ] && pass "Tutor login" || fail "Tutor login" "No token"

# 4. Get Me
echo -e "\n📋 4. Get User Profile"
R=$(curl -s "$API/auth/me" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -q '"name"' && pass "Get profile" || fail "Get profile" "No name"

# 5. Invalid Login
echo -e "\n📋 5. Invalid Login"
R=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"wrong@x.com","password":"wrong"}')
echo "$R" | grep -q '"statusCode":401' && pass "Invalid login rejected" || fail "Invalid login" "Not rejected"

# 6. Unauthorized
echo -e "\n📋 6. Unauthorized Access"
R=$(curl -s "$API/auth/me")
echo "$R" | grep -q '"statusCode":401' && pass "Unauthorized rejected" || fail "Unauthorized" "Not rejected"

# 7. Tutors List
echo -e "\n📋 7. Tutors List"
R=$(curl -s "$API/tutors")
echo "$R" | grep -q '"slug"' && pass "Tutors list" || fail "Tutors list" "No tutors"

# 8. Tutor by Slug
echo -e "\n📋 8. Tutor by Slug"
R=$(curl -s "$API/tutors/dev-patel")
echo "$R" | grep -q '"name":"Dev Patel"' && pass "Tutor profile" || fail "Tutor profile" "Wrong data"

# 9. Tutor Meta
echo -e "\n📋 9. Tutor Meta"
R=$(curl -s "$API/tutors/meta")
echo "$R" | grep -q '"subjects"' && pass "Tutor meta" || fail "Tutor meta" "No subjects"

# 10. Jobs List
echo -e "\n📋 10. Jobs List"
R=$(curl -s "$API/jobs")
echo "$R" | grep -qE '^\[' && pass "Jobs list" || fail "Jobs list" "Not array"

# 11. My Jobs
echo -e "\n📋 11. My Jobs"
R=$(curl -s "$API/jobs/mine" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "My jobs" || fail "My jobs" "Not array"

# 12. Post Job (correct format)
echo -e "\n📋 12. Post Job"
R=$(curl -s -X POST "$API/jobs" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "type": "TUTORING",
  "title": "Need Math tutor for calculus help",
  "description": "I need help with calculus and differential equations for my college exams this semester.",
  "subject": "Mathematics",
  "level": "Undergraduate",
  "modes": ["ONLINE"],
  "visibility": "PUBLIC",
  "city": "Andheri, Mumbai, Maharashtra",
  "country": "India",
  "languages": ["English", "Hindi"],
  "currency": "INR",
  "budgetType": "HOURLY",
  "budgetMin": 50000,
  "budgetMax": 100000
}')
JOB_ID=$(echo "$R" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$JOB_ID" ] && pass "Post job (ID: $JOB_ID)" || fail "Post job" "$R"

# 13. Get Job by ID
echo -e "\n📋 13. Get Job by ID"
if [ -n "$JOB_ID" ]; then
  R=$(curl -s "$API/jobs/$JOB_ID")
  echo "$R" | grep -q '"title"' && pass "Get job" || fail "Get job" "No title"
else
  fail "Get job" "No job ID"
fi

# 14. Wallet
echo -e "\n📋 14. Wallet"
R=$(curl -s "$API/wallet" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -q '"coinBalance"' && pass "Wallet" || fail "Wallet" "No balance"

# 15. Notifications
echo -e "\n📋 15. Notifications"
R=$(curl -s "$API/notifications" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "Notifications" || fail "Notifications" "Not array"

# 16. Conversations
echo -e "\n📋 16. Conversations"
R=$(curl -s "$API/conversations" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "Conversations" || fail "Conversations" "Not array"

# 17. Bookings
echo -e "\n📋 17. Bookings"
R=$(curl -s "$API/bookings" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "Bookings" || fail "Bookings" "Not array"

# 18. Payment Packs
echo -e "\n📋 18. Payment Packs"
R=$(curl -s "$API/payments/packs")
echo "$R" | grep -q '"packs"' && pass "Payment packs" || fail "Payment packs" "No packs"

# 19. Tutor Apply
echo -e "\n📋 19. Tutor Apply to Job"
if [ -n "$JOB_ID" ]; then
  R=$(curl -s -X POST "$API/jobs/$JOB_ID/apply" -H "Authorization: Bearer $TUTOR_TOKEN" -H "Content-Type: application/json" -d '{"message":"I can help with calculus!"}')
  echo "$R" | grep -qE '"id"|"already"' && pass "Tutor apply" || fail "Tutor apply" "$R"
else
  fail "Tutor apply" "No job"
fi

# 20. Get Job Applicants
echo -e "\n📋 20. Get Job Applicants"
if [ -n "$JOB_ID" ]; then
  R=$(curl -s "$API/jobs/$JOB_ID/applicants" -H "Authorization: Bearer $TOKEN")
  echo "$R" | grep -qE '^\[' && pass "Job applicants" || fail "Job applicants" "$R"
else
  fail "Job applicants" "No job"
fi

# 21. Message Tutor
echo -e "\n📋 21. Message Tutor"
TUTOR_ID=$(curl -s "$API/tutors/amina-rahman" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TUTOR_ID" ]; then
  R=$(curl -s -X POST "$API/tutors/message" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"tutorId\":\"$TUTOR_ID\",\"message\":\"Hi, I need help with physics!\"}")
  echo "$R" | grep -qE '"id"|"conversationId"' && pass "Message tutor" || fail "Message tutor" "$R"
else
  fail "Message tutor" "No tutor ID"
fi

# 22. Get Conversations (after message)
echo -e "\n📋 22. Conversations After Message"
R=$(curl -s "$API/conversations" -H "Authorization: Bearer $TOKEN")
CONV_COUNT=$(echo "$R" | grep -o '"id"' | wc -l | tr -d ' ')
[ "$CONV_COUNT" -ge 1 ] && pass "Has conversations ($CONV_COUNT)" || fail "Conversations" "Empty"

# 23. Update Profile
echo -e "\n📋 23. Update Profile"
R=$(curl -s -X PATCH "$API/auth/profile" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Dev Patel"}')
echo "$R" | grep -q '"name"' && pass "Update profile" || fail "Update profile" "$R"

# 24. Tutor Profile (me)
echo -e "\n📋 24. Tutor Profile (me)"
R=$(curl -s "$API/tutors/me" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -q '"slug"' && pass "Tutor me" || fail "Tutor me" "$R"

# 25. Reviews
echo -e "\n📋 25. Reviews"
R=$(curl -s "$API/bookings/reviews" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "Reviews" || fail "Reviews" "Not array"

# 26. Flags (report)
echo -e "\n📋 26. Report User"
R=$(curl -s -X POST "$API/flags" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"targetId":"cmtq6i2eh0000ijm0mrittrot","targetType":"USER","reason":"TEST_REPORT"}')
echo "$R" | grep -qE '"id"|"already"' && pass "Report user" || fail "Report user" "$R"

# 27. Get Flags
echo -e "\n📋 27. Get Flags"
R=$(curl -s "$API/flags" -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -qE '^\[' && pass "Get flags" || fail "Get flags" "$R"

echo ""
echo "================================"
echo "📊 RESULTS: $PASSED passed, $FAILED failed"
if [ $FAILED -gt 0 ]; then
  echo -e "\n🐛 ISSUES:$ISSUES"
fi
echo "================================"
