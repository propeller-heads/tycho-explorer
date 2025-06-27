import React from 'react';
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
  return (
    <div 
      className={cn(
        "flex items-center gap-2",
        "text-sm",
        className
      )}
      style={{ color: MILK_COLORS.base }}
    >
      <BlockProgressIcon
        startTime={lastBlockTimestamp}
        duration={estimatedBlockDuration}
        size={16}
        color="#FF3366"
      />
      <span className="font-sans text-sm">
        {blockNumber > 0 ? blockNumber : 'Loading...'}
      </span>
    </div>
  );
};

export default ConnectionStatus;