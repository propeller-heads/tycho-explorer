import { getTokenExplorerLink } from '@/lib/utils';
import { buttonStyles, linkStyles, labelColor, valueColor } from '@/components/dexscan/graph/tooltips/NodeTooltipStyles';

// Sub-components for NodeTooltip
export const NodeInfo = ({ label, value }) => (
  <div style={{ marginBottom: '8px' }}>
    <span style={{ color: labelColor }}>{label}: </span>
    <span style={{ color: valueColor }}>{value}</span>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <div>
        <span style={{ color: labelColor }}>Address: </span>
        <a 
          href={getTokenExplorerLink(address, chain)} 
          target="_blank" 
          rel="noopener noreferrer"
          style={linkStyles}
        >
          {formatAddress(address)}
        </a>
      </div>
      <button onClick={onCopy} style={buttonStyles}>
        {copyText}
      </button>
    </div>
  );
};