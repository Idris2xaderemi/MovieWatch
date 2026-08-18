import { getServerSession, Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { revalidatePath } from 'next/cache';

function getUserId(session: Session | null): string | null {
  if (!session) return null;
  return session.userId || session.user?.id || null;
}

// ✅ DELETE – remove from watchlist
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const { movieId } = await params;
    if (!movieId || isNaN(parseInt(movieId))) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    await connectToDatabase();

    const result = await Watchlist.findOneAndDelete({
      userId,
      movieId: parseInt(movieId),
    });

    if (!result) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Revalidate all pages that show watchlist data
    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath('/profile');
    revalidatePath('/category', 'page');
    revalidatePath('/search', 'page');
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in DELETE /api/watchlist/[movieId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ PATCH – update status, rating, review
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const { movieId } = await params;
    if (!movieId || isNaN(parseInt(movieId))) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, rating, review } = body;

    await connectToDatabase();

    const updated = await Watchlist.findOneAndUpdate(
      { userId, movieId: parseInt(movieId) },
      { status, rating, review },
      { new: true, lean: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Revalidate all pages
    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath('/profile');
    revalidatePath('/category', 'page');
    revalidatePath('/search', 'page');
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/watchlist/[movieId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}