'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/tmdb';

interface Props {
  movies: Movie[];
}

export default function FeaturedCarousel({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (movies.length === 0) return;
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [movies.length, isPaused]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    // Reset timer on manual navigation
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 5000);
    }
  };

  const goToPrev = () => {
    goTo((currentIndex - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    goTo((currentIndex + 1) % movies.length);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance in pixels
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left → next
        goToNext();
      } else {
        // Swipe right → previous
        goToPrev();
      }
    }
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (movies.length === 0) return null;

  const movie = movies[currentIndex];
  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden mb-10 group touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      <Image
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

      {/* Content */}
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

      {/* Left arrow (visible on hover) */}
      <button
        onClick={goToPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right arrow (visible on hover) */}
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-primary w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}