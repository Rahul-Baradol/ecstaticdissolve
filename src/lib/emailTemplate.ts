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