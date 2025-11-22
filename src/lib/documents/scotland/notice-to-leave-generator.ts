/**
 * Notice to Leave Generator - Scotland
 *
 * Generates Notice to Leave documents for Scotland under
 * the Private Housing (Tenancies) (Scotland) Act 2016.
 *
 * This is Scotland's equivalent to England's Section 8 and Section 21 notices.
 */

import { generateDocument, GeneratedDocument } from '../generator';

// ============================================================================
// TYPES
// ============================================================================

export interface NoticeToLeaveGround {
  number: number;
  title: string;
  legal_basis: string;
  particulars: string;
  supporting_evidence?: string;
}

export interface RentArrearsBreakdown {
  period: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
}

export interface ASBIncident {
  date: string;
  time?: string;
  description: string;
  witnesses?: string[];
}

export interface Warning {
  date: string;
  method: string; // e.g., "Letter", "Email", "Verbal"
  description: string;
}

export interface NoticeToLeaveData {
  // Document metadata
  generation_date?: string;
  generation_timestamp?: string;
  document_id?: string;

  // Landlord details
  landlord_full_name: string;
  landlord_2_name?: string; // Joint landlord
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;
  landlord_reg_number?: string; // Landlord registration number

  // Tenant details
  tenant_full_name: string;
  tenant_2_name?: string; // Joint tenant

  // Property
  property_address: string;

  // Notice dates
  notice_date: string; // Date notice is served
  earliest_leaving_date: string; // Earliest date tenant can be required to leave
  earliest_tribunal_date: string; // Earliest date landlord can apply to Tribunal
  notice_period_days: 28 | 84; // 28 days or 84 days depending on ground

  // Grounds
  grounds: NoticeToLeaveGround[];

  // Ground-specific flags
  ground_1_claimed?: boolean; // Rent arrears
  ground_2_claimed?: boolean; // Breach of tenancy
  ground_3_claimed?: boolean; // Antisocial behaviour
  ground_4_claimed?: boolean; // Landlord intends to occupy
  ground_5_claimed?: boolean; // Landlord intends to sell
  ground_6_claimed?: boolean; // Refurbishment
  ground_7_claimed?: boolean; // HMO change
  ground_8_claimed?: boolean; // Non-residential use
  ground_11_claimed?: boolean; // Not occupying as principal home
  ground_12_claimed?: boolean; // Criminal conviction
  ground_13_claimed?: boolean; // Mortgage lender requiring possession
  ground_18_claimed?: boolean; // False statement

  // Ground 1 - Rent Arrears (with pre-action requirements)
  rent_amount?: number;
  rent_period?: string;
  total_arrears?: number;
  arrears_date?: string;
  arrears_duration_months?: number;
  arrears_duration_days?: number;
  arrears_breakdown?: RentArrearsBreakdown[];
  last_payment_date?: string;
  last_payment_amount?: number;
  pre_action_evidence?: string;

  // Ground 2 - Breach of Tenancy
  tenancy_clause?: string;
  breach_type?: string;
  breach_description?: string;
  breach_date?: string;
  breach_continuing?: boolean;
  breach_remedied?: boolean;
  warnings_given?: boolean;
  warnings_list?: Warning[];

  // Ground 3 - Antisocial Behaviour
  asb_type?: string;
  asb_description?: string;
  asb_incidents?: ASBIncident[];
  police_involved?: boolean;
  police_call_count?: number;
  police_crime_numbers?: string[];
  council_involved?: boolean;
  council_name?: string;
  council_reference?: string;

  // Ground 4 - Landlord Intends to Occupy
  reason_for_occupying?: string;
  current_residence?: string;
  occupation_timescale?: string;

  // Ground 5 - Landlord Intends to Sell
  sale_intention_details?: string;
  estate_agent?: boolean;
  estate_agent_name?: string;
  estate_agent_date?: string;
  marketing_planned?: boolean;
  marketing_details?: string;

