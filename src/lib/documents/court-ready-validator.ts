/**
 * Court-Ready Document Validator
 *
 * This module validates that documents included in court packs are "court-ready",
 * meaning they contain no template placeholders, instructional text, or incomplete data.
 *
 * CRITICAL: Any document included in a complete_pack must be final-form.
 * Template documents with placeholders should NOT be included in court submissions.
 *
 * SECTION 21 AUDIT (Jan 2026):
 * - Extended to detect Section 21 specific placeholders
 * - Added compliance assertion detection (don't assert compliance unless verified)
 * - Added Form 6A specific checks
 *
 * @module court-ready-validator
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  documentType: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  type: 'placeholder' | 'template_text' | 'missing_data' | 'instruction_text';
  message: string;
  match?: string;
  location?: string;
}

// =============================================================================
// PLACEHOLDER PATTERNS
// =============================================================================

/**
 * Patterns that indicate template placeholders that should NOT appear in court documents
 */
const PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Square bracket placeholders
  { pattern: /\[Your\s+[^\]]+\]/gi, description: 'Placeholder: [Your ...]' },
  { pattern: /\[Date\]/gi, description: 'Placeholder: [Date]' },
  { pattern: /\[date\s+of\s+[^\]]+\]/gi, description: 'Placeholder: [date of ...]' },
  { pattern: /\[Enter\s+[^\]]+\]/gi, description: 'Placeholder: [Enter ...]' },
  { pattern: /\[Insert\s+[^\]]+\]/gi, description: 'Placeholder: [Insert ...]' },
  { pattern: /\[Specify\s+[^\]]+\]/gi, description: 'Placeholder: [Specify ...]' },
  { pattern: /\[Name\]/gi, description: 'Placeholder: [Name]' },
  { pattern: /\[Address\]/gi, description: 'Placeholder: [Address]' },
  { pattern: /\[Amount\]/gi, description: 'Placeholder: [Amount]' },
  { pattern: /\[\s*\]/g, description: 'Empty brackets: []' },

  // Curly brace template markers (Handlebars that weren't rendered)
  { pattern: /\{\{[^}]+\}\}/g, description: 'Unrendered Handlebars template' },

  // Generic placeholder patterns
  { pattern: /\[_+\]/g, description: 'Underscore placeholder: [___]' },
  { pattern: /\[[Xx]+\]/g, description: 'X placeholder: [XXX]' },
];

/**
 * Text patterns that indicate template/instructional content
 */
const TEMPLATE_TEXT_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Template document markers
  { pattern: /TEMPLATE\s+DOCUMENT/gi, description: 'Template document marker' },
  { pattern: /⚠\s*TEMPLATE/gi, description: 'Template warning marker' },
  { pattern: /This\s+is\s+a\s+template/gi, description: 'Template declaration' },

  // Instructional text
  { pattern: /Enter\s+the\s+date/gi, description: 'Instruction: Enter the date' },
  { pattern: /Fill\s+in\s+the/gi, description: 'Instruction: Fill in the...' },
  { pattern: /Instructions\s+for\s+use/gi, description: 'Instructions section' },
  { pattern: /You\s+must\s+customise/gi, description: 'Customization instruction' },
  { pattern: /Do\s+not\s+claim/gi, description: 'Warning instruction' },
];

/**
 * SECTION 21 SPECIFIC PATTERNS (Jan 2026 Audit)
 * These patterns detect Section 21 specific placeholders and incomplete data
 */
