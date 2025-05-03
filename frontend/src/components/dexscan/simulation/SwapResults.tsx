import { useEffect, useState } from 'react';
import { usePoolData } from '../context/PoolDataContext';

interface SwapResultsProps {
  simulationResult: {
    amount: string;
    fee: string;
  } | null;
  protocol: string;
  sourceToken: string;
  targetToken: string;
  sourceTokenAddress?: string;
  poolId: string;
}

// Import the fee parsing function from ListView
import { parsePoolFee, parseFeeHexValue } from '../ListView';

// Using the shared utility functions from ListView
// parsePoolFee - parses pool fee based on protocol type
// parseFeeHexValue - directly parses hex fee values

export const SwapResults = ({
  simulationResult,
  protocol,
  sourceToken,
  targetToken,
  sourceTokenAddress,
  poolId
}: SwapResultsProps) => {
  if (!simulationResult) return null;
  
  const { pools } = usePoolData();
  const [poolFee, setPoolFee] = useState<string>('0%');
  
  // Get the pool fee from pool state when poolId changes
  useEffect(() => {
    if (poolId && pools[poolId]) {
      const poolFeeValue = parsePoolFee(pools[poolId]);
      setPoolFee(`${poolFeeValue}%`);
    }
  }, [poolId, pools]);
  
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-md mx-auto w-3/5 min-w-[350px] max-w-[600px]">
        <div className="text-base font-medium mb-2">Trade Details</div>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-muted-foreground">Exchange Rate</span>
          <span className="text-right">
            1 {sourceToken} = {simulationResult.amount} {targetToken}
          </span>
          
          <span className="text-muted-foreground">Protocol Fee</span>
          <span className="text-right">{poolFee}</span>
          
          {protocol && (
            <>
              <span className="text-muted-foreground">Provider</span>
              <span className="text-right">{protocol}</span>
            </>
          )}
          
          {sourceTokenAddress && (
            <>
              <span className="text-muted-foreground">Source Token Address</span>
              <span className="text-right text-xs truncate">{sourceTokenAddress}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
