import { calculateSection8ExpiryDate, calculateSection21ExpiryDate } from '@/lib/documents/notice-date-calculator';

interface BuildSection8Options {
  logDates?: boolean;
}

interface BuildSection21Options {
  logDates?: boolean;
}

function toIsoDate(value: Date): string {
  return value.toISOString().split('T')[0];
}

export function buildEnglandSection8CompletePackFacts(options: BuildSection8Options = {}) {
  const { logDates = false } = options;
  const today = new Date();
  const noticeServedDate = toIsoDate(today);

  const grounds = [
    { code: 8, mandatory: true },
    { code: 10, mandatory: false },
  ];
  const dateCalc = calculateSection8ExpiryDate({
    service_date: noticeServedDate,
    grounds,
  });

  if (logDates) {
    console.log(`📅 Service date: ${noticeServedDate}`);
    console.log(`📅 Earliest valid expiry: ${dateCalc.earliest_valid_date} (${dateCalc.notice_period_days} days)`);
    console.log(`📋 ${dateCalc.explanation}`);
  }

  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const period1Start = toIsoDate(twoMonthsAgo);
  const period1End = toIsoDate(new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0));
  const period2Start = toIsoDate(oneMonthAgo);
  const period2End = toIsoDate(new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() + 1, 0));

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
    notice_date: noticeServedDate,
    notice_served_date: noticeServedDate,
    eviction_route: 'Section 8',
    section8_grounds: ['Ground 8', 'Ground 10'],
    arrears_breakdown: 'Total arrears £2400',
    total_arrears: 2400,
    notice_service_method: 'first_class_post',
    court_name: 'Central London County Court',
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

export function buildEnglandSection21CompletePackFacts(options: BuildSection21Options = {}) {
  const { logDates = false } = options;
  const today = new Date();
  const noticeServedDate = toIsoDate(today);
  const tenancyStartDate = new Date(today);
  tenancyStartDate.setFullYear(tenancyStartDate.getFullYear() - 1);
  tenancyStartDate.setDate(1);
  const tenancyStartDateStr = toIsoDate(tenancyStartDate);

  const dateCalc = calculateSection21ExpiryDate({
    service_date: noticeServedDate,
    tenancy_start_date: tenancyStartDateStr,
    fixed_term: false,
    rent_period: 'monthly',
    service_method: 'first_class_post',
  });

  if (logDates) {
    console.log(`📅 Section 21 service date: ${noticeServedDate}`);
    console.log(`📅 Section 21 earliest expiry: ${dateCalc.earliest_valid_date}`);
  }

  return {
    __meta: { case_id: 'EVICT-CLI-SEC21', jurisdiction: 'england' },
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
    tenancy_start_date: tenancyStartDateStr,
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 21',
    notice_date: noticeServedDate,
    notice_served_date: noticeServedDate,
    notice_expiry_date: dateCalc.earliest_valid_date,
    eviction_route: 'Section 21',
    notice_service_method: 'first_class_post',
    court_name: 'Central London County Court',
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: tenancyStartDateStr,
    deposit_scheme_name: 'TDS',
    arrears_breakdown: 'No rent arrears claimed; landlord requires possession at end of tenancy.',
    rent_arrears_amount: 0,
    case_facts: {
      eviction: {
        notice_served_date: noticeServedDate,
        tenancy_type: 'assured_shorthold',
      },
    },
  } as any;
}
