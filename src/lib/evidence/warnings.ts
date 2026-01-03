/**
 * Smart Review Warning Taxonomy
 *
 * Defines warning codes, severities, and message templates for the Smart Review system.
 * All warnings use safe language: "possible mismatch", "could not verify", "missing evidence".
 * NEVER uses: "invalid", "guarantee", "court will", "legal advice".
 *
 * @module src/lib/evidence/warnings
 */

import { EvidenceCategory, EVIDENCE_CATEGORY_LABELS } from './schema';

// =============================================================================
// Warning Severity
// =============================================================================

/**
 * Severity levels for Smart Review warnings.
 *
 * IMPORTANT: In v1, Smart Review warnings NEVER block generation.
 * BLOCKER severity indicates "high priority warning" only.
 * Blocking behavior can be enabled via feature flag in future versions.
 */
export type WarningSeverity = 'info' | 'warning' | 'blocker';

/**
 * Labels for severity levels (user-facing).
 */
export const SEVERITY_LABELS: Record<WarningSeverity, string> = {
  info: 'Note',
  warning: 'Warning',
  blocker: 'Attention Required',
};

/**
 * Priority order for sorting warnings (higher = more urgent).
 */
export const SEVERITY_PRIORITY: Record<WarningSeverity, number> = {
  blocker: 3,
  warning: 2,
  info: 1,
};

// =============================================================================
// Warning Codes
// =============================================================================

/**
 * All warning codes for Smart Review.
 * Organized by category: UPLOAD_, EXTRACT_, FACT_, PRIVACY_
 */
export enum WarningCode {
  // Upload/Document warnings
  UPLOAD_MISSING_CATEGORY_TENANCY_AGREEMENT = 'UPLOAD_MISSING_CATEGORY_TENANCY_AGREEMENT',
  UPLOAD_MISSING_CATEGORY_BANK_STATEMENTS = 'UPLOAD_MISSING_CATEGORY_BANK_STATEMENTS',
  UPLOAD_MISSING_CATEGORY_DEPOSIT_PROTECTION = 'UPLOAD_MISSING_CATEGORY_DEPOSIT_PROTECTION',
  UPLOAD_MISSING_CATEGORY_EPC = 'UPLOAD_MISSING_CATEGORY_EPC',
  UPLOAD_MISSING_CATEGORY_GAS_SAFETY = 'UPLOAD_MISSING_CATEGORY_GAS_SAFETY',
  UPLOAD_MISSING_CATEGORY_HOW_TO_RENT = 'UPLOAD_MISSING_CATEGORY_HOW_TO_RENT',
  UPLOAD_MISSING_CATEGORY_NOTICE_SERVICE = 'UPLOAD_MISSING_CATEGORY_NOTICE_SERVICE',

  // Extraction warnings
  EXTRACT_UNREADABLE_DOCUMENT = 'EXTRACT_UNREADABLE_DOCUMENT',
  EXTRACT_DOC_TYPE_UNCERTAIN = 'EXTRACT_DOC_TYPE_UNCERTAIN',
  EXTRACT_LOW_CONFIDENCE = 'EXTRACT_LOW_CONFIDENCE',
  EXTRACT_PARTIAL_DATA = 'EXTRACT_PARTIAL_DATA',
  EXTRACT_FAILED = 'EXTRACT_FAILED',

  // Fact mismatch warnings
  FACT_MISMATCH_LANDLORD_NAME = 'FACT_MISMATCH_LANDLORD_NAME',
  FACT_MISMATCH_TENANT_NAME = 'FACT_MISMATCH_TENANT_NAME',
  FACT_MISMATCH_PROPERTY_ADDRESS = 'FACT_MISMATCH_PROPERTY_ADDRESS',
  FACT_MISMATCH_TENANCY_START_DATE = 'FACT_MISMATCH_TENANCY_START_DATE',
  FACT_MISMATCH_RENT_AMOUNT = 'FACT_MISMATCH_RENT_AMOUNT',
  FACT_MISMATCH_RENT_FREQUENCY = 'FACT_MISMATCH_RENT_FREQUENCY',
  FACT_MISMATCH_DEPOSIT_AMOUNT = 'FACT_MISMATCH_DEPOSIT_AMOUNT',
  FACT_MISMATCH_DEPOSIT_SCHEME = 'FACT_MISMATCH_DEPOSIT_SCHEME',
  FACT_MISMATCH_NOTICE_SERVED_DATE = 'FACT_MISMATCH_NOTICE_SERVED_DATE',
  FACT_MISMATCH_NOTICE_EXPIRY_DATE = 'FACT_MISMATCH_NOTICE_EXPIRY_DATE',

