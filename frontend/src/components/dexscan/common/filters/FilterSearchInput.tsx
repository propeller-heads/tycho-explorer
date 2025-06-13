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
      className="relative flex items-center px-3 py-2 rounded-lg transition-all duration-200"
      style={{
        backgroundColor: 'rgba(255, 244, 224, 0.02)',
        border: isFocused ? '2px solid #FF3366' : '1px solid rgba(255, 244, 224, 0.2)',
        padding: isFocused ? '7px 11px' : '8px 12px' // Adjust padding to compensate for border width
      }}
    >
      <Search className="h-4 w-4 text-[rgba(255,244,224,0.4)] mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-[#FFF4E0] placeholder:text-[rgba(255,244,224,0.4)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};