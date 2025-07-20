import { NextRequest, NextResponse } from 'next/server';
import { getResourcesByAuthor, getResourceSnapshotById } from '@/lib/db';
import type { Resource, ResourceClient } from '@/types';
import { jwtVerify } from 'jose';
import { Timestamp } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get('userid');
    if (!email) {
      return NextResponse.json({ error: 'Missing email in session token' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const lastCreatedAt = searchParams.get('lastCreatedAt');

    let data: Resource[] | null;

    if (lastCreatedAt) {
      const lastCreatedAtTimestamp = Timestamp.fromDate(new Date(lastCreatedAt));
      data = await getResourcesByAuthor(email, lastCreatedAtTimestamp);
    } else {
      data = await getResourcesByAuthor(email);
    }

    const resources: ResourceClient[] = data.map((resource) => {
      let { starredBy, ...rest } = resource;
      return {
        ...rest,
        isStarred: email ? resource.starredBy.includes(email) : false,
      };
    });

    return NextResponse.json({ count: resources.length, resources });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
