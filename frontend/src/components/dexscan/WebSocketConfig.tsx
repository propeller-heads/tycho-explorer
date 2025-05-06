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
    isConnected: contextIsConnected,
    selectedChain: contextSelectedChain,
    availableChains
  } = usePoolData();
  
  // Use props if provided, otherwise use context values
  const defaultUrl = externalDefaultUrl || contextUrl;
  const isConnected = externalIsConnected !== undefined ? externalIsConnected : contextIsConnected;
  const onConnect = externalOnConnect || contextConnect;
  
  const [wsUrl, setWsUrl] = useState<string>(defaultUrl);
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
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            {availableChains.map(chain => (
              <SelectItem 
                key={chain} 
                value={chain}
                disabled={chain !== 'Ethereum'} // Only Ethereum is selectable for now
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
          className="text-xs h-8"
          size={30}
        />
        <Button 
          onClick={handleConnect}
          variant={isConnected ? "outline" : "default"}
          disabled={isReconnecting}
          size="sm"
          className="h-8 whitespace-nowrap"
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
