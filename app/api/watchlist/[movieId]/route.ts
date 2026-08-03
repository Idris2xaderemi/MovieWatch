import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { movieId } = await params;
  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  const body = await req.json();
  const { status, rating, review } = body;

  await connectToDatabase();

  const updated = await Watchlist.findOneAndUpdate(
    { userId, movieId: parseInt(movieId) },
    { status, rating, review },
    { new: true }
  );

  // Revalidate all pages that show watchlist status
  revalidatePath('/');
  revalidatePath('/watchlist');
  revalidatePath('/profile');
  revalidatePath('/category', 'page');
  revalidatePath(`/movie/${movieId}`);

  return NextResponse.json(updated);
}