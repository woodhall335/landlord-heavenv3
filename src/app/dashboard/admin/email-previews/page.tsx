"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent when a new user signs up",
    subject: "Welcome to Landlord Heaven!",
  },
  {
    id: "purchase",
    name: "Purchase Confirmation",
    description: "Sent after successful payment",
    subject: "Purchase Confirmation - {Product} (#{Order})",
  },
  {
    id: "password-reset",
    name: "Password Reset",
    description: "Sent when user requests password reset",
    subject: "Reset Your Password - Landlord Heaven",
  },
  {
    id: "trial-reminder",
    name: "Trial Reminder",
    description: "Sent 2 days before HMO Pro trial expires",
    subject: "Your HMO Pro Trial Ends in {X} Days",
  },
  {
    id: "compliance-urgent",
    name: "Compliance Reminder (Urgent)",
    description: "Sent 7 days before compliance items expire",
    subject: "URGENT: {X} Compliance Items Expiring in 7 Days",
  },
  {
    id: "compliance-important",
    name: "Compliance Reminder (30 days)",
    description: "Sent 30 days before compliance items expire",
    subject: "Important: {X} Compliance Items Expiring in 30 Days",
  },
  {
    id: "compliance-reminder",
    name: "Compliance Reminder (90 days)",
    description: "Sent 90 days before compliance items expire",
    subject: "Reminder: {X} Compliance Items Expiring in 90 Days",
  },
];

/**
 * Outlook-safe email template colors
 * These match the production email templates in src/lib/email/resend.ts
 */
const COLORS = {
  outerBg: "#F3F4F6",
  cardBg: "#111827",
  cardBgAlt: "#1F2937",
  accentBg: "#312E81",
  warningBg: "#78350F",
  dangerBg: "#7F1D1D",
  white: "#FFFFFF",
  offWhite: "#F9FAFB",
  lightGray: "#D1D5DB",
  mutedGray: "#9CA3AF",
  darkText: "#111827",
  primary: "#6366F1",
  primaryLight: "#818CF8",
  amber: "#F59E0B",
  red: "#EF4444",
  green: "#10B981",
  border: "#374151",
  borderLight: "#4B5563",
} as const;

const logoUrl = "https://landlordheaven.co.uk/headerlogo2.png";
const appUrl = "https://landlordheaven.co.uk";

/**
 * Generate Outlook-safe email HTML for previews
 * This mirrors the structure in src/lib/email/resend.ts
 */
function generateOutlookSafeEmail(
  headerTitle: string,
  headerColor: string,
  bodyContent: string,
  showUnsubscribe: boolean = true
): string {
  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Email Preview</title>
  <style type="text/css">
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.outerBg}; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.outerBg}; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <img src="${logoUrl}" alt="Landlord Heaven" width="280" style="display: block; max-width: 280px; width: 100%; height: auto;" />
            </td>
          </tr>
          <!-- Header Banner -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td align="center" bgcolor="${headerColor}" style="background-color: ${headerColor}; padding: 30px 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; color: ${COLORS.white}; line-height: 1.3;">${headerTitle}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td bgcolor="${COLORS.cardBg}" style="background-color: ${COLORS.cardBg}; padding: 30px 30px 40px 30px; border-radius: 0 0 8px 8px;">
                    ${bodyContent}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">This is an automated email from Landlord Heaven.</p>
              <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">&copy; 2026 Landlord Heaven. All rights reserved.</p>
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">
                ${showUnsubscribe ? `<a href="${appUrl}/settings/notifications" style="color: ${COLORS.mutedGray}; text-decoration: underline;">Manage Notifications</a> &nbsp;|&nbsp; ` : ""}
                <a href="${appUrl}/privacy" style="color: ${COLORS.mutedGray}; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate a bulletproof button (table-based)
 */
function getButton(text: string, href: string, bgColor: string = COLORS.primary): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td align="center" bgcolor="${bgColor}" style="background-color: ${bgColor}; border-radius: 6px;">
          <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white}; text-decoration: none; border-radius: 6px; background-color: ${bgColor}; text-align: center;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a feature card
 */
