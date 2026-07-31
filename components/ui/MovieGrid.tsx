import { Movie } from '@/types';
import MovieCard from './MovieCard';

interface Props {
  movies: Movie[];
  watchlistStatusMap?: { [movieId: number]: 'want' | 'watching' | 'watched' };
  showWatchlist?: boolean; // <-- ADDED
}

export default function MovieGrid({
  movies,
  watchlistStatusMap = {},
  showWatchlist = true,
}: Props) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          watchlistStatus={watchlistStatusMap[movie.id] || null}
          showWatchlist={showWatchlist} // <-- PASS
        />
      ))}
    </div>
  );
}