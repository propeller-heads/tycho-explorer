import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { FILTER_STYLES, FILTER_INLINE_STYLES } from './filterStyles';

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
        ...FILTER_INLINE_STYLES.searchContainer,
        ...(isFocused ? FILTER_INLINE_STYLES.searchContainerFocused : FILTER_INLINE_STYLES.searchContainerUnfocused)
      }}
    >
      <Search className={FILTER_STYLES.searchIcon} />
      <Input
        type="text"
        placeholder={placeholder}
        className={FILTER_STYLES.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};