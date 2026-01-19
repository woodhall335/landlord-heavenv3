/**
 * Witness Statement Sections Builder
 *
 * Generates deterministic, court-ready witness statement content for Section 8 eviction cases.
 * This is a form-filling tool that derives narrative sections from case facts.
 *
 * IMPORTANT LEGAL CONSTRAINTS:
 * - We are a form-filling tool, not a verifier of evidence
 * - Do NOT claim documents are attached unless evidence_uploads confirms it
 * - Do NOT assert future facts as certainties (e.g. "at the hearing")
 * - Keep tone factual, neutral, and court-appropriate
 *
 * This module supports:
 * - England only (for now)
 * - Section 8 route (Ground 8 arrears cases initially, extendable to other grounds)
 */

import type { WitnessStatementJSON } from '@/lib/ai/witness-statement-generator';

// =============================================================================
// Types
// =============================================================================

/**
 * Arrears item from the case data
 */
export interface ArrearsItem {
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_owed: number;
}

/**
 * Input data for building witness statement sections.
 * This matches the structure of the complete pack wizard facts / golden fixture.
 */
export interface WitnessStatementSectionsInput {
  // Landlord information
  landlord: {
    full_name: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    postcode?: string;
    has_joint_landlords?: boolean;
  };

  // Tenant information
  tenant: {
    full_name: string;
  };

  // Property information
  property: {
    address_line_1: string;
    address_line_2?: string;
    city?: string;
    postcode?: string;
  };

  // Tenancy information
  tenancy: {
    start_date: string;
    tenancy_type?: 'ast_fixed_term' | 'ast_periodic' | 'assured' | string;
    fixed_term_end_date?: string;
    has_break_clause?: boolean;
    rent_amount: number;
    rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
    rent_due_day?: number;
  };

  // Notice information
  notice: {
    already_served_valid_notice?: boolean;
    served_date: string;
    service_method: string;
    expiry_date: string;
  };

  // Section 8 specific information
  section8: {
    grounds: string[]; // e.g., ['ground_8']
    particulars_text?: string;
  };

  // Arrears information
  arrears?: {
    items?: ArrearsItem[];
    total_arrears: number;
    arrears_months?: number;
  };

  // Evidence uploads (used to determine what documents can be claimed as attached)
  evidence_uploads?: string[];

  // Signing information
  signing?: {
    signatory_name: string;
    capacity?: string;
    signature_date: string;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format a date string to UK legal format (e.g., "15 January 2026")
 */
function formatUKDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format currency in GBP
 */
function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format rent frequency for display
 */
function formatRentFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    weekly: 'weekly',
    fortnightly: 'fortnightly',
    monthly: 'monthly',
    quarterly: 'quarterly',
    yearly: 'annually',
  };
  return frequencyMap[frequency] || frequency;
}

/**
 * Format service method for display
 */
function formatServiceMethod(method: string): string {
  const methodMap: Record<string, string> = {
    first_class_post: 'first class post',
    recorded_delivery: 'recorded delivery',
    signed_for: 'signed for delivery',
    hand_delivered: 'hand delivery',
    hand: 'hand delivery',
    email: 'email',
    left_at_property: 'leaving at the property',
    letterbox: 'posting through the letterbox',
  };
  return methodMap[method.toLowerCase()] || method.replace(/_/g, ' ');
}

/**
 * Format tenancy type for display
 */
function formatTenancyType(tenancyType: string | undefined): string {
  const typeMap: Record<string, string> = {
    ast_fixed_term: 'assured shorthold tenancy (fixed term)',
    ast_periodic: 'assured shorthold tenancy (periodic)',
    assured: 'assured tenancy',
  };
  return typeMap[tenancyType || ''] || 'assured shorthold tenancy';
}

/**
 * Build full property address string
 */
function buildPropertyAddress(property: WitnessStatementSectionsInput['property']): string {
  const parts = [
    property.address_line_1,
    property.address_line_2,
    property.city,
    property.postcode,
  ].filter(Boolean);
  return parts.join(', ');
}

/**
 * Normalize ground code to display format (e.g., 'ground_8' -> 'Ground 8')
 */
function normalizeGroundCode(groundCode: string): string {
  const match = groundCode.match(/ground[_\s]*(\d+[a-z]?)/i);
  if (match) {
    return `Ground ${match[1].toUpperCase()}`;
  }
  return groundCode;
}

/**
 * Get earliest arrears period from items
 */
function getEarliestArrearsPeriod(items: ArrearsItem[] | undefined): string | null {
  if (!items || items.length === 0) return null;

  const sorted = [...items].sort((a, b) =>
    new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
  );

  return sorted[0].period_start;
}

