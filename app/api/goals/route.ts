import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { getGoalsByUserId, createGoal } from '@/lib/queries/goals';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const goals = await getGoalsByUserId(userId);
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
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
    const { name, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const goalId = await createGoal(userId, name.trim(), color || 'text-purple-400 border-purple-500');
    return NextResponse.json({ id: goalId, message: 'Goal created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return serverErrorResponse();
  }
}

