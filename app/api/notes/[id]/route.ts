import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import { deleteNote } from '@/lib/queries/notes';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const noteId = parseInt(params.id);
    const deleted = await deleteNote(noteId, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return serverErrorResponse();
  }
}

