import { NextRequest, NextResponse } from 'next/server';
import { starResource } from '@/lib/db';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const email = req.headers.get('userid');
  if (!email) {
    return NextResponse.json({ error: 'Missing email in session token' }, { status: 400 });
  }

  try {
    await starResource(params.id, email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to star resource.' }, { status: 500 });
  }
}
