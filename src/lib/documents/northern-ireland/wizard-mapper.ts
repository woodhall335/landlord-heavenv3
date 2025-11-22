/**
 * Northern Ireland Wizard Mapper
 *
 * Maps wizard collected_facts to proper NoticeToQuitData format
 * Handles notice period calculation based on tenancy length
 */

import {
  NoticeToQuitData,
  LandlordDetails,
  TenantDetails,
  PropertyDetails,
  RentDetails,
  RentArrearsBreakdown,
} from './notice-to-quit-generator';

/**
 * Interface for wizard collected facts (what the wizard collects)
 */
export interface NIWizardFacts {
  // Core details
  landlord_full_name: string;
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;

  tenant_full_name: string;
  tenant_2_full_name?: string;
  property_address: string;

  // Tenancy dates
  tenancy_start_date: string;
  tenancy_agreement_date?: string;
  tenancy_end_date?: string;

  // Rent details
  rent_amount: number;
  rent_period?: string; // "weekly" or "monthly" (NEW field from wizard fix)
  rent_due_day?: number;

  // Notice details
  notice_served?: boolean;
  notice_date?: string;
  notice_expiry_date?: string; // "quit_date" in NI
  desired_leaving_date?: string;

  // Ground selection (from AI recommendation)
  recommended_ground?: number; // 1-17 (NI has 13 grounds but numbered 1-17 with gaps)
  recommended_grounds?: number[];

  // Ground 8/10 - Rent Arrears
  total_arrears?: number;
  arrears_duration_months?: number;

  // Ground 11 - Persistent late payment
  late_payment_instances?: number;
  late_payment_details?: string;

  // Ground 12 - Breach
  breach_type?: string;
  breach_description?: string;

  // Ground 14 - ASB/Nuisance
  asb_description?: string;
  asb_incident_count?: number;
  police_involved?: boolean;

  // Ground 1 - Landlord needs property
  landlord_needs_property_reason?: string;

  // Any other wizard fields...
  [key: string]: any;
}

/**
 * Maps wizard facts to NoticeToQuitData
 */
export function mapWizardToNoticeToQuit(wizardFacts: NIWizardFacts): NoticeToQuitData {
  // Calculate tenancy length
  const tenancyStartDate = new Date(parseUKDate(wizardFacts.tenancy_start_date));
  const today = new Date();
  const tenancyLengthYears = calculateTenancyLength(tenancyStartDate, today);

  // Calculate notice period based on tenancy length (NI specific)
  const { noticePeriodDays, noticePeriodWeeks } = calculateNoticePeriod(tenancyLengthYears);

  // Calculate dates
  const noticeDate = wizardFacts.notice_date
    ? new Date(parseUKDate(wizardFacts.notice_date))
    : new Date();

  const quitDate = wizardFacts.notice_expiry_date
    ? new Date(parseUKDate(wizardFacts.notice_expiry_date))
    : wizardFacts.desired_leaving_date
    ? new Date(parseUKDate(wizardFacts.desired_leaving_date))
    : calculateQuitDate(noticeDate, noticePeriodDays);

  // Build landlord details
  const landlord: LandlordDetails = {
    full_name: wizardFacts.landlord_full_name,
    address: wizardFacts.landlord_address,
    email: wizardFacts.landlord_email,
    phone: wizardFacts.landlord_phone,
  };

  // Build tenant details
  const tenants: TenantDetails[] = [
    {
      full_name: wizardFacts.tenant_full_name,
      email: wizardFacts.tenant_email,
      phone: wizardFacts.tenant_phone,
    },
  ];

  // Add second tenant if exists
  if (wizardFacts.tenant_2_full_name) {
    tenants.push({
      full_name: wizardFacts.tenant_2_full_name,
    });
  }

  // Build property details
  const property: PropertyDetails = {
    address: wizardFacts.property_address,
  };

  // Build rent details
  const rent: RentDetails = {
    amount: wizardFacts.rent_amount,
    period: normalizeRentPeriod(wizardFacts.rent_period),
    due_day: wizardFacts.rent_due_day?.toString(),
  };

  // Determine which grounds are being claimed
  const groundNumbers: number[] = wizardFacts.recommended_grounds ||
                                   (wizardFacts.recommended_ground ? [wizardFacts.recommended_ground] : []);

  // Build ground-specific data
  const groundData: Partial<NoticeToQuitData> = {};

  groundNumbers.forEach((groundNum) => {
    switch (groundNum) {
      case 8: // Rent arrears (3 months or more)
      case 10: // Rent arrears (2 months or more)
        groundData[`ground_${groundNum}_claimed`] = true;
        groundData.total_arrears = wizardFacts.total_arrears;
        groundData.arrears_weeks = calculateArrearsWeeks(
          wizardFacts.total_arrears || 0,
          wizardFacts.rent_amount,
          wizardFacts.rent_period
        );
        groundData.arrears_breakdown = buildArrearsBreakdown(
          wizardFacts.total_arrears || 0,
          wizardFacts.rent_amount,
          wizardFacts.rent_period || 'month',
          wizardFacts.arrears_duration_months || 3
        );
        break;

      case 11: // Persistent late payment
        groundData.ground_11_claimed = true;
        groundData.late_payment_instances = wizardFacts.late_payment_instances;
        groundData.late_payment_details = wizardFacts.late_payment_details;
        break;

      case 12: // Breach of tenancy
        groundData.ground_12_claimed = true;
        groundData.breach_type = wizardFacts.breach_type;
        groundData.breach_description = wizardFacts.breach_description;
        break;

      case 14: // Nuisance/annoyance (ASB)
        groundData.ground_14_claimed = true;
        groundData.asb_description = wizardFacts.asb_description;
        groundData.asb_incidents = buildASBIncidents(wizardFacts);
        break;

      case 1: // Landlord previously occupied
        groundData.ground_1_claimed = true;
        groundData.landlord_needs_property_reason = wizardFacts.landlord_needs_property_reason;
        break;

      default:
        // Set ground claimed flag for other grounds
        groundData[`ground_${groundNum}_claimed`] = true;
        break;
    }
  });

  // Construct full NoticeToQuitData
  const noticeToQuitData: NoticeToQuitData = {
    // Required fields
    landlord,
    tenants,
    property,
    notice_date: formatUKDate(noticeDate),
    quit_date: formatUKDate(quitDate),
    tenancy_start_date: formatUKDate(tenancyStartDate),

    // Tenancy details
    tenancy_length_years: tenancyLengthYears,
    notice_period_days: noticePeriodDays,
    notice_period_weeks: noticePeriodWeeks,

    // Rent
    rent,

    // Ground-specific data
    ...groundData,
  };

  return noticeToQuitData;
}

