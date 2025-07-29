
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { setReviewedStatus } from '@/lib/db';

export default async function ReviewPage() {
  const cookieStore = cookies();
const token = (await cookieStore).get('reviewToken')?.value;
let message: string | { msg: string; status: string };

  if (!token) {
    message = '❌ Missing or expired token.';
  } else {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (!payload || !payload.email || !payload.resourceId) {
        throw new Error('Invalid token payload');
      }

      const { email, resourceId } = payload;
      const success = await setReviewedStatus(String(resourceId), true);

      message = success
        ? { msg: `Resource reviewed successfully! Thanks you for your feedback, ${String(email).split('@')[0]} ❤️`, status: 'success' }
        : { msg: 'Review failed. Maybe it’s already reviewed?', status: 'error' };
    } catch (e) {
      message = { msg: '🔐 Invalid or expired token.', status: 'error' };
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '0xFF020817',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '0xFF020817',
        border: '0.1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: 'white',
        }}>
          {typeof message === 'object' && message.status === 'success' ? '🎉 Review Submitted!' : '⚠️ Review Status'}
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#374151',
        }}>
          {typeof message === 'object' ? message.msg : message}
        </p>
        <div style={{ marginTop: '30px' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'background-color 0.3s ease'
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
