import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For amount input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For token selection
import { ArrowRightLeft } from 'lucide-react'; // For swap direction button
import { Token } from './types'; // Assuming Token type includes address, symbol, logoURI
import { getCoinId, getCoinImageURL } from '@/lib/coingecko'; // For token icons
import { cn } from '@/lib/utils';

// Placeholder for actual simulation API call
const simulateSwap = async (poolId: string, tokenIn: string, tokenOut: string, amountIn: number) => {
  console.log(`Simulating swap for ${poolId}: ${amountIn} ${tokenIn} -> ${tokenOut}`);
  // Mock result
  await new Promise(resolve => setTimeout(resolve, 500));
  if (amountIn <= 0) return { amountOut: '0', priceImpact: '0', fee: '0' };
  return {
    amountOut: (amountIn * 1800).toString(), // Example rate
    priceImpact: (amountIn * 0.0005).toFixed(4), // Example price impact
    fee: (amountIn * 0.003).toFixed(5),      // Example fee
  };
};

interface SwapCardProps {
  direction: 'sell' | 'buy';
  amount: string;
  onAmountChange: (value: string) => void;
  selectedToken: Token | undefined;
  onTokenChange: (tokenId: string) => void;
  tokens: Token[];
  usdValue?: string; // Optional USD value display
  isAmountEditable?: boolean;
}

