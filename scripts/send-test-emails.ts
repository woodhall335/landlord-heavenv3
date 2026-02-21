/**
 * Test Email Script
 *
 * Sends all email types to a specified email address for testing
 *
 * Usage: npx tsx scripts/send-test-emails.ts
 */

import { config as loadEnv } from 'dotenv';

// Load environment variables from .env.local BEFORE importing resend
loadEnv({ path: '.env.local' });

async function sendTestEmails() {
  // Dynamic import after env is loaded
  const {
    sendPurchaseConfirmation,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendTrialReminderEmail,
    sendComplianceReminderEmail,
  } = await import('../src/lib/email/resend');

  const TEST_EMAIL = process.env.TEST_EMAIL || 't_mohammed@msn.com';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk';
  console.log('🚀 Sending test emails to:', TEST_EMAIL);
  console.log('='.repeat(50));

  // 1. Welcome Email
  console.log('\n📧 1/5: Sending Welcome Email...');
  const welcomeResult = await sendWelcomeEmail({
    to: TEST_EMAIL,
    name: 'John',
  });
  console.log(welcomeResult.success ? '✅ Welcome email sent!' : `❌ Failed: ${welcomeResult.error}`);

  // 2. Purchase Confirmation
  console.log('\n📧 2/5: Sending Purchase Confirmation...');
  const purchaseResult = await sendPurchaseConfirmation({
    to: TEST_EMAIL,
    customerName: 'John Smith',
    productName: 'Section 21 Notice Pack',
    amount: 2999, // £29.99 in pence
    orderNumber: 'ABC12345',
    downloadUrl: `${APP_URL}/dashboard/cases/test-case-id`,
  });
  console.log(purchaseResult.success ? '✅ Purchase confirmation sent!' : `❌ Failed: ${purchaseResult.error}`);

  // 3. Password Reset
  console.log('\n📧 3/5: Sending Password Reset...');
  const resetResult = await sendPasswordResetEmail({
    to: TEST_EMAIL,
    resetUrl: `${APP_URL}/auth/reset-password?token=test-token-123`,
  });
  console.log(resetResult.success ? '✅ Password reset email sent!' : `❌ Failed: ${resetResult.error}`);

  // 4. Trial Reminder
  console.log('\n📧 4/5: Sending Trial Reminder...');
  const trialResult = await sendTrialReminderEmail({
    to: TEST_EMAIL,
    name: 'John',
    daysLeft: 2,
    upgradeUrl: `${APP_URL}/pricing`,
  });
  console.log(trialResult.success ? '✅ Trial reminder sent!' : `❌ Failed: ${trialResult.error}`);

  // 5. Compliance Reminder (Urgent - 7 days)
  console.log('\n📧 5/5: Sending Compliance Reminder (URGENT)...');
  const complianceResult = await sendComplianceReminderEmail({
    to: TEST_EMAIL,
    name: 'John',
    daysUntilExpiry: 7,
    items: [
      {
        type: 'gas_safety',
        property: '123 High Street, London',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        type: 'eicr',
        property: '45 Oak Avenue, Manchester',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    ],
  });
  console.log(complianceResult.success ? '✅ Compliance reminder sent!' : `❌ Failed: ${complianceResult.error}`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  const results = [welcomeResult, purchaseResult, resetResult, trialResult, complianceResult];
  const successCount = results.filter(r => r.success).length;
  console.log(`   ${successCount}/5 emails sent successfully`);

  if (successCount === 5) {
    console.log('\n🎉 All test emails sent! Check your inbox at:', TEST_EMAIL);
  } else {
    console.log('\n⚠️  Some emails failed. Check the errors above.');
  }
}

// Run the script
sendTestEmails().catch(console.error);
