import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DexScanHeader } from './DexScanHeader';
import { ViewSelector } from './ViewSelector';
import ListView from './ListView';
import { WebSocketConfig } from './WebSocketConfig';
import { PoolDataProvider, usePoolData } from './context/PoolDataContext';
import { Button } from '@/components/ui/button';
import { Globe, PlugZap, ChevronDown, ChevronUp, X } from 'lucide-react';
import GraphViewContent from './graph/GraphViewContent';

// Main content component using context
const DexScanContentMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'graph' | 'pools'>(
    tabParam === 'graph' ? 'graph' : 'pools'
  );

  // Add state for WebSocket panel collapse
  const [wsConfigExpanded, setWsConfigExpanded] = useState(false);
  const wsConfigRef = useRef<HTMLDivElement>(null);
  const wsButtonRef = useRef<HTMLButtonElement>(null);

  // Refs for view containers
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const poolListContainerRef = useRef<HTMLDivElement>(null);

  const {
    websocketUrl,
    isConnected,
    poolsArray,
    highlightedPoolId,
    connectToWebSocket,
    highlightPool,
    isReconnecting,
    reconnectAttempt,
    maxReconnectAttempts,
    blockNumber,
    selectedChain
  } = usePoolData();

  // Update the URL when the tab changes
  const handleTabChange = (tab: 'graph' | 'pools') => {
    console.log("Changing tab to:", tab, new Date().toISOString());
    
    // Don't update state if we're already on this tab
    if (activeTab === tab) {
      console.log("Already on tab:", tab, "- skipping state update");
      return;
    }
    
    setActiveTab(tab);
    // DOM visibility is now handled only in the useEffect to avoid duplicate work
  };

  useEffect(() => {
    console.log("URL tab sync effect running", tabParam, activeTab, new Date().toISOString());

    // Only update the tab state if the URL parameter doesn't match the current state
    if (tabParam === 'graph' && activeTab !== 'graph') {
      console.log("URL changing tab to graph");
      setActiveTab('graph');
    } else if (tabParam === 'pools' && activeTab !== 'pools') {
      console.log("URL changing tab to pools");
      setActiveTab('pools');
    }

  }, [tabParam, searchParams]);

  // Initialize view visibility based on active tab
  useEffect(() => {
    console.log("View visibility effect running for tab:", activeTab, new Date().toISOString());
    if (graphContainerRef.current && poolListContainerRef.current) {
      if (activeTab === 'graph') {
        poolListContainerRef.current.style.display = 'none';
        graphContainerRef.current.style.display = 'block';
      } else {
        graphContainerRef.current.style.display = 'none';
        poolListContainerRef.current.style.display = 'block';
      }
    }
  }, [activeTab]);

  // Toggle WebSocket config panel
  const toggleWsConfig = () => {
    setWsConfigExpanded(prev => !prev);
  };

  // Close WebSocket config panel
  const closeWsConfig = () => {
    setWsConfigExpanded(false);
  };

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wsConfigExpanded &&
        wsConfigRef.current &&
        !wsConfigRef.current.contains(event.target as Node) &&
        wsButtonRef.current &&
        !wsButtonRef.current.contains(event.target as Node)
      ) {
        setWsConfigExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wsConfigExpanded]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center relative mb-6 md:mb-0">
        <DexScanHeader />
      </div>

      <div className="flex flex-col gap-4 mx-12">
        <div className="flex justify-between items-center">
          <ViewSelector
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />

          {/* WebSocket Connection Indicator and Toggle */}
          <div className="relative z-10">
            <div className="flex flex-col items-end">
              <Button
                ref={wsButtonRef}
                variant="ghost"
                size="sm"
                className={`flex items-center ${isConnected ? 'text-green-500' : isReconnecting ? 'text-amber-500' : 'text-red-500'} text-xs md:text-sm`}
                onClick={toggleWsConfig}
              >
                {isConnected ? (
                  <PlugZap className="h-4 w-4 mr-1.5" />
                ) : (
                  <Globe className="h-4 w-4 mr-1.5" />
                )}
                <span className="hidden xs:inline">
                  {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
                </span>
                {/* Display current chain and block number when connected */}
                {isConnected && blockNumber > 0 && (
                  <span className="font-medium text-sm ml-2 bg-background/30 px-2 py-0.5 rounded border border-green-500/20">
                    {selectedChain} #{blockNumber.toLocaleString()}
                  </span>
                )}
                {wsConfigExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-1 xs:ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1 xs:ml-2" />
                )}
              </Button>

              {/* Collapsible WebSocket Config */}
              {wsConfigExpanded && (
                <div
                  ref={wsConfigRef}
                  className="mt-2 w-72 md:w-80 shadow-lg absolute top-10 right-0 z-20"
                >
                  <div className="bg-card rounded-lg border shadow-lg relative">
                    <div className="flex items-center p-2 border-b">
                      <h3 className="text-sm font-medium mr-auto">WebSocket Connection</h3>
                      {isConnected && blockNumber > 0 && (
                        <div className="text-sm font-medium text-green-500 mx-2">
                          {selectedChain} #{blockNumber.toLocaleString()}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={closeWsConfig}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-3">
                      <WebSocketConfig
                        onConnect={connectToWebSocket}
                        defaultUrl={websocketUrl}
                        isConnected={isConnected}
                        isReconnecting={isReconnecting}
                        reconnectAttempt={reconnectAttempt}
                        maxReconnectAttempts={maxReconnectAttempts}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render both views but control visibility with CSS */}
        <div ref={graphContainerRef} style={
          {
            display: activeTab === 'graph' ? 'block' : 'none',
            height: "100%",  // Increase from 500px
            width: "100%",
            position: "relative",
            overflow: "hidden"  // Prevent scrollbars
          }
        }>
          <GraphViewContent />
          {/* <TestGraph /> */}
        </div>

        <div ref={poolListContainerRef} style={{ display: activeTab === 'pools' ? 'block' : 'none' }}>
          <ListView
            pools={poolsArray}
            highlightedPoolId={highlightedPoolId}
            onPoolSelect={highlightPool}
          />
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides the context
export const DexScanContent = () => {
  return (
    <PoolDataProvider>
      <DexScanContentMain />
    </PoolDataProvider>
  );
};
