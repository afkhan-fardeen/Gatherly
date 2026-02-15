#!/bin/bash
# API curl tests – run against https://gatherly-skl4.onrender.com
API="${1:-https://gatherly-skl4.onrender.com}"

echo "Testing API at $API"
echo ""

echo "1. Health check (GET /api/health)"
curl -s "$API/api/health" | head -c 200
echo ""
echo ""

echo "2. Login (POST /api/auth/login)"
LOGIN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@gatherly.com","password":"password123"}')
echo "$LOGIN" | head -c 300
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""
echo ""

if [ -n "$TOKEN" ]; then
  echo "3. Me (GET /api/auth/me with token)"
  curl -s "$API/api/auth/me" -H "Authorization: Bearer $TOKEN" | head -c 200
  echo ""
  echo ""
fi

echo "4. Vendors (GET /api/vendors)"
curl -s "$API/api/vendors?businessType=catering" | head -c 300
echo ""
echo ""

echo "5. CORS preflight (OPTIONS /api/auth/login)"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X OPTIONS "$API/api/auth/login" \
  -H "Origin: https://gatherly-consumer.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
echo ""
echo "Done."
