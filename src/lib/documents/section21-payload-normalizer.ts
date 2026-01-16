/**
 * Section 21 Payload Normalizer
 *
 * Centralizes normalization logic for wizard payloads that may come in
 * various shapes (flat keys, nested objects, label strings vs enums).
 *
 * This ensures robust mapping regardless of:
 * - Whether the UI sends enum values ("ast_fixed") or labels ("Assured Shorthold Tenancy (Fixed term)")
 * - Whether data is flat (wizardFacts.fixed_term) or nested (wizardFacts.tenancy.fixed_term)
 * - Case/spacing variations in service methods ("First class post" vs "first_class_post")
 */

import { type ServiceMethod } from './notice-date-calculator';

// ============================================================================
// TENANCY TYPE NORMALIZATION
// ============================================================================

/**
 * Determines if the tenancy is a fixed-term tenancy based on various payload shapes.
 *
 * Handles:
 * - Boolean flags: fixed_term, is_fixed_term
 * - Enum values: "ast_fixed", "fixed_term"
 * - Label strings: "Assured Shorthold Tenancy (Fixed term)", "Fixed term", etc.
 * - Nested objects: wizardFacts.tenancy.tenancy_type, wizardFacts.tenancy.type
 */
export function isFixedTermTenancy(wizardFacts: Record<string, any>): boolean {
  // Check direct boolean flags
  if (wizardFacts.fixed_term === true) return true;
  if (wizardFacts.is_fixed_term === true) return true;

  // Check tenancy_type enum values at root level
  const tenancyType = wizardFacts.tenancy_type;
  if (isFixedTermType(tenancyType)) return true;

  // Check nested tenancy object
  const tenancy = wizardFacts.tenancy;
  if (tenancy && typeof tenancy === 'object') {
    // Check nested boolean flags
    if (tenancy.fixed_term === true) return true;
    if (tenancy.is_fixed_term === true) return true;

    // Check nested tenancy_type
    if (isFixedTermType(tenancy.tenancy_type)) return true;
    if (isFixedTermType(tenancy.type)) return true;
  }

  return false;
}

/**
 * Helper to check if a tenancy type value indicates fixed-term.
 * Case-insensitive, handles both enum values and label strings.
 */
function isFixedTermType(value: unknown): boolean {
  if (typeof value !== 'string') return false;

  const normalized = value.toLowerCase().trim();

  // Enum values
  if (normalized === 'ast_fixed') return true;
  if (normalized === 'fixed_term') return true;
  if (normalized === 'fixed') return true;

  // Label string patterns (case-insensitive)
  if (normalized.includes('fixed term')) return true;
  if (normalized.includes('fixed-term')) return true;

  return false;
}

// ============================================================================
// FIXED TERM END DATE RESOLUTION
// ============================================================================

/**
 * Resolves fixed_term_end_date from various payload shapes.
 *
 * Checks:
 * - wizardFacts.fixed_term_end_date (flat)
 * - wizardFacts.tenancy.fixed_term_end_date (nested)
 * - wizardFacts.tenancy.end_date (nested alternate)
 */
export function resolveFixedTermEndDate(wizardFacts: Record<string, any>): string | undefined {
  // Check flat key
  if (wizardFacts.fixed_term_end_date) {
    return wizardFacts.fixed_term_end_date;
  }

  // Check nested tenancy object
  const tenancy = wizardFacts.tenancy;
  if (tenancy && typeof tenancy === 'object') {
    if (tenancy.fixed_term_end_date) {
      return tenancy.fixed_term_end_date;
    }
    if (tenancy.end_date) {
      return tenancy.end_date;
    }
  }

  return undefined;
}

// ============================================================================
// BREAK CLAUSE RESOLUTION
// ============================================================================

/**
 * Determines if the tenancy has a break clause.
 *
 * Handles:
 * - Boolean: has_break_clause, break_clause
 * - String 'yes': has_break_clause === 'yes'
 * - Nested: tenancy.has_break_clause, tenancy.break_clause
 */
export function hasBreakClause(wizardFacts: Record<string, any>): boolean {
  // Check flat keys
  if (wizardFacts.has_break_clause === true || wizardFacts.has_break_clause === 'yes') {
    return true;
  }
  if (wizardFacts.break_clause === true || wizardFacts.break_clause === 'yes') {
    return true;
  }

  // Check nested tenancy object
  const tenancy = wizardFacts.tenancy;
  if (tenancy && typeof tenancy === 'object') {
    if (tenancy.has_break_clause === true || tenancy.has_break_clause === 'yes') {
      return true;
    }
    if (tenancy.break_clause === true || tenancy.break_clause === 'yes') {
      return true;
    }
  }

  return false;
}

/**
 * Resolves break_clause_date from various payload shapes.
 */
