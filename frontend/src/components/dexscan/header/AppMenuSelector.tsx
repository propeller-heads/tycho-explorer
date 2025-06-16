// Module: AppMenuSelector
// Description: App menu selector dropdown for navigating between different apps

import React, { useState, useRef, useEffect } from 'react';
import GridDotsIcon from '@/assets/figma_header_icons/more-menu-grid-dots.svg';

// Constants
const ORDERBOOK_URL = 'https://orderbook.wtf';
const EXPLORER_TEXT = 'Explorer';
const ORDERBOOK_TEXT = 'Orderbook';

// CSS Classes
const MENU_BUTTON_CLASSES = "flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.08)] transition-colors";
const DROPDOWN_CLASSES = "absolute top-full left-0 mt-2 w-[203px] rounded-xl overflow-hidden shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)] z-[9999]";
const DROPDOWN_CONTAINER_CLASSES = "bg-[rgba(255,244,224,0.04)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.2)] rounded-xl py-2";
const MENU_ITEM_CLASSES = "px-4 py-2.5 mx-2 rounded-md hover:bg-[rgba(255,244,224,0.06)] transition-colors cursor-pointer text-sm font-normal text-[#FFF4E0]";
const MENU_ITEM_DISABLED_CLASSES = "px-4 py-2.5 mx-2 rounded-md text-sm font-normal text-[#FFF4E0] opacity-50 cursor-default";

const AppMenuSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOrderbookClick = () => {
    window.open(ORDERBOOK_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={MENU_BUTTON_CLASSES}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="App menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img 
          src={GridDotsIcon} 
          alt="Menu" 
          className="w-4 h-4"
        />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={DROPDOWN_CLASSES}>
          <div className={DROPDOWN_CONTAINER_CLASSES}>
            <div className={MENU_ITEM_DISABLED_CLASSES}>
              {EXPLORER_TEXT}
            </div>
            <div
              className={MENU_ITEM_CLASSES}
              onClick={handleOrderbookClick}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOrderbookClick();
                }
              }}
            >
              {ORDERBOOK_TEXT}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMenuSelector;