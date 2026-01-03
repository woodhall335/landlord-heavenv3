/**
 * Fact Comparison Module
 *
 * Compares extracted facts from documents against wizard facts.
 * Emits warnings for mismatches, contradictions, and missing evidence.
 *
 * IMPORTANT: All warnings use safe language. Never "invalid", always "possible mismatch".
 *
 * @module src/lib/evidence/smart-review/compare
 */

import {
  EvidenceExtractedFacts,
  EvidenceBundle,
  EvidenceCategory,
  hasUploadsForCategory,
} from '../schema';
import {
  SmartReviewWarning,
  WarningCode,
  createWarning,
  createFactMismatchWarning,
  createMissingCategoryWarning,
} from '../warnings';

// =============================================================================
// Types
// =============================================================================

/**
 * Wizard facts format (from getCaseFacts).
 */
export type WizardFacts = Record<string, any>;

/**
 * Configuration for comparison thresholds.
 */
export interface ComparisonConfig {
  /** Tolerance for date comparisons in days */
  dateTolerance: number;
  /** Tolerance for amount comparisons as percentage (0.05 = 5%) */
  amountTolerance: number;
  /** Minimum confidence to consider an extraction valid */
  minConfidence: number;
  /** Minimum string similarity score (0-1) */
  minStringSimilarity: number;
}

/**
 * Default comparison configuration.
 */
export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  dateTolerance: 1, // ±1 day
  amountTolerance: 0.01, // 1% tolerance for amounts
  minConfidence: 0.5, // Minimum extraction confidence
  minStringSimilarity: 0.75, // 75% similarity for name matching
};

/**
 * Result of comparing facts.
 */
export interface ComparisonResult {
  /** All warnings generated */
  warnings: SmartReviewWarning[];
  /** Counts by warning type */
  counts: {
    mismatches: number;
    missing: number;
    contradictions: number;
    info: number;
  };
  /** Fields that were compared */
  comparedFields: string[];
  /** Fields with no extracted data */
  noDataFields: string[];
}

// =============================================================================
// Comparison Functions
// =============================================================================

/**
 * Compare extracted facts against wizard facts.
 *
 * @param extractedFacts - Array of extracted facts from documents
 * @param wizardFacts - Wizard facts from case
 * @param evidenceBundle - Evidence bundle for missing category checks
 * @param config - Comparison configuration
 * @returns Comparison result with warnings
 */
export function compareFacts(
  extractedFacts: EvidenceExtractedFacts[],
  wizardFacts: WizardFacts,
  evidenceBundle: EvidenceBundle,
  config: ComparisonConfig = DEFAULT_COMPARISON_CONFIG
): ComparisonResult {
  const warnings: SmartReviewWarning[] = [];
  const comparedFields: string[] = [];
  const noDataFields: string[] = [];

  // 1. Check for missing upload categories based on wizard answers
  const missingCategoryWarnings = checkMissingCategories(
    evidenceBundle,
    wizardFacts
  );
  warnings.push(...missingCategoryWarnings);

  // 2. Compare extracted data against wizard facts
  for (const facts of extractedFacts) {
    // Skip low confidence extractions
    if (facts.quality.confidence_overall < config.minConfidence) {
      continue;
    }

    // Compare parties
    if (facts.extracted.parties) {
      const partyWarnings = compareParties(
        facts.extracted.parties,
        wizardFacts,
        facts.docId,
        config
      );
      warnings.push(...partyWarnings);
      comparedFields.push('parties');
    }

    // Compare property
    if (facts.extracted.property) {
      const propertyWarnings = compareProperty(
        facts.extracted.property,
        wizardFacts,
        facts.docId,
        config
      );
      warnings.push(...propertyWarnings);
      comparedFields.push('property');
    }

    // Compare tenancy
    if (facts.extracted.tenancy) {
      const tenancyWarnings = compareTenancy(
        facts.extracted.tenancy,
        wizardFacts,
        facts.docId,
        config
      );
      warnings.push(...tenancyWarnings);
      comparedFields.push('tenancy');
    }

    // Compare deposit
    if (facts.extracted.deposit) {
      const depositWarnings = compareDeposit(
        facts.extracted.deposit,
        wizardFacts,
        facts.docId,
        config
      );
      warnings.push(...depositWarnings);
      comparedFields.push('deposit');
    }

    // Compare notice
    if (facts.extracted.notice) {
      const noticeWarnings = compareNotice(
        facts.extracted.notice,
        wizardFacts,
        facts.docId,
        config
      );
      warnings.push(...noticeWarnings);
      comparedFields.push('notice');
    }
  }

  // 3. Check for contradictions based on route and facts
  const contradictionWarnings = checkContradictions(
    extractedFacts,
    wizardFacts
  );
  warnings.push(...contradictionWarnings);

  // 4. Check for missing proofs based on wizard answers
  const missingProofWarnings = checkMissingProofs(
    evidenceBundle,
    wizardFacts,
    extractedFacts
  );
  warnings.push(...missingProofWarnings);

  // Deduplicate warnings by code
  const uniqueWarnings = deduplicateWarnings(warnings);

  return {
    warnings: uniqueWarnings,
    counts: {
      mismatches: uniqueWarnings.filter((w) =>
        w.code.startsWith('FACT_MISMATCH')
      ).length,
      missing: uniqueWarnings.filter(
        (w) =>
          w.code.startsWith('UPLOAD_MISSING') ||
          w.code.startsWith('FACT_MISSING')
      ).length,
      contradictions: uniqueWarnings.filter((w) =>
        w.code.startsWith('FACT_CONTRADICTION')
      ).length,
      info: uniqueWarnings.filter((w) => w.severity === 'info').length,
    },
    comparedFields: [...new Set(comparedFields)],
    noDataFields,
  };
}

