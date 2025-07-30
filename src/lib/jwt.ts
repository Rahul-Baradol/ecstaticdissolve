import { SignJWT } from 'jose';

export async function generateToken(payload: Record<string, unknown>, jwt_secret: string): Promise<string> {
  const secret = new TextEncoder().encode(jwt_secret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);
}
