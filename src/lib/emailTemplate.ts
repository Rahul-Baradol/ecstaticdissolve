export function generateSigninEmailHTML(signinUrl: string, email: string) {
  const nowIST = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <p>Hello,</p>
      <p>We received a request to sign in to <b>ecstaticdissolve</b> using this email address, at <b>${nowIST} IST</b>.</p>
      <p>If you want to sign in with your <b>${email}</b> account, click this link:</p>
      <p style="margin: 20px 0;">
        <a href="${signinUrl}" style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Sign in to ecstaticdissolve</a>
      </p>
      <p>If you did not request this link, you can safely ignore this email.</p>
      <p>Thanks,<br><br>Your <b>ecstaticdissolve</b> team</p>
    </div>
  `;
}



export function generateResourceReviewEmailHTML(
  resourceTitle: string,
  resourceUrl: string,
  reviewerName: string,
  acceptUrl: string
) {
  return `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; color: #2e2e2e; background-color: #f9f9f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
      <h2 style="color: #222;">👋 Hello, ${reviewerName}</h2>
      <p style="font-size: 16px; line-height: 1.5;">
        You’ve been requested to review a new resource:
        <strong style="color: #000;">${resourceTitle}</strong>
      </p>
      
      <p style="font-size: 15px; margin-top: 20px;">You can view the resource here:</p>
      <a href="${resourceUrl}" style="
          display: inline-block;
          padding: 14px 22px;
          background-color: #0070f3;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 15px;
          margin-bottom: 24px;
        "
        target="_blank"
      >
        🔗 View Resource
      </a>

      <p style="font-size: 15px; margin-top: 30px;">After reviewing, click below to accept the submission:</p>
      <a href="${acceptUrl}" style="
          display: inline-block;
          padding: 14px 24px;
          background-color: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          transition: background-color 0.2s ease;
        "
        target="_blank"
      >
        ✅ Accept Resource
      </a>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;" />
      <p style="font-size: 13px; color: #666; margin-top: 12px;">
        If you didn’t expect this email, feel free to ignore it. You won’t receive further notifications unless you’re listed as a reviewer.
      </p>
    </div>
  `;
}