// =============================================================================
// Category-Specific Comparisons
// =============================================================================

/**
 * Compare extracted party information.
 */
function compareParties(
  extracted: NonNullable<EvidenceExtractedFacts['extracted']['parties']>,
  wizardFacts: WizardFacts,
  docId: string,
  config: ComparisonConfig
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Compare landlord name
  const wizardLandlordName =
    wizardFacts.landlord_full_name || wizardFacts.landlord_name;
  if (extracted.landlord_name && wizardLandlordName) {
    if (
      !areNamesSimilar(
        extracted.landlord_name,
        wizardLandlordName,
        config.minStringSimilarity
      )
    ) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_LANDLORD_NAME,
          wizardLandlordName,
          extracted.landlord_name,
          docId,
          'tenancy_agreement'
        )
      );
    }
  }

  // Compare tenant name
  const wizardTenantName =
    wizardFacts.tenant_full_name || wizardFacts.tenant_name;
  if (extracted.tenant_name && wizardTenantName) {
    if (
      !areNamesSimilar(
        extracted.tenant_name,
        wizardTenantName,
        config.minStringSimilarity
      )
    ) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_TENANT_NAME,
          wizardTenantName,
          extracted.tenant_name,
          docId,
          'tenancy_agreement'
        )
      );
    }
  }

  return warnings;
}

/**
 * Compare extracted property information.
 */
function compareProperty(
  extracted: NonNullable<EvidenceExtractedFacts['extracted']['property']>,
  wizardFacts: WizardFacts,
  docId: string,
  config: ComparisonConfig
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Build wizard address from parts
  const wizardAddressParts = [
    wizardFacts.property_address_line1,
    wizardFacts.property_address_town,
    wizardFacts.property_address_postcode,
  ]
    .filter(Boolean)
    .join(', ');

  // Build extracted address from parts
  const extractedAddressParts = [
    extracted.address_line1 || extracted.address,
    extracted.town,
    extracted.postcode,
  ]
    .filter(Boolean)
    .join(', ');

  // Compare postcodes first (most reliable)
  const wizardPostcode = normalizePostcode(
    wizardFacts.property_address_postcode
  );
  const extractedPostcode = normalizePostcode(extracted.postcode);

  if (wizardPostcode && extractedPostcode && wizardPostcode !== extractedPostcode) {
    warnings.push(
      createFactMismatchWarning(
        WarningCode.FACT_MISMATCH_PROPERTY_ADDRESS,
        wizardAddressParts,
        extractedAddressParts,
        docId,
        'tenancy_agreement'
      )
    );
    return warnings;
  }

  // If postcodes match or not available, compare full address
  if (
    extractedAddressParts &&
    wizardAddressParts &&
    !areAddressesSimilar(
      extractedAddressParts,
      wizardAddressParts,
      config.minStringSimilarity
    )
  ) {
    warnings.push(
      createFactMismatchWarning(
        WarningCode.FACT_MISMATCH_PROPERTY_ADDRESS,
        wizardAddressParts,
        extractedAddressParts,
        docId,
        'tenancy_agreement'
      )
    );
  }

  return warnings;
}

/**
 * Compare extracted tenancy information.
 */
