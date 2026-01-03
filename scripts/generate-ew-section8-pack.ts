import { generateCompleteEvictionPack } from '../src/lib/documents/eviction-pack-generator.ts';
import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import { savePackPreview } from './helpers/save-pack.ts';
import { calculateSection8ExpiryDate } from '../src/lib/documents/notice-date-calculator.ts';

/**
 * Build Section 8 eviction pack test fixtures with DYNAMICALLY VALID dates.
 *
 * Key insight: Section 8 notice periods vary by ground:
 * - Ground 8 (serious arrears): 14 days minimum
 * - Ground 10 (some arrears): 60 days minimum (2 months!)
 *
 * When using multiple grounds, the MAXIMUM period applies.
 * Ground 8 + Ground 10 = 60 days minimum.
 */
function buildEnglandFacts() {
  // Calculate dates dynamically to ensure they're always valid
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Use today as service date - the generator will auto-calculate expiry
  const noticeServedDate = todayStr;

  // Calculate the earliest valid expiry date based on grounds (Ground 8 + Ground 10)
  // This is for reference - we let the generator calculate it
  const grounds = [
    { code: 8, mandatory: true },
    { code: 10, mandatory: false },
  ];
  const dateCalc = calculateSection8ExpiryDate({
    service_date: noticeServedDate,
    grounds,
  });

  console.log(`📅 Service date: ${noticeServedDate}`);
  console.log(`📅 Earliest valid expiry: ${dateCalc.earliest_valid_date} (${dateCalc.notice_period_days} days)`);
  console.log(`📋 ${dateCalc.explanation}`);

  // Build arrears schedule with recent dates
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const period1Start = twoMonthsAgo.toISOString().split('T')[0];
  const period1End = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0).toISOString().split('T')[0];
  const period2Start = oneMonthAgo.toISOString().split('T')[0];
  const period2End = new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() + 1, 0).toISOString().split('T')[0];

  return {
    __meta: { case_id: 'EVICT-CLI-SEC8', jurisdiction: 'england' },
    landlord_name: 'Alex Landlord',
    landlord_address_line1: '1 High Street',
    landlord_city: 'London',
    landlord_postcode: 'SW1A1A1',
    landlord_email: 'alex@example.com',
    landlord_phone: '07123456789',
    tenant1_name: 'Tina Tenant',
    tenant1_email: 'tina@example.com',
    tenant1_phone: '07000000000',
    property_address_line1: '2 Low Road',
    property_city: 'London',
    property_postcode: 'SW1A2BB',
    tenancy_start_date: '2024-01-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 8',
    // Use dynamic service date - generator will auto-calculate valid expiry
    notice_date: noticeServedDate,
    notice_served_date: noticeServedDate,
    // Do NOT pass notice_expiry_date - let generator auto-calculate based on grounds
    eviction_route: 'Section 8',
    section8_grounds: ['Ground 8', 'Ground 10'],
    arrears_breakdown: 'Total arrears £2400',
    total_arrears: 2400,
    // =========================================================================
    // REQUIRED FOR COMPLETE PACK - court form fields
    // =========================================================================
    notice_service_method: 'first_class_post', // Required for N5B/N5 field 10a
    court_name: 'Central London County Court', // Required for court form header
    // =========================================================================
    // AUTHORITATIVE ARREARS SCHEDULE (Required for Ground 8)
    // Ground 8 validation requires period-by-period breakdown, not just totals.
    // The arrears engine enforces this for court form generation.
    // =========================================================================
    arrears_items: [
      {
        period_start: period1Start,
        period_end: period1End,
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
      {
        period_start: period2Start,
        period_end: period2End,
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
    ],
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: '2024-01-15',
    deposit_scheme_name: 'TDS',
    rent_arrears_amount: 2400,
    case_facts: {
      eviction: {
        notice_served_date: noticeServedDate,
        rent_arrears_amount: 2400,
      },
    },
  } as any;
}

async function main() {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  __setTestJsonAIClient({
    async jsonCompletion() {
      return {
        json: {} as any,
        content: '{}',
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        model: 'gpt-4o-mini',
        cost_usd: 0,
      };
    },
  } as any);

  const pack = await generateCompleteEvictionPack(buildEnglandFacts());
  await savePackPreview('England Section 8 Complete Eviction Pack', 'england-section8', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
