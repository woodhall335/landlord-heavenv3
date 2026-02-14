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

  // Compliance information (for verified compliance assertions)
  // IMPORTANT: Only assert compliance if verified evidence fields are true
  compliance?: {
    deposit_protected?: boolean;
    deposit_scheme?: string;
    deposit_protection_date?: string;
    gas_safety_provided?: boolean;
    gas_safety_date?: string;
    epc_provided?: boolean;
    epc_rating?: string;
    how_to_rent_provided?: boolean;
    eicr_provided?: boolean;
  };

  // Arrears at specific dates (for Ground 8 proof requirements)
  arrearsAtNoticeDate?: number;
  arrearsAtStatementDate?: number;

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
 * - Confirm arrears at notice date (Ground 8 requirement)
 * - Confirm arrears at date of statement generation
 * - Add commitment to provide updated schedule before hearing
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
    const arrearsAtNotice = input.arrearsAtNoticeDate ?? totalArrears;
    const arrearsAtStatement = input.arrearsAtStatementDate ?? totalArrears;
    const rentAmount = input.tenancy.rent_amount || 0;

    // Calculate Ground 8 threshold (2 months' rent)
    const ground8Threshold = rentAmount * 2;

    // Calculate months equivalent at notice date
    const monthsAtNotice = rentAmount > 0 ? arrearsAtNotice / rentAmount : 0;

    lines.push('');
    lines.push('Ground 8 is a mandatory ground for possession. Ground 8 requires that at least two months\' rent be unpaid both at the date of the notice and at the date of the hearing.');

    // Arrears at notice date with months equivalent and threshold comparison (Ground 8 proof requirement #1)
    if (input.notice.served_date && arrearsAtNotice > 0) {
      lines.push('');
      let noticeStatement = `At the date of service of the Section 8 Notice (${formatUKDate(input.notice.served_date)}), the total rent arrears stood at ${formatCurrency(arrearsAtNotice)}`;
      if (monthsAtNotice > 0) {
        noticeStatement += `, representing approximately ${monthsAtNotice.toFixed(1)} months' rent`;
      }
      noticeStatement += '.';
      lines.push(noticeStatement);

      // Add threshold comparison if we have valid rent amount
      if (ground8Threshold > 0 && arrearsAtNotice >= ground8Threshold) {
        lines.push(`This significantly exceeds the Ground 8 threshold of 2 months' rent (${formatCurrency(ground8Threshold)}).`);
      }
    }

    // Arrears at statement date (Ground 8 proof requirement #2)
    if (arrearsAtStatement > 0) {
      lines.push('');
      const statementDate = input.signing?.signature_date || new Date().toISOString().split('T')[0];
      let arrearsStatement = `As at the date of this statement (${formatUKDate(statementDate)}), the total rent arrears amount to ${formatCurrency(arrearsAtStatement)}`;
      if (arrearsMonths > 0) {
        arrearsStatement += `, representing approximately ${arrearsMonths.toFixed(1)} ${arrearsMonths === 1 ? 'month' : 'months'} of unpaid rent`;
      }
      arrearsStatement += '.';
      lines.push(arrearsStatement);
    }

    // Reference to Schedule of Arrears
    lines.push('');
    lines.push('A detailed Schedule of Arrears showing the period-by-period breakdown of rent due and payments received is attached to this pack.');

    // Commitment to provide updated schedule (Ground 8 proof requirement #3)
    lines.push('');
    lines.push('I will provide an updated Schedule of Arrears to the court before the hearing to confirm the arrears position at that date.');
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
 * Build Compliance Section (optional)
 *
 * CRITICAL RULE: Only assert compliance if verified evidence fields are true.
 * If compliance data is unknown/missing, either omit the section entirely
 * or use neutral wording like "I am obtaining/providing..."
 *
 * Do NOT auto-assert compliance (deposit/gas/EICR/EPC/How to Rent) unless
 * there is verified evidence.
 */
