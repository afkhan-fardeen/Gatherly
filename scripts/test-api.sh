#!/bin/bash
# API smoke tests – run against https://gatherly-skl4.onrender.com or localhost:3001
# Exit 1 if any critical check fails
API="${1:-https://gatherly-skl4.onrender.com}"
FAILED=0

check_status() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  [PASS] $name: $actual"
  else
    echo "  [FAIL] $name: expected $expected, got $actual"
    FAILED=1
  fi
}

echo "Testing API at $API"
echo ""

echo "1. Health check (GET /api/health)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/health")
check_status "GET /api/health" "200" "$CODE"
echo ""

echo "2. Login (POST /api/auth/login)"
TMP=$(mktemp)
CODE=$(curl -s -w "%{http_code}" -o "$TMP" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@gatherly.com","password":"password123"}')
check_status "POST /api/auth/login" "200" "$CODE"
TOKEN=$(grep -o '"token":"[^"]*"' "$TMP" | cut -d'"' -f4)
rm -f "$TMP"
echo ""

if [ -n "$TOKEN" ]; then
  echo "3. Me (GET /api/auth/me with token)"
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer $TOKEN")
  check_status "GET /api/auth/me" "200" "$CODE"
  echo ""

  echo "4. Me without token (expect 401)"
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me")
  check_status "GET /api/auth/me (no token)" "401" "$CODE"
  echo ""
else
  echo "  [SKIP] No token; skipping auth-protected tests"
  echo ""
fi

echo "5. Vendors (GET /api/vendors)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/vendors?businessType=catering")
check_status "GET /api/vendors" "200" "$CODE"
echo ""

echo "6. CORS preflight (OPTIONS /api/auth/login)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$API/api/auth/login" \
  -H "Origin: https://gatherly-consumer.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
if [ "$CODE" = "200" ] || [ "$CODE" = "204" ]; then
  echo "  [PASS] OPTIONS CORS: $CODE"
else
  echo "  [FAIL] OPTIONS CORS: expected 200 or 204, got $CODE"
  FAILED=1
fi
echo ""

if [ $FAILED -eq 1 ]; then
  echo "Some checks failed. Exit 1."
  exit 1
fi
echo "All API checks passed."
exit 0
