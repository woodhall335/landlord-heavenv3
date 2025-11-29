/**
 * Compliance Reminder Cron Job
 *
 * Triggered daily at 8am
 * Checks HMO compliance items and sends reminders at 90/30/7 days before expiry
 *
 * Usage: Call from Vercel Cron or external cron service
 * Authorization: Requires CRON_SECRET token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate reminder dates (90, 30, 7 days from now)
    const ninetyDaysFromNow = new Date(today);
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const nextDay90 = new Date(ninetyDaysFromNow);
    nextDay90.setDate(nextDay90.getDate() + 1);

    const nextDay30 = new Date(thirtyDaysFromNow);
    nextDay30.setDate(nextDay30.getDate() + 1);

    const nextDay7 = new Date(sevenDaysFromNow);
    nextDay7.setDate(nextDay7.getDate() + 1);

    console.log('[Compliance Cron] Starting compliance check...');

    // Fetch HMO Pro users
    const { data: hmoUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('hmo_pro_active', true);

    if (usersError) {
      console.error('[Compliance Cron] Error fetching HMO users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch HMO users' },
        { status: 500 }
      );
    }

    if (!hmoUsers || hmoUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active HMO Pro users',
        reminders_sent: 0,
      });
    }

    console.log(`[Compliance Cron] Checking compliance for ${hmoUsers.length} HMO Pro users`);

    let totalReminders = 0;
    let reminders90 = 0;
    let reminders30 = 0;
    let reminders7 = 0;

    // Process each user
    for (const user of hmoUsers) {
      // Fetch compliance items expiring soon
      const { data: complianceItems, error: complianceError } = await supabase
        .from('hmo_compliance_items')
        .select('*, hmo_properties(address)')
        .eq('property_id', user.id) // Note: should join via hmo_properties.user_id
        .in('status', ['active', 'expiring_soon'])
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true });

      if (complianceError) {
        console.error(`[Compliance Cron] Error fetching compliance for user ${user.id}:`, complianceError);
        continue;
      }

      if (!complianceItems || complianceItems.length === 0) {
        continue;
      }

      // Group items by reminder period
      const items90Days: any[] = [];
      const items30Days: any[] = [];
      const items7Days: any[] = [];

      for (const item of complianceItems) {
        const expiryDate = new Date((item as any).expiry_date);
        expiryDate.setHours(0, 0, 0, 0);

        // Check if expiry date matches 90/30/7 day thresholds
        if (expiryDate >= ninetyDaysFromNow && expiryDate < nextDay90) {
          items90Days.push(item);
        } else if (expiryDate >= thirtyDaysFromNow && expiryDate < nextDay30) {
          items30Days.push(item);
        } else if (expiryDate >= sevenDaysFromNow && expiryDate < nextDay7) {
          items7Days.push(item);
        }
      }

      // Send 90-day reminders
      if (items90Days.length > 0) {
        await sendComplianceReminder(user, items90Days, 90);
        reminders90 += items90Days.length;
        totalReminders += items90Days.length;

        // Update status to expiring_soon
        for (const item of items90Days) {
          await supabase
            .from('hmo_compliance_items')
            .update({ status: 'expiring_soon' })
            .eq('id', item.id);
        }
      }

      // Send 30-day reminders
      if (items30Days.length > 0) {
        await sendComplianceReminder(user, items30Days, 30);
        reminders30 += items30Days.length;
        totalReminders += items30Days.length;

        // Update status to expiring_soon
        for (const item of items30Days) {
          await supabase
            .from('hmo_compliance_items')
            .update({ status: 'expiring_soon' })
            .eq('id', item.id);
        }
      }

      // Send 7-day URGENT reminders
      if (items7Days.length > 0) {
        await sendComplianceReminder(user, items7Days, 7);
        reminders7 += items7Days.length;
        totalReminders += items7Days.length;

        // Update status to expiring_soon
        for (const item of items7Days) {
          await supabase
            .from('hmo_compliance_items')
            .update({ status: 'expiring_soon' })
            .eq('id', item.id);
        }
      }
    }

    // Log the execution
    await supabase.from('seo_automation_log').insert({
      task_type: 'compliance_check',
      task_name: 'Daily Compliance Reminder Check',
      status: 'success',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      items_processed: hmoUsers.length,
      items_successful: totalReminders,
      summary: `Sent ${totalReminders} reminders: ${reminders90} at 90 days, ${reminders30} at 30 days, ${reminders7} at 7 days`,
      triggered_by: 'cron',
    });

    console.log(`[Compliance Cron] Complete: ${totalReminders} reminders sent`);

    return NextResponse.json({
      success: true,
      users_checked: hmoUsers.length,
      reminders_sent: totalReminders,
      breakdown: {
        '90_days': reminders90,
        '30_days': reminders30,
        '7_days': reminders7,
      },
    });
  } catch (error: any) {
    console.error('[Compliance Cron] Fatal error:', error);

    return NextResponse.json(
      { error: 'Compliance check failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Send compliance reminder email
 */
