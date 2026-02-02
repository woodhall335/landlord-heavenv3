/**
 * Email Preview Script
 *
 * Generates HTML files for all email templates and optionally opens them in a browser.
 * This allows manual inspection of email rendering without sending actual emails.
 *
 * Usage:
 *   npx tsx scripts/preview-emails.ts           # Generate HTML files only
 *   npx tsx scripts/preview-emails.ts --open    # Generate and open in browser
 *
 * Output:
 *   Creates HTML files in /tmp/email-previews/ directory
 *
 * Manual Testing Workflow:
 *   1. Run this script to generate HTML files
 *   2. Open in your browser to check rendering
 *   3. Copy/paste HTML into Litmus or Email on Acid for cross-client testing
 *   4. Or use `npx tsx scripts/send-test-emails.ts` to send to a real inbox
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Import email generation functions
import {
  emailTemplateHelpers,
  EMAIL_COLORS,
} from '../src/lib/email/resend';

// Configuration
const OUTPUT_DIR = '/tmp/email-previews';
const APP_URL = 'https://landlordheaven.co.uk';
const LOGO_URL = `${APP_URL}/headerlogo2.png`;

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to generate bulletproof button
function getButton(text: string, href: string, bgColor: string = EMAIL_COLORS.primary): string {
  return emailTemplateHelpers.getBulletproofButton(text, href, bgColor);
}

// Generate Welcome Email
function generateWelcomeEmail(): string {
  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.white}; line-height: 1.6;">Hi John,</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.6;">Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.</p>
    <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${EMAIL_COLORS.primary};">What You Can Do:</p>
    ${emailTemplateHelpers.getFeatureCard('Generate Legal Documents', 'Create Section 8/21 notices, tenancy agreements, money claims, and more.')}
    ${emailTemplateHelpers.getFeatureCard('HMO Pro (Optional)', 'Manage multiple properties with compliance tracking, automated reminders, and more.')}
    ${emailTemplateHelpers.getFeatureCard('AI-Powered Guidance', 'Our wizard asks simple questions and generates court-ready documents tailored to your situation.')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;"><tr><td align="center">${getButton('Start Your First Case', `${APP_URL}/wizard`)}</td></tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${EMAIL_COLORS.border}; padding-top: 20px;"><tr><td><p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${EMAIL_COLORS.white};">Need Help?</p><p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.5;">Check out our <a href="${APP_URL}/help" style="color: ${EMAIL_COLORS.primaryLight}; text-decoration: none;">Help Center</a> or reply to this email.</p></td></tr></table>
    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.mutedGray};">Best regards,<br><strong style="color: ${EMAIL_COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  return emailTemplateHelpers.getEmailWrapper(`
    ${emailTemplateHelpers.getLogoRow()}
    ${emailTemplateHelpers.getHeaderBanner('Welcome to Landlord Heaven!')}
    ${emailTemplateHelpers.getContentCard(cardContent)}
    ${emailTemplateHelpers.getEmailFooter(true)}
  `);
}

// Generate Purchase Confirmation
function generatePurchaseEmail(): string {
  const orderSummary = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${EMAIL_COLORS.cardBgAlt}" style="background-color: ${EMAIL_COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border: 1px solid ${EMAIL_COLORS.border};">
          <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${EMAIL_COLORS.primary};">Order Summary</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${EMAIL_COLORS.white};">Order Number:</td><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.lightGray}; text-align: right;">#ABC12345</td></tr>
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${EMAIL_COLORS.white};">Product:</td><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.lightGray}; text-align: right;">Section 21 Notice Pack</td></tr>
            <tr><td colspan="2" style="padding-top: 10px; border-top: 1px solid ${EMAIL_COLORS.border};"></td></tr>
            <tr><td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${EMAIL_COLORS.white};">Total Paid:</td><td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${EMAIL_COLORS.primary}; text-align: right;">£49.99</td></tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.white}; line-height: 1.6;">Hi John Smith,</p>
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.6;">Your purchase has been completed successfully. Your documents are ready to download!</p>
    ${orderSummary}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;"><tr><td align="center">${getButton('Download Your Documents', `${APP_URL}/dashboard`)}</td></tr></table>
    ${emailTemplateHelpers.getInfoBox(`<strong style="color: ${EMAIL_COLORS.white};">What's Next:</strong><br>1. Download your documents from your dashboard<br>2. Review and print (if needed)<br>3. Follow the step-by-step filing guide included<br>4. Contact us if you need any assistance`)}
    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.mutedGray};">Thanks for choosing Landlord Heaven!<br><strong style="color: ${EMAIL_COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  return emailTemplateHelpers.getEmailWrapper(`
    ${emailTemplateHelpers.getLogoRow()}
    ${emailTemplateHelpers.getHeaderBanner('Thank You for Your Purchase!')}
    ${emailTemplateHelpers.getContentCard(cardContent)}
    ${emailTemplateHelpers.getEmailFooter(false)}
  `);
}

// Generate Password Reset
function generatePasswordResetEmail(): string {
  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.white}; line-height: 1.6;">Hi there,</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;"><tr><td align="center">${getButton('Reset Password', `${APP_URL}/auth/reset-password?token=xxx`)}</td></tr></table>
    ${emailTemplateHelpers.getWarningBox(`<strong style="color: #FEF3C7;">Security Notice:</strong><br>This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.`)}
    <p style="margin: 25px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${EMAIL_COLORS.mutedGray}; word-break: break-all; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${APP_URL}/auth/reset-password?token=xxx" style="color: ${EMAIL_COLORS.primaryLight}; text-decoration: none;">${APP_URL}/auth/reset-password?token=xxx</a></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${EMAIL_COLORS.border}; padding-top: 20px;"><tr><td><p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.mutedGray};">Best regards,<br><strong style="color: ${EMAIL_COLORS.lightGray};">The Landlord Heaven Team</strong></p></td></tr></table>
  `;

  return emailTemplateHelpers.getEmailWrapper(`
    ${emailTemplateHelpers.getLogoRow()}
    ${emailTemplateHelpers.getHeaderBanner('Reset Your Password')}
    ${emailTemplateHelpers.getContentCard(cardContent)}
    ${emailTemplateHelpers.getEmailFooter(false)}
  `);
}

// Generate Trial Reminder
function generateTrialReminderEmail(): string {
  const featuresList = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${EMAIL_COLORS.cardBgAlt}" style="background-color: ${EMAIL_COLORS.cardBgAlt}; padding: 20px; border-radius: 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.white};">• <strong>Automated compliance reminders</strong> (90/30/7 days advance)</td></tr>
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.white};">• <strong>Multi-property management</strong></td></tr>
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.white};">• <strong>Council-specific HMO license applications</strong></td></tr>
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.white};">• <strong>Tenant document portal</strong></td></tr>
            <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.white};">• <strong>Priority support</strong></td></tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.white}; line-height: 1.6;">Hi John,</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.6;">Your HMO Pro 7-day trial expires in <strong style="color: ${EMAIL_COLORS.white};">2 days</strong>. Don't lose access to:</p>
    ${featuresList}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;"><tr><td align="center">${getButton('Continue with HMO Pro', `${APP_URL}/pricing`)}</td></tr></table>
    ${emailTemplateHelpers.getInfoBox(`<strong style="color: ${EMAIL_COLORS.white};">Pricing:</strong><br>From £19.99/month for 1-5 properties<br>Cancel anytime, no long-term commitment`)}
    <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.mutedGray};">Questions? Reply to this email anytime.<br><strong style="color: ${EMAIL_COLORS.lightGray};">The Landlord Heaven Team</strong></p>
  `;

  return emailTemplateHelpers.getEmailWrapper(`
    ${emailTemplateHelpers.getLogoRow()}
    ${emailTemplateHelpers.getHeaderBanner('Your Trial Ends in 2 Days', EMAIL_COLORS.amber)}
    ${emailTemplateHelpers.getContentCard(cardContent)}
    ${emailTemplateHelpers.getEmailFooter(true)}
  `);
}

// Generate Compliance Urgent Email
function generateComplianceUrgentEmail(): string {
  const itemsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${EMAIL_COLORS.cardBgAlt}" style="background-color: ${EMAIL_COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${EMAIL_COLORS.red};">
          <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${EMAIL_COLORS.red};">Items Requiring Action:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${EMAIL_COLORS.border};">
                <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${EMAIL_COLORS.white};">Gas Safety Certificate</p>
                <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${EMAIL_COLORS.lightGray};">123 High Street, London</p>
                <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${EMAIL_COLORS.mutedGray};">Expires: 9 February 2026</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${EMAIL_COLORS.white};">EICR (Electrical Safety)</p>
                <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${EMAIL_COLORS.lightGray};">45 Oak Avenue, Manchester</p>
                <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${EMAIL_COLORS.mutedGray};">Expires: 9 February 2026</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const cardContent = `
    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.white}; line-height: 1.6;">Hi John,</p>
    <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${EMAIL_COLORS.lightGray}; line-height: 1.6;">This is an <strong style="color: ${EMAIL_COLORS.white};">urgent</strong> reminder that you have <strong style="color: ${EMAIL_COLORS.white};">2 compliance items</strong> expiring in <strong style="color: ${EMAIL_COLORS.white};">7 days</strong>.</p>
    ${itemsTable}
    ${emailTemplateHelpers.getDangerBox(`<strong style="color: #FEE2E2;">URGENT ACTION REQUIRED:</strong><br>These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;"><tr><td align="center">${getButton('View My Compliance Dashboard', `${APP_URL}/dashboard/hmo`, EMAIL_COLORS.red)}</td></tr></table>
    ${emailTemplateHelpers.getInfoBox(`<strong style="color: ${EMAIL_COLORS.white};">What to do next:</strong><br>1. Review each expiring item<br>2. Contact service providers to schedule renewals<br>3. Upload new certificates to your dashboard when received<br>4. HMO Pro will track your renewals automatically`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${EMAIL_COLORS.border}; padding-top: 20px;"><tr><td><p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${EMAIL_COLORS.mutedGray};">Stay compliant, stay safe!<br><strong style="color: ${EMAIL_COLORS.lightGray};">The Landlord Heaven Team</strong></p></td></tr></table>
  `;

  return emailTemplateHelpers.getEmailWrapper(`
    ${emailTemplateHelpers.getLogoRow()}
    ${emailTemplateHelpers.getHeaderBanner('URGENT: 7 Days Until Expiry', EMAIL_COLORS.red)}
    ${emailTemplateHelpers.getContentCard(cardContent)}
    ${emailTemplateHelpers.getEmailFooter(true)}
  `);
}

// Define all email templates
const templates = [
  { name: 'welcome', generate: generateWelcomeEmail, description: 'Welcome Email' },
  { name: 'purchase', generate: generatePurchaseEmail, description: 'Purchase Confirmation' },
  { name: 'password-reset', generate: generatePasswordResetEmail, description: 'Password Reset' },
  { name: 'trial-reminder', generate: generateTrialReminderEmail, description: 'Trial Reminder' },
  { name: 'compliance-urgent', generate: generateComplianceUrgentEmail, description: 'Compliance Urgent' },
];

// Generate index page
function generateIndexPage(): string {
  const links = templates
    .map(t => `<li><a href="${t.name}.html">${t.description}</a></li>`)
    .join('\n      ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Previews - Landlord Heaven</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #1f2937; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }
    a { display: block; padding: 15px 20px; background: white; border-radius: 8px; color: #4f46e5; text-decoration: none; border: 1px solid #e5e7eb; }
    a:hover { background: #f3f4f6; }
    .info { background: #EEF2FF; border: 1px solid #4f46e5; border-radius: 8px; padding: 15px; margin-top: 30px; font-size: 14px; color: #1e1b4b; }
  </style>
</head>
<body>
  <h1>Email Previews</h1>
  <p>Outlook-safe table-based email templates for Landlord Heaven.</p>
  <ul>
    ${links}
  </ul>
  <div class="info">
    <strong>Testing Tips:</strong>
    <ul style="margin: 10px 0; padding-left: 20px; list-style: disc;">
      <li>Open each template in your browser</li>
      <li>Use browser dev tools to simulate different viewport sizes</li>
      <li>Copy HTML source to <a href="https://litmus.com">Litmus</a> or <a href="https://www.emailonacid.com">Email on Acid</a> for cross-client testing</li>
      <li>Run <code>npx tsx scripts/send-test-emails.ts</code> to send to a real inbox</li>
    </ul>
  </div>
</body>
</html>`;
}

// Main execution
async function main() {
  console.log('📧 Generating email preview files...\n');

  // Generate each template
  for (const template of templates) {
    const html = template.generate();
    const filePath = join(OUTPUT_DIR, `${template.name}.html`);
    writeFileSync(filePath, html);
    console.log(`  ✅ ${template.description}: ${filePath}`);
  }

  // Generate index page
  const indexPath = join(OUTPUT_DIR, 'index.html');
  writeFileSync(indexPath, generateIndexPage());
  console.log(`  ✅ Index page: ${indexPath}`);

  console.log(`\n📁 All files generated in: ${OUTPUT_DIR}`);

  // Check if --open flag was passed
  const shouldOpen = process.argv.includes('--open');
  if (shouldOpen) {
    console.log('\n🌐 Opening in browser...');
    try {
      // Try different commands for different platforms
      const platform = process.platform;
      if (platform === 'darwin') {
        execSync(`open ${indexPath}`);
      } else if (platform === 'linux') {
        execSync(`xdg-open ${indexPath} || sensible-browser ${indexPath}`);
      } else if (platform === 'win32') {
        execSync(`start ${indexPath}`);
      }
    } catch (error) {
      console.log(`   Could not open browser automatically. Please open: ${indexPath}`);
    }
  } else {
    console.log('\n💡 Tip: Run with --open to automatically open in browser');
    console.log(`   npx tsx scripts/preview-emails.ts --open`);
  }

  console.log('\n📋 Manual Testing Checklist:');
  console.log('   1. Check rendering in modern browsers (Chrome, Firefox, Safari)');
  console.log('   2. Copy HTML to Litmus/Email on Acid for cross-client testing');
  console.log('   3. Send test emails: npx tsx scripts/send-test-emails.ts');
  console.log('   4. Test in real Outlook (desktop and Outlook.com)');
  console.log('   5. Test in Gmail web and mobile');
}

main().catch(console.error);
