import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ExternalLink, LucideX } from 'lucide-react';
import { useTokenLogo, getFallbackLetters } from '@/components/dexscan/shared/hooks/useTokenLogo';
import { cn } from '@/lib/utils';
import { renderHexId, formatSpotPrice } from '@/components/dexscan/shared/utils/format';
import { getExternalLink, getTokenExplorerLink } from '@/components/dexscan/shared/utils/links';
import { parsePoolFee } from '@/components/dexscan/shared/utils/poolUtils';
import { usePoolData } from '@/components/dexscan/shared/PoolDataContext';
import { Skeleton } from '@/components/ui/skeleton';

// CSS classes for reuse
const panelClasses = cn(
  "fixed top-0 right-0 h-full w-[435px] flex flex-col",
  "bg-white/[0.01] backdrop-blur-[200px]",
  "border-l border-white/[0.06]",
  "shadow-[-16px_0px_36px_0px_rgba(24,10,52,1)]"
);

const closeButtonClasses = cn(
  "rounded-md bg-[#FFF4E0]/[0.04] border border-[#FFF4E0]/20",
  "hover:bg-[#FFF4E0]/[0.06] text-white",
  "w-9 h-9 flex items-center justify-center",
  "backdrop-blur-[200px] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)] shrink-0"
);

const swapCardClasses = "p-4 rounded-xl border bg-white/[0.02] border-white/[0.06]";

const swapButtonClasses = cn(
  "rounded-md w-9 h-9 border backdrop-blur-[200px]",
  "bg-white/[0.04] border-white/20 text-white",
  "hover:bg-white/[0.06] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]"
);

const amountInputClasses = cn(
  "text-[28px] leading-[1.2] font-semibold font-['Inter']",
  "bg-transparent border-0 p-0 m-0 h-auto outline-none",
  "focus:outline-none w-full text-white",
  "[appearance:textfield]",
  "[&::-webkit-outer-spin-button]:appearance-none",
  "[&::-webkit-inner-spin-button]:appearance-none"
);

// Micro components
const CloseButton = ({ onClick }) => (
  <button onClick={onClick} className={closeButtonClasses} aria-label="Close pool details">
    <LucideX className="w-5 h-5" />
  </button>
);