const SECTION21_PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Form 6A specific placeholders
  { pattern: /\(insert\s+full\s+name/gi, description: 'Form 6A: insert full name placeholder' },
  { pattern: /\(insert\s+address/gi, description: 'Form 6A: insert address placeholder' },
  { pattern: /\(insert\s+calendar\s+date/gi, description: 'Form 6A: insert calendar date placeholder' },
  { pattern: /\(insert\s+date/gi, description: 'Form 6A: insert date placeholder' },

  // Section 21 specific incomplete markers
  { pattern: /You\s+are\s+required\s+to\s+leave.*after:\s*$/m, description: 'Section 21: Missing expiry date' },
  { pattern: /To:\s*$/m, description: 'Section 21: Missing tenant name' },

  // Empty date fields (DD/MM/YYYY pattern with blanks)
  { pattern: /Date:\s*$/m, description: 'Missing date value' },
  { pattern: /\/\s*\/\s*20\s/g, description: 'Incomplete date format (blank day/month)' },
];

/**
 * COMPLIANCE ASSERTION PATTERNS (Jan 2026 Audit)
 * These patterns detect statements that assert compliance without verification.
 * Court documents should NOT claim compliance unless it's been verified.
 */
const COMPLIANCE_ASSERTION_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Deposit protection assertions without evidence
  { pattern: /deposit\s+(?:is|was)\s+protected\s+in/gi, description: 'Compliance assertion: deposit protection' },
  { pattern: /prescribed\s+information\s+(?:was|has\s+been)\s+(?:given|served|provided)/gi, description: 'Compliance assertion: prescribed info' },

  // Gas/EPC/How to Rent assertions
  { pattern: /gas\s+safety\s+certificate\s+(?:was|has\s+been)\s+provided/gi, description: 'Compliance assertion: gas safety' },
  { pattern: /EPC\s+(?:was|has\s+been)\s+provided/gi, description: 'Compliance assertion: EPC' },
  { pattern: /How\s+to\s+Rent\s+(?:was|has\s+been)\s+(?:given|provided)/gi, description: 'Compliance assertion: How to Rent' },
];

/**
 * Patterns that indicate missing or placeholder data (£0.00 in wrong context, etc.)
 */
const MISSING_DATA_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Zero amounts where there should be real data
  { pattern: /arrears\s+(?:are|amount\s+to)\s+£0\.00/gi, description: 'Zero arrears amount' },
  { pattern: /total[:\s]+£0\.00/gi, description: 'Zero total amount' },

  // Missing name placeholders
  { pattern: /Landlord:\s*$/m, description: 'Missing landlord name' },
  { pattern: /Tenant:\s*$/m, description: 'Missing tenant name' },

  // Empty or placeholder dates
  { pattern: /on\s+\[date\]/gi, description: 'Missing date' },
  { pattern: /dated?\s*:\s*$/m, description: 'Missing date value' },
];

// =============================================================================
// VALIDATOR FUNCTIONS
// =============================================================================

/**
 * Validate that document content is court-ready (no placeholders or template text)
 *
 * @param content - HTML or text content of the document
 * @param documentType - Type of document being validated (for logging)
 * @returns ValidationResult with any issues found
 */
export function validateCourtReady(content: string, documentType: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check for placeholder patterns
  for (const { pattern, description } of PLACEHOLDER_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          severity: 'error',
          type: 'placeholder',
          message: description,
          match: match.substring(0, 50), // Truncate long matches
        });
      }
    }
  }

  // Check for template text patterns
  for (const { pattern, description } of TEMPLATE_TEXT_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          severity: 'error',
          type: 'template_text',
          message: description,
          match: match.substring(0, 50),
        });
      }
    }
  }

  // Check for missing data patterns (warnings, not errors)
  for (const { pattern, description } of MISSING_DATA_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          severity: 'warning',
          type: 'missing_data',
          message: description,
          match: match.substring(0, 50),
        });
      }
    }
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    documentType,
  };
}

/**
 * Validate multiple documents and return aggregated results
 */
export function validateDocumentPack(
  documents: Array<{ content: string; type: string; title: string }>
): { allValid: boolean; results: Array<ValidationResult & { title: string }> } {
  const results = documents.map(doc => ({
    ...validateCourtReady(doc.content, doc.type),
    title: doc.title,
  }));

  const allValid = results.every(r => r.isValid);

  return { allValid, results };
}

