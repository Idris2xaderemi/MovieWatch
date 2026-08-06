// TMDB API types
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
  popularity?: number;
  original_language?: string;
}

export interface MovieDetail extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: { 
      name: string; 
      character: string; 
      profile_path?: string | null;
      order?: number;
    }[];
  };
  revenue?: number;
  budget?: number;
  tagline?: string;
  homepage?: string;
  status?: string;
}

// Watchlist entry from MongoDB
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
}

// API response for adding/updating watchlist
export interface WatchlistApiResponse {
  success?: boolean;
  error?: string;
  data?: WatchlistEntry;
}

// Search results (client-side)
export interface SearchResults {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Session user (extends NextAuth default)
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

// Utility type for movie status mapping
export type WatchStatus = 'want' | 'watching' | 'watched';

// For components that need a map of movieId -> status
export type StatusMap = { [movieId: number]: WatchStatus };