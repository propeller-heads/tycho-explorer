// Sub-components for EdgeTooltip
export const PoolIdSection = ({ poolLink, displayPoolId, onCopy, copyText }) => (
  <div className="mb-2 flex justify-between items-center">
    <div>
      <span className="text-milk-base/60">Pool ID: </span>
      <a 
        href={poolLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-milk-base/60 underline break-all"
      >
        {displayPoolId}
      </a>
    </div>
    <button 
      onClick={onCopy}
      className="ml-2 px-1.5 py-0.5 text-[10px] text-milk-base/60 bg-white/10 border border-milk-base/20 rounded cursor-pointer hover:bg-white/20 transition-colors"
    >
      {copyText}
    </button>
  </div>
);

export const InfoRow = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-milk-base/60">{label}: </span>
    <span className="text-milk-base">{value}</span>
  </div>
);
