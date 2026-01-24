/**
 * Money Claim Case Validator
 *
 * Comprehensive validation for money claim wizard.
 * Provides blockers, warnings, and completion status for each section.
 *
 * Follows the same pattern as notice-only-case-validator.ts for consistency.
 */

import type { ClaimReasonType } from '@/components/wizard/sections/money-claim/ClaimDetailsSection';
import { getClaimReasonsFromFacts } from '@/lib/money-claim/statement-generator';

type Jurisdiction = 'england' | 'wales' | 'scotland';

export interface MoneyClaimValidationResult {
  valid: boolean;
  /** Current claim reasons selected */
  claimReasons: ClaimReasonType[];
  /** Whether arrears schedule is complete (if claiming rent) */
  arrearsScheduleComplete: boolean;
  /** Whether damages schedule is complete (if claiming damages) */
  damagesScheduleComplete: boolean;
  /** Pre-action protocol compliance status */
  papCompliant: boolean;
  /** Total claim amount */
  totalClaimAmount: number;
  /** Blocking errors that prevent proceeding */
  errors: Array<{ code: string; message: string; section?: string }>;
  /** Non-blocking warnings */
  warnings: Array<{ code: string; message: string; section?: string }>;
}

export interface MoneyClaimFacts {
  // Landlord/claimant
  landlord_full_name?: string;
  landlord_address_line1?: string;
  landlord_address_postcode?: string;
  landlord_is_company?: boolean;
  company_name?: string;

  // Tenant/defendant
  tenant_full_name?: string;
  defendant_address_line1?: string;

  // Property
  property_address_line1?: string;
  property_address_postcode?: string;

  // Tenancy
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  rent_amount?: number;
  rent_frequency?: string;

  // Claim flags
  claiming_rent_arrears?: boolean;
  claiming_damages?: boolean;
  claiming_other?: boolean;

  // Arrears data
  arrears_items?: Array<{
    period_start?: string | null;
    period_end?: string | null;
    rent_due?: number | null;
    rent_paid?: number | null;
  }>;
  total_arrears?: number;

  // Pre-action
  letter_before_claim_sent?: boolean;
  pap_letter_date?: string;
  pap_response_received?: boolean;
  pap_response_date?: string;

  // Timeline
  timeline_reviewed?: boolean;

  // Evidence
  evidence_reviewed?: boolean;
  uploaded_documents?: Array<{ id: string; name: string; type?: string }>;

  // Enforcement
  enforcement_reviewed?: boolean;
  enforcement_preference?: string;

  // Money claim nested object
  money_claim?: {
    primary_issue?: string;
    other_amounts_types?: string[];
    damage_items?: Array<{
      id?: string;
      description?: string;
      amount?: number;
      category?: string;
    }>;
    tenant_still_in_property?: boolean;
    basis_of_claim?: string;
    charge_interest?: boolean;
    interest_rate?: number;
    interest_start_date?: string;
  };

  // Issues nested (legacy)
  issues?: {
    rent_arrears?: {
      arrears_items?: Array<{
        period_start?: string | null;
        period_end?: string | null;
        rent_due?: number | null;
        rent_paid?: number | null;
      }>;
      total_arrears?: number;
    };
  };

  // Meta
  __meta?: {
    jurisdiction?: Jurisdiction;
    product?: string;
  };
}

/**
 * Calculate total arrears from items
 */
function calculateTotalArrears(facts: MoneyClaimFacts): number {
  const items =
    facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];

  if (items.length === 0) {
    return facts.total_arrears || facts.issues?.rent_arrears?.total_arrears || 0;
  }

  return items.reduce((total, item) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return total + (due - paid);
  }, 0);
}

/**
 * Calculate total damages from items
 */
function calculateTotalDamages(facts: MoneyClaimFacts): number {
  const items = facts.money_claim?.damage_items || [];
  return items.reduce((total, item) => total + (item.amount || 0), 0);
}

/**
 * Validate claimant section
 */
export function validateClaimantSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (facts.landlord_is_company) {
    if (!facts.company_name) {
      blockers.push('Company name is required');
    }
  } else {
    if (!facts.landlord_full_name) {
      blockers.push('Landlord full name is required');
    }
  }

  if (!facts.landlord_address_line1) {
    blockers.push('Landlord address is required');
  }

  if (!facts.landlord_address_postcode) {
    blockers.push('Landlord postcode is required');
  }

  return { blockers, warnings };
}

/**
 * Validate defendant section
 */
export function validateDefendantSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!facts.tenant_full_name) {
    blockers.push('Tenant full name is required');
  }

  // Need either defendant address or property address
  if (!facts.defendant_address_line1 && !facts.property_address_line1) {
    blockers.push('Defendant address or property address is required');
  }

  return { blockers, warnings };
}

/**
 * Validate tenancy section
 */
