// Mobile menu button component with overlay modal for navigation options
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';

// Constants
const DOCS_URL = "https://github.com/propeller-heads/tycho-explorer";
const POOL_LIST_TEXT = 'Pool List';
const MARKET_GRAPH_TEXT = 'Market Graph';
const DOCS_TEXT = 'Docs (Run locally)';

// Props interface
interface MobileMenuButtonProps {
  currentView: "graph" | "pools";
  onViewChange: (view: "graph" | "pools") => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ currentView, onViewChange }) => {
  // State for menu visibility
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle view selection
  const handleViewSelect = (view: "graph" | "pools") => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        ref={buttonRef}
        className="w-[36px] h-[36px] rounded-[12px] flex flex-col justify-center items-center gap-[4px] transition-colors hover:opacity-80 bg-milk-bg-light"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-4 h-4 text-milk-base" />
        ) : (
          <Menu className="w-4 h-4 text-milk-base" />
        )}
      </button>

      {/* Menu overlay modal */}
      {isOpen && (
        <>
          {/* Full screen backdrop with blur */}
          <div 
            className="fixed inset-0 z-[9998] backdrop-blur-[48px]"
            style={{ backgroundColor: 'rgba(25, 10, 53, 0.7)' }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu container positioned at top */}
          <div className="fixed left-0 right-0 top-[108px] z-[9999] flex justify-center pointer-events-none px-4">
            <div 
              ref={menuRef}
              className="flex flex-col gap-2 p-0 pointer-events-auto w-full max-w-[392px]"
            >
              {/* Pool List */}
              <button
                onClick={() => handleViewSelect('pools')}
                className="px-[14px] py-[10px] text-base font-medium text-center transition-opacity hover:opacity-80 text-milk-base font-sans"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {POOL_LIST_TEXT}
              </button>

              {/* Market Graph */}
              <button
                onClick={() => handleViewSelect('graph')}
                className="px-[14px] py-[10px] text-base font-medium text-center transition-opacity hover:opacity-80 text-milk-base font-sans"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {MARKET_GRAPH_TEXT}
              </button>

              {/* Docs link */}
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-[14px] py-[10px] text-base font-medium text-center transition-opacity hover:opacity-80 text-milk-base font-sans"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                <span className="flex items-center justify-center gap-1">
                  {DOCS_TEXT}
                  <ExternalLink className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileMenuButton;