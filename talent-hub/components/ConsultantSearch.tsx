"use client"

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConsultantSearchProps {
  onSearch: (query: string) => void;
}

export function ConsultantSearch({ onSearch }: ConsultantSearchProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Search by name, skill, or project..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Button type="button" onClick={handleSearch}>Search</Button>
    </div>
  );
}
