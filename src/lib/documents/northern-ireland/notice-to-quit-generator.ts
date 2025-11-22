/**
 * Northern Ireland Notice to Quit Generator
 *
 * Generates Notice to Quit documents for Northern Ireland private tenancies
 * under the Private Tenancies (Northern Ireland) Order 2006.
 *
 * Key Northern Ireland Differences:
 * - Notice periods based on tenancy length (not ground):
 *   - < 1 year: 28 days (4 weeks)
 *   - 1-10 years: 56 days (8 weeks)
 *   - 10+ years: 84 days (12 weeks)
 * - 13 grounds total (4 mandatory, 9 discretionary)
 * - County Court Northern Ireland jurisdiction
 * - No Section 21 equivalent
 */

import { generateDocument, GeneratedDocument } from '../generator';

// ============================================================================
// TYPES
// ============================================================================

export interface LandlordDetails {
  full_name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface AgentDetails {
  name: string;
  company?: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface TenantDetails {
  full_name: string;
  email?: string;
  phone?: string;
}

export interface PropertyDetails {
  address: string;
  description?: string;
}

export interface RentDetails {
  amount: number;
  period: 'week' | 'month';
  due_day?: string;
}

export interface RentArrearsBreakdown {
  period: string;
  amount_due: number;
  amount_paid: number;
  arrears: number;
}

export interface GroundDefinition {
  ground_number: number;
  particulars: string;
  evidence?: string;
}

export interface NoticeToQuitData {
  // Required fields
  landlord: LandlordDetails;
  tenants: TenantDetails[];
  property: PropertyDetails;
  notice_date: string;
  quit_date: string;
  tenancy_start_date: string;

  // Tenancy details
  tenancy_length_years?: number;
  notice_period_days: number;
  notice_period_weeks: number;

  // Optional agent
  agent?: AgentDetails;
  agent_serving_notice?: boolean;

  // Rent details
  rent?: RentDetails;

  // Grounds claimed
  ground_8_claimed?: boolean;
  ground_10_claimed?: boolean;
  ground_11_claimed?: boolean;
  ground_12_claimed?: boolean;
  ground_13_claimed?: boolean;
  ground_14_claimed?: boolean;
  ground_15_claimed?: boolean;
  ground_16_claimed?: boolean;
  ground_17_claimed?: boolean;
  ground_1_claimed?: boolean;
  ground_2_claimed?: boolean;
  ground_5_claimed?: boolean;
  ground_9_claimed?: boolean;

  // Ground-specific data
  // Ground 8 & 10: Rent arrears
  total_arrears?: number;
  arrears_weeks?: number;
  arrears_breakdown?: RentArrearsBreakdown[];

  // Ground 11: Persistent late payment
  late_payment_instances?: number;
  late_payment_details?: string;

  // Ground 12: Breach of tenancy
  breach_type?: string;
  breach_description?: string;
  breach_date?: string;
  breach_evidence?: string;

  // Ground 13: Property deterioration
  deterioration_description?: string;
  deterioration_evidence?: string;

  // Ground 14: Nuisance/annoyance (ASB)
  asb_description?: string;
  asb_incidents?: Array<{
    date: string;
    description: string;
    witnesses?: string;
  }>;
  asb_evidence?: string;

  // Ground 15: Illegal/immoral use
  illegal_use_description?: string;
  illegal_use_evidence?: string;

  // Ground 16: Failed to vacate
  tenant_notice_date?: string;
  tenant_quit_date?: string;

  // Ground 17: False statement
  false_statement_description?: string;
  false_statement_evidence?: string;

  // Ground 1: Landlord previously occupied
  landlord_previous_occupation_end_date?: string;
  landlord_needs_property_reason?: string;

  // Ground 2: Mortgage lender
  lender_name?: string;
  lender_possession_date?: string;

  // Ground 5: Landlord intends to occupy
  landlord_occupation_date?: string;
  landlord_occupation_reason?: string;

  // Ground 9: Suitable alternative accommodation
  alternative_address?: string;
  alternative_rent?: number;
  alternative_description?: string;

  // List of all grounds being claimed
  grounds?: GroundDefinition[];

  // Document metadata
  document_id?: string;
  generation_timestamp?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate notice period based on tenancy length
 */
export function calculateNoticePeriod(tenancyLengthYears: number): {
  days: number;
  weeks: number;
} {
  if (tenancyLengthYears < 1) {
    return { days: 28, weeks: 4 };
  } else if (tenancyLengthYears >= 1 && tenancyLengthYears < 10) {
    return { days: 56, weeks: 8 };
  } else {
    return { days: 84, weeks: 12 };
  }
}

/**
 * Calculate quit date from notice date and period
 */
export function calculateQuitDate(noticeDate: string, noticeDays: number): string {
  const notice = new Date(noticeDate);
  const quit = new Date(notice);
  quit.setDate(quit.getDate() + noticeDays);
  return quit.toISOString().split('T')[0];
}

/**
 * Build a ground definition object
 */
function buildGround(
  groundNumber: number,
  particulars: string,
  evidence?: string
): GroundDefinition {
  return {
    ground_number: groundNumber,
    particulars,
    evidence,
  };
}

// ============================================================================
// GROUND BUILDER FUNCTIONS
// ============================================================================

/**
 * Build Ground 8 - Serious Rent Arrears (MANDATORY)
 */
export function buildGround8SeriousArrears(params: {
  totalArrears: number;
  arrearsWeeks: number;
  rentAmount: number;
  rentPeriod: 'week' | 'month';
  arrearsBreakdown: RentArrearsBreakdown[];
}): Partial<NoticeToQuitData> {
  const { totalArrears, arrearsWeeks, rentAmount, rentPeriod, arrearsBreakdown } = params;

  return {
    ground_8_claimed: true,
    rent: {
      amount: rentAmount,
      period: rentPeriod,
    },
    total_arrears: totalArrears,
    arrears_weeks: arrearsWeeks,
    arrears_breakdown: arrearsBreakdown,
    grounds: [
      buildGround(
        8,
        `The tenant owes at least 8 weeks' rent (${arrearsWeeks} weeks, £${totalArrears.toFixed(2)} total). ` +
          `This ground is MANDATORY - the court must grant possession if arrears are proven at hearing.`
      ),
    ],
  };
}

/**
 * Build Ground 10 - Rent Arrears (DISCRETIONARY)
 */
export function buildGround10RentArrears(params: {
  totalArrears: number;
  rentAmount: number;
  rentPeriod: 'week' | 'month';
  arrearsBreakdown: RentArrearsBreakdown[];
}): Partial<NoticeToQuitData> {
  const { totalArrears, rentAmount, rentPeriod, arrearsBreakdown } = params;

  return {
    ground_10_claimed: true,
    rent: {
      amount: rentAmount,
      period: rentPeriod,
    },
    total_arrears: totalArrears,
    arrears_breakdown: arrearsBreakdown,
    grounds: [
      buildGround(
        10,
        `The tenant owes rent arrears of £${totalArrears.toFixed(2)}. ` +
          `This is a discretionary ground - the court will consider whether it is reasonable to grant possession.`
      ),
    ],
  };
}

/**
 * Build Ground 12 - Breach of Tenancy
 */
export function buildGround12Breach(params: {
  breachType: string;
  breachDescription: string;
  breachDate?: string;
  evidence?: string;
}): Partial<NoticeToQuitData> {
  const { breachType, breachDescription, breachDate, evidence } = params;

  let particulars = `The tenant has breached the tenancy agreement: ${breachType}. ${breachDescription}`;
  if (breachDate) {
    particulars += ` This breach occurred on or around ${breachDate}.`;
  }

  return {
    ground_12_claimed: true,
    breach_type: breachType,
    breach_description: breachDescription,
    breach_date: breachDate,
    breach_evidence: evidence,
    grounds: [buildGround(12, particulars, evidence)],
  };
}

/**
 * Build Ground 14 - Nuisance/Annoyance (Antisocial Behaviour)
 */
export function buildGround14ASB(params: {
  description: string;
  incidents: Array<{
    date: string;
    description: string;
    witnesses?: string;
  }>;
  evidence?: string;
}): Partial<NoticeToQuitData> {
  const { description, incidents, evidence } = params;

  let particulars = `The tenant or persons residing with or visiting the tenant have caused nuisance and annoyance to neighbours or used the property for illegal or immoral purposes. ${description}`;

  if (incidents.length > 0) {
    particulars += `\n\nSpecific incidents include:\n`;
    incidents.forEach((incident, idx) => {
      particulars += `${idx + 1}. ${incident.date}: ${incident.description}`;
      if (incident.witnesses) {
        particulars += ` (Witnessed by: ${incident.witnesses})`;
      }
      particulars += '\n';
    });
  }

  return {
    ground_14_claimed: true,
    asb_description: description,
    asb_incidents: incidents,
    asb_evidence: evidence,
    grounds: [buildGround(14, particulars, evidence)],
  };
}

/**
 * Build Ground 1 - Landlord Previously Occupied (MANDATORY)
 */
export function buildGround1LandlordPreviousOccupation(params: {
  previousOccupationEndDate: string;
  needsPropertyReason: string;
}): Partial<NoticeToQuitData> {
  const { previousOccupationEndDate, needsPropertyReason } = params;

  return {
    ground_1_claimed: true,
    landlord_previous_occupation_end_date: previousOccupationEndDate,
    landlord_needs_property_reason: needsPropertyReason,
    grounds: [
      buildGround(
        1,
        `The landlord previously occupied this property as their only or principal home (until ${previousOccupationEndDate}). ` +
          `The landlord now requires the property: ${needsPropertyReason}. ` +
          `This is a MANDATORY ground.`
      ),
    ],
  };
}

/**
 * Build Ground 5 - Landlord Intends to Occupy (DISCRETIONARY)
 */
export function buildGround5LandlordIntention(params: {
  occupationDate: string;
  reason: string;
}): Partial<NoticeToQuitData> {
  const { occupationDate, reason } = params;

  return {
    ground_5_claimed: true,
    landlord_occupation_date: occupationDate,
    landlord_occupation_reason: reason,
    grounds: [
      buildGround(
        5,
        `The landlord requires the property as their only or principal home from ${occupationDate}. Reason: ${reason}`
      ),
    ],
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateNoticeToQuitData(data: NoticeToQuitData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.landlord?.full_name) errors.push('Landlord name is required');
  if (!data.landlord?.address) errors.push('Landlord address is required');
  if (!data.tenants || data.tenants.length === 0) errors.push('At least one tenant is required');
  if (!data.property?.address) errors.push('Property address is required');
  if (!data.notice_date) errors.push('Notice date is required');
  if (!data.quit_date) errors.push('Quit date is required');
  if (!data.tenancy_start_date) errors.push('Tenancy start date is required');
  if (!data.notice_period_days) errors.push('Notice period in days is required');

  // At least one ground must be claimed
  const groundsClaimed = [
    data.ground_1_claimed,
    data.ground_2_claimed,
    data.ground_5_claimed,
    data.ground_8_claimed,
    data.ground_9_claimed,
    data.ground_10_claimed,
    data.ground_11_claimed,
    data.ground_12_claimed,
    data.ground_13_claimed,
    data.ground_14_claimed,
    data.ground_15_claimed,
    data.ground_16_claimed,
    data.ground_17_claimed,
  ].filter(Boolean).length;

  if (groundsClaimed === 0) {
    errors.push('At least one ground for possession must be claimed');
  }

  // Validate notice period matches tenancy length
  if (data.tenancy_length_years !== undefined) {
    const calculatedPeriod = calculateNoticePeriod(data.tenancy_length_years);
    if (data.notice_period_days !== calculatedPeriod.days) {
      errors.push(
        `Notice period (${data.notice_period_days} days) does not match tenancy length. ` +
          `For a tenancy of ${data.tenancy_length_years} years, notice period should be ${calculatedPeriod.days} days.`
      );
    }
  }

  // Validate Ground 8 (mandatory serious arrears)
  if (data.ground_8_claimed) {
    if (!data.total_arrears) errors.push('Ground 8: Total arrears amount is required');
    if (!data.arrears_weeks) errors.push('Ground 8: Arrears in weeks is required');
    if (data.arrears_weeks && data.arrears_weeks < 8) {
      errors.push('Ground 8: Arrears must be at least 8 weeks for mandatory ground');
    }
    if (!data.rent) errors.push('Ground 8: Rent details are required');
  }

  // Validate Ground 10 (discretionary arrears)
  if (data.ground_10_claimed) {
    if (!data.total_arrears) errors.push('Ground 10: Total arrears amount is required');
    if (!data.rent) errors.push('Ground 10: Rent details are required');
  }

  // Validate Ground 12 (breach)
  if (data.ground_12_claimed) {
    if (!data.breach_type) errors.push('Ground 12: Breach type is required');
    if (!data.breach_description) errors.push('Ground 12: Breach description is required');
  }

  // Validate Ground 14 (ASB)
  if (data.ground_14_claimed) {
    if (!data.asb_description) errors.push('Ground 14: ASB description is required');
    if (!data.asb_incidents || data.asb_incidents.length === 0) {
      warnings.push('Ground 14: ASB incidents should be documented for stronger case');
    }
  }

  // Date validations
  const noticeDate = new Date(data.notice_date);
  const quitDate = new Date(data.quit_date);
  const tenancyStart = new Date(data.tenancy_start_date);

  if (quitDate <= noticeDate) {
    errors.push('Quit date must be after notice date');
  }

  if (noticeDate < tenancyStart) {
    errors.push('Notice date cannot be before tenancy start date');
  }

  const daysDifference = Math.floor((quitDate.getTime() - noticeDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDifference < data.notice_period_days) {
    errors.push(
      `Quit date is only ${daysDifference} days from notice date, ` +
        `but ${data.notice_period_days} days notice is required`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate a Notice to Quit document for Northern Ireland
 */
export async function generateNoticeToQuit(
  data: NoticeToQuitData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'html'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validateNoticeToQuitData(data);
  if (!validation.valid) {
    throw new Error(`Notice to Quit validation failed:\n${validation.errors.join('\n')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Notice to Quit warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Enrich data with defaults
  const enrichedData: NoticeToQuitData = {
    ...data,
    document_id: data.document_id || `NI-NTQ-${Date.now()}`,
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
  };

  // Generate document
  return generateDocument({
    templatePath: 'uk/northern-ireland/templates/notice_to_quit.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

// ============================================================================
// SAMPLE DATA GENERATORS (for testing)
// ============================================================================

export function generateSampleNoticeToQuit(groundNumber: number): NoticeToQuitData {
  const tenancyLengthYears = 1.5;
  const noticePeriod = calculateNoticePeriod(tenancyLengthYears);
  const noticeDate = '2025-01-15';
  const quitDate = calculateQuitDate(noticeDate, noticePeriod.days);

  const baseData: NoticeToQuitData = {
    landlord: {
      full_name: 'Michael O\'Connor',
      address: '15 Stranmillis Road, Belfast, BT9 5AF',
      email: 'michael.oconnor@example.com',
      phone: '028 9066 1234',
    },
    tenants: [
      {
        full_name: 'Sean Murphy',
        email: 'sean.murphy@example.com',
        phone: '028 9066 5678',
      },
    ],
    property: {
      address: '42 Lisburn Road, Belfast, BT9 7AA',
      description: '2-bedroom terraced house',
    },
    notice_date: noticeDate,
    quit_date: quitDate,
    tenancy_start_date: '2023-06-01',
    tenancy_length_years: tenancyLengthYears,
    notice_period_days: noticePeriod.days,
    notice_period_weeks: noticePeriod.weeks,
    rent: {
      amount: 800,
      period: 'month',
      due_day: '1st',
    },
  };

  // Add ground-specific data
  switch (groundNumber) {
    case 8:
      return {
        ...baseData,
        ...buildGround8SeriousArrears({
          totalArrears: 6400,
          arrearsWeeks: 8,
          rentAmount: 800,
          rentPeriod: 'month',
          arrearsBreakdown: [
            { period: 'June 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'July 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'August 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'September 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'October 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'November 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'December 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'January 2025', amount_due: 800, amount_paid: 0, arrears: 800 },
          ],
        }),
      };

    case 10:
      return {
        ...baseData,
        ...buildGround10RentArrears({
          totalArrears: 2400,
          rentAmount: 800,
          rentPeriod: 'month',
          arrearsBreakdown: [
            { period: 'November 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'December 2024', amount_due: 800, amount_paid: 0, arrears: 800 },
            { period: 'January 2025', amount_due: 800, amount_paid: 0, arrears: 800 },
          ],
        }),
      };

    case 12:
      return {
        ...baseData,
        ...buildGround12Breach({
          breachType: 'Unauthorized subletting',
          breachDescription:
            'The tenant has sublet the property to third parties without the landlord\'s consent, in breach of Clause 8 of the tenancy agreement.',
          breachDate: '2024-12-01',
          evidence: 'Photographs of additional occupants, witness statements from neighbours',
        }),
      };

    case 14:
      return {
        ...baseData,
        ...buildGround14ASB({
          description:
            'The tenant has caused persistent noise nuisance and antisocial behaviour affecting neighbouring properties.',
          incidents: [
            {
              date: '2024-11-15',
              description: 'Loud music until 3am, multiple neighbour complaints',
              witnesses: 'Mrs. Eileen O\'Brien (No. 40), Mr. Patrick Doherty (No. 44)',
            },
            {
              date: '2024-12-01',
              description: 'Party with 30+ people, noise complaints, police called',
              witnesses: 'PSNI incident report #2024-12345',
            },
            {
              date: '2024-12-20',
              description: 'Threatening behaviour towards neighbour',
              witnesses: 'Mrs. O\'Brien, PSNI incident report #2024-12567',
            },
          ],
          evidence: 'PSNI incident reports, written complaints from 3 neighbours, noise diary',
        }),
      };

    default:
      return baseData;
  }
}
