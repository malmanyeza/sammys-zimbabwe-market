
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);

  // Update local state if initialQuery changes (e.g. when filters are reset)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    
    // Automatically search after a short delay (debounce)
    const timeoutId = setTimeout(() => {
      onSearch(e.target.value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={handleChange}
        className="pl-10 py-6 text-base md:text-lg bg-white"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </form>
  );
};

export default SearchBar;
