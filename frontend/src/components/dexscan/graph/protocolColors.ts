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
  'vm:curve': '#22C55E',       // Green (Tailwind's green-500 as an example)
  'sushiswap_v2': '#EC4899',   // Pink (Tailwind's pink-500 as an example)
  'pancakeswap_v2': '#D1884F', // Brownish-orange
  'pancakeswap_v3': '#8B5CF6', // Violet (Tailwind's violet-500 as an example)
  'ekubo_v2': '#6366F1',       // Indigo (Tailwind's indigo-500 as an example)
  // Add other protocols and their specific colors if needed
  // Fallback color will be applied if a protocol is not listed here.
};
