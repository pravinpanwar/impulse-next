import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { deleteGoal } from '@/lib/queries/goals';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const goalId = parseInt(id);
    const deleted = await deleteGoal(goalId, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return serverErrorResponse();
  }
}

