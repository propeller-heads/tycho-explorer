import { getReadableProtocolName } from '@/components/dexscan/common/readableProtocols';
import { labelColor, valueColor } from '@/components/dexscan/graph/tooltips/NodeTooltipStyles';

export const ProtocolConnections = ({ protocols, total }) => (
  <>
    {protocols.map(([protocol, count]) => (
      <div key={protocol} style={{ marginBottom: '4px' }}>
        <span style={{ color: labelColor }}>
          Connections through {getReadableProtocolName(protocol)}: 
        </span>
        <span style={{ color: valueColor }}> {count} / {total}</span>
      </div>
    ))}
  </>
);