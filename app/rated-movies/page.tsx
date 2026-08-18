'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import MovieGrid from '@/components/ui/MovieGrid';

interface RatedItem {
  _id: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate: string;
  voteAverage: number;
  mediaType?: 'movie' | 'tv';
  avgRating: number;
  count: number;
}

const ITEMS_PER_PAGE = 15;

export default function RatedMoviesPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<RatedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusMap, setStatusMap] = useState<{ [id: number]: 'want' | 'watching' | 'watched' }>({});

  // Fetch rated items
  const fetchItems = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/rated?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();
      if (res.ok) {
        const newItems = data.items || [];
        setTotal(data.total || 0);
        if (pageNum === 1) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }
        setHasMore(data.page * data.limit < data.total);
      } else {
        console.error('Failed to fetch rated items');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch watchlist statuses for the current items
  const fetchStatuses = useCallback(async () => {
    if (!session?.userId || items.length === 0) return;
    const ids = items.map((m) => m._id).join(',');
    try {
      const res = await fetch(`/api/watchlist/statuses?ids=${ids}`);
      if (res.ok) {
        const data = await res.json();
        setStatusMap(data);
      }
    } catch (error) {
      console.error('Failed to fetch statuses', error);
    }
  }, [items, session]);

  // Initial load
  useEffect(() => {
    fetchItems(1);
  }, []);

  // Fetch statuses whenever items or session change
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  };

  // Map to Movie shape and attach status
  const mapToMovie = (item: RatedItem, type: 'movie' | 'tv') => ({
    id: item._id,
    title: item.title,
    poster_path: item.posterPath,
    backdrop_path: item.backdropPath || '',
    release_date: item.releaseDate,
    vote_average: item.voteAverage,
    popularity: 0,
    genre_ids: [],
    overview: '',
    media_type: type,
    watchlistStatus: statusMap[item._id] || null, // ✅ attach status
  });

  const movies = items
    .filter((item) => item.mediaType !== 'tv')
    .map((m) => mapToMovie(m, 'movie'));

  const series = items
    .filter((item) => item.mediaType === 'tv')
    .map((m) => mapToMovie(m, 'tv'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 🏆 Top User Rated
      </div>

      {/* Movies Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">🎬 Movies</h2>
        {movies.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No rated movies yet.
          </div>
        ) : (
          <MovieGrid movies={movies} showWatchlist={!!session} mediaType="movie" />
        )}
      </div>

      {/* Series Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-3">📺 TV Series</h2>
        {series.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No rated series yet.
          </div>
        ) : (
          <MovieGrid movies={series} showWatchlist={!!session} mediaType="tv" />
        )}
      </div>

      {movies.length === 0 && series.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border mt-6">
          <p className="text-gray-400">No items rated yet. Start rating!</p>
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