import {cookies} from "next/headers";
import { redirect } from "next/navigation";

export async function GET(
    request: Request,
) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
        return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('reviewToken', token, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect('/review/accept');
}