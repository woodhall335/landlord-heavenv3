/**
 * Money Claim Client Validator
 *
 * Client-safe validation for money claim wizard.
 * This is a simplified version that runs entirely in the browser.
 * For full YAML-based validation, use the server-side rules engine.
 *
 * Returns tiered results: blockers, warnings, suggestions.
 */

export type RuleSeverity = 'blocker' | 'warning' | 'suggestion';

export type ClaimType =
  | 'rent_arrears'
  | 'property_damage'
  | 'cleaning'
  | 'unpaid_utilities'
  | 'unpaid_council_tax'
  | 'other_tenant_debt';

export interface ValidationIssue {
  id: string;
  severity: RuleSeverity;
  message: string;
  section: string;
  field?: string | null;
  evidenceHint?: string | null;
}

export interface ClientValidationResult {
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
  totalClaimAmount: number;
  claimTypes: ClaimType[];
  isValid: boolean;
}

export interface MoneyClaimFacts {
  landlord_full_name?: string;
  landlord_address_line1?: string;
  landlord_address_postcode?: string;
  landlord_is_company?: boolean;
  company_name?: string;
  tenant_full_name?: string;
  defendant_address_line1?: string;
  property_address_line1?: string;
  property_address_postcode?: string;
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  rent_amount?: number;
  rent_frequency?: string;
  claiming_rent_arrears?: boolean;
  claiming_damages?: boolean;
  claiming_other?: boolean;
  arrears_items?: Array<{
    period_start?: string | null;
    period_end?: string | null;
    rent_due?: number | null;
    rent_paid?: number | null;
  }>;
  total_arrears?: number;
  letter_before_claim_sent?: boolean;
  pap_letter_date?: string;
  pap_response_received?: boolean;
  evidence_reviewed?: boolean;
  uploaded_documents?: Array<{ id: string; name: string; type?: string }>;
  timeline_reviewed?: boolean;
  enforcement_reviewed?: boolean;
  enforcement_preference?: string;
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
}

/**
 * Extract claim types from facts
 */
export function getClaimTypesFromFacts(facts: MoneyClaimFacts): ClaimType[] {
  const types: ClaimType[] = [];

  if (facts.claiming_rent_arrears === true) {
    types.push('rent_arrears');
  }

  const otherTypes = facts.money_claim?.other_amounts_types || [];

  if (otherTypes.includes('property_damage') || facts.claiming_damages === true) {
    types.push('property_damage');
  }
  if (otherTypes.includes('cleaning')) {
    types.push('cleaning');
  }
  if (otherTypes.includes('unpaid_utilities')) {
    types.push('unpaid_utilities');
  }
  if (otherTypes.includes('unpaid_council_tax')) {
    types.push('unpaid_council_tax');
  }
  if (otherTypes.includes('other_charges') || facts.claiming_other === true) {
    types.push('other_tenant_debt');
  }

  return types;
}

/**
 * Calculate totals
 */
function calculateArrearsTotal(facts: MoneyClaimFacts): number {
  const items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
  if (items.length === 0) {
    return facts.total_arrears || facts.issues?.rent_arrears?.total_arrears || 0;
  }
  return items.reduce((total, item) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return total + (due - paid);
  }, 0);
}

function calculateDamagesTotal(facts: MoneyClaimFacts): number {
  const items = facts.money_claim?.damage_items || [];
  return items.reduce((total, item) => total + (item.amount || 0), 0);
}

/**
 * Run client-side validation
 */
