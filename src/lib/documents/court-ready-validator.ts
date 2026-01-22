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

// =============================================================================
// SECTION 21 COMPLIANCE TIMING VALIDATION (P0 FIX - Jan 2026)
// =============================================================================

/**
 * Compliance timing data for Section 21 validation
 *
 * CRITICAL: Section 21 notices are INVALID if compliance documents were not
 * provided at the correct times:
 * - EPC: Must be provided before tenancy start (for tenancies after Oct 2015)
 * - Gas Safety: Must be provided within 28 days of gas check AND before occupation
 * - How to Rent: Must be provided before tenancy start (for tenancies after Oct 2015)
 * - Deposit Info: Must be provided within 30 days of deposit receipt
 */
export interface ComplianceTimingData {
  tenancy_start_date?: string;
  occupation_date?: string; // When tenant moved in (may differ from tenancy start)

  // EPC timing
  epc_provided_date?: string;
  epc_valid_until?: string;

  // Gas Safety timing
  gas_safety_check_date?: string;
  gas_safety_provided_date?: string; // Date most recent CP12 was given (may be annual renewal)
  has_gas_at_property?: boolean;
  // NEW: Pre-occupation gas safety compliance (Jan 2026 fix)
  gas_safety_before_occupation?: boolean; // User confirmed a record was provided before move-in
  gas_safety_before_occupation_date?: string; // Date of the pre-occupation CP12 check
  gas_safety_record_served_pre_occupation_date?: string; // Date pre-occupation CP12 was given to tenant (CRITICAL)

  // How to Rent timing
  how_to_rent_provided_date?: string;

  // Deposit timing
  deposit_received_date?: string;
  prescribed_info_served_date?: string;
}

export interface TimingValidationIssue {
  severity: 'error' | 'warning';
  field: string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface TimingValidationResult {
  isValid: boolean;
  issues: TimingValidationIssue[];
}

/**
 * Parse a date string safely, handling various formats
 */
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Try UK format DD/MM/YYYY
  const ukMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ukMatch) {
    const [, day, month, year] = ukMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}

/**
 * Validate compliance document timing for Section 21 evictions.
 *
 * CRITICAL: These validations ensure documents were provided at legally required times.
 * Failure to meet these timings makes Section 21 notices INVALID.
 *
 * @param data - Compliance timing data
 * @returns TimingValidationResult with any timing violations
 */
