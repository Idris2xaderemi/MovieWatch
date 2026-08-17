'use client';

import { Movie } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import ConfirmModal from './ConfirmModal';

interface Props {
  movie: Movie;
  watchlistStatus?: 'want' | 'watching' | 'watched' | null;
  showWatchlist?: boolean;
  mediaType?: 'movie' | 'tv';
}

export default function MovieCard({
  movie,
  watchlistStatus: initialStatus,
  showWatchlist = true,
  mediaType,
}: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setStatus(initialStatus || null);
  }, [initialStatus]);

  const type = mediaType || movie.media_type || 'movie';
  const detailLink = `/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`;

  const cycleStatus = async () => {
    if (!session) {
      alert('Please sign in');
      return;
    }

    setIsLoading(true);
    try {
      // If no status, add to watchlist
      if (!status) {
        const title = movie.title || movie.name || 'Untitled';
        const releaseDate = movie.release_date || movie.first_air_date || '';
        const posterPath = movie.poster_path || '';
        const backdropPath = movie.backdrop_path || '';
        const voteAverage = movie.vote_average || 0;

        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: movie.id,
            title,
            posterPath,
            backdropPath,
            releaseDate,
            voteAverage,
            mediaType: type,
          }),
        });
        if (res.ok) {
          setStatus('want');
          router.refresh();
        } else if (res.status === 409) {
          setStatus('want');
          router.refresh();
        } else {
          alert('Error adding movie');
        }
        return;
      }

      // Cycle status: want → watching → watched → remove (with modal)
      const statusOrder: ('want' | 'watching' | 'watched')[] = ['want', 'watching', 'watched'];
      const currentIndex = statusOrder.indexOf(status);
      const nextIndex = currentIndex + 1;

      // If we've reached the end, show modal
      if (nextIndex >= statusOrder.length) {
        setShowRemoveModal(true);
        return;
      }

      // Otherwise, update to the next status
      const newStatus = statusOrder[nextIndex];
      const res = await fetch(`/api/watchlist/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveModal(false);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${movie.id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus(null);
        router.refresh();
      } else {
        alert('Failed to remove from watchlist');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayTitle = movie.title || movie.name || 'Unknown Title';
  const releaseYear = (movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A';

  return (
    <div className="card-hover rounded-xl overflow-hidden bg-surface border border-border group">
      <Link href={detailLink}>
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={displayTitle}
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
              {movie.vote_average ? Math.round(movie.vote_average * 10) : 'N/A'}%
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <Link href={detailLink}>
          <h3 className="font-semibold text-sm md:text-base truncate text-white hover:text-primary transition">
            {displayTitle}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
          <span>{releaseYear}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 items-center justify-between">
          {status ? (
            <button
              onClick={cycleStatus}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs bg-border hover:bg-border/80 px-3 py-1 rounded-full transition"
            >
              <StatusBadge status={status} />
              <span className="text-gray-400 text-[10px]">(click)</span>
            </button>
          ) : showWatchlist ? (
            <button
              onClick={cycleStatus}
              disabled={isLoading}
              className="btn-primary text-xs px-3 py-1 rounded-full"
            >
              {isLoading ? 'Adding...' : '+ Watchlist'}
            </button>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemoveConfirm}
        title="Remove from watchlist?"
        message="Are you sure you want to remove this from your watchlist?"
        confirmText="Remove"
      />
    </div>
  );
}