import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idsParam = req.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({}, { status: 200 });
  }

  const ids = idsParam.split(',').map(Number);
  await connectToDatabase();

  const entries = await Watchlist.find({
    userId: session.userId,
    movieId: { $in: ids },
  }).lean();

  const statusMap: { [id: number]: 'want' | 'watching' | 'watched' } = {};
  entries.forEach((entry: any) => {
    statusMap[entry.movieId] = entry.status;
  });

  return NextResponse.json(statusMap);
}