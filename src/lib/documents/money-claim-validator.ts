/**
 * Money Claim Pre-Generation Validator
 *
 * Validates money claim data consistency BEFORE pack generation.
 * This "pre-issue lint" catches:
 * - Missing required fields
 * - Cross-document consistency issues
 * - Money math errors
 * - Unreferenced data
 *
 * If validation fails, generation should NOT proceed.
 */

import type { MoneyClaimCase, ArrearsEntry, ClaimLineItem } from './money-claim-pack-generator';

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  field: string;
  message: string;
  details?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  computedTotals: {
    arrears_total: number;
    damages_total: number;
    other_charges_total: number;
    principal_total: number;
    interest_amount: number | null;
    claim_total: number;
  };
}

/**
 * Required fields for England/Wales money claim
 */
const REQUIRED_FIELDS: Array<{ field: keyof MoneyClaimCase; label: string }> = [
  { field: 'landlord_full_name', label: 'Claimant (landlord) full name' },
  { field: 'landlord_address', label: 'Claimant address' },
  { field: 'tenant_full_name', label: 'Defendant (tenant) full name' },
  { field: 'property_address', label: 'Property address' },
  { field: 'rent_amount', label: 'Monthly rent amount' },
  { field: 'rent_frequency', label: 'Rent payment frequency' },
];

/**
 * Sum line items (damages or other charges)
 */
function sumLineItems(items?: ClaimLineItem[]): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Sum arrears from schedule
 */
function sumArrearsSchedule(schedule?: ArrearsEntry[]): number {
  if (!schedule || !Array.isArray(schedule)) return 0;
  return schedule.reduce((sum, entry) => sum + (Number(entry.arrears) || 0), 0);
}

/**
 * Validate money claim data before pack generation.
 *
 * @param claim - The MoneyClaimCase data to validate
 * @returns ValidationResult with errors, warnings, and computed totals
 */
export function validateMoneyClaimData(claim: MoneyClaimCase): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // =========================================================================
  // 1. REQUIRED FIELD VALIDATION
  // =========================================================================
  for (const { field, label } of REQUIRED_FIELDS) {
    const value = claim[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        code: 'MISSING_REQUIRED_FIELD',
        severity: 'error',
        field,
        message: `Missing required field: ${label}`,
        details: `The field "${field}" is required for a valid money claim. Please complete the wizard.`,
      });
    }
  }

  // =========================================================================
  // 2. CLAIM AMOUNT VALIDATION
  // =========================================================================
  const arrearsFromSchedule = sumArrearsSchedule(claim.arrears_schedule);
  const arrearsTotal = claim.arrears_total || arrearsFromSchedule;
  const damagesTotal = sumLineItems(claim.damage_items);
  const otherChargesTotal = sumLineItems(claim.other_charges);
  const principalTotal = arrearsTotal + damagesTotal + otherChargesTotal;

  // Must have some claim amount
  if (principalTotal <= 0) {
    errors.push({
      code: 'NO_CLAIM_AMOUNT',
      severity: 'error',
      field: 'total_claim_amount',
      message: 'No claim amount provided',
      details: 'A money claim must have arrears, damages, or other charges totalling more than £0.',
    });
  }

  // Check arrears consistency
  if (claim.arrears_total && arrearsFromSchedule > 0) {
    const diff = Math.abs(claim.arrears_total - arrearsFromSchedule);
    if (diff > 0.01) {
      warnings.push({
        code: 'ARREARS_TOTAL_MISMATCH',
        severity: 'warning',
        field: 'arrears_total',
        message: `Arrears total (£${claim.arrears_total.toFixed(2)}) doesn't match schedule sum (£${arrearsFromSchedule.toFixed(2)})`,
        details: 'The stated arrears total should match the sum of arrears in the schedule. Please verify.',
      });
    }
  }

  // =========================================================================
  // 3. INTEREST VALIDATION (only if opted in)
  // =========================================================================
  let interestAmount: number | null = null;

  if (claim.claim_interest === true) {
    // If claiming interest, rate must be provided
    if (!claim.interest_rate || claim.interest_rate <= 0) {
      warnings.push({
        code: 'INTEREST_NO_RATE',
        severity: 'warning',
        field: 'interest_rate',
        message: 'Interest claimed but no rate specified',
        details: 'You have opted to claim interest but no rate is set. Defaulting to 8% statutory rate.',
      });
    }

    // Calculate expected interest (rough estimate using 8% over 90 days)
    const rate = claim.interest_rate || 8;
    interestAmount = claim.interest_to_date || Number((principalTotal * (rate / 100) * 0.25).toFixed(2));
  }

  // =========================================================================
  // 4. ADDRESS/POSTCODE VALIDATION
  // =========================================================================
  if (!claim.landlord_postcode && !claim.service_postcode) {
    errors.push({
      code: 'MISSING_POSTCODE',
      severity: 'error',
      field: 'landlord_postcode',
      message: 'Missing postcode for service address',
      details: 'A valid UK postcode is required for the address for service. This is mandatory for court forms.',
    });
  }

  if (!claim.property_postcode) {
    warnings.push({
      code: 'MISSING_PROPERTY_POSTCODE',
      severity: 'warning',
      field: 'property_postcode',
      message: 'Property postcode not provided',
      details: 'Including the property postcode makes the claim clearer and helps with court processing.',
    });
  }

  // =========================================================================
  // 5. NAME CONSISTENCY CHECK
  // =========================================================================
  // Ensure signatory name matches landlord name or is explicitly provided
  if (claim.signatory_name) {
    const landlordNameLower = (claim.landlord_full_name || '').toLowerCase().trim();
    const signatoryNameLower = claim.signatory_name.toLowerCase().trim();

    // Check if signatory appears to be landlord or a representative
    if (landlordNameLower && signatoryNameLower !== landlordNameLower) {
      // Could be a solicitor signing - that's fine
      if (!claim.solicitor_firm) {
        warnings.push({
          code: 'SIGNATORY_NAME_MISMATCH',
          severity: 'warning',
          field: 'signatory_name',
          message: `Signatory name ("${claim.signatory_name}") differs from landlord name`,
          details: 'Unless a solicitor is signing on behalf of the landlord, the Statement of Truth should typically be signed by the claimant.',
        });
      }
    }
  }

  // =========================================================================
  // 6. COURT FEE VALIDATION
  // =========================================================================
  const courtFee = claim.court_fee || 0;
  if (courtFee <= 0 && principalTotal > 0) {
    warnings.push({
      code: 'NO_COURT_FEE',
      severity: 'warning',
      field: 'court_fee',
      message: 'No court fee specified',
      details: 'Court fees are usually required when issuing a money claim. A default will be applied.',
    });
  }

  // =========================================================================
  // 7. PRE-ACTION PROTOCOL WARNINGS
  // =========================================================================
  if (!claim.lba_date) {
    warnings.push({
      code: 'NO_LBA_DATE',
      severity: 'warning',
      field: 'lba_date',
      message: 'No Letter Before Claim date recorded',
      details: 'Under PAP-DEBT, you should send a Letter Before Claim at least 30 days before issuing proceedings.',
    });
  }

  // =========================================================================
  // 8. COMPUTED TOTALS
  // =========================================================================
  const claimTotal = principalTotal + (interestAmount || 0);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    computedTotals: {
      arrears_total: arrearsTotal,
      damages_total: damagesTotal,
      other_charges_total: otherChargesTotal,
      principal_total: principalTotal,
      interest_amount: interestAmount,
      claim_total: claimTotal,
    },
  };
}

