import { NextRequest, NextResponse } from 'next/server';
import { getResourcesByAuthor } from '@/lib/db';
import type { Resource } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email in request body' }, { status: 400 });
    }

    const resources: Resource[] = await getResourcesByAuthor(email);
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
