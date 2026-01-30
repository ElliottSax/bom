/**
 * Email Service
 *
 * Handles email sending for password resets, notifications, and other transactional emails.
 * Supports multiple providers: development console, SendGrid, AWS SES, SMTP.
 */

import pino from 'pino';

const logger = pino({ name: 'EmailService' });

// ============================================================================
// Types
// ============================================================================

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export type EmailProvider = 'console' | 'sendgrid' | 'ses' | 'smtp';

interface EmailConfig {
  provider: EmailProvider;
  from: string;
  replyTo?: string;
  // SendGrid
  sendgridApiKey?: string;
  // AWS SES
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const config: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProvider) || 'console',
  from: process.env.EMAIL_FROM || 'BOM Study Tools <noreply@bomstudytools.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@bomstudytools.com',
  // SendGrid
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  // AWS SES
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // SMTP
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpSecure: process.env.SMTP_SECURE === 'true',
};

// ============================================================================
// Email Templates
// ============================================================================

export const emailTemplates = {
  passwordReset: (resetUrl: string, userName?: string): EmailTemplate => ({
    subject: 'Reset Your Password - BOM Study Tools',
    text: `
Hello${userName ? ` ${userName}` : ''},

You requested a password reset for your BOM Study Tools account.

Click here to reset your password: ${resetUrl}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

- The BOM Study Tools Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0066cc 0%, #004499 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">BOM Study Tools</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

    <p>Hello${userName ? ` ${userName}` : ''},</p>

    <p>You requested a password reset for your BOM Study Tools account.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>

    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>

    <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #0066cc; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} BOM Study Tools - Community of Christ Edition</p>
  </div>
</body>
</html>
    `.trim(),
  }),

  welcomeEmail: (userName: string, loginUrl: string): EmailTemplate => ({
    subject: 'Welcome to BOM Study Tools!',
    text: `
Welcome to BOM Study Tools, ${userName}!

Thank you for joining our community of scripture students.

Get started by logging in: ${loginUrl}

Features available to you:
- Read the Book of Mormon (1908 CoC Authorized Edition)
- Read the Doctrine & Covenants (including sections 114-167)
- Bookmark and highlight verses
- Take notes and track your reading progress
- Join study plans and take courses

Happy studying!

- The BOM Study Tools Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BOM Study Tools</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0066cc 0%, #004499 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to BOM Study Tools!</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>

    <p>Thank you for joining our community of scripture students.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Get Started</a>
    </div>

    <h3 style="color: #333;">What you can do:</h3>
    <ul style="color: #666;">
      <li>📖 Read the Book of Mormon (1908 CoC Authorized Edition)</li>
      <li>📜 Read the Doctrine & Covenants (including sections 114-167)</li>
      <li>🔖 Bookmark and highlight verses</li>
      <li>📝 Take notes and track your reading progress</li>
      <li>📚 Join study plans and take courses</li>
    </ul>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="color: #666; font-size: 14px;">Happy studying!</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} BOM Study Tools - Community of Christ Edition</p>
  </div>
</body>
</html>
    `.trim(),
  }),

  dailyReminder: (userName: string, appUrl: string, dailyVerse?: { reference: string; text: string }): EmailTemplate => ({
    subject: 'Your Daily Scripture Reminder - BOM Study Tools',
    text: `
Hello ${userName},

This is your daily reminder to study scripture!

${dailyVerse ? `Today's verse:\n"${dailyVerse.text}"\n- ${dailyVerse.reference}\n` : ''}
Open the app to continue your reading: ${appUrl}

Keep up your streak!

- The BOM Study Tools Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Scripture Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📖 Daily Scripture Reminder</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello ${userName},</p>

    <p>This is your daily reminder to study scripture!</p>

    ${dailyVerse ? `
    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="font-style: italic; margin: 0 0 10px 0;">"${dailyVerse.text}"</p>
      <p style="color: #666; margin: 0; font-weight: 600;">- ${dailyVerse.reference}</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}" style="background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Continue Reading</a>
    </div>

    <p style="color: #666; font-size: 14px;">Keep up your streak! 🔥</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} BOM Study Tools - Community of Christ Edition</p>
    <p><a href="${appUrl}/settings/notifications" style="color: #999;">Unsubscribe from daily reminders</a></p>
  </div>
</body>
</html>
    `.trim(),
  }),
};

// ============================================================================
// Provider Implementations
// ============================================================================

/**
 * Console provider - logs emails to console (development)
 */
async function sendViaConsole(options: EmailOptions): Promise<void> {
  logger.info({
    provider: 'console',
    to: options.to,
    subject: options.subject,
    from: options.from || config.from,
  }, '📧 Email sent (console mode)');

  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL (Development Mode)');
    console.log('='.repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from || config.from}`);
    console.log(`Subject: ${options.subject}`);
    console.log('-'.repeat(60));
    console.log(options.text);
    console.log('='.repeat(60) + '\n');
  }
}

/**
 * SendGrid provider
 */
async function sendViaSendGrid(options: EmailOptions): Promise<void> {
  if (!config.sendgridApiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: options.from || config.from },
      reply_to: options.replyTo ? { email: options.replyTo } : undefined,
      subject: options.subject,
      content: [
        { type: 'text/plain', value: options.text },
        ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error({ error, statusCode: response.status }, 'SendGrid API error');
    throw new Error(`SendGrid error: ${response.status}`);
  }

  logger.info({ to: options.to, subject: options.subject }, 'Email sent via SendGrid');
}

/**
 * AWS SES provider
 */
async function sendViaSES(_options: EmailOptions): Promise<void> {
  // Note: For production, use @aws-sdk/client-ses
  // This is a simplified implementation using the REST API
  throw new Error('AWS SES provider not yet implemented. Install @aws-sdk/client-ses for production use.');
}

/**
 * SMTP provider using Nodemailer
 */
async function sendViaSMTP(_options: EmailOptions): Promise<void> {
  // Note: For production, install nodemailer
  // npm install nodemailer @types/nodemailer
  throw new Error('SMTP provider not yet implemented. Install nodemailer for production use.');
}

// ============================================================================
// Main Email Service
// ============================================================================

/**
 * Send an email using the configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const emailOptions: EmailOptions = {
    ...options,
    from: options.from || config.from,
    replyTo: options.replyTo || config.replyTo,
  };

  try {
    switch (config.provider) {
      case 'sendgrid':
        await sendViaSendGrid(emailOptions);
        break;
      case 'ses':
        await sendViaSES(emailOptions);
        break;
      case 'smtp':
        await sendViaSMTP(emailOptions);
        break;
      case 'console':
      default:
        await sendViaConsole(emailOptions);
        break;
    }
  } catch (error) {
    logger.error({ err: error, to: options.to, subject: options.subject }, 'Failed to send email');
    throw error;
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<void> {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(resetUrl, userName);

  await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  logger.info({ email }, 'Password reset email sent');
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<void> {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login`;
  const template = emailTemplates.welcomeEmail(userName, loginUrl);

  await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  logger.info({ email, userName }, 'Welcome email sent');
}

/**
 * Send a daily reminder email
 */
export async function sendDailyReminderEmail(
  email: string,
  userName: string,
  dailyVerse?: { reference: string; text: string }
): Promise<void> {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const template = emailTemplates.dailyReminder(userName, baseUrl, dailyVerse);

  await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  logger.info({ email, userName }, 'Daily reminder email sent');
}

// Export for use in other services
export const emailService = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendDailyReminderEmail,
  templates: emailTemplates,
};

export default emailService;
