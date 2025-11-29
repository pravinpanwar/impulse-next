import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { getTasksByUserId, createTask } from '@/lib/queries/tasks';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const tasks = await getTasksByUserId(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const { text, time } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const taskId = await createTask(userId, text.trim(), time || null);
    return NextResponse.json({ id: taskId, message: 'Task created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return serverErrorResponse();
  }
}