export function validateMoneyClaimClient(facts: MoneyClaimFacts): ClientValidationResult {
  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const suggestions: ValidationIssue[] = [];

  const claimTypes = getClaimTypesFromFacts(facts);
  const arrearsTotal = claimTypes.includes('rent_arrears') ? calculateArrearsTotal(facts) : 0;
  const damagesTotal = calculateDamagesTotal(facts);
  const grandTotal = arrearsTotal + damagesTotal;

  const arrears_items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
  const damage_items = facts.money_claim?.damage_items || [];

  // ============================================================================
  // BLOCKERS
  // ============================================================================

  // Claimant identity
  if (!facts.landlord_full_name && !facts.company_name) {
    blockers.push({
      id: 'claimant_name_required',
      severity: 'blocker',
      message: 'Claimant name is required. Enter your full legal name or company name.',
      section: 'claimant',
      field: 'landlord_full_name',
    });
  }

  if (!facts.landlord_address_line1) {
    blockers.push({
      id: 'claimant_address_required',
      severity: 'blocker',
      message: 'Claimant address is required for the court forms.',
      section: 'claimant',
      field: 'landlord_address_line1',
    });
  }

  if (!facts.landlord_address_postcode) {
    blockers.push({
      id: 'claimant_postcode_required',
      severity: 'blocker',
      message: 'Claimant postcode is required.',
      section: 'claimant',
      field: 'landlord_address_postcode',
    });
  }

  // Defendant identity
  if (!facts.tenant_full_name) {
    blockers.push({
      id: 'defendant_name_required',
      severity: 'blocker',
      message: 'Defendant (tenant) full name is required.',
      section: 'defendant',
      field: 'tenant_full_name',
    });
  }

  if (!facts.defendant_address_line1 && !facts.property_address_line1) {
    blockers.push({
      id: 'defendant_address_required',
      severity: 'blocker',
      message: 'Defendant address or property address is required for service.',
      section: 'defendant',
      field: 'defendant_address_line1',
    });
  }

  // Claim type
  if (claimTypes.length === 0) {
    blockers.push({
      id: 'claim_type_required',
      severity: 'blocker',
      message: 'Please select at least one type of claim (e.g., rent arrears, property damage).',
      section: 'claim_details',
      field: 'money_claim.other_amounts_types',
    });
  }

  // Interest decision
  if (
    facts.money_claim?.charge_interest !== true &&
    facts.money_claim?.charge_interest !== false
  ) {
    blockers.push({
      id: 'interest_decision_required',
      severity: 'blocker',
      message: 'Please indicate whether you want to claim statutory interest.',
      section: 'claim_details',
      field: 'money_claim.charge_interest',
    });
  }

  // Principal total
  if (grandTotal <= 0 && claimTypes.length > 0) {
    blockers.push({
      id: 'principal_total_positive',
      severity: 'blocker',
      message: 'Total claim amount must be greater than zero.',
      section: 'amounts',
    });
  }

  // PAP letter
  if (!facts.letter_before_claim_sent && !facts.pap_letter_date) {
    blockers.push({
      id: 'pap_letter_required',
      severity: 'blocker',
      message: 'You must send a Letter Before Claim to comply with the Pre-Action Protocol for Debt Claims (PAP-DEBT).',
      section: 'preaction',
      field: 'letter_before_claim_sent',
      evidenceHint: 'Keep a copy of the letter and proof of posting/delivery.',
    });
  }

  // Tenancy start date
  if (!facts.tenancy_start_date) {
    blockers.push({
      id: 'tenancy_start_required',
      severity: 'blocker',
      message: 'Tenancy start date is required.',
      section: 'tenancy',
      field: 'tenancy_start_date',
    });
  }

  // Date logic
  if (facts.tenancy_start_date && facts.tenancy_end_date) {
    if (new Date(facts.tenancy_start_date) > new Date(facts.tenancy_end_date)) {
      blockers.push({
        id: 'tenancy_dates_logical',
        severity: 'blocker',
        message: 'Tenancy start date cannot be after the end date.',
        section: 'tenancy',
        field: 'tenancy_start_date',
      });
    }
  }

  if (facts.tenancy_start_date && new Date(facts.tenancy_start_date) > new Date()) {
    blockers.push({
      id: 'tenancy_not_future',
      severity: 'blocker',
      message: 'Tenancy start date cannot be in the future.',
      section: 'tenancy',
      field: 'tenancy_start_date',
    });
  }

  // Rent arrears specific
  if (claimTypes.includes('rent_arrears')) {
    if (arrears_items.length === 0) {
      blockers.push({
        id: 'arrears_items_required',
        severity: 'blocker',
        message: 'Please add at least one arrears entry to the rent schedule.',
        section: 'arrears',
        field: 'arrears_items',
        evidenceHint: 'List each missed or partial payment with dates and amounts.',
      });
    }

    if (!facts.rent_amount) {
      blockers.push({
        id: 'rent_amount_required',
        severity: 'blocker',
        message: 'Monthly rent amount is required for arrears calculations.',
        section: 'tenancy',
        field: 'rent_amount',
      });
    }

    if (!facts.rent_frequency) {
      blockers.push({
        id: 'rent_frequency_required',
        severity: 'blocker',
        message: 'Rent payment frequency is required (e.g., monthly, weekly).',
        section: 'tenancy',
        field: 'rent_frequency',
      });
    }
  }

  // Damages specific
  const hasDamagesClaimType =
    claimTypes.includes('property_damage') ||
    claimTypes.includes('cleaning') ||
    claimTypes.includes('unpaid_utilities') ||
    claimTypes.includes('other_tenant_debt');

  if (hasDamagesClaimType && damage_items.length === 0) {
    blockers.push({
      id: 'damage_items_required',
      severity: 'blocker',
      message: 'Please add at least one item to your damages/costs schedule.',
      section: 'damages',
      field: 'money_claim.damage_items',
    });
  }

  // ============================================================================
  // WARNINGS
  // ============================================================================

  // Basis of claim
  if (!facts.money_claim?.basis_of_claim) {
    warnings.push({
      id: 'basis_of_claim_missing',
      severity: 'warning',
      message: 'Provide a brief explanation of what this claim is about. This helps the court understand your case.',
      section: 'claim_details',
      field: 'money_claim.basis_of_claim',
    });
  } else if (facts.money_claim.basis_of_claim.length < 50) {
    warnings.push({
      id: 'basis_of_claim_short',
      severity: 'warning',
      message: 'Your claim explanation is quite brief. Consider adding more detail about the circumstances.',
      section: 'claim_details',
      field: 'money_claim.basis_of_claim',
    });
  }

  // PAP 30-day wait
  if (facts.pap_letter_date && !facts.pap_response_received) {
    const letterDate = new Date(facts.pap_letter_date);
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - letterDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 30) {
      warnings.push({
        id: 'pap_30_day_wait',
        severity: 'warning',
        message: `Only ${daysSince} days since your Letter Before Claim. PAP-DEBT requires waiting 30 days for a response before issuing court proceedings.`,
        section: 'preaction',
        field: 'pap_letter_date',
      });
    }
  }

  // No evidence
  const hasDocuments = (facts.uploaded_documents?.length || 0) > 0;
  if (!hasDocuments && !facts.evidence_reviewed) {
    warnings.push({
      id: 'no_evidence_uploaded',
      severity: 'warning',
      message: 'Consider uploading supporting evidence (tenancy agreement, payment records, photos). Strong evidence improves your chances of success.',
      section: 'evidence',
      evidenceHint: 'Upload tenancy agreement, bank statements, photos, quotes, etc.',
    });
  }

  // Tenancy end suggested
  if (facts.money_claim?.tenant_still_in_property === false && !facts.tenancy_end_date) {
    warnings.push({
      id: 'tenancy_end_suggested',
      severity: 'warning',
      message: 'Since the tenant has left, consider adding the tenancy end date for completeness.',
      section: 'tenancy',
      field: 'tenancy_end_date',
    });
  }

  // Arrears incomplete items
  if (claimTypes.includes('rent_arrears') && arrears_items.length > 0) {
    const incompleteCount = arrears_items.filter(
      (item) => !item.period_start || !item.period_end || item.rent_due === null || item.rent_due === undefined
    ).length;
    if (incompleteCount > 0) {
      warnings.push({
        id: 'arrears_items_incomplete',
        severity: 'warning',
        message: `${incompleteCount} arrears ${incompleteCount === 1 ? 'entry has' : 'entries have'} incomplete information (missing dates or amounts).`,
        section: 'arrears',
        field: 'arrears_items',
      });
    }

    if (arrearsTotal <= 0) {
      warnings.push({
        id: 'arrears_total_zero',
        severity: 'warning',
        message: "Your arrears schedule shows no outstanding balance. Check the amounts entered.",
        section: 'arrears',
        field: 'arrears_items',
      });
    }
  }

  // Damages items incomplete
  if (damage_items.length > 0) {
    const noAmount = damage_items.filter(
      (item) => item.amount === null || item.amount === undefined || item.amount <= 0
    ).length;
    if (noAmount > 0) {
      warnings.push({
        id: 'damage_items_no_amount',
        severity: 'warning',
        message: `${noAmount} ${noAmount === 1 ? 'item has' : 'items have'} no amount specified.`,
        section: 'damages',
        field: 'money_claim.damage_items',
      });
    }

    const noDesc = damage_items.filter((item) => !item.description).length;
    if (noDesc > 0) {
      warnings.push({
        id: 'damage_items_no_description',
        severity: 'warning',
        message: `${noDesc} ${noDesc === 1 ? 'item needs' : 'items need'} a description.`,
        section: 'damages',
        field: 'money_claim.damage_items',
      });
    }
  }

  // Council tax warning
  if (claimTypes.includes('unpaid_council_tax')) {
    warnings.push({
      id: 'council_tax_liability_warning',
      severity: 'warning',
      message: "Council tax liability depends on occupancy and your tenancy agreement terms. Ensure you have evidence that the tenant was contractually liable for council tax during the claim period.",
      section: 'council_tax',
      evidenceHint: 'Tenancy agreement clause, council tax bills, occupancy evidence.',
    });
  }

  // ============================================================================
  // SUGGESTIONS
  // ============================================================================

  // Interest start date
  if (facts.money_claim?.charge_interest === true && !facts.money_claim?.interest_start_date) {
    suggestions.push({
      id: 'interest_start_date_suggested',
      severity: 'suggestion',
      message: 'Add an interest start date for accurate calculations. Typically, this is when the debt became due.',
      section: 'claim_details',
      field: 'money_claim.interest_start_date',
    });
  }

  // Enforcement review
  if (!facts.enforcement_reviewed && !facts.enforcement_preference) {
    suggestions.push({
      id: 'enforcement_review_suggested',
      severity: 'suggestion',
      message: "Consider your enforcement options in case the defendant doesn't pay voluntarily after judgment.",
      section: 'next_steps',
    });
  }

  // Timeline review
  if (!facts.timeline_reviewed) {
    suggestions.push({
      id: 'timeline_review_suggested',
      severity: 'suggestion',
      message: 'Review the case timeline to ensure all dates and events are accurate.',
      section: 'next_steps',
    });
  }

  // Evidence suggestions based on claim type
  if (claimTypes.includes('rent_arrears') && !hasDocuments) {
    suggestions.push({
      id: 'arrears_evidence_suggested',
      severity: 'suggestion',
      message: 'Upload rent statements or bank records showing missed payments to support your arrears claim.',
      section: 'evidence',
      evidenceHint: 'Bank statements, rent ledger, or accounting records.',
    });
  }

  if (claimTypes.includes('property_damage') && !hasDocuments) {
    suggestions.push({
      id: 'property_damage_evidence_suggested',
      severity: 'suggestion',
      message: 'Upload dated photos showing the damage and repair quotes to support your property damage claim.',
      section: 'evidence',
      evidenceHint: 'Before/after photos, check-in inventory, repair invoices.',
    });
  }

  if (claimTypes.includes('cleaning') && !hasDocuments) {
    suggestions.push({
      id: 'cleaning_evidence_suggested',
      severity: 'suggestion',
      message: 'Upload photos of the condition and cleaning invoices to support your cleaning costs claim.',
      section: 'evidence',
      evidenceHint: 'Check-out photos, cleaning company invoice.',
    });
  }

  return {
    blockers,
    warnings,
    suggestions,
    totalClaimAmount: grandTotal,
    claimTypes,
    isValid: blockers.length === 0,
  };
}

