import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePoolData } from './context/PoolDataContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
    connectToWebSocket: contextConnect, 
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
  const onConnect = externalOnConnect || contextConnect;
  
  const [wsUrl, setWsUrl] = useState<string>(defaultUrl);
  console.log("wsUrl:", wsUrl);
  const [selectedChain, setSelectedChain] = useState<string>(contextSelectedChain);
  
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
    setSelectedChain(value);
  };
  
  return (
    <div className="flex flex-col gap-2">
      {/* Chain selection */}
      <div className="mb-2">
        <label className="text-xs text-muted-foreground mb-1 block">Chain</label>
        <Select
          value={selectedChain}
          onValueChange={handleChainChange}
          disabled={selectedChain !== 'Ethereum'} // Only Ethereum is selectable for now
        >
          <SelectTrigger 
            className="text-xs h-10 bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.08)] border-transparent text-[#FFF4E0] transition-colors"
          >
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent 
            className="bg-[rgba(255,244,224,0.04)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.2)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]"
          >
            {availableChains.map(chain => (
              <SelectItem 
                key={chain} 
                value={chain}
                disabled={chain !== 'Ethereum'} // Only Ethereum is selectable for now
                className="text-[#FFF4E0] hover:bg-[rgba(255,244,224,0.06)] focus:bg-[rgba(255,244,224,0.06)]"
              >
                {chain}{chain !== 'Ethereum' && ' (Coming soon)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
