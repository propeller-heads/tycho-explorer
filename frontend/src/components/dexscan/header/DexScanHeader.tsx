// Module documentation: Main header component that organizes the application's navigation and controls
// Import the React library to build React components
import React from 'react';
// Import the HeaderBranding component for the left section of the header
import HeaderBranding from '@/components/dexscan/header/HeaderBranding';
// Import the HeaderActions component for the right section of the header
import HeaderActions from '@/components/dexscan/header/HeaderActions';
// Import the ViewSelector component for the center section of the header
import { ViewSelector } from '@/components/dexscan/ViewSelector';
// Import the MobileMenuButton component for mobile navigation
import MobileMenuButton from '@/components/dexscan/header/MobileMenuButton';
// Import Link for navigation
// import { Link } from 'react-router-dom';

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
    // Header element with responsive layout - stacks on mobile, row on desktop
    <header className="flex flex-row items-center justify-between bg-transparent px-6 pt-2 pb-0 w-full">
      {/* Mobile-only: Single row with all components */}
      <div className="sm:hidden flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <HeaderBranding />
          {/* TEMPORARY: Test link for NetworkManager */}
          {/* <Link 
            to="/graph-test"
            className="px-2 py-1 text-xs bg-purple-600 text-white rounded"
          >
            Test
          </Link> */}
        </div>
        <div className="flex items-center gap-2">
          <HeaderActions />
          <MobileMenuButton 
            currentView={currentView}
            onViewChange={onViewChange}
          />
        </div>
      </div>

      {/* Desktop-only: Left section with branding */}
      <div className="hidden sm:flex flex-shrink-0">
        <HeaderBranding />
      </div>

      {/* Desktop Center Section: Contains the view selector toggle buttons */}
      <div className="hidden sm:flex justify-center w-full sm:max-w-[475px] sm:mx-auto">
      {/* <div className="hidden sm:flex justify-center w-full sm:max-w-[475px] sm:mx-auto items-center gap-4"> */}
        {/* Render the ViewSelector component and pass props */}
        <ViewSelector 
          // Pass the current active view
          activeTab={currentView} 
          // Pass the callback for when view changes
          setActiveTab={onViewChange} 
        />
        {/* TEMPORARY: Test link for NetworkManager
        <Link 
          to="/graph-test"
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Test Graph
        </Link> */}
      </div>

      {/* Desktop Right Section */}
      <div className="hidden sm:block flex-shrink-0">
        {/* Render the HeaderActions component */}
        <HeaderActions />
      </div>
    </header>
  );
};

// Export the DexScanHeader component as the default export from this module
export default DexScanHeader;
