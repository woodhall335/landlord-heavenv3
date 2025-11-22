/**
 * Scotland Wizard Mapper
 *
 * Maps wizard collected_facts to proper NoticeToLeaveData format
 * Handles ground construction, date calculations, and data enrichment
 */

import {
  NoticeToLeaveData,
  NoticeToLeaveGround,
  RentArrearsBreakdown,
  buildGround,
  buildGround1RentArrears,
  buildGround3ASB,
  buildGround4LandlordOccupy,
  buildGround5LandlordSell,
  calculateEarliestLeavingDate,
  getNoticePeriodForGround,
  ASBIncident,
} from './notice-to-leave-generator';

/**
 * Interface for wizard collected facts (what the wizard collects)
 */
export interface ScotlandWizardFacts {
  // Core details
  landlord_full_name: string;
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;
  landlord_reg_number?: string; // Scotland requires this

  tenant_full_name: string;
  tenant_2_full_name?: string;
  property_address: string;

  // Tenancy dates
  tenancy_start_date: string;
  tenancy_agreement_date?: string;

  // Rent details
  rent_amount: number;
  rent_period?: string; // "weekly" or "monthly" (NEW field from wizard fix)
  rent_due_day?: number;

  // Deposit
  deposit_amount?: number;
  deposit_protected?: boolean;
  deposit_scheme?: string;
  deposit_prescribed_info_date?: string;

  // Notice details
  notice_served?: boolean;
  notice_date?: string;
  notice_expiry_date?: string; // "earliest_leaving_date" in Scotland
  desired_leaving_date?: string;

  // Ground selection (from AI recommendation)
  recommended_ground?: number; // 1-18
  recommended_grounds?: number[]; // Can claim multiple grounds

  // Ground 1 - Rent Arrears
  total_arrears?: number;
  arrears_duration_months?: number;
  pre_action_completed?: boolean; // Yes/no question
  pre_action_contact_dates?: string; // Comma-separated dates

  // Ground 3 - ASB
  asb_type?: string;
  asb_description?: string;
  asb_incident_count?: number;
  police_involved?: boolean;
  police_call_count?: number;
  council_involved?: boolean;
  council_name?: string;

  // Ground 4 - Landlord intends to occupy
  landlord_occupation_reason?: string;
  landlord_current_residence?: string;
  landlord_occupation_timescale?: string;

  // Ground 5 - Landlord intends to sell
  sale_intention_details?: string;
  estate_agent?: boolean;
  estate_agent_name?: string;
  estate_agent_date?: string;

  // Council info
  council_phone?: string;

  // Any other wizard fields...
  [key: string]: any;
}

/**
 * Maps wizard facts to NoticeToLeaveData
 */