  // Missing proof warnings
  FACT_MISSING_PROOF_DEPOSIT_PROTECTION = 'FACT_MISSING_PROOF_DEPOSIT_PROTECTION',
  FACT_MISSING_PROOF_EPC = 'FACT_MISSING_PROOF_EPC',
  FACT_MISSING_PROOF_GAS_SAFETY = 'FACT_MISSING_PROOF_GAS_SAFETY',
  FACT_MISSING_PROOF_HOW_TO_RENT = 'FACT_MISSING_PROOF_HOW_TO_RENT',
  FACT_MISSING_PROOF_NOTICE_SERVICE = 'FACT_MISSING_PROOF_NOTICE_SERVICE',
  FACT_MISSING_PROOF_PRESCRIBED_INFO = 'FACT_MISSING_PROOF_PRESCRIBED_INFO',

  // Contradiction warnings
  FACT_CONTRADICTION_ARREARS_AMOUNT_VS_GROUND8 = 'FACT_CONTRADICTION_ARREARS_AMOUNT_VS_GROUND8',
  FACT_CONTRADICTION_SECTION21_DEPOSIT_NOT_PROTECTED = 'FACT_CONTRADICTION_SECTION21_DEPOSIT_NOT_PROTECTED',
  FACT_CONTRADICTION_DATES_INCONSISTENT = 'FACT_CONTRADICTION_DATES_INCONSISTENT',

  // Privacy/sensitivity warnings
  PRIVACY_REDACTION_SUGGESTED = 'PRIVACY_REDACTION_SUGGESTED',
  PRIVACY_SENSITIVE_DATA_DETECTED = 'PRIVACY_SENSITIVE_DATA_DETECTED',

  // Processing limit warnings (v1 hardening)
  SMART_REVIEW_LIMIT_REACHED = 'SMART_REVIEW_LIMIT_REACHED',
  SMART_REVIEW_TIMEOUT = 'SMART_REVIEW_TIMEOUT',
  SMART_REVIEW_PAGE_LIMIT_REACHED = 'SMART_REVIEW_PAGE_LIMIT_REACHED',
}

// =============================================================================
// Warning Interface
// =============================================================================

/**
 * A single Smart Review warning.
 */
export interface SmartReviewWarning {
  /** Unique warning code */
  code: WarningCode;
  /** Severity level */
  severity: WarningSeverity;
  /** Short title for display */
  title: string;
  /** Detailed message explaining the issue */
  message: string;
  /** Wizard facts fields related to this warning */
  fields: string[];
  /** Document IDs related to this warning */
  relatedUploads: string[];
  /** Suggested action for the user */
  suggestedUserAction: string;
  /** Confidence in this warning (0-1), if applicable */
  confidence?: number;
  /** Values that were compared (for debugging/display) */
  comparison?: {
    wizardValue: any;
    extractedValue: any;
    source?: string;
  };
}

// =============================================================================
// Warning Templates
// =============================================================================

/**
 * Template for creating warnings with consistent messaging.
 */
interface WarningTemplate {
  severity: WarningSeverity;
  title: string;
  messageTemplate: string;
  suggestedUserActionTemplate: string;
  defaultFields: string[];
}

/**
 * Templates for all warning codes.
 */
