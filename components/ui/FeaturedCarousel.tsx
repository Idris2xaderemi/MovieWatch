'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/tmdb';

interface Props {
  movies: Movie[];
}

export default function FeaturedCarousel({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) return null;

  const movie = movies[currentIndex];
  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden mb-10 group">
      <Image
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">{title}</h2>
        <p className="text-gray-300 text-sm md:text-base mt-2 line-clamp-3 drop-shadow-md">{movie.overview}</p>
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-300">
          <span>⭐ {movie.vote_average.toFixed(1)}</span>
          {releaseYear && <span>• {releaseYear}</span>}
        </div>
        <Link
          href={`/movie/${movie.id}`}
          className="btn-primary inline-block mt-4"
        >
          View Details
        </Link>
      </div>
      {/* Dots indicator */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-primary w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}