// =============================================================================
// Section Builders
// =============================================================================

/**
 * Build Section 1: INTRODUCTION
 *
 * States:
 * - Claimant identity
 * - Property address
 * - Purpose of the statement
 */
function buildIntroduction(input: WitnessStatementSectionsInput): string {
  const propertyAddress = buildPropertyAddress(input.property);

  return `I am the landlord of the property at ${propertyAddress}. I make this witness statement in support of my claim for possession under section 8 of the Housing Act 1988.`;
}

/**
 * Build Section 2: TENANCY HISTORY
 *
 * Includes:
 * - Tenancy start date
 * - Tenancy type (AST fixed term) and fixed term end date (if applicable)
 * - Rent amount, frequency, and due day
 * - Tenant's obligation to pay rent
 */
function buildTenancyHistory(input: WitnessStatementSectionsInput): string {
  const tenancyType = formatTenancyType(input.tenancy.tenancy_type);
  const rentFrequency = formatRentFrequency(input.tenancy.rent_frequency);
  const rentAmount = formatCurrency(input.tenancy.rent_amount);
  const startDate = formatUKDate(input.tenancy.start_date);

  const lines: string[] = [];

  // Opening line about tenancy
  let tenancyLine = `The tenancy commenced on ${startDate} as an ${tenancyType}`;
  if (input.tenancy.fixed_term_end_date) {
    tenancyLine += ` with a fixed term ending on ${formatUKDate(input.tenancy.fixed_term_end_date)}`;
  }
  tenancyLine += '.';
  lines.push(tenancyLine);

  // Rent details
  let rentLine = `The agreed rent is ${rentAmount} payable ${rentFrequency}`;
  if (input.tenancy.rent_due_day) {
    const ordinalDay = getOrdinalSuffix(input.tenancy.rent_due_day);
    rentLine += `, due on the ${ordinalDay} of each ${input.tenancy.rent_frequency === 'monthly' ? 'month' : 'period'}`;
  }
  rentLine += '.';
  lines.push(rentLine);

  // Obligation statement
  lines.push('The tenant is contractually obligated to pay rent on or before the due date in accordance with the tenancy agreement.');

  return lines.join(' ');
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

/**
 * Build Section 3: GROUNDS FOR POSSESSION
 *
 * For Ground 8 (mandatory arrears):
 * - State Ground 8 is relied upon
 * - Include current arrears total and approximate months
 * - Refer to the attached Schedule of Arrears
 * - Phrase Ground 8 correctly (no assertions about hearing outcomes)
 */
function buildGroundsForPossession(input: WitnessStatementSectionsInput): string {
  const grounds = input.section8.grounds.map(normalizeGroundCode);
  const lines: string[] = [];

  // Opening statement about grounds relied upon
  const groundsList = grounds.join(' and ');
  lines.push(`I am seeking possession of the property relying on ${groundsList} of Schedule 2 to the Housing Act 1988.`);

  // Ground 8 specific content
  if (grounds.some(g => g === 'Ground 8')) {
    const totalArrears = input.arrears?.total_arrears || 0;
    const arrearsMonths = input.arrears?.arrears_months || 0;

    lines.push('');
    lines.push('Ground 8 is a mandatory ground for possession. Ground 8 requires that at least two months\' rent be unpaid both at the date of the notice and at the date of the hearing.');
    lines.push('');

    // Current arrears statement
    if (totalArrears > 0) {
      let arrearsStatement = `As at the date of this statement, the total rent arrears amount to ${formatCurrency(totalArrears)}`;
      if (arrearsMonths > 0) {
        arrearsStatement += `, representing approximately ${arrearsMonths} ${arrearsMonths === 1 ? 'month' : 'months'} of unpaid rent`;
      }
      arrearsStatement += '.';
      lines.push(arrearsStatement);
    }

    // Reference to Schedule of Arrears
    lines.push('A detailed Schedule of Arrears showing the period-by-period breakdown of rent due and payments received is attached to this pack.');
  }

  // Ground 10 specific content (discretionary serious rent arrears)
  if (grounds.some(g => g === 'Ground 10')) {
    lines.push('');
    lines.push('Ground 10 is a discretionary ground which applies where some rent is unpaid both at the date of the notice and at the date of proceedings. The court has discretion to make a possession order if it considers it reasonable to do so.');
  }

  // Ground 11 specific content (persistent delay)
  if (grounds.some(g => g === 'Ground 11')) {
    lines.push('');
    lines.push('Ground 11 is a discretionary ground which applies where the tenant has persistently delayed paying rent, even if no rent is currently outstanding. The court has discretion to make a possession order if it considers it reasonable to do so.');
  }

  return lines.join('\n');
}

/**
 * Build Section 4: TIMELINE OF EVENTS
 *
 * Chronological bullets including:
 * - Tenancy start date
 * - Earliest arrears period start
 * - Notice served date + service method
 * - Notice expiry date (earliest proceedings date)
 */
function buildTimeline(input: WitnessStatementSectionsInput): string {
  const events: { date: string; description: string }[] = [];

  // Tenancy start
  events.push({
    date: input.tenancy.start_date,
    description: 'Tenancy commenced',
  });

  // Earliest arrears period
  const earliestArrears = getEarliestArrearsPeriod(input.arrears?.items);
  if (earliestArrears) {
    events.push({
      date: earliestArrears,
      description: 'First period of unpaid rent began',
    });
  }

  // Notice served
  const serviceMethod = formatServiceMethod(input.notice.service_method);
  events.push({
    date: input.notice.served_date,
    description: `Section 8 Notice served on the tenant by ${serviceMethod}`,
  });

  // Notice expiry
  events.push({
    date: input.notice.expiry_date,
    description: 'Notice period expired (earliest date proceedings could commence)',
  });

  // Signature date (if provided and after notice expiry)
  if (input.signing?.signature_date && input.signing.signature_date >= input.notice.expiry_date) {
    events.push({
      date: input.signing.signature_date,
      description: 'This witness statement prepared',
    });
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format as bullet points
  const bullets = events.map(e => `• ${formatUKDate(e.date)}: ${e.description}`);

  return bullets.join('\n');
}

/**
 * Build Section 5: SUPPORTING EVIDENCE
 *
 * Split into two lists:
 * - "Attached to this pack": Schedule of Arrears, Section 8 Notice, Certificate/Proof of Service
 * - "Not uploaded yet / may be provided later": Tenancy agreement, Rent statements, Correspondence
 *
 * IMPORTANT: Do NOT state a document is attached unless evidence_uploads confirms it.
 */
function buildSupportingEvidence(input: WitnessStatementSectionsInput): string {
  const lines: string[] = [];

  lines.push('The following documents are included in this possession pack:');
  lines.push('');

  // Documents generated as part of the pack (always included)
  const attachedDocs = [
    'Schedule of Arrears (period-by-period breakdown of rent due and payments)',
    'Section 8 Notice (notice seeking possession served on the tenant)',
    'Proof of Service Certificate (template for evidencing service)',
  ];

  lines.push('Attached to this pack:');
  attachedDocs.forEach(doc => {
    lines.push(`• ${doc}`);
  });

  lines.push('');
  lines.push('The following documents may be provided separately to the court:');
  lines.push('');

  // Documents that user may need to provide
  const supplementaryDocs = [
    'Tenancy agreement (original signed agreement)',
    'Bank statements or rent ledger (showing payment history)',
    'Correspondence with tenant regarding arrears',
  ];

  // Check if any evidence was actually uploaded
  const hasUploads = input.evidence_uploads && input.evidence_uploads.length > 0;

  if (hasUploads) {
    lines.push('Documents uploaded separately:');
    input.evidence_uploads!.forEach(upload => {
      lines.push(`• ${upload}`);
    });
    lines.push('');
    lines.push('Additional documents that may be required:');
  } else {
    lines.push('Documents not yet uploaded (may be provided later):');
  }

  supplementaryDocs.forEach(doc => {
    lines.push(`• ${doc}`);
  });

  return lines.join('\n');
}

/**
 * Build rent arrears section (for witness_statement.rent_arrears field)
 *
 * This provides a focused narrative about the arrears for the rent_arrears section
 * of the witness statement, separate from the grounds section.
 */
function buildRentArrearsNarrative(input: WitnessStatementSectionsInput): string | undefined {
  if (!input.arrears || input.arrears.total_arrears <= 0) {
    return undefined;
  }

  const lines: string[] = [];
  const totalArrears = formatCurrency(input.arrears.total_arrears);
  const arrearsMonths = input.arrears.arrears_months || 0;

  lines.push(`The tenant has failed to pay rent as required under the terms of the tenancy agreement. As at the date of this statement, the total arrears amount to ${totalArrears}.`);

  if (arrearsMonths > 0) {
    lines.push(`This represents ${arrearsMonths} ${arrearsMonths === 1 ? 'complete rental period' : 'complete rental periods'} during which no payment, or insufficient payment, has been received.`);
  }

  // Reference arrears schedule
  lines.push('A detailed Schedule of Arrears is attached to this pack, showing the period-by-period breakdown of rent due, payments received, and the running balance of arrears.');

  return lines.join(' ');
}

/**
 * Build the conclusion/statement of truth section
 */
function buildConclusion(): string {
  return 'I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.';
}

// =============================================================================
// Main Builder Function
// =============================================================================

/**
 * Build all witness statement sections from case data.
 *
 * This function generates deterministic, court-ready content for all sections
 * of a witness statement for Section 8 eviction cases.
 *
 * @param input - The case data from wizard facts or complete pack fixture
 * @returns WitnessStatementJSON with all sections populated
 */
export function buildWitnessStatementSections(
  input: WitnessStatementSectionsInput
): WitnessStatementJSON {
  return {
    introduction: buildIntroduction(input),
    tenancy_history: buildTenancyHistory(input),
    rent_arrears: buildRentArrearsNarrative(input),
    conduct_issues: undefined, // Not applicable for Ground 8 arrears cases
    grounds_summary: buildGroundsForPossession(input),
    timeline: buildTimeline(input),
    evidence_references: buildSupportingEvidence(input),
    conclusion: buildConclusion(),
  };
}

/**
 * Extract WitnessStatementSectionsInput from wizard facts.
 *
 * This function handles the mapping from various wizard fact formats
 * to the standardized input structure.
 *
 * @param wizardFacts - Raw wizard facts (various formats supported)
 * @returns Normalized input for buildWitnessStatementSections
 */
export function extractWitnessStatementSectionsInput(
  wizardFacts: any
): WitnessStatementSectionsInput {
  // Handle different data structures (fixture format vs CaseFacts format)
  const landlord = wizardFacts.landlord || wizardFacts.parties?.landlord || {};
  const tenant = wizardFacts.tenant || wizardFacts.parties?.tenants?.[0] || {};
  const property = wizardFacts.property || {};
  const tenancy = wizardFacts.tenancy || {};
  const notice = wizardFacts.notice || {};
  const section8 = wizardFacts.section8 || {};
  const arrears = wizardFacts.arrears || wizardFacts.issues?.rent_arrears || {};
  const signing = wizardFacts.signing || {};

  // Extract grounds from various possible locations
  const grounds = section8.grounds ||
    wizardFacts.section8_grounds ||
    wizardFacts.issues?.section8_grounds?.selected_grounds ||
    [];

  // Extract evidence uploads
  const evidenceUploads = wizardFacts.evidence_uploads ||
    wizardFacts.evidence?.files?.map((f: any) => f.name) ||
    [];

  return {
    landlord: {
      full_name: landlord.full_name || landlord.name || '',
      address_line_1: landlord.address_line_1 || landlord.address_line1 || '',
      address_line_2: landlord.address_line_2 || landlord.address_line2 || '',
      city: landlord.city || '',
      postcode: landlord.postcode || '',
      has_joint_landlords: landlord.has_joint_landlords || false,
    },
    tenant: {
      full_name: tenant.full_name || tenant.name || '',
    },
    property: {
      address_line_1: property.address_line_1 || property.address_line1 || '',
      address_line_2: property.address_line_2 || property.address_line2 || '',
      city: property.city || '',
      postcode: property.postcode || '',
    },
    tenancy: {
      start_date: tenancy.start_date || '',
      tenancy_type: tenancy.tenancy_type || 'ast_fixed_term',
      fixed_term_end_date: tenancy.fixed_term_end_date || undefined,
      has_break_clause: tenancy.has_break_clause || false,
      rent_amount: tenancy.rent_amount || 0,
      rent_frequency: tenancy.rent_frequency || 'monthly',
      rent_due_day: tenancy.rent_due_day || undefined,
    },
    notice: {
      already_served_valid_notice: notice.already_served_valid_notice || false,
      served_date: notice.served_date || notice.notice_date || '',
      service_method: notice.service_method || 'first_class_post',
      expiry_date: notice.expiry_date || notice.notice_expiry_date || '',
    },
    section8: {
      grounds: Array.isArray(grounds) ? grounds : [grounds].filter(Boolean),
      particulars_text: section8.particulars_text || '',
    },
    arrears: {
      items: arrears.items || arrears.arrears_items || [],
      total_arrears: arrears.total_arrears || arrears.arrears_total || 0,
      arrears_months: arrears.arrears_months || undefined,
    },
    evidence_uploads: evidenceUploads,
    signing: {
      signatory_name: signing.signatory_name || landlord.full_name || landlord.name || '',
      capacity: signing.capacity || 'claimant_landlord',
      signature_date: signing.signature_date || '',
    },
  };
}
