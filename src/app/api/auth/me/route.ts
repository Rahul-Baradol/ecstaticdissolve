import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get('userid');
    if (!email) {
      return NextResponse.json({ error: 'Missing email in session token' }, { status: 400 });
    }

    return NextResponse.json({ email: email });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}