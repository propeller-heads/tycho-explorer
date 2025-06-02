# Simulation API Fix Plan

## Overview
Fix the simulation API endpoint to work correctly in both development and production environments. Currently, the frontend tries to call `/api/simulate` which results in connection refused errors because no service is listening on port 3000.

## Motivation
The simulation feature is broken because:
1. Frontend hardcodes `/api/simulate` endpoint
2. No proxy configuration exists in Vite or Nginx
3. API services run on different ports (3001-3003 prod, 4001-4003 dev)
4. Frontend doesn't know which chain-specific API to call

We need a solution that:
- Works in both development and production
- Maintains the "no default values" philosophy
- Allows deployers to configure their own domains
- Keeps the architecture simple and maintainable

## Proposed Changes

### 1. Frontend API Configuration

#### 1.1 Environment Variables
**Rationale**: Explicit configuration for API endpoints per chain

**File Changes**:
- `.env.example`: Add API URL examples
- `.env`: Add production API URLs
- `.env.dev`: Add development API URLs

**Configuration Changes**:
```env
# Production (.env)
VITE_API_ETHEREUM_URL=/api/ethereum
VITE_API_BASE_URL=/api/base
VITE_API_UNICHAIN_URL=/api/unichain

# Development (.env.dev)
VITE_API_ETHEREUM_URL=http://localhost:4001
VITE_API_BASE_URL=http://localhost:4002
VITE_API_UNICHAIN_URL=http://localhost:4003
```

#### 1.2 Update simulationApi.ts
**Rationale**: Use chain-specific endpoints instead of generic `/api/simulate`

**File**: `frontend/src/components/dexscan/simulation/simulationApi.ts`

**Function Changes**:
- Add `getApiUrl(chain: string): string` function
- Update `callSimulationAPI` to use chain-specific URL
- Remove hardcoded `/api/simulate` path
- Add proper error handling for missing configuration

**Code Changes**:
- Extract API URL based on selected chain
- Construct full endpoint: `${apiUrl}/simulate`
- Throw error if API URL not configured

### 2. Production Nginx Configuration

#### 2.1 Add REST API Routing
**Rationale**: Route chain-specific paths to correct backend services

**File**: `frontend/nginx.conf`

**Component Changes**:
- Add location blocks for each chain's API
- Use trailing slash for proper path rewriting
- Maintain consistency with existing WebSocket routing

**Configuration Changes**:
```nginx
location /api/ethereum/ {
    proxy_pass http://tycho-api-ethereum:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/base/ {
    proxy_pass http://tycho-api-base:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/unichain/ {
    proxy_pass http://tycho-api-unichain:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. Frontend SwapSimulator Integration

#### 3.1 Pass Selected Chain to API Call
**Rationale**: API needs to know which chain to use for simulation

**File**: `frontend/src/components/dexscan/SwapSimulator.tsx`

**Function Changes**:
- Update `simulateSwap` function to pass `selectedChain`
- Get `selectedChain` from context or props

**Code Changes**:
- Add `selectedChain` parameter to `simulateSwap` call
- Ensure chain information flows from UI to API layer

### 4. TypeScript Type Updates

#### 4.1 Add Environment Variable Types
**Rationale**: TypeScript needs to know about new env variables

**File**: `frontend/src/vite-env.d.ts`

**Type Changes**:
```typescript
interface ImportMetaEnv {
  // Existing types...
  readonly VITE_API_ETHEREUM_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_UNICHAIN_URL: string
}
```

### 5. Documentation Updates

#### 5.1 Update README
**Rationale**: Document new environment variables

**File**: `README.md`

**Documentation Changes**:
- Add API URL configuration to environment variables section
- Explain development vs production URL patterns

#### 5.2 Update Development Guide
**Rationale**: Help developers understand the setup

**File**: `docs/development.md`

**Documentation Changes**:
- Add simulation API configuration section
- Explain URL routing in dev vs prod

## Implementation Order

1. Add environment variables to `.env.example`, `.env`, `.env.dev`
2. Update TypeScript types in `vite-env.d.ts`
3. Implement `getApiUrl` function in `simulationApi.ts`
4. Update `callSimulationAPI` to use chain-specific URLs
5. Update `SwapSimulator.tsx` to pass selected chain
6. Add nginx location blocks for REST APIs
7. Test in development mode
8. Test in production mode
9. Update documentation

## Testing Plan

### Development Testing
1. Start services with `make up DEV=1`
2. Open frontend at `http://localhost:5173`
3. Select a pool and enter swap amount
4. Verify API call goes to correct port (4001/4002/4003)
5. Verify simulation results display correctly

### Production Testing
1. Start services with `make up`
2. Open frontend at `http://localhost:8080`
3. Select a pool and enter swap amount
4. Verify API call uses relative path (/api/ethereum/simulate)
5. Verify nginx proxies to correct backend service
6. Verify simulation results display correctly

## Potential Issues

1. **CORS in Development**: Direct localhost calls should work, but may need CORS headers on API side
2. **Missing Configuration**: Code will throw clear errors if env variables not set
3. **Chain Context**: Need to ensure selected chain is available where needed

======================================