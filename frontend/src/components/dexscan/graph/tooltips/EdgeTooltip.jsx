import { useState } from 'react';
import { renderHexId, formatTimeAgo } from '@/components/dexscan/shared/utils/format';
import { getExternalLink } from '@/components/dexscan/shared/utils/links';
import { parsePoolFee } from '@/components/dexscan/shared/utils/poolUtils';
import { getReadableProtocolName } from '@/components/dexscan/shared/readableProtocols';
import { PoolIdSection, InfoRow } from '@/components/dexscan/graph/tooltips/EdgeTooltipParts';
import { tooltipClasses } from '@/components/dexscan/graph/tooltips/EdgeTooltipStyles';

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

  return (
    <div className={tooltipClasses} style={style}>
      <PoolIdSection 
        poolLink={poolLink}
        displayPoolId={displayPoolId}
        onCopy={handleCopy}
        copyText={copyText}
      />
      <InfoRow label="Protocol" value={getReadableProtocolName(pool.protocol_system)} />
      {feePercent && <InfoRow label="Fee" value={`${feePercent?.toFixed(4)}%`}/>}
      <InfoRow label="Last Update" value={timeAgo} />
    </div>
  );
};