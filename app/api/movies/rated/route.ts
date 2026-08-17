import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';

export async function GET() {
  await connectToDatabase();


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
  ]);

  return NextResponse.json(results);
}