export function resolveBreakClauseDate(wizardFacts: Record<string, any>): string | undefined {
  // Check flat keys
  if (wizardFacts.break_clause_date) {
    return wizardFacts.break_clause_date;
  }

  // Check nested tenancy object
  const tenancy = wizardFacts.tenancy;
  if (tenancy && typeof tenancy === 'object') {
    if (tenancy.break_clause_date) {
      return tenancy.break_clause_date;
    }
  }

  return undefined;
}

// ============================================================================
// SERVICE METHOD NORMALIZATION
// ============================================================================

/**
 * Mapping from various label strings to canonical ServiceMethod values.
 * Keys are lowercase for case-insensitive matching.
 */
const SERVICE_METHOD_MAP: Record<string, ServiceMethod> = {
  // Canonical values (already normalized)
  'first_class_post': 'first_class_post',
  'second_class_post': 'second_class_post',
  'hand_delivery': 'hand_delivery',
  'leaving_at_property': 'leaving_at_property',
  'recorded_delivery': 'recorded_delivery',

  // Label variations - First class post
  'first class post': 'first_class_post',
  'first class': 'first_class_post',
  'first-class post': 'first_class_post',
  'first-class': 'first_class_post',
  '1st class post': 'first_class_post',
  '1st class': 'first_class_post',

  // Label variations - Second class post
  'second class post': 'second_class_post',
  'second class': 'second_class_post',
  'second-class post': 'second_class_post',
  'second-class': 'second_class_post',
  '2nd class post': 'second_class_post',
  '2nd class': 'second_class_post',

  // Label variations - Hand delivery
  'hand delivery': 'hand_delivery',
  'hand-delivery': 'hand_delivery',
  'in person': 'hand_delivery',
  'personal delivery': 'hand_delivery',
  'delivered by hand': 'hand_delivery',
  'by hand': 'hand_delivery',

  // Label variations - Leaving at property
  'leaving at property': 'leaving_at_property',
  'leaving at the property': 'leaving_at_property',
  'left at property': 'leaving_at_property',
  'left at the property': 'leaving_at_property',
  'posting through letterbox': 'leaving_at_property',
  'letterbox': 'leaving_at_property',

  // Label variations - Recorded delivery
  'recorded delivery': 'recorded_delivery',
  'recorded post': 'recorded_delivery',
  'signed for': 'recorded_delivery',
  'special delivery': 'recorded_delivery',
  'tracked delivery': 'recorded_delivery',
};

/**
 * Normalizes a service method value from various label formats to canonical enum.
 *
 * @param value - The raw value from wizard payload (may be label, enum, or undefined)
 * @returns Canonical ServiceMethod or undefined if invalid/unknown
 *
 * Examples:
 * - "First class post" → "first_class_post"
 * - "first_class_post" → "first_class_post"
 * - "Hand delivery" → "hand_delivery"
 * - "SECOND CLASS POST" → "second_class_post"
 */
export function normalizeServiceMethod(value: unknown): ServiceMethod | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();

  // Direct lookup
  if (SERVICE_METHOD_MAP[normalized]) {
    return SERVICE_METHOD_MAP[normalized];
  }

  // Fuzzy match for partial strings
  for (const [key, canonical] of Object.entries(SERVICE_METHOD_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return canonical;
    }
  }

  return undefined;
}

/**
 * Resolves service method from various payload shapes and normalizes it.
 *
 * Checks:
 * - wizardFacts.service_method (flat)
 * - wizardFacts.notice_service.service_method (nested)
 * - wizardFacts.delivery_method
 * - wizardFacts.how_serving
 */
export function resolveServiceMethod(wizardFacts: Record<string, any>): ServiceMethod | undefined {
  // Check nested path from MQS maps_to (notice_service.service_method)
  const noticeService = wizardFacts.notice_service;
  if (typeof noticeService === 'object' && noticeService?.service_method) {
    const normalized = normalizeServiceMethod(noticeService.service_method);
    if (normalized) return normalized;
  }

  // Check flat keys with various possible names
  const possibleKeys = [
    'service_method',
    'notice_service_method',
    'delivery_method',
    'how_serving',
    'serving_method',
  ];

  for (const key of possibleKeys) {
    const value = wizardFacts[key];
    if (value) {
      const normalized = normalizeServiceMethod(value);
      if (normalized) return normalized;
    }
  }

  return undefined;
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

/**
 * Logs resolved date parameters for debugging.
 * Only logs in development environment.
 */
export function logResolvedDateParams(
  params: {
    fixed_term: boolean;
    fixed_term_end_date: string | undefined;
    has_break_clause: boolean;
    break_clause_date: string | undefined;
    service_method: ServiceMethod | undefined;
    serve_date: string | undefined;
  },
  source: string = 'Section21Generator'
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.log(`[${source}] Resolved Date Parameters:`, {
    fixed_term: params.fixed_term,
    fixed_term_end_date: params.fixed_term_end_date,
    has_break_clause: params.has_break_clause,
    break_clause_date: params.break_clause_date,
    service_method: params.service_method,
    serve_date: params.serve_date,
  });
}
