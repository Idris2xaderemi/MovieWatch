import { Metadata } from 'next';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import MovieGrid from '@/components/ui/MovieGrid';

export const metadata: Metadata = {
  title: 'Top User Rated – FilmHive',
  description: 'Movies and series rated highest by the FilmHive community',
};

export default async function RatedMoviesPage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/movies/rated`, { cache: 'no-store' });
  const ratedItems = await res.json();

  // Separate movies and series based on mediaType
  const movies = ratedItems
    .filter((item: any) => item.mediaType === 'movie' || !item.mediaType)
    .map((m: any) => ({
      id: m._id,
      title: m.title,
      poster_path: m.posterPath,
      release_date: m.releaseDate,
      vote_average: m.voteAverage,
      popularity: 0,
      genre_ids: [],
      overview: '',
      media_type: m.mediaType || 'movie',
      avgRating: m.avgRating,
      count: m.count,
    }));

  const series = ratedItems
    .filter((item: any) => item.mediaType === 'tv')
    .map((m: any) => ({
      id: m._id,
      title: m.title,
      poster_path: m.posterPath,
      release_date: m.releaseDate,
      vote_average: m.voteAverage,
      popularity: 0,
      genre_ids: [],
      overview: '',
      media_type: 'tv',
      avgRating: m.avgRating,
      count: m.count,
    }));

  // ✅ Properly type the session
  const session = (await getServerSession(authOptions)) as Session | null;
  let statusMap: { [movieId: number]: 'want' | 'watching' | 'watched' } = {};

  if (session?.userId) {
    await connectToDatabase();
    const allIds = [...movies, ...series].map((m: any) => m.id);
    const entries = await Watchlist.find({
      userId: session.userId,
      movieId: { $in: allIds },
    }).lean();
    entries.forEach((entry: any) => {
      statusMap[entry.movieId] = entry.status;
    });
  }

  // Helper to attach watchlist status
  const attachStatus = (list: any[]) =>
    list.map((item) => ({
      ...item,
      watchlistStatus: statusMap[item.id] || null,
    }));

  const moviesWithStatus = attachStatus(movies);
  const seriesWithStatus = attachStatus(series);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 🏆 Top User Rated
      </div>

      {/* Movies Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">🎬 Movies</h2>
        {moviesWithStatus.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No rated movies yet.
          </div>
        ) : (
          <MovieGrid movies={moviesWithStatus} showWatchlist={!!session} mediaType="movie" />
        )}
      </div>

      {/* Series Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-3">📺 TV Series</h2>
        {seriesWithStatus.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No rated series yet.
          </div>
        ) : (
          <MovieGrid movies={seriesWithStatus} showWatchlist={!!session} mediaType="tv" />
        )}
      </div>

      {moviesWithStatus.length === 0 && seriesWithStatus.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border mt-6">
          <p className="text-gray-400">No items rated yet. Start rating!</p>
        </div>
      )}
    </div>
  );
}