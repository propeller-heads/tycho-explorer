import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwapControls } from './simulation/SwapControls';
import { SwapResults } from './simulation/SwapResults';

interface SwapSimulatorProps {
  poolId: string;
  protocol: string;
  tokens: Array<{
    symbol: string;
    address?: string;
  }>;
}

const SwapSimulator = ({ poolId, protocol, tokens }: SwapSimulatorProps) => {
  const [amount, setAmount] = useState(1);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(tokens.length > 1 ? 1 : 0);
  const [simulationResult, setSimulationResult] = useState<{
    amount: string;
    fee: string;
  } | null>(null);
  
  // Default to first two tokens if they exist
  const sourceToken = tokens[selectedSourceIndex]?.symbol || '';
  const targetToken = tokens[selectedTargetIndex]?.symbol || '';
  const sourceTokenAddress = tokens[selectedSourceIndex]?.address || '';
  
  return (
    <Tabs defaultValue="trade" className="w-full">
      <div className="flex justify-center mb-2">
        <TabsList>
          <TabsTrigger value="trade">Trade Simulator</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="trade" className="space-y-4 mt-2">
        <SwapControls 
          amount={amount}
          setAmount={setAmount}
          tokens={tokens}
          selectedSourceIndex={selectedSourceIndex}
          selectedTargetIndex={selectedTargetIndex}
          setSelectedSourceIndex={setSelectedSourceIndex}
          setSelectedTargetIndex={setSelectedTargetIndex}
          simulationResult={simulationResult}
          poolId={poolId}
        />
        
        {simulationResult && (
          <SwapResults 
            simulationResult={simulationResult}
            protocol={protocol}
            sourceToken={sourceToken}
            targetToken={targetToken}
            sourceTokenAddress={sourceTokenAddress}
            poolId={poolId}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SwapSimulator;
