import React, { useState, useEffect, useRef } from 'react';

interface BlockProgressIconProps {
  startTime: number | null; // Timestamp of when the current block started
  duration: number;      // Estimated duration of a block in milliseconds
  size?: number;          // Size of the icon (width and height)
  strokeWidth?: number;   // Width of the progress stroke
  color?: string;         // Color of the progress stroke
}

const BlockProgressIcon: React.FC<BlockProgressIconProps> = ({
  startTime,
  duration,
  size = 16, // Small default size, e.g. 16px
  strokeWidth = 2,
  color = '#FF3366', // Default to Folly/red/neon
}) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (startTime === null || duration <= 0) {
      setProgress(0); // Reset or show empty if no start time or invalid duration
      return;
    }

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      let currentProgress = elapsedTime / duration;

      if (currentProgress >= 1) {
        currentProgress = 1;
        // Optionally, could add a small visual cue here when it hits 100% before reset by new block
      }
      
      setProgress(currentProgress);

      if (currentProgress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    // Reset progress when startTime changes (new block)
    setProgress(0); 
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [startTime, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  // Ensure startTime is not null for rendering, default to non-animated full circle if so.
  const displayProgress = startTime === null ? 0 : progress; // Show full if no startTime (or handle differently)
  const displayOffset = circumference - displayProgress * circumference;


  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}> {/* Rotate to start from top */}
      {/* Background track circle (optional, could be transparent or a lighter shade) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 244, 224, 0.2)" // Light track color from Figma palette
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={displayOffset}
        strokeLinecap="round" // Makes the line ends rounded
      />
    </svg>
  );
};

export default BlockProgressIcon;