export function mapWizardToNoticeToLeave(wizardFacts: ScotlandWizardFacts): NoticeToLeaveData {
  // Determine which ground(s) to claim
  const groundNumbers: number[] = wizardFacts.recommended_grounds ||
                                   (wizardFacts.recommended_ground ? [wizardFacts.recommended_ground] : [1]);

  // Get the primary ground to determine notice period
  const primaryGround = groundNumbers[0];
  const noticePeriod = getNoticePeriodForGround(primaryGround);

  // Calculate dates
  const noticeDate = wizardFacts.notice_date
    ? new Date(parseUKDate(wizardFacts.notice_date))
    : new Date();

  const earliestLeavingDate = wizardFacts.notice_expiry_date
    ? new Date(parseUKDate(wizardFacts.notice_expiry_date))
    : wizardFacts.desired_leaving_date
    ? new Date(parseUKDate(wizardFacts.desired_leaving_date))
    : calculateEarliestLeavingDate(noticeDate, noticePeriod);

  // Build grounds array
  const grounds: NoticeToLeaveGround[] = [];
  const groundData: Partial<NoticeToLeaveData> = {};

  groundNumbers.forEach((groundNum) => {
    switch (groundNum) {
      case 1: // Rent Arrears
        if (wizardFacts.total_arrears && wizardFacts.rent_amount) {
          const ground1Data = buildGround1RentArrears({
            totalArrears: wizardFacts.total_arrears,
            rentAmount: wizardFacts.rent_amount,
            rentPeriod: normalizeRentPeriod(wizardFacts.rent_period),
            arrearsBreakdown: buildArrearsBreakdown(
              wizardFacts.total_arrears,
              wizardFacts.rent_amount,
              wizardFacts.arrears_duration_months || Math.floor(wizardFacts.total_arrears / wizardFacts.rent_amount)
            ),
            preActionEvidence: buildPreActionEvidence(wizardFacts),
          });

          grounds.push(...(ground1Data.grounds || []));
          Object.assign(groundData, ground1Data);
        }
        break;

      case 3: // Antisocial Behaviour
        if (wizardFacts.asb_description) {
          const ground3Data = buildGround3ASB({
            asbType: wizardFacts.asb_type || 'Antisocial behaviour',
            asbDescription: wizardFacts.asb_description,
            incidents: buildASBIncidents(wizardFacts),
            policeInvolved: wizardFacts.police_involved,
            policeCrimeNumbers: [], // Wizard could collect this
            councilInvolved: wizardFacts.council_involved,
            councilName: wizardFacts.council_name,
          });

          grounds.push(...(ground3Data.grounds || []));
          Object.assign(groundData, ground3Data);
        }
        break;

      case 4: // Landlord intends to occupy
        if (wizardFacts.landlord_occupation_reason) {
          const ground4Data = buildGround4LandlordOccupy({
            reasonForOccupying: wizardFacts.landlord_occupation_reason,
            currentResidence: wizardFacts.landlord_current_residence,
            occupationTimescale: wizardFacts.landlord_occupation_timescale,
          });

          grounds.push(...(ground4Data.grounds || []));
          Object.assign(groundData, ground4Data);
        }
        break;

      case 5: // Landlord intends to sell
        if (wizardFacts.sale_intention_details) {
          const ground5Data = buildGround5LandlordSell({
            saleIntentionDetails: wizardFacts.sale_intention_details,
            estateAgent: wizardFacts.estate_agent_name,
            estateAgentDate: wizardFacts.estate_agent_date,
          });

          grounds.push(...(ground5Data.grounds || []));
          Object.assign(groundData, ground5Data);
        }
        break;

      default:
        // Generic ground builder for other grounds
        grounds.push(
          buildGround(
            groundNum,
            `Ground ${groundNum} applies to this case.`, // Backend should enhance this
            undefined
          )
        );
        break;
    }
  });

  // Construct full NoticeToLeaveData
  const noticeToLeaveData: NoticeToLeaveData = {
    // Landlord details
    landlord_full_name: wizardFacts.landlord_full_name,
    landlord_address: wizardFacts.landlord_address,
    landlord_email: wizardFacts.landlord_email,
    landlord_phone: wizardFacts.landlord_phone,
    landlord_reg_number: wizardFacts.landlord_reg_number,

    // Tenant details
    tenant_full_name: wizardFacts.tenant_full_name,
    tenant_2_name: wizardFacts.tenant_2_full_name,

    // Property
    property_address: wizardFacts.property_address,

    // Dates
    notice_date: formatUKDate(noticeDate),
    earliest_leaving_date: formatUKDate(earliestLeavingDate),
    earliest_tribunal_date: formatUKDate(earliestLeavingDate), // Same as leaving date
    notice_period_days: noticePeriod,

    // Grounds
    grounds,

    // Deposit
    deposit_protected: wizardFacts.deposit_protected,
    deposit_amount: wizardFacts.deposit_amount,
    deposit_scheme: wizardFacts.deposit_scheme,

    // Council
    council_phone: wizardFacts.council_phone || '0131 200 2000', // Default Edinburgh

    // Merge in any ground-specific data
    ...groundData,
  };

  return noticeToLeaveData;
}

/**
 * Helper: Builds arrears breakdown from total arrears and rent amount
 * Auto-generates month-by-month breakdown
 */
function buildArrearsBreakdown(
  totalArrears: number,
  rentAmount: number,
  durationMonths: number
): RentArrearsBreakdown[] {
  const breakdown: RentArrearsBreakdown[] = [];
  let balance = 0;

  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  for (let i = durationMonths - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = monthNames[monthDate.getMonth()];
    const year = monthDate.getFullYear();

    balance += rentAmount;

    breakdown.push({
      period: `${monthName} ${year}`,
      amount_due: rentAmount,
      amount_paid: 0,
      balance: balance,
    });
  }

  return breakdown;
}

/**
 * Helper: Builds pre-action evidence string
 */
function buildPreActionEvidence(facts: ScotlandWizardFacts): string {
  if (!facts.pre_action_completed) {
    return 'Pre-action requirements not yet completed';
  }

  const evidence: string[] = [];

  if (facts.pre_action_contact_dates) {
    evidence.push(`Contact attempts made on: ${facts.pre_action_contact_dates}`);
  } else {
    evidence.push('Tenant contacted on at least 3 occasions regarding rent arrears');
  }

  evidence.push('Rent statements provided to tenant');
  evidence.push('Pre-action requirements completed as per Pre-Action Requirements (Notice to Leave) Regulations 2020');

  return evidence.join('. ');
}

/**
 * Helper: Builds ASB incidents array from wizard facts
 */
function buildASBIncidents(facts: ScotlandWizardFacts): ASBIncident[] {
  const incidents: ASBIncident[] = [];

  // If wizard collected structured incident data, use it
  // Otherwise create generic incidents
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
 * Helper: Normalize rent period to "month" or "week"
 */
function normalizeRentPeriod(period: string | undefined): string {
  if (!period) return 'month'; // Default

  const normalized = period.toLowerCase();
  if (normalized.includes('week')) return 'week';
  if (normalized.includes('month')) return 'month';

  return 'month'; // Default
}

/**
 * Helper: Parse UK date string (DD/MM/YYYY or "15 January 2025")
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
 * Helper: Format Date to UK format "15 January 2025"
 */
function formatUKDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
