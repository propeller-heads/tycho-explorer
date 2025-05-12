import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DexScanHeader from './DexScanHeader';
import ListView from './ListView';
import { PoolDataProvider, usePoolData } from './context/PoolDataContext';
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


  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center relative mb-6 md:mb-0">
        {/* Pass activeTab and handleTabChange to DexScanHeader */}
        <DexScanHeader currentView={activeTab} onViewChange={handleTabChange} />
      </div>

      {/* Adjusted margin from mx-44 to mx-6 (24px) to match Figma's graph panel horizontal margins */}
      <div className="flex flex-col gap-4 mx-6"> 
        
        {/* Render both views but control visibility with CSS */}
        <div ref={graphContainerRef} style={
          {
            display: activeTab === 'graph' ? 'block' : 'none',
            height: "110vh", // 2x viewport height minus header space
            width: "100%",
            position: "relative",
            overflow: "hidden"  // Allow scrolling for the taller container
          }
        }>
          <GraphViewContent />
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
