import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Watchlist } from '@/lib/models/Watchlist';
import mongoose from 'mongoose';

export async function DELETE() {
  // ✅ Cast session to any to access userId
  const session = await getServerSession(authOptions) as any;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  // Delete all related data
  await Watchlist.deleteMany({ userId });
  await db.collection('accounts').deleteMany({ userId });
  await db.collection('sessions').deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  return NextResponse.json({ success: true });
}