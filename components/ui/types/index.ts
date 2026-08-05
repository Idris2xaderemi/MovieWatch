// ---------- Re-export all TMDB types ----------
export type {
  Movie,
  MovieDetail,
  TMDBResponse,
} from '@/lib/tmdb';

// ---------- App‑specific local types ----------
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

export type WatchStatus = 'want' | 'watching' | 'watched';
export type StatusMap = { [movieId: number]: WatchStatus };