export function validateTenancySection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!facts.tenancy_start_date) {
    blockers.push('Tenancy start date is required');
  }

  if (!facts.rent_amount) {
    blockers.push('Rent amount is required');
  }

  if (!facts.rent_frequency) {
    blockers.push('Rent frequency is required');
  }

  // Warning if tenancy end date is not set but tenant has left
  if (
    facts.money_claim?.tenant_still_in_property === false &&
    !facts.tenancy_end_date
  ) {
    warnings.push(
      'Consider adding tenancy end date since the tenant has left the property'
    );
  }

  return { blockers, warnings };
}

/**
 * Validate claim details section
 * Note: Money Claim is England-only
 */
export function validateClaimDetailsSection(
  facts: MoneyClaimFacts,
  _jurisdiction: Jurisdiction
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const reasons = getClaimReasonsFromFacts(facts);

  // Must select at least one claim type
  if (reasons.size === 0) {
    blockers.push('Please select at least one type of claim');
  }

  // England: must explicitly opt in/out of statutory interest
  if (
    facts.money_claim?.charge_interest !== true &&
    facts.money_claim?.charge_interest !== false
  ) {
    blockers.push('Please indicate whether you want to claim statutory interest');
  }

  // If interest is selected, need start date
  if (facts.money_claim?.charge_interest === true) {
    if (!facts.money_claim?.interest_start_date) {
      warnings.push('Consider adding an interest start date for accurate calculations');
    }
  }

  // Basis of claim is important
  if (!facts.money_claim?.basis_of_claim) {
    warnings.push(
      'Provide a basis of claim statement to explain what this claim is about'
    );
  } else if (facts.money_claim.basis_of_claim.length < 50) {
    warnings.push(
      'Your basis of claim statement is quite short - consider adding more detail'
    );
  }

  // Council tax warning
  if (reasons.has('unpaid_council_tax')) {
    warnings.push(
      'Ensure you have evidence that council tax was the tenant\'s liability under the agreement'
    );
  }

  return { blockers, warnings };
}

/**
 * Validate arrears section
 */
export function validateArrearsSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Only validate if claiming rent arrears
  if (facts.claiming_rent_arrears !== true) {
    return { blockers, warnings };
  }

  const items =
    facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];

  if (items.length === 0) {
    blockers.push('Please add at least one arrears entry to the schedule');
  } else {
    // Check for incomplete entries
    const incompleteItems = items.filter(
      (item) =>
        !item.period_start ||
        !item.period_end ||
        item.rent_due === null ||
        item.rent_due === undefined
    );

    if (incompleteItems.length > 0) {
      warnings.push(
        `${incompleteItems.length} arrears ${incompleteItems.length === 1 ? 'entry has' : 'entries have'} incomplete information`
      );
    }

    // Check total
    const total = calculateTotalArrears(facts);
    if (total <= 0) {
      warnings.push(
        'Your arrears schedule shows no outstanding balance - check the amounts'
      );
    }
  }

  return { blockers, warnings };
}

/**
 * Validate damages section
 */
export function validateDamagesSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Only validate if claiming damages or other
  if (facts.claiming_damages !== true && facts.claiming_other !== true) {
    return { blockers, warnings };
  }

  const items = facts.money_claim?.damage_items || [];

  if (items.length === 0) {
    blockers.push('Please add at least one damage or cost item');
  } else {
    // Check for items without amounts
    const noAmount = items.filter(
      (item) => item.amount === null || item.amount === undefined || item.amount <= 0
    );

    if (noAmount.length > 0) {
      warnings.push(
        `${noAmount.length} ${noAmount.length === 1 ? 'item has' : 'items have'} no amount specified`
      );
    }

    // Check for items without descriptions
    const noDescription = items.filter((item) => !item.description);

    if (noDescription.length > 0) {
      warnings.push(
        `${noDescription.length} ${noDescription.length === 1 ? 'item needs' : 'items need'} a description`
      );
    }
  }

  return { blockers, warnings };
}

/**
 * Validate pre-action section (PAP compliance)
 * Note: Money Claim is England-only, PAP-DEBT compliance required
 */
export function validatePreActionSection(
  facts: MoneyClaimFacts,
  _jurisdiction: Jurisdiction
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // England - PAP-DEBT compliance required
  if (!facts.letter_before_claim_sent && !facts.pap_letter_date) {
    blockers.push(
      'You must send a Letter Before Claim to comply with the Pre-Action Protocol for Debt Claims'
    );
  }

  // Check timing - PAP requires 30 days response time
  if (facts.pap_letter_date) {
    const letterDate = new Date(facts.pap_letter_date);
    const today = new Date();
    const daysSinceLetter = Math.floor(
      (today.getTime() - letterDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLetter < 30 && !facts.pap_response_received) {
      warnings.push(
        `Only ${daysSinceLetter} days since your Letter Before Claim. PAP requires waiting 30 days for a response before issuing proceedings.`
      );
    }
  }

  return { blockers, warnings };
}

/**
 * Validate timeline section
 */
export function validateTimelineSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!facts.timeline_reviewed) {
    warnings.push('Review your case timeline before proceeding');
  }

  return { blockers, warnings };
}

/**
 * Validate evidence section
 */
