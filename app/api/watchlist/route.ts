import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { revalidatePath } from 'next/cache';

// ✅ POST – add to watchlist
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  const body = await req.json();
  await connectToDatabase();

  try {
    const entry = await Watchlist.create({
      userId,
      movieId: body.movieId,
      title: body.title,
      posterPath: body.posterPath,
      backdropPath: body.backdropPath,
      releaseDate: body.releaseDate,
      voteAverage: body.voteAverage,
      status: 'want',
      rating: 0,
      review: '',
    });


    // ... inside POST handler after creating entry ...

// Revalidate all possible pages
    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath('/profile');
    revalidatePath('/category', 'page');
    revalidatePath('/search', 'page');
    revalidatePath(`/movie/${body.movieId}`);

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ GET – fetch user's watchlist
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const entries = await Watchlist.find({ userId: session.userId }).sort({ addedAt: -1 });
  return NextResponse.json(entries);
}