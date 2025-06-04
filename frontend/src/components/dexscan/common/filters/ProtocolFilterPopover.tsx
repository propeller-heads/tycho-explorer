import { useState, useMemo } from 'react';
import { LucideChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { protocolColors } from '../../graph/protocolColors';
import { cn } from '@/lib/utils';

interface ProtocolFilterPopoverProps {
  protocols: string[];
  selectedProtocols: string[];
  onProtocolToggle: (protocol: string, isSelected: boolean) => void;
  buttonText?: string;
  showColorDots?: boolean;
}

export const ProtocolFilterPopover = ({ 
  protocols, 
  selectedProtocols, 
  onProtocolToggle,
  buttonText = "Select Protocol...",
  showColorDots = false
}: ProtocolFilterPopoverProps) => {
  const [open, setOpen] = useState(false);

  const buttonLabel = useMemo(() => {
    if (selectedProtocols.length === 0) return buttonText;
    return `${selectedProtocols.length} selected`;
  }, [selectedProtocols, buttonText]);

  // Keep protocols in alphabetical order
  const sortedProtocols = useMemo(() => 
    [...protocols].sort((a, b) => a.localeCompare(b)), 
    [protocols]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 sm:h-8 px-3 border-[rgba(255,244,224,0.2)] bg-[rgba(255,244,224,0.02)] hover:bg-[rgba(255,244,224,0.06)] text-xs text-[rgba(255,244,224,1)]"
        >
          {buttonLabel}
          <LucideChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-64 p-0 bg-[rgba(255,244,224,0.02)] backdrop-blur-[104px] border border-[rgba(255,244,224,0.12)] shadow-[0px_4px_16px_0px_rgba(37,0,63,0.2)]"
      >
        {/* Selected Summary Bar */}
        {selectedProtocols.length > 0 && (
          <div className="px-3 py-2 border-b border-[rgba(255,244,224,0.1)]">
            <span className="text-xs text-[rgba(255,244,224,0.6)]">
              {selectedProtocols.length} protocol{selectedProtocols.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        <ScrollArea className="h-[200px] p-2">
          {sortedProtocols.length === 0 && (
            <p className="text-xs text-[rgba(255,244,224,0.4)] text-center py-2">No protocols available.</p>
          )}
          {sortedProtocols.map(protocol => {
            const isSelected = selectedProtocols.includes(protocol);
            return (
              <div 
                key={protocol}
                className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-[rgba(255,244,224,0.06)] cursor-pointer transition-all duration-200"
                onClick={() => onProtocolToggle(protocol, !isSelected)}
              >
                <Checkbox
                  id={`protocol-${protocol}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => onProtocolToggle(protocol, !!checked)}
                  className="border-[rgba(255,244,224,0.64)] data-[state=checked]:bg-[#FF3366] data-[state=checked]:border-[#FF3366] data-[state=checked]:text-white rounded-none"
                />
                {showColorDots && (
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                    style={{ 
                      backgroundColor: protocolColors[protocol.toLowerCase()] || '#848484',
                      opacity: isSelected ? 1 : 0.7
                    }}
                  />
                )}
                <label 
                  htmlFor={`protocol-${protocol}`}
                  className={cn(
                    "text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer flex-1",
                    isSelected ? "font-semibold text-[rgba(255,244,224,1)]" : "font-medium text-[rgba(255,244,224,0.9)]"
                  )}
                >
                  {protocol}
                </label>
              </div>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};