function buildComplianceSection(input: WitnessStatementSectionsInput): string | undefined {
  const compliance = input.compliance;
  if (!compliance) {
    return undefined; // No compliance data - omit section entirely
  }

  const lines: string[] = [];
  let hasVerifiedCompliance = false;

  // Deposit protection - only assert if verified
  if (compliance.deposit_protected === true && compliance.deposit_scheme) {
    hasVerifiedCompliance = true;
    let depositStatement = `The tenant's deposit is protected with ${compliance.deposit_scheme}`;
    if (compliance.deposit_protection_date) {
      depositStatement += ` and was protected on ${formatUKDate(compliance.deposit_protection_date)}`;
    }
    depositStatement += '.';
    lines.push(depositStatement);
  }

  // Gas safety - only assert if verified
  if (compliance.gas_safety_provided === true) {
    hasVerifiedCompliance = true;
    let gasStatement = 'A valid Gas Safety Certificate was provided to the tenant';
    if (compliance.gas_safety_date) {
      gasStatement += ` on ${formatUKDate(compliance.gas_safety_date)}`;
    }
    gasStatement += '.';
    lines.push(gasStatement);
  }

  // EPC - only assert if verified
  if (compliance.epc_provided === true) {
    hasVerifiedCompliance = true;
    let epcStatement = 'An Energy Performance Certificate (EPC) was provided to the tenant';
    if (compliance.epc_rating) {
      epcStatement += ` with a rating of ${compliance.epc_rating}`;
    }
    epcStatement += '.';
    lines.push(epcStatement);
  }

  // How to Rent guide - only assert if verified
  if (compliance.how_to_rent_provided === true) {
    hasVerifiedCompliance = true;
    lines.push('The "How to Rent" guide was provided to the tenant as required.');
  }

  // EICR - only assert if verified
  if (compliance.eicr_provided === true) {
    hasVerifiedCompliance = true;
    lines.push('An Electrical Installation Condition Report (EICR) was provided to the tenant.');
  }

  // Only return the section if we have at least one verified compliance item
  if (hasVerifiedCompliance && lines.length > 0) {
    return 'Regarding the landlord\'s compliance obligations:\n\n' + lines.join('\n');
  }

  // Return undefined to omit the section if nothing is verified
  return undefined;
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
 * Split into structured exhibit references:
 * - Pack documents (always included): Schedule of Arrears, Section 8 Notice, Proof of Service
 * - Verified compliance documents (if confirmed uploaded)
 * - Documents for the landlord to provide separately
 *
 * IMPORTANT: Do NOT state a document is attached unless evidence_uploads or
 * compliance fields confirm it. This prevents false claims about attached documents.
 */
function buildSupportingEvidence(input: WitnessStatementSectionsInput): string {
  const lines: string[] = [];
  const compliance = input.compliance;

  // === PACK DOCUMENTS (always generated as part of this pack) ===
  lines.push('The following documents are included in this possession pack:');
  lines.push('');

  // Court forms (always included in court pack)
  lines.push('Court Forms:');
  lines.push('• Form N5 - Claim for Possession of Property');
  lines.push('• Form N119 - Particulars of Claim for Possession');
  lines.push('');

  // Notice documents (always included)
  lines.push('Notice Documents:');
  lines.push('• Section 8 Notice (Form 3) - Notice seeking possession served on the tenant');
  lines.push('• Proof of Service Certificate - Template for evidencing service');
  lines.push('');

  // Arrears documents (included if arrears case)
  if (input.arrears && input.arrears.total_arrears > 0) {
    lines.push('Arrears Documentation:');
    lines.push('• Schedule of Arrears - Period-by-period breakdown of rent due, payments received, and running balance');
    lines.push('');
  }

  // === VERIFIED UPLOADED/CONFIRMED DOCUMENTS ===
  const verifiedDocs: string[] = [];

  // Check evidence uploads - filter out undefined/null/empty values to prevent "undefined" in output
  if (input.evidence_uploads && input.evidence_uploads.length > 0) {
    const validUploads = input.evidence_uploads.filter(
      (upload): upload is string => typeof upload === 'string' && upload.trim().length > 0
    );
    verifiedDocs.push(...validUploads);
  }

  // Check compliance-related uploads (only if explicitly verified)
  if (compliance?.deposit_protected === true && compliance.deposit_scheme) {
    verifiedDocs.push(`Tenancy Deposit Certificate (${compliance.deposit_scheme})`);
  }
  if (compliance?.gas_safety_provided === true) {
    verifiedDocs.push('Gas Safety Certificate (CP12)');
  }
  if (compliance?.epc_provided === true) {
    verifiedDocs.push(`Energy Performance Certificate (EPC)${compliance.epc_rating ? ` - Rating ${compliance.epc_rating}` : ''}`);
  }
  if (compliance?.eicr_provided === true) {
    verifiedDocs.push('Electrical Installation Condition Report (EICR)');
  }
  if (compliance?.how_to_rent_provided === true) {
    verifiedDocs.push('"How to Rent" Guide - Government prescribed information');
  }

  // Filter final list to ensure no undefined/null values and render only if we have valid docs
  const filteredVerifiedDocs = verifiedDocs.filter(
    (doc): doc is string => typeof doc === 'string' && doc.trim().length > 0
  );

  if (filteredVerifiedDocs.length > 0) {
    lines.push('Verified Documents Available:');
    filteredVerifiedDocs.forEach(doc => {
      lines.push(`• ${doc}`);
    });
    lines.push('');
  }

  // === DOCUMENTS TO BE PROVIDED SEPARATELY ===
  lines.push('The following documents may be provided separately to the court:');
  lines.push('');

  const supplementaryDocs = [
    'Tenancy agreement (original signed agreement)',
    'Bank statements or rent ledger (showing payment history)',
    'Correspondence with tenant regarding arrears',
  ];

  // Add compliance docs to supplementary if NOT verified
  if (!(compliance?.deposit_protected === true && compliance.deposit_scheme)) {
    supplementaryDocs.push('Tenancy deposit protection certificate');
  }
  if (compliance?.gas_safety_provided !== true) {
    supplementaryDocs.push('Gas Safety Certificate (if applicable)');
  }
  if (compliance?.epc_provided !== true) {
    supplementaryDocs.push('Energy Performance Certificate (EPC)');
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
 * Extract WitnessStatementSectionsInput from wizard facts or eviction case data.
 *
 * This function handles the mapping from various data formats
 * to the standardized input structure.
 *
 * Supports:
 * - Nested wizard facts format (landlord.full_name, property.address_line_1)
 * - Flat eviction case format (landlord_full_name, property_address_line1)
 * - Mixed formats
 *
 * @param data - Raw wizard facts or eviction case data (various formats supported)
 * @returns Normalized input for buildWitnessStatementSections
 */
export function extractWitnessStatementSectionsInput(
  data: any
): WitnessStatementSectionsInput {
  // Handle different data structures (fixture format vs CaseFacts format vs EvictionCase format)
  // Prioritize nested format, fall back to flat format (eviction case format)

  // Landlord data extraction
  const nestedLandlord = data.landlord || data.parties?.landlord || {};
  const landlordFullName =
    nestedLandlord.full_name ||
    nestedLandlord.name ||
    data.landlord_full_name ||
    '';
  const landlordAddressLine1 =
    nestedLandlord.address_line_1 ||
    nestedLandlord.address_line1 ||
    data.landlord_address_line1 ||
    '';
  const landlordAddressLine2 =
    nestedLandlord.address_line_2 ||
    nestedLandlord.address_line2 ||
    '';
  const landlordCity =
    nestedLandlord.city ||
    data.landlord_address_town ||
    '';
  const landlordPostcode =
    nestedLandlord.postcode ||
    data.landlord_address_postcode ||
    '';

  // Tenant data extraction
  const nestedTenant = data.tenant || data.parties?.tenants?.[0] || {};
  const tenantFullName =
    nestedTenant.full_name ||
    nestedTenant.name ||
    data.tenant_full_name ||
    '';

  // Property data extraction
  const nestedProperty = data.property || {};
  const propertyAddressLine1 =
    nestedProperty.address_line_1 ||
    nestedProperty.address_line1 ||
    data.property_address_line1 ||
    '';
  const propertyAddressLine2 =
    nestedProperty.address_line_2 ||
    nestedProperty.address_line2 ||
    '';
  const propertyCity =
    nestedProperty.city ||
    data.property_address_town ||
    '';
  const propertyPostcode =
    nestedProperty.postcode ||
    data.property_address_postcode ||
    '';
  // For full address fallback
  const fullPropertyAddress = data.property_address || '';

  // Tenancy data extraction
  const nestedTenancy = data.tenancy || {};
  const tenancyStartDate =
    nestedTenancy.start_date ||
    data.tenancy_start_date ||
    '';
  const rentAmount =
    nestedTenancy.rent_amount ||
    data.rent_amount ||
    0;
  const rentFrequency =
    nestedTenancy.rent_frequency ||
    data.rent_frequency ||
    'monthly';
  const rentDueDay =
    nestedTenancy.rent_due_day ||
    data.payment_day ||
    undefined;
  const tenancyType =
    nestedTenancy.tenancy_type ||
    (data.tenancy_type === 'fixed_term' ? 'ast_fixed_term' :
      data.tenancy_type === 'periodic' ? 'ast_periodic' : 'ast_fixed_term');
  const fixedTermEndDate =
    nestedTenancy.fixed_term_end_date ||
    data.fixed_term_end_date ||
    undefined;

  // Notice data extraction
  const nestedNotice = data.notice || {};
  const noticeServedDate =
    nestedNotice.served_date ||
    nestedNotice.notice_date ||
    data.notice_served_date ||
    data.notice_date ||
    '';
  const noticeExpiryDate =
    nestedNotice.expiry_date ||
    nestedNotice.notice_expiry_date ||
    data.notice_expiry_date ||
    '';
  const serviceMethod =
    nestedNotice.service_method ||
    data.service_method ||
    data.notice_service_method ||
    'first_class_post';

  // Section 8 / Grounds extraction
  const nestedSection8 = data.section8 || {};
  const section8Grounds =
    data.groundsReliedUpon ||
    nestedSection8.grounds ||
    data.section8_grounds ||
    data.issues?.section8_grounds?.selected_grounds ||
    // Extract from EvictionCase grounds array
    (Array.isArray(data.grounds) ? data.grounds.map((g: any) =>
      typeof g === 'string' ? g : g.code || g.ground_code || ''
    ) : []);

  // Arrears data extraction
  const nestedArrears = data.arrears || data.issues?.rent_arrears || {};
  const arrearsTotal =
    nestedArrears.total_arrears ||
    nestedArrears.arrears_total ||
    data.current_arrears ||
    0;
  const arrearsItems =
    nestedArrears.items ||
    nestedArrears.arrears_items ||
    data.arrears_breakdown ||
    [];
  const arrearsAtNoticeDate =
    data.arrearsAtNoticeDate ||
    data.arrears_at_notice_date ||
    undefined;

  // Calculate arrears months if not provided
  let arrearsMonths = nestedArrears.arrears_months;
  if (!arrearsMonths && rentAmount > 0 && arrearsTotal > 0) {
    arrearsMonths = arrearsTotal / rentAmount;
  }

  // Extract evidence uploads - filter out undefined/null values to prevent "undefined" in output
  const evidenceUploads: string[] = data.evidence_uploads
    ? data.evidence_uploads.filter((u: any): u is string => typeof u === 'string' && u.trim().length > 0)
    : data.evidence?.files
      ? data.evidence.files
          .map((f: any) => f.name || f.filename || f.original_name)
          .filter((name: any): name is string => typeof name === 'string' && name.trim().length > 0)
      : [];

  // Signing data extraction
  const nestedSigning = data.signing || {};
  const signatoryName =
    nestedSigning.signatory_name ||
    landlordFullName;
  const signatureDate =
    nestedSigning.signature_date ||
    new Date().toISOString().split('T')[0];

  return {
    landlord: {
      full_name: landlordFullName,
      address_line_1: landlordAddressLine1,
      address_line_2: landlordAddressLine2,
      city: landlordCity,
      postcode: landlordPostcode,
      has_joint_landlords: nestedLandlord.has_joint_landlords || false,
    },
    tenant: {
      full_name: tenantFullName,
    },
    property: {
      // If we don't have structured address but have full address, parse it
      address_line_1: propertyAddressLine1 || (fullPropertyAddress.split(',')[0]?.trim() || ''),
      address_line_2: propertyAddressLine2,
      city: propertyCity || (fullPropertyAddress.split(',')[1]?.trim() || ''),
      postcode: propertyPostcode || (fullPropertyAddress.split(',').pop()?.trim() || ''),
    },
    tenancy: {
      start_date: tenancyStartDate,
      tenancy_type: tenancyType,
      fixed_term_end_date: fixedTermEndDate,
      has_break_clause: nestedTenancy.has_break_clause || false,
      rent_amount: rentAmount,
      rent_frequency: rentFrequency as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly',
      rent_due_day: rentDueDay,
    },
    notice: {
      already_served_valid_notice: nestedNotice.already_served_valid_notice || false,
      served_date: noticeServedDate,
      service_method: serviceMethod,
      expiry_date: noticeExpiryDate,
    },
    section8: {
      grounds: Array.isArray(section8Grounds) ? section8Grounds.filter(Boolean) : [section8Grounds].filter(Boolean),
      particulars_text: nestedSection8.particulars_text || '',
    },
    arrears: {
      items: arrearsItems,
      total_arrears: arrearsTotal,
      arrears_months: arrearsMonths,
    },
    arrearsAtNoticeDate: arrearsAtNoticeDate,
    arrearsAtStatementDate: arrearsTotal,
    evidence_uploads: evidenceUploads,
    signing: {
      signatory_name: signatoryName,
      capacity: nestedSigning.capacity || 'claimant_landlord',
      signature_date: signatureDate,
    },
  };
}
