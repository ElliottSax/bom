import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  feedback: string;
  email?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { feedback, email, userAgent, url, timestamp } = body;

    // Validate required fields
    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    // Get environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const feedbackEmail = process.env.FEEDBACK_EMAIL || 'feedback@bomstudytools.org';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@bomstudytools.org';

    // If no API key, fall back to logging (development mode)
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Feedback will only be logged.');
      console.log('Feedback received:', {
        feedback,
        email: email || 'anonymous',
        userAgent,
        url,
        timestamp: timestamp || new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Feedback received (development mode)',
      });
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: feedbackEmail,
        subject: `BOM Study Tools Feedback${email ? ` from ${email}` : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Feedback Received</h2>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Feedback Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${feedback}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; font-weight: 600;">Contact Email:</td>
                <td style="padding: 8px 0;">${email || 'Not provided (anonymous)'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; font-weight: 600;">Submitted:</td>
                <td style="padding: 8px 0;">${timestamp || new Date().toISOString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; font-weight: 600;">Page URL:</td>
                <td style="padding: 8px 0; word-break: break-all;">${url || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">User Agent:</td>
                <td style="padding: 8px 0; font-size: 0.875rem; color: #6b7280;">${userAgent || 'Not provided'}</td>
              </tr>
            </table>

            <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px;">
              This feedback was submitted through the BOM Study Tools web application.
            </p>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailData);
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

    console.log('Feedback email sent successfully:', emailData.id);

    return NextResponse.json({
      success: true,
      message: 'Feedback sent successfully',
      emailId: emailData.id,
    });

  } catch (error) {
    console.error('Error processing feedback:', error);

    return NextResponse.json(
      {
        error: 'Failed to process feedback',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