/**
 * Validate and throw if invalid.
 * Use this before pack generation to ensure data integrity.
 *
 * @param claim - The MoneyClaimCase data to validate
 * @throws Error with human-readable message if validation fails
 */
export function assertValidMoneyClaimData(claim: MoneyClaimCase): ValidationResult {
  const result = validateMoneyClaimData(claim);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `• ${e.message}`)
      .join('\n');

    throw new Error(
      `Money claim data validation failed with ${result.errors.length} error(s):\n\n${errorMessages}\n\n` +
        `Please complete all required fields in the wizard before generating the pack.`
    );
  }

  // Log warnings for debugging
  if (result.warnings.length > 0) {
    console.warn(
      `[money-claim-validator] ${result.warnings.length} warning(s):\n` +
        result.warnings.map((w) => `  ⚠️ ${w.message}`).join('\n')
    );
  }

  // Log computed totals for debugging
  console.log('[money-claim-validator] Computed totals:', {
    arrears: result.computedTotals.arrears_total,
    damages: result.computedTotals.damages_total,
    other: result.computedTotals.other_charges_total,
    principal: result.computedTotals.principal_total,
    interest: result.computedTotals.interest_amount,
    total: result.computedTotals.claim_total,
  });

  return result;
}

/**
 * Validate that totals in the generated pack match expected values.
 * Call this AFTER generation to verify consistency.
 *
 * @param expectedTotal - The expected claim total
 * @param renderedTotal - The total rendered in documents
 * @param tolerance - Allowed difference (default 0.01 for rounding)
 */
export function assertTotalsReconcile(
  expectedTotal: number,
  renderedTotal: number,
  tolerance: number = 0.01
): void {
  const diff = Math.abs(expectedTotal - renderedTotal);

  if (diff > tolerance) {
    throw new Error(
      `[money-claim-validator] Total mismatch: expected £${expectedTotal.toFixed(2)} but rendered £${renderedTotal.toFixed(2)} ` +
        `(difference: £${diff.toFixed(2)}). This indicates a calculation error.`
    );
  }
}