function compareTenancy(
  extracted: NonNullable<EvidenceExtractedFacts['extracted']['tenancy']>,
  wizardFacts: WizardFacts,
  docId: string,
  config: ComparisonConfig
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Compare tenancy start date
  if (extracted.start_date && wizardFacts.tenancy_start_date) {
    if (
      !areDatesEqual(
        extracted.start_date,
        wizardFacts.tenancy_start_date,
        config.dateTolerance
      )
    ) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_TENANCY_START_DATE,
          wizardFacts.tenancy_start_date,
          extracted.start_date,
          docId,
          'tenancy_agreement'
        )
      );
    }
  }

  // Compare rent amount
  const wizardRent = parseFloat(wizardFacts.rent_amount);
  if (extracted.rent_amount && !isNaN(wizardRent)) {
    if (
      !areAmountsEqual(
        extracted.rent_amount,
        wizardRent,
        config.amountTolerance
      )
    ) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_RENT_AMOUNT,
          `£${wizardRent}`,
          `£${extracted.rent_amount}`,
          docId,
          'tenancy_agreement'
        )
      );
    }
  }

  // Compare rent frequency
  if (extracted.rent_frequency && wizardFacts.rent_frequency) {
    const normalizedExtracted = extracted.rent_frequency.toLowerCase();
    const normalizedWizard = wizardFacts.rent_frequency.toLowerCase();
    if (normalizedExtracted !== normalizedWizard) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_RENT_FREQUENCY,
          wizardFacts.rent_frequency,
          extracted.rent_frequency,
          docId,
          'tenancy_agreement'
        )
      );
    }
  }

  return warnings;
}

/**
 * Compare extracted deposit information.
 */
function compareDeposit(
  extracted: NonNullable<EvidenceExtractedFacts['extracted']['deposit']>,
  wizardFacts: WizardFacts,
  docId: string,
  config: ComparisonConfig
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Compare deposit amount
  const wizardDeposit = parseFloat(wizardFacts.deposit_amount);
  if (extracted.amount && !isNaN(wizardDeposit)) {
    if (!areAmountsEqual(extracted.amount, wizardDeposit, config.amountTolerance)) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_DEPOSIT_AMOUNT,
          `£${wizardDeposit}`,
          `£${extracted.amount}`,
          docId,
          'deposit_certificate'
        )
      );
    }
  }

  // Compare deposit scheme
  if (extracted.scheme_name && wizardFacts.deposit_scheme_name) {
    const normalizedExtracted = extracted.scheme_name.toUpperCase().replace(/[^A-Z]/g, '');
    const normalizedWizard = wizardFacts.deposit_scheme_name.toUpperCase().replace(/[^A-Z]/g, '');
    if (normalizedExtracted !== normalizedWizard) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_DEPOSIT_SCHEME,
          wizardFacts.deposit_scheme_name,
          extracted.scheme_name,
          docId,
          'deposit_certificate'
        )
      );
    }
  }

  return warnings;
}

/**
 * Compare extracted notice information.
 */
function compareNotice(
  extracted: NonNullable<EvidenceExtractedFacts['extracted']['notice']>,
  wizardFacts: WizardFacts,
  docId: string,
  config: ComparisonConfig
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Compare notice served date
  const wizardServedDate =
    wizardFacts.notice_served_date || wizardFacts.notice_service_date;
  if (extracted.served_date && wizardServedDate) {
    if (!areDatesEqual(extracted.served_date, wizardServedDate, config.dateTolerance)) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_NOTICE_SERVED_DATE,
          wizardServedDate,
          extracted.served_date,
          docId,
          'notice'
        )
      );
    }
  }

  // Compare notice expiry date
  if (extracted.expiry_date && wizardFacts.notice_expiry_date) {
    if (
      !areDatesEqual(
        extracted.expiry_date,
        wizardFacts.notice_expiry_date,
        config.dateTolerance
      )
    ) {
      warnings.push(
        createFactMismatchWarning(
          WarningCode.FACT_MISMATCH_NOTICE_EXPIRY_DATE,
          wizardFacts.notice_expiry_date,
          extracted.expiry_date,
          docId,
          'notice'
        )
      );
    }
  }

  return warnings;
}

// =============================================================================
// Missing Category Checks
// =============================================================================

/**
 * Check for missing upload categories based on wizard answers.
 */
