/**
 * Resend Email Service
 *
 * Centralized email sending service using Resend API.
 * Handles all transactional emails: purchase confirmations, welcome emails, etc.
 *
 * ============================================================================
 * EMAIL RENDERING NOTES - DO NOT REMOVE
 * ============================================================================
 *
 * WHY TABLE-BASED LAYOUT?
 * - Outlook (desktop and Outlook.com) does not reliably support CSS layout
 * - <style> blocks and CSS classes are often stripped or ignored
 * - Divs render unpredictably across email clients
 * - Tables are the only reliable way to ensure consistent layout
 *
 * WHY INLINE STYLES EVERYWHERE?
 * - Many email clients strip <style> blocks entirely
 * - CSS class inheritance doesn't work in Outlook
 * - Every text element needs explicit color, otherwise it may inherit
 *   unexpected colors or get inverted in dark mode
 *
 * WHY LIGHT OUTER / DARK INNER "CARD" DESIGN?
 * - Outlook dark mode may invert full-page dark backgrounds
 * - A neutral (#F3F4F6) outer background is safe from inversion
 * - The dark "card" container stays intact as a fixed-width centered element
 * - This prevents the "washed out" appearance in Outlook dark mode
 *
 * WHY MSO CONDITIONAL COMMENTS?
 * - Microsoft Office (MSO) clients ignore bgcolor on some elements
 * - VML (Vector Markup Language) can force background colors in Outlook
 * - Conditional comments target only MSO clients without affecting others
 *
 * WHY BULLETPROOF BUTTONS?
 * - CSS padding on <a> tags doesn't work in Outlook
 * - Table-based buttons with cell padding render consistently
 * - The button remains clickable across all email clients
 *
 * ============================================================================
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
 * Color constants for consistent branding
 * Using safe dark tones (not pure black) to avoid harsh inversion in dark mode
 */
const COLORS = {
  // Background colors
  outerBg: '#F3F4F6',         // Light gray - safe outer background
  cardBg: '#111827',           // Dark slate - main card background (gray-900)
  cardBgAlt: '#1F2937',        // Slightly lighter for contrast areas (gray-800)
  accentBg: '#312E81',         // Indigo-900 for accent areas
  warningBg: '#78350F',        // Amber-900 for warnings
  dangerBg: '#7F1D1D',         // Red-900 for urgent/danger

  // Text colors
  white: '#FFFFFF',            // Primary text on dark backgrounds
  offWhite: '#F9FAFB',         // Slightly softer white (gray-50)
  lightGray: '#D1D5DB',        // Secondary text (gray-300)
  mutedGray: '#9CA3AF',        // Muted text (gray-400)
  darkText: '#111827',         // Text on light backgrounds

  // Brand colors
  primary: '#6366F1',          // Indigo-500 (brand purple)
  primaryLight: '#818CF8',     // Indigo-400 (lighter for links)
  amber: '#F59E0B',            // Amber-500 for warnings
  red: '#EF4444',              // Red-500 for urgent
  green: '#10B981',            // Emerald-500 for success

  // Border colors
  border: '#374151',           // gray-700 for subtle borders
  borderLight: '#4B5563',      // gray-600 for lighter borders
} as const;

/**
 * Generate the common HTML head with meta tags for dark mode support
 */
const getEmailHead = (title: string): string => `
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if !mso]><!-->
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--<![endif]-->
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
      table { border-collapse: collapse; }
      td { font-family: Arial, sans-serif; }
    </style>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
      /* Reset styles */
      body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
      /* Dark mode support for clients that support it */
      @media (prefers-color-scheme: dark) {
        .email-outer-bg { background-color: #1F2937 !important; }
      }
    </style>
  </head>
`;

/**
 * Generate the outer wrapper table with light background
 * This creates the email structure: outer light bg -> centered 600px card
 */