  // Ground 6 - Refurbishment
  refurbishment_description?: string;
  vacant_possession_reason?: string;
  planning_permission?: boolean;
  planning_permission_date?: string;
  planning_reference?: string;
  building_warrant?: boolean;
  building_warrant_details?: string;
  contractor?: boolean;
  contractor_name?: string;
  works_start_date?: string;
  works_duration?: string;

  // Ground 11 - Not Occupying as Principal Home
  non_occupation_evidence?: string;
  duration_not_occupying?: string;
  alternative_residence?: string;

  // Ground 12 - Criminal Conviction
  tenant_convicted?: boolean;
  conviction_details?: string;
  court_name?: string;
  conviction_date?: string;
  offence_description?: string;
  sentence?: string;
  connection_to_property?: boolean;
  property_connection?: string;

  // Ground 13 - Mortgage Lender Requiring Possession
  lender_name?: string;
  mortgage_date?: string;
  tenancy_start_date?: string;
  lender_notice?: boolean;
  lender_notice_date?: string;

  // Ground 18 - False Statement
  false_statement?: string;
  statement_context?: string;
  true_facts?: string;
  materiality_explanation?: string;

  // Deposit information
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_scheme?: string;
  deposit_scheme_details?: string;
  deposit_reference?: string;

  // Council information (for homelessness advice)
  council_phone?: string;

  // Preview mode
  is_preview?: boolean;
}

// ============================================================================
// GROUND DEFINITIONS
// ============================================================================

/**
 * All 18 grounds for eviction in Scotland
 * Under Schedule 3 of the Private Housing (Tenancies) (Scotland) Act 2016
 */
const GROUND_DEFINITIONS: Record<
  number,
  { title: string; legal_basis: string; notice_period: 28 | 84; discretionary: boolean }
