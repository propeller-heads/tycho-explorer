// src/components/dexscan/graph/protocolColors.ts

/**
 * Defines the color mapping for different protocols.
 * Keys should be uppercase for consistent lookup.
 */
export const protocolColors: { [key: string]: string } = {
  'uniswap_v2': '#3B82F6',     // Dark Blue (Tailwind's blue-500 as an example)
  'uniswap_v3': '#2DD4BF',     // Teal/Cyan (Tailwind's teal-400 as an example)
  'vm:balancer_v2': '#F97316', // Orange/Red-Orange (Tailwind's orange-500 as an example)
  'uniswap_v4': '#FACC15',     // Yellow/Gold (Tailwind's yellow-400 as an example)
  // Add other protocols and their specific colors if needed
  // Fallback color will be applied if a protocol is not listed here.
};
