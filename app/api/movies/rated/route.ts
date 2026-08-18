import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '15', 10);
  const skip = (page - 1) * limit;

  const results = await Watchlist.aggregate([
    { $match: { rating: { $gt: 0 } } },
    {
      $group: {
        _id: '$movieId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        title: { $first: '$title' },
        posterPath: { $first: '$posterPath' },
        releaseDate: { $first: '$releaseDate' },
        voteAverage: { $first: '$voteAverage' },
        mediaType: { $first: '$mediaType' },
      },
    },
    { $sort: { avgRating: -1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const total = results[0]?.metadata[0]?.total || 0;
  const items = results[0]?.data || [];

  return NextResponse.json({ items, total, page, limit });
}