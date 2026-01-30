import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, challengeTitle, invitationToken, challengeId } = await request.json();

    if (!email || !challengeTitle || !invitationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/invite/${invitationToken}`;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Plank Challenge <onboarding@resend.dev>', // You'll update this with your domain later
      to: [email],
      subject: `You're invited to join ${challengeTitle}! 💪`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to bottom, #EFF6FF, #FFFFFF); border-radius: 8px; padding: 40px; margin-bottom: 20px;">
              <h1 style="color: #1E40AF; margin: 0 0 20px 0; font-size: 28px;">💪 You're Invited!</h1>

              <p style="font-size: 16px; margin-bottom: 20px;">
                You've been invited to join <strong>${challengeTitle}</strong>!
              </p>

              <p style="font-size: 16px; margin-bottom: 30px;">
                This is a 30-day plank challenge where you'll:
              </p>

              <ul style="font-size: 16px; margin-bottom: 30px; padding-left: 20px;">
                <li>Record your daily plank time</li>
                <li>Track your progress and streaks</li>
                <li>Compete on the leaderboard</li>
                <li>Support fellow participants</li>
              </ul>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${invitationLink}"
                   style="background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
                  Accept Invitation
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this link into your browser:<br>
                <a href="${invitationLink}" style="color: #2563EB; word-break: break-all;">${invitationLink}</a>
              </p>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              <p>This invitation was sent by a Plank Challenge administrator.</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
      text: `
You're invited to join ${challengeTitle}!

You've been invited to participate in a 30-day plank challenge.

What you'll do:
- Record your daily plank time
- Track your progress and streaks
- Compete on the leaderboard
- Support fellow participants

Accept your invitation by visiting:
${invitationLink}

If you didn't expect this invitation, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
