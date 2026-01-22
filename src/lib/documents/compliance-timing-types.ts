/**
 * Compliance Timing Types
 *
 * Shared types for compliance timing validation errors across API and UI.
 * These types define the contract between server and client for compliance blocks.
 *
 * SECURITY: The `field` property is for server-side logging ONLY.
 * UI components must use `documentLabel` for display, never `field`.
 *
 * @module compliance-timing-types
 */

/**
 * Category of compliance issue - used for UI adjustments
 */
export type ComplianceIssueCategory = 'timing' | 'expiry' | 'deposit' | 'other';

/**
 * Sanitized compliance issue for API response.
 * Contains both internal fields (for logging) and UI-safe fields (for display).
 */
export interface SanitizedComplianceIssue {
  /** Internal field code - FOR SERVER LOGGING ONLY, never display to user */
  field: string;

  /** User-facing document label - ALWAYS use this for display */
  documentLabel: string;

  /** Issue category for UI adjustment (timing vs expiry vs deposit) */
  category: ComplianceIssueCategory;

  /** User-friendly explanation of the requirement */
  message: string;

  /** What was expected (e.g., "Before 15 January 2024") - safe for display */
  expected?: string;

  /** What was actually recorded - safe for display */
  actual?: string;

  /** Issue severity */
  severity: 'error' | 'warning';
}

/**
 * API response when pack generation is blocked due to compliance timing violations.
 * Returned with HTTP 422 status.
 */
export interface ComplianceTimingBlockResponse {
  ok: false;
  error: 'compliance_timing_block';
  code: 'COMPLIANCE_TIMING_BLOCK';
  /** User-friendly message for display */
  message: string;
  /** Sanitized issues with UI-safe labels */
  issues: SanitizedComplianceIssue[];
  /** Tenancy start date for context (YYYY-MM-DD) */
  tenancy_start_date?: string;
}

/**
 * Standard success response from regenerate endpoint
 */
export interface RegenerateSuccessResponse {
  ok: true;
  regenerated_count: number;
  document_ids: string[];
}

/**
 * Standard error response from regenerate endpoint
 */
export interface RegenerateErrorResponse {
  ok: false;
  error: string;
  message?: string;
}

/**
 * Union type for all possible regenerate endpoint responses
 */
export type RegenerateOrderResponse =
  | RegenerateSuccessResponse
  | ComplianceTimingBlockResponse
  | RegenerateErrorResponse;

/**
 * Standard success response from fulfill endpoint
 */
export interface FulfillSuccessResponse {
  success: true;
  status: 'fulfilled' | 'already_fulfilled' | 'processing';
  documents?: number;
  message?: string;
}

/**
 * Standard error response from fulfill endpoint
 */
export interface FulfillErrorResponse {
  success: false;
  error: string;
  message?: string;
}

/**
 * Union type for all possible fulfill endpoint responses
 */
export type FulfillOrderResponse =
  | FulfillSuccessResponse
  | ComplianceTimingBlockResponse
  | FulfillErrorResponse;

/**
 * Type guard to check if response is a compliance timing block.
 * Works with both RegenerateOrderResponse and FulfillOrderResponse.
 */
export function isComplianceTimingBlock(
  response: RegenerateOrderResponse | FulfillOrderResponse | { ok?: boolean; success?: boolean; code?: string }
): response is ComplianceTimingBlockResponse {
  return (
    ('ok' in response && response.ok === false || 'success' in response && response.success === false) &&
    'code' in response &&
    response.code === 'COMPLIANCE_TIMING_BLOCK'
  );
}

/**
 * Maps internal field codes to user-friendly document labels.
 * Used by the API to sanitize issues before returning to client.
 */
export const FIELD_TO_DOCUMENT_LABEL: Record<string, string> = {
  'epc_timing': 'Energy Performance Certificate (EPC)',
  'gas_safety_timing': 'Gas Safety Certificate (CP12)',
  'gas_safety_expiry': 'Gas Safety Certificate (CP12)',
  'how_to_rent_timing': 'How to Rent Guide',
  'prescribed_info_timing': 'Deposit Prescribed Information',
};

/**
 * Maps internal field codes to issue categories.
 */
export const FIELD_TO_CATEGORY: Record<string, ComplianceIssueCategory> = {
  'epc_timing': 'timing',
  'gas_safety_timing': 'timing',
  'gas_safety_expiry': 'expiry',
  'how_to_rent_timing': 'timing',
  'prescribed_info_timing': 'deposit',
};

/**
 * Sanitizes a raw timing validation issue for safe UI display.
 * Adds documentLabel and category, keeps field for logging.
 *
 * @param rawIssue - Raw issue from validation
 * @returns Sanitized issue safe for API response
 */
export function sanitizeComplianceIssue(rawIssue: {
  field: string;
  message: string;
  expected?: string;
  actual?: string;
  severity: 'error' | 'warning';
}): SanitizedComplianceIssue {
  const documentLabel =
    FIELD_TO_DOCUMENT_LABEL[rawIssue.field] || 'Compliance requirement';

  const category =
    FIELD_TO_CATEGORY[rawIssue.field] || 'other';

  return {
    field: rawIssue.field,
    documentLabel,
    category,
    message: rawIssue.message,
    expected: rawIssue.expected,
    actual: rawIssue.actual,
    severity: rawIssue.severity,
  };
}

/**
 * Sanitizes an array of raw timing validation issues.
 *
 * @param rawIssues - Raw issues from validation
 * @returns Array of sanitized issues safe for API response
 */
export function sanitizeComplianceIssues(
  rawIssues: Array<{
    field: string;
    message: string;
    expected?: string;
    actual?: string;
    severity: 'error' | 'warning';
  }>
): SanitizedComplianceIssue[] {
  return rawIssues.map(sanitizeComplianceIssue);
}
