import { useMemo } from 'react';
import { usePoolData } from '@/components/dexscan/shared/PoolDataContext';
import { createSimulation } from '@/components/dexscan/side-panel/simulation';
import { SwapInterface } from '@/components/dexscan/side-panel/SwapInterface';

export function SidePanel({ pool, onClose }) {
  const { selectedChain } = usePoolData();
  
  // Create simulation function once
  const simulate = useMemo(
    () => createSimulation(pool, selectedChain),
    [pool, selectedChain]
  );
  
  return <SwapInterface pool={pool} onClose={onClose} simulate={simulate} />;
}