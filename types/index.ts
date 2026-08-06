// Import the types we need
import type { Movie, MovieDetail, TMDBResponse } from '@/lib/tmdb';

// Re-export them for consumers
export type { Movie, MovieDetail, TMDBResponse };

// ---------- App‑specific types ----------
export interface WatchlistEntry {
  _id: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  status: 'want' | 'watching' | 'watched';
  rating: number;
  addedAt: Date;
  review?: string;
}

export interface WatchlistApiResponse {
  success?: boolean;
  error?: string;
  data?: WatchlistEntry;
}

// Now Movie is in scope because we imported it
export interface SearchResults {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export type WatchStatus = 'want' | 'watching' | 'watched';
export type StatusMap = { [movieId: number]: WatchStatus };

// ---------- Extend NextAuth Session ----------
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    userId: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}