function checkMissingCategories(
  bundle: EvidenceBundle,
  wizardFacts: WizardFacts
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Tenancy agreement is always recommended
  if (!hasUploadsForCategory(bundle, EvidenceCategory.TENANCY_AGREEMENT)) {
    const warning = createMissingCategoryWarning(EvidenceCategory.TENANCY_AGREEMENT);
    if (warning) warnings.push(warning);
  }

  // Deposit protection - only if deposit protected is true
  const depositProtected =
    wizardFacts.deposit_protected === true ||
    wizardFacts['section21.deposit_protected'] === true;
  if (
    depositProtected &&
    !hasUploadsForCategory(bundle, EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE)
  ) {
    const warning = createMissingCategoryWarning(
      EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE
    );
    if (warning) warnings.push(warning);
  }

  // EPC - only if marked as served (Section 21)
  const route = wizardFacts.selected_notice_route || wizardFacts.eviction_route;
  if (
    route === 'section_21' &&
    wizardFacts.epc_gas_cert_served === true &&
    !hasUploadsForCategory(bundle, EvidenceCategory.EPC)
  ) {
    const warning = createMissingCategoryWarning(EvidenceCategory.EPC);
    if (warning) warnings.push(warning);
  }

  // Gas safety - only if property has gas and cert marked as served
  if (
    wizardFacts.has_gas_appliances === true &&
    wizardFacts.epc_gas_cert_served === true &&
    !hasUploadsForCategory(bundle, EvidenceCategory.GAS_SAFETY_CERTIFICATE)
  ) {
    const warning = createMissingCategoryWarning(
      EvidenceCategory.GAS_SAFETY_CERTIFICATE
    );
    if (warning) warnings.push(warning);
  }

  // How to Rent - only if marked as served (post-Oct 2015 tenancies)
  if (
    route === 'section_21' &&
    wizardFacts.how_to_rent_served === true &&
    !hasUploadsForCategory(bundle, EvidenceCategory.HOW_TO_RENT_PROOF)
  ) {
    const warning = createMissingCategoryWarning(EvidenceCategory.HOW_TO_RENT_PROOF);
    if (warning) warnings.push(warning);
  }

  return warnings;
}

/**
 * Check for missing proofs based on wizard answers.
 */
function checkMissingProofs(
  bundle: EvidenceBundle,
  wizardFacts: WizardFacts,
  extractedFacts: EvidenceExtractedFacts[]
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  // Helper to check if any extracted doc contains compliance info
  const hasComplianceDoc = (field: keyof NonNullable<EvidenceExtractedFacts['extracted']['compliance']>) =>
    extractedFacts.some((f) => f.extracted.compliance?.[field]);

  // Deposit protected but no certificate found
  const depositProtected =
    wizardFacts.deposit_protected === true ||
    wizardFacts['section21.deposit_protected'] === true;
  const hasDepositDoc = extractedFacts.some(
    (f) =>
      f.detectedDocType.type === EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE ||
      f.extracted.deposit?.scheme_name
  );
  if (depositProtected && !hasDepositDoc) {
    warnings.push(createWarning(WarningCode.FACT_MISSING_PROOF_DEPOSIT_PROTECTION));
  }

  // Prescribed info served but no proof
  const prescribedInfoServed =
    wizardFacts.prescribed_info_served === true ||
    wizardFacts['section21.prescribed_info_served'] === true;
  const hasPrescribedDoc = extractedFacts.some(
    (f) => f.detectedDocType.type === EvidenceCategory.PRESCRIBED_INFORMATION_PROOF
  );
  if (prescribedInfoServed && !hasPrescribedDoc && !hasDepositDoc) {
    warnings.push(createWarning(WarningCode.FACT_MISSING_PROOF_PRESCRIBED_INFO));
  }

  // EPC served but no EPC doc found
  const epcServed = wizardFacts.epc_gas_cert_served === true;
  if (epcServed && !hasComplianceDoc('epc_rating')) {
    warnings.push(createWarning(WarningCode.FACT_MISSING_PROOF_EPC));
  }

  // Gas cert served but no gas doc found
  if (
    wizardFacts.has_gas_appliances === true &&
    epcServed &&
    !hasComplianceDoc('gas_cert_date')
  ) {
    warnings.push(createWarning(WarningCode.FACT_MISSING_PROOF_GAS_SAFETY));
  }

  // How to Rent served but no proof
  const howToRentServed =
    wizardFacts.how_to_rent_served === true ||
    wizardFacts['section21.how_to_rent_served'] === true;
  if (howToRentServed && !hasComplianceDoc('how_to_rent_present')) {
    const hasHowToRentDoc = extractedFacts.some(
      (f) => f.detectedDocType.type === EvidenceCategory.HOW_TO_RENT_PROOF
    );
    if (!hasHowToRentDoc) {
      warnings.push(createWarning(WarningCode.FACT_MISSING_PROOF_HOW_TO_RENT));
    }
  }

  return warnings;
}

/**
 * Check for logical contradictions between route and facts.
 */
