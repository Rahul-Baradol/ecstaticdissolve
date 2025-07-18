import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function redirectToJoin(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/join', req.url));
  response.cookies.set('session', '', {
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });
  return response;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;

  if (!token) {
    return redirectToJoin(req);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return redirectToJoin(req);
  }
}

export const config = {
  matcher: [
    '/dashboard',
    '/api/auth/me',
    '/api/resources',
    '/api/resources/(.*)',
    '/api/resources-by-author',
  ],
};