
import { Button } from '@/components/ui/button';
import { MILK_COLORS } from '@/lib/colors';

interface ViewSelectorProps {
  activeTab: 'graph' | 'pools';
  setActiveTab: (tab: 'graph' | 'pools') => void;
}

export const ViewSelector = ({ activeTab, setActiveTab }: ViewSelectorProps) => {
  // Common classes for both buttons with mobile-optimized touch targets
  // Mobile: larger padding for 44px minimum touch target, Desktop: original Figma specs
  const commonButtonClasses = `py-3 px-4 sm:py-[10px] sm:px-[14px] rounded-xl text-sm font-medium text-[${MILK_COLORS.base}] leading-none`;

  // Classes for the selected button: background rgba(255, 244, 224, 0.06)
  const selectedButtonClasses = "bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]";
  
  // Classes for the unselected button: transparent background
  const unselectedButtonClasses = "bg-transparent hover:bg-[rgba(255,255,255,0.03)]";

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost" // Use ghost variant as a base for minimal styling
        className={`${commonButtonClasses} ${activeTab === 'pools' ? selectedButtonClasses : unselectedButtonClasses}`}
        onClick={() => setActiveTab('pools')}
      >
        Pool List
      </Button>
      
      <Button
        variant="ghost" // Use ghost variant as a base
        className={`${commonButtonClasses} ${activeTab === 'graph' ? selectedButtonClasses : unselectedButtonClasses}`}
        onClick={() => setActiveTab('graph')}
      >
        Market Graph
      </Button>
    </div>
  );
};
