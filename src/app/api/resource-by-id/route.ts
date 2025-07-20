import { NextRequest, NextResponse } from 'next/server';
import { getResourceById } from '@/lib/db';
import type { Resource, ResourceClient } from '@/types';
import { jwtVerify } from 'jose';

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

        if (!docId) {
            return NextResponse.json({ error: 'Missing docId in request' }, { status: 400 });
        }

        const data: Resource | null = await getResourceById(docId);
        if (!data) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        const { starredBy, ...rest } = data;
        const email = typeof authData?.payload.email === "string" ? authData.payload.email : null;
        const resource: ResourceClient = {
            ...rest,
            isStarred: email ? starredBy.includes(email) : false,
        } 

        return NextResponse.json({ resource });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
}
