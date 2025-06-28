// Sub-components for EdgeTooltip
export const PoolIdSection = ({ poolLink, displayPoolId, onCopy, copyText }) => (
  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <span style={{ color: 'rgba(255, 244, 224, 0.64)' }}>Pool ID: </span>
      <a 
        href={poolLink} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: 'rgba(255, 244, 224, 0.64)', textDecoration: 'underline', wordBreak: 'break-all' }}
      >
        {displayPoolId}
      </a>
    </div>
    <button 
      onClick={onCopy}
      style={{
        marginLeft: '8px',
        padding: '2px 6px',
        fontSize: '10px',
        color: 'rgba(255, 244, 224, 0.64)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 244, 224, 0.2)',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {copyText}
    </button>
  </div>
);

export const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: '8px' }}>
    <span style={{ color: 'rgba(255, 244, 224, 0.64)' }}>{label}: </span>
    <span style={{ color: '#FFF4E0' }}>{value}</span>
  </div>
);
