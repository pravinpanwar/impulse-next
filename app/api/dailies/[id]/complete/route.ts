import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { completeDaily, getDailyHistory } from '@/lib/queries/dailies';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const dailyId = parseInt(id);
    const completed = await completeDaily(dailyId, userId);
    
    if (!completed) {
      return NextResponse.json({ error: 'Daily not found' }, { status: 404 });
    }

    const history = await getDailyHistory(dailyId, userId);
    return NextResponse.json({ message: 'Daily completed', history });
  } catch (error) {
    console.error('Error completing daily:', error);
    return serverErrorResponse();
  }
}

