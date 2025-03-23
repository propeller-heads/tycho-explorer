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

// Helper function to format fee from hex
const formatPoolFee = (feeHex: string): string => {
  if (!feeHex) return '0%';
  try {
    // Convert hex to decimal and divide by 10000 for percentage
    const feeValue = parseInt(feeHex, 16) / 10000;
    return `${feeValue}%`;
  } catch (error) {
    console.error("Error formatting fee:", error);
    return '0%';
  }
};

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
    if (poolId && pools[poolId] && pools[poolId].static_attributes?.fee) {
      setPoolFee(formatPoolFee(pools[poolId].static_attributes.fee));
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