const getEmailWrapper = (content: string): string => `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
${getEmailHead('Email from Landlord Heaven')}
<body style="margin: 0; padding: 0; background-color: ${COLORS.outerBg}; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.outerBg};">
  <tr>
  <td align="center">
  <![endif]-->

  <!-- Outer wrapper table - 100% width with light background -->
  <table role="presentation" class="email-outer-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.outerBg}; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Inner content table - fixed 600px width -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          ${content}
        </table>
      </td>
    </tr>
  </table>

  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>
`;

/**
 * Generate the logo header row
 */
const getLogoRow = (): string => `
  <tr>
    <td align="center" style="padding: 20px 0;">
      <img src="${LOGO_URL}" alt="Landlord Heaven" width="280" style="display: block; max-width: 280px; width: 100%; height: auto;" />
    </td>
  </tr>
`;

/**
 * Generate the header banner with title
 * Uses MSO VML for background color support in Outlook
 */
const getHeaderBanner = (title: string, backgroundColor: string = COLORS.primary): string => `
  <tr>
    <td>
      <!--[if mso]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:80px;">
        <v:fill type="solid" color="${backgroundColor}" />
        <v:textbox inset="0,0,0,0">
      <![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td align="center" bgcolor="${backgroundColor}" style="background-color: ${backgroundColor}; padding: 30px 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; color: ${COLORS.white}; line-height: 1.3;">${title}</h1>
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </v:textbox>
      </v:rect>
      <![endif]-->
    </td>
  </tr>
`;

/**
 * Generate the main content card wrapper (dark background)
 */
const getContentCard = (content: string): string => `
  <tr>
    <td>
      <!--[if mso]>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="${COLORS.cardBg}">
      <![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td bgcolor="${COLORS.cardBg}" style="background-color: ${COLORS.cardBg}; padding: 30px 30px 40px 30px; border-radius: 0 0 8px 8px;">
            ${content}
          </td>
        </tr>
      </table>
      <!--[if mso]>
          </td>
        </tr>
      </table>
      <![endif]-->
    </td>
  </tr>
`;

/**
 * Generate a bulletproof button using table-based approach
 * This ensures the button renders correctly in Outlook and all email clients
 */
const getBulletproofButton = (text: string, href: string, backgroundColor: string = COLORS.primary): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
    <tr>
      <td align="center" bgcolor="${backgroundColor}" style="background-color: ${backgroundColor}; border-radius: 6px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="13%" strokecolor="${backgroundColor}" fillcolor="${backgroundColor}">
          <w:anchorlock/>
          <center style="color:${COLORS.white};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${text}</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white}; text-decoration: none; border-radius: 6px; background-color: ${backgroundColor}; text-align: center; mso-hide: all;">
          ${text}
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>
`;

/**
 * Generate a feature card/box with accent border
 */
const getFeatureCard = (title: string, description: string, borderColor: string = COLORS.primary): string => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 15px 0;">
    <tr>
      <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${borderColor};">
        <p style="margin: 0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white};">${title}</p>
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; line-height: 1.5;">${description}</p>
      </td>
    </tr>
  </table>
`;

/**
 * Generate an info/highlight box
 */
const getInfoBox = (content: string, borderColor: string = COLORS.primary): string => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td bgcolor="${COLORS.accentBg}" style="background-color: ${COLORS.accentBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${borderColor};">
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.offWhite}; line-height: 1.6;">${content}</p>
      </td>
    </tr>
  </table>
`;

/**
 * Generate a warning box
 */
const getWarningBox = (content: string): string => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td bgcolor="${COLORS.warningBg}" style="background-color: ${COLORS.warningBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${COLORS.amber};">
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #FEF3C7; line-height: 1.6;">${content}</p>
      </td>
    </tr>
  </table>
`;

/**
 * Generate a danger/urgent box
 */
const getDangerBox = (content: string): string => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
    <tr>
      <td bgcolor="${COLORS.dangerBg}" style="background-color: ${COLORS.dangerBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${COLORS.red};">
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #FEE2E2; line-height: 1.6;">${content}</p>
      </td>
    </tr>
  </table>