/**
 * Group validation issues by section
 */
export function groupBySection(
  result: ClientValidationResult
): Record<string, { blockers: ValidationIssue[]; warnings: ValidationIssue[]; suggestions: ValidationIssue[] }> {
  const sections: Record<string, { blockers: ValidationIssue[]; warnings: ValidationIssue[]; suggestions: ValidationIssue[] }> = {};

  const addToSection = (issue: ValidationIssue) => {
    if (!sections[issue.section]) {
      sections[issue.section] = { blockers: [], warnings: [], suggestions: [] };
    }
    if (issue.severity === 'blocker') {
      sections[issue.section].blockers.push(issue);
    } else if (issue.severity === 'warning') {
      sections[issue.section].warnings.push(issue);
    } else {
      sections[issue.section].suggestions.push(issue);
    }
  };

  result.blockers.forEach(addToSection);
  result.warnings.forEach(addToSection);
  result.suggestions.forEach(addToSection);

  return sections;
}

/**
 * Get section label for display
 */
export function getSectionLabel(sectionId: string): string {
  const labels: Record<string, string> = {
    claimant: 'Claimant Details',
    defendant: 'Defendant Details',
    tenancy: 'Tenancy Information',
    claim_details: 'Claim Details',
    arrears: 'Rent Arrears Schedule',
    damages: 'Other Amounts Schedule',
    council_tax: 'Council Tax',
    utilities: 'Utilities',
    preaction: 'Pre-Action Protocol',
    evidence: 'Evidence',
    amounts: 'Claim Amount',
    next_steps: 'Next Steps',
  };
  return labels[sectionId] || sectionId;
}
