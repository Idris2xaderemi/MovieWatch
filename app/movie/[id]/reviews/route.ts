import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { User } from '@/lib/models/User';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find all reviews for this movie
    const entries = await Watchlist.find({
      movieId: parseInt(id),
      rating: { $gt: 0 },
      review: { $ne: '' },
    }).lean();

    if (entries.length === 0) {
      return NextResponse.json([]);
    }

    // Get user names
    const userIds = entries.map((e) => e.userId);
    // ⚠️ Cast to any[] to avoid TypeScript errors with _id
    const users = (await User.find({ _id: { $in: userIds } }).lean()) as any[];

    const userMap: Record<string, string> = {};
    users.forEach((u) => {
      // Safely convert ObjectId to string
      const idStr = u._id.toString();
      userMap[idStr] = u.name || 'Anonymous';
    });

    const reviews = entries.map((e) => ({
      userId: e.userId,
      userName: userMap[e.userId] || 'Anonymous',
      rating: e.rating,
      review: e.review,
      addedAt: e.addedAt,
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}