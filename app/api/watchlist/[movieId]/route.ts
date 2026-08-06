import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { revalidatePath } from 'next/cache';

// ✅ PATCH – update status, rating, or review
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = (await getServerSession(authOptions)) as any;
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
    { new: true, lean: true }
  );

  if (!updated) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Revalidate all pages that show watchlist status
  revalidatePath('/');
  revalidatePath('/watchlist');
  revalidatePath('/profile');
  revalidatePath('/category', 'page');
  revalidatePath('/search', 'page');
  revalidatePath(`/movie/${movieId}`);

  return NextResponse.json(updated);
}

// ✅ DELETE – remove from watchlist
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { movieId } = await params;
  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  await connectToDatabase();

  const result = await Watchlist.findOneAndDelete({
    userId,
    movieId: parseInt(movieId),
  });

  if (!result) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Revalidate all pages
  revalidatePath('/');
  revalidatePath('/watchlist');
  revalidatePath('/profile');
  revalidatePath('/category', 'page');
  revalidatePath('/search', 'page');
  revalidatePath(`/movie/${movieId}`);

  return NextResponse.json({ success: true });
}

// (Optional) GET – fetch a single watchlist entry (if needed)
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ movieId: string }> }
// ) {
//   const session = (await getServerSession(authOptions)) as any;
//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   const { movieId } = await params;
//   const userId = session.userId;
//   await connectToDatabase();
//   const entry = await Watchlist.findOne({ userId, movieId: parseInt(movieId) }).lean();
//   if (!entry) return NextResponse.json({ status: null });
//   return NextResponse.json(entry);
// }