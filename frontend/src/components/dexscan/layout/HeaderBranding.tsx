// Import the React library to build React components
import React from 'react';
import TychoLogo from '@/assets/figma_header_icons/tycho-header-logo.svg';
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
      
      <img 
        src={TychoLogo} 
        alt="Tycho Explorer" 
        className="w-[109.691px] h-[24px] sm:w-auto sm:h-6" 
      />
    </div>
  );
};

// Export the HeaderBranding component as the default export from this module
export default HeaderBranding;
