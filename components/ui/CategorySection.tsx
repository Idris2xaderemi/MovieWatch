'use client';

import { useState } from 'react';
import { Movie } from '@/lib/tmdb';
import MovieGrid from './MovieGrid';
import Link from 'next/link';

interface Props {
  title: string;
  icon?: string;
  initialMovies: Movie[]; // these already have watchlistStatus attached
  category: string;
  showWatchlist?: boolean;
}

export default function CategorySection({
  title,
  icon,
  initialMovies,
  category,
  showWatchlist = true,
}: Props) {
  // We keep the initial movies; no need to re-fetch on client side
  const [movies] = useState<Movie[]>(initialMovies);

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <Link
          href={`/category/${category}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View More →
        </Link>
      </div>
      <MovieGrid movies={movies} showWatchlist={showWatchlist} />
    </section>
  );
}