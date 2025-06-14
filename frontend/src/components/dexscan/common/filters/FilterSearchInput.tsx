import { Search } from 'lucide-react';
import { useState } from 'react';
import { MILK_COLORS } from '@/lib/colors';

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
        backgroundColor: MILK_COLORS.bgSubtle,
        border: isFocused ? '2px solid #FF3366' : `1px solid ${MILK_COLORS.borderDefault}`,
        padding: isFocused ? '7px 11px' : '8px 12px' // Adjust padding to compensate for border width
      }}
    >
      <Search className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: MILK_COLORS.dimmed }} />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-60"
        style={{ color: MILK_COLORS.base }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};