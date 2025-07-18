import { NextRequest, NextResponse } from 'next/server';
import { updateResource, deleteResource } from '@/lib/db';
import { updateResourceSchema } from '@/lib/schema';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const body = await req.json();
    const parsed = updateResourceSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const params = await context.params;

    console.log(body)

    try {
        await updateResource(params.id, parsed.data);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update resource.' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const params = await context.params;

        await deleteResource(params.id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete resource.' }, { status: 500 });
    }
}
