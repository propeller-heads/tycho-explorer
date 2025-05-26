# Active Context

## Current Work Focus

### Recent Development Updates (2025-05-27)

#### UI Refinements and Fixes
1. **Token Address Formatting**:
   - List View now formats raw address tokens (e.g., 0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2) as shortened format (0x9f8f...79a2)
   - Swap Simulator also formats address tokens consistently
   - Uses existing `renderHexId` function for consistency

2. **Filter Popover Styling**:
   - Updated all popovers to match Figma design with transparent borders
   - Background: `rgba(255,244,224,0.02)` for depth 5 transparency
   - Border: `rgba(255,244,224,0.12)` for warm transparent effect
   - Checkboxes use folly red (#FF3366) fill with white checkmark
   - Filter buttons have dashed borders with transparent styling

3. **Favicon Configuration**:
   - Fixed empty favicon.ico issue
   - Configured to use /public/favicon.ico with proper MIME type
   - Changed from `image/svg+xml` to `image/x-icon` in index.html

4. **Swap Simulator Precision**:
   - Removed truncation of net amount - now shows full precision
   - Buy/Sell amounts display at full precision (no toFixed(2))
   - Users see exact values from simulation API

#### Graph View Edge Widening Investigation
1. **Root Cause Analysis**: 
   - Added comprehensive logging throughout the data flow (WebSocket → PoolDataContext → useGraphData → vis-network)
   - Discovered WebSocket sends initial pool data but subsequent block updates contain 0 price updates
   - All pools have `lastUpdatedAtBlock: 0` and never get updated
   - Edge widening depends on `lastUpdatedAtBlock === currentBlockNumber`, so edges never widen

2. **Temporary Solution**:
   - Initially added simulation code to randomly update 5-10 pool prices per block
   - Removed simulation at user's request, keeping only logging statements
   - WebSocket server needs to be fixed to send actual price updates with blocks

3. **Graph View Background Fix**:
   - Updated GraphViewContent.tsx background to match List View's warm cream theme
   - Changed from purple theme to `bg-[#FFF4E005]` with backdrop blur
   - Added gradient border effect for consistency

4. **Edge Tooltip Simplification**:
   - Removed pool link from edge tooltip - now displays pool ID as plain text
   - Removed redundant "Block" field since "Last Update" already shows temporal information
   - Edge tooltip now shows: Protocol, Token pair, Pool ID (with copy button), Fee, Last update, and Spot price

### Recent Development Updates (2025-05-26)

#### Critical Features to Maintain
1. **Filter Popover Infinite Scroll**: 
   - Token AND Pool ID popovers in PoolListFilterBar MUST have infinite scroll
   - Shows 100 items initially, loads 100 more when near bottom
   - Resets count to 100 when search changes
   - DO NOT remove this feature - it's essential for handling large lists
   - Batch size is 100 for both token and pool ID filters

2. **Pool ID Filter Enhancement**:
   - Shows pool ID with token pair: "0x001b...23d4 (TokenA / TokenB)"
   - Search works across pool ID AND token symbols
   - Full pool data is passed to filter bar (not just IDs)
   - Displays shortened pool ID with full token pair names

### Recent Development Updates (2025-05-26)

#### Swap Simulator Improvements
1. **Input Field Styling**: Fixed input amount capsule appearance
   - Replaced styled `Input` component with native `input` element
   - Removed all default padding, margins, and borders
   - Input and output amounts now have identical visual appearance
   - Both use `text-[28px]` for consistent sizing

2. **Pool ID Tooltip Interaction**: Fixed tooltip click behavior
   - Added `onClick={(e) => e.stopPropagation()}` to wrapper div
   - Prevents row selection when interacting with pool ID tooltip
   - Tooltip shows instantly with `delayDuration={0}`
   - Added `z-[100]` for proper layering

3. **Fee Percentage Formatting**: Added protocol-specific fee parsing
   - Added support for `ekubo_v2` protocol fee format (divides by 1e16)
   - Limited all fee percentages to 4 decimal places maximum
   - Example: ekubo fee `0x000346dc5d638865` now displays as "0.0922%" instead of "92233720368.5477%"
   - Consistent rounding applied across all protocols

#### UI Component Refinements
1. **Popover Glass Effect**: Updated all popovers to match Figma design
   - Background: `rgba(255, 244, 224, 0.04)` with `backdrop-blur-[104px]`
   - Shadow: `0px 4px 16px 0px rgba(37, 0, 63, 0.2)`
   - Border: `rgba(255, 255, 255, 0.1)`

2. **Checkbox Styling**: Changed from rounded to square checkboxes
   - Updated from `rounded-sm` to `rounded-none` for perfect square appearance
   - Border color: `rgba(255, 244, 224, 0.64)`

3. **Pool ID Tooltips**: Added hover tooltips for pool IDs
   - Shows full pool ID on hover for easy copying
   - Styled with dark background and backdrop blur
   - Uses `select-all` class for easy selection

4. **Swap Simulator Number Formatting**:
   - Input and output amounts use consistent `text-[28px]` sizing
   - Output amounts display maximum 2 decimal places
   - Smart decimal formatting: shows actual decimals up to 2 places (e.g., "273.42" not "273.420000")
   - Applied to both buy amount display and net amount

### Recent UI Color System Updates (2025-05-26)

The Pool List View UI has undergone significant color system updates to align with the TC Design from Figma:

1. **Color Scheme Transition**
   - Moved from cool purple/blue tones to warm cream/beige palette
   - Primary text color: `rgba(255, 244, 224, 1)` (#FFF4E0 at full opacity)
   - Background panels: `rgba(255, 244, 224, 0.02)` to `rgba(255, 244, 224, 0.05)`
   - Borders: `rgba(255, 244, 224, 0.05)` for table rows

2. **Component-Specific Changes**
   - **ListView.tsx**: Updated container with glass effect using backdrop blur and warm cream background
   - **PoolTable.tsx**: 
     - All text colors changed to `rgba(255, 244, 224, 1)` 
     - Selected rows use transparent warm backgrounds
     - Table row borders at 0.05 opacity
   - **PoolListFilterBar.tsx**: All popover text, inputs, and labels updated to warm white

3. **Design Patterns**
   - Gradient border implementation using nested divs with absolute positioning
   - Transparent overlays for interactive states
   - Consistent use of rgba values for precise color control

## Next Steps

1. Continue monitoring for any remaining color inconsistencies
2. Test the UI across different screen sizes and browsers
3. Implement any additional TC Design requirements as they arise

## Active Decisions and Considerations

### Color System
- **Decision**: Use `rgba(255, 244, 224, 1)` for ALL text with full opacity
- **Rationale**: User explicitly requested opacity 1 for maximum readability
- **Implementation**: Applied consistently across table cells, popovers, and all UI text

### Border Implementation
- **Decision**: Use solid borders with low opacity instead of gradient borders
- **Rationale**: Simpler implementation, better performance, cleaner appearance
- **Implementation**: `borderBottom: '1px solid rgba(255, 244, 224, 0.05)'`

### Glass Effect Pattern
- **Decision**: Use backdrop blur with semi-transparent backgrounds
- **Rationale**: Creates modern, layered UI as per TC Design
- **Implementation**: `backdrop-blur-[24px]` with `bg-[#FFF4E005]`

## Important Patterns and Preferences

### CSS Gradient Border Technique
When implementing gradient borders with border-radius:
1. Create wrapper div with gradient background and padding
2. Inner div with solid background color
3. This creates the appearance of a gradient border

Example:
```jsx
<div className="bg-gradient-to-b from-[color1] to-[color2] p-[1px] rounded-xl">
  <div className="bg-[solidColor] rounded-xl h-full w-full">
    {/* Content */}
  </div>
</div>
```

### Color Value Consistency
- Always use rgba format for colors to maintain consistency
- Full opacity (1) for primary text
- Lower opacity for secondary elements (0.6-0.8)
- Very low opacity for backgrounds (0.02-0.08)

### UI Component Guidelines
- **Token Address Display**: Always format raw addresses using `renderHexId` for consistency
- **Number Precision**: Never truncate amounts in Swap Simulator - show full precision
- **Popover Styling**: Use transparent borders with warm cream colors
- **Checkbox Styling**: Folly red (#FF3366) for checked state with white checkmark

## Learnings and Project Insights

1. **Figma Design Accuracy**: The TC Design uses a very specific warm color palette that must be matched exactly
2. **Opacity Matters**: Text readability is crucial - full opacity ensures maximum contrast
3. **Layered UI Design**: The app uses multiple transparent layers to create depth
4. **Performance Considerations**: Simple borders perform better than complex gradients for frequently rendered elements like table rows
5. **WebSocket Data Flow**: The WebSocket server sends initial pool data but doesn't include price updates with new blocks
6. **vis-network Edge Updates**: Edge widening requires careful management of DataSet updates and proper tracking of pool update blocks
7. **Debugging Complex Data Flows**: Color-coded console logging (🔷, 🔶, 🔸, etc.) helps trace data through multiple system layers