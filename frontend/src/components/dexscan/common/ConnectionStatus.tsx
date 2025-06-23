import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MILK_COLORS } from '@/lib/colors';
import BlockProgressIcon from '../graph/BlockProgressIcon';

interface ConnectionStatusProps {
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
  blockNumber: number;
  lastBlockTimestamp: number | null;
  estimatedBlockDuration: number;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  connectionStartTime,
  blockNumber,
  lastBlockTimestamp,
  estimatedBlockDuration,
  className
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time for connecting state
  useEffect(() => {
    if (connectionState === 'connecting' && connectionStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - connectionStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState, connectionStartTime]);

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get status indicator color
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#4ADE80'; // Green
      case 'connecting':
        return '#FFA500'; // Orange
      case 'disconnected':
        return '#EF4444'; // Red
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-[rgba(255,255,255,0.05)] backdrop-blur-sm",
        "text-sm",
        className
      )}
      style={{ color: MILK_COLORS.base }}
    >
      {/* Status dot */}
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          connectionState === 'connecting' && "animate-pulse"
        )}
        style={{ backgroundColor: getStatusColor() }}
      />

      {/* Status text */}
      <span className="font-medium">
        {connectionState === 'connected' && 'Connected'}
        {connectionState === 'connecting' && 'Connecting...'}
        {connectionState === 'disconnected' && 'Disconnected'}
      </span>

      {/* Additional info based on state */}
      {connectionState === 'connecting' && connectionStartTime && (
        <span className="text-xs opacity-70">
          ({formatElapsedTime(elapsedTime)})
        </span>
      )}

      {/* Block progress and number when connected */}
      {connectionState === 'connected' && blockNumber > 0 && (
        <>
          <BlockProgressIcon
            startTime={lastBlockTimestamp}
            duration={estimatedBlockDuration}
            size={16}
            color="#FF3366"
          />
          <span className="font-mono text-sm">
            {blockNumber}
          </span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;