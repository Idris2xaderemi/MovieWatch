'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import StatusBadge from './StatusBadge';

interface Props {
  movieId: number;
  initialStatus: 'want' | 'watching' | 'watched' | null;
  movieData?: {
    title: string;
    posterPath: string;
    backdropPath: string;
    releaseDate: string;
    voteAverage: number;
  };
  className?: string;
}

export default function AddToWatchlistButton({ 
  movieId, 
  initialStatus, 
  movieData, 
  className = '' 
}: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addToWatchlist = async () => {
    if (!session) return alert('Please sign in first');
    if (!movieData) return alert('Missing movie data');
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          title: movieData.title,
          posterPath: movieData.posterPath,
          backdropPath: movieData.backdropPath,
          releaseDate: movieData.releaseDate,
          voteAverage: movieData.voteAverage,
        }),
      });
      if (res.ok) {
        setStatus('want');
        router.refresh();
      } else if (res.status === 409) {
        alert('Already in watchlist');
      } else {
        alert('Something went wrong');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status) {
    return <StatusBadge status={status} />;
  }

  return (
    <button
      onClick={addToWatchlist}
      disabled={loading}
      className={`btn-primary text-sm px-4 py-2 rounded-full ${className}`}
    >
      {loading ? 'Adding...' : '+ Add to Watchlist'}
    </button>
  );
}