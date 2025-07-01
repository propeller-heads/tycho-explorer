// Filter component style constants
export const FILTER_STYLES = {
  // Button styles
  button: "h-10 sm:h-8 px-3 border border-milk-border-default bg-milk-bg-subtle hover:bg-milk-bg-light text-sm text-milk-base font-normal w-full sm:w-auto",
  buttonChevron: "h-3 w-3 transition-transform duration-200",
  
  // Popover content styles
  popoverContent: "bg-milk-bg-subtle backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)] z-[1100]",
  
  // Checkbox styles
  checkbox: "border-milk-muted data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-transparent data-[state=checked]:text-white rounded-[4px] pointer-events-none",
  
  // Item container styles
  itemContainer: "flex items-center space-x-2 p-1.5 rounded-md hover:bg-milk-bg-light cursor-pointer transition-all duration-200",
  
  // Text styles
  noItemsText: "text-sm text-milk-dimmed text-center py-2",
  selectedSectionText: "text-sm font-normal text-milk-emphasis",
  selectedCountText: "text-xs text-milk-muted",
  
  // Text color classes (for dynamic application)
  textColors: {
    selected: "font-normal text-milk-base",
    unselected: "font-normal text-milk-emphasis",
    secondary: "text-milk-muted",
    selectedSecondary: "text-milk-hover"
  },
  
  // Border styles
  borderBottom: "border-b border-milk-border-subtle",
  
  // Icon styles
  chevronIcon: "h-3 w-3 text-milk-muted",
  
  // Hover effects
  hoverBackground: "hover:bg-milk-bg-subtle",
  
  // Specific component dimensions
  scrollArea: "h-auto max-h-[340px] sm:max-h-[408px] md:max-h-[476px] lg:max-h-[510px] max-h-[calc(80vh-120px)] p-2 overflow-y-auto",
  selectedScrollArea: "px-2 pb-2 h-auto max-h-[120px] sm:max-h-[150px] overflow-y-auto",
  
  // Color dot (for protocol filter)
  colorDot: "w-2.5 h-2.5 rounded-full transition-all duration-200",
  
  // Filter bar styles
  filterBar: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/10 gap-2 justify-between",
  filterBarButtons: "flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2",
  resetButton: "h-10 sm:h-8 text-sm text-milk-muted hover:text-milk-base underline-offset-2",
  blockNumberText: "text-sm font-medium text-milk-hover",
  filterBarRight: "flex items-center gap-2"
} as const;