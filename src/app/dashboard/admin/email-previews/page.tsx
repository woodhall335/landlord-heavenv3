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
    const logoUrl = "https://landlordheaven.co.uk/headerlogo2.png";
    const appUrl = "https://landlordheaven.co.uk";

    const commonStyles = `
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
        }
      </style>
    `;

    const templates: Record<string, string> = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Landlord Heaven!</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Welcome to Landlord Heaven! We're thrilled to have you join thousands of UK landlords who trust us for their legal document needs.</p>
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
                  <a href="${appUrl}/wizard" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Start Your First Case</a>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">Best regards,<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      purchase: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John Smith,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Your purchase has been completed successfully. Your documents are ready to download!</p>
                <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                  <h2 style="color: #4F46E5; margin-top: 0; font-size: 20px;">Order Summary</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td class="email-text" style="padding: 8px 0; font-weight: bold;">Order Number:</td><td class="email-text" style="padding: 8px 0; text-align: right;">#ABC12345</td></tr>
                    <tr><td class="email-text" style="padding: 8px 0; font-weight: bold;">Product:</td><td class="email-text" style="padding: 8px 0; text-align: right;">Section 21 Notice Pack</td></tr>
                    <tr style="border-top: 2px solid #e5e7eb;"><td class="email-text" style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Paid:</td><td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #4F46E5;">£29.99</td></tr>
                  </table>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}/dashboard" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Download Your Documents</a>
                </div>
                <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                  <p class="email-text" style="margin: 0; font-size: 14px;"><strong>What's Next:</strong><br>1. Download your documents from your dashboard<br>2. Review and print (if needed)<br>3. Follow the step-by-step filing guide included<br>4. Contact us if you need any assistance</p>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">Thanks for choosing Landlord Heaven!<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      "password-reset": `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="#" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Reset Password</a>
                </div>
                <div class="email-warning" style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                  <p class="email-warning-text" style="margin: 0; font-size: 14px; color: #92400E;"><strong>Security Notice:</strong><br>This link expires in 1 hour. If you didn't request this, please ignore this email or contact support.</p>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">Best regards,<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      "trial-reminder": `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #F59E0B; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Your Trial Ends in 2 Days</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Your HMO Pro 7-day trial expires in <strong>2 days</strong>. Don't lose access to:</p>
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
                  <a href="${appUrl}/pricing" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Continue with HMO Pro</a>
                </div>
                <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                  <p class="email-text" style="margin: 0; font-size: 14px;"><strong>Pricing:</strong><br>From £19.99/month for 1-5 properties<br>Cancel anytime, no long-term commitment</p>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px;">Questions? Reply to this email anytime.<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      "compliance-urgent": `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #DC2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">URGENT: 7 Days Until Expiry</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">This is an <strong>urgent</strong> reminder that you have <strong>2 compliance items</strong> expiring in <strong>7 days</strong>.</p>
                <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
                  <h2 style="color: #DC2626; margin-top: 0; font-size: 20px;">Items Requiring Action:</h2>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li class="email-text" style="margin-bottom: 10px;"><strong>Gas Safety Certificate</strong> - 123 High Street, London<br><span class="email-muted" style="color: #6b7280; font-size: 14px;">Expires: 9 January 2026</span></li>
                    <li class="email-text" style="margin-bottom: 10px;"><strong>EICR (Electrical Safety)</strong> - 45 Oak Avenue, Manchester<br><span class="email-muted" style="color: #6b7280; font-size: 14px;">Expires: 9 January 2026</span></li>
                  </ul>
                </div>
                <div class="email-danger-box" style="background-color: #FEE2E2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #DC2626;">
                  <p class="email-danger-text" style="margin: 0; font-size: 14px; color: #991B1B;"><strong>URGENT ACTION REQUIRED:</strong><br>These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}/dashboard/hmo" style="background-color: #DC2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">View My Compliance Dashboard</a>
                </div>
                <div class="email-info-box" style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p class="email-text" style="margin: 0; font-size: 14px;"><strong>What to do next:</strong><br>1. Review each expiring item<br>2. Contact service providers to schedule renewals<br>3. Upload new certificates to your dashboard when received<br>4. HMO Pro will track your renewals automatically</p>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">Stay compliant, stay safe!<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>This is an automated reminder from HMO Pro.</p>
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      "compliance-important": `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #F59E0B; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Important: 30 Days Until Expiry</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">This is an important reminder that you have <strong>1 compliance item</strong> expiring in <strong>30 days</strong>.</p>
                <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                  <h2 style="color: #F59E0B; margin-top: 0; font-size: 20px;">Items Requiring Action:</h2>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li class="email-text" style="margin-bottom: 10px;"><strong>HMO License</strong> - 123 High Street, London<br><span class="email-muted" style="color: #6b7280; font-size: 14px;">Expires: 1 February 2026</span></li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}/dashboard/hmo" style="background-color: #F59E0B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">View My Compliance Dashboard</a>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">Stay compliant, stay safe!<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      "compliance-reminder": `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          ${commonStyles}
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div class="email-body" style="background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px 0;">
                <img src="${logoUrl}" alt="Landlord Heaven" style="max-width: 280px; height: auto;" />
              </div>
              <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reminder: 90 Days Until Expiry</h1>
              </div>
              <div class="email-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">Hi John,</p>
                <p class="email-text" style="font-size: 16px; margin-bottom: 20px;">This is a friendly reminder that you have <strong>1 compliance item</strong> expiring in <strong>90 days</strong>.</p>
                <div class="email-card" style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                  <h2 style="color: #4F46E5; margin-top: 0; font-size: 20px;">Items Requiring Action:</h2>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li class="email-text" style="margin-bottom: 10px;"><strong>Fire Risk Assessment</strong> - 123 High Street, London<br><span class="email-muted" style="color: #6b7280; font-size: 14px;">Expires: 2 April 2026</span></li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}/dashboard/hmo" style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">View My Compliance Dashboard</a>
                </div>
                <p class="email-muted" style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">Stay compliant, stay safe!<br><strong>The Landlord Heaven Team</strong></p>
              </div>
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Landlord Heaven. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
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
          <p className="text-gray-600">Preview all transactional email templates</p>
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
                      Logo Included
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      Dark Mode Ready
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
                    height: "800px",
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
