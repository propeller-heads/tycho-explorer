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
    // Outer container with flexbox layout, vertically centered items and responsive gap
    <div className="flex items-center gap-2 sm:gap-4"> {/* Responsive gap: 8px mobile, 16px desktop */}
      {/* App menu selector */}
      <AppMenuSelector />
      
      {/* Logo and Explorer Text - Corresponds to Frame 152361 7675:7895 */}
      {/* Inner container with flexbox layout, vertically centered items and responsive gap */}
      <div className="flex items-center gap-2 sm:gap-3"> {/* Responsive gap: 8px mobile, 12px desktop */}
        {/* Render the Tycho Indexer logo with responsive height */}
        <img src={TychoIndexerLightSmallIcon} alt="Tycho Indexer Logo" className="h-5 sm:h-6" />
        {/* Text element with responsive font size, cream color at 50% opacity */}
        <span className="font-sans text-sm sm:text-base text-[#FFF4E1] opacity-50">
          {/* The actual text content */}
          Explorer
        </span>
      </div>
    </div>
  );
};

// Export the HeaderBranding component as the default export from this module
export default HeaderBranding;
