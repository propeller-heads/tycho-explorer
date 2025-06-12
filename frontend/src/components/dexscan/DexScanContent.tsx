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
    poolsArray,
    highlightedPoolId,
    highlightPool
  } = usePoolData();

  // Update the URL when the tab changes
  const handleTabChange = (tab: 'graph' | 'pools') => {
    // Don't update state if we're already on this tab
    if (activeTab === tab) {
      return;
    }
    
    setActiveTab(tab);
    
    // Update URL with new tab parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };


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
  }, [activeTab]);


  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center relative mb-6 md:mb-0">
        <DexScanHeader currentView={activeTab} onViewChange={handleTabChange} />
      </div>

      {/* Adjusted margin from mx-44 to mx-6 (24px) to match Figma's graph panel horizontal margins */}
      {/* Set height for this content container */}
      <div 
        className="flex flex-col gap-4 mx-6" 
        style={{ 
          height: 'calc(100vh - 72px - 16px - 16px)', // 100vh - header height - DexScanContent top padding - desired bottom gap
          borderRadius: '12px',
          border: '1px solid rgba(255, 244, 224, 0.1)',
          background: 'var(--Milk-Milk-50, rgba(255, 244, 224, 0.02))'
        }}
      > 
        
        {/* Render both views but control visibility with CSS */}
        {/* These inner containers should take full height of their parent */}
        <div ref={graphContainerRef} style={
          {
            display: activeTab === 'graph' ? 'block' : 'none',
            height: "100%", // Take full height of the parent (which has calculated height)
            width: "100%",
            position: "relative",
            overflow: "hidden" 
          }
        }>
          <GraphViewContent />
        </div>

        <div ref={poolListContainerRef} style={{ 
          display: activeTab === 'pools' ? 'block' : 'none',
          height: "100%" // Take full height of the parent
        }}>
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
