
import { Button } from '@/components/ui/button';

interface ViewSelectorProps {
  activeTab: 'graph' | 'pools';
  setActiveTab: (tab: 'graph' | 'pools') => void;
}

export const ViewSelector = ({ activeTab, setActiveTab }: ViewSelectorProps) => {
  // Common classes for both buttons, matching Figma: 14px font (text-sm), 500 weight (font-medium), Inter (usually global)
  // Padding 10px 14px (py-[10px] px-[14px]), border-radius 12px (rounded-xl)
  // Text color #FFF4E0
  const commonButtonClasses = "py-[10px] px-[14px] rounded-xl text-sm font-medium text-[#FFF4E0] leading-none";

  // Classes for the selected button: background rgba(255, 244, 224, 0.06)
  const selectedButtonClasses = "bg-[rgba(255,244,224,0.06)] hover:bg-[rgba(255,244,224,0.1)]";
  
  // Classes for the unselected button: transparent background
  const unselectedButtonClasses = "bg-transparent hover:bg-[rgba(255,244,224,0.03)]";

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