> = {
  1: {
    title: 'Rent Arrears',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 1',
    notice_period: 28,
    discretionary: true, // ALL grounds in Scotland are discretionary
  },
  2: {
    title: 'Breach of Tenancy Obligation',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 2',
    notice_period: 28,
    discretionary: true,
  },
  3: {
    title: 'Antisocial Behaviour',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 3',
    notice_period: 28,
    discretionary: true,
  },
  4: {
    title: 'Landlord Intends to Occupy',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 4',
    notice_period: 84,
    discretionary: true,
  },
  5: {
    title: 'Landlord Intends to Sell',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 5',
    notice_period: 84,
    discretionary: true,
  },
  6: {
    title: 'Property to be Refurbished',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 6',
    notice_period: 84,
    discretionary: true,
  },
  7: {
    title: 'HMO Licensing Issue',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 7',
    notice_period: 84,
    discretionary: true,
  },
  8: {
    title: 'Property for Non-Residential Use',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 8',
    notice_period: 84,
    discretionary: true,
  },
  9: {
    title: 'Overcrowding Statutory Notice',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 9',
    notice_period: 28,
    discretionary: true,
  },
  10: {
    title: 'Landlord Ceasing to be Registered',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 10',
    notice_period: 28,
    discretionary: true,
  },
  11: {
    title: 'Not Occupying as Principal Home',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 11',
    notice_period: 28,
    discretionary: true,
  },
  12: {
    title: 'Criminal Conviction',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 12',
    notice_period: 28,
    discretionary: true,
  },
  13: {
    title: 'Mortgage Lender Requiring Possession',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 13',
    notice_period: 28,
    discretionary: true,
  },
  14: {
    title: 'Religious Purpose Property',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 14',
    notice_period: 84,
    discretionary: true,
  },
  15: {
    title: 'Tenant No Longer Employee',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 15',
    notice_period: 84,
    discretionary: true,
  },
  16: {
    title: 'Temporary Accommodation',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 16',
    notice_period: 28,
    discretionary: true,
  },
  17: {
    title: 'Former Home Due to Work',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 17',
    notice_period: 84,
    discretionary: true,
  },
  18: {
    title: 'False Statement to Obtain Tenancy',
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 18',
    notice_period: 28,
    discretionary: true,
  },
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates Notice to Leave data
 */
export function validateNoticeToLeaveData(data: NoticeToLeaveData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.landlord_full_name) errors.push('Landlord name is required');
  if (!data.landlord_address) errors.push('Landlord address is required');
  if (!data.tenant_full_name) errors.push('Tenant name is required');
  if (!data.property_address) errors.push('Property address is required');
  if (!data.notice_date) errors.push('Notice date is required');
  if (!data.earliest_leaving_date) errors.push('Earliest leaving date is required');
  if (!data.earliest_tribunal_date) errors.push('Earliest tribunal application date is required');

  // Must have at least one ground
  if (!data.grounds || data.grounds.length === 0) {
    errors.push('At least one eviction ground must be specified');
  }

  // Validate notice period (28 or 84 days)
  if (data.notice_period_days !== 28 && data.notice_period_days !== 84) {
    errors.push('Notice period must be either 28 or 84 days');
  }

  // Ground 1 - Rent arrears requires pre-action requirements
  if (data.ground_1_claimed) {
    if (!data.total_arrears) errors.push('Ground 1 (Rent Arrears): Total arrears amount is required');
    if (!data.arrears_breakdown || data.arrears_breakdown.length === 0) {
      errors.push('Ground 1 (Rent Arrears): Arrears breakdown is required to demonstrate pre-action compliance');
    }
  }

  // Ground 4 - Landlord intends to occupy
  if (data.ground_4_claimed) {
    if (!data.reason_for_occupying) {
      errors.push('Ground 4 (Landlord Intends to Occupy): Reason for occupation is required');
    }
    if (data.notice_period_days !== 84) {
      errors.push('Ground 4 requires 84 days notice');
    }
  }

  // Ground 5 - Landlord intends to sell
  if (data.ground_5_claimed) {
    if (!data.sale_intention_details) {
      errors.push('Ground 5 (Landlord Intends to Sell): Sale intention details are required');
    }
    if (data.notice_period_days !== 84) {
      errors.push('Ground 5 requires 84 days notice');
    }
  }

  // Ground 6 - Refurbishment
  if (data.ground_6_claimed) {
    if (!data.refurbishment_description) {
      errors.push('Ground 6 (Refurbishment): Description of refurbishment works is required');
    }
    if (!data.vacant_possession_reason) {
      errors.push('Ground 6 (Refurbishment): Explanation of why vacant possession is required');
    }
    if (data.notice_period_days !== 84) {
      errors.push('Ground 6 requires 84 days notice');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// BUILDER FUNCTIONS
// ============================================================================

/**
 * Creates a NoticeToLeaveGround object
 */
export function buildGround(
  groundNumber: number,
  particulars: string,
  supportingEvidence?: string
): NoticeToLeaveGround {
  const def = GROUND_DEFINITIONS[groundNumber];
  if (!def) {
    throw new Error(`Invalid ground number: ${groundNumber}. Must be 1-18.`);
  }

  return {
    number: groundNumber,
    title: def.title,
    legal_basis: def.legal_basis,
    particulars,
    supporting_evidence: supportingEvidence,
  };
}

/**
 * Builds Ground 1 - Rent Arrears (with pre-action requirements)
 */
export function buildGround1RentArrears(params: {
  totalArrears: number;
  rentAmount: number;
  rentPeriod: string;
  arrearsBreakdown: RentArrearsBreakdown[];
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  preActionEvidence?: string;
}): Partial<NoticeToLeaveData> {
  const { totalArrears, rentAmount, rentPeriod, arrearsBreakdown, lastPaymentDate, lastPaymentAmount, preActionEvidence } = params;

  const arrearsMonths = totalArrears / rentAmount;
  const arrearsDays = Math.floor(arrearsMonths * 30);

  return {
    ground_1_claimed: true,
    notice_period_days: 28,
    rent_amount: rentAmount,
    rent_period: rentPeriod,
    total_arrears: totalArrears,
    arrears_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    arrears_duration_months: Math.floor(arrearsMonths),
    arrears_duration_days: arrearsDays,
    arrears_breakdown: arrearsBreakdown,
    last_payment_date: lastPaymentDate,
    last_payment_amount: lastPaymentAmount,
    pre_action_evidence: preActionEvidence,
    grounds: [
      buildGround(
        1,
        `The tenant owes £${totalArrears.toFixed(2)} in rent arrears as of ${new Date().toLocaleDateString('en-GB')}. ` +
          `The current rent is £${rentAmount} per ${rentPeriod}. The arrears have accumulated over ${Math.floor(arrearsMonths)} months. ` +
          `Full pre-action requirements have been completed as required by the Pre-Action Requirements (Notice to Leave and Notice of Proceedings) (Scotland) Regulations 2020.`,
        preActionEvidence
      ),
    ],
  };
}

/**
 * Builds Ground 3 - Antisocial Behaviour
 */
export function buildGround3ASB(params: {
  asbType: string;
  asbDescription: string;
  incidents: ASBIncident[];
  policeInvolved?: boolean;
  policeCrimeNumbers?: string[];
  councilInvolved?: boolean;
  councilName?: string;
  councilReference?: string;
}): Partial<NoticeToLeaveData> {
  const { asbType, asbDescription, incidents, policeInvolved, policeCrimeNumbers, councilInvolved, councilName, councilReference } = params;

  return {
    ground_3_claimed: true,
    notice_period_days: 28,
    asb_type: asbType,
    asb_description: asbDescription,
    asb_incidents: incidents,
    police_involved: policeInvolved,
    police_call_count: policeCrimeNumbers?.length || 0,
    police_crime_numbers: policeCrimeNumbers,
    council_involved: councilInvolved,
    council_name: councilName,
    council_reference: councilReference,
    grounds: [
      buildGround(
        3,
        `The tenant has engaged in antisocial behaviour. ${asbDescription} There have been ${incidents.length} documented incident(s).` +
          (policeInvolved ? ` Police have been involved on ${policeCrimeNumbers?.length || 0} occasion(s).` : ''),
        policeInvolved ? `Police crime reference numbers: ${policeCrimeNumbers?.join(', ')}` : undefined
      ),
    ],
  };
}

/**
 * Builds Ground 4 - Landlord Intends to Occupy
 */
export function buildGround4LandlordOccupy(params: {
  reasonForOccupying: string;
  currentResidence?: string;
  occupationTimescale?: string;
}): Partial<NoticeToLeaveData> {
  const { reasonForOccupying, currentResidence, occupationTimescale } = params;

  return {
    ground_4_claimed: true,
    notice_period_days: 84,
    reason_for_occupying: reasonForOccupying,
    current_residence: currentResidence,
    occupation_timescale: occupationTimescale,
    grounds: [
      buildGround(
        4,
        `The landlord intends to occupy the property as their only or principal home (or that of their spouse/civil partner). ` +
          `${reasonForOccupying}` +
          (occupationTimescale ? ` The landlord intends to move in by ${occupationTimescale}.` : ''),
        'WARNING: If the landlord does not occupy the property within 3 months of the tenant leaving, the tenant may apply for a wrongful termination order (up to 6 months rent).'
      ),
    ],
  };
}

/**
 * Builds Ground 5 - Landlord Intends to Sell
 */
export function buildGround5LandlordSell(params: {
  saleIntentionDetails: string;
  estateAgent?: string;
  estateAgentDate?: string;
  marketingDetails?: string;
}): Partial<NoticeToLeaveData> {
  const { saleIntentionDetails, estateAgent, estateAgentDate, marketingDetails } = params;

  return {
    ground_5_claimed: true,
    notice_period_days: 84,
    sale_intention_details: saleIntentionDetails,
    estate_agent: !!estateAgent,
    estate_agent_name: estateAgent,
    estate_agent_date: estateAgentDate,
    marketing_planned: !!marketingDetails,
    marketing_details: marketingDetails,
    grounds: [
      buildGround(
        5,
        `The landlord intends to sell the property. ${saleIntentionDetails}` +
          (estateAgent ? ` Estate agent ${estateAgent} has been instructed as of ${estateAgentDate}.` : ''),
        'WARNING: If the property is not marketed for sale within 3 months of the tenant leaving, the tenant may apply for a wrongful termination order (up to 6 months rent).'
      ),
    ],
  };
}

// ============================================================================
// GENERATOR FUNCTION
// ============================================================================

/**
 * Generates a Notice to Leave document for Scotland
 */
export async function generateNoticeToLeave(
  data: NoticeToLeaveData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'html'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validateNoticeToLeaveData(data);
  if (!validation.valid) {
    throw new Error(`Notice to Leave validation failed:\n${validation.errors.join('\n')}`);
  }

  // Enrich data with defaults
  const enrichedData: NoticeToLeaveData = {
    ...data,
    generation_date: data.generation_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
    document_id: data.document_id || `NTL-SCOTLAND-${Date.now()}`,
    is_preview: isPreview,
  };

  // Generate from template
  return generateDocument({
    templatePath: 'uk/scotland/templates/notice_to_leave.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates earliest leaving date based on notice period
 */
export function calculateEarliestLeavingDate(noticeDate: Date, noticePeriod: 28 | 84): Date {
  const leavingDate = new Date(noticeDate);
  leavingDate.setDate(leavingDate.getDate() + noticePeriod);
  return leavingDate;
}

/**
 * Returns the required notice period for a given ground
 */
export function getNoticePeriodForGround(groundNumber: number): 28 | 84 {
  const def = GROUND_DEFINITIONS[groundNumber];
  if (!def) {
    throw new Error(`Invalid ground number: ${groundNumber}`);
  }
  return def.notice_period;
}

/**
 * Creates sample Notice to Leave data for testing
 */
export function createSampleNoticeToLeaveData(): NoticeToLeaveData {
  const noticeDate = new Date('2025-01-15');
  const earliestLeavingDate = calculateEarliestLeavingDate(noticeDate, 28);

  return {
    // Landlord
    landlord_full_name: 'Sarah MacDonald',
    landlord_address: '123 Princes Street, Edinburgh, EH2 4AA',
    landlord_email: 'sarah.macdonald@example.com',
    landlord_phone: '0131 123 4567',
    landlord_reg_number: '123456/230/12345',

    // Tenant
    tenant_full_name: 'James Murray',

    // Property
    property_address: '45 Rose Street, Edinburgh, EH2 2NG',

    // Dates
    notice_date: '15 January 2025',
    earliest_leaving_date: earliestLeavingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    earliest_tribunal_date: earliestLeavingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    notice_period_days: 28,

    // Ground 1 - Rent arrears
    ...buildGround1RentArrears({
      totalArrears: 3600,
      rentAmount: 1200,
      rentPeriod: 'month',
      arrearsBreakdown: [
        { period: 'November 2024', amount_due: 1200, amount_paid: 0, balance: 1200 },
        { period: 'December 2024', amount_due: 1200, amount_paid: 0, balance: 2400 },
        { period: 'January 2025', amount_due: 1200, amount_paid: 0, balance: 3600 },
      ],
      lastPaymentDate: '1 October 2024',
      lastPaymentAmount: 1200,
      preActionEvidence: 'Rent statements provided on 5 Nov 2024, 10 Dec 2024, 5 Jan 2025. Payment plan offered on 20 Dec 2024.',
    }),

    // Deposit
    deposit_protected: true,
    deposit_amount: 1800,
    deposit_scheme: 'SafeDeposits Scotland',

    // Council
    council_name: 'City of Edinburgh Council',
    council_phone: '0131 200 2000',

    // Metadata
    document_id: 'NTL-SAMPLE-001',
  };
}
