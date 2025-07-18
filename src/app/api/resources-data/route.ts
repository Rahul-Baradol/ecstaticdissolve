import { NextRequest, NextResponse } from 'next/server';
import { addResource, getResources } from '@/lib/db';
import { resourceSchema } from '@/lib/schema';

export async function GET(req: NextRequest) {
  try {
    const data = await getResources();
    return NextResponse.json({ success: true, resources: data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resource.' }, { status: 500 });
  }
}
