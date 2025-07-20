import { NextRequest, NextResponse } from 'next/server';
import { getResources, getResourceSnapshotById } from '@/lib/db';
import { jwtVerify } from 'jose';
import { ResourceClient } from '@/types';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;

  let authData = null;

  try {
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      authData = await jwtVerify(token, secret);
    }
  } catch (error) {
    console.error("Token verification failed: ", error);
  }

  try {

    const { searchParams } = new URL(req.url);

    const docId = searchParams.get('docId');
    const lastDocSnap = docId ? await getResourceSnapshotById(docId) : null;

    const data = await getResources(lastDocSnap);

    const email = typeof authData?.payload.email === "string" ? authData.payload.email : null;
    const resources: ResourceClient[] = data.resources.map((resource) => {
      let { starredBy, ...rest } = resource;
      return {
        ...rest,
        isStarred: email ? resource.starredBy.includes(email) : false,
      };
    });

    return NextResponse.json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json({ error: 'Failed to fetch resource.' }, { status: 500 });
  }
}
