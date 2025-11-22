/**
 * Resend Email Service
 *
 * Centralized email sending service using Resend API
 * Handles all transactional emails: purchase confirmations, welcome emails, etc.
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

/**
 * Email configuration
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Landlord Heaven <no-reply@landlordheaven.co.uk>';
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL || 'support@landlordheaven.co.uk';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send a transactional email
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || REPLY_TO_EMAIL,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmation(params: {
  to: string;
  customerName: string;
  productName: string;
  amount: number;
  orderNumber: string;
  downloadUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, customerName, productName, amount, orderNumber, downloadUrl } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Purchase! 🎉</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          Your purchase has been completed successfully. Your documents are ready to download!
        </p>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h2 style="color: #4F46E5; margin-top: 0; font-size: 20px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
              <td style="padding: 8px 0; text-align: right;">#${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Product:</td>
              <td style="padding: 8px 0; text-align: right;">${productName}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Paid:</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #4F46E5;">£${(amount / 100).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Download Your Documents
          </a>
        </div>

        <div style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0; font-size: 14px;">
            <strong>💡 What's Next:</strong><br>
            1. Download your documents from your dashboard<br>
            2. Review and print (if needed)<br>
            3. Follow the step-by-step filing guide included<br>
            4. Contact us if you need any assistance
          </p>
        </div>

        <p style="font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <strong>Need Help?</strong><br>
          Our support team is here to help. Reply to this email or visit our help center.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Thanks for choosing Landlord Heaven!<br>
          <strong>The Landlord Heaven Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated email. Please do not reply directly to this message.</p>
        <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${customerName},

Thank you for your purchase!

Order Summary:
- Order Number: #${orderNumber}
- Product: ${productName}
- Total Paid: £${(amount / 100).toFixed(2)}

Download your documents: ${downloadUrl}

What's Next:
1. Download your documents from your dashboard
2. Review and print (if needed)
3. Follow the step-by-step filing guide included
4. Contact us if you need any assistance

Need help? Reply to this email or visit our help center.

Thanks for choosing Landlord Heaven!
The Landlord Heaven Team
  `;

  return sendEmail({
    to,
    subject: `Purchase Confirmation - ${productName} (#${orderNumber})`,
    html,
    text,
  });
}

/**
 * Send welcome email (for new users)
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, name } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Landlord Heaven</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Landlord Heaven! 👋</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.
        </p>

        <h2 style="color: #4F46E5; font-size: 20px; margin-top: 30px;">What You Can Do:</h2>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0 0 10px 0;"><strong>📝 Generate Legal Documents</strong></p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Create Section 8/21 notices, tenancy agreements, money claims, and more.</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0 0 10px 0;"><strong>🏠 HMO Pro (Optional)</strong></p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Manage multiple properties with compliance tracking, automated reminders, and more.</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0 0 10px 0;"><strong>🤖 AI-Powered Guidance</strong></p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Our wizard asks simple questions and generates court-ready documents tailored to your situation.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/wizard" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Start Your First Case
          </a>
        </div>

        <p style="font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <strong>Need Help?</strong><br>
          Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/help" style="color: #4F46E5; text-decoration: none;">Help Center</a> or reply to this email.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Best regards,<br>
          <strong>The Landlord Heaven Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.

What You Can Do:
- Generate Legal Documents: Create Section 8/21 notices, tenancy agreements, money claims, and more.
- HMO Pro (Optional): Manage multiple properties with compliance tracking and automated reminders.
- AI-Powered Guidance: Our wizard generates court-ready documents tailored to your situation.

Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/wizard

Need help? Reply to this email or check our Help Center.

Best regards,
The Landlord Heaven Team
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Landlord Heaven!',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, resetUrl } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 0; font-size: 14px; color: #92400E;">
            <strong>⚠️ Security Notice:</strong><br>
            This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.
          </p>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 20px; word-break: break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Best regards,<br>
          <strong>The Landlord Heaven Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi there,

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

Security Notice:
This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.

Best regards,
The Landlord Heaven Team
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password - Landlord Heaven',
    html,
    text,
  });
}

/**
 * Send HMO Pro trial reminder (Day 5: 2 days left)
 */
export async function sendTrialReminderEmail(params: {
  to: string;
  name: string;
  daysLeft: number;
  upgradeUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, name, daysLeft, upgradeUrl } = params;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your HMO Pro Trial Ends Soon</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #F59E0B; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Trial Ends in ${daysLeft} Days ⏰</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          Your HMO Pro 7-day trial expires in <strong>${daysLeft} days</strong>. Don't lose access to:
        </p>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;"><strong>Automated compliance reminders</strong> (90/30/7 days advance)</li>
            <li style="margin-bottom: 10px;"><strong>Multi-property management</strong></li>
            <li style="margin-bottom: 10px;"><strong>Council-specific HMO license applications</strong></li>
            <li style="margin-bottom: 10px;"><strong>Tenant document portal</strong></li>
            <li style="margin-bottom: 10px;"><strong>Priority support</strong></li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${upgradeUrl}" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Continue with HMO Pro
          </a>
        </div>

        <div style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p style="margin: 0; font-size: 14px;">
            <strong>💰 Pricing:</strong><br>
            From £19.99/month for 1-5 properties<br>
            Cancel anytime, no long-term commitment
          </p>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Questions? Reply to this email anytime.<br>
          <strong>The Landlord Heaven Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

Your HMO Pro 7-day trial expires in ${daysLeft} days. Don't lose access to:

- Automated compliance reminders (90/30/7 days advance)
- Multi-property management
- Council-specific HMO license applications
- Tenant document portal
- Priority support

Continue with HMO Pro: ${upgradeUrl}

Pricing: From £19.99/month for 1-5 properties
Cancel anytime, no long-term commitment.

Questions? Reply to this email anytime.
The Landlord Heaven Team
  `;

  return sendEmail({
    to,
    subject: `Your HMO Pro Trial Ends in ${daysLeft} Days`,
    html,
    text,
  });
}
