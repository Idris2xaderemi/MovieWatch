import { Movie } from '@/types';
import MovieCard from './MovieCard';

interface Props {
  movies: Movie[];
  watchlistStatusMap?: { [movieId: number]: 'want' | 'watching' | 'watched' };
  showWatchlist?: boolean;
  mediaType?: 'movie' | 'tv'; // ✅ new
}

export default function MovieGrid({
  movies,
  watchlistStatusMap = {},
  showWatchlist = true,
  mediaType,
}: Props) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          watchlistStatus={movie.watchlistStatus || null}
          showWatchlist={showWatchlist}
          mediaType={mediaType}
        />
      ))}
    </div>
  );
}