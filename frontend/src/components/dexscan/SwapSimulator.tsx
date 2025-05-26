import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For amount input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For token selection
import { ArrowRightLeft, ExternalLink } from 'lucide-react'; // For swap direction button and external link
import { Pool, Token } from './types'; // Assuming Token type includes address, symbol, logoURI
import { getCoinId, getCoinImageURL } from '@/lib/coingecko'; // For token icons
import { cn } from '@/lib/utils';
import { callSimulationAPI } from './simulation/simulationApi';
import { parsePoolFee } from '@/lib/poolUtils';


// Call real simulation API
const simulateSwap = async (
  poolId: string, 
  tokenIn: string, 
  tokenOut: string, 
  amountIn: number,
  poolFee: string
) => {
  const result = await callSimulationAPI(tokenIn, poolId, amountIn);
  if (!result || !result.success) {
    throw new Error('Simulation failed');
  }
  
  const outputAmount = parseFloat(result.output_amount);
  const exchangeRate = amountIn > 0 ? (outputAmount / amountIn).toFixed(6) : '0';
  
  return {
    amountOut: result.output_amount,
    fee: poolFee,
    exchangeRate: exchangeRate
  };
};

interface SwapCardProps {
  direction: 'sell' | 'buy';
  amount: string;
  onAmountChange: (value: string) => void;
  selectedToken: Token | undefined;
  onTokenChange: (tokenId: string) => void;
  tokens: Token[];
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

  if (!token) return <span className="text-sm text-[rgba(255,255,255,0.64)]">Select Token</span>;

  return (
    <div className="flex items-center gap-2">
      {iconUrl ? (
        <img src={iconUrl} alt={token.symbol} className="w-6 h-6 rounded-full flex-shrink-0" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] flex items-center justify-center text-xs text-[#FFFFFF] flex-shrink-0">
          {token.symbol.substring(0,1)}
        </div>
      )}
      <span className="text-base font-semibold font-['Inter'] text-[#FFFFFF]">{token.symbol}</span>
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
  isAmountEditable = true,
}) => {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
      <div className="text-xs font-['Inter'] text-[rgba(255,255,255,0.64)] mb-2">
        {direction === 'sell' ? 'Sell' : 'Buy'}
      </div>
      
      <div className="flex items-center justify-between gap-12">
        {isAmountEditable ? (
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="text-[28px] leading-[1.2] font-semibold font-['Inter'] bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-[#FFFFFF] flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        ) : (
          <span className="text-[28px] leading-[1.2] font-semibold font-['Inter'] text-[#FFFFFF] flex-1">
            {amount ? parseFloat(amount).toFixed(2) : "0"}
          </span>
        )}
        
        <div className="min-w-[150px] flex items-center justify-end gap-1">
          <Select value={selectedToken?.address || ''} onValueChange={onTokenChange}>
            <SelectTrigger className="w-auto bg-transparent border-0 p-0 h-auto hover:bg-transparent focus:ring-0 max-w-[150px]">
              <SelectValue>
                <TokenDisplay token={selectedToken} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[rgba(25,10,53,0.95)] backdrop-blur-2xl text-[#FFFFFF] border-[rgba(255,255,255,0.1)]">
              {tokens.map(t => (
                <SelectItem key={t.address} value={t.address}>
                  <TokenDisplay token={t} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedToken && (
            <a
              href={`https://etherscan.io/token/${selectedToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgba(255,255,255,0.64)] hover:text-[#FFFFFF] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

interface SwapSimulatorProps {
  poolId: string;
  tokens: Token[]; // Expect full Token objects
  fee: string; // Pool fee from static_attributes
  pool?: Pool; // Optional pool object for fee formatting
}

const SwapSimulator: React.FC<SwapSimulatorProps> = ({ poolId, tokens, fee, pool }) => {
  const [sellAmount, setSellAmount] = useState<string>("1");
  const [buyAmount, setBuyAmount] = useState<string>("");
  // Initialize with first available tokens
  const [sellTokenAddress, setSellTokenAddress] = useState<string>(tokens[0]?.address || '');
  
  const [buyTokenAddress, setBuyTokenAddress] = useState<string>(tokens[1]?.address || '');
  
  // Update token selection when pool changes
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setSellTokenAddress(tokens[0]?.address || '');
      setBuyTokenAddress(tokens[1]?.address || tokens[0]?.address || '');
    }
  }, [poolId]); // Re-run when poolId changes
  
  console.log("sim: t0, t1, tokens ", sellTokenAddress, buyTokenAddress, tokens);
  

  // Simulation results
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [netAmount, setNetAmount] = useState<string | null>(null);
  
  // Find tokens by address
  const sellToken = tokens.find(t => t.address === sellTokenAddress);
  const buyToken = tokens.find(t => t.address === buyTokenAddress);

  console.log("sim: sell, buy ", sellToken, buyToken, tokens);

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
        setNetAmount(null);
    }
  };
  
  useEffect(() => {
    // Auto-simulate when sellAmount, sellToken, or buyToken changes
    const performSimulation = async () => {
      if (!sellToken || !buyToken || !sellAmount || parseFloat(sellAmount) <= 0) {
        setBuyAmount("");
        setExchangeRate(null);
        setNetAmount(null);
        return;
      }
      try {
        const result = await simulateSwap(poolId, sellToken.address, buyToken.address, parseFloat(sellAmount), fee);
        // Format output to 2 decimal places
        const formattedOutput = parseFloat(result.amountOut).toFixed(2);
        setBuyAmount(formattedOutput);
        setExchangeRate(result.exchangeRate);
        
        // Set net amount to same as output amount (no gas deduction)
        setNetAmount(formattedOutput);
      } catch (e) {
        console.error("Simulation failed:", e);
      }
    };
    performSimulation();
  }, [sellAmount, sellToken, buyToken, poolId, fee]);


  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="space-y-2">
          <SwapCard
            direction="sell"
            amount={sellAmount}
            onAmountChange={setSellAmount}
            selectedToken={sellToken}
            onTokenChange={setSellTokenAddress}
            tokens={tokens}
          />
          
          <SwapCard
            direction="buy"
            amount={buyAmount}
            onAmountChange={setBuyAmount}
            selectedToken={buyToken}
            onTokenChange={setBuyTokenAddress}
            tokens={tokens}
            isAmountEditable={false}
          />
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapDirection}
            className="rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)] text-[#FFFFFF] w-9 h-9 backdrop-blur-[112px]"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Simulation Details - Matching Figma design */}
      <div className="space-y-2">
        {exchangeRate && sellToken && buyToken && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-['Inter'] text-[rgba(255,255,255,0.64)] w-32">Exchange Rate:</span>
            <span className="text-sm font-['Inter'] text-[#FFFFFF]">1 {sellToken.symbol} = {exchangeRate} {buyToken.symbol}</span>
          </div>
        )}
        
        {netAmount && buyToken && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-['Inter'] text-[rgba(255,255,255,0.64)] w-32">Net Amount:</span>
            <span className="text-sm font-['Inter'] text-[#FFFFFF]">{netAmount} {buyToken.symbol}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-['Inter'] text-[rgba(255,255,255,0.64)] w-32">Pool Fee:</span>
          <span className="text-sm font-['Inter'] text-[#FFFFFF]">{pool ? `${parsePoolFee(pool)}%` : `${fee}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default SwapSimulator;