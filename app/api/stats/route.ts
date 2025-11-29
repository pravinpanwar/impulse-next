import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { getUserStats, updateUserStats } from '@/lib/queries/stats';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const stats = await getUserStats(userId);
    if (!stats) {
      // Return default stats instead of error if user exists but stats don't
      return NextResponse.json({ xp: 0, streak: 0, last_login: null });
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    // If it's a foreign key constraint error, return default stats
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ xp: 0, streak: 0, last_login: null });
    }
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { xp, streak } = body;

    if (typeof xp !== 'number' || typeof streak !== 'number') {
      return NextResponse.json({ error: 'XP and streak must be numbers' }, { status: 400 });
    }

    await updateUserStats(userId, xp, streak);
    return NextResponse.json({ message: 'Stats updated' });
  } catch (error) {
    console.error('Error updating stats:', error);
    return serverErrorResponse();
  }
}

