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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk';
const LOGO_URL = `${APP_URL}/headerlogo2.png`;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Common email styles with dark mode support
 */
const getEmailStyles = () => `
  <style>
    :root { color-scheme: light dark; }
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a1a2e !important; }
      .email-content { background-color: #16213e !important; color: #e4e4e7 !important; }
      .email-card { background-color: #1a1a2e !important; border-color: #374151 !important; }
      .email-text { color: #e4e4e7 !important; }
      .email-muted { color: #9ca3af !important; }
      .email-info-box { background-color: #1e1b4b !important; }
      .email-warning { background-color: #422006 !important; border-color: #854d0e !important; }
      .email-warning-text { color: #fef3c7 !important; }
      .email-danger-box { background-color: #450a0a !important; border-color: #991b1b !important; }
      .email-danger-text { color: #fecaca !important; }
      .email-footer { color: #6b7280 !important; }
    }
  </style>
`;

/**
 * Common email header with logo
 */
const getEmailHeader = (title: string, headerColor: string = '#4F46E5') => `
  <!-- Logo Header -->
  <div style="text-align: center; padding: 20px 0;">
    <img src="${LOGO_URL}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
  </div>

  <!-- Header Banner -->
  <div style="background-color: ${headerColor}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${title}</h1>
  </div>
`;

/**
 * Common email footer
 */
const getEmailFooter = (showUnsubscribe: boolean = true) => `
  <div class="email-footer" style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is an automated email from Landlord Heaven.</p>
    <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
    ${showUnsubscribe ? `
    <p style="margin-top: 10px;">
      <a href="${APP_URL}/settings/notifications" style="color: #6b7280; text-decoration: underline;">Manage Notifications</a> |
      <a href="${APP_URL}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
    </p>
    ` : `
    <p style="margin-top: 10px;">
      <a href="${APP_URL}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
    </p>
    `}
  </div>
`;

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
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Purchase Confirmation</title>
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${getEmailHeader('Thank You for Your Purchase!')}

          <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>

            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">
              Your purchase has been completed successfully. Your documents are ready to download!
            </p>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h2 style="color: #4F46E5; margin-top: 0; font-size: 20px;">Order Summary</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td class="email-text" style="padding: 8px 0; font-weight: bold;">Order Number:</td>
                  <td class="email-text" style="padding: 8px 0; text-align: right;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td class="email-text" style="padding: 8px 0; font-weight: bold;">Product:</td>
                  <td class="email-text" style="padding: 8px 0; text-align: right;">${productName}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td class="email-text" style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Paid:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #4F46E5;">£${(amount / 100).toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Download Your Documents
              </a>
            </div>

            <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p class="email-text" style="margin: 0; font-size: 14px;">
                <strong>What's Next:</strong><br>
                1. Download your documents from your dashboard<br>
                2. Review and print (if needed)<br>
                3. Follow the step-by-step filing guide included<br>
                4. Contact us if you need any assistance
              </p>
            </div>

            <p class="email-text" style="font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong>Need Help?</strong><br>
              Our support team is here to help. Reply to this email or visit our help center.
            </p>

            <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Thanks for choosing Landlord Heaven!<br>
              <strong>The Landlord Heaven Team</strong>
            </p>
          </div>

          ${getEmailFooter(false)}
        </div>
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
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Welcome to Landlord Heaven</title>
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${getEmailHeader('Welcome to Landlord Heaven!')}

          <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">
              Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.
            </p>

            <h2 style="color: #4F46E5; font-size: 20px; margin-top: 30px;">What You Can Do:</h2>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p class="email-text" style="margin: 0 0 10px 0;"><strong>Generate Legal Documents</strong></p>
              <p class="email-muted" style="margin: 0; font-size: 14px; color: #6b7280;">Create Section 8/21 notices, tenancy agreements, money claims, and more.</p>
            </div>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p class="email-text" style="margin: 0 0 10px 0;"><strong>HMO Pro (Optional)</strong></p>
              <p class="email-muted" style="margin: 0; font-size: 14px; color: #6b7280;">Manage multiple properties with compliance tracking, automated reminders, and more.</p>
            </div>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p class="email-text" style="margin: 0 0 10px 0;"><strong>AI-Powered Guidance</strong></p>
              <p class="email-muted" style="margin: 0; font-size: 14px; color: #6b7280;">Our wizard asks simple questions and generates court-ready documents tailored to your situation.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/wizard" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Start Your First Case
              </a>
            </div>

            <p class="email-text" style="font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong>Need Help?</strong><br>
              Check out our <a href="${APP_URL}/help" style="color: #4F46E5; text-decoration: none;">Help Center</a> or reply to this email.
            </p>

            <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Best regards,<br>
              <strong>The Landlord Heaven Team</strong>
            </p>
          </div>

          ${getEmailFooter(true)}
        </div>
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

