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
      return NextResponse.json({ error: 'Stats not found' }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
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

