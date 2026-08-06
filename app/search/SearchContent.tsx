'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Movie } from '@/types';
import MovieGrid from '@/components/ui/MovieGrid';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchStatuses = useCallback(async (movieList: Movie[]) => {
    const userId = (session as any)?.userId;
    if (!userId || movieList.length === 0) return;
    const ids = movieList.map((m) => m.id).join(',');
    try {
      const res = await fetch(`/api/watchlist/statuses?ids=${ids}`);
      if (res.ok) {
        const statusMap = await res.json();
        setMovies((prev) =>
          prev.map((m) => ({
            ...m,
            watchlistStatus: statusMap[m.id] || null,
          }))
        );
      }
    } catch (e) {
      console.error('Failed to fetch statuses', e);
    }
  }, [session]);

  const performSearch = useCallback(async () => {
    if (!query) {
      setMovies([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const results = data.results || [];
      setMovies(results);
      await fetchStatuses(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, fetchStatuses]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  useEffect(() => {
    if (movies.length > 0 && session?.userId) {
      fetchStatuses(movies);
    }
  }, [session?.userId, movies, fetchStatuses]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && movies.length > 0 && session?.userId) {
        fetchStatuses(movies);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [movies, session?.userId, fetchStatuses]);

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
      {!loading && !error && (
        <MovieGrid movies={movies} showWatchlist={!!session} />
      )}
    </div>
  );
}