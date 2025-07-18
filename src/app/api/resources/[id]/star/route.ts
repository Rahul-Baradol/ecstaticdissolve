import { NextRequest, NextResponse } from 'next/server';
import { starResource } from '@/lib/db';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const params = await context.params;

  try {
    await starResource(params.id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to star resource.' }, { status: 500 });
  }
}
