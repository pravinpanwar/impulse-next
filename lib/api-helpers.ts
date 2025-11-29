import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function getUserId(request: NextRequest): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return parseInt(session.user.id as string);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function serverErrorResponse(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}

