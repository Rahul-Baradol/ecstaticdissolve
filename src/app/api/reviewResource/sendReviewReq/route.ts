import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateToken } from '@/lib/jwt';
import { generateResourceReviewEmailHTML } from '@/lib/emailTemplate';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
    const { email, data ,resourceId} = await req.json();
    const payload = {email, resourceId: resourceId};
    const token = await generateToken(payload, process.env.JWT_SECRET!);

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
            subject: 'Resource Review Request',
            html: generateResourceReviewEmailHTML(
              data.title,
              data.url,
              email.split("@")[0], // Assuming the email is in format
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviewResource/acceptReviewReq?token=${token}`,
            ),
        });
    
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}
