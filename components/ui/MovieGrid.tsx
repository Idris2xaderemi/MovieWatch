import { Movie } from '@/lib/tmdb';
import MovieCard from './MovieCard';

interface Props {
  movies: Movie[];
  watchlistStatusMap?: { [movieId: number]: 'want' | 'watching' | 'watched' };
  showWatchlist?: boolean;
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
    
          watchlistStatus={movie.watchlistStatus || null} // extract from movie object
          showWatchlist={showWatchlist}
        />
      ))}
    </div>
  );
}