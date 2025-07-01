import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterSearchInput = ({ value, onChange, placeholder = "Search..." }: FilterSearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div 
      className={cn(
        "relative flex items-center rounded-lg transition-all duration-200 bg-milk-bg-subtle",
        isFocused 
          ? "border-2 border-[#FF3366] px-[11px] py-[7px]" 
          : "border border-milk-border-default px-3 py-2"
      )}
    >
      <Search className="h-4 w-4 mr-2 flex-shrink-0 text-milk-dimmed" />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-60 text-milk-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};