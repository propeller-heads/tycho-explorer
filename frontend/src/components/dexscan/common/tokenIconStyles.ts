// Shared styling constants for token and protocol logos
export const tokenLogoBaseClasses = "rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden shrink-0";

// Text size classes based on icon size
export const getTextSizeClass = (size: number) => size <= 4 ? 'text-[9px]' : 'text-[10px]';

// Convert Tailwind size unit to rem
export const sizeToRem = (size: number) => size * 0.25;