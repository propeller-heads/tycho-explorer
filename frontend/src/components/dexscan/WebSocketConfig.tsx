import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePoolData } from './context/PoolDataContext';
import { CHAIN_CONFIG } from '@/config/chains';

interface WebSocketConfigProps {
  onConnect?: (url: string, chain?: string) => void;
  defaultUrl?: string;
  isConnected?: boolean;
  isReconnecting?: boolean;
  reconnectAttempt?: number;
  maxReconnectAttempts?: number;
}

export const WebSocketConfig = ({
  onConnect: externalOnConnect,
  defaultUrl: externalDefaultUrl,
  isConnected: externalIsConnected,
  isReconnecting = false,
  reconnectAttempt = 0,
  maxReconnectAttempts = 5
}: WebSocketConfigProps) => {
  // Get context data
  const { 
    websocketUrl: contextUrl, 
    defaultWebSocketUrl: contextDefaultUrl,
    isConnected: contextIsConnected,
    selectedChain: contextSelectedChain,
    availableChains
  } = usePoolData();
  
  // Use props if provided, otherwise use context values
  // Priority: external prop > context current URL > context default URL
  const defaultUrl = externalDefaultUrl || contextUrl || contextDefaultUrl;
  const isConnected = externalIsConnected !== undefined ? externalIsConnected : contextIsConnected;
  const onConnect = externalOnConnect;
  
  const [wsUrl, setWsUrl] = useState<string>(defaultUrl);
  console.log("wsUrl:", wsUrl);
  const [selectedChain, setSelectedChain] = useState<string>(contextSelectedChain);
  
  console.log('🔵 [DEBUG] WebSocketConfig render:', {
    selectedChain,
    contextSelectedChain,
    availableChains,
    isConnected
  });
  
  // Update URL input when default URL changes (e.g. from localStorage)
  useEffect(() => {
    setWsUrl(defaultUrl);
  }, [defaultUrl]);

  // Update selected chain when context chain changes
  useEffect(() => {
    setSelectedChain(contextSelectedChain);
  }, [contextSelectedChain]);
  
  const handleConnect = () => {
    onConnect(wsUrl, selectedChain);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  const handleChainChange = (value: string) => {
    console.log('🟣 [CHAIN] Switching to chain:', value);
    setSelectedChain(value);
    const chainConfig = CHAIN_CONFIG[value as keyof typeof CHAIN_CONFIG];
    if (chainConfig && chainConfig.wsUrl) {
      console.log('🟣 [CHAIN] Using WebSocket URL:', chainConfig.wsUrl);
      setWsUrl(chainConfig.wsUrl);
      // Automatically reconnect with new chain if already connected
      if (isConnected) {
        console.log('🟣 [CHAIN] Auto-reconnecting to new chain...');
        onConnect(chainConfig.wsUrl, value);
      }
    } else {
      console.error('🔴 [CHAIN] No URL configured for chain:', value);
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      {/* Chain selection */}
      <div className="mb-2">
        <label className="text-xs text-muted-foreground mb-1 block">Chain</label>
        <select
          value={selectedChain}
          onChange={(e) => {
            console.log('🟢 [DEBUG] Native select onChange:', e.target.value);
            handleChainChange(e.target.value);
          }}
          className="w-full text-xs h-10 bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.08)] border-transparent text-[#FFF4E0] transition-colors px-3 rounded-md"
        >
          {availableChains.map(chain => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </div>
      
      {/* WebSocket URL and connect button */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="WebSocket URL"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs h-10 bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.08)] border-transparent text-[#FFF4E0] placeholder:text-[rgba(255,244,224,0.4)] transition-colors"
          size={30}
        />
        <Button 
          onClick={handleConnect}
          variant="ghost"
          disabled={isReconnecting}
          size="sm"
          className="h-10 px-4 bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.08)] text-[#FFF4E0] border-transparent whitespace-nowrap transition-colors"
        >
          {isConnected ? "Reconnect" : "Connect"}
        </Button>
      </div>
      
      <div className="text-xs">
        {isConnected ? (
          <div className="text-green-500 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
            Connected to {selectedChain}
          </div>
        ) : isReconnecting ? (
          <div className="text-amber-500 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></div>
            Attempt {reconnectAttempt}/{maxReconnectAttempts}
          </div>
        ) : (
          <div className="text-red-500 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></div>
            Not connected
          </div>
        )}
      </div>
    </div>
  );
};
