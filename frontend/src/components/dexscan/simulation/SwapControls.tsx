import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { ArrowUpDown, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePoolData } from '../context/PoolDataContext';
import { SimulationResponse, callSimulationAPI, getLimits, LimitsResponse } from './simulationApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SwapControlsProps {
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  tokens: Array<{
    symbol: string;
    address?: string;
  }>;
  selectedSourceIndex: number;
  selectedTargetIndex: number;
  setSelectedSourceIndex: Dispatch<SetStateAction<number>>;
  setSelectedTargetIndex: Dispatch<SetStateAction<number>>;
  simulationResult: { amount: string, fee: string } | null;
  poolId: string;
}

// Import the fee parsing function from ListView
import { parsePoolFee, parseFeeHexValue } from '../ListView';

// Using the shared utility functions from ListView
// parsePoolFee - parses pool fee based on protocol type
// parseFeeHexValue - directly parses hex fee values

export const SwapControls = ({
  amount,
  setAmount,
  tokens,
  selectedSourceIndex,
  selectedTargetIndex,
  setSelectedSourceIndex,
  setSelectedTargetIndex,
  simulationResult,
  poolId
}: SwapControlsProps) => {
  const [inputValue, setInputValue] = useState(amount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [apiSimulationResult, setApiSimulationResult] = useState<SimulationResponse | null>(null);
  const { pools } = usePoolData();
  const [poolFee, setPoolFee] = useState<string>('0%');
  const [limits, setLimits] = useState<LimitsResponse | null>(null);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [fetchingLimits, setFetchingLimits] = useState(false);

  // Get the pool fee from pool state when poolId changes
  useEffect(() => {
    if (poolId && pools[poolId]) {
      const poolFeeValue = parsePoolFee(pools[poolId]);
      setPoolFee(`${poolFeeValue}%`);
    }
  }, [poolId, pools]);

  // Fetch pool limits when tokens or pool change
  useEffect(() => {
    const fetchLimits = async () => {
      if (!poolId || !tokens[selectedSourceIndex]?.address || !tokens[selectedTargetIndex]?.address) return;
      
      setFetchingLimits(true);
      try {
        const limitsResult = await getLimits(
          tokens[selectedSourceIndex].address,
          tokens[selectedTargetIndex].address,
          poolId
        );
        
        if (limitsResult) {
          console.log('limitResult: ', limitsResult);
          setLimits(limitsResult);
        }
      } catch (error) {
        console.error("Error fetching pool limits:", error);
      } finally {
        setFetchingLimits(false);
      }
    };

    fetchLimits();
  }, [poolId, selectedSourceIndex, selectedTargetIndex, tokens]);

  // Logarithmic scale conversion function - properly maps slider position to token amount
  const calculateAmountFromSliderPosition = (position: number, maxAmount: number): number => {
    // Special case: position 0 always maps to amount 0
    if (position === 0) return 0;
    
    // Normalize position to [0, 1] range
    const normalizedPosition = position / 100;
    
    // For logarithmic scale between 0 and max
    // We use a modified log scale formula that maps:
    // position 0 -> 0 (handled in special case)
    // position 1 -> maxAmount
    // with logarithmic distribution between
    
    // Using formula: amount = maxAmount * (10^(normalizedPosition - 1))
    return maxAmount * Math.pow(10, normalizedPosition - 1);
  };

  const updateAmountFromSlider = (position: number, currentLimits: LimitsResponse | null = limits) => {
    if (!currentLimits) return;
    
    const max = parseFloat(currentLimits.max_output);
    if (isNaN(max)) return;
    
    if (position === 0) {
      // Start with exactly 0 when slider is at minimum
      setAmount(0);
      setInputValue("0");
      return;
    }
    
    // Calculate amount using logarithmic scale
    const newAmount = calculateAmountFromSliderPosition(position, max);
    
    // Ensure we don't exceed the maximum
    const clampedAmount = Math.min(newAmount, max);
    
    setAmount(clampedAmount);
    setInputValue(clampedAmount.toFixed(6));
  };

  const handleSliderChange = (values: number[]) => {
    const [value] = values;
    setSliderValue([value]);
    updateAmountFromSlider(value);
  };

  const handleFlip = () => {
    // Swap the selected indices
    const tempIndex = selectedSourceIndex;
    setSelectedSourceIndex(selectedTargetIndex);
    setSelectedTargetIndex(tempIndex);
  };

  // Calculate slider position from amount (inverse of calculateAmountFromSliderPosition)
  const calculateSliderPositionFromAmount = (amount: number, maxAmount: number): number => {
    // Special case: amount 0 maps to position 0
    if (amount <= 0) return 0;
    
    // Ensure we don't exceed the maximum
    const clampedAmount = Math.min(amount, maxAmount);
    
    // Inverse of the formula used in calculateAmountFromSliderPosition:
    // amount = maxAmount * (10^(normalizedPosition - 1))
    // Solve for normalizedPosition:
    // normalizedPosition = log10(amount/maxAmount) + 1
    
    const normalizedPosition = Math.log10(clampedAmount / maxAmount) + 1;
    
    // Convert to slider range (0-100)
    const position = normalizedPosition * 100;
    
    // Clamp to ensure we're in valid range (though the math should keep us there)
    return Math.max(Math.min(position, 100), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
      
      // Update slider value based on input if we have limits
      if (limits) {
        const max = parseFloat(limits.max_output);
        
        if (numValue <= 0) {
          // If input is 0 or negative, set slider to 0
          setSliderValue([0]);
          return;
        }
        
        // Calculate slider position using our inverse function
        const position = calculateSliderPositionFromAmount(numValue, max);
        setSliderValue([position]);
      }
    }
  };

  const sourceToken = tokens[selectedSourceIndex]?.symbol || '';
  const targetToken = tokens[selectedTargetIndex]?.symbol || '';
  const sourceTokenAddress = tokens[selectedSourceIndex]?.address || '';

  // Remove automatic simulation effect and create a manual simulation function
  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const result = await callSimulationAPI(
        sourceTokenAddress,
        poolId,
        amount
      );

      if (result && result.success) {
        console.log('simulation result: ', result);
        setApiSimulationResult(result);
      }
    } catch (error) {
      console.error("Error in simulation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md mx-auto w-3/5 min-w-[350px] max-w-[600px]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-medium">From</span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          min="0.0001"
          step="0.0001"
          className="text-left h-10 min-w-0 px-3"
          disabled={isLoading || fetchingLimits}
        />
        {tokens.length <= 2 ? (
          <span className="font-medium text-base whitespace-nowrap">{sourceToken}</span>
        ) : (
          <Select 
            value={selectedSourceIndex.toString()} 
            onValueChange={(val) => setSelectedSourceIndex(parseInt(val))}
            disabled={isLoading || fetchingLimits}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={sourceToken} />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token, index) => (
                <SelectItem key={token.address || index} value={index.toString()}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* Logarithmic Slider for amount selection */}
      <div className="mb-4 px-1">
        {fetchingLimits ? (
          <div className="text-xs text-center text-muted-foreground py-2">
            Loading pool limits...
          </div>
        ) : limits ? (
          <div className="space-y-2">
            <Slider 
              value={sliderValue} 
              onValueChange={handleSliderChange}
              min={0}
              max={100}
              step={1}
              disabled={isLoading}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 0</span>
              <span>Max: {parseFloat(limits.max_output).toFixed(6)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-center text-muted-foreground py-2">
            Connect tokens to view limits
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFlip}
          className="h-8 w-8 rounded-full"
          disabled={isLoading}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">Switch tokens</span>
        </Button>
      </div>

      <div className="mb-2">
        <span className="text-base font-medium">To (Estimated)</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium text-base">
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : apiSimulationResult ? (
            apiSimulationResult.output_amount
          ) : simulationResult ? (
            simulationResult.amount
          ) : (
            "—"
          )}
        </span>
        {tokens.length <= 2 ? (
          <span className="font-medium">{targetToken}</span>
        ) : (
          <Select 
            value={selectedTargetIndex.toString()} 
            onValueChange={(val) => setSelectedTargetIndex(parseInt(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={targetToken} />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token, index) => (
                <SelectItem key={token.address || index} value={index.toString()}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={handleSimulate} 
          disabled={isLoading || !poolId || amount < 0}
          className="w-full"
          variant="outline"
        >
          <Play className="mr-2 h-4 w-4" />
          Simulate Swap
        </Button>
      </div>

      {isLoading && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Simulating swap...
        </div>
      )}

      {apiSimulationResult && !isLoading && (
        <div className="mt-4 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gas Estimate:</span>
            <span>{apiSimulationResult.gas_estimate}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Fee:</span>
            <span>{poolFee}</span>
          </div>
        </div>
      )}
    </div>
  );
};
