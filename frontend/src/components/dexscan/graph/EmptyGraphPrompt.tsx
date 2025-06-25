import React, { useEffect, useState } from 'react';
import { MILK_COLORS } from '@/lib/colors';
import selectTokensIcon from '@/assets/figma_generated/select_tokens_icon.svg';

interface EmptyGraphPromptProps {
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
}

const EmptyGraphPrompt: React.FC<EmptyGraphPromptProps> = ({
  connectionState,
  connectionStartTime
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

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 md:px-16">
      {/* Icon */}
      <img 
        src={selectTokensIcon} 
        alt="Select tokens" 
        className="w-40 h-40"
      />
      
      {/* Message with highlighted text */}
      <div className="flex flex-wrap items-center justify-center gap-1 text-sm" style={{ color: MILK_COLORS.base }}>
        <span>You need to</span>
        <span 
          className="px-2 py-1 rounded"
          style={{ backgroundColor: 'rgba(0, 255, 187, 0.2)' }}
        >
          select at least two tokens
        </span>
        <span>to display the graph.</span>
      </div>
      
      {/* Connection status - show below the prompt when not connected */}
      {connectionState !== 'connected' && (
        <div className="text-sm mt-6" style={{ color: MILK_COLORS.muted }}>
          {connectionState === 'connecting' 
            ? `Connecting... (${formatElapsedTime(elapsedTime)})`
            : 'Disconnected'
          }
        </div>
      )}
    </div>
  );
};

export default EmptyGraphPrompt;