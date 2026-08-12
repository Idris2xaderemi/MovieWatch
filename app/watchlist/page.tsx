import { getServerSession, Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import WatchlistItem from '@/components/WatchlistItem';
import { getTVDetails } from '@/lib/tmdb';

function serializeDoc(doc: any) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function WatchlistPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session) {
    redirect('/api/auth/signin');
  }

  const userId = session.userId || session.user?.id;
  if (!userId) {
    redirect('/api/auth/signin');
  }

  await connectToDatabase();

  const entries = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

  // Separate movies and series, auto‑correct any 'movie' entry that is actually a TV show
  const movies = [];
  const series = [];

  for (const entry of entries) {
    let mediaType = entry.mediaType;

    // If it's marked as 'movie' but might be a TV show, check TMDB
    if (mediaType === 'movie') {
      try {
        const tv = await getTVDetails(String(entry.movieId));
        if (tv) {
          // It's actually a TV show – correct the mediaType
          mediaType = 'tv';
          await Watchlist.updateOne(
            { _id: entry._id },
            { $set: { mediaType: 'tv' } }
          );
        }
      } catch {
        // Error or not a TV show – keep as movie
      }
    }

    const entryWithType = { ...entry, mediaType };
    if (mediaType === 'tv') {
      series.push(entryWithType);
    } else {
      movies.push(entryWithType);
    }
  }

  const serialize = (list: any[]) => list.map(serializeDoc);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 📋 Your Watchlist
      </div>

      {/* Movies Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">🎬 Movies</h2>
        {movies.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No movies in your watchlist yet.
          </div>
        ) : (
          <div className="movie-grid">
            {serialize(movies).map((entry) => (
              <WatchlistItem key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Series Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-3">📺 TV Series</h2>
        {series.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
            No series in your watchlist yet.
          </div>
        ) : (
          <div className="movie-grid">
            {serialize(series).map((entry) => (
              <WatchlistItem key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {movies.length === 0 && series.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-border mt-6">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold">Your watchlist is empty</h3>
          <p className="text-gray-400 mt-2">Start adding movies from the homepage.</p>
          <a href="/" className="btn-primary mt-5 inline-block">Browse Movies</a>
        </div>
      )}
    </div>
  );
}