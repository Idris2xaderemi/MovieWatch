import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { User } from '@/lib/models/User';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();

  // Find all watchlist entries for this movie with rating > 0 and review not empty
  const entries = await Watchlist.find({
    movieId: parseInt(id),
    rating: { $gt: 0 },
    review: { $ne: '' },
  }).lean();

  // Get user info for each entry (we need name)
  const userIds = entries.map(e => e.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = users.reduce((acc, u) => {
    acc[u._id.toString()] = u.name || 'Anonymous';
    return acc;
  }, {} as Record<string, string>);

  const reviews = entries.map(e => ({
    userId: e.userId,
    userName: userMap[e.userId] || 'Anonymous',
    rating: e.rating,
    review: e.review,
    addedAt: e.addedAt,
  }));

  return NextResponse.json(reviews);
}