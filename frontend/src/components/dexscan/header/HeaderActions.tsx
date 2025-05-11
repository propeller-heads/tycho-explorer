// Module: HeaderActions
// Description: Defines the right-hand side actions in the application header,
// including a documentation link and a WebSocket connection indicator.

// Import React and necessary hooks
import React, { useState, useEffect, useRef } from 'react';
// Import SVG and PNG assets
import CallMadeIcon from '@/assets/figma_header_icons/call_made.svg';
import EthereumLogo from '@/assets/figma_header_icons/ethereum-logo.png'; // Default/fallback chain logo
// Import UI components
import { Button } from '@/components/ui/button';
// Import icons from lucide-react
import { Globe, PlugZap, ChevronDown, ChevronUp, X } from 'lucide-react';
// Import custom hooks and context consumers
import { usePoolData } from '@/components/dexscan/context/PoolDataContext';
// Import sub-components
import { WebSocketConfig } from '@/components/dexscan/WebSocketConfig';

// --- Constants for Strings and URLs ---
// URL for the documentation page
const DOCS_URL = "https://docs.propellerheads.xyz/";
// Alt text for the external link icon
const ALT_TEXT_EXTERNAL_LINK = "External link";
// Prefix for chain logo alt text
const ALT_TEXT_CHAIN_LOGO_PREFIX = " logo";
// Display text for the "Docs" link
const TEXT_DOCS = "Docs";
// Title for the WebSocket connection panel
const TEXT_WS_CONNECTION_TITLE = "WebSocket Connection";
// Display text for disconnected state
const TEXT_DISCONNECTED = "Disconnected";

// --- CSS Class Constants ---
// Styling for the "Docs" link
const DOCS_LINK_CLASSES = "flex items-center gap-1 text-sm font-normal text-[#FFF4E0] hover:text-[#FFF4E0]/90 transition-colors";
// Styling for the WebSocket indicator trigger button
const WS_INDICATOR_BUTTON_CLASSES = "flex h-9 items-center gap-1.5 rounded-xl bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.1)] px-3 py-1.5 transition-colors text-[#FFF4E0]";
// Styling for the WebSocket configuration panel container
const WS_PANEL_CLASSES = "mt-2 w-72 md:w-80 shadow-lg absolute top-full right-0 z-50";
// Styling for the card appearance of the WebSocket panel
const WS_PANEL_CARD_CLASSES = "bg-card rounded-lg border shadow-lg relative";
// Styling for the header section of the WebSocket panel
const WS_PANEL_HEADER_CLASSES = "flex items-center p-2 border-b";
// Styling for the close button within the WebSocket panel
const WS_PANEL_CLOSE_BUTTON_CLASSES = "h-6 w-6 p-0 ml-1";
// Base styling for icons within the WebSocket indicator button
const WS_ICON_BASE_CLASSES = "h-4 w-4";

// --- WebSocketIndicator Component ---
// Props definition for WebSocketIndicator
interface WebSocketIndicatorProps {
  // The URL for the WebSocket connection
  websocketUrl: string;
  // Boolean indicating if the WebSocket is currently connected
  isConnected: boolean;
  // Function to initiate WebSocket connection
  connectToWebSocket: (url: string) => void;
  // Current block number from the WebSocket connection
  blockNumber: number;
  // Name of the currently selected blockchain
  selectedChain: string;
  // Path or source for the chain logo image
  chainLogo: string;
}

