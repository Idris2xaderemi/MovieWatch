import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Watchlist } from '@/lib/models/Watchlist';
import Image from 'next/image';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;
  await connectToDatabase();

  const user = await User.findById(userId).lean();
  if (!user) notFound();

  const entries = await Watchlist.find({ userId })
    .sort({ addedAt: -1 })
    .lean();

  const totalMovies = entries.length;
  const totalWatched = entries.filter(e => e.status === 'watched').length;
  const totalWant = entries.filter(e => e.status === 'want').length;
  const totalWatching = entries.filter(e => e.status === 'watching').length;
  const ratedEntries = entries.filter(e => e.rating && e.rating > 0);
  const avgRating = ratedEntries.length > 0
    ? ratedEntries.reduce((acc, e) => acc + e.rating, 0) / ratedEntries.length
    : 0;

  const session = await getServerSession(authOptions);
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
        <StatCard label="Total Movies" value={totalMovies} color="text-white" />
        <StatCard label="Watched" value={totalWatched} color="text-primary" />
        <StatCard label="Want to Watch" value={totalWant} color="text-yellow-400" />
        <StatCard label="Average Rating" value={avgRating.toFixed(1)} color="text-green-400" />
      </div>

      {/* Watchlist grid */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Watchlist</h2>
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-gray-400">This user hasn't added any movies yet.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {entries.map((entry) => (
            <div key={entry._id} className="card-hover rounded-xl overflow-hidden bg-surface border border-border group">
              <Link href={`/movie/${entry.movieId}`} className="block">
                <div className="relative aspect-[2/3] overflow-hidden bg-surface">
                  {entry.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`}
                      alt={entry.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-border text-gray-500">No image</div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-bold bg-primary rounded-md text-white shadow-lg">
                      {Math.round(entry.voteAverage * 10)}%
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate text-white hover:text-primary transition">
                    {entry.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span>{entry.releaseDate?.split('-')[0] || 'N/A'}</span>
                    <StatusBadge status={entry.status} />
                  </div>
                  {entry.rating > 0 && (
                    <div className="text-xs text-yellow-400 mt-1">
                      ⭐ {entry.rating.toFixed(1)}
                    </div>
                  )}
                  {entry.review && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{entry.review}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}