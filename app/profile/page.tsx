import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { User } from '@/lib/models/User';
import ProfileClient from './ProfileClient';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function serializeDoc(doc: any) {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session) {
    redirect('/api/auth/signin');
  }

  const userId = session.userId;
  if (!userId) {
    redirect('/api/auth/signin');
  }

  await connectToDatabase();

  const user = await User.findById(userId).lean();

  let memberSince = null;
  if (user) {
    const userAny = user as any;
    if (userAny._id) {
      const objectId = new mongoose.Types.ObjectId(userId);
      memberSince = objectId.getTimestamp();
    }
  }

  const entries = await Watchlist.find({ userId }).lean();

  const totalWatched = entries.filter((e: any) => e.status === 'watched').length;
  const totalWant = entries.filter((e: any) => e.status === 'want').length;
  const totalWatching = entries.filter((e: any) => e.status === 'watching').length;

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