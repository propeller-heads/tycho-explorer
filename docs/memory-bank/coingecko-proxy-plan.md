# CoinGecko API Proxy Configuration Plan

## Problem Statement
The Docker-deployed frontend application cannot fetch token logos from CoinGecko API due to SSL handshake failures when nginx tries to proxy HTTPS requests.

## Root Cause
- The Ubuntu-based Docker image lacks proper SSL/TLS support
- Missing CA certificates prevent nginx from establishing HTTPS connections to external APIs
- When proxy fails, nginx returns HTML (index.html) instead of JSON, causing parsing errors

## Solution: nginx as CoinGecko Proxy

### Why nginx Proxy (Not Separate Service)
- Simpler architecture - no additional containers
- nginx is already present
- Less maintenance overhead
- Direct proxy path: Frontend → nginx → CoinGecko API

### Implementation Steps

1. **Update Docker Image**
   - Switch from `ubuntu:24.04` to `nginx:alpine`
   - Alpine has better SSL support out-of-the-box
   - Smaller image size bonus

2. **Configure nginx Proxy**
   - Route `/api/coingecko/*` to `https://api.coingecko.com/api/v3/*`
   - Include proper SSL settings
   - Add CORS headers for browser compatibility
   - Set reasonable timeouts

3. **Revert Temporary Workarounds**
   - Remove the temporary warning messages in coingecko.ts
   - Restore original fetch logic

4. **Test Complete Flow**
   - Verify token list fetching works
   - Confirm token images load properly
   - Check error handling remains graceful

## nginx Configuration Details

```nginx
location /api/coingecko/ {
    proxy_pass https://api.coingecko.com/api/v3/;
    proxy_ssl_server_name on;
    proxy_ssl_protocols TLSv1.2 TLSv1.3;
    # Additional headers and timeout settings
}
```

## Expected Outcome
- Token logos display correctly in Docker environment
- No SSL handshake errors
- Graceful fallbacks if CoinGecko is unavailable