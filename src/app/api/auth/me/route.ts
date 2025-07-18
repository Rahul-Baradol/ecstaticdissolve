import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('session');
  const token = cookie?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload: decoded } = await jwtVerify(token, secret);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({ email: decoded.email });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}