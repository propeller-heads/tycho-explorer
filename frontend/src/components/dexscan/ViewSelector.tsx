
import { Button } from '@/components/ui/button';

interface ViewSelectorProps {
  activeTab: 'graph' | 'pools';
  setActiveTab: (tab: 'graph' | 'pools') => void;
}

export const ViewSelector = ({ activeTab, setActiveTab }: ViewSelectorProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={activeTab === 'pools' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveTab('pools')}
      >
        List View
      </Button>
    </div>
  );
};
