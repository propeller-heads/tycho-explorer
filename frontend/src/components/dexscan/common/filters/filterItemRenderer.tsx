import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FILTER_STYLES } from './filterStyles';
import { cn } from '@/lib/utils';

// Generic filter item props
interface FilterItemProps {
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  secondaryLabel?: string;
  showSecondaryLabel?: boolean;
}

// Render a single filter item with checkbox
export const renderFilterItem = ({
  isSelected,
  onClick,
  icon,
  label,
  secondaryLabel,
  showSecondaryLabel = true
}: FilterItemProps) => (
  <div 
    className={FILTER_STYLES.itemContainer}
    onClick={onClick}
    style={{ scrollSnapAlign: 'start' }}
  >
    <Checkbox
      checked={isSelected}
      className={FILTER_STYLES.checkbox}
    />
    {icon}
    <div 
      className={cn(
        "text-sm leading-none truncate flex-1",
        isSelected ? FILTER_STYLES.textColors.selected : FILTER_STYLES.textColors.unselected
      )}
      title={label}
    >
      {label}
      {showSecondaryLabel && secondaryLabel && secondaryLabel !== label && (
        <span className={cn(
          "text-xs ml-1",
          isSelected ? FILTER_STYLES.textColors.selectedSecondary : FILTER_STYLES.textColors.secondary
        )}>
          {secondaryLabel}
        </span>
      )}
    </div>
  </div>
);

// Render empty state message
export const renderEmptyState = (message: string) => (
  <p className={FILTER_STYLES.noItemsText}>{message}</p>
);

// Render selected section header
export const renderSelectedSectionHeader = (
  count: number,
  isExpanded: boolean,
  onToggle: () => void,
  ChevronDown: React.ComponentType<{ className?: string }>,
  ChevronRight: React.ComponentType<{ className?: string }>
) => (
  <button
    className={`w-full px-2 py-1.5 flex items-center justify-between ${FILTER_STYLES.hoverBackground} transition-colors`}
    onClick={onToggle}
  >
    <span className={FILTER_STYLES.selectedSectionText}>
      SELECTED ({count})
    </span>
    {isExpanded ? (
      <ChevronDown className={FILTER_STYLES.chevronIcon} />
    ) : (
      <ChevronRight className={FILTER_STYLES.chevronIcon} />
    )}
  </button>
);