/**
 * Log validation results with appropriate severity
 */
export function logValidationResults(results: ValidationResult[]): void {
  for (const result of results) {
    if (!result.isValid) {
      console.error(`❌ Court-ready validation failed for ${result.documentType}:`);
      for (const issue of result.issues) {
        const prefix = issue.severity === 'error' ? '  🚨' : '  ⚠️';
        console.error(`${prefix} ${issue.message}${issue.match ? `: "${issue.match}"` : ''}`);
      }
    } else if (result.issues.length > 0) {
      console.warn(`⚠️  Warnings for ${result.documentType}:`);
      for (const issue of result.issues) {
        console.warn(`  ⚠️ ${issue.message}${issue.match ? `: "${issue.match}"` : ''}`);
      }
    }
  }
}

/**
 * Strict validator that throws if any errors are found
 *
 * Use this for critical court documents where placeholders MUST NOT appear.
 */
export function assertCourtReady(content: string, documentType: string): void {
  const result = validateCourtReady(content, documentType);

  if (!result.isValid) {
    const errorMessages = result.issues
      .filter(i => i.severity === 'error')
      .map(i => `${i.message}${i.match ? `: "${i.match}"` : ''}`)
      .join('; ');

    throw new Error(
      `Court-ready validation failed for ${documentType}: ${errorMessages}`
    );
  }
}

// =============================================================================
// HELPER FOR DOCUMENT GENERATION
// =============================================================================

/**
 * Wrap document generation with court-ready validation
 *
 * Returns the content if valid, or logs warnings/errors if issues are found.
 * Does not throw by default to allow generation to continue.
 *
 * @param content - Generated document content
 * @param documentType - Type of document
 * @param options - Options for validation behavior
 */
export function validateAndLog(
  content: string,
  documentType: string,
  options: { throwOnError?: boolean; logWarnings?: boolean } = {}
): string {
  const { throwOnError = false, logWarnings = true } = options;

  const result = validateCourtReady(content, documentType);

  if (!result.isValid) {
    console.error(`❌ Court-ready validation failed for ${documentType}:`);
    for (const issue of result.issues.filter(i => i.severity === 'error')) {
      console.error(`  🚨 ${issue.message}${issue.match ? `: "${issue.match}"` : ''}`);
    }

    if (throwOnError) {
      throw new Error(`Court-ready validation failed for ${documentType}`);
    }
  }

  if (logWarnings && result.issues.some(i => i.severity === 'warning')) {
    for (const issue of result.issues.filter(i => i.severity === 'warning')) {
      console.warn(`⚠️  [${documentType}] ${issue.message}${issue.match ? `: "${issue.match}"` : ''}`);
    }
  }

  return content;
}

// =============================================================================
// SECTION 21 SPECIFIC VALIDATION (Jan 2026 Audit)
// =============================================================================

/**
 * Validate Section 21 specific document content (Form 6A, N5B, etc.)
 *
 * This adds Section 21 specific checks on top of the general court-ready validation:
 * - Form 6A specific placeholders
 * - Compliance assertion detection
 * - Date completeness checks
 *
 * @param content - HTML or text content of the Section 21 document
 * @param documentType - Type of document (e.g., 'form_6a', 'n5b')
 * @param options - Additional validation options
 */
