import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { deleteDaily, updateDaily } from '@/lib/queries/dailies';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const dailyId = parseInt(params.id);
    const deleted = await deleteDaily(dailyId, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Daily not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Daily deleted' });
  } catch (error) {
    console.error('Error deleting daily:', error);
    return serverErrorResponse();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { text, time } = body;
    const dailyId = parseInt(params.id);

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const updated = await updateDaily(dailyId, userId, text.trim(), time || null);
    if (!updated) {
      return NextResponse.json({ error: 'Daily not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Daily updated' });
  } catch (error) {
    console.error('Error updating daily:', error);
    return serverErrorResponse();
  }
}

