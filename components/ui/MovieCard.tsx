'use client';

import { Movie } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';

interface Props {
  movie: Movie;
  watchlistStatus?: 'want' | 'watching' | 'watched' | null;
  showWatchlist?: boolean; // <-- ADDED
}

export default function MovieCard({
  movie,
  watchlistStatus: initialStatus,
  showWatchlist = true, // default true
}: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setStatus(initialStatus || null);
  }, [initialStatus]);

  const addToWatchlist = async () => {
    if (!session) {
      alert('Please sign in to add to watchlist');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
        }),
      });
      if (res.ok) {
        setStatus('want');
        router.refresh();
      } else if (res.status === 409) {
        alert('Already in watchlist');
      } else {
        alert('Error adding movie');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-hover rounded-xl overflow-hidden bg-surface border border-border group">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-border text-gray-500">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-bold bg-primary rounded-md text-white shadow-lg">
              {Math.round(movie.vote_average * 10)}%
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm md:text-base truncate text-white hover:text-primary transition">
            {movie.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
          <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 items-center justify-between">
          {status ? (
            <StatusBadge status={status} />
          ) : showWatchlist ? ( // ✅ conditionally show button
            <button
              onClick={addToWatchlist}
              disabled={isLoading}
              className="btn-primary text-xs px-3 py-1 rounded-full"
            >
              {isLoading ? 'Adding...' : '+ Watchlist'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}