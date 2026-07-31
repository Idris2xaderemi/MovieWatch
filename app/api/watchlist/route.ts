import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  // ✅ Use the shared authOptions
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;   // now typed – from our Session extension
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  const body = await req.json();
  await connectToDatabase();

  try {
    revalidatePath('/');
    revalidatePath(`/movie/${body.movieId}`);
    revalidatePath('/watchlist');
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
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


