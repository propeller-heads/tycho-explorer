import React from 'react';
// CSS import removed

interface GraphControlsProps {
  onSelectAll: () => void;
  onSelectAllProtocols: () => void;
  onReset: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onSelectAll,
  onSelectAllProtocols,
  onReset
}) => {
  return (
    <div className="graph-controls">
      <button className="control-button select-all" onClick={onSelectAll}>
        Select All Assets
      </button>
      <button className="control-button select-all-protocols" onClick={onSelectAllProtocols}>
        Select All Protocols
      </button>
      <button className="control-button reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};