Get started: ${APP_URL}/wizard

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
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Reset Your Password</title>
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${getEmailHeader('Reset Your Password')}

          <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>

            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <div class="email-warning" style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p class="email-warning-text" style="margin: 0; font-size: 14px; color: #92400E;">
                <strong>Security Notice:</strong><br>
                This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.
              </p>
            </div>

            <p class="email-muted" style="font-size: 12px; color: #6b7280; margin-top: 20px; word-break: break-all;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
            </p>

            <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Best regards,<br>
              <strong>The Landlord Heaven Team</strong>
            </p>
          </div>

          ${getEmailFooter(false)}
        </div>
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
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Your HMO Pro Trial Ends Soon</title>
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${getEmailHeader(`Your Trial Ends in ${daysLeft} Days`, '#F59E0B')}

          <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">
              Your HMO Pro 7-day trial expires in <strong>${daysLeft} days</strong>. Don't lose access to:
            </p>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul class="email-text" style="margin: 0; padding-left: 20px;">
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

            <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
              <p class="email-text" style="margin: 0; font-size: 14px;">
                <strong>Pricing:</strong><br>
                From £19.99/month for 1-5 properties<br>
                Cancel anytime, no long-term commitment
              </p>
            </div>

            <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Questions? Reply to this email anytime.<br>
              <strong>The Landlord Heaven Team</strong>
            </p>
          </div>

          ${getEmailFooter(true)}
        </div>
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

/**
 * Send compliance reminder email
 */
export async function sendComplianceReminderEmail(params: {
  to: string;
  name: string;
  daysUntilExpiry: number;
  items: Array<{
    type: string;
    property: string;
    expiryDate: Date;
  }>;
}): Promise<{ success: boolean; error?: string }> {
  const { to, name, daysUntilExpiry, items } = params;

  const urgencyLevel = daysUntilExpiry <= 7 ? 'URGENT' : daysUntilExpiry <= 30 ? 'Important' : 'Reminder';
  const urgencyColor = daysUntilExpiry <= 7 ? '#DC2626' : daysUntilExpiry <= 30 ? '#F59E0B' : '#4F46E5';

  const complianceTypeLabels: Record<string, string> = {
    hmo_license: 'HMO License',
    gas_safety: 'Gas Safety Certificate',
    eicr: 'EICR (Electrical Safety)',
    fire_risk: 'Fire Risk Assessment',
    epc: 'Energy Performance Certificate (EPC)',
    legionella: 'Legionella Risk Assessment',
    insurance: 'Landlord Insurance',
    tenancy_end: 'Tenancy End Date',
  };

  const itemsList = items
    .map((item) => {
      const formattedDate = item.expiryDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const label = complianceTypeLabels[item.type] || item.type;

      return `<li class="email-text" style="margin-bottom: 10px;">
        <strong>${label}</strong> - ${item.property}<br>
        <span class="email-muted" style="color: #6b7280; font-size: 14px;">Expires: ${formattedDate}</span>
      </li>`;
    })
    .join('');

  const urgentWarning = daysUntilExpiry <= 7 ? `
    <div class="email-danger-box" style="background-color: #FEE2E2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #DC2626;">
      <p class="email-danger-text" style="margin: 0; font-size: 14px; color: #991B1B;">
        <strong>URGENT ACTION REQUIRED:</strong><br>
        These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.
      </p>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Compliance Reminder</title>
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          ${getEmailHeader(`${urgencyLevel}: ${daysUntilExpiry} Days Until Expiry`, urgencyColor)}

          <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>

            <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">
              This is a ${urgencyLevel.toLowerCase()} reminder that you have <strong>${items.length} compliance ${items.length === 1 ? 'item' : 'items'}</strong> expiring in <strong>${daysUntilExpiry} days</strong>.
            </p>

            <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
              <h2 style="color: ${urgencyColor}; margin-top: 0; font-size: 20px;">Items Requiring Action:</h2>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${itemsList}
              </ul>
            </div>

            ${urgentWarning}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/hmo" style="background-color: ${urgencyColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                View My Compliance Dashboard
              </a>
            </div>

            <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p class="email-text" style="margin: 0; font-size: 14px;">
                <strong>What to do next:</strong><br>
                1. Review each expiring item<br>
                2. Contact service providers to schedule renewals<br>
                3. Upload new certificates to your dashboard when received<br>
                4. HMO Pro will track your renewals automatically
              </p>
            </div>

            <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Stay compliant, stay safe!<br>
              <strong>The Landlord Heaven Team</strong>
            </p>
          </div>

          <div class="email-footer" style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated reminder from HMO Pro. You're receiving this because you have active compliance tracking.</p>
            <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
            <p style="margin-top: 10px;">
              <a href="${APP_URL}/settings/notifications" style="color: #6b7280; text-decoration: underline;">Manage Notifications</a> |
              <a href="${APP_URL}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

${urgencyLevel}: ${daysUntilExpiry} Days Until Expiry

This is a ${urgencyLevel.toLowerCase()} reminder that you have ${items.length} compliance ${items.length === 1 ? 'item' : 'items'} expiring in ${daysUntilExpiry} days.

Items Requiring Action:
${items
  .map((item) => {
    const formattedDate = item.expiryDate.toLocaleDateString('en-GB');
    const label = complianceTypeLabels[item.type] || item.type;
    return `- ${label} - ${item.property} (Expires: ${formattedDate})`;
  })
  .join('\n')}

${daysUntilExpiry <= 7 ? '\nURGENT ACTION REQUIRED:\nThese items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.\n' : ''}

What to do next:
1. Review each expiring item
2. Contact service providers to schedule renewals
3. Upload new certificates to your dashboard when received
4. HMO Pro will track your renewals automatically

View your dashboard: ${APP_URL}/dashboard/hmo

Stay compliant, stay safe!
The Landlord Heaven Team
  `;

  return sendEmail({
    to,
    subject: `${urgencyLevel}: ${items.length} Compliance ${items.length === 1 ? 'Item' : 'Items'} Expiring in ${daysUntilExpiry} Days`,
    html,
    text,
  });
}