const PoolInfo = ({ pool, chain }) => {
  const poolTokensText = pool.tokens.map(t => t.symbol).join(' / ');
  const poolExternalLink = getExternalLink(pool, chain);
  
  return (
    <div className="flex-grow min-w-0">
      <h2 className="text-xl font-bold text-white truncate" title={poolTokensText}>
        {poolTokensText}
      </h2>
      <div className="flex items-center text-[13px] font-['Inter'] text-white/[0.64] mt-1">
        <span className="truncate">{pool.protocol_system}</span>
        <span className="mx-1.5">•</span>
        <span className="truncate">{renderHexId(pool.id)}</span>
        {poolExternalLink && (
          <a 
            href={poolExternalLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1.5 text-white/[0.64] hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};

const Header = ({ pool, chain, onClose }) => (
  <>
    <div className="flex items-start gap-4 p-6 pb-4">
      <CloseButton onClick={onClose} />
      <PoolInfo pool={pool} chain={chain} />
    </div>
    <div className="px-6 pt-4">
      <div className="inline-block py-3 px-1 text-base font-semibold text-white">
        Quote simulation
      </div>
    </div>
  </>
);

const TokenDisplay = ({ token }) => {
  const { logoUrl, handleError } = useTokenLogo(token?.symbol || '', token?.logoURI);
  
  if (!token) return <span className="text-sm text-white/50">Select Token</span>;
  
  // Truncate token symbols - if it's an address, show shortened version, otherwise max 10 chars
  let displaySymbol = token.symbol;
  if (token.symbol && token.symbol.startsWith('0x') && token.symbol.length >= 42) {
    displaySymbol = renderHexId(token.symbol);
  } else if (token.symbol && token.symbol.length > 10) {
    displaySymbol = token.symbol.substring(0, 10) + '...';
  }
  
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={token.symbol} 
          className="w-8 h-8 rounded-full flex-shrink-0"
          onError={handleError}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white flex-shrink-0">
          {getFallbackLetters(token.symbol)}
        </div>
      )}
      <span className="text-base font-semibold font-['Inter'] text-white truncate" title={token.symbol}>
        {displaySymbol}
      </span>
    </div>
  );
};

const AmountField = ({ amount, onChange, isEditable, isLoading, hasError }) => {
  if (!isEditable) {
    let displayValue = '-';
    if (isLoading) {
      displayValue = 'Calculating...';
    } else if (hasError) {
      displayValue = 'Error';
    } else if (amount && parseFloat(amount) > 0) {
      displayValue = formatSpotPrice(parseFloat(amount));
    }
    
    return (
      <span className="text-[28px] leading-[1.2] font-semibold font-['Inter'] block text-white">
        {displayValue}
      </span>
    );
  }
  
  return (
    <input
      type="number"
      value={amount}
      onChange={(e) => onChange(e.target.value)}
      className={amountInputClasses}
      placeholder="0"
    />
  );
};

const TokenSelector = ({ token, onTokenChange, tokens, chain }) => {
  const tokenData = tokens.find(t => t.address === token);
  
  return (
    <div className="flex items-center gap-1">
      <Select value={token} onValueChange={onTokenChange}>
        <SelectTrigger className="w-auto bg-transparent border-0 p-0 h-auto hover:bg-transparent focus:ring-0 text-white">
          <SelectValue>
            <TokenDisplay key={token.address} token={tokenData} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#190A35]/95 text-white border-white/10 backdrop-blur-2xl">
          {tokens.map(t => (
            <SelectItem key={t.address} value={t.address}>
              <TokenDisplay key={t.address} token={t} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {tokenData && (
        <a
          href={getTokenExplorerLink(tokenData.address, chain)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
};

const SwapCard = ({ direction, amount, onAmountChange, token, onTokenChange, tokens, isEditable, chain, isLoading, hasError }) => (
  <div className={swapCardClasses}>
    <div className="text-xs font-['Inter'] mb-2 text-white/50">
      {direction === 'sell' ? 'Sell' : 'Buy'}
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0 overflow-hidden">
        {!isEditable && isLoading ? (
          <Skeleton className="h-[34px] w-[140px] bg-white/10" />
        ) : (
          <AmountField 
            amount={amount} 
            onChange={onAmountChange} 
            isEditable={isEditable}
            isLoading={isLoading}
            hasError={hasError}
          />
        )}
      </div>
      <TokenSelector token={token} onTokenChange={onTokenChange} tokens={tokens} chain={chain} />
    </div>
  </div>
);

const SimulationResults = ({ result, sellToken, buyToken, pool, isLoading }) => {
  if (!result && !isLoading) return null;
  
  const ResultRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm font-['Inter'] w-32 text-white/50">{label}:</span>
      <span className="text-sm font-['Inter'] text-white">{value}</span>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <ResultRow label="Pool Fee" value={(() => {
          const fee = parsePoolFee(pool);
          return fee !== null ? `${fee}%` : 'N/A';
        })()} />
        <div className="flex justify-between items-center">
          <span className="text-sm font-['Inter'] w-32 text-white/50">Exchange Rate:</span>
          <Skeleton className="h-5 w-40 bg-white/10" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-['Inter'] w-32 text-white/50">Net Amount:</span>
          <Skeleton className="h-5 w-32 bg-white/10" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-['Inter'] w-32 text-white/50">Gas Units:</span>
          <Skeleton className="h-5 w-20 bg-white/10" />
        </div>
      </div>
    );
  }
  
  if (result.error) {
    return null; // Error shown separately
  }
  
  // Format exchange rate - show N/A if invalid
  let exchangeRateText = 'N/A';
  if (result.exchangeRate && parseFloat(result.exchangeRate) > 0) {
    exchangeRateText = `1 ${sellToken?.symbol} = ${formatSpotPrice(parseFloat(result.exchangeRate))} ${buyToken?.symbol}`;
  }
  
  // Format net amount - show N/A if invalid
  let netAmountText = 'N/A';
  if (result.netAmount && parseFloat(result.netAmount) > 0) {
    netAmountText = `${formatSpotPrice(parseFloat(result.netAmount))} ${buyToken?.symbol}`;
  }
  
  return (
    <div className="space-y-2">
      <ResultRow label="Pool Fee" value={(() => {
        const fee = parsePoolFee(pool);
        return fee !== null ? `${fee}%` : 'N/A';
      })()} />
      <ResultRow label="Exchange Rate" value={exchangeRateText} />
      <ResultRow label="Net Amount" value={netAmountText} />
      {result.gasEstimate && result.gasEstimate[0] && (
        <ResultRow label="Gas Units" value={result.gasEstimate[0].toString()} />
      )}
    </div>
  );
};

// Public component
export function SwapInterface({ pool, onClose, simulate }) {
  const [amount, setAmount] = useState('1');
  const [sellToken, setSellToken] = useState(pool.tokens[0]?.address || '');
  const [buyToken, setBuyToken] = useState(pool.tokens[1]?.address || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedChain } = usePoolData();
  const debounceTimerRef = useRef(null);
  const loadingStartTimeRef = useRef(null);
  
  // Extract addresses to avoid complex expressions in dependencies
  const token0Address = pool.tokens[0]?.address;
  const token1Address = pool.tokens[1]?.address;
  
  // Reset tokens when pool changes
  useEffect(() => {
    setSellToken(pool.tokens[0]?.address || '');
    setBuyToken(pool.tokens[1]?.address || '');
    setResult(null);
    setAmount('1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.id, token0Address, token1Address]);
  
  // Debounced simulation function
  const runSimulation = useCallback((simulationAmount, simulationSellToken, simulationBuyToken) => {
    if (simulationAmount && simulationSellToken && simulationBuyToken && parseFloat(simulationAmount) > 0) {
      setLoading(true);
      loadingStartTimeRef.current = Date.now();
      
      simulate({ amount: simulationAmount, sellToken: simulationSellToken, buyToken: simulationBuyToken })
        .then((result) => {
          // Calculate how long the skeleton has been shown
          const loadingDuration = Date.now() - loadingStartTimeRef.current;
          const remainingTime = Math.max(0, 500 - loadingDuration);
          
          // Delay hiding the skeleton if it hasn't been shown for at least 500ms
          setTimeout(() => {
            setResult(result);
            setLoading(false);
          }, remainingTime);
        })
        .catch((error) => {
          // Still respect minimum loading time on error
          const loadingDuration = Date.now() - loadingStartTimeRef.current;
          const remainingTime = Math.max(0, 500 - loadingDuration);
          
          setTimeout(() => {
            setResult({ error: error.message });
            setLoading(false);
          }, remainingTime);
        });
    }
  }, [simulate]);
  
  // Auto-simulate on input change with debounce
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for API call
    debounceTimerRef.current = setTimeout(() => {
      runSimulation(amount, sellToken, buyToken);
    }, 500);
    
    // Cleanup on unmount or dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [amount, sellToken, buyToken, runSimulation]);
  
  // Re-simulate immediately when pool updates from WebSocket
  useEffect(() => {
    if (amount && sellToken && buyToken && parseFloat(amount) > 0 && pool.spotPrice) {
      runSimulation(amount, sellToken, buyToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.spotPrice, pool.lastUpdatedAtBlock]); // Only trigger on pool updates, not other deps
  
  const handleSwapDirection = () => {
    // Swap token addresses
    setSellToken(buyToken);
    setBuyToken(sellToken);
    // Use buy amount as new sell amount (or reset to '1' if no result)
    setAmount(result?.buyAmount || '1');
    // Clear result to trigger new simulation
    setResult(null);
  };
  
  const sellTokenData = pool.tokens.find(t => t.address === sellToken);
  const buyTokenData = pool.tokens.find(t => t.address === buyToken);
  
  return (
    <div className={panelClasses}>
      <Header pool={pool} chain={selectedChain} onClose={onClose} />
      
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="relative">
            <div className="space-y-2">
              <SwapCard
                direction="sell"
                amount={amount}
                onAmountChange={setAmount}
                token={sellToken}
                onTokenChange={setSellToken}
                tokens={pool.tokens}
                isEditable={true}
                chain={selectedChain}
              />
              <SwapCard
                direction="buy"
                amount={result?.buyAmount}
                onAmountChange={() => {}}
                token={buyToken}
                onTokenChange={setBuyToken}
                tokens={pool.tokens}
                isEditable={false}
                chain={selectedChain}
                isLoading={loading}
                hasError={!!result?.error}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapDirection}
                className={swapButtonClasses}
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <SimulationResults 
            result={result} 
            sellToken={sellTokenData} 
            buyToken={buyTokenData} 
            pool={pool}
            isLoading={loading}
          />
          
          {result?.error && (
            <div className="text-red-500 text-sm">{result.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}