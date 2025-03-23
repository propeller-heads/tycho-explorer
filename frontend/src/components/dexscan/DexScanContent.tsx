import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DexScanHeader } from './DexScanHeader';
import { ViewSelector } from './ViewSelector';
import ListView from './ListView';
import { WebSocketConfig } from './WebSocketConfig';
import { PoolDataProvider, usePoolData } from './context/PoolDataContext';
import { Button } from '@/components/ui/button';
import { Globe, PlugZap, ChevronDown, ChevronUp, X } from 'lucide-react';

// Main content component using context
const DexScanContentMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  // Get scrollToPool parameter from URL
  const scrollToPoolParam = searchParams.get('scrollToPool') === 'true';
  const [shouldScrollToPool, setShouldScrollToPool] = useState(scrollToPoolParam);
  
  const [activeTab, setActiveTab] = useState<'graph' | 'pools'>(
    tabParam === 'pools' ? 'pools' : 'graph'
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
    pools, 
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
    setActiveTab(tab);
    
    // Remove the scrollToPool parameter when changing tabs manually
    // (we only want to scroll when coming from a "View pool" click)
    if (searchParams.get('scrollToPool')) {
      searchParams.delete('scrollToPool');
      navigate(`/?${searchParams.toString()}`);
    } else {
      navigate(`/?tab=${tab}`);
    }
    
    // Smoothly transition between views
    if (tab === 'graph' && graphContainerRef.current && poolListContainerRef.current) {
      poolListContainerRef.current.style.display = 'none';
      graphContainerRef.current.style.display = 'block';
    } else if (tab === 'pools' && graphContainerRef.current && poolListContainerRef.current) {
      graphContainerRef.current.style.display = 'none';
      poolListContainerRef.current.style.display = 'block';
    }
  };
  
  // Keep tab state in sync with URL and handle scroll parameter
  useEffect(() => {
    const newScrollToPool = searchParams.get('scrollToPool') === 'true';
    
    if (tabParam === 'pools' && activeTab !== 'pools') {
      setActiveTab('pools');
      // Only set scrollToPool if we're switching to pools tab and parameter is present
      setShouldScrollToPool(newScrollToPool);
    } else if (tabParam !== 'pools' && activeTab !== 'graph') {
      setActiveTab('graph');
      // Reset scroll flag when switching to graph
      setShouldScrollToPool(false);
    }
    
    // If we're already on the pools tab and scrollToPool was just added to URL
    if (activeTab === 'pools' && newScrollToPool && !shouldScrollToPool) {
      setShouldScrollToPool(true);
    }
  }, [tabParam, searchParams, activeTab, shouldScrollToPool]);
  
  // Reset scroll flag after it's been used
  useEffect(() => {
    if (shouldScrollToPool) {
      // Reset the flag after a short delay to ensure the scrolling has time to happen
      const timer = setTimeout(() => {
        setShouldScrollToPool(false);
        // Remove the parameter from URL if it's still there
        if (searchParams.get('scrollToPool')) {
          searchParams.delete('scrollToPool');
          navigate(`/?${searchParams.toString()}`, { replace: true });
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToPool, searchParams, navigate]);
  
  // Initialize view visibility based on active tab
  useEffect(() => {
    if (graphContainerRef.current && poolListContainerRef.current) {
      if (activeTab === 'graph') {
        poolListContainerRef.current.style.display = 'none';
        graphContainerRef.current.style.display = 'block';
      } else {
        graphContainerRef.current.style.display = 'none';
        poolListContainerRef.current.style.display = 'block';
      }
    }
  }, []);

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

  console.log('DexScanContent pools from context:', Object.keys(pools).length, pools);
  
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
        <div ref={graphContainerRef} style={{ display: activeTab === 'graph' ? 'block' : 'none' }}>
        </div>
        
        <div ref={poolListContainerRef} style={{ display: activeTab === 'pools' ? 'block' : 'none' }}>
          <ListView 
            pools={Object.values(pools)}
            highlightedPoolId={highlightedPoolId}
            onPoolSelect={highlightPool}
            shouldScrollToHighlighted={shouldScrollToPool}
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