export function validateEvidenceSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const hasDocuments = (facts.uploaded_documents?.length || 0) > 0;
  const hasReviewed = facts.evidence_reviewed;

  if (!hasDocuments && !hasReviewed) {
    warnings.push(
      'Consider uploading supporting evidence such as the tenancy agreement, rent statements, or photos of damage'
    );
  }

  // Specific evidence warnings based on claim types
  const reasons = getClaimReasonsFromFacts(facts);

  if (reasons.has('rent_arrears') && !hasDocuments) {
    warnings.push(
      'For rent arrears claims, upload rent statements or bank records showing missed payments'
    );
  }

  if (reasons.has('property_damage') && !hasDocuments) {
    warnings.push(
      'For property damage claims, upload dated photos showing the damage and repair quotes'
    );
  }

  return { blockers, warnings };
}

/**
 * Validate enforcement section
 */
export function validateEnforcementSection(
  facts: MoneyClaimFacts
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!facts.enforcement_reviewed && !facts.enforcement_preference) {
    warnings.push(
      'Consider your enforcement options in case the defendant does not pay voluntarily'
    );
  }

  return { blockers, warnings };
}

/**
 * Main validation function - validates entire case
 */
export function validateMoneyClaimCase(
  facts: MoneyClaimFacts,
  jurisdiction: Jurisdiction
): MoneyClaimValidationResult {
  const errors: MoneyClaimValidationResult['errors'] = [];
  const warnings: MoneyClaimValidationResult['warnings'] = [];

  // Get claim reasons
  const claimReasonsSet = getClaimReasonsFromFacts(facts);
  const claimReasons = Array.from(claimReasonsSet) as ClaimReasonType[];

  // Run all section validations
  const sections = [
    { id: 'claimant', fn: () => validateClaimantSection(facts) },
    { id: 'defendant', fn: () => validateDefendantSection(facts) },
    { id: 'tenancy', fn: () => validateTenancySection(facts) },
    { id: 'claim_details', fn: () => validateClaimDetailsSection(facts, jurisdiction) },
    { id: 'arrears', fn: () => validateArrearsSection(facts) },
    { id: 'damages', fn: () => validateDamagesSection(facts) },
    { id: 'preaction', fn: () => validatePreActionSection(facts, jurisdiction) },
    { id: 'timeline', fn: () => validateTimelineSection(facts) },
    { id: 'evidence', fn: () => validateEvidenceSection(facts) },
    { id: 'enforcement', fn: () => validateEnforcementSection(facts) },
  ];

  for (const { id, fn } of sections) {
    const result = fn();
    for (const blocker of result.blockers) {
      errors.push({ code: `${id}_blocker`, message: blocker, section: id });
    }
    for (const warning of result.warnings) {
      warnings.push({ code: `${id}_warning`, message: warning, section: id });
    }
  }

  // Calculate totals
  const arrearsTotal = claimReasons.includes('rent_arrears')
    ? calculateTotalArrears(facts)
    : 0;
  const damagesTotal = calculateTotalDamages(facts);
  const totalClaimAmount = arrearsTotal + damagesTotal;

  // Check schedule completeness
  const arrearsItems =
    facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
  const arrearsScheduleComplete =
    !claimReasons.includes('rent_arrears') || arrearsItems.length > 0;

  const damagesItems = facts.money_claim?.damage_items || [];
  const damagesScheduleComplete =
    (!claimReasons.includes('property_damage') &&
      !claimReasons.includes('cleaning') &&
      !claimReasons.includes('unpaid_utilities') &&
      !claimReasons.includes('unpaid_council_tax') &&
      !claimReasons.includes('other_tenant_debt')) ||
    damagesItems.length > 0;

  // Check PAP compliance
  const papCompliant =
    jurisdiction === 'scotland' ||
    facts.letter_before_claim_sent === true ||
    !!facts.pap_letter_date;

  return {
    valid: errors.length === 0,
    claimReasons,
    arrearsScheduleComplete,
    damagesScheduleComplete,
    papCompliant,
    totalClaimAmount,
    errors,
    warnings,
  };
}

/**
 * Get validation for a specific section
 */
export function getSectionValidation(
  sectionId: string,
  facts: MoneyClaimFacts,
  jurisdiction: Jurisdiction
): { blockers: string[]; warnings: string[] } {
  switch (sectionId) {
    case 'claimant':
      return validateClaimantSection(facts);
    case 'defendant':
      return validateDefendantSection(facts);
    case 'tenancy':
      return validateTenancySection(facts);
    case 'claim_details':
      return validateClaimDetailsSection(facts, jurisdiction);
    case 'arrears':
      return validateArrearsSection(facts);
    case 'damages':
      return validateDamagesSection(facts);
    case 'preaction':
      return validatePreActionSection(facts, jurisdiction);
    case 'timeline':
      return validateTimelineSection(facts);
    case 'evidence':
      return validateEvidenceSection(facts);
    case 'enforcement':
      return validateEnforcementSection(facts);
    default:
      return { blockers: [], warnings: [] };
  }
}
