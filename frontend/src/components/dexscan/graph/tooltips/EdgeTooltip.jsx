import { useState } from 'react';
import { getExternalLink, renderHexId, formatTimeAgo } from '@/lib/utils';
import { parsePoolFee } from '@/lib/poolUtils';
import { getReadableProtocolName } from '@/components/dexscan/common/readableProtocols';
import { PoolIdSection, InfoRow } from '@/components/dexscan/graph/tooltips/EdgeTooltipParts';
import { defaultStyles } from '@/components/dexscan/graph/tooltips/EdgeTooltipStyles';

/**
 * Tooltip component for graph edges (pools)
 */
export const EdgeTooltip = ({ pool, selectedChain, style = {} }) => {
  const [copyText, setCopyText] = useState('Copy');
  
  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(pool.id);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  const poolLink = getExternalLink(pool, selectedChain);
  const displayPoolId = renderHexId(pool.id);
  const timeAgo = formatTimeAgo(pool.updatedAt);
  const feePercent = parsePoolFee(pool);
  const formattedFee = `${feePercent.toFixed(4)}%`;

  return (
    <div style={{ ...defaultStyles, ...style }}>
      <PoolIdSection 
        poolLink={poolLink}
        displayPoolId={displayPoolId}
        onCopy={handleCopy}
        copyText={copyText}
      />
      <InfoRow label="Protocol" value={getReadableProtocolName(pool.protocol_system)} />
      <InfoRow label="Fee" value={formattedFee} />
      <InfoRow label="Last Update" value={timeAgo} />
    </div>
  );
};