export function validateComplianceTiming(data: ComplianceTimingData): TimingValidationResult {
  const issues: TimingValidationIssue[] = [];

  // ==========================================================================
  // REQUIRED DATES VALIDATION (Jan 2026 fix)
  // Block generation when essential context is missing to prevent "silent pass"
  // when dates are simply absent from the collected_facts.
  //
  // IMPORTANT: We only require tenancy_start_date if it's actually needed for
  // the timing checks that WILL run based on the data provided:
  // - EPC timing check needs tenancy_start_date (if epc_provided_date present)
  // - Gas safety timing needs occupation_date OR tenancy_start_date
  //   (if gas dates are present and has_gas_at_property is explicitly true)
  // - How to Rent timing needs tenancy_start_date (if how_to_rent_provided_date present)
  //
  // The deposit prescribed info check is INDEPENDENT and doesn't need
  // tenancy_start_date - it only compares deposit_received_date vs prescribed_info_served_date.
  // ==========================================================================
  const hasGasDates = !!(data.gas_safety_provided_date || data.gas_safety_record_served_pre_occupation_date);
  const gasCheckWillRun = data.has_gas_at_property === true && hasGasDates && !data.occupation_date;

  const needsTenancyStartDate = !!(
    data.epc_provided_date ||
    data.how_to_rent_provided_date ||
    gasCheckWillRun
  );

  if (needsTenancyStartDate && !data.tenancy_start_date) {
    issues.push({
      severity: 'error',
      field: 'tenancy_start_date',
      message: 'Tenancy start date is required to generate a Section 21 pack. Please provide the tenancy start date in the wizard.',
    });
    // Return early - we can't validate timing without the reference date
    return {
      isValid: false,
      issues,
    };
  }

  const tenancyStart = parseDate(data.tenancy_start_date);
  const occupation = parseDate(data.occupation_date) || tenancyStart;

  // Additional validation: ensure the tenancy_start_date is parseable (if provided)
  if (data.tenancy_start_date && !tenancyStart) {
    issues.push({
      severity: 'error',
      field: 'tenancy_start_date',
      message: `Tenancy start date "${data.tenancy_start_date}" could not be parsed. Please use format YYYY-MM-DD.`,
    });
    return {
      isValid: false,
      issues,
    };
  }

  // ==========================================================================
  // EPC TIMING - Must be provided BEFORE tenancy start
  // ==========================================================================
  if (data.epc_provided_date && tenancyStart) {
    const epcDate = parseDate(data.epc_provided_date);
    if (epcDate && epcDate > tenancyStart) {
      issues.push({
        severity: 'error',
        field: 'epc_timing',
        message: 'EPC was provided AFTER tenancy start date. For Section 21 validity, EPC must be provided BEFORE the tenancy begins.',
        expected: `Before ${data.tenancy_start_date}`,
        actual: data.epc_provided_date,
      });
    }
  }

  // ==========================================================================
  // GAS SAFETY TIMING - Must be provided BEFORE occupation
  // ==========================================================================
  // CRITICAL FIX (Jan 2026): The pre-occupation timing check MUST use the date
  // the pre-occupation gas safety record was served to the tenant, NOT the
  // most recent CP12 served date (which may be an annual renewal).
  //
  // For Section 21 validity:
  // 1. A gas safety record must have been provided BEFORE the tenant moved in
  // 2. The CURRENT certificate must be valid (within 12 months)
  //
  // The system now uses gas_safety_record_served_pre_occupation_date for #1.
  // Backward compatibility: If the new field is missing but the user confirmed
  // pre-occupation compliance and the check was before occupation, treat the
  // check date as the served date (legacy assumption).
  // ==========================================================================
  if (data.has_gas_at_property !== false && occupation) {
    // Determine the pre-occupation served date using priority:
    // 1. Explicit pre-occupation served date (new field)
    // 2. Legacy fallback: if user confirmed pre-occupation compliance and check was before occupation
    // 3. Fall back to gas_safety_provided_date only if no pre-occupation context
    let preOccupationServedDate: Date | null = null;
    let preOccupationServedDateStr: string | undefined = undefined;

    if (data.gas_safety_record_served_pre_occupation_date) {
      // Use the explicit pre-occupation served date (new field)
      preOccupationServedDate = parseDate(data.gas_safety_record_served_pre_occupation_date);
      preOccupationServedDateStr = data.gas_safety_record_served_pre_occupation_date;
    } else if (data.gas_safety_before_occupation === true && data.gas_safety_before_occupation_date) {
      // Legacy fallback: user confirmed pre-occupation compliance
      // Use the check date as served date (old assumption)
      const checkDate = parseDate(data.gas_safety_before_occupation_date);
      if (checkDate && checkDate <= occupation) {
        preOccupationServedDate = checkDate;
        preOccupationServedDateStr = data.gas_safety_before_occupation_date;
      }
    } else if (data.gas_safety_provided_date) {
      // No pre-occupation context - use the general provided date
      // This maintains backward compatibility for older cases
      preOccupationServedDate = parseDate(data.gas_safety_provided_date);
      preOccupationServedDateStr = data.gas_safety_provided_date;
    }

    // Validate pre-occupation timing
    if (preOccupationServedDate && preOccupationServedDate > occupation) {
      issues.push({
        severity: 'error',
        field: 'gas_safety_timing',
        message: 'Gas safety certificate was provided AFTER tenant occupation. For Section 21 validity, a gas safety record must be provided BEFORE occupation.',
        expected: `Before ${data.occupation_date || data.tenancy_start_date}`,
        actual: preOccupationServedDateStr,
      });
    }

    // Also check gas safety check date - must be within 12 months for current compliance
    // NOTE: This is separate from pre-occupation compliance. Even if pre-occupation
    // was compliant, the current certificate must still be valid.
    if (data.gas_safety_check_date) {
      const checkDate = parseDate(data.gas_safety_check_date);
      const now = new Date();
      if (checkDate) {
        const monthsSinceCheck = (now.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSinceCheck > 12) {
          issues.push({
            severity: 'error',
            field: 'gas_safety_expiry',
            message: 'Gas safety certificate is more than 12 months old. A valid Section 21 requires a current gas safety record.',
            expected: 'Within last 12 months',
            actual: data.gas_safety_check_date,
          });
        }
      }
    }
  }

  // ==========================================================================
  // HOW TO RENT TIMING - Must be provided BEFORE tenancy start (post Oct 2015)
  // ==========================================================================
  // LEGAL BASIS: The Assured Shorthold Tenancy Notices and Prescribed Requirements
  // (England) Regulations 2015, reg. 2(1)(b) - applies to tenancies starting on/after
  // 1 October 2015. Section 21 is INVALID if How to Rent not provided.
  //
  // RATIONALE FOR BLOCK: While some courts have been lenient on timing, the statute
  // requires provision "before" the tenancy. Blocking ensures landlords fix timing
  // issues before proceeding, avoiding potential claim dismissal.
  // ==========================================================================
  if (data.how_to_rent_provided_date && tenancyStart) {
    const htrDate = parseDate(data.how_to_rent_provided_date);
    if (htrDate && htrDate > tenancyStart) {
      issues.push({
        severity: 'error', // BLOCK - statutory requirement for post-Oct 2015 tenancies
        field: 'how_to_rent_timing',
        message: 'How to Rent guide was provided AFTER tenancy start. For tenancies starting after 1 October 2015, How to Rent MUST be provided BEFORE the tenancy begins for a valid Section 21.',
        expected: `Before ${data.tenancy_start_date}`,
        actual: data.how_to_rent_provided_date,
      });
    }
  }

  // ==========================================================================
  // DEPOSIT PRESCRIBED INFO TIMING - Must be within 30 days of receipt
  // ==========================================================================
  if (data.deposit_received_date && data.prescribed_info_served_date) {
    const depositDate = parseDate(data.deposit_received_date);
    const prescribedDate = parseDate(data.prescribed_info_served_date);

    if (depositDate && prescribedDate) {
      const daysDiff = (prescribedDate.getTime() - depositDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 30) {
        issues.push({
          severity: 'error',
          field: 'prescribed_info_timing',
          message: `Prescribed information was served ${Math.round(daysDiff)} days after deposit receipt. Must be within 30 days for valid Section 21.`,
          expected: `Within 30 days of ${data.deposit_received_date}`,
          actual: data.prescribed_info_served_date,
        });
      }
    }
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Assert compliance timing is valid, throwing if critical violations found.
 */
export function assertComplianceTiming(data: ComplianceTimingData): void {
  const result = validateComplianceTiming(data);

  if (!result.isValid) {
    const errorMessages = result.issues
      .filter(i => i.severity === 'error')
      .map(i => `${i.field}: ${i.message}`)
      .join('; ');

    throw new Error(
      `Compliance timing validation failed: ${errorMessages}. ` +
      `Section 21 notice may be INVALID.`
    );
  }

  // Log warnings
  for (const issue of result.issues.filter(i => i.severity === 'warning')) {
    console.warn(`⚠️  Timing warning (${issue.field}): ${issue.message}`);
  }
}

// =============================================================================
// JOINT PARTY VALIDATION (P0 FIX - Jan 2026)
// =============================================================================

/**
 * Joint party data for validation
 *
 * CAPACITY:
 * - Landlords: Up to 2 (N5B has 2 claimant detail sections)
 * - Tenants: Up to 4 (N5B has 2 defendant detail sections, but header accepts more)
 */
export interface JointPartyData {
  has_joint_landlords?: boolean;
  num_landlords?: number;  // P0: Count of landlords (max 2)
  landlord_full_name?: string;
  landlord_2_name?: string;

  has_joint_tenants?: boolean;
  num_tenants?: number;  // P0: Count of tenants (max 4)
  tenant_full_name?: string;
  tenant_2_name?: string;
  tenant_3_name?: string;
  tenant_4_name?: string;
}

export interface JointPartyValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: 'error' | 'warning';
    field: string;
    message: string;
  }>;
}