export function validateSection21CourtReady(
  content: string,
  documentType: string,
  options?: {
    /** If true, also check for compliance assertions (stricter mode) */
    checkComplianceAssertions?: boolean;
    /** Verified compliance facts - assertions matching these are allowed */
    verifiedCompliance?: {
      depositProtected?: boolean;
      prescribedInfoServed?: boolean;
      gasCertProvided?: boolean;
      epcProvided?: boolean;
      howToRentProvided?: boolean;
    };
  }
): ValidationResult {
  // Start with base validation
  const baseResult = validateCourtReady(content, documentType);
  const issues = [...baseResult.issues];

  // Check Section 21 specific placeholders
  for (const { pattern, description } of SECTION21_PLACEHOLDER_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          severity: 'error',
          type: 'placeholder',
          message: `[Section 21] ${description}`,
          match: match.substring(0, 50),
        });
      }
    }
  }

  // Check compliance assertions if requested (stricter validation)
  if (options?.checkComplianceAssertions) {
    const verified = options.verifiedCompliance || {};

    for (const { pattern, description } of COMPLIANCE_ASSERTION_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if this assertion is verified
        let isVerified = false;

        if (description.includes('deposit protection') && verified.depositProtected === true) {
          isVerified = true;
        } else if (description.includes('prescribed info') && verified.prescribedInfoServed === true) {
          isVerified = true;
        } else if (description.includes('gas safety') && verified.gasCertProvided === true) {
          isVerified = true;
        } else if (description.includes('EPC') && verified.epcProvided === true) {
          isVerified = true;
        } else if (description.includes('How to Rent') && verified.howToRentProvided === true) {
          isVerified = true;
        }

        if (!isVerified) {
          for (const match of matches) {
            issues.push({
              severity: 'warning',
              type: 'template_text',
              message: `[Section 21] Unverified compliance assertion: ${description}. Ensure this is accurate.`,
              match: match.substring(0, 50),
            });
          }
        }
      }
    }
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    documentType,
  };
}

/**
 * Assert Section 21 document is court-ready, throwing if not.
 *
 * Use this for Section 21 notices and related court documents.
 */
export function assertSection21CourtReady(
  content: string,
  documentType: string,
  options?: Parameters<typeof validateSection21CourtReady>[2]
): void {
  const result = validateSection21CourtReady(content, documentType, options);

  if (!result.isValid) {
    const errorMessages = result.issues
      .filter(i => i.severity === 'error')
      .map(i => `${i.message}${i.match ? `: "${i.match}"` : ''}`)
      .join('; ');

    throw new Error(
      `Section 21 court-ready validation failed for ${documentType}: ${errorMessages}`
    );
  }
}

/**
 * Final output scan for any placeholders in generated PDFs
 *
 * This is the LAST LINE OF DEFENSE - scans rendered/flattened PDF text
 * for any remaining placeholder patterns that shouldn't appear in court documents.
 *
 * @param renderedText - Text extracted from the flattened PDF
 * @param documentType - Type of document being validated
 * @returns ValidationResult with any placeholder issues found
 */
