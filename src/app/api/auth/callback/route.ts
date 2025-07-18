import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/join?error=missing-session-token`);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);

    (await  cookies()).set('session', token!, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/join?error=invalid-session`);
  }
}