const TokenDisplay: React.FC<{token: Token | undefined}> = ({token}) => {
  const [iconUrl, setIconUrl] = useState<string | null>(token?.logoURI || null);

  useEffect(() => {
    if (token?.logoURI) {
      setIconUrl(token.logoURI);
      return;
    }
    let isMounted = true;
    const fetchIcon = async () => {
      if (token) {
        const coinId = await getCoinId(token.symbol);
        if (coinId) {
          const url = await getCoinImageURL(coinId);
          if (isMounted && url) setIconUrl(url);
        }
      }
    };
    if (token && !iconUrl) fetchIcon();
    return () => { isMounted = false; };
  }, [token, iconUrl]);

  if (!token) return <span className="text-sm">Select Token</span>;

  return (
    <div className="flex items-center gap-2">
      {iconUrl ? (
        <img src={iconUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs">
          {token.symbol.substring(0,1)}
        </div>
      )}
      <span className="text-base font-medium text-white">{token.symbol}</span>
      {/* External link icon can be added here if needed */}
    </div>
  );
}


const SwapCard: React.FC<SwapCardProps> = ({
  direction,
  amount,
  onAmountChange,
  selectedToken,
  onTokenChange,
  tokens,
  usdValue,
  isAmountEditable = true,
}) => {
  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
      <div className="text-xs text-white/60">{direction === 'sell' ? 'Sell' : 'Buy'}</div>
      <div className="flex items-center justify-between">
        {isAmountEditable ? (
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white w-1/2"
            placeholder="0.0"
          />
        ) : (
          <span className="text-2xl font-semibold text-white truncate w-1/2">{amount || "0.0"}</span>
        )}
        <Select value={selectedToken?.address} onValueChange={onTokenChange}>
          <SelectTrigger className="w-auto bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Token">
              <TokenDisplay token={selectedToken} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 text-white border-neutral-700">
            {tokens.map(t => (
              <SelectItem key={t.address} value={t.address || t.symbol}>
                <TokenDisplay token={t} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {usdValue && <div className="text-xs text-white/60 text-right">${usdValue}</div>}
    </div>
  );
};

interface SwapSimulatorProps {
  poolId: string;
  // protocol: string; // Protocol might not be needed if poolId is enough for simulation
  tokens: Token[]; // Expect full Token objects
}

const SwapSimulator: React.FC<SwapSimulatorProps> = ({ poolId, tokens }) => {
  const [sellAmount, setSellAmount] = useState<string>("1");
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [sellTokenAddress, setSellTokenAddress] = useState<string | undefined>(tokens[0]?.address);
  const [buyTokenAddress, setBuyTokenAddress] = useState<string | undefined>(tokens[1]?.address || tokens[0]?.address);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulation results
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [priceImpact, setPriceImpact] = useState<string | null>(null);
  // Gas cost and net amount would typically come from a more detailed simulation or estimation
  const [gasCost, setGasCost] = useState<string | null>("0.002 ETH ($4.64)"); // Placeholder
  
  const sellToken = tokens.find(t => t.address === sellTokenAddress);
  const buyToken = tokens.find(t => t.address === buyTokenAddress);

  const handleSwapDirection = () => {
    const tempAmount = sellAmount;
    const tempTokenAddress = sellTokenAddress;
    setSellAmount(buyAmount); // If buyAmount is from simulation, this might need adjustment
    setBuyAmount(tempAmount); // Or re-simulate based on new sellAmount
    setSellTokenAddress(buyTokenAddress);
    setBuyTokenAddress(tempTokenAddress);
    // Re-simulate after swapping direction if sellAmount has a value
    if (buyAmount && buyTokenAddress && sellTokenAddress) {
        // This logic is tricky: if buyAmount was a result, now it's an input.
        // Typically, one side is input, the other is output.
        // For simplicity, let's clear buyAmount and let user re-initiate or re-simulate.
        setBuyAmount(""); 
        setExchangeRate(null);
        setPriceImpact(null);
    }
  };
  
  useEffect(() => {
    // Auto-simulate when sellAmount, sellToken, or buyToken changes
    const performSimulation = async () => {
      if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
        setBuyAmount("");
        setExchangeRate(null);
        setPriceImpact(null);
        return;
      }
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await simulateSwap(poolId, sellToken.address, buyToken.address, parseFloat(sellAmount));
        setBuyAmount(result.amountOut);
        setPriceImpact(result.priceImpact);
        if (parseFloat(sellAmount) > 0 && parseFloat(result.amountOut) > 0) {
          setExchangeRate((parseFloat(result.amountOut) / parseFloat(sellAmount)).toFixed(6));
        } else {
          setExchangeRate(null);
        }
      } catch (e) {
        setError("Simulation failed.");
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    };
    performSimulation();
  }, [sellAmount, sellToken, buyToken, poolId]);


  return (
    <div className="space-y-4">
      <div className="relative flex flex-col space-y-2">
        <SwapCard
          direction="sell"
          amount={sellAmount}
          onAmountChange={setSellAmount}
          selectedToken={sellToken}
          onTokenChange={setSellTokenAddress}
          tokens={tokens}
          // usdValue="1,987.92" // Placeholder
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapDirection}
            className="rounded-full bg-purple-700/20 border-purple-500/50 hover:bg-purple-600/30 text-white w-8 h-8"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>
        <SwapCard
          direction="buy"
          amount={buyAmount}
          onAmountChange={setBuyAmount} // Typically buy amount is result, not editable
          selectedToken={buyToken}
          onTokenChange={setBuyTokenAddress}
          tokens={tokens}
          isAmountEditable={false} // Buy amount is usually the result of simulation
          // usdValue="1,986.75" // Placeholder
        />
      </div>

      {/* Simulation Details */}
      <div className="space-y-1 text-xs text-white/80">
        {exchangeRate && sellToken && buyToken && (
          <div className="flex justify-between">
            <span>Exchange Rate:</span>
            <span className="text-white">1 {sellToken.symbol} = {exchangeRate} {buyToken.symbol}</span>
          </div>
        )}
        {priceImpact !== null && (
          <div className="flex justify-between">
            <span>Price Impact:</span>
            <span className="text-white">{priceImpact}%</span>
          </div>
        )}
        {gasCost && (
           <div className="flex justify-between">
            <span>Est. Gas Cost:</span>
            <span className="text-white">{gasCost}</span>
          </div>
        )}
        {/* Net Amount could be calculated if gas is in a common currency */}
      </div>
    </div>
  );
};

export default SwapSimulator;
