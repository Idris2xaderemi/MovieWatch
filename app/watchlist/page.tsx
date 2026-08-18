'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import WatchlistItem from '@/components/WatchlistItem';

const ITEMS_PER_PAGE = 15;

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const fetchEntries = async (pageNum: number) => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();
      if (res.ok) {
        const newEntries = data.entries || [];
        setTotal(data.total || 0);
        if (pageNum === 1) {
          setEntries(newEntries);
        } else {
          setEntries((prev) => [...prev, ...newEntries]);
        }
        setHasMore(data.page * data.limit < data.total);
      } else {
        console.error('Failed to fetch watchlist');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEntries(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage);
  };

  // Separate movies and series
  const movies: any[] = [];
  const series: any[] = [];

  for (const entry of entries) {
    const mediaType = entry.mediaType || 'movie';
    const entryWithType = { ...entry, mediaType };
    if (mediaType === 'tv') {
      series.push(entryWithType);
    } else {
      movies.push(entryWithType);
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 📋 Your Watchlist
      </div>

      {/* Movies Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">🎬 Movies</h2>
        {movies.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No movies in your watchlist yet.
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((entry) => (
              <WatchlistItem key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Series Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-3">📺 TV Series</h2>
        {series.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No series in your watchlist yet.
          </div>
        ) : (
          <div className="movie-grid">
            {series.map((entry) => (
              <WatchlistItem key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {movies.length === 0 && series.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border mt-6">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold">Your watchlist is empty</h3>
          <p className="text-gray-400 mt-2">Start adding movies from the homepage.</p>
          <a href="/" className="btn-primary mt-5 inline-block">Browse Movies</a>
        </div>
      )}

      {hasMore && (movies.length > 0 || series.length > 0) && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-outline px-6 py-2 text-sm"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}