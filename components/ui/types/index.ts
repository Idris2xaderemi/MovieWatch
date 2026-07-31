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