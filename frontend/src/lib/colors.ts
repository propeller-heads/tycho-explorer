/**
 * Milk color system for the application
 * Based on the Figma design system using #FFF4E0 as the base color
 */

export const MILK_COLORS = {
  // Text colors
  /** Primary text - Use for main content, values, and data (100% opacity) */
  base: '#FFF4E0',
  
  /** Secondary text - Use for headers, labels, and less prominent text (64% opacity) */
  muted: 'rgba(255,244,224,0.64)',
  
  /** Disabled/placeholder text - Use for disabled states and placeholders (40% opacity) */
  dimmed: 'rgba(255,244,224,0.4)',
  
  // Interactive states
  /** Hover text - Use for text hover states (80% opacity) */
  hover: 'rgba(255,244,224,0.8)',
  
  /** High emphasis text - Use for important text and dropdown items (90% opacity) */
  emphasis: 'rgba(255,244,224,0.9)',
  
  // Background colors
  /** Very subtle background - Use for default button/input backgrounds (2% opacity) */
  bgSubtle: 'rgba(255,244,224,0.02)',
  
  /** Subtle background - Use for card backgrounds and panels (4% opacity) */
  bgCard: 'rgba(255,244,224,0.04)',
  
  /** Light background - Use for hover states and subtle emphasis (6% opacity) */
  bgLight: 'rgba(255,244,224,0.06)',
  
  /** Medium background - Use for selected/active states (8% opacity) */
  bgMedium: 'rgba(255,244,224,0.08)',
  
  // Border colors
  /** Subtle border - Use for dividers and subtle boundaries (10% opacity) */
  borderSubtle: 'rgba(255,244,224,0.1)',
  
  /** Default border - Use for input borders and standard boundaries (20% opacity) */
  borderDefault: 'rgba(255,244,224,0.2)',
} as const;

// Type for the color values
export type MilkColor = typeof MILK_COLORS[keyof typeof MILK_COLORS];