import { getTokenExplorerLink } from '@/lib/utils';

// Sub-components for NodeTooltip
export const NodeInfo = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-milk-base/60">{label}: </span>
    <span className="text-milk-base">{value}</span>
  </div>
);

export const AddressInfo = ({ address, chain, onCopy, copyText }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    const first = addr.slice(0, 6);
    const last = addr.slice(-4);
    return `${first}...${last}`;
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <div>
        <span className="text-milk-base/60">Address: </span>
        <a 
          href={getTokenExplorerLink(address, chain)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-milk-base/60 underline"
        >
          {formatAddress(address)}
        </a>
      </div>
      <button onClick={onCopy} className="ml-2 px-1.5 py-0.5 text-[10px] text-milk-base/60 bg-white/10 border border-milk-base/20 rounded cursor-pointer hover:bg-white/20 transition-colors">
        {copyText}
      </button>
    </div>
  );
};