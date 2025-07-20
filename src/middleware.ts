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
    const data = await jwtVerify(token, secret);
    const email = typeof data.payload.email === 'string' ? data.payload.email : null;

    const response = NextResponse.next();
    if (!email) {
      return redirectToJoin(req);
    }
    
    response.headers.set('userid', email);
    return response;
  } catch (error) {
    console.error("Token verification failed:", error);
    return redirectToJoin(req);
  }
}

export const config = {
  matcher: [
    '/submit',
    '/dashboard',
    '/api/auth/me',
    '/api/resources',
    '/api/resources/(.*)',
    '/api/resources-by-author',
  ],
};