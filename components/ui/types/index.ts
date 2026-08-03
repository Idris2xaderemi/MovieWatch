// TMDB API types
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  popularity: number;
  genre_ids: number[];
  origin_country?: string[];
  original_language?: string;
  media_type?: 'movie' | 'tv';
}

export interface MovieDetail extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: { name: string; character: string }[];
  };
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