export function scanFinalOutputForPlaceholders(
  renderedText: string,
  documentType: string
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Universal placeholder patterns that should NEVER appear in final output
  const finalOutputPatterns = [
    // Square brackets with content (except legal citations like [2024] EWCA)
    { pattern: /\[(?!(?:19|20)\d{2}\])[A-Za-z][^\]]{2,}\]/g, description: 'Placeholder in brackets' },

    // Curly braces (unrendered templates)
    { pattern: /\{\{[^}]+\}\}/g, description: 'Unrendered template variable' },

    // Common placeholder text
    { pattern: /\[Your\s/gi, description: 'Placeholder: [Your...]' },
    { pattern: /\[Enter\s/gi, description: 'Placeholder: [Enter...]' },
    { pattern: /\[Insert\s/gi, description: 'Placeholder: [Insert...]' },
    { pattern: /\[insert\s/gi, description: 'Placeholder: [insert...]' },
    { pattern: /TEMPLATE/gi, description: 'Template marker' },
    { pattern: /Instructions\s+for\s+use/gi, description: 'Instructions text' },

    // Form 6A specific
    { pattern: /\(insert\s+full\s+name/gi, description: 'Form 6A placeholder' },
    { pattern: /\(insert\s+address/gi, description: 'Form 6A placeholder' },
    { pattern: /\(insert\s+calendar\s+date/gi, description: 'Form 6A placeholder' },
  ];

  for (const { pattern, description } of finalOutputPatterns) {
    const matches = renderedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          severity: 'error',
          type: 'placeholder',
          message: `[FINAL OUTPUT] ${description}`,
          match: match.substring(0, 50),
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    documentType,
  };
}

// =============================================================================
// CROSS-DOCUMENT CONSISTENCY VALIDATION (P0 FIX - Jan 2026)
// =============================================================================

/**
 * Cross-document consistency data for validation
 *
 * CRITICAL: The following MUST match exactly across Form 6A, N5B, and Proof of Service:
 * - Notice expiry date
 * - Service method
 * - Service date
 * - Party names (all landlords and tenants)
 */
export interface CrossDocumentData {
  // From Form 6A
  form6a_expiry_date?: string;
  form6a_tenant_names?: string[];
  form6a_landlord_names?: string[];
  form6a_property_address?: string;

  // From N5B
  n5b_expiry_date?: string;
  n5b_service_method?: string;
  n5b_service_date?: string;
  n5b_tenant_names?: string[];
  n5b_landlord_names?: string[];
  n5b_property_address?: string;

  // From Proof of Service
  proof_service_method?: string;
  proof_service_date?: string;
  proof_recipient_names?: string[];
}

export interface ConsistencyIssue {
  severity: 'error' | 'warning';
  field: string;
  message: string;
  form6a_value?: string;
  n5b_value?: string;
  proof_value?: string;
}

export interface ConsistencyResult {
  isConsistent: boolean;
  issues: ConsistencyIssue[];
}

/**
 * Normalize a date string to YYYY-MM-DD for comparison
 */
function normalizeDateForComparison(dateStr: string | undefined): string | null {
  if (!dateStr) return null;

  // Try to parse and normalize the date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // If standard parsing fails, try UK date format (DD/MM/YYYY)
    const ukMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (ukMatch) {
      const [, day, month, year] = ukMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr.toLowerCase().trim();
  }

  return date.toISOString().split('T')[0];
}

/**
 * Normalize names for comparison (case-insensitive, trim whitespace)
 */
function normalizeNameForComparison(name: string | undefined): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Normalize service method for comparison
 */
function normalizeServiceMethodForComparison(method: string | undefined): string {
  if (!method) return '';
  return method
    .toLowerCase()
    .replace(/[\s_-]+/g, '_')
    .replace(/first_class_post|first_class|post|postal/, 'post')
    .replace(/recorded_delivery|recorded|signed_for/, 'recorded')
    .replace(/by_hand|hand_delivery|in_person/, 'hand')
    .trim();
}

/**
 * Validate cross-document consistency for Section 21 accelerated possession.
 *
 * CRITICAL: This validation ensures that Form 6A, N5B, and Proof of Service
 * all contain matching information. Mismatches WILL cause court rejection.
 *
 * @param data - Cross-document data extracted from generated documents
 * @returns ConsistencyResult with any mismatches found
 */
export function validateCrossDocumentConsistency(data: CrossDocumentData): ConsistencyResult {
  const issues: ConsistencyIssue[] = [];

  // ==========================================================================
  // NOTICE EXPIRY DATE - MUST match between Form 6A and N5B Q10e
  // ==========================================================================
  if (data.form6a_expiry_date || data.n5b_expiry_date) {
    const form6aDate = normalizeDateForComparison(data.form6a_expiry_date);
    const n5bDate = normalizeDateForComparison(data.n5b_expiry_date);

    if (form6aDate && n5bDate && form6aDate !== n5bDate) {
      issues.push({
        severity: 'error',
        field: 'notice_expiry_date',
        message: 'Notice expiry date mismatch between Form 6A and N5B Q10(e). These MUST be identical.',
        form6a_value: data.form6a_expiry_date,
        n5b_value: data.n5b_expiry_date,
      });
    }

    if (!form6aDate && n5bDate) {
      issues.push({
        severity: 'error',
        field: 'notice_expiry_date',
        message: 'Form 6A is missing expiry date but N5B has one. Both must be present and match.',
        n5b_value: data.n5b_expiry_date,
      });
    }

    if (form6aDate && !n5bDate) {
      issues.push({
        severity: 'error',
        field: 'notice_expiry_date',
        message: 'N5B Q10(e) is missing expiry date but Form 6A has one. Both must be present and match.',
        form6a_value: data.form6a_expiry_date,
      });
    }
  }

  // ==========================================================================
  // SERVICE METHOD - MUST match between N5B Q10a and Proof of Service
  // ==========================================================================
  if (data.n5b_service_method || data.proof_service_method) {
    const n5bMethod = normalizeServiceMethodForComparison(data.n5b_service_method);
    const proofMethod = normalizeServiceMethodForComparison(data.proof_service_method);

    if (n5bMethod && proofMethod && n5bMethod !== proofMethod) {
      issues.push({
        severity: 'error',
        field: 'service_method',
        message: 'Service method mismatch between N5B Q10(a) and Proof of Service. These MUST be identical.',
        n5b_value: data.n5b_service_method,
        proof_value: data.proof_service_method,
      });
    }
  }

  // ==========================================================================
  // SERVICE DATE - MUST match between N5B Q10b and Proof of Service
  // ==========================================================================
  if (data.n5b_service_date || data.proof_service_date) {
    const n5bDate = normalizeDateForComparison(data.n5b_service_date);
    const proofDate = normalizeDateForComparison(data.proof_service_date);

    if (n5bDate && proofDate && n5bDate !== proofDate) {
      issues.push({
        severity: 'error',
        field: 'service_date',
        message: 'Service date mismatch between N5B Q10(b) and Proof of Service. These MUST be identical.',
        n5b_value: data.n5b_service_date,
        proof_value: data.proof_service_date,
      });
    }
  }

  // ==========================================================================
  // TENANT NAMES - MUST match across all documents
  // ==========================================================================
  if (data.form6a_tenant_names && data.n5b_tenant_names) {
    const form6aTenants = data.form6a_tenant_names.map(normalizeNameForComparison).sort();
    const n5bTenants = data.n5b_tenant_names.map(normalizeNameForComparison).sort();

    // Check count mismatch
    if (form6aTenants.length !== n5bTenants.length) {
      issues.push({
        severity: 'error',
        field: 'tenant_names',
        message: `Tenant count mismatch: Form 6A has ${form6aTenants.length} tenant(s), N5B has ${n5bTenants.length}. ALL tenants must be named on ALL documents.`,
        form6a_value: data.form6a_tenant_names.join(', '),
        n5b_value: data.n5b_tenant_names.join(', '),
      });
    } else {
      // Check for name mismatches
      for (let i = 0; i < form6aTenants.length; i++) {
        if (form6aTenants[i] !== n5bTenants[i]) {
          issues.push({
            severity: 'error',
            field: 'tenant_names',
            message: 'Tenant name mismatch between Form 6A and N5B. Names must be identical.',
            form6a_value: data.form6a_tenant_names.join(', '),
            n5b_value: data.n5b_tenant_names.join(', '),
          });
          break;
        }
      }
    }
  }

  // ==========================================================================
  // LANDLORD NAMES - MUST match across all documents
  // ==========================================================================
  if (data.form6a_landlord_names && data.n5b_landlord_names) {
    const form6aLandlords = data.form6a_landlord_names.map(normalizeNameForComparison).sort();
    const n5bLandlords = data.n5b_landlord_names.map(normalizeNameForComparison).sort();

    if (form6aLandlords.length !== n5bLandlords.length) {
      issues.push({
        severity: 'error',
        field: 'landlord_names',
        message: `Landlord count mismatch: Form 6A has ${form6aLandlords.length} landlord(s), N5B has ${n5bLandlords.length}. ALL landlords must be named on ALL documents.`,
        form6a_value: data.form6a_landlord_names.join(', '),
        n5b_value: data.n5b_landlord_names.join(', '),
      });
    } else {
      for (let i = 0; i < form6aLandlords.length; i++) {
        if (form6aLandlords[i] !== n5bLandlords[i]) {
          issues.push({
            severity: 'error',
            field: 'landlord_names',
            message: 'Landlord name mismatch between Form 6A and N5B. Names must be identical.',
            form6a_value: data.form6a_landlord_names.join(', '),
            n5b_value: data.n5b_landlord_names.join(', '),
          });
          break;
        }
      }
    }
  }

  // ==========================================================================
  // PROPERTY ADDRESS - MUST match across all documents
  // ==========================================================================
  if (data.form6a_property_address && data.n5b_property_address) {
    const form6aAddress = normalizeNameForComparison(data.form6a_property_address);
    const n5bAddress = normalizeNameForComparison(data.n5b_property_address);

    if (form6aAddress !== n5bAddress) {
      issues.push({
        severity: 'warning', // Warning because minor formatting differences may be acceptable
        field: 'property_address',
        message: 'Property address differs between Form 6A and N5B. Verify these refer to the same property.',
        form6a_value: data.form6a_property_address,
        n5b_value: data.n5b_property_address,
      });
    }
  }

  return {
    isConsistent: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Assert cross-document consistency, throwing if critical mismatches found.
 *
 * CRITICAL: Use this before generating final court bundle to ensure consistency.
 */
export function assertCrossDocumentConsistency(data: CrossDocumentData): void {
  const result = validateCrossDocumentConsistency(data);

  if (!result.isConsistent) {
    const errorMessages = result.issues
      .filter(i => i.severity === 'error')
      .map(i => {
        let msg = `${i.field}: ${i.message}`;
        if (i.form6a_value) msg += ` Form 6A: "${i.form6a_value}"`;
        if (i.n5b_value) msg += ` N5B: "${i.n5b_value}"`;
        if (i.proof_value) msg += ` Proof: "${i.proof_value}"`;
        return msg;
      })
      .join('; ');

    throw new Error(
      `Cross-document consistency validation failed: ${errorMessages}. ` +
      `Courts will reject Section 21 claims with mismatched documents.`
    );
  }

  // Log warnings even if validation passes
  for (const issue of result.issues.filter(i => i.severity === 'warning')) {
    console.warn(`⚠️  Cross-document warning (${issue.field}): ${issue.message}`);
  }
}

/**
 * Log cross-document consistency issues with appropriate formatting
 */
export function logConsistencyResults(result: ConsistencyResult): void {
  if (!result.isConsistent) {
    console.error('❌ Cross-document consistency validation FAILED:');
    for (const issue of result.issues.filter(i => i.severity === 'error')) {
      console.error(`  🚨 [${issue.field}] ${issue.message}`);
      if (issue.form6a_value) console.error(`     Form 6A: "${issue.form6a_value}"`);
      if (issue.n5b_value) console.error(`     N5B: "${issue.n5b_value}"`);
      if (issue.proof_value) console.error(`     Proof: "${issue.proof_value}"`);
    }
  }

  for (const issue of result.issues.filter(i => i.severity === 'warning')) {
    console.warn(`  ⚠️  [${issue.field}] ${issue.message}`);
    if (issue.form6a_value) console.warn(`     Form 6A: "${issue.form6a_value}"`);
    if (issue.n5b_value) console.warn(`     N5B: "${issue.n5b_value}"`);
    if (issue.proof_value) console.warn(`     Proof: "${issue.proof_value}"`);
  }

  if (result.isConsistent && result.issues.length === 0) {
    console.log('✅ Cross-document consistency validation passed');
  }
}
