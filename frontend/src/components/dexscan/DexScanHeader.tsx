// Module documentation: Main header component that organizes the application's navigation and controls
// Import the React library to build React components
import React from 'react';
// Import the HeaderBranding component for the left section of the header
import HeaderBranding from '@/components/dexscan/header/HeaderBranding';
// Import the HeaderActions component for the right section of the header
import HeaderActions from '@/components/dexscan/header/HeaderActions';
// Import the ViewSelector component for the center section of the header
import { ViewSelector } from '@/components/dexscan/ViewSelector';

// Define an interface for the props that this component accepts
interface DexScanHeaderProps {
  // The currently active view identifier (either 'list' or 'graph')
  currentView: "graph" | "pools";
  // A callback function that is triggered when a user selects a different view
  onViewChange: (view: "graph" | "pools") => void;
}

// Define the DexScanHeader component with typed props
const DexScanHeader: React.FC<DexScanHeaderProps> = ({ currentView, onViewChange }) => {
  // Return the JSX for the component
  return (
    // Header element with flexbox layout, fixed height, centered items, and transparent background
    <header className="flex h-[72px] items-center justify-between bg-transparent px-6 py-0 w-full">
      {/* Left Section: Contains the branding (logo and "Explorer" text) */}
      <div className="flex-shrink-0">
        {/* Render the HeaderBranding component */}
        <HeaderBranding />
      </div>

      {/* Center Section: Contains the view selector toggle buttons */}
      <div className="flex flex-grow justify-center max-w-[475px] mx-auto">
        {/* Render the ViewSelector component and pass props */}
        <ViewSelector 
          // Pass the current active view
          activeTab={currentView} 
          // Pass the callback for when view changes
          setActiveTab={onViewChange} 
        />
      </div>

      {/* Right Section: Contains the documentation link and network selector */}
      <div className="flex-shrink-0">
        {/* Render the HeaderActions component */}
        <HeaderActions />
      </div>
    </header>
  );
};

// Export the DexScanHeader component as the default export from this module
export default DexScanHeader;
