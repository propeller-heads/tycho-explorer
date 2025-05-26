// Import the React library to build React components
import React from 'react';
// Import the Tycho Indexer SVG icon from the assets folder using alias path
import TychoIndexerLightSmallIcon from '@/assets/figma_header_icons/tycho-indexer-light-small.svg';
// Import the AppMenuSelector component
import AppMenuSelector from './AppMenuSelector';

// Define a functional component named HeaderBranding with no props
const HeaderBranding: React.FC = () => {
  // Return JSX for rendering
  return (
    // Outer container with flexbox layout, vertically centered items and 16px gap (gap-4)
    <div className="flex items-center gap-4"> {/* Corresponds to Frame 152534 gap-4 is approx 16px */}
      {/* App menu selector */}
      <AppMenuSelector />
      
      {/* Logo and Explorer Text - Corresponds to Frame 152361 7675:7895 */}
      {/* Inner container with flexbox layout, vertically centered items and 12px gap (gap-3) */}
      <div className="flex items-center gap-3"> {/* gap-3 is 12px */}
        {/* Render the Tycho Indexer logo with height of 24px (h-6) and accessibility alt text */}
        <img src={TychoIndexerLightSmallIcon} alt="Tycho Indexer Logo" className="h-6" />
        {/* Text element with sans-serif font, 24px (h-6), cream color at 50% opacity */}
        <span className="font-sans h-6 text-[#FFF4E1] opacity-50">
          {/* The actual text content */}
          Explorer
        </span>
      </div>
    </div>
  );
};

// Export the HeaderBranding component as the default export from this module
export default HeaderBranding;
