import { SignJWT } from 'jose';

export async function generateToken(email: string, jwt_secret: string): Promise<string> {
  const secret = new TextEncoder().encode(jwt_secret);
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);
}