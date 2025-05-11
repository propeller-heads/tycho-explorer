// Import the React library to build React components
import React from 'react';
// Import the external link icon SVG from the assets folder
import CallMadeIcon from '@/assets/figma_header_icons/call_made.svg';
// Import the Ethereum logo image from the assets folder
import EthereumLogo from '@/assets/figma_header_icons/ethereum-logo.png';
// Import the dropdown arrow icon SVG from the assets folder
import ArrowDropdownIcon from '@/assets/figma_header_icons/arrow-dropdown-caret-sort-select-arrow.svg';

// Define an interface for network data to enforce type safety
interface Network {
  // The name of the blockchain network (e.g., "Ethereum")
  name: string;
  // The path to the network's logo image
  logo: string;
  // The current block number (optional, can be string or number)
  blockNumber?: string | number;
}

// Create a constant with the current network information to be displayed
const CurrentNetwork: Network = {
  // Set the network name to "Ethereum"
  name: 'Ethereum',
  // Use the imported Ethereum logo for the network image
  logo: EthereumLogo,
  // Set a placeholder block number (would typically come from blockchain data)
  blockNumber: '22,141,672',
};

// Define the HeaderActions component that renders in the right side of the application header
const HeaderActions: React.FC = () => {
  // Return the JSX for the component
  return (
    // Container div with flexbox layout, centered items, and 16px gap between children
    <div className="flex items-center gap-4">
      {/* Documentation link with external icon */}
      <a
        // Set the href (would be replaced with actual documentation URL)
        href="#"
        // Open link in a new tab
        target="_blank"
        // Add security for opening links in new tabs
        rel="noopener noreferrer"
        // Style the link with flexbox, small text, cream color, and hover effect
        className="flex items-center gap-1 text-sm font-normal text-[#FFF4E0] hover:text-[#FFF4E0]/90 transition-colors"
      >
        {/* Text content for the link */}
        <span>Docs</span>
        {/* External link icon */}
        <img 
          // Set the image source to the imported SVG
          src={CallMadeIcon} 
          // Set alt text for accessibility
          alt="External link" 
          // Set the size of the icon to 16x16 pixels
          className="h-4 w-4" 
          // Hide from screen readers since it's decorative
          aria-hidden="true"
        />
      </a>

      {/* Network selector button that shows current network and block */}
      <button
        // Set accessible label describing the button's purpose and current state
        aria-label={`Current network: ${CurrentNetwork.name}, Block: ${CurrentNetwork.blockNumber}`}
        // Style the button with flexbox, specific height, rounded corners, and hover effects
        className="flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 hover:bg-white/15 transition-colors"
      >
        {/* Network logo image */}
        <img 
          // Set the image source to the current network's logo
          src={CurrentNetwork.logo} 
          // Set alt text to describe the network
          alt={`${CurrentNetwork.name} logo`} 
          // Style the image as a circle with specific dimensions
          className="h-5 w-5 rounded-full" 
        />
        
        {/* Conditional rendering of block number if available */}
        {CurrentNetwork.blockNumber && (
          // Text element to display the block number
          <span className="text-xs font-medium text-[#FFF4E0]">
            {/* Prefix the block number with # */}
            #{CurrentNetwork.blockNumber}
          </span>
        )}
        
        {/* Dropdown arrow icon to indicate the button is clickable */}
        <img 
          // Set the image source to the imported dropdown arrow SVG
          src={ArrowDropdownIcon} 
          // Set alt text for accessibility
          alt="Select network" 
          // Style the image with a small margin and specific dimensions
          className="ml-0.5 h-4 w-4" 
          // Hide from screen readers since it's decorative
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

// Export the HeaderActions component as the default export from this module
export default HeaderActions;
