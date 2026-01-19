/**
 * Court-Ready Document Validator
 *
 * This module validates that documents included in court packs are "court-ready",
 * meaning they contain no template placeholders, instructional text, or incomplete data.
 *
 * CRITICAL: Any document included in a complete_pack must be final-form.
 * Template documents with placeholders should NOT be included in court submissions.
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
