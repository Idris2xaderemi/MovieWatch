'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Movie } from '@/types';
import MovieGrid from '@/components/ui/MovieGrid';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h2 className="text-2xl font-bold mb-4">
        {query ? `Results for "${query}"` : 'Search movies'}
      </h2>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && movies.length === 0 && query && (
        <div className="text-gray-400">No movies found.</div>
      )}
      {!loading && !error && <MovieGrid movies={movies} />}
    </div>
  );
}