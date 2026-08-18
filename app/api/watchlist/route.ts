import { getServerSession, Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { revalidatePath } from 'next/cache';

function getUserId(session: Session | null): string | null {
  if (!session) return null;
  return session.userId || session.user?.id || null;
}

// ---------- POST (add to watchlist) ----------
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, title, posterPath, backdropPath, releaseDate, voteAverage, mediaType } = body;

    if (!movieId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Watchlist.findOne({ userId, movieId });
    if (existing) {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
    }

    const entry = await Watchlist.create({
      userId,
      movieId,
      title,
      posterPath: posterPath || '',
      backdropPath: backdropPath || '',
      releaseDate: releaseDate || '',
      voteAverage: voteAverage || 0,
      mediaType: mediaType || 'movie',
      status: 'want',
      rating: 0,
      review: '',
    });

    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath('/profile');
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error in POST /api/watchlist:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------- GET (paginated watchlist) ----------
export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Watchlist.find({ userId }).sort({ addedAt: -1 }).skip(skip).limit(limit).lean(),
      Watchlist.countDocuments({ userId }),
    ]);

    return NextResponse.json({ entries, total, page, limit });
  } catch (error: any) {
    console.error('❌ Error in GET /api/watchlist:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}