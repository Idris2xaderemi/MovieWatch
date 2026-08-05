'use client';

import { Movie } from '@/lib/tmdb';
import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  title: string;
  category: string;
  movies: Movie[];
  showWatchlist?: boolean;
}

export default function CategoryRow({ title, category, movies, showWatchlist = true }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <Link
          href={`/category/${category}`}
          className="text-sm text-primary hover:underline"
        >
          View All →
        </Link>
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {movies.map((movie) => (
            <MovieCardHorizontal
              key={movie.id}
              movie={movie}
              showWatchlist={showWatchlist && !!session}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Small horizontal card
function MovieCardHorizontal({ movie, showWatchlist }: { movie: Movie; showWatchlist: boolean }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(movie.watchlistStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const addToWatchlist = async () => {
    if (!session) return alert('Sign in first');
    setIsLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title || movie.name,
          posterPath: movie.poster_path || '',
          backdropPath: movie.backdrop_path || '',
          releaseDate: movie.release_date || movie.first_air_date || '',
          voteAverage: movie.vote_average || 0,
        }),
      });
      if (res.ok) {
        setStatus('want');
        router.refresh();
      } else if (res.status === 409) {
        setStatus('want');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = movie.title || movie.name || 'Untitled';
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';

  return (
    <div className="flex-none w-40 md:w-48 snap-start group">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-surface">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 40vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-border text-gray-500 text-xs">No image</div>
          )}
          <div className="absolute top-1 right-1 bg-primary/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {Math.round(movie.vote_average * 10)}%
          </div>
        </div>
      </Link>
      <div className="mt-1.5">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="text-sm font-medium truncate hover:text-primary transition">{title}</h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{year}</span>
          {status ? (
            <StatusBadge status={status} />
          ) : showWatchlist ? (
            <button
              onClick={addToWatchlist}
              disabled={isLoading}
              className="text-primary text-[10px] font-medium hover:underline"
            >
              + Watchlist
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}