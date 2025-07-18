import { NextRequest, NextResponse } from 'next/server';
import { addResource } from '@/lib/db';
import { resourceSchema } from '@/lib/schema';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resourceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await addResource(parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to add resource.' }, { status: 500 });
  }
}