// Component: WebSocketIndicator
// Purpose: Displays WebSocket connection status and provides an interface to configure the connection.
// Signature: (props: WebSocketIndicatorProps) => JSX.Element
const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({
  websocketUrl,
  isConnected,
  connectToWebSocket,
  blockNumber,
  selectedChain,
  chainLogo,
}) => {
  // State: wsConfigExpanded
  // Purpose: Manages the visibility of the WebSocket configuration panel.
  // Data Definition: boolean, true if panel is expanded, false otherwise.
  const [wsConfigExpanded, setWsConfigExpanded] = useState(false);

  // Ref: wsConfigRef
  // Purpose: Reference to the WebSocket configuration panel's DOM element for click-outside detection.
  const wsConfigRef = useRef<HTMLDivElement>(null);
  // Ref: wsButtonRef
  // Purpose: Reference to the WebSocket trigger button's DOM element for click-outside detection.
  const wsButtonRef = useRef<HTMLButtonElement>(null);

  // Function: toggleWsConfig
  // Purpose: Toggles the visibility of the WebSocket configuration panel.
  // Signature: () => void
  const toggleWsConfig = () => setWsConfigExpanded(prev => !prev);

  // Function: closeWsConfig
  // Purpose: Closes the WebSocket configuration panel.
  // Signature: () => void
  const closeWsConfig = () => setWsConfigExpanded(false);

  // Effect: handleClickOutside
  // Purpose: Handles clicks outside the WebSocket panel to close it.
  useEffect(() => {
    // Function: handleClickOutside (event listener)
    // Purpose: Checks if a click event occurred outside the panel and button.
    const handleClickOutside = (event: MouseEvent) => {
      // Check if panel is expanded and click is outside both panel and button
      if (
        wsConfigExpanded &&
        wsConfigRef.current &&
        !wsConfigRef.current.contains(event.target as Node)
      ) {
        // Close the panel if click is outside
        closeWsConfig();
      }
    };
    // Add event listener for mousedown
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup: Remove event listener when component unmounts or wsConfigExpanded changes
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wsConfigExpanded]); // Dependency array includes wsConfigExpanded

  // Determine color class for status icons based on connection state
  const statusIconColorClass = isConnected ? 'text-green-400' : 'text-red-400';

  // JSX Element: StatusVisualIcon
  // Purpose: Displays PlugZap (connected) or Globe (disconnected) icon with appropriate styling.
  const StatusVisualIcon = isConnected ? (
    <PlugZap className={`${WS_ICON_BASE_CLASSES} ${statusIconColorClass}`} />
  ) : (
    <Globe className={`${WS_ICON_BASE_CLASSES} ${statusIconColorClass}`} />
  );

  // JSX Element: ChevronDisplayIcon
  // Purpose: Displays ChevronUp (panel expanded) or ChevronDown (panel collapsed) icon.
  const ChevronDisplayIcon = wsConfigExpanded ? (
    <ChevronUp className={`${WS_ICON_BASE_CLASSES} ml-1`} />
  ) : (
    <ChevronDown className={`${WS_ICON_BASE_CLASSES} ml-1`} />
  );

  // Render the WebSocketIndicator component
  return (
    // Relative container for positioning the absolute panel
    <div className="relative">
      {/* Button to toggle WebSocket configuration panel */}
      <Button
        ref={wsButtonRef}
        variant="ghost"
        // Removed aria-label as per no-accessibility guideline
        className={WS_INDICATOR_BUTTON_CLASSES}
        onClick={toggleWsConfig}
      >
        {/* Display the status icon (PlugZap or Globe) */}
        {StatusVisualIcon}
        
        {/* Display chain logo if connected and chain is selected */}
        {isConnected && selectedChain && (
          <img src={chainLogo} alt={`${selectedChain}${ALT_TEXT_CHAIN_LOGO_PREFIX}`} className="h-5 w-5 rounded-full" />
        )}
        
        {/* Display connection text: Chain & Block or "Disconnected" */}
        {isConnected && blockNumber > 0 ? (
          // Display chain name and block number if connected
          <span className="text-xs font-medium">
            {selectedChain} #{blockNumber.toLocaleString()}
          </span>
        ) : (
          // Display "Disconnected" text if not connected
          !isConnected && <span className="text-xs font-medium">{TEXT_DISCONNECTED}</span>
        )}
        
        {/* Display the chevron icon (Up or Down) */}
        {ChevronDisplayIcon}
      </Button>

      {/* Conditionally render the WebSocket configuration panel */}
      {wsConfigExpanded && (
        // Panel container div, referenced by wsConfigRef
        <div ref={wsConfigRef} className={WS_PANEL_CLASSES}>
          {/* Panel card styling */}
          <div className={WS_PANEL_CARD_CLASSES}>
            {/* Panel header section */}
            <div className={WS_PANEL_HEADER_CLASSES}>
              {/* Panel title */}
              <h3 className="text-sm font-medium mr-auto">{TEXT_WS_CONNECTION_TITLE}</h3>
              {/* Display chain and block in panel header if connected */}
              {isConnected && blockNumber > 0 && (
                <div className={`text-sm font-medium mx-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedChain} #{blockNumber.toLocaleString()}
                </div>
              )}
              {/* Close button for the panel */}
              <Button
                variant="ghost"
                size="sm"
                className={WS_PANEL_CLOSE_BUTTON_CLASSES}
                onClick={closeWsConfig}
              >
                <X className={WS_ICON_BASE_CLASSES} />
              </Button>
            </div>
            {/* Panel content section for WebSocket configuration */}
            <div className="p-3">
              <WebSocketConfig
                onConnect={connectToWebSocket}
                defaultUrl={websocketUrl}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HeaderActions Component ---
// Component: HeaderActions
// Purpose: Renders the actions section of the main application header.
// Signature: () => JSX.Element
const HeaderActions: React.FC = () => {
  // Hook: usePoolData
  // Purpose: Retrieves WebSocket connection data and other pool-related information from context.
  const {
    websocketUrl,
    isConnected,
    connectToWebSocket,
    blockNumber,
    selectedChain,
  } = usePoolData();

  // Determine chain logo - placeholder, ideally this comes from a map or context
  // TODO: Implement a more robust chain logo mapping if multiple chains are supported.
  const chainLogo = selectedChain === 'Ethereum' ? EthereumLogo : EthereumLogo;

  // Render the HeaderActions component
  return (
    // Main container for header actions, using flexbox and gap
    <div className="flex items-center gap-4">
      {/* Documentation link */}
      <a
        href={DOCS_URL} // Use constant for URL
        target="_blank"
        rel="noopener noreferrer"
        className={DOCS_LINK_CLASSES} // Use constant for styling
      >
        <span>{TEXT_DOCS}</span> {/* Use constant for text */}
        {/* External link icon, removed aria-hidden */}
        <img src={CallMadeIcon} alt={ALT_TEXT_EXTERNAL_LINK} className="h-4 w-4" />
      </a>

      {/* WebSocket Indicator component instance */}
      <WebSocketIndicator
        websocketUrl={websocketUrl}
        isConnected={isConnected}
        connectToWebSocket={connectToWebSocket}
        blockNumber={blockNumber}
        selectedChain={selectedChain}
        chainLogo={chainLogo}
      />
    </div>
  );
};

// Export HeaderActions as the default export for this module
export default HeaderActions;