async function sendComplianceReminder(
  user: { id: string; email: string; full_name: string | null },
  items: any[],
  daysUntilExpiry: number
): Promise<void> {
  const urgencyLevel = daysUntilExpiry <= 7 ? 'URGENT' : daysUntilExpiry <= 30 ? 'Important' : 'Reminder';
  const urgencyColor = daysUntilExpiry <= 7 ? '#DC2626' : daysUntilExpiry <= 30 ? '#F59E0B' : '#4F46E5';

  // Build compliance items list
  const itemsList = items
    .map((item) => {
      const expiryDate = new Date(item.expiry_date);
      const formattedDate = expiryDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

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

      const label = complianceTypeLabels[item.compliance_type] || item.compliance_type;
      const property = item.hmo_properties?.address || 'Property';

      return `<li style="margin-bottom: 10px;">
        <strong>${label}</strong> - ${property}<br>
        <span style="color: #6b7280; font-size: 14px;">Expires: ${formattedDate}</span>
      </li>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Compliance Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: ${urgencyColor}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${urgencyLevel}: ${daysUntilExpiry} Days Until Expiry</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.full_name || 'there'},</p>

        <p style="font-size: 16px; margin-bottom: 20px;">
          This is a ${urgencyLevel.toLowerCase()} reminder that you have <strong>${items.length} compliance ${items.length === 1 ? 'item' : 'items'}</strong> expiring in <strong>${daysUntilExpiry} days</strong>.
        </p>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
          <h2 style="color: ${urgencyColor}; margin-top: 0; font-size: 20px;">Items Requiring Action:</h2>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${itemsList}
          </ul>
        </div>

        ${
          daysUntilExpiry <= 7
            ? `
        <div style="background-color: #FEE2E2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p style="margin: 0; font-size: 14px; color: #991B1B;">
            <strong>⚠️ URGENT ACTION REQUIRED:</strong><br>
            These items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.
          </p>
        </div>
        `
            : ''
        }

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard/hmo" style="background-color: ${urgencyColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            View My Compliance Dashboard
          </a>
        </div>

        <div style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>💡 What to do next:</strong><br>
            1. Review each expiring item<br>
            2. Contact service providers to schedule renewals<br>
            3. Upload new certificates to your dashboard when received<br>
            4. HMO Pro will track your renewals automatically
          </p>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Stay compliant, stay safe!<br>
          <strong>The Landlord Heaven Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated reminder from HMO Pro. You're receiving this because you have active compliance tracking.</p>
        <p>&copy; ${new Date().getFullYear()} Landlord Heaven. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${user.full_name || 'there'},

${urgencyLevel}: ${daysUntilExpiry} Days Until Expiry

This is a ${urgencyLevel.toLowerCase()} reminder that you have ${items.length} compliance ${items.length === 1 ? 'item' : 'items'} expiring in ${daysUntilExpiry} days.

Items Requiring Action:
${items
  .map((item) => {
    const expiryDate = new Date(item.expiry_date);
    const formattedDate = expiryDate.toLocaleDateString('en-GB');
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
    const label = complianceTypeLabels[item.compliance_type] || item.compliance_type;
    const property = item.hmo_properties?.address || 'Property';
    return `- ${label} - ${property} (Expires: ${formattedDate})`;
  })
  .join('\n')}

${
  daysUntilExpiry <= 7
    ? '\n⚠️ URGENT ACTION REQUIRED:\nThese items expire in less than 7 days. Failure to renew on time may result in fines or legal issues.\n'
    : ''
}

What to do next:
1. Review each expiring item
2. Contact service providers to schedule renewals
3. Upload new certificates to your dashboard when received
4. HMO Pro will track your renewals automatically

View your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk'}/dashboard/hmo

Stay compliant, stay safe!
The Landlord Heaven Team
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: `${urgencyLevel}: ${items.length} Compliance ${items.length === 1 ? 'Item' : 'Items'} Expiring in ${daysUntilExpiry} Days`,
      html,
      text,
    });

    console.log(`[Compliance Email] Sent ${daysUntilExpiry}-day reminder to ${user.email} for ${items.length} items`);
  } catch (error: any) {
    console.error(`[Compliance Email] Failed to send reminder to ${user.email}:`, error);
  }
}
