import { useIsMobile } from '@/hooks/use-mobile';

export const Footer = () => {
  const isMobile = useIsMobile();

  return (
    <footer
      className={`flex items-start bg-milk-bg-subtle border-t border-milk-border-subtle backdrop-blur-[10px] text-milk-muted text-sm leading-5 relative z-[4] ${
        isMobile
          ? 'flex-col justify-start gap-6 p-4'
          : 'flex-row justify-between px-6 py-4'
      }`}
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
          className="text-inherit no-underline border-b border-milk-muted pb-[1px] transition-opacity duration-200 hover:opacity-80"
        >
          @ex9_fyi
        </a>
      </div>

      <div>Logos from{' '}
        <a href="https://www.coingecko.com/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline border-b border-milk-muted pb-[1px] transition-opacity duration-200 hover:opacity-80">
          Coingecko
        </a>
      </div>
    </footer >
  );
};