function getFeatureCard(title: string, description: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 15px 0;">
      <tr>
        <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${COLORS.primary};">
          <p style="margin: 0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white};">${title}</p>
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; line-height: 1.5;">${description}</p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate an info box
 */
function getInfoBox(content: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.accentBg}" style="background-color: ${COLORS.accentBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${COLORS.primary};">
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.offWhite}; line-height: 1.6;">${content}</p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a warning box
 */
function getWarningBox(content: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.warningBg}" style="background-color: ${COLORS.warningBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${COLORS.amber};">
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #FEF3C7; line-height: 1.6;">${content}</p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate a danger box
 */
function getDangerBox(content: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td bgcolor="${COLORS.dangerBg}" style="background-color: ${COLORS.dangerBg}; padding: 15px; border-radius: 6px; border-left: 4px solid ${COLORS.red};">
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #FEE2E2; line-height: 1.6;">${content}</p>
        </td>
      </tr>
    </table>
  `;
}

export default function AdminEmailPreviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("welcome");
  const [darkMode, setDarkMode] = useState(false);

  const checkAdminAccess = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];
      if (!adminIds.includes(user.id)) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const getPreviewHtml = (templateId: string): string => {
    const templates: Record<string, string> = {
      welcome: generateOutlookSafeEmail(
        "Welcome to Landlord Heaven!",
        COLORS.primary,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.</p>
          <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary};">What You Can Do:</p>
          ${getFeatureCard("Generate Legal Documents", "Create Section 8/21 notices, tenancy agreements, money claims, and more.")}
          ${getFeatureCard("HMO Pro (Optional)", "Manage multiple properties with compliance tracking, automated reminders, and more.")}
          ${getFeatureCard("AI-Powered Guidance", "Our wizard asks simple questions and generates court-ready documents tailored to your situation.")}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("Start Your First Case", `${appUrl}/wizard`)}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
            <tr>
              <td>
                <p style="margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Need Help?</p>
                <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; line-height: 1.5;">Check out our <a href="${appUrl}/help" style="color: ${COLORS.primaryLight}; text-decoration: none;">Help Center</a> or reply to this email.</p>
              </td>
            </tr>
          </table>
          <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Best regards,<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
        `,
        true
      ),

      purchase: generateOutlookSafeEmail(
        "Thank You for Your Purchase!",
        COLORS.primary,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John Smith,</p>
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Your purchase has been completed successfully. Your documents are ready to download!</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border: 1px solid ${COLORS.border};">
                <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary};">Order Summary</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Order Number:</td>
                    <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; text-align: right;">#ABC12345</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Product:</td>
                    <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.lightGray}; text-align: right;">Section 21 Notice Pack</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px; border-top: 1px solid ${COLORS.border};"></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: ${COLORS.white};">Total Paid:</td>
                    <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary}; text-align: right;">£49.99</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("Download Your Documents", `${appUrl}/dashboard`)}
              </td>
            </tr>
          </table>
          ${getInfoBox(`<strong style="color: ${COLORS.white};">What's Next:</strong><br>1. Download your documents from your dashboard<br>2. Review and print (if needed)<br>3. Follow the step-by-step filing guide included<br>4. Contact us if you need any assistance`)}
          <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Thanks for choosing Landlord Heaven!<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
        `,
        false
      ),

      "password-reset": generateOutlookSafeEmail(
        "Reset Your Password",
        COLORS.primary,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi there,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("Reset Password", `${appUrl}/auth/reset-password?token=xxx`)}
              </td>
            </tr>
          </table>
          ${getWarningBox(`<strong style="color: #FEF3C7;">Security Notice:</strong><br>This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.`)}
          <p style="margin: 25px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray}; word-break: break-all; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${appUrl}/auth/reset-password?token=xxx" style="color: ${COLORS.primaryLight}; text-decoration: none;">${appUrl}/auth/reset-password?token=xxx</a></p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid ${COLORS.border}; padding-top: 20px;">
            <tr>
              <td>
                <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Best regards,<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
              </td>
            </tr>
          </table>
        `,
        false
      ),

      "trial-reminder": generateOutlookSafeEmail(
        "Your Trial Ends in 2 Days",
        COLORS.amber,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">Your HMO Pro 7-day trial expires in <strong style="color: ${COLORS.white};">2 days</strong>. Don't lose access to:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Automated compliance reminders</strong> (90/30/7 days advance)</td></tr>
                  <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Multi-property management</strong></td></tr>
                  <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Council-specific HMO license applications</strong></td></tr>
                  <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Tenant document portal</strong></td></tr>
                  <tr><td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.white};">• <strong>Priority support</strong></td></tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("Continue with HMO Pro", `${appUrl}/pricing`)}
              </td>
            </tr>
          </table>
          ${getInfoBox(`<strong style="color: ${COLORS.white};">Pricing:</strong><br>From £19.99/month for 1-5 properties<br>Cancel anytime, no long-term commitment`)}
          <p style="margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: ${COLORS.mutedGray};">Questions? Reply to this email anytime.<br><strong style="color: ${COLORS.lightGray};">The Landlord Heaven Team</strong></p>
        `,
        true
      ),

      "compliance-urgent": generateOutlookSafeEmail(
        "URGENT: 7 Days Until Expiry",
        COLORS.red,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">This is an <strong style="color: ${COLORS.white};">urgent</strong> reminder that you have <strong style="color: ${COLORS.white};">2 compliance items</strong> expiring in <strong style="color: ${COLORS.white};">7 days</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${COLORS.red};">
                <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.red};">Items Requiring Action:</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.border};">
                      <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Gas Safety Certificate</p>
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${COLORS.lightGray};">123 High Street, London</p>
                      <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">Expires: 9 February 2026</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.border};">
                      <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">EICR (Electrical Safety)</p>
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${COLORS.lightGray};">45 Oak Avenue, Manchester</p>
                      <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">Expires: 9 February 2026</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          ${getDangerBox(`<strong style="color: #FEE2E2;">URGENT ACTION REQUIRED:</strong><br>These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.`)}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("View My Compliance Dashboard", `${appUrl}/dashboard/hmo`, COLORS.red)}
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
        `,
        true
      ),

      "compliance-important": generateOutlookSafeEmail(
        "Important: 30 Days Until Expiry",
        COLORS.amber,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">This is an important reminder that you have <strong style="color: ${COLORS.white};">1 compliance item</strong> expiring in <strong style="color: ${COLORS.white};">30 days</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${COLORS.amber};">
                <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.amber};">Items Requiring Action:</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 12px 0;">
                      <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">HMO License</p>
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${COLORS.lightGray};">123 High Street, London</p>
                      <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">Expires: 4 March 2026</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("View My Compliance Dashboard", `${appUrl}/dashboard/hmo`, COLORS.amber)}
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
        `,
        true
      ),

      "compliance-reminder": generateOutlookSafeEmail(
        "Reminder: 90 Days Until Expiry",
        COLORS.primary,
        `
          <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.white}; line-height: 1.6;">Hi John,</p>
          <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: ${COLORS.lightGray}; line-height: 1.6;">This is a friendly reminder that you have <strong style="color: ${COLORS.white};">1 compliance item</strong> expiring in <strong style="color: ${COLORS.white};">90 days</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td bgcolor="${COLORS.cardBgAlt}" style="background-color: ${COLORS.cardBgAlt}; padding: 20px; border-radius: 6px; border-left: 4px solid ${COLORS.primary};">
                <p style="margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: ${COLORS.primary};">Items Requiring Action:</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 12px 0;">
                      <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: ${COLORS.white};">Fire Risk Assessment</p>
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${COLORS.lightGray};">123 High Street, London</p>
                      <p style="margin: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${COLORS.mutedGray};">Expires: 3 May 2026</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                ${getButton("View My Compliance Dashboard", `${appUrl}/dashboard/hmo`)}
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
        `,
        true
      ),
    };

    return templates[templateId] || templates.welcome;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Container>
      </div>
    );
  }

  const selectedTemplateData = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Email Previews</h1>
          <p className="text-gray-600">Preview all transactional email templates (Outlook-safe table-based layout)</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Template Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h2 className="font-semibold text-charcoal mb-4">Templates</h2>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? "bg-purple-100 border-2 border-primary"
                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <p className="font-medium text-sm text-charcoal">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>

              {/* Dark Mode Toggle */}
              <div className="mt-6 pt-4 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-charcoal">Dark Mode Preview</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Note: The new design uses a light outer background with dark card, which is safe for both light and dark mode in Outlook.
                </p>
              </div>

              {/* Template Info */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-charcoal text-sm mb-2">Outlook-Safe Features</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Table-based layout</li>
                  <li>• Inline styles only</li>
                  <li>• MSO conditional comments</li>
                  <li>• Bulletproof buttons</li>
                  <li>• Explicit colors everywhere</li>
                  <li>• Light outer / dark inner card</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal">{selectedTemplateData?.name}</h3>
                    <p className="text-sm text-gray-500">
                      Subject: <span className="font-mono">{selectedTemplateData?.subject}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Outlook Safe
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      Table Layout
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div
                className={`p-0 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
                style={{ minHeight: "600px" }}
              >
                <iframe
                  srcDoc={getPreviewHtml(selectedTemplate)}
                  className="w-full border-0"
                  style={{
                    height: "900px",
                    colorScheme: darkMode ? "dark" : "light",
                  }}
                  title={`Email Preview - ${selectedTemplateData?.name}`}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
