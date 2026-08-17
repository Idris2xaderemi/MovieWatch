import { getServerSession, Session } from 'next-auth';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Watchlist } from '@/lib/models/Watchlist';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import WatchlistItem from '@/components/WatchlistItem';
import { getTVDetails } from '@/lib/tmdb';

interface Props {
  params: Promise<{ userId: string }>;
}

function serializeDoc(doc: any) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;
  await connectToDatabase();

  // Fetch user and cast to any to avoid TypeScript issues with lean()
  const user = (await User.findById(userId).lean()) as any;
  if (!user) notFound();

  // Fetch user's watchlist entries
  const entries = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

  // Process entries: determine mediaType if missing, separate movies & series
  const movies = [];
  const series = [];

  for (const entry of entries) {
    let mediaType = entry.mediaType;

    if (!mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      try {
        const tv = await getTVDetails(String(entry.movieId));
        mediaType = tv ? 'tv' : 'movie';
      } catch {
        mediaType = 'movie';
      }
      await Watchlist.updateOne(
        { _id: entry._id },
        { $set: { mediaType } }
      );
    }

    const entryWithType = { ...entry, mediaType };
    if (mediaType === 'tv') {
      series.push(entryWithType);
    } else {
      movies.push(entryWithType);
    }
  }

  const serialize = (list: any[]) => list.map(serializeDoc);

  // ✅ Properly type the session
  const session = (await getServerSession(authOptions)) as Session | null;
  const isOwnProfile = session?.userId === userId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Profile header */}
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg">
          <Image
            src={user.image || '/default-avatar.png'}
            alt={user.name || 'User'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.name || 'User'}</h1>
          <p className="text-gray-400 text-sm">
            Member since {new Date(user._id.getTimestamp()).toLocaleDateString()}
          </p>
          {isOwnProfile && (
            <Link href="/profile" className="text-sm text-primary hover:underline">
              Edit your profile →
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Movies" value={movies.length} color="text-white" />
        <StatCard label="Total Series" value={series.length} color="text-blue-400" />
        <StatCard label="Watched" value={entries.filter((e: any) => e.status === 'watched').length} color="text-primary" />
        <StatCard label="Avg Rating" value={entries.filter((e: any) => e.rating > 0).reduce((acc: number, e: any) => acc + e.rating, 0) / (entries.filter((e: any) => e.rating > 0).length || 1)} color="text-yellow-400" />
      </div>

      {/* Watchlist sections */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Watchlist</h2>

      <div className="space-y-8">
        {/* Movies */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">🎬 Movies</h3>
          {movies.length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
              No movies in watchlist.
            </div>
          ) : (
            <div className="movie-grid">
              {serialize(movies).map((entry) => (
                <WatchlistItem key={entry._id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {/* Series */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">📺 TV Series</h3>
          {series.length === 0 ? (
            <div className="text-center py-8 bg-surface rounded-xl border border-border text-gray-400">
              No series in watchlist.
            </div>
          ) : (
            <div className="movie-grid">
              {serialize(series).map((entry) => (
                <WatchlistItem key={entry._id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}