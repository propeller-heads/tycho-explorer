// Filter component style constants
export const FILTER_STYLES = {
  // Button styles
  button: "h-10 sm:h-8 px-3 border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]",
  buttonChevron: "ml-1 h-3 w-3 transition-transform duration-200",
  
  // Popover content styles
  popoverContent: "bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]",
  
  // Checkbox styles
  checkbox: "border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none pointer-events-none",
  
  // Item container styles
  itemContainer: "flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer transition-all duration-200",
  
  // Text styles
  noItemsText: "text-xs text-[rgba(255,244,224,0.4)] text-center py-2",
  selectedSectionText: "text-xs font-medium text-[rgba(255,244,224,0.8)]",
  selectedCountText: "text-xs text-[rgba(255,244,224,0.6)]",
  
  // Text color classes (for dynamic application)
  textColors: {
    selected: "font-semibold text-[rgba(255,244,224,1)]",
    unselected: "font-medium text-[rgba(255,244,224,0.9)]",
    secondary: "text-[rgba(255,244,224,0.6)]",
    selectedSecondary: "text-[rgba(255,244,224,0.8)]"
  },
  
  // Border styles
  borderBottom: "border-b border-[rgba(255,244,224,0.1)]",
  
  // Icon styles
  chevronIcon: "h-3 w-3 text-[rgba(255,244,224,0.6)]",
  
  // Hover effects
  hoverBackground: "hover:bg-[rgba(255,244,224,0.02)]",
  
  // Specific component dimensions
  scrollArea: "h-[200px] p-2",
  selectedScrollArea: "px-2 pb-2 max-h-[120px] overflow-y-auto",
  
  // Color dot (for protocol filter)
  colorDot: "w-2.5 h-2.5 rounded-full transition-all duration-200",
  
  // Search input styles
  searchIcon: "mr-2 h-4 w-4 shrink-0 text-[rgba(255,244,224,0.4)]",
  searchInput: "border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-xs bg-transparent text-[rgba(255,244,224,1)] placeholder:text-[rgba(255,244,224,0.4)]",
  
  // Filter bar styles
  filterBar: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/10 gap-3",
  filterBarButtons: "flex flex-wrap items-center gap-2",
  resetButton: "h-10 sm:h-8 text-xs text-[rgba(255,244,224,0.64)] hover:text-[rgba(255,244,224,1)] underline-offset-2",
  blockNumberText: "text-sm font-medium text-[rgba(255,244,224,0.8)]",
  filterBarRight: "flex items-center gap-2 ml-auto sm:ml-0"
} as const;

// Style constants for inline styles
export const FILTER_INLINE_STYLES = {
  searchContainer: {
    backgroundColor: "rgba(255, 244, 224, 0.02)",
    borderRadius: "8px",
    borderStyle: "solid" as const,
    padding: "8px 12px",
    transition: "border-color 0.2s ease-in-out, border-width 0.2s ease-in-out"
  },
  searchContainerFocused: {
    borderWidth: "2px",
    borderColor: '#FF3366'
  },
  searchContainerUnfocused: {
    borderWidth: "1px",
    borderColor: 'rgba(255, 244, 224, 0.2)'
  }
} as const;