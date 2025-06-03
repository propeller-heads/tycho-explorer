import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterSearchInput = ({ value, onChange, placeholder = "Search..." }: FilterSearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div 
      className="relative flex items-center"
      style={{
        backgroundColor: "rgba(255, 244, 224, 0.02)",
        borderRadius: "8px",
        borderStyle: "solid",
        borderWidth: isFocused ? "2px" : "1px",
        borderColor: isFocused ? '#FF3366' : 'rgba(255, 244, 224, 0.2)',
        padding: "8px 12px",
        transition: "border-color 0.2s ease-in-out, border-width 0.2s ease-in-out"
      }}
    >
      <Search className="mr-2 h-4 w-4 shrink-0 text-[rgba(255,244,224,0.4)]" />
      <Input
        type="text"
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-xs bg-transparent text-[rgba(255,244,224,1)] placeholder:text-[rgba(255,244,224,0.4)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};