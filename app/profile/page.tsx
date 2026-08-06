import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { User } from '@/lib/models/User';
import ProfileClient from './ProfileClient';
import mongoose from 'mongoose';

// Helper to serialize MongoDB documents to plain objects
function serializeDoc(doc: any) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function ProfilePage() {
  // ✅ Cast session to any to access userId
  const session = (await getServerSession(authOptions)) as any;
  if (!session) {
    redirect('/api/auth/signin');
  }

  const userId = session.userId;
  if (!userId) {
    redirect('/api/auth/signin');
  }

  await connectToDatabase();

  // Fetch user from database using Mongoose
  const user = await User.findById(userId).lean();

  // Compute member since from the ObjectId timestamp
  let memberSince = null;
  if (user) {
    // ✅ Cast to any to safely access _id
    const userAny = user as any;
    if (userAny._id) {
      const objectId = new mongoose.Types.ObjectId(userId);
      memberSince = objectId.getTimestamp();
    }
  }

  // Fetch watchlist entries
  const entries = await Watchlist.find({ userId }).lean();

  const totalWatched = entries.filter((e: any) => e.status === 'watched').length;
  const totalWant = entries.filter((e: any) => e.status === 'want').length;
  const totalWatching = entries.filter((e: any) => e.status === 'watching').length;

  // Only count movies that have a rating > 0
  const ratedEntries = entries.filter((e: any) => e.rating && e.rating > 0);
  const avgRating = ratedEntries.length > 0
    ? ratedEntries.reduce((acc: number, e: any) => acc + e.rating, 0) / ratedEntries.length
    : 0;

  const stats = {
    totalWatched,
    totalWant,
    totalWatching,
    avgRating: avgRating.toFixed(1),
  };

  const recent = entries
    .sort((a: any, b: any) => b.addedAt - a.addedAt)
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <ProfileClient
        userId={userId}
        user={serializeDoc(user)}
        stats={stats}
        recent={serializeDoc(recent)}
        memberSince={memberSince ? memberSince.toISOString() : null}
      />
    </div>
  );
}