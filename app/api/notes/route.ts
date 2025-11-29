import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { getNotesByUserId, createNote } from '@/lib/queries/notes';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const notes = await getNotesByUserId(userId);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
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
    const { text, category } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const noteId = await createNote(userId, text.trim(), category || 'IDEA');
    return NextResponse.json({ id: noteId, message: 'Note created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return serverErrorResponse();
  }
}

