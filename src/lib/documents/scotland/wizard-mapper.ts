/**
 * Scotland Wizard Mapper
 *
 * This mapper follows the WizardFacts → CaseFacts pattern.
 * WizardFacts comes from case_facts.facts; we convert to CaseFacts for domain logic
 * and still read some jurisdiction-specific fields directly from WizardFacts
 * until CaseFacts is extended.
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
import type { WizardFacts, CaseFacts } from '@/lib/case-facts/schema';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

/**
 * Helper to get a value from flat WizardFacts
 */
function getWizardValue(wizard: WizardFacts, key: string): any {
  return wizard[key] ?? null;
}

/**
 * Helper to build address string from components
 */
function buildAddressString(
  line1: string | null,
  line2: string | null,
  city: string | null,
  postcode: string | null
): string {
  const parts = [line1, line2, city, postcode].filter(Boolean);
  return parts.join(', ');
}

/**
 * Maps wizard facts to NoticeToLeaveData
 */
export function mapWizardToNoticeToLeave(wizardFacts: WizardFacts): NoticeToLeaveData {
  // Convert flat WizardFacts to nested CaseFacts for core domain logic
  const caseFacts: CaseFacts = wizardFactsToCaseFacts(wizardFacts);
  // TODO: recommended_ground(s) not yet in CaseFacts - read from WizardFacts directly
  const groundNumbers: number[] = getWizardValue(wizardFacts, 'recommended_grounds') ||
                                   (getWizardValue(wizardFacts, 'recommended_ground') ? [getWizardValue(wizardFacts, 'recommended_ground')] : [1]);

  // Get the primary ground to determine notice period
  const primaryGround = groundNumbers[0];
  const noticePeriod = getNoticePeriodForGround(primaryGround);

  // Calculate dates - use CaseFacts for notice dates
  const noticeDate = caseFacts.notice.notice_date
    ? new Date(parseUKDate(caseFacts.notice.notice_date))
    : new Date();

  // TODO: desired_leaving_date not yet in CaseFacts - read from WizardFacts
  const earliestLeavingDate = caseFacts.notice.expiry_date
    ? new Date(parseUKDate(caseFacts.notice.expiry_date))
    : getWizardValue(wizardFacts, 'desired_leaving_date')
    ? new Date(parseUKDate(getWizardValue(wizardFacts, 'desired_leaving_date')))
    : calculateEarliestLeavingDate(noticeDate, noticePeriod);

  // Build grounds array
  const grounds: NoticeToLeaveGround[] = [];
  const groundData: Partial<NoticeToLeaveData> = {};

  groundNumbers.forEach((groundNum) => {
    switch (groundNum) {
      case 1: // Rent Arrears
        const totalArrears = caseFacts.issues.rent_arrears.total_arrears;
        const rentAmount = caseFacts.tenancy.rent_amount;
        if (totalArrears && rentAmount) {
          // TODO: arrears_duration_months not yet in CaseFacts - read from WizardFacts
          const arrearsMonths = getWizardValue(wizardFacts, 'arrears_duration_months') || Math.floor(totalArrears / rentAmount);
          const ground1Data = buildGround1RentArrears({
            totalArrears: totalArrears,
            rentAmount: rentAmount,
            rentPeriod: normalizeRentPeriod(caseFacts.tenancy.rent_frequency),
            arrearsBreakdown: buildArrearsBreakdown(
              totalArrears,
              rentAmount,
              arrearsMonths
            ),
            preActionEvidence: buildPreActionEvidence(wizardFacts),
          });

          grounds.push(...(ground1Data.grounds || []));
          Object.assign(groundData, ground1Data);
        }
        break;

      case 3: // Antisocial Behaviour
        if (caseFacts.issues.asb.description) {
          // TODO: asb_type, police_involved, council_involved not yet in CaseFacts
          const ground3Data = buildGround3ASB({
            asbType: getWizardValue(wizardFacts, 'asb_type') || 'Antisocial behaviour',
            asbDescription: caseFacts.issues.asb.description,
            incidents: buildASBIncidents(wizardFacts),
            policeInvolved: getWizardValue(wizardFacts, 'police_involved'),
            policeCrimeNumbers: [], // Wizard could collect this
            councilInvolved: getWizardValue(wizardFacts, 'council_involved'),
            councilName: getWizardValue(wizardFacts, 'council_name'),
          });

          grounds.push(...(ground3Data.grounds || []));
          Object.assign(groundData, ground3Data);
        }
        break;

      case 4: // Landlord intends to occupy
        // TODO: landlord_occupation_* fields not yet in CaseFacts
        if (getWizardValue(wizardFacts, 'landlord_occupation_reason')) {
          const ground4Data = buildGround4LandlordOccupy({
            reasonForOccupying: getWizardValue(wizardFacts, 'landlord_occupation_reason'),
            currentResidence: getWizardValue(wizardFacts, 'landlord_current_residence'),
            occupationTimescale: getWizardValue(wizardFacts, 'landlord_occupation_timescale'),
          });

          grounds.push(...(ground4Data.grounds || []));
          Object.assign(groundData, ground4Data);
        }
        break;

      case 5: // Landlord intends to sell
        // TODO: sale_intention_details not yet in CaseFacts
        if (getWizardValue(wizardFacts, 'sale_intention_details')) {
          const ground5Data = buildGround5LandlordSell({
            saleIntentionDetails: getWizardValue(wizardFacts, 'sale_intention_details'),
            estateAgent: getWizardValue(wizardFacts, 'estate_agent_name'),
            estateAgentDate: getWizardValue(wizardFacts, 'estate_agent_date'),
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

  // Build full address strings from CaseFacts
  const landlordAddress = buildAddressString(
    caseFacts.parties.landlord.address_line1,
    caseFacts.parties.landlord.address_line2,
    caseFacts.parties.landlord.city,
    caseFacts.parties.landlord.postcode
  );
  const propertyAddress = buildAddressString(
    caseFacts.property.address_line1,
    caseFacts.property.address_line2,
    caseFacts.property.city,
    caseFacts.property.postcode
  );

  // Get primary tenant
  const primaryTenant = caseFacts.parties.tenants[0];
  const secondTenant = caseFacts.parties.tenants[1];

  // Construct full NoticeToLeaveData
  const noticeToLeaveData: NoticeToLeaveData = {
    // Landlord details - use CaseFacts for core fields
    landlord_full_name: caseFacts.parties.landlord.name || '',
    landlord_address: landlordAddress,
    landlord_email: caseFacts.parties.landlord.email ?? undefined,
    landlord_phone: caseFacts.parties.landlord.phone ?? undefined,
    // TODO: landlord_reg_number is Scotland-specific, not yet in CaseFacts
    landlord_reg_number: getWizardValue(wizardFacts, 'landlord_reg_number') ?? undefined,

    // Tenant details - use CaseFacts
    tenant_full_name: primaryTenant?.name || '',
    tenant_2_name: secondTenant?.name ?? undefined,

    // Property - use CaseFacts
    property_address: propertyAddress,

    // Dates
    notice_date: formatUKDate(noticeDate),
    earliest_leaving_date: formatUKDate(earliestLeavingDate),
    earliest_tribunal_date: formatUKDate(earliestLeavingDate), // Same as leaving date
    notice_period_days: noticePeriod,

    // Grounds
    grounds,

    // Deposit - use CaseFacts
    // Scotland NoticeToLeaveData type only supports deposit_scheme
    deposit_protected: caseFacts.tenancy.deposit_protected ?? undefined,
    deposit_amount: caseFacts.tenancy.deposit_amount ?? undefined,
    deposit_scheme: caseFacts.tenancy.deposit_scheme_name ?? undefined,

    // Council - TODO: council_phone not yet in CaseFacts
    council_phone: getWizardValue(wizardFacts, 'council_phone') || '0131 200 2000', // Default Edinburgh

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
function buildPreActionEvidence(facts: WizardFacts): string {
  if (!getWizardValue(facts, 'pre_action_completed')) {
    return 'Pre-action requirements not yet completed';
  }

  const evidence: string[] = [];

  const contactDates = getWizardValue(facts, 'pre_action_contact_dates');
  if (contactDates) {
    evidence.push(`Contact attempts made on: ${contactDates}`);
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
function buildASBIncidents(facts: WizardFacts): ASBIncident[] {
  const incidents: ASBIncident[] = [];

  // If wizard collected structured incident data, use it
  // Otherwise create generic incidents
  const incidentCount = getWizardValue(facts, 'asb_incident_count') || 1;
  const asbDescription = getWizardValue(facts, 'asb_description') || 'Antisocial behaviour incident';

  for (let i = 0; i < incidentCount; i++) {
    incidents.push({
      date: new Date().toLocaleDateString('en-GB'),
      description: asbDescription,
    });
  }

  return incidents;
}

/**
 * Helper: Normalize rent period to "month" or "week"
 */
function normalizeRentPeriod(
  period:
    | 'weekly'
    | 'fortnightly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'other'
    | null
    | undefined
): string {
  if (!period) return 'month'; // Default

  if (period === 'fortnightly') return 'week';
  if (period === 'quarterly') return 'month';

  if (period === 'weekly') return 'week';
  if (period === 'monthly') return 'month';
  if (period === 'yearly') return 'year';

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
