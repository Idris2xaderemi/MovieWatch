import { getServerSession, Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import WatchlistItem from '@/components/WatchlistItem';

// Helper to serialize MongoDB documents
function serializeDoc(doc: any) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function WatchlistPage() {
  // ✅ Type the session explicitly
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect('/api/auth/signin');
  }

  // ✅ Fallback to session.user.id if session.userId is missing
  const userId = session.userId || session.user?.id;

  if (!userId) {
    // If still no userId, redirect to signin (should not happen)
    redirect('/api/auth/signin');
  }

  await connectToDatabase();

  const entries = await Watchlist.find({ userId })
    .sort({ addedAt: -1 })
    .lean();

  // Serialize each entry to a plain object
  const serializedEntries = entries.map((entry) => serializeDoc(entry));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 📋 Your Watchlist
      </div>
      {serializedEntries.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold">Your watchlist is empty</h3>
          <p className="text-gray-400 mt-2">Start adding movies from the homepage.</p>
          <a href="/" className="btn-primary mt-5 inline-block">Browse Movies</a>
        </div>
      ) : (
        <div className="movie-grid">
          {serializedEntries.map((entry) => (
            <WatchlistItem key={entry._id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}