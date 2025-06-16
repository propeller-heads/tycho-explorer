import { MILK_COLORS } from '@/lib/colors';

// Filter component style constants
export const FILTER_STYLES = {
  // Button styles
  button: `h-10 sm:h-8 px-3 border-[${MILK_COLORS.borderDefault}] bg-[${MILK_COLORS.bgSubtle}] hover:bg-[${MILK_COLORS.bgLight}] text-sm text-[${MILK_COLORS.base}] font-normal`,
  buttonChevron: "ml-1 h-3 w-3 transition-transform duration-200",
  
  // Popover content styles
  popoverContent: `bg-[${MILK_COLORS.bgSubtle}] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]`,
  
  // Checkbox styles
  checkbox: `border-[${MILK_COLORS.muted}] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-transparent data-[state=checked]:text-white rounded-[4px] pointer-events-none`,
  
  // Item container styles
  itemContainer: `flex items-center space-x-2 p-1.5 rounded-md hover:bg-[${MILK_COLORS.bgLight}] cursor-pointer transition-all duration-200`,
  
  // Text styles
  noItemsText: `text-sm text-[${MILK_COLORS.dimmed}] text-center py-2`,
  selectedSectionText: `text-sm font-normal text-[${MILK_COLORS.emphasis}]`,
  selectedCountText: `text-xs text-[${MILK_COLORS.muted}]`,
  
  // Text color classes (for dynamic application)
  textColors: {
    selected: `font-normal text-[${MILK_COLORS.base}]`,
    unselected: `font-normal text-[${MILK_COLORS.emphasis}]`,
    secondary: `text-[${MILK_COLORS.muted}]`,
    selectedSecondary: `text-[${MILK_COLORS.hover}]`
  },
  
  // Border styles
  borderBottom: `border-b border-[${MILK_COLORS.borderSubtle}]`,
  
  // Icon styles
  chevronIcon: `h-3 w-3 text-[${MILK_COLORS.muted}]`,
  
  // Hover effects
  hoverBackground: `hover:bg-[${MILK_COLORS.bgSubtle}]`,
  
  // Specific component dimensions
  scrollArea: "h-auto max-h-[340px] sm:max-h-[408px] md:max-h-[476px] lg:max-h-[510px] max-h-[calc(80vh-120px)] p-2 overflow-y-auto",
  selectedScrollArea: "px-2 pb-2 h-auto max-h-[120px] sm:max-h-[150px] overflow-y-auto",
  
  // Color dot (for protocol filter)
  colorDot: "w-2.5 h-2.5 rounded-full transition-all duration-200",
  
  // Filter bar styles
  filterBar: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/10 gap-2",
  filterBarButtons: "flex flex-wrap items-center gap-2",
  resetButton: `h-10 sm:h-8 text-sm text-[${MILK_COLORS.muted}] hover:text-[${MILK_COLORS.base}] underline-offset-2`,
  blockNumberText: `text-sm font-medium text-[${MILK_COLORS.hover}]`,
  filterBarRight: "flex items-center gap-2 ml-auto sm:ml-0"
} as const;

// Export individual color values for inline styles
export const FILTER_COLORS = {
  chevron: MILK_COLORS.muted,
  unselected: MILK_COLORS.emphasis,
  secondary: MILK_COLORS.muted,
  popoverBorder: 'rgba(255,244,224,0.12)'
} as const;