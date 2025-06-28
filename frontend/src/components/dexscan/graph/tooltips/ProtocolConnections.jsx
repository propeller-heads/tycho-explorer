import { getReadableProtocolName } from '@/components/dexscan/common/readableProtocols';

export const ProtocolConnections = ({ protocols, total }) => (
  <>
    {protocols.map(([protocol, count]) => (
      <div key={protocol} className="mb-1">
        <span className="text-milk-base/60">
          Connections through {getReadableProtocolName(protocol)}: 
        </span>
        <span className="text-milk-base"> {count} / {total}</span>
      </div>
    ))}
  </>
);