/**
 * Validate joint party completeness.
 *
 * CRITICAL: If user indicates joint landlords/tenants exist but doesn't provide names,
 * the resulting documents will be INVALID - notices must name ALL parties.
 *
 * LIMITS:
 * - N5B supports up to 2 claimants (landlords) with individual detail sections
 * - N5B supports up to 2 defendants (tenants) with individual detail sections
 * - BUT: The "full names" header fields can contain more names (concatenated)
 * - We support up to 4 tenants (concatenated in header, first 2 in detail sections)
 * - We support up to 2 landlords
 *
 * @param data - Joint party data from wizard
 * @returns JointPartyValidationResult with any missing party issues
 */
export function validateJointParties(data: JointPartyData): JointPartyValidationResult {
  const issues: Array<{ severity: 'error' | 'warning'; field: string; message: string }> = [];

  // ==========================================================================
  // PRIMARY PARTY VALIDATION (always required)
  // ==========================================================================
  if (!data.landlord_full_name) {
    issues.push({
      severity: 'error',
      field: 'landlord_full_name',
      message: 'Landlord name is required for all court documents.',
    });
  }

  if (!data.tenant_full_name) {
    issues.push({
      severity: 'error',
      field: 'tenant_full_name',
      message: 'Tenant name is required for all notices and court documents.',
    });
  }

  // ==========================================================================
  // JOINT LANDLORD VALIDATION
  // ==========================================================================
  if (data.has_joint_landlords === true) {
    if (!data.landlord_2_name) {
      issues.push({
        severity: 'error',
        field: 'landlord_2_name',
        message: 'Joint landlords indicated but second landlord name is missing. ALL landlords must be named on court forms.',
      });
    }
  }

  // Check for >2 landlords (not supported by N5B individual detail sections)
  // Note: If a user has more than 2 landlords, they need legal advice for complex ownership
  if (data.num_landlords && data.num_landlords > 2) {
    issues.push({
      severity: 'error',
      field: 'num_landlords',
      message: `You indicated ${data.num_landlords} landlords, but N5B only supports up to 2 claimants with individual details. For complex ownership structures (e.g., company ownership, trusts, >2 joint owners), please seek legal advice.`,
    });
  }

  // ==========================================================================
  // JOINT TENANT VALIDATION
  // ==========================================================================
  if (data.has_joint_tenants === true) {
    if (!data.tenant_2_name) {
      issues.push({
        severity: 'error',
        field: 'tenant_2_name',
        message: 'Joint tenants indicated but second tenant name is missing. ALL tenants named on the tenancy MUST be named on the notice.',
      });
    }
  }

  // Count provided tenant names
  const tenantNames = [
    data.tenant_full_name,
    data.tenant_2_name,
    data.tenant_3_name,
    data.tenant_4_name,
  ].filter(Boolean);

  // Check for >4 tenants (max supported)
  if (data.num_tenants && data.num_tenants > 4) {
    issues.push({
      severity: 'error',
      field: 'num_tenants',
      message: `You indicated ${data.num_tenants} tenants, but this system supports up to 4 joint tenants. For tenancies with more than 4 tenants, please seek legal advice or manually edit the N5B form.`,
    });
  }

  // If joint tenants indicated but names don't match count
  if (data.has_joint_tenants === true && data.num_tenants) {
    if (tenantNames.length < data.num_tenants) {
      const missing = data.num_tenants - tenantNames.length;
      issues.push({
        severity: 'error',
        field: 'tenant_names',
        message: `You indicated ${data.num_tenants} tenants but only provided ${tenantNames.length} names. ${missing} tenant name(s) missing. ALL tenants on the tenancy must be named.`,
      });
    }
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Assert joint parties are complete, throwing if validation fails.
 *
 * Use this BEFORE generating Section 21 documents to ensure all parties are named.
 */
export function assertJointPartiesComplete(data: JointPartyData): void {
  const result = validateJointParties(data);

  if (!result.isValid) {
    const errorMessages = result.issues
      .filter(i => i.severity === 'error')
      .map(i => `${i.field}: ${i.message}`)
      .join('; ');

    throw new Error(
      `Joint party validation failed: ${errorMessages}. ` +
      `Notices and court forms with missing party names are INVALID.`
    );
  }
}

/**
 * Log joint party validation results
 */
export function logJointPartyResults(result: JointPartyValidationResult): void {
  if (!result.isValid) {
    console.error('❌ Joint party validation FAILED:');
    for (const issue of result.issues.filter(i => i.severity === 'error')) {
      console.error(`  🚨 [${issue.field}] ${issue.message}`);
    }
  }

  for (const issue of result.issues.filter(i => i.severity === 'warning')) {
    console.warn(`  ⚠️  [${issue.field}] ${issue.message}`);
  }

  if (result.isValid && result.issues.length === 0) {
    console.log('✅ Joint party validation passed');
  }
}
