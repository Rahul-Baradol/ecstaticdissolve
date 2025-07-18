import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateToken } from '@/lib/jwt';
import { generateSigninEmailHTML } from '@/lib/emailTemplate';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    const token = await generateToken(email, process.env.JWT_SECRET!);

    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"ecstaticdissolve" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Join Ecstatic Dissolve!',
            html: generateSigninEmailHTML(link, email),
        });
    
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/join?error=could-not-send-email`);
    }
}
