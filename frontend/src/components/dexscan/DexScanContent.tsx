import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DexScanHeader from './DexScanHeader';
import ListView from './ListView';
import { PoolDataProvider, usePoolData } from './context/PoolDataContext';
import GraphViewContent from './graph/GraphViewContent';
import { useFilterManager } from '@/hooks/useFilterManager';

// Import comet background assets
import bgSmallComet from '@/assets/figma_generated/bg_small_comet.svg';
import bgLargeComet from '@/assets/figma_generated/bg_large_comet.svg';

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
    highlightPool,
    selectedChain
  } = usePoolData();
  
  // Calculate available protocols from all pools
  const availableProtocols = useMemo(() => 
    Array.from(new Set(poolsArray.map(pool => pool.protocol_system))).filter(Boolean).sort(),
    [poolsArray]
  );
  
  // Shared filter state for both views
  const filters = useFilterManager({ 
    chain: selectedChain,
    availableProtocols 
  });

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
    <div className="flex flex-col gap-4" style={{ position: 'relative' }}>
      {/* Comet decorations positioned to extend beyond content area */}
      <img
        src={bgSmallComet}
        alt=""
        style={{ 
          position: "absolute", 
          top: "20%", 
          left: "0", 
          opacity: 0.15, 
          zIndex: 0, 
          pointerEvents: "none", 
          width: "350px",
          maxWidth: "calc(100% - 20px)",
          transform: "rotate(-15deg)"
        }}
      />
      <img
        src={bgLargeComet}
        alt=""
        style={{ 
          position: "absolute", 
          bottom: "-10%", 
          right: "0", 
          opacity: 0.12, 
          zIndex: 0, 
          pointerEvents: "none", 
          width: "400px",
          maxWidth: "calc(100% - 20px)",
          transform: "rotate(25deg)"
        }}
      />
      
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
          background: 'var(--Milk-Milk-50, rgba(255, 244, 224, 0.02))',
          position: 'relative'
        }}
      > 
        
        {/* Render both views but control visibility with CSS */}
        {/* These inner containers should take full height of their parent */}
        <div ref={graphContainerRef} style={
          {
            display: activeTab === 'graph' ? 'block' : 'none',
            height: "100%", // Take full height of the parent (which has calculated height)
            width: "100%",
            position: "relative" 
          }
        }>
          <GraphViewContent {...filters} />
        </div>

        <div ref={poolListContainerRef} style={{ 
          display: activeTab === 'pools' ? 'block' : 'none',
          height: "100%" // Take full height of the parent
        }}>
          <ListView
            pools={poolsArray}
            highlightedPoolId={highlightedPoolId}
            onPoolSelect={highlightPool}
            {...filters}
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
