import { useCallback } from 'react';
import { usePoolData } from '@/components/dexscan/shared/PoolDataContext';
import { createSimulation } from '@/components/dexscan/side-panel/simulation';
import { SwapInterface } from '@/components/dexscan/side-panel/SwapInterface';

export function SidePanel({ pool, onClose }) {
  const { selectedChain } = usePoolData();
  
  // Use useCallback and pass current pool/chain when calling
  const simulate = useCallback(
    ({ amount, sellToken, buyToken }) => {
      return createSimulation(pool, selectedChain)({ amount, sellToken, buyToken });
    },
    [pool, selectedChain]
  );
  
  return <SwapInterface pool={pool} onClose={onClose} simulate={simulate} />;
}