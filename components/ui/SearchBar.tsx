'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [query, router]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-32 md:w-48 px-4 py-2 rounded-full bg-surface border border-border text-sm focus:outline-none focus:border-primary transition text-white placeholder:text-transparent md:placeholder:text-gray-500"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
    </div>
  );
}