/**
 * Calculate tenancy length in years
 */
function calculateTenancyLength(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.25;
  return parseFloat(diffYears.toFixed(2));
}

/**
 * Calculate notice period based on tenancy length (NI specific rules)
 *
 * Northern Ireland notice periods:
 * - < 1 year: 28 days (4 weeks)
 * - 1-10 years: 56 days (8 weeks)
 * - 10+ years: 84 days (12 weeks)
 */
function calculateNoticePeriod(tenancyLengthYears: number): {
  noticePeriodDays: number;
  noticePeriodWeeks: number;
} {
  if (tenancyLengthYears < 1) {
    return { noticePeriodDays: 28, noticePeriodWeeks: 4 };
  } else if (tenancyLengthYears < 10) {
    return { noticePeriodDays: 56, noticePeriodWeeks: 8 };
  } else {
    return { noticePeriodDays: 84, noticePeriodWeeks: 12 };
  }
}

/**
 * Calculate quit date from notice date and notice period
 */
function calculateQuitDate(noticeDate: Date, noticePeriodDays: number): Date {
  const quitDate = new Date(noticeDate);
  quitDate.setDate(quitDate.getDate() + noticePeriodDays);
  return quitDate;
}

/**
 * Calculate arrears in weeks
 */
function calculateArrearsWeeks(totalArrears: number, rentAmount: number, rentPeriod?: string): number {
  if (!rentAmount) return 0;

  const normalizedPeriod = normalizeRentPeriod(rentPeriod);

  if (normalizedPeriod === 'week') {
    return Math.floor(totalArrears / rentAmount);
  } else {
    // Monthly rent - convert to weekly
    const weeklyRent = rentAmount / 4.33;
    return Math.floor(totalArrears / weeklyRent);
  }
}

/**
 * Build arrears breakdown
 */
function buildArrearsBreakdown(
  totalArrears: number,
  rentAmount: number,
  rentPeriod: string,
  durationMonths: number
): RentArrearsBreakdown[] {
  const breakdown: RentArrearsBreakdown[] = [];

  if (rentPeriod === 'week') {
    // Weekly breakdown
    const weeks = Math.min(durationMonths * 4, 52); // Cap at 52 weeks
    for (let i = 0; i < weeks; i++) {
      breakdown.push({
        period: `Week ${i + 1}`,
        amount_due: rentAmount,
        amount_paid: 0,
        arrears: rentAmount * (i + 1),
      });
    }
  } else {
    // Monthly breakdown
    const today = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = durationMonths - 1; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthNames[monthDate.getMonth()];
      const year = monthDate.getFullYear();

      breakdown.push({
        period: `${monthName} ${year}`,
        amount_due: rentAmount,
        amount_paid: 0,
        arrears: rentAmount * (durationMonths - i),
      });
    }
  }

  return breakdown;
}

/**
 * Build ASB incidents array
 */
function buildASBIncidents(facts: NIWizardFacts): Array<{ date: string; description: string; witnesses?: string }> {
  const incidents: Array<{ date: string; description: string; witnesses?: string }> = [];

  const incidentCount = facts.asb_incident_count || 1;

  for (let i = 0; i < incidentCount; i++) {
    incidents.push({
      date: new Date().toLocaleDateString('en-GB'),
      description: facts.asb_description || 'Antisocial behaviour incident',
    });
  }

  return incidents;
}

/**
 * Normalize rent period to "week" or "month"
 */
function normalizeRentPeriod(period: string | undefined): 'week' | 'month' {
  if (!period) return 'month'; // Default

  const normalized = period.toLowerCase();
  if (normalized.includes('week')) return 'week';
  if (normalized.includes('month')) return 'month';

  return 'month'; // Default
}

/**
 * Parse UK date string (DD/MM/YYYY or "15 January 2025")
 */
function parseUKDate(dateStr: string): string {
  // Try parsing ISO format first
  if (dateStr.includes('-')) {
    return dateStr;
  }

  // Try DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  // Try parsing "15 January 2025" format
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback to today
  return new Date().toISOString().split('T')[0];
}

/**
 * Format Date to UK format "15 January 2025"
 */
function formatUKDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