`;

/**
 * Generate the email footer
 */
const getEmailFooter = (showUnsubscribe: boolean = true): string => `
  <tr>
    <td align="center" style="padding: 30px 20px;">
      <p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">This is an automated email from Landlord Heaven.</p>
      <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">
        ${showUnsubscribe ? `<a href="${APP_URL}/settings/notifications" style="color: ${COLORS.mutedGray}; text-decoration: underline;">Manage Notifications</a> &nbsp;|&nbsp; ` : ''}
        <a href="${APP_URL}/privacy" style="color: ${COLORS.mutedGray}; text-decoration: underline;">Privacy Policy</a>
      </p>
    </td>
  </tr>
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send email:', error);
    return { success: false, error: errorMessage };
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

  const orderSummaryContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border: 1px solid ${COLORS.border};">
          <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary};">Order Summary</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Order Number:</td>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; text-align: right;">#${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Product:</td>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; text-align: right;">${productName}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 10px; border-top: 1px solid ${COLORS.border};"></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white};">Total Paid:</td>
              <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary}; text-align: right;">£${(amount / 100).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi ${customerName},</p>
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Your purchase has been completed successfully. Your documents are ready to download!</p>

    ${orderSummaryContent}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          ${getBulletproofButton('Download Your Documents', downloadUrl)}
        </td>
      </tr>
    </table>

    ${getInfoBox(`<strong style="color: ${COLORS.white};">What's Next:</strong><br>1. Download your documents from your dashboard<br>2. Review and print (if needed)<br>3. Follow the step-by-step filing guide included<br>4. Contact us if you need any assistance`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
      <tr>
        <td>
          <p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Need Help?</p>
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; line-height: 1.5;">Our support team is here to help. Reply to this email or visit our help center.</p>
        </td>
      </tr>
    </table>

    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Thanks for choosing Landlord Heaven!<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  const emailContent = `
    ${getLogoRow()}
    ${getHeaderBanner('Thank You for Your Purchase!')}
    ${getContentCard(cardContent)}
    ${getEmailFooter(false)}
  `;

  const html = getEmailWrapper(emailContent);

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

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi ${name},</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.</p>

    <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary};">What You Can Do:</p>

    ${getFeatureCard('Generate Legal Documents', 'Create Section 8/21 notices, tenancy agreements, money claims, and more.')}
    ${getFeatureCard('HMO Pro (Optional)', 'Manage multiple properties with compliance tracking, automated reminders, and more.')}
    ${getFeatureCard('AI-Powered Guidance', 'Our wizard asks simple questions and generates court-ready documents tailored to your situation.')}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          ${getBulletproofButton('Start Your First Case', `${APP_URL}/wizard`)}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
      <tr>
        <td>
          <p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Need Help?</p>
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; line-height: 1.5;">Check out our <a href="${APP_URL}/help" style="color: ${COLORS.primaryLight}; text-decoration: none;">Help Center</a> or reply to this email.</p>
        </td>
      </tr>
    </table>

    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Best regards,<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  const emailContent = `
    ${getLogoRow()}
    ${getHeaderBanner('Welcome to Landlord Heaven!')}
    ${getContentCard(cardContent)}
    ${getEmailFooter(true)}
  `;

  const html = getEmailWrapper(emailContent);

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

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi there,</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          ${getBulletproofButton('Reset Password', resetUrl)}
        </td>
      </tr>
    </table>

    ${getWarningBox(`<strong style="color: #FEF3C7;">Security Notice:</strong><br>This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.`)}

    <p style="margin: 25px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray}; word-break: break-all; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: ${COLORS.primaryLight}; text-decoration: none;">${resetUrl}</a></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
      <tr>
        <td>
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Best regards,<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
        </td>
      </tr>
    </table>
  `;

  const emailContent = `
    ${getLogoRow()}
    ${getHeaderBanner('Reset Your Password')}
    ${getContentCard(cardContent)}
    ${getEmailFooter(false)}
  `;

  const html = getEmailWrapper(emailContent);

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

  const featuresList = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Automated compliance reminders</strong> (90/30/7 days advance)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Multi-property management</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Council-specific HMO license applications</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Tenant document portal</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Priority support</strong></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi ${name},</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Your HMO Pro 7-day trial expires in <strong style="color: ${COLORS.white};">${daysLeft} days</strong>. Don't lose access to:</p>

    ${featuresList}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          ${getBulletproofButton('Continue with HMO Pro', upgradeUrl)}
        </td>
      </tr>
    </table>

    ${getInfoBox(`<strong style="color: ${COLORS.white};">Pricing:</strong><br>From £19.99/month for 1-5 properties<br>Cancel anytime, no long-term commitment`)}

    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Questions? Reply to this email anytime.<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  const emailContent = `
    ${getLogoRow()}
    ${getHeaderBanner(`Your Trial Ends in ${daysLeft} Days`, COLORS.amber)}
    ${getContentCard(cardContent)}
    ${getEmailFooter(true)}
  `;

  const html = getEmailWrapper(emailContent);

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
  const urgencyColor = daysUntilExpiry <= 7 ? COLORS.red : daysUntilExpiry <= 30 ? COLORS.amber : COLORS.primary;

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

  const itemsListHtml = items
    .map((item) => {
      const formattedDate = item.expiryDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const label = complianceTypeLabels[item.type] || item.type;

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.border};">
            <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">${label}</p>
            <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${COLORS.lightGray};">${item.property}</p>
            <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">Expires: ${formattedDate}</p>
          </td>
        </tr>
      `;
    })
    .join('');

  const itemsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${urgencyColor};">
          <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${urgencyColor};">Items Requiring Action:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${itemsListHtml}
          </table>
        </td>
      </tr>
    </table>
  `;

  const urgentWarning = daysUntilExpiry <= 7 ? getDangerBox(`<strong style="color: #FEE2E2;">URGENT ACTION REQUIRED:</strong><br>These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.`) : '';

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi ${name},</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">This is a ${urgencyLevel.toLowerCase()} reminder that you have <strong style="color: ${COLORS.white};">${items.length} compliance ${items.length === 1 ? 'item' : 'items'}</strong> expiring in <strong style="color: ${COLORS.white};">${daysUntilExpiry} days</strong>.</p>

    ${itemsTable}
    ${urgentWarning}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          ${getBulletproofButton('View My Compliance Dashboard', `${APP_URL}/dashboard/hmo`, urgencyColor)}
        </td>
      </tr>
    </table>

    ${getInfoBox(`<strong style="color: ${COLORS.white};">What to do next:</strong><br>1. Review each expiring item<br>2. Contact service providers to schedule renewals<br>3. Upload new certificates to your dashboard when received<br>4. HMO Pro will track your renewals automatically`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
      <tr>
        <td>
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Stay compliant, stay safe!<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
        </td>
      </tr>
    </table>
  `;

  const emailContent = `
    ${getLogoRow()}
    ${getHeaderBanner(`${urgencyLevel}: ${daysUntilExpiry} Days Until Expiry`, urgencyColor)}
    ${getContentCard(cardContent)}
    ${getEmailFooter(true)}
  `;

  const html = getEmailWrapper(emailContent);

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

/**
 * Export the color constants for use in tests and preview pages
 */
export const EMAIL_COLORS = COLORS;

/**
 * Export template generators for testing and preview purposes
 */
export const emailTemplateHelpers = {
  getEmailWrapper,
  getLogoRow,
  getHeaderBanner,
  getContentCard,
  getBulletproofButton,
  getFeatureCard,
  getInfoBox,
  getWarningBox,
  getDangerBox,
  getEmailFooter,
};
