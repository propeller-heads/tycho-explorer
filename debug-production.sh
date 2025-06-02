#!/bin/bash

echo "🔍 Production Build Debugging Script"
echo "===================================="

# 1. Check container status
echo -e "\n📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}" | grep -E "(NAME|tycho)"

# 2. Check environment variables in running containers
echo -e "\n🔧 Frontend Container Environment:"
docker exec tycho-explorer-frontend printenv | grep VITE || echo "No VITE vars found (this is expected in production)"

# 3. Check if API URLs are baked into the JavaScript
echo -e "\n📜 Checking if API URLs are in the built JavaScript:"
docker exec tycho-explorer-frontend sh -c "grep -h 'ethereum.*base.*unichain' /usr/share/nginx/html/assets/*.js | head -5" || echo "Pattern not found"

# 4. Check specific env var patterns
echo -e "\n🔍 Looking for specific patterns:"
docker exec tycho-explorer-frontend sh -c "grep -o '/ethereum\|/base\|/unichain' /usr/share/nginx/html/assets/*.js | sort | uniq -c"

# 5. Test nginx routing
echo -e "\n🌐 Testing nginx routing:"
for chain in ethereum base unichain; do
    echo -n "  /$chain/: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/$chain/
    echo ""
done

# 6. Check if the production build has our debug logs
echo -e "\n🐛 Checking for PROD-DEBUG logs in build:"
docker exec tycho-explorer-frontend sh -c "grep -c 'PROD-DEBUG' /usr/share/nginx/html/assets/*.js" || echo "0"

# 7. Test simulation endpoint directly
echo -e "\n🔬 Testing simulation endpoint:"
echo -n "  POST /ethereum/api/simulate: "
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/ethereum/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"sell_token":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","pools":["0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"],"amount":1}'
echo ""

echo -e "\n✅ Debug script complete"