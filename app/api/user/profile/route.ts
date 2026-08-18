import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    if (!name && !image) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ Profile updated in DB:', updatedUser);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}