function checkContradictions(
  extractedFacts: EvidenceExtractedFacts[],
  wizardFacts: WizardFacts
): SmartReviewWarning[] {
  const warnings: SmartReviewWarning[] = [];

  const route = wizardFacts.selected_notice_route || wizardFacts.eviction_route;

  // Section 21 + deposit not protected = contradiction
  if (route === 'section_21') {
    const depositProtected =
      wizardFacts.deposit_protected === true ||
      wizardFacts['section21.deposit_protected'] === true;
    const depositTaken =
      wizardFacts.deposit_taken === true ||
      (wizardFacts.deposit_amount && parseFloat(wizardFacts.deposit_amount) > 0);

    if (depositTaken && depositProtected === false) {
      warnings.push(
        createWarning(WarningCode.FACT_CONTRADICTION_SECTION21_DEPOSIT_NOT_PROTECTED)
      );
    }
  }

  // Ground 8 + insufficient arrears = potential issue
  if (route === 'section_8') {
    const grounds = wizardFacts.section8_grounds || [];
    const groundsStr = Array.isArray(grounds) ? grounds.join(' ') : String(grounds);
    const hasGround8 =
      groundsStr.toLowerCase().includes('ground 8') ||
      groundsStr.includes('8');

    if (hasGround8) {
      const totalArrears = parseFloat(wizardFacts.total_arrears || 0);
      const rentAmount = parseFloat(wizardFacts.rent_amount || 0);
      const rentFrequency = wizardFacts.rent_frequency?.toLowerCase();

      // Ground 8 requires 8 weeks (weekly) or 2 months arrears
      let threshold = 0;
      if (rentFrequency === 'weekly') {
        threshold = rentAmount * 8;
      } else if (rentFrequency === 'monthly') {
        threshold = rentAmount * 2;
      } else if (rentFrequency === 'fortnightly') {
        threshold = rentAmount * 4;
      }

      if (threshold > 0 && totalArrears < threshold) {
        warnings.push(
          createWarning(WarningCode.FACT_CONTRADICTION_ARREARS_AMOUNT_VS_GROUND8, {
            comparison: {
              wizardValue: `£${totalArrears}`,
              extractedValue: `Ground 8 threshold: £${threshold}`,
            },
          })
        );
      }
    }
  }

  return warnings;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if two names are similar enough.
 */
function areNamesSimilar(
  name1: string,
  name2: string,
  minSimilarity: number
): boolean {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);

  if (normalized1 === normalized2) return true;

  // Check if one contains the other (partial name match)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  // Calculate similarity score
  const similarity = calculateStringSimilarity(normalized1, normalized2);
  return similarity >= minSimilarity;
}

/**
 * Check if two addresses are similar enough.
 */
function areAddressesSimilar(
  addr1: string,
  addr2: string,
  minSimilarity: number
): boolean {
  const normalized1 = normalizeAddress(addr1);
  const normalized2 = normalizeAddress(addr2);

  if (normalized1 === normalized2) return true;

  const similarity = calculateStringSimilarity(normalized1, normalized2);
  return similarity >= minSimilarity;
}

/**
 * Check if two dates are equal within tolerance.
 */
function areDatesEqual(
  date1: string,
  date2: string,
  toleranceDays: number
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }

  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= toleranceDays;
}

/**
 * Check if two amounts are equal within tolerance.
 */
function areAmountsEqual(
  amount1: number,
  amount2: number,
  tolerancePercent: number
): boolean {
  if (amount1 === amount2) return true;

  const diff = Math.abs(amount1 - amount2);
  const avg = (amount1 + amount2) / 2;

  if (avg === 0) return amount1 === amount2;

  return diff / avg <= tolerancePercent;
}

/**
 * Normalize a name for comparison.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize an address for comparison.
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[,\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(street|st|road|rd|lane|ln|avenue|ave|drive|dr|close|cl|court|ct|place|pl)\b/g, '')
    .replace(/\b(flat|unit|apartment|apt)\b/g, '')
    .trim();
}

/**
 * Normalize a postcode for comparison.
 */
function normalizePostcode(postcode: string | undefined): string {
  if (!postcode) return '';
  return postcode.toUpperCase().replace(/\s+/g, '');
}

/**
 * Calculate string similarity using Levenshtein distance.
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  // Calculate Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1 - distance / maxLen;
}

/**
 * Deduplicate warnings by code.
 */
function deduplicateWarnings(warnings: SmartReviewWarning[]): SmartReviewWarning[] {
  const seen = new Map<string, SmartReviewWarning>();

  for (const warning of warnings) {
    // Use code + related uploads as key for dedup
    const key = `${warning.code}:${warning.relatedUploads.join(',')}`;
    if (!seen.has(key)) {
      seen.set(key, warning);
    }
  }

  return Array.from(seen.values());
}
