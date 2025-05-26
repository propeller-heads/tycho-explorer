// Module: HeaderActions
// Description: Defines the actions in the application header,
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
const DOCS_URL = "https://docs.propellerheads.xyz/";
const ALT_TEXT_EXTERNAL_LINK = "External link";
const ALT_TEXT_CHAIN_LOGO_PREFIX = " logo";
const TEXT_DOCS = "Docs";
const TEXT_WS_CONNECTION_TITLE = "WebSocket Connection";
const TEXT_DISCONNECTED = "Disconnected";

// --- CSS Class Constants ---
const DOCS_LINK_CLASSES = "flex items-center gap-1 text-sm font-normal text-[#FFFFFF] hover:text-[#FFFFFF]/90 transition-colors";
const WS_INDICATOR_BUTTON_CLASSES = "flex h-9 items-center gap-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] px-3 py-1.5 transition-colors text-[#FFFFFF]";
const WS_PANEL_CLASSES = "mt-2 w-72 md:w-80 shadow-lg absolute top-full right-0 z-50";
const WS_PANEL_CARD_CLASSES = "bg-card rounded-lg border shadow-lg relative";
const WS_PANEL_HEADER_CLASSES = "flex items-center p-2 border-b";
const WS_PANEL_CLOSE_BUTTON_CLASSES = "h-6 w-6 p-0 ml-1";
const WS_ICON_BASE_CLASSES = "h-4 w-4";

// --- WebSocketIndicator Component ---
interface WebSocketIndicatorProps {
  websocketUrl: string;
  isConnected: boolean;
  connectToWebSocket: (url: string) => void;
  selectedChain: string;
  chainLogo: string;
}

const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({
  websocketUrl,
  isConnected,
  connectToWebSocket,
  selectedChain,
  chainLogo,
}) => {
  const [wsConfigExpanded, setWsConfigExpanded] = useState(false);
  const wsConfigRef = useRef<HTMLDivElement>(null);
  const wsButtonRef = useRef<HTMLButtonElement>(null);

  const toggleWsConfig = () => setWsConfigExpanded(prev => !prev);
  const closeWsConfig = () => setWsConfigExpanded(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wsConfigExpanded &&
        wsConfigRef.current &&
        !wsConfigRef.current.contains(event.target as Node) &&
        wsButtonRef.current && // Corrected: wsButtonRef check
        !wsButtonRef.current.contains(event.target as Node) // Corrected: wsButtonRef check
      ) {
        closeWsConfig();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wsConfigExpanded]);

  const statusIconColorClass = isConnected ? 'text-green-400' : 'text-red-400';

  const StatusVisualIcon = isConnected ? (
    <PlugZap className={`${WS_ICON_BASE_CLASSES} ${statusIconColorClass}`} />
  ) : (
    <Globe className={`${WS_ICON_BASE_CLASSES} ${statusIconColorClass}`} />
  );

  const ChevronDisplayIcon = wsConfigExpanded ? (
    <ChevronUp className={`${WS_ICON_BASE_CLASSES} ml-1`} />
  ) : (
    <ChevronDown className={`${WS_ICON_BASE_CLASSES} ml-1`} />
  );

  return (
    <div className="relative">
      <Button
        ref={wsButtonRef}
        variant="ghost"
        className={WS_INDICATOR_BUTTON_CLASSES}
        onClick={toggleWsConfig}
      >
        {StatusVisualIcon}
        
        {isConnected && selectedChain && (
          <img src={chainLogo} alt={`${selectedChain}${ALT_TEXT_CHAIN_LOGO_PREFIX}`} className="h-5 w-5 rounded-full" />
        )}
        
        {isConnected && selectedChain ? (
          <span className="text-xs font-medium">
            {selectedChain}
          </span>
        ) : (
          !isConnected && <span className="text-xs font-medium">{TEXT_DISCONNECTED}</span>
        )}
        
        {ChevronDisplayIcon}
      </Button>

      {wsConfigExpanded && (
        <div ref={wsConfigRef} className={WS_PANEL_CLASSES}>
          <div 
            className="overflow-hidden shadow-lg relative" // Keep overflow-hidden, shadow-lg, relative. Remove bg-card, rounded-lg, border.
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "12px",
              color: "#FFFFFF", // Default text color for the panel
              // boxShadow: "0px 4px 16px 0px rgba(37, 0, 63, 0.2)", // shadow-lg is present, let's see if it's sufficient or if this specific one is needed
              backdropFilter: "blur(10.4px)",
              WebkitBackdropFilter: "blur(10.4px)",
            }}
          >
            <div className={WS_PANEL_HEADER_CLASSES}>
              <h3 className="text-sm font-medium mr-auto">{TEXT_WS_CONNECTION_TITLE}</h3>
              {isConnected && selectedChain && (
                <div className={`text-sm font-medium mx-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedChain}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={WS_PANEL_CLOSE_BUTTON_CLASSES}
                onClick={closeWsConfig}
              >
                <X className={WS_ICON_BASE_CLASSES} />
              </Button>
            </div>
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
const HeaderActions: React.FC = () => {
  const {
    websocketUrl,
    isConnected,
    connectToWebSocket,
    selectedChain,
  } = usePoolData();

  const chainLogo = selectedChain === 'Ethereum' ? EthereumLogo : EthereumLogo;

  return (
    <div className="flex items-center gap-4">
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={DOCS_LINK_CLASSES}
      >
        <span>{TEXT_DOCS}</span>
        <img src={CallMadeIcon} alt={ALT_TEXT_EXTERNAL_LINK} className="h-4 w-4" />
      </a>
      <WebSocketIndicator
        websocketUrl={websocketUrl}
        isConnected={isConnected}
        connectToWebSocket={connectToWebSocket}
        selectedChain={selectedChain}
        chainLogo={chainLogo}
      />
    </div>
  );
};

export default HeaderActions;
