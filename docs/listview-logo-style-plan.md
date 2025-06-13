# ListView Logo Style Implementation Plan

## Overview
Apply the specified CSS style for logos in the ListView component to achieve consistent 32x32px sizing with proper background image handling.

## Style Requirement
```css
width: 32px;
height: 32px;
background: url(<path-to-image>) lightgray 50% / cover no-repeat;
```

## Current State Analysis
- TokenIcon and ProtocolLogo components don't have variant prop
- StackedTokenIcons uses size={6} (24px) for TokenIcon
- ProtocolLogo is called without size prop (defaults to 6)
- Overflow indicator is currently 24px (w-6 h-6)

## Implementation Plan

### 1. Update tokenIconStyles.ts
**File**: `/Users/j/ws/tycho-explorer/frontend/src/components/dexscan/common/tokenIconStyles.ts`

Add constants for list view:
```typescript
// Add after line 8
// List variant specific constants
export const LIST_ICON_SIZE = 32; // Fixed size in pixels for list view
export const getListTextSize = () => 'text-sm font-medium';
```

### 2. Update TokenIcon Component
**File**: `/Users/j/ws/tycho-explorer/frontend/src/components/dexscan/common/TokenIcon.tsx`

#### 2.1 Add variant prop to interface (after line 8):
```typescript
variant?: 'default' | 'list'; // New prop for list view styling
```

#### 2.2 Update component signature (line 11):
```typescript
const TokenIcon: React.FC<TokenIconProps> = ({ token, size = 6, variant = 'default' }) => {
```

#### 2.3 Add conditional rendering before return statement (after line 38):
```typescript
  // List variant rendering
  if (variant === 'list') {
    return (
      <div
        className="rounded-full flex items-center justify-center overflow-hidden shrink-0 text-sm font-medium"
        style={{
          width: '32px',
          height: '32px',
          background: iconUrl 
            ? `url(${iconUrl}) lightgray 50% / cover no-repeat`
            : 'lightgray',
          color: '#333'
        }}
      >
        {!iconUrl && (token.symbol ? token.symbol.substring(0, 1).toUpperCase() : '?')}
      </div>
    );
  }

  // Default rendering
  return (
    // ... existing return statement
  );
```

### 3. Update ProtocolLogo Component
**File**: `/Users/j/ws/tycho-explorer/frontend/src/components/dexscan/common/ProtocolLogo.tsx`

#### 3.1 Add variant prop to interface (after line 19):
```typescript
variant?: 'default' | 'list'; // New prop for list view styling
```

#### 3.2 Update component signature (line 22):
```typescript
const ProtocolLogo: React.FC<ProtocolLogoProps> = ({ protocolName, size = 6, variant = 'default' }) => {
```

#### 3.3 Add conditional rendering (after line 43):
```typescript
  // List variant rendering
  if (variant === 'list') {
    return (
      <div
        className="rounded-full flex items-center justify-center overflow-hidden shrink-0 text-sm font-medium"
        style={{
          width: '32px',
          height: '32px',
          background: logoUrl 
            ? `url(${logoUrl}) lightgray 50% / cover no-repeat`
            : 'lightgray',
          color: '#333'
        }}
      >
        {!logoUrl && (protocolName ? protocolName.substring(0, 1).toUpperCase() : 'P')}
      </div>
    );
  }

  // Default rendering
  return (
    // ... existing return statement
  );
```

### 4. Update PoolTable Component
**File**: `/Users/j/ws/tycho-explorer/frontend/src/components/dexscan/pools/PoolTable.tsx`

#### 4.1 Replace entire StackedTokenIcons component (lines 36-49):
```typescript
const StackedTokenIcons: React.FC<{ tokens: Token[] }> = ({ tokens }) => {
  return (
    <div className="flex -space-x-3">
      {tokens.slice(0, 3).map((token) => (
        <TokenIcon key={token.address || token.symbol} token={token} variant="list" />
      ))}
      {tokens.length > 3 && (
        <div 
          className="flex items-center justify-center text-sm font-medium text-white rounded-full"
          style={{
            width: '32px',
            height: '32px',
            background: 'rgba(148, 148, 148, 0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          +{tokens.length - 3}
        </div>
      )}
    </div>
  );
};
```

#### 4.2 Update ProtocolLogo usage (line 234):
```typescript
<ProtocolLogo protocolName={pool.protocol_system} variant="list" />
```

### 5. Type Checking
Run `npx tsc -noEmit` to ensure no TypeScript errors

## Key Changes Summary
1. Adding variant prop to both icon components
2. Implementing CSS background-image style for list variant
3. Using fixed 32x32px dimensions
4. Lightgray background fallback
5. Improved overflow indicator with glassmorphism effect
6. Adjusting spacing from -space-x-2 to -space-x-3 for better overlap

## Visual Design Details

### Token Icons
- Size: 32x32px
- Background: CSS background-image for loaded images, lightgray fallback
- Text color: #333 for better contrast on light background
- Font: text-sm font-medium for fallback initials

### Overflow Indicator
- Size: 32x32px (matching token icons)
- Background: Semi-transparent gray with blur effect
- Style: `rgba(148, 148, 148, 0.3)` with 8px backdrop blur
- Border: 1px solid with 10% white opacity
- Text: White, medium weight

### Spacing
- Using `-space-x-3` for overlapping icons (12px overlap)
- This creates a nice stacked effect while keeping icons readable