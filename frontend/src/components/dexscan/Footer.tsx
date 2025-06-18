import { useIsMobile } from '@/hooks/use-mobile';
import { MILK_COLORS } from '@/lib/colors';

export const Footer = () => {
  const isMobile = useIsMobile();

  return (
    <footer
      style={{
        display: 'flex',
        padding: isMobile ? '16px' : '16px 24px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        gap: isMobile ? '24px' : undefined,
        backgroundColor: MILK_COLORS.bgSubtle,
        borderTop: `1px solid ${MILK_COLORS.borderSubtle}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: MILK_COLORS.muted,
        fontSize: '14px',
        lineHeight: '20px',
        position: 'relative',
        zIndex: 4,
      }}
    >
      {/* Copyright */}
      <div>{new Date().getFullYear()} © PropellerHeads</div>
      
      {/* Attribution */}
      <div>
        Made by PropellerHeads{' '}
        <a 
          href="https://x.com/ex9_fyi" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            borderBottom: `1px solid ${MILK_COLORS.muted}`,
            paddingBottom: '1px',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          @ex9_fyi
        </a>
      </div>
    </footer>
  );
};