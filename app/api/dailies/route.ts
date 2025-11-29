import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { getDailiesByUserId, createDaily } from '@/lib/queries/dailies';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const dailies = await getDailiesByUserId(userId);
    return NextResponse.json(dailies);
  } catch (error) {
    console.error('Error fetching dailies:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { text, time, goalId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const dailyId = await createDaily(userId, text.trim(), time || null, goalId || null);
    return NextResponse.json({ id: dailyId, message: 'Daily created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating daily:', error);
    return serverErrorResponse();
  }
}