const WARNING_TEMPLATES: Record<WarningCode, WarningTemplate> = {
  // Upload missing warnings
  [WarningCode.UPLOAD_MISSING_CATEGORY_TENANCY_AGREEMENT]: {
    severity: 'warning',
    title: 'Missing tenancy agreement upload',
    messageTemplate: 'No tenancy agreement document was found in your uploads. Consider uploading the signed tenancy agreement to help verify case details.',
    suggestedUserActionTemplate: 'Upload the signed tenancy agreement or AST document.',
    defaultFields: ['evidence.tenancy_agreement_uploads'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_BANK_STATEMENTS]: {
    severity: 'info',
    title: 'No bank statements uploaded',
    messageTemplate: 'No bank statements or rent payment records found. These can help support rent payment history claims.',
    suggestedUserActionTemplate: 'Consider uploading bank statements showing rent payments received.',
    defaultFields: ['evidence.bank_statements_uploads'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_DEPOSIT_PROTECTION]: {
    severity: 'warning',
    title: 'Missing deposit protection certificate',
    messageTemplate: 'No deposit protection certificate was found. If you indicated the deposit is protected, consider uploading the certificate.',
    suggestedUserActionTemplate: 'Upload the deposit protection certificate from your scheme (DPS, MyDeposits, or TDS).',
    defaultFields: ['evidence.deposit_protection_uploads', 'deposit_protected'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_EPC]: {
    severity: 'warning',
    title: 'Missing EPC document',
    messageTemplate: 'No Energy Performance Certificate (EPC) was found in your uploads.',
    suggestedUserActionTemplate: 'Upload the current EPC for the property.',
    defaultFields: ['evidence.epc_uploads', 'epc_gas_cert_served'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_GAS_SAFETY]: {
    severity: 'warning',
    title: 'Missing gas safety certificate',
    messageTemplate: 'No gas safety certificate (CP12) was found in your uploads.',
    suggestedUserActionTemplate: 'Upload the current gas safety certificate if the property has gas appliances.',
    defaultFields: ['evidence.gas_safety_uploads', 'epc_gas_cert_served'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_HOW_TO_RENT]: {
    severity: 'warning',
    title: 'Missing How to Rent proof',
    messageTemplate: 'No proof of serving the How to Rent guide was found.',
    suggestedUserActionTemplate: 'Upload evidence that the How to Rent guide was provided (email, signed acknowledgment).',
    defaultFields: ['evidence.how_to_rent_uploads', 'how_to_rent_served'],
  },
  [WarningCode.UPLOAD_MISSING_CATEGORY_NOTICE_SERVICE]: {
    severity: 'info',
    title: 'No notice service proof uploaded',
    messageTemplate: 'No proof of notice service was found. Consider uploading proof of how the notice was served.',
    suggestedUserActionTemplate: 'Upload proof of notice service (photo, postage receipt, email confirmation).',
    defaultFields: ['evidence.notice_service_uploads'],
  },

  // Extraction warnings
  [WarningCode.EXTRACT_UNREADABLE_DOCUMENT]: {
    severity: 'warning',
    title: 'Document could not be read',
    messageTemplate: 'We could not extract text from this document. It may be a scanned image with poor quality.',
    suggestedUserActionTemplate: 'Try uploading a clearer scan or the original digital document.',
    defaultFields: [],
  },
  [WarningCode.EXTRACT_DOC_TYPE_UNCERTAIN]: {
    severity: 'info',
    title: 'Document type uncertain',
    messageTemplate: 'We could not confidently identify this document type. The detected type may be incorrect.',
    suggestedUserActionTemplate: 'Check that the document is in the correct category.',
    defaultFields: [],
  },
  [WarningCode.EXTRACT_LOW_CONFIDENCE]: {
    severity: 'info',
    title: 'Low confidence extraction',
    messageTemplate: 'Some information was extracted with low confidence. Please verify the details manually.',
    suggestedUserActionTemplate: 'Review the extracted information and correct any errors in your answers.',
    defaultFields: [],
  },
  [WarningCode.EXTRACT_PARTIAL_DATA]: {
    severity: 'info',
    title: 'Partial information extracted',
    messageTemplate: 'Only some expected information could be extracted from this document.',
    suggestedUserActionTemplate: 'Ensure all required information is visible in the uploaded document.',
    defaultFields: [],
  },
  [WarningCode.EXTRACT_FAILED]: {
    severity: 'warning',
    title: 'Extraction failed',
    messageTemplate: 'We were unable to process this document. It may be corrupted or in an unsupported format.',
    suggestedUserActionTemplate: 'Try re-uploading the document or converting it to PDF format.',
    defaultFields: [],
  },

  // Fact mismatch warnings
  [WarningCode.FACT_MISMATCH_LANDLORD_NAME]: {
    severity: 'warning',
    title: 'Possible landlord name mismatch',
    messageTemplate: 'The landlord name in your answers ("{wizardValue}") appears different from what we found in the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the landlord name is correct and matches your official documents.',
    defaultFields: ['landlord_full_name', 'landlord_name'],
  },
  [WarningCode.FACT_MISMATCH_TENANT_NAME]: {
    severity: 'warning',
    title: 'Possible tenant name mismatch',
    messageTemplate: 'The tenant name in your answers ("{wizardValue}") appears different from what we found in the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the tenant name is correct and matches the tenancy agreement.',
    defaultFields: ['tenant_full_name', 'tenant_name'],
  },
  [WarningCode.FACT_MISMATCH_PROPERTY_ADDRESS]: {
    severity: 'warning',
    title: 'Possible property address mismatch',
    messageTemplate: 'The property address in your answers appears different from what we found in the document.',
    suggestedUserActionTemplate: 'Please verify the property address matches your tenancy agreement.',
    defaultFields: ['property_address_line1', 'property_address_postcode'],
  },
  [WarningCode.FACT_MISMATCH_TENANCY_START_DATE]: {
    severity: 'warning',
    title: 'Possible tenancy start date mismatch',
    messageTemplate: 'The tenancy start date in your answers ("{wizardValue}") appears different from the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the tenancy start date matches your tenancy agreement.',
    defaultFields: ['tenancy_start_date'],
  },
  [WarningCode.FACT_MISMATCH_RENT_AMOUNT]: {
    severity: 'warning',
    title: 'Possible rent amount mismatch',
    messageTemplate: 'The rent amount in your answers ({wizardValue}) appears different from the document ({extractedValue}).',
    suggestedUserActionTemplate: 'Please verify the rent amount matches your tenancy agreement.',
    defaultFields: ['rent_amount'],
  },
  [WarningCode.FACT_MISMATCH_RENT_FREQUENCY]: {
    severity: 'info',
    title: 'Possible rent frequency mismatch',
    messageTemplate: 'The rent payment frequency in your answers ("{wizardValue}") appears different from the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the payment frequency matches your tenancy agreement.',
    defaultFields: ['rent_frequency'],
  },
  [WarningCode.FACT_MISMATCH_DEPOSIT_AMOUNT]: {
    severity: 'warning',
    title: 'Possible deposit amount mismatch',
    messageTemplate: 'The deposit amount in your answers ({wizardValue}) appears different from the document ({extractedValue}).',
    suggestedUserActionTemplate: 'Please verify the deposit amount matches your records.',
    defaultFields: ['deposit_amount'],
  },
  [WarningCode.FACT_MISMATCH_DEPOSIT_SCHEME]: {
    severity: 'info',
    title: 'Possible deposit scheme mismatch',
    messageTemplate: 'The deposit protection scheme in your answers ("{wizardValue}") appears different from the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the deposit scheme matches your protection certificate.',
    defaultFields: ['deposit_scheme_name'],
  },
  [WarningCode.FACT_MISMATCH_NOTICE_SERVED_DATE]: {
    severity: 'warning',
    title: 'Possible notice service date mismatch',
    messageTemplate: 'The notice service date in your answers ("{wizardValue}") appears different from the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the date the notice was served.',
    defaultFields: ['notice_served_date'],
  },
  [WarningCode.FACT_MISMATCH_NOTICE_EXPIRY_DATE]: {
    severity: 'info',
    title: 'Possible notice expiry date mismatch',
    messageTemplate: 'The notice expiry date in your answers ("{wizardValue}") appears different from the document ("{extractedValue}").',
    suggestedUserActionTemplate: 'Please verify the notice expiry date.',
    defaultFields: ['notice_expiry_date'],
  },

  // Missing proof warnings
  [WarningCode.FACT_MISSING_PROOF_DEPOSIT_PROTECTION]: {
    severity: 'warning',
    title: 'Deposit protection not verified',
    messageTemplate: 'You indicated the deposit is protected, but we could not find supporting documentation.',
    suggestedUserActionTemplate: 'Upload the deposit protection certificate from your scheme.',
    defaultFields: ['deposit_protected', 'evidence.deposit_protection_uploads'],
  },
  [WarningCode.FACT_MISSING_PROOF_EPC]: {
    severity: 'warning',
    title: 'EPC not verified',
    messageTemplate: 'You indicated EPC was served, but we could not find the EPC document in your uploads.',
    suggestedUserActionTemplate: 'Upload the Energy Performance Certificate for the property.',
    defaultFields: ['epc_gas_cert_served', 'evidence.epc_uploads'],
  },
  [WarningCode.FACT_MISSING_PROOF_GAS_SAFETY]: {
    severity: 'warning',
    title: 'Gas safety certificate not verified',
    messageTemplate: 'You indicated gas certificate was served, but we could not find it in your uploads.',
    suggestedUserActionTemplate: 'Upload the gas safety certificate (CP12).',
    defaultFields: ['epc_gas_cert_served', 'evidence.gas_safety_uploads'],
  },
  [WarningCode.FACT_MISSING_PROOF_HOW_TO_RENT]: {
    severity: 'warning',
    title: 'How to Rent guide service not verified',
    messageTemplate: 'You indicated the How to Rent guide was served, but we could not find supporting proof.',
    suggestedUserActionTemplate: 'Upload proof the How to Rent guide was provided (email, acknowledgment).',
    defaultFields: ['how_to_rent_served', 'evidence.how_to_rent_uploads'],
  },
  [WarningCode.FACT_MISSING_PROOF_NOTICE_SERVICE]: {
    severity: 'info',
    title: 'Notice service proof not found',
    messageTemplate: 'No proof of notice service was found in your uploads.',
    suggestedUserActionTemplate: 'Consider uploading proof of how the notice was served.',
    defaultFields: ['evidence.notice_service_uploads'],
  },
  [WarningCode.FACT_MISSING_PROOF_PRESCRIBED_INFO]: {
    severity: 'warning',
    title: 'Prescribed information not verified',
    messageTemplate: 'You indicated prescribed information was served, but we could not find supporting documentation.',
    suggestedUserActionTemplate: 'Upload proof the prescribed deposit information was provided.',
    defaultFields: ['prescribed_info_served', 'evidence.prescribed_info_uploads'],
  },

  // Contradiction warnings
  [WarningCode.FACT_CONTRADICTION_ARREARS_AMOUNT_VS_GROUND8]: {
    severity: 'warning',
    title: 'Possible arrears inconsistency',
    messageTemplate: 'The arrears amount may not meet the threshold for Ground 8 (8 weeks or 2 months). Current arrears: {wizardValue}.',
    suggestedUserActionTemplate: 'Verify the arrears amount and ensure it meets Ground 8 requirements at the hearing date.',
    defaultFields: ['total_arrears', 'section8_grounds'],
  },
  [WarningCode.FACT_CONTRADICTION_SECTION21_DEPOSIT_NOT_PROTECTED]: {
    severity: 'blocker',
    title: 'Section 21 may require deposit protection',
    messageTemplate: 'Section 21 route selected but deposit protection may not be confirmed. This could affect notice validity.',
    suggestedUserActionTemplate: 'Verify the deposit is protected and prescribed information was served.',
    defaultFields: ['selected_notice_route', 'deposit_protected'],
  },
  [WarningCode.FACT_CONTRADICTION_DATES_INCONSISTENT]: {
    severity: 'warning',
    title: 'Possible date inconsistency',
    messageTemplate: 'Some dates appear inconsistent. Please review your timeline.',
    suggestedUserActionTemplate: 'Review and verify all dates in your answers.',
    defaultFields: ['tenancy_start_date', 'notice_served_date'],
  },

  // Privacy warnings
  [WarningCode.PRIVACY_REDACTION_SUGGESTED]: {
    severity: 'info',
    title: 'Consider redacting sensitive information',
    messageTemplate: 'The uploaded document may contain sensitive personal or financial information.',
    suggestedUserActionTemplate: 'Consider redacting bank account numbers or other sensitive details before final submission.',
    defaultFields: [],
  },
  [WarningCode.PRIVACY_SENSITIVE_DATA_DETECTED]: {
    severity: 'info',
    title: 'Sensitive data detected',
    messageTemplate: 'We detected potentially sensitive information in this document (e.g., bank account numbers).',
    suggestedUserActionTemplate: 'Ensure you are comfortable including this information in your case bundle.',
    defaultFields: [],
  },

  // Processing limit warnings (v1 hardening)
  [WarningCode.SMART_REVIEW_LIMIT_REACHED]: {
    severity: 'info',
    title: 'Processing limit reached',
    messageTemplate: 'Some documents were not processed due to processing limits. {wizardValue} of {extractedValue} documents were reviewed.',
    suggestedUserActionTemplate: 'The most important documents have been reviewed. You may re-upload key documents to prioritize them.',
    defaultFields: [],
  },
  [WarningCode.SMART_REVIEW_TIMEOUT]: {
    severity: 'info',
    title: 'Document processing timed out',
    messageTemplate: 'Processing of this document took too long and was skipped.',
    suggestedUserActionTemplate: 'Try uploading a smaller or clearer version of this document.',
    defaultFields: [],
  },
  [WarningCode.SMART_REVIEW_PAGE_LIMIT_REACHED]: {
    severity: 'info',
    title: 'Page limit reached',
    messageTemplate: 'Only the first few pages of this document were reviewed.',
    suggestedUserActionTemplate: 'Ensure important information is on the first pages of multi-page documents.',
    defaultFields: [],
  },
};

// =============================================================================
// Warning Factory Functions
// =============================================================================

/**
 * Create a warning from a template.
 */
export function createWarning(
  code: WarningCode,
  options: {
    relatedUploads?: string[];
    fields?: string[];
    confidence?: number;
    comparison?: {
      wizardValue: any;
      extractedValue: any;
      source?: string;
    };
  } = {}
): SmartReviewWarning {
  const template = WARNING_TEMPLATES[code];

  // Interpolate values into message and action templates
  let message = template.messageTemplate;
  let action = template.suggestedUserActionTemplate;

  if (options.comparison) {
    message = message
      .replace('{wizardValue}', String(options.comparison.wizardValue ?? 'not provided'))
      .replace('{extractedValue}', String(options.comparison.extractedValue ?? 'not found'));
    action = action
      .replace('{wizardValue}', String(options.comparison.wizardValue ?? ''))
      .replace('{extractedValue}', String(options.comparison.extractedValue ?? ''));
  }

  return {
    code,
    severity: template.severity,
    title: template.title,
    message,
    fields: options.fields || template.defaultFields,
    relatedUploads: options.relatedUploads || [],
    suggestedUserAction: action,
    confidence: options.confidence,
    comparison: options.comparison,
  };
}

/**
 * Create a warning for a missing upload category.
 */
export function createMissingCategoryWarning(
  category: EvidenceCategory
): SmartReviewWarning | null {
  const codeMap: Partial<Record<EvidenceCategory, WarningCode>> = {
    [EvidenceCategory.TENANCY_AGREEMENT]: WarningCode.UPLOAD_MISSING_CATEGORY_TENANCY_AGREEMENT,
    [EvidenceCategory.BANK_STATEMENTS]: WarningCode.UPLOAD_MISSING_CATEGORY_BANK_STATEMENTS,
    [EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE]: WarningCode.UPLOAD_MISSING_CATEGORY_DEPOSIT_PROTECTION,
    [EvidenceCategory.EPC]: WarningCode.UPLOAD_MISSING_CATEGORY_EPC,
    [EvidenceCategory.GAS_SAFETY_CERTIFICATE]: WarningCode.UPLOAD_MISSING_CATEGORY_GAS_SAFETY,
    [EvidenceCategory.HOW_TO_RENT_PROOF]: WarningCode.UPLOAD_MISSING_CATEGORY_HOW_TO_RENT,
    [EvidenceCategory.NOTICE_SERVED_PROOF]: WarningCode.UPLOAD_MISSING_CATEGORY_NOTICE_SERVICE,
  };

  const warningCode = codeMap[category];
  if (!warningCode) {
    return null;
  }

  return createWarning(warningCode);
}

/**
 * Create a fact mismatch warning.
 */
export function createFactMismatchWarning(
  code: WarningCode,
  wizardValue: any,
  extractedValue: any,
  docId: string,
  source?: string
): SmartReviewWarning {
  return createWarning(code, {
    relatedUploads: [docId],
    comparison: {
      wizardValue,
      extractedValue,
      source,
    },
  });
}

// =============================================================================
// Warning Validation (Safe Language Check)
// =============================================================================

/**
 * Forbidden phrases that must NEVER appear in warning messages.
 */
const FORBIDDEN_PHRASES = [
  'invalid',
  'guarantee',
  'court will',
  'legal advice',
  'legally',
  'will be rejected',
  'will be accepted',
  'must be',
  'shall be',
  'is required by law',
  'legally required',
  'legally binding',
  'you must',
  'you should consult',
];

/**
 * Validate that a warning message uses safe language.
 * Used in tests to ensure compliance.
 */
export function validateWarningSafeLanguage(warning: SmartReviewWarning): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const textToCheck = `${warning.title} ${warning.message} ${warning.suggestedUserAction}`.toLowerCase();

  for (const phrase of FORBIDDEN_PHRASES) {
    if (textToCheck.includes(phrase.toLowerCase())) {
      violations.push(`Contains forbidden phrase: "${phrase}"`);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Validate all warning templates use safe language.
 */
export function validateAllWarningTemplates(): {
  valid: boolean;
  violations: Record<WarningCode, string[]>;
} {
  const violations: Record<string, string[]> = {};
  let valid = true;

  for (const code of Object.values(WarningCode)) {
    const warning = createWarning(code);
    const result = validateWarningSafeLanguage(warning);
    if (!result.valid) {
      valid = false;
      violations[code] = result.violations;
    }
  }

  return { valid, violations: violations as Record<WarningCode, string[]> };
}

// =============================================================================
// Warning Sorting and Filtering
// =============================================================================

/**
 * Sort warnings by severity (most urgent first).
 */
export function sortWarningsBySeverity(warnings: SmartReviewWarning[]): SmartReviewWarning[] {
  return [...warnings].sort((a, b) => {
    return SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity];
  });
}

/**
 * Filter warnings by severity.
 */
export function filterWarningsBySeverity(
  warnings: SmartReviewWarning[],
  severity: WarningSeverity
): SmartReviewWarning[] {
  return warnings.filter((w) => w.severity === severity);
}

/**
 * Group warnings by related document.
 */
export function groupWarningsByDocument(
  warnings: SmartReviewWarning[]
): Record<string, SmartReviewWarning[]> {
  const groups: Record<string, SmartReviewWarning[]> = {
    general: [],
  };

  for (const warning of warnings) {
    if (warning.relatedUploads.length === 0) {
      groups.general.push(warning);
    } else {
      for (const docId of warning.relatedUploads) {
        if (!groups[docId]) {
          groups[docId] = [];
        }
        groups[docId].push(warning);
      }
    }
  }

  return groups;
}

/**
 * Group warnings by field.
 */
export function groupWarningsByField(
  warnings: SmartReviewWarning[]
): Record<string, SmartReviewWarning[]> {
  const groups: Record<string, SmartReviewWarning[]> = {
    general: [],
  };

  for (const warning of warnings) {
    if (warning.fields.length === 0) {
      groups.general.push(warning);
    } else {
      for (const field of warning.fields) {
        if (!groups[field]) {
          groups[field] = [];
        }
        groups[field].push(warning);
      }
    }
  }

  return groups;
}

/**
 * Get warning counts by severity.
 */
export function getWarningCounts(warnings: SmartReviewWarning[]): Record<WarningSeverity, number> {
  return {
    blocker: filterWarningsBySeverity(warnings, 'blocker').length,
    warning: filterWarningsBySeverity(warnings, 'warning').length,
    info: filterWarningsBySeverity(warnings, 'info').length,
  };
}
