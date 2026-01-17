/**
 * normalize.ts - Mapping between flat WizardFacts (DB) and nested CaseFacts (domain)
 *
 * This file handles the conversion from the flat storage format to the nested
 * domain model used by document generators and analysis tools.
 */

import type { WizardFacts, CaseFacts, PartyDetails } from './schema';
import { createEmptyCaseFacts } from './schema';
import { normalizeRoutes, getPrimaryRoute, routeToDocumentType } from '../wizard/route-normalizer';
import { normalizeJurisdiction } from '../types/jurisdiction';
import {
  SECTION8_GROUND_DEFINITIONS,
  type Section8GroundDefinition,
} from '../grounds/section8-ground-definitions';
import { calculateSection21ExpiryDate } from '../documents/notice-date-calculator';

// =============================================================================
// DATE FORMATTING UTILITIES
// =============================================================================

/**
 * Formats a date string (YYYY-MM-DD or parseable) to UK legal format.
 * Example: "2026-01-15" -> "15 January 2026"
 *
 * @param dateStr - The date string in YYYY-MM-DD format or any parseable date
 * @returns Formatted date string (e.g., "15 January 2026") or null if invalid
 */
export function formatUkLegalDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  try {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return null;

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return null;
  }
}

/**
 * Builds a human-readable string of grounds for display in checklists.
 * Example: "Ground 8 (mandatory) – Serious rent arrears; Ground 10 – Rent arrears"
 *
 * @param grounds - Array of ground objects with code, title, and mandatory fields
 * @returns Formatted grounds string or null if no grounds
 */
export function buildGroundDescriptions(grounds: any[] | null | undefined): string | null {
  if (!grounds || !Array.isArray(grounds) || grounds.length === 0) return null;

  return grounds
    .map((g) => {
      const groundLabel = `Ground ${g.code || g.number || '?'}`;
      const mandatoryLabel = g.mandatory ? ' (mandatory)' : '';
      const title = g.title ? ` – ${g.title}` : '';
      return `${groundLabel}${mandatoryLabel}${title}`;
    })
    .join('; ');
}

/**
 * Helper to safely get a value from flat wizard facts using dot notation.
 * Supports legacy keys (e.g., landlord_name) and case_facts-prefixed MQS paths.
 * Also supports nested object access (e.g., wizard.property.address_line1).
 */
function getWizardValue(wizard: WizardFacts, key: string): any {
  // First try direct key lookup (flat key with dots as string)
  const direct = wizard[key];
  if (direct !== undefined && direct !== null) return direct;

  // Try normalized key
  const normalizedKey = key.replace(/^case_facts\./, '').replace(/\[(\d+)\]/g, '.$1');
  const normalizedValue = wizard[normalizedKey];
  if (normalizedValue !== undefined && normalizedValue !== null) return normalizedValue;

  // Try nested object path navigation (for section-based wizards)
  const parts = normalizedKey.split('.');
  let current: any = wizard;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = null;
      break;
    }
  }
  if (current !== undefined && current !== null) return current;

  return null;
}

function getFirstValue(wizard: WizardFacts, keys: string[]): any {
  for (const key of keys) {
    const value = getWizardValue(wizard, key);
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

function coerceBoolean(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['yes', 'true', 'y', '1'].includes(normalized)) return true;
    if (['no', 'false', 'n', '0'].includes(normalized)) return false;
  }
  return Boolean(value);
}

function coerceNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceStringArray(value: any): string[] | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string' || (v && typeof v === 'object' && v.value))
      .map((v) => (typeof v === 'string' ? v : v.value || String(v)));
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

function parseCurrencyAmount(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9,.-]/g, '').replace(/,/g, '');
    if (!cleaned.trim()) return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === 'object') {
    const nestedValue =
      (value as any).amount ??
      (value as any).value ??
      (value as any).label ??
      (value as any).text;
    if (nestedValue !== undefined && nestedValue !== null) {
      return parseCurrencyAmount(nestedValue);
    }
  }

  return null;
}

/**
 * Helper to set nested values on CaseFacts using paths like
 * "parties.landlord.name" or "issues.rent_arrears.arrears_items.0".
 */
function setNestedValue(target: Record<string, any>, path: string, value: any) {
  if (value === undefined) return;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current: any = target;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextIsIndex = !isLast && !Number.isNaN(Number(parts[index + 1]));
    const numericIndex = Number.isNaN(Number(part)) ? null : Number(part);

    if (numericIndex !== null) {
      if (!Array.isArray(current)) {
        // We can't reassign the parent reference safely here, so if the
        // structure is wrong we just bail out rather than corrupt it.
        return;
      }
      if (!current[numericIndex]) current[numericIndex] = nextIsIndex ? [] : {};
      if (isLast) {
        current[numericIndex] = value;
      } else {
        current = current[numericIndex];
      }
      return;
    }

    if (isLast) {
      current[part] = value;
      return;
    }

    if (!(part in current) || current[part] === null) {
      current[part] = nextIsIndex ? [] : {};
    }

    current = current[part];
  });
}

// =============================================================================
// CANONICAL SERVICE DATE RESOLUTION
// =============================================================================

/**
 * Resolves the canonical notice service date from wizard facts.
 *
 * This helper provides a single source of truth for notice service dates,
 * addressing the mismatch between wizard field IDs and maps_to paths.
 *
 * PRECEDENCE ORDER:
 * 1. User-entered date from wizard (maps_to paths)
 * 2. Direct field ID keys (legacy)
 * 3. Fallback to null (caller must decide whether to default to today)
 *
 * PATHS CHECKED (by jurisdiction):
 * - England/Wales: notice_service.notice_date, notice_service_date, service_date
 * - Scotland: notice.notice_date, notice_date
 * - Legacy: service_date (flat key)
 *
 * @param wizard - The wizard facts object
 * @returns The canonical service date string (YYYY-MM-DD) or null if not found
 */
export function resolveNoticeServiceDate(wizard: WizardFacts): string | null {
  // Check all possible paths in precedence order
  // IMPORTANT: Section 8 notice templates use service_date, notice_service_date, intended_service_date
  // This list covers all legacy field IDs plus current wizard field IDs across all products
  // FIX: Added nested paths for section21.* and notice_service.date variants
  const candidates = [
    // Complete pack MQS maps_to path (England)
    'notice_served_date',
    // England/Wales maps_to path (nested from MQS maps_to)
    'notice_service.notice_date',
    // Alternative nested path - notice_service.date (some wizards use this)
    'notice_service.date',
    // Section 21 specific nested paths
    'section21.notice_service_date',
    'section21.service_date',
    'section21.notice_date',
    // Scotland maps_to path
    'notice.notice_date',
    'notice.date',
    // Direct field IDs (wizard stores by field id) - most common for notice-only
    'notice_service_date',
    'service_date',
    // Section 8 specific date fields (used by complete pack and N5 forms)
    'section_8_notice_date',
    'section8_notice_date',
    // Intended service date (used in Form 3 Section 8 template)
    'intended_service_date',
    // Scotland field ID
    'notice_date',
    // Tenancy nested paths
    'tenancy.notice_service_date',
    'tenancy.service_date',
    // Additional legacy aliases that may exist in older wizard data
    'date_notice_served',
    'date_of_service',
    'served_on',
    'served_date',
  ];

  for (const path of candidates) {
    const value = getWizardValue(wizard, path);
    if (value && typeof value === 'string' && value.trim()) {
      // Validate it looks like a date (YYYY-MM-DD or parseable)
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        // Return in ISO format (YYYY-MM-DD)
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  return null;
}

/**
 * Resolves the canonical notice expiry date from wizard facts.
 *
 * Similar to resolveNoticeServiceDate but for expiry dates.
 *
 * @param wizard - The wizard facts object
 * @returns The canonical expiry date string (YYYY-MM-DD) or null if not found
 */
export function resolveNoticeExpiryDate(wizard: WizardFacts): string | null {
  // Check all possible paths for expiry/possession dates
  // IMPORTANT: Templates use earliest_possession_date_formatted, notice_expiry_date, etc.
  // This list covers all legacy field IDs plus current wizard field IDs across all products
  // FIX: Added nested paths for section21.* and notice_service.expiry_date variants
  const candidates = [
    // England/Wales maps_to path (nested from MQS maps_to)
    'notice_service.notice_expiry_date',
    'notice_service.expiry_date',
    // Section 21 specific nested paths
    'section21.notice_expiry_date',
    'section21.expiry_date',
    'section21.earliest_possession_date',
    'section21.possession_date',
    // Direct field IDs - most common for notice-only
    'notice_expiry_date',
    'expiry_date',
    // Section 8 specific (earliest date court can hear possession claim)
    'earliest_possession_date',
    'section8_expiry_date',
    'section_8_expiry_date',
    // Additional Section 8 legacy aliases
    'earliest_court_date',
    'earliest_hearing_date',
    'possession_date',
    // Scotland
    'earliest_leaving_date',
    'earliest_tribunal_date',
    // Tenancy nested paths
    'tenancy.expiry_date',
    'tenancy.notice_expiry_date',
    // Legacy aliases
    'notice_end_date',
    'end_date',
  ];

  for (const path of candidates) {
    const value = getWizardValue(wizard, path);
    if (value && typeof value === 'string' && value.trim()) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  return null;
}

/**
 * Helper to extract tenant data from flat wizard facts
 * Looks for keys like "tenants.0.full_name", "tenants.0.email", etc.
 */
function extractTenants(wizard: WizardFacts): PartyDetails[] {
  const isTruthy = <T>(value: T | null | undefined | false): value is T => Boolean(value);

  if (Array.isArray((wizard as any).tenants)) {
    return (wizard as any).tenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const partiesTenantsList = (wizard as any).parties?.tenants;
  if (Array.isArray(partiesTenantsList)) {
    return partiesTenantsList
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const tenants: PartyDetails[] = [];

  const explicitPrimaryName =
    getWizardValue(wizard, 'defendant_name_1') ||
    getWizardValue(wizard, 'defendant_full_name') ||
    getWizardValue(wizard, 'defender_full_name') ||
    getWizardValue(wizard, 'tenant_full_name') || // IMPORTANT: Notice Only YAML maps to this
    getWizardValue(wizard, 'tenant1_name') ||
    getWizardValue(wizard, 'defendant_name');

  if (explicitPrimaryName) {
    tenants.push({
      name: explicitPrimaryName,
      email:
        getWizardValue(wizard, 'tenant_email') ||
        getWizardValue(wizard, 'tenant1_email') ||
        getWizardValue(wizard, 'defendant_email') ||
        getWizardValue(wizard, 'defender_email') ||
        getWizardValue(wizard, 'defender_contact'),
      phone:
        getWizardValue(wizard, 'tenant_phone') ||
        getWizardValue(wizard, 'tenant1_phone') ||
        getWizardValue(wizard, 'defendant_phone') ||
        getWizardValue(wizard, 'defender_phone') ||
        getWizardValue(wizard, 'defender_contact'),
      address_line1: getWizardValue(wizard, 'tenant1_address_line1'),
      address_line2: getWizardValue(wizard, 'tenant1_address_line2'),
      city: getWizardValue(wizard, 'tenant1_city'),
      postcode: getWizardValue(wizard, 'tenant1_postcode'),
    });
  }

  const explicitSecondaryName =
    getWizardValue(wizard, 'tenant2_name') ||
    getWizardValue(wizard, 'defendant_name_2') ||
    getWizardValue(wizard, 'defendant_secondary_name') ||
    getWizardValue(wizard, 'defender_secondary_name');

  if (explicitSecondaryName) {
    tenants.push({
      name: explicitSecondaryName,
      email:
        getWizardValue(wizard, 'tenant2_email') ||
        getWizardValue(wizard, 'defendant_secondary_email') ||
        getWizardValue(wizard, 'defender_secondary_email'),
      phone:
        getWizardValue(wizard, 'tenant2_phone') ||
        getWizardValue(wizard, 'defendant_secondary_phone') ||
        getWizardValue(wizard, 'defender_secondary_phone'),
      address_line1: getWizardValue(wizard, 'tenant2_address_line1'),
      address_line2: getWizardValue(wizard, 'tenant2_address_line2'),
      city: getWizardValue(wizard, 'tenant2_city'),
      postcode: getWizardValue(wizard, 'tenant2_postcode'),
    });
  }

  if (Array.isArray((wizard as any).tenants)) {
    const list = (wizard as any).tenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
    return tenants.length ? tenants.concat(list) : list;
  }

  const partiesTenants = (wizard as any).parties?.tenants;
  if (Array.isArray(partiesTenants)) {
    return partiesTenants
      .filter(isTruthy)
      .map((t: any) => ({
        name: t.full_name || t.name || '',
        email: t.email,
        phone: t.phone || t.phone_number,
        address_line1: t.address_line1,
        address_line2: t.address_line2,
        city: t.city,
        postcode: t.postcode,
      }));
  }

  const tenantIndices = new Set<number>();

  // Find all tenant indices by scanning keys
  Object.keys(wizard).forEach((key) => {
    const match = key.match(/^(?:tenants|parties\.tenants)\.(\d+)\./);
    if (match) {
      tenantIndices.add(parseInt(match[1], 10));
    }
  });

  // Build tenant objects for each index found
  Array.from(tenantIndices)
    .sort((a, b) => a - b)
    .forEach((index) => {
      tenants.push({
        name:
          getWizardValue(wizard, `tenants.${index}.full_name`) ||
          getWizardValue(wizard, `tenants.${index}.name`),
        email: getWizardValue(wizard, `tenants.${index}.email`),
        phone:
          getWizardValue(wizard, `tenants.${index}.phone`) ||
          getWizardValue(wizard, `tenants.${index}.phone_number`),
        address_line1: getWizardValue(wizard, `tenants.${index}.address_line1`),
        address_line2: getWizardValue(wizard, `tenants.${index}.address_line2`),
        city: getWizardValue(wizard, `tenants.${index}.city`),
        postcode: getWizardValue(wizard, `tenants.${index}.postcode`),
      });
    });

  return tenants;
}

function extractSharedArrearsAmount(wizard: WizardFacts): number | null {
  const sharedArrearsRaw = getFirstValue(wizard, [
    'ground_particulars.shared_arrears.amount',
    'ground_particulars.shared_arrears.total_amount_owed',
    'section_8_particulars.shared_arrears.amount',
    'section_8_particulars.shared_arrears.total_amount_owed',
  ]);

  return parseCurrencyAmount(sharedArrearsRaw);
}


// -----------------------------------------------------------------------------
// CASE HEALTH - compute contradictions, missing evidence, compliance warnings
// -----------------------------------------------------------------------------

function computeCaseHealth(base: CaseFacts): CaseFacts['case_health'] {
  const contradictions: string[] = [];
  const missing_evidence: string[] = [];
  const compliance_warnings: string[] = [];

  const isMoneyClaim =
    base.meta.product === 'money_claim' ||
    base.court.route === 'money_claim';

  if (!isMoneyClaim) {
    return {
      contradictions,
      missing_evidence,
      compliance_warnings,
      risk_level: 'low',
    };
  }

  const hasString = (value: unknown | null | undefined): boolean =>
    typeof value === 'string' && value.trim().length > 0;
  const hasArray = (value: unknown | null | undefined): boolean =>
    Array.isArray(value) && value.length > 0;
  const isTrue = (value: unknown | null | undefined): boolean => value === true;

  // Parties / identity basics
  if (!hasString(base.parties.landlord.name)) {
    missing_evidence.push('Missing landlord/claimant name.');
  }
  if (!base.parties.tenants.length || !hasString(base.parties.tenants[0]?.name)) {
    missing_evidence.push('Missing tenant/defendant name.');
  }

  // Property
  if (!hasString(base.property.address_line1) || !hasString(base.property.postcode)) {
    missing_evidence.push('Missing property address or postcode.');
  }

  // Money claim basics
  if (base.tenancy.rent_amount === null) {
    missing_evidence.push('Missing rent amount for calculating arrears.');
  }
  if (base.issues.rent_arrears.total_arrears === null) {
    missing_evidence.push('Missing total rent arrears figure.');
  }

  // Arrears evidence
  const hasArrearsSchedule =
    base.issues.rent_arrears.arrears_items.length > 0 ||
    base.money_claim.arrears_schedule_confirmed === true ||
    base.evidence.rent_schedule_uploaded === true;

  if (!hasArrearsSchedule) {
    missing_evidence.push('No arrears schedule or rent ledger confirmed.');
  }

  // Attempts to resolve
  if (!hasString(base.money_claim.attempts_to_resolve)) {
    compliance_warnings.push('Attempts to resolve the dispute not described.');
  }

  // PAP-DEBT / pre-action steps
  if (!hasString(base.money_claim.lba_date)) {
    compliance_warnings.push('Letter Before Claim date not provided.');
  }
  if (!hasString(base.money_claim.lba_response_deadline)) {
    compliance_warnings.push('Response deadline for Letter Before Claim not provided.');
  }
  if (!isTrue(base.money_claim.pap_documents_served)) {
    compliance_warnings.push('PAP-DEBT documents not marked as served on the tenant.');
  }
  if (!hasArray(base.money_claim.pap_service_method)) {
    compliance_warnings.push('Service method for PAP-DEBT pack not recorded.');
  }

  // Evidence flags
  const hasAnyEvidenceFlag =
    hasArray(base.money_claim.evidence_types_available) ||
    base.evidence.tenancy_agreement_uploaded ||
    base.evidence.rent_schedule_uploaded ||
    base.evidence.bank_statements_uploaded ||
    base.evidence.other_evidence_uploaded;

  if (!hasAnyEvidenceFlag) {
    compliance_warnings.push(
      'No supporting evidence flagged (tenancy agreement, statements, or other evidence).'
    );
  }

  // Contradictions (simple heuristics)
  if (
    base.issues.rent_arrears.has_arrears === false &&
    (base.issues.rent_arrears.total_arrears ?? 0) > 0
  ) {
    contradictions.push(
      'Marked as having no rent arrears but a positive arrears total was provided.'
    );
  }

  if (
    base.money_claim.tenant_responded === true &&
    !hasString(base.money_claim.tenant_response_details)
  ) {
    contradictions.push(
      'Tenant is marked as having responded, but no response details were provided.'
    );
  }

  if (
    (base.issues.rent_arrears.total_arrears ?? 0) === 0 &&
    base.money_claim.basis_of_claim === 'rent_arrears'
  ) {
    contradictions.push(
      'Basis of claim is rent arrears but total arrears is recorded as £0.'
    );
  }

  // Risk level heuristic
  let risk_level: 'low' | 'medium' | 'high' = 'low';

  if (contradictions.length > 0 || missing_evidence.length >= 4) {
    risk_level = 'high';
  } else if (missing_evidence.length > 0 || compliance_warnings.length > 0) {
    risk_level = 'medium';
  }

  return {
    contradictions,
    missing_evidence,
    compliance_warnings,
    risk_level,
  };
}

/**
 * Converts flat WizardFacts (DB storage) to nested CaseFacts (domain model).
 *
 * @param wizard - Flat facts from case_facts.facts column
 * @returns Nested domain model for generators/analysis
 */
export function wizardFactsToCaseFacts(wizard: WizardFacts): CaseFacts {
  if (!wizard || typeof wizard !== 'object') {
    return createEmptyCaseFacts();
  }

  const base = createEmptyCaseFacts();


  // Apply any MQS answers that map directly to case_facts.* paths
  Object.entries(wizard).forEach(([key, value]) => {
    if (!key.startsWith('case_facts.')) return;
    const path = key.replace(/^case_facts\./, '').replace(/\[(\d+)\]/g, '.$1');
    setNestedValue(base as any, path, value);
  });

  // =============================================================================
  // META - Product, tier, jurisdiction, case id
  // =============================================================================
  base.meta = {
    product: wizard.__meta?.product ?? (wizard as any).product ?? null,
    original_product: wizard.__meta?.original_product ?? (wizard as any).product ?? null,
    product_tier: wizard.__meta?.product_tier ?? (wizard as any).product_tier ?? null,
    jurisdiction:
      wizard.__meta?.jurisdiction ??
      (wizard as any).jurisdiction ??
      null,
    case_id:
      wizard.__meta?.case_id ??
      (wizard as any).case_id ??
      null,
  };

  // =============================================================================
  // PROPERTY - Address and details
  // =============================================================================
  base.property.address_line1 ??= getFirstValue(wizard, [
    'case_facts.property.address_line1',
    'property_address.address_line1',
    'property_address',
    'property_address_line1',
    'property.address_line1',
  ]);
  base.property.address_line2 ??= getFirstValue(wizard, [
    'case_facts.property.address_line2',
    'property_address.address_line2',
    'property_address_line2',
    'property.address_line2',
  ]);
  base.property.city ??= getFirstValue(wizard, [
    'case_facts.property.city',
    'property_address.city',
    'property_city',
    'property.city',
    'property_address_town',
  ]);
  base.property.postcode ??= getFirstValue(wizard, [
    'case_facts.property.postcode',
    'property_address.postcode',
    'property_postcode',
    'property.postcode',
    'property_address_postcode',
  ]);
  base.property.country ??= getFirstValue(wizard, [
    'case_facts.property.country',
    'property_country',
    'jurisdiction',
  ]) as any;

  const normalizedCountry = normalizeJurisdiction(base.property.country as any);
  base.property.country = normalizedCountry ?? null;
  const propertyIsHmo = getFirstValue(wizard, [
    'case_facts.property.is_hmo',
    'property_is_hmo',
    'is_hmo',
    'property.is_hmo',
  ]);
  if (propertyIsHmo !== null) {
    base.property.is_hmo = coerceBoolean(propertyIsHmo);
  }

  // Keep nested address object in sync for callers that use property.address.*
  if (!base.property.address) {
    base.property.address = {
      line1: base.property.address_line1,
      line2: base.property.address_line2,
      city: base.property.city,
      postcode: base.property.postcode,
    };
  } else {
    base.property.address.line1 ??= base.property.address_line1;
    base.property.address.line2 ??= base.property.address_line2;
    base.property.address.city ??= base.property.city;
    base.property.address.postcode ??= base.property.postcode;
  }

  // =============================================================================
  // TENANCY - Dates, rent, deposit
  // =============================================================================
  base.tenancy.tenancy_type =
    (getWizardValue(wizard, 'tenancy_type') as any) || base.tenancy.tenancy_type;
  base.tenancy.start_date ??= getFirstValue(wizard, [
    'case_facts.tenancy.start_date',
    'tenancy_start_date',
    'start_date',
  ]);
  base.tenancy.end_date ??= getFirstValue(wizard, [
    'case_facts.tenancy.end_date',
    'tenancy_end_date',
    'fixed_term_end_date',
    'tenancy.fixed_term_end_date',
    'case_facts.tenancy.fixed_term_end_date',
  ]);

  // Resolve fixed_term from explicit fields or infer from tenancy_type
  const fixedTerm = getFirstValue(wizard, ['tenancy_fixed_term', 'is_fixed_term']);
  if (fixedTerm !== null && fixedTerm !== undefined) {
    base.tenancy.fixed_term = coerceBoolean(fixedTerm);
  } else {
    // Infer fixed_term from tenancy_type if not explicitly set
    const tenancyType = getFirstValue(wizard, [
      'tenancy_type',
      'tenancy.tenancy_type',
      'case_facts.tenancy.tenancy_type',
    ]);
    if (tenancyType && typeof tenancyType === 'string') {
      const lowerType = tenancyType.toLowerCase();
      // Check for common fixed term indicators
      if (
        lowerType.includes('fixed term') ||
        lowerType.includes('fixed-term') ||
        lowerType === 'ast_fixed' ||
        lowerType === 'fixed_term' ||
        lowerType === 'fixed'
      ) {
        base.tenancy.fixed_term = true;
      }
    }
  }
  base.tenancy.fixed_term_months ??= getWizardValue(wizard, 'tenancy_fixed_term_months');
  base.tenancy.rent_amount ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_amount',
    'rent_amount',
  ]);
  base.tenancy.rent_frequency ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_frequency',
    'rent_frequency',
    'rent_period',
  ]) as any;
  base.tenancy.rent_due_day ??= getFirstValue(wizard, [
    'case_facts.tenancy.rent_due_day',
    'rent_due_day',
  ]);
  base.tenancy.usual_payment_weekday ??= getFirstValue(wizard, [
    'case_facts.tenancy.usual_payment_weekday',
    'usual_payment_weekday',
  ]);
  base.tenancy.deposit_amount ??= getWizardValue(wizard, 'deposit_amount');
  base.tenancy.deposit_protected ??= getWizardValue(wizard, 'deposit_protected');
  base.tenancy.deposit_scheme_name ??= getWizardValue(wizard, 'deposit_scheme_name');
  base.tenancy.deposit_protection_date ??= getWizardValue(
    wizard,
    'deposit_protection_date'
  );
  base.tenancy.deposit_reference ??= getWizardValue(wizard, 'deposit_reference');

  // Prescribed information (Section 21 requirement when deposit taken)
  // Check multiple possible field names for backwards compatibility
  const prescribedInfoValue = getFirstValue(wizard, [
    'case_facts.tenancy.prescribed_info_given',
    'prescribed_info_given',
    'prescribed_info_provided',
    'prescribed_info_served',
    'tenancy.prescribed_info_given',
  ]);
  if (prescribedInfoValue !== null && prescribedInfoValue !== undefined) {
    base.tenancy.prescribed_info_given = coerceBoolean(prescribedInfoValue);
  }

  // =============================================================================
  // PARTIES - Landlord, agent, solicitor, tenants
  // =============================================================================
  base.parties.landlord.name ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.name',
    'landlord_name',
    'claimant_full_name',
    'pursuer_full_name',
    'landlord.name',
    'landlord_full_name',
  ]);
  base.parties.landlord.co_claimant ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.co_claimant',
    'landlord_co_claimant',
    'landlord2_full_name',
    'landlord2_name',
    'claimant_secondary_name',
    'pursuer_secondary_name',
  ]);
  base.parties.landlord.email ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.email',
    'landlord_email',
    'claimant_email',
    'pursuer_email',
    'landlord.email',
  ]);
  base.parties.landlord.phone ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.phone',
    'landlord_phone',
    'claimant_phone',
    'pursuer_phone',
    'landlord.phone',
  ]);
  base.parties.landlord.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.address_line1',
    'landlord_address_line1',
    'claimant_address.address_line1',
    'pursuer_address.address_line1',
    'landlord.address_line1',
    'landlord_address',
  ]);
  base.parties.landlord.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.address_line2',
    'landlord_address_line2',
    'claimant_address.address_line2',
    'pursuer_address.address_line2',
    'landlord.address_line2',
  ]);
  base.parties.landlord.city ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.city',
    'landlord_city',
    'claimant_address.city',
    'pursuer_address.city',
    'landlord.city',
    'landlord_address_town',
  ]);
  base.parties.landlord.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.landlord.postcode',
    'landlord_postcode',
    'claimant_address.postcode',
    'pursuer_address.postcode',
    'landlord.postcode',
    'landlord_address_postcode',
  ]);

  base.parties.agent.name ??= getFirstValue(wizard, [
    'case_facts.parties.agent.name',
    'agent_name',
    'agent.name',
  ]);
  base.parties.agent.email ??= getFirstValue(wizard, [
    'case_facts.parties.agent.email',
    'agent_email',
    'agent.email',
  ]);
  base.parties.agent.phone ??= getFirstValue(wizard, [
    'case_facts.parties.agent.phone',
    'agent_phone',
    'agent.phone',
  ]);
  base.parties.agent.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.agent.address_line1',
    'agent_address_line1',
    'agent.address_line1',
  ]);
  base.parties.agent.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.agent.address_line2',
    'agent_address_line2',
    'agent.address_line2',
  ]);
  base.parties.agent.city ??= getFirstValue(wizard, [
    'case_facts.parties.agent.city',
    'agent_city',
    'agent.city',
  ]);
  base.parties.agent.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.agent.postcode',
    'agent_postcode',
    'agent.postcode',
  ]);

  base.parties.solicitor.name ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.name',
    'solicitor_name',
    'solicitor.name',
  ]);
  base.parties.solicitor.email ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.email',
    'solicitor_email',
    'solicitor.email',
  ]);
  base.parties.solicitor.phone ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.phone',
    'solicitor_phone',
    'solicitor.phone',
  ]);
  base.parties.solicitor.address_line1 ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.address_line1',
    'solicitor_address_line1',
    'solicitor.address_line1',
  ]);
  base.parties.solicitor.address_line2 ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.address_line2',
    'solicitor_address_line2',
    'solicitor.address_line2',
  ]);
  base.parties.solicitor.city ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.city',
    'solicitor_city',
    'solicitor.city',
  ]);
  base.parties.solicitor.postcode ??= getFirstValue(wizard, [
    'case_facts.parties.solicitor.postcode',
    'solicitor_postcode',
    'solicitor.postcode',
  ]);

  if (!base.parties.tenants.length) {
    base.parties.tenants = extractTenants(wizard);
  }

  // =============================================================================
  // ISSUES - Arrears, ASB, other breaches, Section 8 grounds, AST verification
  // =============================================================================
  const sharedArrearsAmount = extractSharedArrearsAmount(wizard);

  base.issues.rent_arrears.has_arrears ??= getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.has_arrears',
    'has_rent_arrears',
    'rent_arrears.has_arrears',
  ]);

  const totalArrearsRaw =
    base.issues.rent_arrears.total_arrears ??
    getFirstValue(wizard, [
      'case_facts.issues.rent_arrears.total_arrears',
      'total_arrears',
      'arrears_total',
      'rent_arrears.total_arrears',
    ]);
  const parsedTotalArrears = parseCurrencyAmount(totalArrearsRaw);
  if (parsedTotalArrears !== null) {
    base.issues.rent_arrears.total_arrears = parsedTotalArrears;
  } else if (
    (base.issues.rent_arrears.total_arrears === null || base.issues.rent_arrears.total_arrears === undefined) &&
    sharedArrearsAmount !== null
  ) {
    base.issues.rent_arrears.total_arrears = sharedArrearsAmount;
  }

  const arrearsAtNoticeRaw =
    base.issues.rent_arrears.arrears_at_notice_date ??
    getFirstValue(wizard, [
      'case_facts.issues.rent_arrears.arrears_at_notice_date',
      'arrears_at_notice_date',
      'arrears_summary.arrears_at_notice_date',
    ]);
  const parsedArrearsAtNotice = parseCurrencyAmount(arrearsAtNoticeRaw);
  if (parsedArrearsAtNotice !== null) {
    base.issues.rent_arrears.arrears_at_notice_date = parsedArrearsAtNotice;
  } else if (
    (base.issues.rent_arrears.arrears_at_notice_date === null ||
      base.issues.rent_arrears.arrears_at_notice_date === undefined) &&
    sharedArrearsAmount !== null
  ) {
    base.issues.rent_arrears.arrears_at_notice_date = sharedArrearsAmount;
  }

  if (
    base.issues.rent_arrears.has_arrears === null ||
    base.issues.rent_arrears.has_arrears === undefined
  ) {
    const derivedArrears =
      base.issues.rent_arrears.arrears_at_notice_date ??
      base.issues.rent_arrears.total_arrears ??
      sharedArrearsAmount;
    if (derivedArrears !== null && derivedArrears !== undefined) {
      base.issues.rent_arrears.has_arrears = derivedArrears > 0;
    }
  }
  if (!base.issues.rent_arrears.arrears_items.length) {
    const arrearsItems = getFirstValue(wizard, [
      'case_facts.issues.rent_arrears.arrears_items',
      'arrears_items',
    ]);
    if (Array.isArray(arrearsItems)) {
      base.issues.rent_arrears.arrears_items = arrearsItems as any;
    } else if (
      arrearsItems &&
      typeof arrearsItems === 'object' &&
      Array.isArray((arrearsItems as any).arrears_items)
    ) {
      base.issues.rent_arrears.arrears_items = (arrearsItems as any).arrears_items;
    }
  }
  // Scotland pre-action requirements
  const preActionConfirmed = getFirstValue(wizard, [
    'case_facts.issues.rent_arrears.pre_action_confirmed',
    'pre_action_contact',
    'pre_action_confirmed',
  ]);
  if (preActionConfirmed !== null && preActionConfirmed !== undefined) {
    base.issues.rent_arrears.pre_action_confirmed = coerceBoolean(preActionConfirmed);
  }

  base.issues.asb.has_asb ??= getFirstValue(wizard, [
    'case_facts.issues.asb.has_asb',
    'has_asb',
    'asb.has_asb',
  ]);
  base.issues.asb.description ??= getFirstValue(wizard, [
    'case_facts.issues.asb.description',
    'asb_description',
    'asb.description',
  ]);

  base.issues.other_breaches.has_breaches ??= getFirstValue(wizard, [
    'case_facts.issues.other_breaches.has_breaches',
    'has_other_breaches',
    'other_breaches.has_breaches',
  ]);
  base.issues.other_breaches.description ??= getFirstValue(wizard, [
    'case_facts.issues.other_breaches.description',
    'other_breaches_description',
    'other_breaches.description',
  ]);

  // Keep "breaches" alias in sync for case-intel / evidence helpers
  (base.issues as any).breaches ??= base.issues.other_breaches;

  // Section 8 ground-specific details (England & Wales)
  const section8Grounds = getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.selected_grounds',
    'section8_grounds',
    'section8_grounds_selection',
    'selected_grounds',
  ]);
  if (Array.isArray(section8Grounds)) {
    base.issues.section8_grounds.selected_grounds = section8Grounds as string[];
  } else if (section8Grounds && typeof section8Grounds === 'string') {
    base.issues.section8_grounds.selected_grounds = [section8Grounds];
  }

  base.issues.section8_grounds.arrears_breakdown ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.arrears_breakdown',
    'arrears_breakdown',
    'section8_arrears_details',
  ]);
  base.issues.section8_grounds.incident_log ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.incident_log',
    'asb_details',
    'section8_other_grounds_narrative',
  ]);
  base.issues.section8_grounds.breach_details ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.breach_details',
    'ground12_details',
    'tenancy_clause_breached',
  ]);
  base.issues.section8_grounds.damage_schedule ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.damage_schedule',
    'damage_details',
    'deterioration_description',
  ]);
  base.issues.section8_grounds.false_statement_details ??= getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.false_statement_details',
    'ground17_details',
    'false_statement_description',
  ]);

  // =============================================================================
  // GROUND-SPECIFIC DETAILED FACTS (Section 8 per-ground questions)
  // =============================================================================

  // Ground 8 - Serious Rent Arrears
  base.ground_8 = {
    arrears_at_notice: parseCurrencyAmount(getWizardValue(wizard, 'ground_8.arrears_at_notice') ?? getWizardValue(wizard, 'g8_arrears_at_notice')),
    arrears_current: parseCurrencyAmount(getWizardValue(wizard, 'ground_8.arrears_current') ?? getWizardValue(wizard, 'g8_arrears_current')),
    last_payment_date: getWizardValue(wizard, 'ground_8.last_payment_date') ?? getWizardValue(wizard, 'g8_last_payment_date'),
    last_payment_amount: parseCurrencyAmount(getWizardValue(wizard, 'ground_8.last_payment_amount') ?? getWizardValue(wizard, 'g8_last_payment_amount')),
    payment_demands_sent: getWizardValue(wizard, 'ground_8.payment_demands_sent') ?? getWizardValue(wizard, 'g8_payment_demands_sent'),
    tenant_response: getWizardValue(wizard, 'ground_8.tenant_response') ?? getWizardValue(wizard, 'g8_tenant_response'),
  };

  // Ground 10 - Some Rent Arrears
  base.ground_10 = {
    arrears_amount: parseCurrencyAmount(getWizardValue(wizard, 'ground_10.arrears_amount') ?? getWizardValue(wizard, 'g10_arrears_amount')),
    arrears_history: getWizardValue(wizard, 'ground_10.arrears_history') ?? getWizardValue(wizard, 'g10_arrears_history'),
    attempts_to_recover: getWizardValue(wizard, 'ground_10.attempts_to_recover') ?? getWizardValue(wizard, 'g10_attempts_to_recover'),
  };

  // Ground 11 - Persistent Delay
  base.ground_11 = {
    pattern_description: getWizardValue(wizard, 'ground_11.pattern_description') ?? getWizardValue(wizard, 'g11_pattern_description'),
    late_payment_dates: getWizardValue(wizard, 'ground_11.late_payment_dates') ?? getWizardValue(wizard, 'g11_late_payment_dates'),
    warnings_issued: getWizardValue(wizard, 'ground_11.warnings_issued') ?? getWizardValue(wizard, 'g11_warnings_issued'),
  };

  // Ground 12 - Breach of Tenancy
  const g12BreachType = getWizardValue(wizard, 'ground_12.breach_type') ?? getWizardValue(wizard, 'g12_breach_type');
  base.ground_12 = {
    breach_type: Array.isArray(g12BreachType) ? g12BreachType : (g12BreachType ? [g12BreachType] : null),
    tenancy_clause: getWizardValue(wizard, 'ground_12.tenancy_clause') ?? getWizardValue(wizard, 'g12_tenancy_clause'),
    breach_dates: getWizardValue(wizard, 'ground_12.breach_dates') ?? getWizardValue(wizard, 'g12_breach_dates'),
    breach_evidence: getWizardValue(wizard, 'ground_12.breach_evidence') ?? getWizardValue(wizard, 'g12_breach_evidence'),
    warnings_issued: getWizardValue(wizard, 'ground_12.warnings_issued') ?? getWizardValue(wizard, 'g12_warnings_issued'),
  };

  // Ground 13 - Waste/Neglect/Damage
  base.ground_13 = {
    damage_description: getWizardValue(wizard, 'ground_13.damage_description') ?? getWizardValue(wizard, 'g13_damage_description'),
    damage_discovered_date: getWizardValue(wizard, 'ground_13.damage_discovered_date') ?? getWizardValue(wizard, 'g13_damage_discovered_date'),
    damage_cost: parseCurrencyAmount(getWizardValue(wizard, 'ground_13.damage_cost') ?? getWizardValue(wizard, 'g13_damage_cost')),
    evidence_available: getWizardValue(wizard, 'ground_13.evidence_available') ?? getWizardValue(wizard, 'g13_evidence_available'),
    tenant_notified: coerceBoolean(getWizardValue(wizard, 'ground_13.tenant_notified') ?? getWizardValue(wizard, 'g13_tenant_notified')),
    tenant_response: getWizardValue(wizard, 'ground_13.tenant_response') ?? getWizardValue(wizard, 'g13_tenant_response'),
  };

  // Ground 14 - Nuisance/Annoyance
  const g14BehaviourType = getWizardValue(wizard, 'ground_14.behaviour_type') ?? getWizardValue(wizard, 'g14_behaviour_type');
  base.ground_14 = {
    behaviour_type: Array.isArray(g14BehaviourType) ? g14BehaviourType : (g14BehaviourType ? [g14BehaviourType] : null),
    incident_count: parseCurrencyAmount(getWizardValue(wizard, 'ground_14.incident_count') ?? getWizardValue(wizard, 'g14_incident_count')),
    incidents_description: getWizardValue(wizard, 'ground_14.incidents_description') ?? getWizardValue(wizard, 'g14_incidents_description'),
    affected_parties: getWizardValue(wizard, 'ground_14.affected_parties') ?? getWizardValue(wizard, 'g14_affected_parties'),
    witnesses: coerceBoolean(getWizardValue(wizard, 'ground_14.witnesses') ?? getWizardValue(wizard, 'g14_witnesses')),
    witness_names: getWizardValue(wizard, 'ground_14.witness_names') ?? getWizardValue(wizard, 'g14_witness_names'),
    police_involved: coerceBoolean(getWizardValue(wizard, 'ground_14.police_involved') ?? getWizardValue(wizard, 'g14_police_involved')),
    police_reference: getWizardValue(wizard, 'ground_14.police_reference') ?? getWizardValue(wizard, 'g14_police_reference'),
    council_involved: coerceBoolean(getWizardValue(wizard, 'ground_14.council_involved') ?? getWizardValue(wizard, 'g14_council_involved')),
    council_reference: getWizardValue(wizard, 'ground_14.council_reference') ?? getWizardValue(wizard, 'g14_council_reference'),
    warnings_issued: getWizardValue(wizard, 'ground_14.warnings_issued') ?? getWizardValue(wizard, 'g14_warnings_issued'),
  };

  // Ground 15 - Damage to Furniture
  base.ground_15 = {
    furniture_damaged: getWizardValue(wizard, 'ground_15.furniture_damaged') ?? getWizardValue(wizard, 'g15_furniture_damaged'),
    damage_cost: parseCurrencyAmount(getWizardValue(wizard, 'ground_15.damage_cost') ?? getWizardValue(wizard, 'g15_damage_cost')),
    inventory_available: coerceBoolean(getWizardValue(wizard, 'ground_15.inventory_available') ?? getWizardValue(wizard, 'g15_inventory_available')),
    evidence_description: getWizardValue(wizard, 'ground_15.evidence_description') ?? getWizardValue(wizard, 'g15_evidence_description'),
  };

  // Ground 17 - False Statement
  base.ground_17 = {
    statement_made: getWizardValue(wizard, 'ground_17.statement_made') ?? getWizardValue(wizard, 'g17_statement_made'),
    statement_date: getWizardValue(wizard, 'ground_17.statement_date') ?? getWizardValue(wizard, 'g17_statement_date'),
    how_statement_made: getWizardValue(wizard, 'ground_17.how_statement_made') ?? getWizardValue(wizard, 'g17_how_statement_made'),
    true_facts: getWizardValue(wizard, 'ground_17.true_facts') ?? getWizardValue(wizard, 'g17_true_facts'),
    reliance_on_statement: getWizardValue(wizard, 'ground_17.reliance_on_statement') ?? getWizardValue(wizard, 'g17_reliance_on_statement'),
    discovery_date: getWizardValue(wizard, 'ground_17.discovery_date') ?? getWizardValue(wizard, 'g17_discovery_date'),
    discovery_method: getWizardValue(wizard, 'ground_17.discovery_method') ?? getWizardValue(wizard, 'g17_discovery_method'),
  };

  // =============================================================================
  // RISK INDICATORS
  // =============================================================================

  base.risk = {
    // Core eviction risk indicators
    known_tenant_defences: getWizardValue(wizard, 'risk.known_tenant_defences') ?? getWizardValue(wizard, 'known_tenant_defences'),
    previous_court_proceedings: coerceBoolean(getWizardValue(wizard, 'risk.previous_court_proceedings') ?? getWizardValue(wizard, 'previous_court_proceedings')),
    previous_proceedings_details: getWizardValue(wizard, 'risk.previous_proceedings_details') ?? getWizardValue(wizard, 'previous_proceedings_details'),
    disrepair_complaints: coerceBoolean(getWizardValue(wizard, 'risk.disrepair_complaints') ?? getWizardValue(wizard, 'disrepair_complaints')),
    disrepair_complaint_date: getWizardValue(wizard, 'risk.disrepair_complaint_date') ?? getWizardValue(wizard, 'disrepair_complaint_date'),
    disrepair_issues_list: getWizardValue(wizard, 'risk.disrepair_issues_list') ?? getWizardValue(wizard, 'disrepair_issues_list'),
    tenant_vulnerability: coerceBoolean(getWizardValue(wizard, 'risk.tenant_vulnerability') ?? getWizardValue(wizard, 'tenant_vulnerability')),
    tenant_vulnerability_details: getWizardValue(wizard, 'risk.tenant_vulnerability_details') ?? getWizardValue(wizard, 'tenant_vulnerability_details'),
    // Money claim risk indicators
    tenant_disputes_claim: coerceBoolean(getWizardValue(wizard, 'risk.tenant_disputes_claim')),
    contract_holder_disputes_claim: coerceBoolean(getWizardValue(wizard, 'risk.contract_holder_disputes_claim')),
    defender_disputes_claim: coerceBoolean(getWizardValue(wizard, 'risk.defender_disputes_claim')),
    dispute_details: getWizardValue(wizard, 'risk.dispute_details'),
    deposit_dispute_pending: coerceBoolean(getWizardValue(wizard, 'risk.deposit_dispute_pending')),
    deposit_dispute_amount: coerceNumber(getWizardValue(wizard, 'risk.deposit_dispute_amount')),
    tenant_counterclaim_likely: coerceBoolean(getWizardValue(wizard, 'risk.tenant_counterclaim_likely')),
    contract_holder_counterclaim_likely: coerceBoolean(getWizardValue(wizard, 'risk.contract_holder_counterclaim_likely')),
    defender_counterclaim_likely: coerceBoolean(getWizardValue(wizard, 'risk.defender_counterclaim_likely')),
    counterclaim_grounds: coerceStringArray(getWizardValue(wizard, 'risk.counterclaim_grounds')),
    payment_plan_offered: coerceBoolean(getWizardValue(wizard, 'risk.payment_plan_offered')),
    payment_plan_response: getWizardValue(wizard, 'risk.payment_plan_response'),
    rent_smart_wales_compliant: coerceBoolean(getWizardValue(wizard, 'risk.rent_smart_wales_compliant')),
  };

  // =============================================================================
  // COMMUNICATION TIMELINE
  // =============================================================================

  const commEntries: any[] = [];
  // Try to parse communication timeline entries array
  const rawCommEntries = getWizardValue(wizard, 'communication_timeline.entries') ?? getWizardValue(wizard, 'communication_entries');
  if (Array.isArray(rawCommEntries)) {
    for (const entry of rawCommEntries) {
      if (entry && typeof entry === 'object') {
        commEntries.push({
          date: entry.date ?? entry.comm_date ?? null,
          method: entry.method ?? entry.comm_method ?? null,
          summary: entry.summary ?? entry.comm_summary ?? null,
        });
      }
    }
  }
  base.communication_timeline = {
    entries: commEntries,
    narrative: getWizardValue(wizard, 'communication_timeline.narrative') ?? getWizardValue(wizard, 'communication_narrative'),
    // Money claim communication timeline fields
    first_arrears_notice_date: getWizardValue(wizard, 'communication.first_arrears_notice_date'),
    first_notice_method: getWizardValue(wizard, 'communication.first_notice_method'),
    subsequent_reminders_sent: coerceNumber(getWizardValue(wizard, 'communication.subsequent_reminders_sent')),
    final_demand_date: getWizardValue(wizard, 'communication.final_demand_date'),
    tenant_acknowledged_debt: coerceBoolean(getWizardValue(wizard, 'communication.tenant_acknowledged_debt')),
    contract_holder_acknowledged_debt: coerceBoolean(getWizardValue(wizard, 'communication.contract_holder_acknowledged_debt')),
    defender_acknowledged_debt: coerceBoolean(getWizardValue(wizard, 'communication.defender_acknowledged_debt')),
    acknowledgment_date: getWizardValue(wizard, 'communication.acknowledgment_date'),
    tenant_made_partial_payment: coerceBoolean(getWizardValue(wizard, 'communication.tenant_made_partial_payment')),
    contract_holder_made_partial_payment: coerceBoolean(getWizardValue(wizard, 'communication.contract_holder_made_partial_payment')),
    defender_made_partial_payment: coerceBoolean(getWizardValue(wizard, 'communication.defender_made_partial_payment')),
    last_partial_payment_date: getWizardValue(wizard, 'communication.last_partial_payment_date'),
    last_partial_payment_amount: coerceNumber(getWizardValue(wizard, 'communication.last_partial_payment_amount')),
  };

  // =============================================================================
  // SCOTLAND PRE-ACTION PROTOCOL
  // =============================================================================

  const scotlandSignposted = getWizardValue(wizard, 'scotland_pre_action.signposted_to') ?? getWizardValue(wizard, 'signposted_to');
  base.scotland_pre_action = {
    rent_statement_sent: coerceBoolean(getWizardValue(wizard, 'scotland_pre_action.rent_statement_sent') ?? getWizardValue(wizard, 'rent_statement_sent')),
    rent_statement_date: getWizardValue(wizard, 'scotland_pre_action.rent_statement_date') ?? getWizardValue(wizard, 'rent_statement_date'),
    advice_signposting: coerceBoolean(getWizardValue(wizard, 'scotland_pre_action.advice_signposting') ?? getWizardValue(wizard, 'advice_signposting')),
    signposted_to: Array.isArray(scotlandSignposted) ? scotlandSignposted : (scotlandSignposted ? [scotlandSignposted] : null),
    reasonable_time_given: coerceBoolean(getWizardValue(wizard, 'scotland_pre_action.reasonable_time_given') ?? getWizardValue(wizard, 'reasonable_time_given')),
    time_given_details: getWizardValue(wizard, 'scotland_pre_action.time_given_details') ?? getWizardValue(wizard, 'time_given_details'),
    payment_plan_offered: coerceBoolean(getWizardValue(wizard, 'scotland_pre_action.payment_plan_offered') ?? getWizardValue(wizard, 'payment_plan_offered')),
    payment_plan_details: getWizardValue(wizard, 'scotland_pre_action.payment_plan_details') ?? getWizardValue(wizard, 'payment_plan_details'),
    housing_benefit_check: coerceBoolean(getWizardValue(wizard, 'scotland_pre_action.housing_benefit_check') ?? getWizardValue(wizard, 'housing_benefit_check')),
    housing_benefit_details: getWizardValue(wizard, 'scotland_pre_action.housing_benefit_details') ?? getWizardValue(wizard, 'housing_benefit_details'),
  };

  // N5B AST verification (for accelerated possession)
  const astIsAst = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.is_ast',
    'ast_is_ast',
  ]);
  if (astIsAst !== null && astIsAst !== undefined) {
    base.issues.ast_verification.is_ast = coerceBoolean(astIsAst);
  }
  const astNotAgricultural = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_agricultural',
    'ast_not_agricultural',
  ]);
  if (astNotAgricultural !== null && astNotAgricultural !== undefined) {
    base.issues.ast_verification.not_agricultural = coerceBoolean(astNotAgricultural);
  }
  const astNotBusiness = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_business',
    'ast_not_business',
  ]);
  if (astNotBusiness !== null && astNotBusiness !== undefined) {
    base.issues.ast_verification.not_business = coerceBoolean(astNotBusiness);
  }
  const astNotLongLease = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_long_lease',
    'ast_not_long_lease',
  ]);
  if (astNotLongLease !== null && astNotLongLease !== undefined) {
    base.issues.ast_verification.not_long_lease = coerceBoolean(astNotLongLease);
  }
  const astNotFormerSecure = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_former_secure',
    'ast_not_former_secure',
  ]);
  if (astNotFormerSecure !== null && astNotFormerSecure !== undefined) {
    base.issues.ast_verification.not_former_secure = coerceBoolean(astNotFormerSecure);
  }
  const astNotExcluded = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.not_excluded',
    'ast_not_excluded',
  ]);
  if (astNotExcluded !== null && astNotExcluded !== undefined) {
    base.issues.ast_verification.not_excluded = coerceBoolean(astNotExcluded);
  }
  const astStandardRent = getFirstValue(wizard, [
    'case_facts.issues.ast_verification.standard_rent',
    'ast_standard_rent',
  ]);
  if (astStandardRent !== null && astStandardRent !== undefined) {
    base.issues.ast_verification.standard_rent = coerceBoolean(astStandardRent);
  }

  // =============================================================================
  // NOTICE - Section 8, Section 21, etc.
  // =============================================================================

  const rawNoticeType = (wizard as any).notice_type;
  const rawNoticeDate = (wizard as any).notice_date;
  const rawNoticeExpiry = (wizard as any).notice_expiry_date ?? (wizard as any).expiry_date;
  const rawNoticeServiceMethod = (wizard as any).notice_service_method;
  const rawNoticeServedBy = (wizard as any).notice_served_by;


  if (rawNoticeType) base.notice.notice_type = rawNoticeType as any;
  if (rawNoticeDate) base.notice.notice_date = rawNoticeDate as any;
  if (rawNoticeExpiry) base.notice.expiry_date = rawNoticeExpiry as any;
  if (rawNoticeServiceMethod) base.notice.service_method = rawNoticeServiceMethod as any;
  if (rawNoticeServedBy) base.notice.served_by = rawNoticeServedBy as any;

  // ROUTE NORMALIZATION: Convert user's route intent to canonical format
  // Handles legacy human-readable labels (e.g., "Section 8 - rent arrears / breach")
  // and new canonical values (e.g., "section_8")
  const evictionRouteIntent = getFirstValue(wizard, [
    'eviction_route_intent',
    'eviction_route',
    'route_intent',
  ]);

  if (evictionRouteIntent) {
    const normalizedRoutes = normalizeRoutes(evictionRouteIntent);
    const primaryRoute = getPrimaryRoute(normalizedRoutes);

    // Store normalized route as notice_type if not already set
    if (primaryRoute && !base.notice.notice_type) {
      base.notice.notice_type = routeToDocumentType(primaryRoute);
    }

    // Also set court.route for consistency
    if (primaryRoute && !base.court.route) {
      base.court.route = primaryRoute;
    }
  }

  base.notice.notice_type ??= getFirstValue(wizard, [
    'case_facts.notice.notice_type',
    'notice_type',
    'notice_reason',
  ]);
  base.notice.notice_date ??= getFirstValue(wizard, [
    'notice_served_date',
    'case_facts.notice.notice_date',
    'notice_date',
  ]);
  base.notice.service_date ??= getFirstValue(wizard, [
    'notice_served_date',
    'case_facts.notice.service_date',
    'notice_service_date',
    'service_date',
  ]);
  base.notice.expiry_date ??= getFirstValue(wizard, [
    'case_facts.notice.expiry_date',
    'notice_expiry_date',
    'expiry_date',
  ]);
  base.notice.service_method ??= getFirstValue(wizard, [
    'case_facts.notice.service_method',
    'notice_service_method',
    'service_method',
    'notice_service.service_method',
    'notice_service.method',
    'notice.service_method',
  ]);

  // Normalize service method to canonical enum values if needed
  if (base.notice.service_method && typeof base.notice.service_method === 'string') {
    const methodLower = base.notice.service_method.toLowerCase().trim();
    // Map common labels to canonical enum values
    const serviceMethodMap: Record<string, string> = {
      'hand delivery': 'hand_delivery',
      'hand-delivery': 'hand_delivery',
      'in person': 'hand_delivery',
      'in_person': 'hand_delivery',
      'personal delivery': 'hand_delivery',
      'first class post': 'first_class_post',
      'first-class post': 'first_class_post',
      'first class': 'first_class_post',
      '1st class post': 'first_class_post',
      'recorded delivery': 'recorded_delivery',
      'recorded post': 'recorded_delivery',
      'signed for': 'recorded_delivery',
      'signed_for': 'recorded_delivery',
      'special delivery': 'special_delivery',
      'special post': 'special_delivery',
      'email': 'email',
      'electronic': 'email',
      'post': 'first_class_post',
      'postal': 'first_class_post',
    };
    if (serviceMethodMap[methodLower]) {
      base.notice.service_method = serviceMethodMap[methodLower] as any;
    }
  }
  base.notice.served_by ??= getFirstValue(wizard, [
    'case_facts.notice.served_by',
    'notice_served_by',
    'served_by',
  ]);

  // Defensive fallback: ensure simple keys populate notice block even if normalization above misses them
  if (!base.notice.notice_type && typeof (wizard as any).notice_type === 'string') {
    base.notice.notice_type = (wizard as any).notice_type as any;
  }
  if (!base.notice.notice_date && typeof (wizard as any).notice_served_date === 'string') {
    base.notice.notice_date = (wizard as any).notice_served_date as any;
  }
  if (!base.notice.notice_date && typeof (wizard as any).notice_date === 'string') {
    base.notice.notice_date = (wizard as any).notice_date as any;
  }
  if (!base.notice.expiry_date && typeof (wizard as any).notice_expiry_date === 'string') {
    base.notice.expiry_date = (wizard as any).notice_expiry_date as any;
  }
  if (!base.notice.expiry_date && typeof (wizard as any).expiry_date === 'string') {
    base.notice.expiry_date = (wizard as any).expiry_date as any;
  }

  // =============================================================================
  // COURT - Claim amounts and form requirements
  // =============================================================================
  base.court.route ??= getFirstValue(wizard, [
    'money_claim_route',
    'case_facts.court.route',
    'court_route',
    'claim_type',
  ]);
  base.court.claim_amount_rent ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_rent',
    'claim_amount_rent',
    'total_arrears',
    'arrears_total',
  ]);
  base.court.claim_amount_costs ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_costs',
    'claim_amount_costs',
  ]);
  base.court.claim_amount_other ??= getFirstValue(wizard, [
    'case_facts.court.claim_amount_other',
    'claim_amount_other',
  ]);
  base.court.total_claim_amount ??= getFirstValue(wizard, [
    'case_facts.court.total_claim_amount',
    'total_claim_amount',
  ]);
  base.court.claimant_reference ??= getFirstValue(wizard, [
    'case_facts.court.claimant_reference',
    'claimant_reference',
  ]);
  base.court.court_name ??= getFirstValue(wizard, [
    'case_facts.court.court_name',
    'court_name',
    'preferred_court',
    'sheriffdom',
  ]);
  base.court.court_address ??= getFirstValue(wizard, [
    'case_facts.court.court_address',
    'court_address',
  ]);
  base.court.court_postcode ??= getFirstValue(wizard, [
    'case_facts.court.court_postcode',
    'court_postcode',
  ]);
  base.court.particulars_of_claim ??= getFirstValue(wizard, [
    'case_facts.court.particulars_of_claim',
    'particulars_of_claim',
  ]);
  base.court.n5_required ??= getWizardValue(wizard, 'n5_required');
  base.court.n119_required ??= getWizardValue(wizard, 'n119_required');
  base.court.n1_required ??= getWizardValue(wizard, 'n1_required');
  base.court.scotland_form3a_required ??= getWizardValue(
    wizard,
    'scotland_form3a_required'
  );
  base.court.scotland_form_e_required ??= getWizardValue(
    wizard,
    'scotland_form_e_required'
  );

  // =============================================================================
  // EVIDENCE - Upload tracking
  // =============================================================================
  base.evidence.tenancy_agreement_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.tenancy_agreement_uploaded',
      'evidence.tenancy_agreement_uploaded',
      'tenancy_agreement_uploaded',
    ]) ?? base.evidence.tenancy_agreement_uploaded
  );
  base.evidence.rent_schedule_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.rent_schedule_uploaded',
      'evidence.rent_schedule_uploaded',
      'rent_schedule_uploaded',
    ]) ?? base.evidence.rent_schedule_uploaded
  );
  base.evidence.correspondence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.correspondence_uploaded',
      'evidence.correspondence_uploaded',
    ]) ?? base.evidence.correspondence_uploaded
  );
  base.evidence.damage_photos_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.damage_photos_uploaded',
      'evidence.damage_photos_uploaded',
      'photos_uploaded',
    ]) ?? base.evidence.damage_photos_uploaded
  );
  base.evidence.authority_letters_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.authority_letters_uploaded',
      'evidence.authority_letters_uploaded',
      'asb_evidence_uploaded',
    ]) ?? base.evidence.authority_letters_uploaded
  );
  base.evidence.bank_statements_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.bank_statements_uploaded',
      'evidence.bank_statements_uploaded',
      'bank_statements_uploaded',
    ]) ?? base.evidence.bank_statements_uploaded
  );
  base.evidence.safety_certificates_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.safety_certificates_uploaded',
      'evidence.safety_certificates_uploaded',
      'safety_certificates_uploaded',
    ]) ?? base.evidence.safety_certificates_uploaded
  );
  base.evidence.asb_evidence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.asb_evidence_uploaded',
      'evidence.asb_evidence_uploaded',
    ]) ?? base.evidence.asb_evidence_uploaded
  );
  base.evidence.other_evidence_uploaded = Boolean(
    getFirstValue(wizard, [
      'case_facts.evidence.other_evidence_uploaded',
      'evidence.other_evidence_uploaded',
      'other_evidence_uploaded',
    ]) ?? base.evidence.other_evidence_uploaded
  );

  // Evidence description fields (describe instead of upload)
  base.evidence.tenancy_agreement_description = getFirstValue(wizard, [
    'evidence.tenancy_agreement_description',
    'tenancy_agreement_describe',
  ]);
  base.evidence.bank_statements_description = getFirstValue(wizard, [
    'evidence.bank_statements_description',
    'bank_statements_describe',
  ]);
  base.evidence.notice_service_description = getFirstValue(wizard, [
    'evidence.notice_service_description',
    'notice_service_describe',
  ]);
  base.evidence.correspondence_description = getFirstValue(wizard, [
    'evidence.correspondence_description',
    'correspondence_describe',
  ]);

  // =============================================================================
  // MONEY CLAIM EVIDENCE DESCRIPTIONS
  // =============================================================================
  base.evidence.tenancy_type = getFirstValue(wizard, [
    'evidence.tenancy_type',
    'tenancy_type',
  ]);
  base.evidence.tenancy_written_or_verbal = getFirstValue(wizard, [
    'evidence.tenancy_written_or_verbal',
    'tenancy_written_or_verbal',
  ]);
  base.evidence.rent_clause_description = getFirstValue(wizard, [
    'evidence.rent_clause_description',
    'rent_clause_description',
  ]);
  base.evidence.arrears_calculation_method = getFirstValue(wizard, [
    'evidence.arrears_calculation_method',
    'arrears_calculation_method',
  ]);
  base.evidence.arrears_ledger_available = coerceBoolean(getFirstValue(wizard, [
    'evidence.arrears_ledger_available',
    'arrears_ledger_available',
  ]));
  base.evidence.arrears_period_description = getFirstValue(wizard, [
    'evidence.arrears_period_description',
    'arrears_period_description',
  ]);
  base.evidence.bank_statements_available = coerceBoolean(getFirstValue(wizard, [
    'evidence.bank_statements_available',
    'bank_statements_available',
  ]));
  base.evidence.inventory_checkout_available = coerceBoolean(getFirstValue(wizard, [
    'evidence.inventory_checkout_available',
    'inventory_checkout_available',
  ]));
  base.evidence.damage_photos_available = coerceBoolean(getFirstValue(wizard, [
    'evidence.damage_photos_available',
    'damage_photos_available',
  ]));
  base.evidence.damage_photos_description = getFirstValue(wizard, [
    'evidence.damage_photos_description',
    'damage_photos_description',
  ]);
  base.evidence.repair_quotes_description = getFirstValue(wizard, [
    'evidence.repair_quotes_description',
    'repair_quotes_description',
  ]);
  base.evidence.before_photos_available = coerceBoolean(getFirstValue(wizard, [
    'evidence.before_photos_available',
    'before_photos_available',
  ]));
  base.evidence.correspondence_preserved = coerceBoolean(getFirstValue(wizard, [
    'evidence.correspondence_preserved',
    'correspondence_preserved',
  ]));
  const correspondenceFormat = getFirstValue(wizard, [
    'evidence.correspondence_format',
    'correspondence_format',
  ]);
  base.evidence.correspondence_format = coerceStringArray(correspondenceFormat);
  base.evidence.key_correspondence_summary = getFirstValue(wizard, [
    'evidence.key_correspondence_summary',
    'key_correspondence_summary',
  ]);
  base.evidence.money_claim_evidence_uploaded = coerceBoolean(getFirstValue(wizard, [
    'evidence.money_claim_evidence_uploaded',
    'money_claim_evidence_uploaded',
  ]));
  // Wales-specific evidence fields
  base.evidence.contract_type = getFirstValue(wizard, [
    'evidence.contract_type',
    'contract_type',
  ]);
  base.evidence.contract_written_or_verbal = getFirstValue(wizard, [
    'evidence.contract_written_or_verbal',
    'contract_written_or_verbal',
  ]);

  const missingEvidenceNotes = getFirstValue(wizard, [
    'case_facts.evidence.missing_evidence_notes',
    'evidence.missing_evidence_notes',
  ]);
  if (Array.isArray(missingEvidenceNotes)) {
    base.evidence.missing_evidence_notes = missingEvidenceNotes as string[];
  }

  const evidenceAnalysis = getFirstValue(wizard, [
    'case_facts.evidence.analysis',
    'evidence.analysis',
  ]);

  if (evidenceAnalysis && typeof evidenceAnalysis === 'object') {
    base.evidence.analysis = evidenceAnalysis as Record<string, any>;
  }

  // =============================================================================
  // SERVICE CONTACT - Service address for legal documents
  // =============================================================================
  base.service_contact.has_override ??= getFirstValue(wizard, [
    'case_facts.service_contact.has_override',
    'service_address_override',
  ]);
  base.service_contact.service_name ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_name',
    'service_contact.service_name',
    'service_name',
  ]);
  base.service_contact.service_address_line1 ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_line1',
    'service_contact.service_address_line1',
    'service_address_line1',
  ]);
  base.service_contact.service_address_line2 ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_line2',
    'service_contact.service_address_line2',
    'service_address_line2',
  ]);
  base.service_contact.service_address_county ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_address_county',
    'service_contact.service_address_county',
    'service_address_county',
  ]);
  base.service_contact.service_city ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_city',
    'service_contact.service_city',
    'service_city',
  ]);
  base.service_contact.service_postcode ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_postcode',
    'service_contact.service_postcode',
    'service_postcode',
  ]);
  base.service_contact.service_email ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_email',
    'service_contact.service_email',
    'service_email',
  ]);
  base.service_contact.service_phone ??= getFirstValue(wizard, [
    'case_facts.service_contact.service_phone',
    'service_contact.service_phone',
    'service_phone',
  ]);

  if (!base.service_contact.service_name && typeof (wizard as any)['service_contact.service_name'] === 'string') {
    base.service_contact.service_name = (wizard as any)['service_contact.service_name'];
  }
  if (!base.service_contact.service_email && typeof (wizard as any)['service_contact.service_email'] === 'string') {
    base.service_contact.service_email = (wizard as any)['service_contact.service_email'];
  }
  if (!base.service_contact.service_phone && typeof (wizard as any)['service_contact.service_phone'] === 'string') {
    base.service_contact.service_phone = (wizard as any)['service_contact.service_phone'];
  }

  // =============================================================================
  // MONEY CLAIM - Claim breakdown, interest, pre-action
  // =============================================================================
  const paymentDay = getFirstValue(wizard, [
    'money_claim_payment_day',
    'payment_day',
    'tenancy_payment_day',
    'rent_due_day',
    'case_facts.money_claim.payment_day',
  ]);
  if (paymentDay !== null && paymentDay !== undefined) {
    base.money_claim.payment_day =
      typeof paymentDay === 'string' ? Number(paymentDay) || (paymentDay as any) : (paymentDay as any);
  }
  const damageClaim = getFirstValue(wizard, [
    'damage_claim',
    'case_facts.money_claim.damage_claim',
    'claim_damages',
  ]);
  if (damageClaim !== null && damageClaim !== undefined) {
    base.money_claim.damage_claim = coerceBoolean(damageClaim);
  }

  if (!base.money_claim.damage_items.length) {
    const damageItems = getFirstValue(wizard, [
      'damage_items',
      'case_facts.money_claim.damage_items',
      'damage_items_description',
    ]);
    if (Array.isArray(damageItems)) {
      base.money_claim.damage_items = damageItems as any;
    } else if (typeof damageItems === 'string' && damageItems.trim()) {
      base.money_claim.damage_items = [{ description: damageItems }];
    }
  }

  if (!base.money_claim.other_charges.length) {
    const otherCharges = getFirstValue(wizard, [
      'other_charges',
      'case_facts.money_claim.other_charges',
    ]);
    if (Array.isArray(otherCharges)) {
      base.money_claim.other_charges = otherCharges as any;
    } else if (typeof otherCharges === 'string' && otherCharges.trim()) {
      base.money_claim.other_charges = [{ description: otherCharges }];
    }
  }

  const chargeInterest = getFirstValue(wizard, [
    'charge_interest',
    'case_facts.money_claim.charge_interest',
  ]);
  if (chargeInterest !== null && chargeInterest !== undefined) {
    base.money_claim.charge_interest = coerceBoolean(chargeInterest);
  }
  base.money_claim.interest_start_date ??= getFirstValue(wizard, [
    'interest_start_date',
    'case_facts.money_claim.interest_start_date',
  ]);
  const interestRate = getFirstValue(wizard, [
    'interest_rate',
    'case_facts.money_claim.interest_rate',
  ]);
  if (interestRate !== null && interestRate !== undefined) {
    base.money_claim.interest_rate =
      typeof interestRate === 'string' ? Number(interestRate) || null : (interestRate as any);
  }
  const solicitorCosts = getFirstValue(wizard, [
    'solicitor_costs',
    'case_facts.money_claim.solicitor_costs',
  ]);
  if (solicitorCosts !== null && solicitorCosts !== undefined) {
    base.money_claim.solicitor_costs =
      typeof solicitorCosts === 'string' ? Number(solicitorCosts) || null : (solicitorCosts as any);
  }
  base.money_claim.attempts_to_resolve ??= getFirstValue(wizard, [
    'attempts_to_resolve',
    'payment_attempts',
    'case_facts.money_claim.attempts_to_resolve',
  ]);
  const lbaSent = getFirstValue(wizard, ['lba_sent', 'case_facts.money_claim.lba_sent']);
  if (lbaSent !== null && lbaSent !== undefined) {
    base.money_claim.lba_sent = coerceBoolean(lbaSent);
  }
  base.money_claim.lba_date ??= getFirstValue(wizard, [
    'lba_date',
    'case_facts.money_claim.lba_date',
  ]);
  base.money_claim.lba_method ??= getFirstValue(wizard, [
    'lba_method',
    'case_facts.money_claim.lba_method',
  ]);
  base.money_claim.lba_response_deadline ??= getFirstValue(wizard, [
    'lba_response_deadline',
    'case_facts.money_claim.lba_response_deadline',
  ]);
  const papDocumentsSent = getFirstValue(wizard, [
    'pap_documents_sent',
    'lba_documents_sent',
    'pre_action_docs_sent',
    'case_facts.money_claim.pap_documents_sent',
  ]);
  if (papDocumentsSent !== null && papDocumentsSent !== undefined) {
    base.money_claim.pap_documents_sent = Array.isArray(papDocumentsSent)
      ? (papDocumentsSent as string[])
      : [papDocumentsSent as any];
  }
  const tenantResponded = getFirstValue(wizard, [
    'tenant_responded',
    'defendant_response',
    'case_facts.money_claim.tenant_responded',
    'pre_action_reply_received',
  ]);
  if (tenantResponded !== null && tenantResponded !== undefined) {
    base.money_claim.tenant_responded = coerceBoolean(tenantResponded);
  }
  base.money_claim.tenant_response_details ??= getFirstValue(wizard, [
    'tenant_response_details',
    'pre_action_reply_details',
    'case_facts.money_claim.tenant_response_details',
  ]);
  const lbaSecondSent = getFirstValue(wizard, [
    'lba_second_sent',
    'case_facts.money_claim.lba_second_sent',
  ]);
  if (lbaSecondSent !== null && lbaSecondSent !== undefined) {
    base.money_claim.lba_second_sent = coerceBoolean(lbaSecondSent);
  }
  base.money_claim.lba_second_date ??= getFirstValue(wizard, [
    'lba_second_date',
    'case_facts.money_claim.lba_second_date',
    'pre_action_second_date',
  ]);
  base.money_claim.lba_second_method ??= getFirstValue(wizard, [
    'lba_second_method',
    'case_facts.money_claim.lba_second_method',
    'pre_action_second_method',
  ]);
  base.money_claim.lba_second_response_deadline ??= getFirstValue(wizard, [
    'lba_second_response_deadline',
    'case_facts.money_claim.lba_second_response_deadline',
  ]);
  const preActionDeadlineConfirm = getFirstValue(wizard, [
    'pre_action_deadline_confirmation',
    'pre_action_letter_14day',
    'case_facts.money_claim.pre_action_deadline_confirmation',
  ]);
  if (preActionDeadlineConfirm !== null && preActionDeadlineConfirm !== undefined) {
    base.money_claim.pre_action_deadline_confirmation = coerceBoolean(
      preActionDeadlineConfirm
    );
  }
  base.money_claim.signatory_name ??= getFirstValue(wizard, [
    'signatory_name',
    'case_facts.money_claim.signatory_name',
  ]);
  base.money_claim.signature_date ??= getFirstValue(wizard, [
    'signature_date',
    'case_facts.money_claim.signature_date',
  ]);
  base.money_claim.sheriffdom ??= getFirstValue(wizard, [
    'sheriffdom',
    'case_facts.money_claim.sheriffdom',
  ]);
  const courtJurisdictionConfirmed = getFirstValue(wizard, [
    'court_jurisdiction_confirmed',
    'case_facts.money_claim.court_jurisdiction_confirmed',
  ]);
  if (courtJurisdictionConfirmed !== null && courtJurisdictionConfirmed !== undefined) {
    base.money_claim.court_jurisdiction_confirmed = coerceBoolean(
      courtJurisdictionConfirmed
    );
  }
  base.money_claim.lodging_method ??= getFirstValue(wizard, [
    'lodging_method',
    'case_facts.money_claim.lodging_method',
  ]);
  base.money_claim.demand_letter_date ??= getFirstValue(wizard, [
    'demand_letter_date',
    'case_facts.money_claim.demand_letter_date',
  ]);
  base.money_claim.second_demand_date ??= getFirstValue(wizard, [
    'second_demand_date',
    'case_facts.money_claim.second_demand_date',
  ]);
  base.money_claim.evidence_summary ??= getFirstValue(wizard, [
    'evidence_summary',
    'case_facts.money_claim.evidence_summary',
  ]);
  const basisOfClaim = getFirstValue(wizard, [
    'basis_of_claim',
    'case_facts.money_claim.basis_of_claim',
  ]);
  if (Array.isArray(basisOfClaim)) {
    const hasRent = basisOfClaim.includes('rent_arrears');
    const hasDamage = basisOfClaim.includes('property_damage');
    if (hasRent && hasDamage) base.money_claim.basis_of_claim = 'both' as any;
    else if (hasDamage) base.money_claim.basis_of_claim = 'damages' as any;
    else if (hasRent) base.money_claim.basis_of_claim = 'rent_arrears' as any;
  } else if (basisOfClaim !== null && basisOfClaim !== undefined) {
    if (basisOfClaim === 'property_damage') base.money_claim.basis_of_claim = 'damages' as any;
    else base.money_claim.basis_of_claim = basisOfClaim as any;
  }

  const arrearsScheduleConfirmed = getFirstValue(wizard, [
    'arrears_schedule_confirmed',
    'arrears_schedule_confirm',
    'case_facts.money_claim.arrears_schedule_confirmed',
  ]);
  if (arrearsScheduleConfirmed !== null && arrearsScheduleConfirmed !== undefined) {
    base.money_claim.arrears_schedule_confirmed = coerceBoolean(
      arrearsScheduleConfirmed
    );
  }

  const evidenceTypesAvailable = getFirstValue(wizard, [
    'evidence_types_available',
    'case_facts.money_claim.evidence_types_available',
  ]);
  if (evidenceTypesAvailable !== null && evidenceTypesAvailable !== undefined) {
    base.money_claim.evidence_types_available = Array.isArray(evidenceTypesAvailable)
      ? (evidenceTypesAvailable as string[])
      : [evidenceTypesAvailable as any];
  }

  const papDocumentsServed = getFirstValue(wizard, [
    'pap_documents_served',
    'pre_action_letter_served',
    'case_facts.money_claim.pap_documents_served',
  ]);
  if (papDocumentsServed !== null && papDocumentsServed !== undefined) {
    base.money_claim.pap_documents_served = coerceBoolean(papDocumentsServed);
  }
  base.money_claim.pap_service_method ??= getFirstValue(wizard, [
    'pap_service_method',
    'pre_action_service_method',
    'case_facts.money_claim.pap_service_method',
  ]);
  base.money_claim.pap_service_proof ??= getFirstValue(wizard, [
    'pap_service_proof',
    'pre_action_service_proof',
    'case_facts.money_claim.pap_service_proof',
  ]);

  base.money_claim.preferred_issue_route ??= getFirstValue(wizard, [
    'preferred_issue_route',
    'court_issue_route',
    'case_facts.money_claim.preferred_issue_route',
  ]);
  base.money_claim.claim_value_band ??= getFirstValue(wizard, [
    'claim_value_band',
    'case_facts.money_claim.claim_value_band',
  ]);
  const helpWithFees = getFirstValue(wizard, [
    'help_with_fees_needed',
    'case_facts.money_claim.help_with_fees_needed',
  ]);
  if (helpWithFees !== null && helpWithFees !== undefined) {
    base.money_claim.help_with_fees_needed = coerceBoolean(helpWithFees);
  }
  const enforcementPreferences = getFirstValue(wizard, [
    'enforcement_preferences',
    'case_facts.money_claim.enforcement_preferences',
  ]);
  if (enforcementPreferences !== null && enforcementPreferences !== undefined) {
    base.money_claim.enforcement_preferences = Array.isArray(enforcementPreferences)
      ? (enforcementPreferences as string[])
      : [enforcementPreferences as any];
  }
  base.money_claim.enforcement_notes ??= getFirstValue(wizard, [
    'enforcement_notes',
    'case_facts.money_claim.enforcement_notes',
  ]);

  // Additional narrative fields for richer AI drafting
  base.money_claim.other_charges_notes ??= getFirstValue(wizard, [
    'other_charges_notes',
    'case_facts.money_claim.other_charges_notes',
  ]);
  base.money_claim.other_costs_notes ??= getFirstValue(wizard, [
    'other_costs_notes',
    'case_facts.money_claim.other_costs_notes',
  ]);
  base.money_claim.other_amounts_summary ??= getFirstValue(wizard, [
    'other_amounts_summary',
    'case_facts.money_claim.other_amounts_summary',
  ]);

  // =============================================================================
  // COMPLIANCE - Gas safety, EPC, How to Rent
  // =============================================================================
  const gasSafety = getFirstValue(wizard, [
    'case_facts.compliance.gas_safety_cert_provided',
    'gas_certificate_provided', // Canonical wizard key
    'gas_safety_cert_provided',
    'gas_safety_certificate_provided',
  ]);
  if (gasSafety !== null && gasSafety !== undefined) {
    base.compliance.gas_safety_cert_provided = coerceBoolean(gasSafety);
  }

  const epcProvided = getFirstValue(wizard, [
    'case_facts.compliance.epc_provided',
    'epc_provided',
  ]);
  if (epcProvided !== null && epcProvided !== undefined) {
    base.compliance.epc_provided = coerceBoolean(epcProvided);
  }

  const howToRent = getFirstValue(wizard, [
    'case_facts.compliance.how_to_rent_given',
    'how_to_rent_provided', // Canonical wizard key
    'how_to_rent_given',
    'how_to_rent_guide_provided',
  ]);
  if (howToRent !== null && howToRent !== undefined) {
    base.compliance.how_to_rent_given = coerceBoolean(howToRent);
  }

  // Compliance dates (Phase 1 enhancements)
  base.compliance.gas_safety_cert_date = getFirstValue(wizard, [
    'compliance.gas_cert_date',
    'gas_cert_date',
  ]);
  base.compliance.gas_safety_cert_expiry = getFirstValue(wizard, [
    'compliance.gas_cert_expiry',
    'gas_cert_expiry',
  ]);
  base.compliance.epc_date = getFirstValue(wizard, [
    'compliance.epc_certificate_date',
    'epc_certificate_date',
  ]);
  base.compliance.how_to_rent_date = getFirstValue(wizard, [
    'compliance.how_to_rent_date',
    'how_to_rent_date',
  ]);
  base.compliance.prescribed_info_date = getFirstValue(wizard, [
    'compliance.prescribed_info_date',
    'prescribed_info_date',
  ]);

  // EICR (Electrical Safety)
  const eicrProvided = getFirstValue(wizard, [
    'compliance.eicr_provided',
    'eicr_provided',
    'electrical_safety_cert_provided',
  ]);
  if (eicrProvided !== null && eicrProvided !== undefined) {
    base.compliance.eicr_provided = coerceBoolean(eicrProvided);
  }
  base.compliance.eicr_date = getFirstValue(wizard, [
    'compliance.eicr_date',
    'eicr_date',
    'eicr_report_date',
  ]);
  const eicrSatisfactory = getFirstValue(wizard, [
    'compliance.eicr_satisfactory',
    'eicr_satisfactory',
  ]);
  if (eicrSatisfactory !== null && eicrSatisfactory !== undefined) {
    base.compliance.eicr_satisfactory = coerceBoolean(eicrSatisfactory);
  }

  // Recent repair complaints (retaliatory eviction protection)
  const recentRepairComplaints = getFirstValue(wizard, [
    'recent_repair_complaints',
    'repair_complaints',
    'outstanding_repairs',
    'tenant_complained',
  ]);
  if (recentRepairComplaints !== null && recentRepairComplaints !== undefined) {
    (base.compliance as any).recent_repair_complaints = coerceBoolean(recentRepairComplaints);
  }

  const noRetaliatoryNotice = getFirstValue(wizard, ['no_retaliatory_notice']);
  if (
    noRetaliatoryNotice !== null &&
    noRetaliatoryNotice !== undefined &&
    (base.compliance as any).recent_repair_complaints === undefined
  ) {
    const normalizedValue = coerceBoolean(noRetaliatoryNotice);
    if (normalizedValue !== null && normalizedValue !== undefined) {
      (base.compliance as any).recent_repair_complaints = !normalizedValue;
    }
  }

  // Keep "breaches" in sync with "other_breaches" for modules that expect either
  if (!base.issues.breaches) {
    base.issues.breaches = {
      has_breaches: base.issues.other_breaches.has_breaches,
      description: base.issues.other_breaches.description,
    };
  }

  // =============================================================================
  // PROPERTY ADDRESS CONCATENATION
  // Ensure templates receive a single concatenated property_address field
  // =============================================================================

  // Helper to recursively extract string value from nested objects
  const extractStringValue = (part: any): string => {
    if (part === null || part === undefined) return '';
    if (typeof part === 'string') return part.trim();
    if (typeof part === 'number') return String(part).trim();
    if (typeof part === 'boolean') return String(part).trim();

    // Handle objects - try common property names
    if (typeof part === 'object' && !Array.isArray(part)) {
      // Try nested value properties first
      const value = part.value ?? part.label ?? part.text ?? part.content;
      if (value !== null && value !== undefined) {
        // Recursively extract if value is also an object
        return extractStringValue(value);
      }
      // If object has no recognizable properties, try JSON.stringify
      try {
        const keys = Object.keys(part);
        if (keys.length > 0) {
          // Return first non-null value found
          for (const key of keys) {
            const extracted = extractStringValue(part[key]);
            if (extracted) return extracted;
          }
        }
      } catch (e) {
        // Fallback - skip this part
      }
    }

    return '';
  };

  if (base.property.address_line1 || base.property.address_line2 || base.property.city || base.property.postcode) {
    const addressParts = [
      base.property.address_line1,
      base.property.address_line2,
      base.property.city,
      base.property.postcode,
    ]
      .map(extractStringValue)
      .filter(Boolean); // Remove empty strings

    // Add concatenated address for templates that expect property_address
    (base as any).property_address = addressParts.join('\n');

    if (addressParts.length === 0) {
      console.warn('[Normalize] Property address parts found but all extracted as empty');
    } else {
      console.log('[Normalize] Property address concatenated:', addressParts.length, 'parts');
    }
  }

  // =============================================================================
  // TENANT/LANDLORD NAME NORMALIZATION
  // Ensure flat fields exist for templates that expect them
  // =============================================================================
  if (base.parties.tenants.length > 0 && base.parties.tenants[0]?.name) {
    (base as any).tenant_full_name = base.parties.tenants[0].name;
    console.log('[Normalize] Tenant name:', base.parties.tenants[0].name);
  }

  if (base.parties.landlord.name) {
    (base as any).landlord_full_name = base.parties.landlord.name;
    console.log('[Normalize] Landlord name:', base.parties.landlord.name);
  }

  // =============================================================================
  // OBJECT TO STRING FLATTENING (PRESERVE ASK HEAVEN FIELDS)
  // Prevents [object Object] in templates
  // =============================================================================
  Object.keys(base).forEach((key) => {
    const value = (base as any)[key];

    // If it's an object but not Date/Array, flatten it
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      // Check if this is a known nested structure (parties, property, tenancy, etc.)
      // We don't want to flatten these, only unexpected objects
      const knownStructures = [
        'parties',
        'property',
        'tenancy',
        'issues',
        'compliance',
        'money_claim',
        'court',
        'evidence',
        'eviction',
        'meta',
        'case_health',
        'notice',           // CaseFacts.notice (NoticeFacts)
        'service_contact',  // CaseFacts.service_contact (ServiceContactFacts)
      ];

      if (knownStructures.includes(key)) {
        // Skip known nested structures
        return;
      }

      console.warn(`[Normalize] Found unexpected object for key "${key}", flattening...`);

      // Special handling for Ask Heaven narrative fields
      if (
        key.includes('particulars') ||
        key.includes('narrative') ||
        key.includes('explanation') ||
        key.includes('summary') ||
        key.includes('description')
      ) {
        // Ask Heaven fields: preserve the full value if it has text content
        if (value.text && typeof value.text === 'string') {
          (base as any)[key] = value.text;
        } else if (value.value && typeof value.value === 'string') {
          (base as any)[key] = value.value;
        } else if (value.content && typeof value.content === 'string') {
          (base as any)[key] = value.content;
        } else {
          // Fallback: try to stringify meaningfully
          (base as any)[key] = JSON.stringify(value);
        }
      } else {
        // Non-narrative fields: standard flattening
        if (value.value !== undefined) {
          (base as any)[key] = value.value;
        } else if (value.label !== undefined) {
          (base as any)[key] = value.label;
        } else if (value.text !== undefined) {
          (base as any)[key] = value.text;
        } else {
          // Last resort: JSON stringify
          (base as any)[key] = JSON.stringify(value);
        }
      }
    }
  });

  console.log('[Normalize] Case facts normalization complete');

  // ---------------------------------------------------------------------------
  // CASE HEALTH - compute contradictions, missing evidence, compliance warnings
  // ---------------------------------------------------------------------------
  base.case_health = computeCaseHealth(base);

  const result = JSON.parse(JSON.stringify(base));

  if (typeof (result as any).notice === 'string') {
    try {
      (result as any).notice = JSON.parse((result as any).notice);
    } catch {
      // Leave as-is if parsing fails
    }
  }

  if (typeof (result as any).service_contact === 'string') {
    try {
      (result as any).service_contact = JSON.parse((result as any).service_contact);
    } catch {
      // Leave as-is if parsing fails
    }
  }

  return result as CaseFacts;
}

/**
 * Public helper used across APIs (checkpoint / analyze) to normalize
 * whatever we have (flat wizard facts or already-nested case facts)
 * into a full CaseFacts object with up-to-date case_health and meta hints.
 */
export function normalizeCaseFacts(
  input: WizardFacts | CaseFacts | null | undefined
): CaseFacts {
  // If nothing sensible provided, return empty skeleton
  if (!input || typeof input !== 'object') {
    return createEmptyCaseFacts();
  }

  // If it already looks like CaseFacts (nested structure),
  // just ensure case_health is present and up-to-date.
  if (
    (input as any).tenancy &&
    (input as any).property &&
    (input as any).parties
  ) {
    const existing = input as CaseFacts;
    return {
      ...existing,
      case_health: existing.case_health ?? computeCaseHealth(existing),
    };
  }

  // Otherwise treat it as flat WizardFacts and map to CaseFacts
  const wizard = input as WizardFacts;
  const base = wizardFactsToCaseFacts(wizard);

  // Try to enrich meta with jurisdiction / case id if present on flat facts
  const jurisdiction =
    (wizard as any).jurisdiction ||
    (wizard as any).case_jurisdiction ||
    wizard.__meta?.jurisdiction;

  const caseId =
    (wizard as any).case_id ||
    (wizard as any).id ||
    wizard.__meta?.case_id;

  if (jurisdiction && !base.meta.jurisdiction) {
    base.meta.jurisdiction = jurisdiction as any;
  }

  if (caseId && !base.meta.case_id) {
    base.meta.case_id = caseId as any;
  }

  // Always recompute case health on the final object
  base.case_health = computeCaseHealth(base);

  return base;
}

// =============================================================================
// GROUND DEFINITIONS (for Section 8 / England & Wales)
// =============================================================================

/**
 * Notice periods required for each Section 8 ground (in days)
 *
 * Legal basis: Housing Act 1988, Section 8(4) and Schedule 2
 *
 * 2 weeks (14 days): Grounds 3, 4, 7A, 7B, 8, 10, 11, 12, 13, 14, 14ZA, 15, 17
 * 2 months (60 days): Grounds 1, 2, 5, 6, 7, 9, 16
 * Immediate (0 days): Ground 14 (serious anti-social behaviour), Ground 14A
 *
 * NOTE: Ground 14 can be served with immediate effect in cases of serious
 * anti-social behaviour, but defaults to 14 days for standard nuisance.
 */
const GROUND_NOTICE_PERIODS: Record<number | string, number> = {
  1: 60,    // 2 months - landlord previously occupied
  2: 60,    // 2 months - mortgage lender requires possession
  3: 14,    // 2 weeks - holiday let
  4: 14,    // 2 weeks - educational institution let
  5: 60,    // 2 months - minister of religion
  6: 60,    // 2 months - demolition/reconstruction
  7: 60,    // 2 months - death of periodic tenant
  '7A': 14, // 2 weeks - abandonment (fixed term)
  '7B': 14, // 2 weeks - abandonment (periodic)
  8: 14,    // 2 weeks - serious rent arrears (8 weeks/2 months)
  9: 60,    // 2 months - suitable alternative accommodation
  10: 14,   // 2 weeks - some rent arrears
  11: 14,   // 2 weeks - persistent delay in paying rent
  12: 14,   // 2 weeks - breach of tenancy obligation
  13: 14,   // 2 weeks - deterioration of dwelling
  14: 14,   // 2 weeks (default) - nuisance/annoyance (can be immediate for serious ASB)
  '14ZA': 14, // 2 weeks - riot conviction
  '14A': 0,   // Immediate - domestic violence
  15: 14,   // 2 weeks - deterioration of furniture
  16: 60,   // 2 months - former employee
  17: 14,   // 2 weeks - false statement
};

/**
 * Calculate the required notice period based on selected grounds
 * Returns the MAXIMUM notice period required across all selected grounds
 *
 * @param selectedGrounds - Array of ground codes (e.g., ['8', '10', '11'])
 * @returns Notice period in days (defaults to 14 if no grounds specified)
 */
function calculateRequiredNoticePeriod(selectedGrounds: (string | number)[]): number {
  if (!selectedGrounds || selectedGrounds.length === 0) {
    return 14; // Default for Section 8 when no specific grounds
  }

  let maxPeriod = 0;

  for (const ground of selectedGrounds) {
    // Normalize ground code
    let groundKey: string | number = ground;
    if (typeof ground === 'string') {
      const match = ground.match(/ground[_\s-]*([0-9]+[ab]?)/i);
      if (match) {
        groundKey = match[1].toUpperCase();
      } else {
        const numMatch = ground.match(/^([0-9]+[ab]?)$/i);
        if (numMatch) {
          groundKey = numMatch[1].toUpperCase();
        }
      }
    }

    // Try numeric key first, then string key
    const numericKey = typeof groundKey === 'string' ? parseInt(groundKey, 10) : groundKey;
    const period = GROUND_NOTICE_PERIODS[numericKey] ?? GROUND_NOTICE_PERIODS[groundKey] ?? 14;

    if (period > maxPeriod) {
      maxPeriod = period;
    }
  }

  return maxPeriod;
}

// SECTION8_GROUND_DEFINITIONS is now imported from '@/lib/grounds/section8-ground-definitions'

/**
 * Build grounds array from wizard facts with proper structure for Form 3 compliance
 */
function buildGroundsArray(wizard: WizardFacts, templateData: Record<string, any>): any[] {
  const selectedGrounds = getFirstValue(wizard, [
    'case_facts.issues.section8_grounds.selected_grounds',
    'section8_grounds',
    'section8_grounds_selection',
    'selected_grounds',
  ]);

  if (!selectedGrounds || (Array.isArray(selectedGrounds) && selectedGrounds.length === 0)) {
    return [];
  }

  const groundParticulars = getWizardValue(wizard, 'ground_particulars');

  const formatCurrency = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) return null;
    return `£${num.toFixed(2)}`;
  };

  const formatMultiline = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') {
      return value.trim().replace(/\n/g, '<br>');
    }
    if (Array.isArray(value)) {
      return value.map(v => (typeof v === 'string' ? v : String(v))).join('<br>');
    }
    if (typeof value === 'object') {
      const maybeValue = (value as any).text || (value as any).summary || (value as any).details;
      if (maybeValue) return formatMultiline(maybeValue);
    }
    return String(value);
  };

  const normalizeGroundCode = (input: string | number): string | null => {
    if (typeof input === 'number') return String(input);
    if (!input) return null;
    const trimmed = input.trim();
    const explicitMatch = trimmed.match(/ground[_\s-]*([0-9]+a?)/i);
    if (explicitMatch) return explicitMatch[1].toUpperCase();
    const numericOnly = trimmed.match(/^([0-9]+a?)$/i);
    if (numericOnly) return numericOnly[1].toUpperCase();
    const looseMatch = trimmed.match(/([0-9]+a?)/i);
    return looseMatch ? looseMatch[1].toUpperCase() : null;
  };

  const pickParticularEntry = (code: string | number) => {
    if (!groundParticulars || typeof groundParticulars !== 'object' || Array.isArray(groundParticulars)) return null;
    const normalized = normalizeGroundCode(code)?.toLowerCase();
    const possibleKeys = [
      normalized ? `ground_${normalized}` : null,
      normalized,
      typeof code === 'string' ? code : null,
    ].filter(Boolean) as string[];

    for (const key of possibleKeys) {
      if ((groundParticulars as any)[key]) {
        return (groundParticulars as any)[key];
      }
    }
    return null;
  };

  const renderParticulars = (
    groundDef: Section8GroundDefinition | undefined,
    groundCode: string | number | null,
  ) => {
    const particularsEntry = pickParticularEntry(groundCode || '');
    const defaultNarrative =
      getWizardValue(wizard, 'section8_other_grounds_narrative') ||
      getWizardValue(wizard, 'section8_grounds_narrative') ||
      (typeof groundParticulars === 'string' ? groundParticulars : null);

    const facts: string[] = [];

    const arrearsAmount =
      particularsEntry?.total_amount_owed ??
      particularsEntry?.arrears_amount ??
      (groundParticulars as any)?.total_amount_owed ??
      templateData.arrears_at_notice_date ??
      templateData.total_arrears;
    const arrearsPeriod =
      particularsEntry?.period_of_arrears ??
      particularsEntry?.arrears_period ??
      (groundParticulars && typeof groundParticulars === 'object'
        ? (groundParticulars as any).period_of_arrears
        : null) ??
      (groundParticulars && typeof groundParticulars === 'object'
        ? (groundParticulars as any).arrears_period
        : null) ??
      (templateData.arrears_duration_months !== null && templateData.arrears_duration_months !== undefined
        ? `${templateData.arrears_duration_months} month period`
        : null);

    const factualSummary =
      particularsEntry?.factual_summary ||
      particularsEntry?.summary ||
      particularsEntry?.details ||
      particularsEntry?.particulars ||
      particularsEntry?.narrative ||
      defaultNarrative;

    if (arrearsAmount !== null && arrearsAmount !== undefined && groundDef && [8, 10, 11].includes(groundDef.code)) {
      const formattedAmount = formatCurrency(arrearsAmount) || arrearsAmount;
      facts.push(`<strong>Total amount owed:</strong> ${formattedAmount}`);
    }

    if (arrearsPeriod) {
      facts.push(`<strong>Period of arrears:</strong> ${arrearsPeriod}`);
    }

    if (factualSummary) {
      facts.push(`<strong>Factual summary:</strong> ${formatMultiline(factualSummary)}`);
    }

    const evidenceText =
      particularsEntry?.evidence ||
      particularsEntry?.evidence_available ||
      particularsEntry?.supporting_evidence ||
      (groundParticulars && typeof groundParticulars === 'object' ? (groundParticulars as any).evidence : null);

    const rendered = facts.filter(Boolean).join('<br>');

    return {
      particulars: rendered || formatMultiline(defaultNarrative) || '',
      evidence: evidenceText ? formatMultiline(evidenceText) : null,
    };
  };

  const groundsList = Array.isArray(selectedGrounds) ? selectedGrounds : [selectedGrounds];

  return groundsList.map((groundStr: string) => {
    const groundNumStr = normalizeGroundCode(groundStr) || '';
    const groundKey = groundNumStr === '14A' ? '14A' : parseInt(groundNumStr, 10);
    const groundDef = SECTION8_GROUND_DEFINITIONS[groundKey] || SECTION8_GROUND_DEFINITIONS[groundNumStr];

    if (!groundDef) {
      console.warn(`[buildGroundsArray] Unknown ground: ${groundStr}`);
      return {
        code: groundNumStr || groundStr,
        mandatory: false,
        title: groundStr,
        legal_basis: 'Housing Act 1988, Schedule 2',
        full_text: '',
        statutory_text: '',
        explanation: '',
        particulars: '',
        type: 'DISCRETIONARY',
        type_label: 'Discretionary',
      };
    }

    // Build explanation and particulars based on ground type
    let explanation = '';
    const particularLines: string[] = [];

    if (groundDef.code === 8) {
      const arrears = templateData.arrears_at_notice_date || templateData.total_arrears || 0;
      const rentAmount = templateData.rent_amount || 0;
      const rentFreq = templateData.rent_frequency || 'monthly';

      let threshold = 0;
      let thresholdDescription = '';
      if (rentFreq === 'weekly') {
        threshold = rentAmount * 8;
        thresholdDescription = '8 weeks';
      } else if (rentFreq === 'fortnightly') {
        threshold = rentAmount * 4;
        thresholdDescription = '8 weeks (4 fortnightly payments)';
      } else if (rentFreq === 'monthly') {
        threshold = rentAmount * 2;
        thresholdDescription = '2 months';
      } else if (rentFreq === 'quarterly') {
        threshold = rentAmount * 1;
        thresholdDescription = '1 quarter';
      }

      if (arrears >= threshold) {
        explanation = `The tenant currently owes £${arrears.toFixed(2)} in rent arrears. The rent is £${rentAmount} payable ${rentFreq}. At the date of service of this notice, the arrears amount to ${thresholdDescription} of rent or more. This satisfies the threshold for Ground 8 under Schedule 2 of the Housing Act 1988 (as amended).`;
        particularLines.push(`Rent arrears at date of notice: £${arrears.toFixed(2)}`);
        particularLines.push(`Threshold for Ground 8: £${threshold.toFixed(2)} (${thresholdDescription})`);
        particularLines.push('Ground 8 is a MANDATORY ground. If the arrears still meet the threshold at the date of the hearing, the court MUST grant possession.');
      } else {
        explanation = `WARNING: The current arrears of £${arrears.toFixed(2)} do not meet the Ground 8 threshold of ${thresholdDescription} (£${threshold.toFixed(2)}). Ground 8 cannot be relied upon unless the arrears increase before the hearing.`;
        particularLines.push(`Current arrears: £${arrears.toFixed(2)}`);
        particularLines.push(`Required threshold: £${threshold.toFixed(2)} (${thresholdDescription})`);
        particularLines.push('Ground 8 is NOT satisfied at this time.');
      }
    } else if (groundDef.code === 10 || groundDef.code === 11) {
      const arrears = templateData.total_arrears || 0;
      explanation = `The tenant owes £${arrears.toFixed(2)} in rent arrears.`;
      particularLines.push(`Rent arrears outstanding: £${arrears.toFixed(2)}`);
      particularLines.push(
        groundDef.code === 10
          ? 'Ground 10 is a DISCRETIONARY ground. The court will consider all circumstances when deciding whether to grant possession.'
          : 'Ground 11 is a DISCRETIONARY ground. The court will consider the pattern of late payments when deciding whether to grant possession.'
      );
    } else if (groundDef.code === 12) {
      explanation =
        getWizardValue(wizard, 'section8_other_grounds_narrative') ||
        getWizardValue(wizard, 'section8_grounds_narrative') ||
        'The tenant has breached one or more terms of the tenancy agreement.';
      particularLines.push(explanation);
      particularLines.push('Ground 12 is a DISCRETIONARY ground. The court will consider the nature and severity of the breach.');
    } else if (groundDef.code === 13 || groundDef.code === 15) {
      explanation =
        getWizardValue(wizard, 'section8_other_grounds_narrative') ||
        getWizardValue(wizard, 'section8_grounds_narrative') ||
        'The condition of the property has deteriorated.';
      particularLines.push(explanation);
      particularLines.push(`Ground ${groundDef.code} is a DISCRETIONARY ground. The court will assess the extent of deterioration.`);
    } else if (groundDef.code === 14 || groundNumStr === '14A') {
      explanation =
        getWizardValue(wizard, 'section8_other_grounds_narrative') ||
        getWizardValue(wizard, 'section8_grounds_narrative') ||
        'The tenant or persons at the property have caused nuisance or annoyance.';
      particularLines.push(explanation);
      particularLines.push(`Ground ${groundNumStr} is a DISCRETIONARY ground. The court will consider evidence of nuisance or anti-social behaviour.`);
    } else if (groundDef.code === 17) {
      explanation =
        getWizardValue(wizard, 'section8_other_grounds_narrative') ||
        getWizardValue(wizard, 'section8_grounds_narrative') ||
        'The tenancy was granted based on a false statement.';
      particularLines.push(explanation);
      particularLines.push('Ground 17 is a DISCRETIONARY ground. The court will consider whether the false statement was material to the grant of the tenancy.');
    } else {
      explanation =
        getWizardValue(wizard, 'section8_other_grounds_narrative') ||
        getWizardValue(wizard, 'section8_grounds_narrative') ||
        '';
    }

    const { particulars: userParticulars, evidence } = renderParticulars(groundDef, groundNumStr || groundStr);
    const combinedParticulars = [
      ...particularLines.filter(Boolean),
      userParticulars,
    ]
      .filter(Boolean)
      .map(p => formatMultiline(p) || '')
      .join('<br>');

    return {
      code: groundDef.code,
      number: String(groundDef.code),
      mandatory: groundDef.mandatory,
      title: groundDef.title,
      legal_basis: groundDef.legal_basis,
      full_text: groundDef.full_text,
      statutory_text: groundDef.full_text, // Template expects statutory_text
      explanation,
      particulars: combinedParticulars,
      evidence,
      type: groundDef.mandatory ? 'MANDATORY' : 'DISCRETIONARY',
      type_label: groundDef.mandatory ? 'Mandatory' : 'Discretionary',
      display_heading: `Ground ${groundDef.code} – ${groundDef.title}`,
    };
  });
}

// =============================================================================
// NOTICE ONLY TEMPLATE DATA MAPPER (TASK C)
// =============================================================================

/**
 * Maps wizard facts to a unified Notice Only template data object.
 *
 * This function creates ONE consistent flattened object that works for ALL
 * Notice Only templates:
 * - Section 8 Notice (England/Wales)
 * - Section 21 Notice (England/Wales)
 * - Wales Section 173 Landlord's Notice
 * - Scotland Notice to Leave
 *
 * All fields are flattened and normalized with consistent naming.
 * Jurisdiction-specific fields (e.g., contract_holder_full_name for Wales)
 * are mapped alongside standard fields (tenant_full_name).
 *
 * @param wizard - Flat wizard facts from MQS
 * @returns Flattened template data object for Notice Only PDFs
 */
export function mapNoticeOnlyFacts(wizard: WizardFacts): Record<string, any> {
  if (!wizard || typeof wizard !== 'object') {
    return {};
  }

  // Helper to extract string value recursively from objects
  const extractString = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value.trim() || null;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);

    if (typeof value === 'object' && !Array.isArray(value)) {
      const extracted = value.value ?? value.label ?? value.text ?? value.content;
      if (extracted !== null && extracted !== undefined) {
        return extractString(extracted);
      }
    }

    return null;
  };

  const templateData: Record<string, any> = {};

  // =============================================================================
  // LANDLORD DETAILS
  // =============================================================================
  templateData.landlord_full_name = extractString(
    getFirstValue(wizard, [
      'landlord_full_name',
      'landlord.name',
      'landlord_name',
      'parties.landlord.name',
      'claimant_full_name',
    ])
  );

  templateData.landlord_2_name = extractString(
    getFirstValue(wizard, [
      'landlord_2_name',
      'landlord_secondary_name',
      'landlord_co_claimant',
    ])
  );

  // Landlord address - handle both pre-formatted and separate fields
  // Scotland often provides landlord_address as a complete multi-line string
  const preConcatenatedLandlordAddress = extractString(getWizardValue(wizard, 'landlord_address'));

  // Check if we have a pre-formatted address (contains newlines) - Scotland style
  if (preConcatenatedLandlordAddress && preConcatenatedLandlordAddress.includes('\n')) {
    templateData.landlord_address = preConcatenatedLandlordAddress;
    // Extract individual components from the pre-formatted address if needed
    const addressLines = preConcatenatedLandlordAddress.split('\n').filter(Boolean);
    templateData.landlord_address_line1 = addressLines[0] || null;
    templateData.landlord_address_line2 = addressLines[1] || null;
    templateData.landlord_city = addressLines[2] || null;
    templateData.landlord_postcode = addressLines[3] || null;
  } else {
    // Build from separate fields - England/Wales style
    const landlordAddressLine1 = extractString(
      getFirstValue(wizard, [
        'landlord_address_line1',
        'landlord.address_line1',
        'landlord_address',
      ])
    );
    const landlordAddressLine2 = extractString(
      getFirstValue(wizard, ['landlord_address_line2', 'landlord.address_line2'])
    );
    const landlordCity = extractString(
      getFirstValue(wizard, [
        'landlord_address_town',
        'landlord_city',
        'landlord.city',
      ])
    );
    const landlordPostcodeRaw = extractString(
      getFirstValue(wizard, [
        'landlord_address_postcode',
        'landlord_postcode',
        'landlord.postcode',
      ])
    );
    // Normalize postcode to uppercase for display consistency
    const landlordPostcode = landlordPostcodeRaw?.toUpperCase() || null;

    // Concatenate landlord address
    const landlordAddressParts = [
      landlordAddressLine1,
      landlordAddressLine2,
      landlordCity,
      landlordPostcode,
    ].filter(Boolean);

    templateData.landlord_address = landlordAddressParts.join('\n') || null;
    templateData.landlord_address_line1 = landlordAddressLine1;
    templateData.landlord_address_line2 = landlordAddressLine2;
    templateData.landlord_city = landlordCity;
    templateData.landlord_postcode = landlordPostcode;
  }

  templateData.landlord_email = extractString(
    getFirstValue(wizard, ['landlord_email', 'landlord.email'])
  );
  templateData.landlord_phone = extractString(
    getFirstValue(wizard, ['landlord_phone', 'landlord.phone'])
  );

  // Scotland-specific
  templateData.landlord_reg_number = extractString(
    getWizardValue(wizard, 'landlord_reg_number')
  );

  // =============================================================================
  // TENANT DETAILS
  // =============================================================================
  templateData.tenant_full_name = extractString(
    getFirstValue(wizard, [
      'tenant_full_name',
      'tenant1_name',
      'contract_holder_full_name', // Wales
      'parties.tenants.0.name',
    ])
  );

  templateData.tenant_2_name = extractString(
    getFirstValue(wizard, [
      'tenant_2_name',
      'tenant2_name',
      'tenant_secondary_name',
    ])
  );

  // Wales-specific: contract_holder_full_name
  templateData.contract_holder_full_name = extractString(
    getFirstValue(wizard, [
      'contract_holder_full_name',
      'tenant_full_name', // Fallback to tenant_full_name
    ])
  );

  // =============================================================================
  // PROPERTY ADDRESS
  // =============================================================================
  const propertyAddressLine1 = extractString(
    getFirstValue(wizard, [
      'property_address_line1',
      'property.address_line1',
      'property_address',
    ])
  );
  const propertyAddressLine2 = extractString(
    getFirstValue(wizard, ['property_address_line2', 'property.address_line2'])
  );
  const propertyCity = extractString(
    getFirstValue(wizard, [
      'property_address_town',
      'property_city',
      'property.city',
    ])
  );
  const propertyPostcodeRaw = extractString(
    getFirstValue(wizard, [
      'property_address_postcode',
      'property_postcode',
      'property.postcode',
    ])
  );
  // Normalize postcode to uppercase for display consistency
  const propertyPostcode = propertyPostcodeRaw?.toUpperCase() || null;

  // Concatenate property address
  const propertyAddressParts = [
    propertyAddressLine1,
    propertyAddressLine2,
    propertyCity,
    propertyPostcode,
  ].filter(Boolean);

  templateData.property_address = propertyAddressParts.join('\n') || null;
  templateData.property_address_line1 = propertyAddressLine1;
  templateData.property_address_line2 = propertyAddressLine2;
  templateData.property_city = propertyCity;
  templateData.property_address_town = propertyCity; // Alias for templates that use property_address_town
  templateData.property_postcode = propertyPostcode;

  // =============================================================================
  // TENANCY/CONTRACT DATES
  // FIX: Added nested paths for tenancy.*, section21.* variants
  // =============================================================================
  templateData.tenancy_start_date = extractString(
    getFirstValue(wizard, [
      'tenancy_start_date',
      'contract_start_date', // Wales
      'start_date',
      // Nested tenancy.* paths
      'tenancy.start_date',
      'tenancy.tenancy_start_date',
      // Nested section21.* paths
      'section21.tenancy_start_date',
      'section21.start_date',
    ])
  );

  // Wales-specific
  templateData.contract_start_date = extractString(
    getFirstValue(wizard, [
      'contract_start_date',
      'tenancy_start_date', // Fallback
      'tenancy.start_date',
      'tenancy.contract_start_date',
    ])
  );

  // Resolve fixed_term from explicit fields or infer from tenancy_type
  // FIX: Added nested paths for tenancy.*, section21.* variants
  const explicitFixedTerm = getFirstValue(wizard, [
    'is_fixed_term',
    'fixed_term',
    'tenancy_fixed_term',
    'tenancy.fixed_term',
    'tenancy.is_fixed_term',
    'section21.fixed_term',
    'section21.is_fixed_term',
  ]);
  if (explicitFixedTerm !== null && explicitFixedTerm !== undefined) {
    templateData.fixed_term = coerceBoolean(explicitFixedTerm);
  } else {
    // Infer fixed_term from tenancy_type if not explicitly set
    const tenancyType = extractString(getFirstValue(wizard, [
      'tenancy_type',
      'tenancy.tenancy_type',
      'case_facts.tenancy.tenancy_type',
    ]));
    if (tenancyType) {
      const lowerType = tenancyType.toLowerCase();
      // Check for common fixed term indicators
      if (
        lowerType.includes('fixed term') ||
        lowerType.includes('fixed-term') ||
        lowerType === 'ast_fixed' ||
        lowerType === 'fixed_term' ||
        lowerType === 'fixed'
      ) {
        templateData.fixed_term = true;
      } else {
        templateData.fixed_term = null;
      }
    } else {
      templateData.fixed_term = null;
    }
  }

  // Also store is_fixed_term alias for templates that use it
  templateData.is_fixed_term = templateData.fixed_term;

  templateData.fixed_term_end_date = extractString(
    getFirstValue(wizard, [
      'case_facts.tenancy.end_date',
      'tenancy_end_date',
      'fixed_term_end_date',
      'tenancy.fixed_term_end_date',
      'tenancy.end_date',
      'case_facts.tenancy.fixed_term_end_date',
      // Section 21 specific nested paths
      'section21.fixed_term_end_date',
      'section21.tenancy_end_date',
      'section21.end_date',
    ])
  );

  templateData.periodic_tenancy_start = extractString(
    getWizardValue(wizard, 'periodic_tenancy_start')
  );

  // =============================================================================
  // RENT DETAILS
  // =============================================================================
  const rentAmount = getFirstValue(wizard, ['rent_amount']);
  templateData.rent_amount = rentAmount !== null ? Number(rentAmount) || null : null;

  templateData.rent_frequency = extractString(
    getFirstValue(wizard, ['rent_frequency', 'rent_period'])
  ) as any;

  // Derive rent_period_description from rent_frequency
  const rentFreq = templateData.rent_frequency?.toLowerCase();
  if (rentFreq === 'monthly') {
    templateData.rent_period_description = 'month';
  } else if (rentFreq === 'weekly') {
    templateData.rent_period_description = 'week';
  } else if (rentFreq === 'quarterly') {
    templateData.rent_period_description = 'quarter';
  } else if (rentFreq === 'annually' || rentFreq === 'yearly') {
    templateData.rent_period_description = 'year';
  } else {
    templateData.rent_period_description = rentFreq || 'month'; // default to month
  }

  const paymentDate = getFirstValue(wizard, ['payment_date', 'rent_due_day']);
  templateData.payment_date = paymentDate !== null ? Number(paymentDate) || null : null;

  templateData.next_payment_due = extractString(
    getWizardValue(wizard, 'next_payment_due')
  );

  // =============================================================================
  // NOTICE DATES - Using canonical resolvers to ensure user-entered dates are used
  // =============================================================================
  // Use resolveNoticeServiceDate to ensure we find dates stored in nested paths
  // (e.g., notice_service.notice_date from maps_to config)
  const canonicalServiceDate = resolveNoticeServiceDate(wizard);
  templateData.service_date = canonicalServiceDate;

  // notice_date should be the same as service_date for consistency
  templateData.notice_date = canonicalServiceDate;

  // Use resolveNoticeExpiryDate for expiry dates
  templateData.expiry_date = resolveNoticeExpiryDate(wizard);

  // Scotland-specific
  templateData.earliest_leaving_date = extractString(
    getWizardValue(wizard, 'earliest_leaving_date')
  );
  templateData.earliest_tribunal_date = extractString(
    getWizardValue(wizard, 'earliest_tribunal_date')
  );
  const noticePeriodDays = getWizardValue(wizard, 'notice_period_days');
  templateData.notice_period_days = noticePeriodDays !== null ? Number(noticePeriodDays) || null : null;

  // =============================================================================
  // NOTICE SERVICE - Check nested paths from maps_to
  // =============================================================================
  templateData.notice_service_method = extractString(
    getFirstValue(wizard, [
      'notice_service.service_method',  // England/Wales maps_to path
      'notice_service_method',
      'service_method',
    ])
  );
  // Also expose as service_method for template convenience
  templateData.service_method = templateData.notice_service_method;

  templateData.notice_served_by = extractString(
    getFirstValue(wizard, [
      'notice_service.served_by',  // England/Wales maps_to path
      'notice_served_by',
      'served_by',
    ])
  );

  // =============================================================================
  // SERVING CAPACITY (COMPLIANCE-CRITICAL)
  // Maps who is serving the notice to template checkbox flags
  // =============================================================================
  // Extract serving capacity from various possible paths
  // Priority: explicit serving_capacity field > served_by text field
  const rawServingCapacity = extractString(
    getFirstValue(wizard, [
      'notice_service.serving_capacity',  // England MQS maps_to path (primary)
      'serving_capacity',                  // Direct flat key
      'notice_capacity',
      'landlord_capacity',
      'notice_service.served_by',         // Fall back to served_by if capacity not explicit
      'notice_served_by',
      'served_by',
    ])
  );

  // Normalize serving capacity to canonical enum
  // Possible values: 'landlord', 'joint_landlords', 'agent'
  let servingCapacity: 'landlord' | 'joint_landlords' | 'agent' | null = null;

  if (rawServingCapacity) {
    const normalized = rawServingCapacity.toLowerCase().trim();

    // Check for agent variants
    if (
      normalized.includes('agent') ||
      normalized.includes('solicitor') ||
      normalized.includes('representative') ||
      normalized.includes('letting agent') ||
      normalized.includes('property manager')
    ) {
      servingCapacity = 'agent';
    }
    // Check for joint landlords variants
    else if (
      normalized.includes('joint landlord') ||
      normalized.includes('joint licensor') ||
      normalized.includes('both landlord') ||
      normalized.includes('co-landlord') ||
      normalized === 'joint' ||
      normalized === 'joint_landlords'
    ) {
      servingCapacity = 'joint_landlords';
    }
    // Default to landlord for various landlord variants
    else if (
      normalized.includes('landlord') ||
      normalized.includes('licensor') ||
      normalized.includes('owner') ||
      normalized === 'self' ||
      normalized === 'myself' ||
      normalized === 'i will'
    ) {
      servingCapacity = 'landlord';
    }
    // If none match but value provided, default to landlord
    else if (normalized.length > 0) {
      servingCapacity = 'landlord';
    }
  }

  // Set canonical serving_capacity
  templateData.serving_capacity = servingCapacity;

  // Generate boolean flags for template checkbox ticking
  // These are what the templates use to tick the correct checkbox
  templateData.is_landlord_serving = servingCapacity === 'landlord';
  templateData.is_joint_landlords_serving = servingCapacity === 'joint_landlords';
  templateData.is_agent_serving = servingCapacity === 'agent';

  // =============================================================================
  // DEPOSIT & COMPLIANCE
  // =============================================================================
  const depositTaken = coerceBoolean(
    getFirstValue(wizard, ['deposit_taken', 'deposit_taken_wales', 'deposit_taken_fault'])
  );
  templateData.deposit_taken = depositTaken;

  const depositProtected = coerceBoolean(
    getFirstValue(wizard, ['deposit_protected', 'deposit_protected_wales', 'deposit_protected_fault'])
  );
  templateData.deposit_protected = depositProtected;

  const depositAmount = getFirstValue(wizard, ['deposit_amount']);
  const depositAmountNum = depositAmount !== null && depositAmount !== undefined ? Number(depositAmount) || 0 : 0;

  // Only set deposit_amount if a deposit was actually taken
  if (depositTaken === false) {
    templateData.deposit_amount = 0;
    templateData.deposit_scheme = null;
    templateData.deposit_reference = null;
    templateData.deposit_protection_date = null;
  } else {
    templateData.deposit_amount = depositAmountNum;

    // Only set scheme details if deposit is protected
    if (depositProtected === true) {
      templateData.deposit_scheme = extractString(
        getFirstValue(wizard, [
          'deposit_scheme',
          'deposit_scheme_name',
          'deposit_scheme_wales_s173',
          'deposit_scheme_fault',
        ])
      );

      templateData.deposit_reference = extractString(
        getWizardValue(wizard, 'deposit_reference')
      );

      templateData.deposit_protection_date = extractString(
        getWizardValue(wizard, 'deposit_protection_date')
      );
    } else {
      templateData.deposit_scheme = null;
      templateData.deposit_reference = null;
      templateData.deposit_protection_date = null;
    }
  }

  // =============================================================================
  // SECTION 21 COMPLIANCE FIELDS (CRITICAL FOR S21 VALIDITY)
  // IMPORTANT: Wizard stores these as *_served but templates expect *_given/*_provided
  // We check ALL variants to ensure YES values are correctly mapped
  // FIX: Added nested paths for section21.*, notice_service.*, compliance.* variants
  // =============================================================================
  templateData.prescribed_info_given = coerceBoolean(
    getFirstValue(wizard, [
      'prescribed_info_given',
      'prescribed_info_served',  // Section21ComplianceSection uses this
      'prescribed_info_provided',
      // Nested section21.* paths
      'section21.prescribed_info_given',
      'section21.prescribed_info_served',
      'section21.prescribed_info_provided',
      // Nested compliance.* paths
      'compliance.prescribed_info_given',
      'compliance.prescribed_info_served',
      // Nested notice_service.* paths
      'notice_service.prescribed_info_given',
    ])
  );

  templateData.gas_certificate_provided = coerceBoolean(
    getFirstValue(wizard, [
      'gas_certificate_provided',
      'gas_safety_cert_provided',
      'gas_safety_cert_served',  // Section21ComplianceSection uses this
      'gas_cert_provided',
      'gas_cert_served',
      // Nested section21.* paths
      'section21.gas_certificate_provided',
      'section21.gas_safety_cert_provided',
      'section21.gas_safety_cert_served',
      'section21.gas_cert_provided',
      // Nested compliance.* paths
      'compliance.gas_certificate_provided',
      'compliance.gas_cert_provided',
    ])
  );

  templateData.gas_safety_cert_provided = coerceBoolean(
    getFirstValue(wizard, [
      'gas_safety_cert_provided',
      'gas_safety_cert_served',  // Section21ComplianceSection uses this
      'gas_certificate_provided',
      // Nested section21.* paths
      'section21.gas_safety_cert_provided',
      'section21.gas_safety_cert_served',
      'section21.gas_certificate_provided',
    ])
  );

  // Alias for templates that use gas_cert_provided
  templateData.gas_cert_provided = templateData.gas_certificate_provided || templateData.gas_safety_cert_provided;

  templateData.how_to_rent_provided = coerceBoolean(
    getFirstValue(wizard, [
      'how_to_rent_provided',
      'how_to_rent_given',
      'how_to_rent_served',  // Section21ComplianceSection uses this
      // Nested section21.* paths
      'section21.how_to_rent_provided',
      'section21.how_to_rent_given',
      'section21.how_to_rent_served',
      // Nested compliance.* paths
      'compliance.how_to_rent_provided',
      'compliance.how_to_rent_given',
    ])
  );

  templateData.how_to_rent_given = coerceBoolean(
    getFirstValue(wizard, [
      'how_to_rent_given',
      'how_to_rent_provided',
      'how_to_rent_served',  // Section21ComplianceSection uses this
      // Nested section21.* paths
      'section21.how_to_rent_given',
      'section21.how_to_rent_provided',
      'section21.how_to_rent_served',
      // Nested compliance.* paths
      'compliance.how_to_rent_given',
      'compliance.how_to_rent_provided',
    ])
  );

  templateData.epc_provided = coerceBoolean(
    getFirstValue(wizard, [
      'epc_provided',
      'epc_served',  // Section21ComplianceSection uses this
      // Nested section21.* paths
      'section21.epc_provided',
      'section21.epc_served',
      // Nested compliance.* paths
      'compliance.epc_provided',
      'compliance.epc_served',
    ])
  );

  templateData.epc_rating = extractString(
    getFirstValue(wizard, [
      'epc_rating',
      'section21.epc_rating',
      'compliance.epc_rating',
    ])
  );

  // =============================================================================
  // PROPERTY LICENSING (HMO/SELECTIVE)
  // FIX: Check ALL wizard path variations including property_licensing_required
  // CRITICAL: Wizard stores licensing_required as a SELECT value, NOT a boolean:
  //   - 'not_required' → licensing NOT required (false)
  //   - 'hmo_mandatory', 'hmo_additional', 'selective' → licensing IS required (true)
  // Also normalize string labels like "No licensing required" → false
  // =============================================================================
  const rawLicensingRequired = getFirstValue(wizard, [
    'hmo_license_required',
    'licensing_required',
    'property_licensing_required',  // Common wizard field name
    // Nested section21.* paths
    'section21.hmo_license_required',
    'section21.licensing_required',
    'section21.property_licensing_required',
    // Nested property.* paths
    'property.licensing_required',
    'property.hmo_license_required',
    // Nested compliance.* paths
    'compliance.hmo_license_required',
    'compliance.licensing_required',
    'compliance.property_licensing_required',
  ]);

  // Handle wizard SELECT values and string labels
  if (rawLicensingRequired !== null && rawLicensingRequired !== undefined) {
    if (typeof rawLicensingRequired === 'string') {
      const normalized = rawLicensingRequired.toLowerCase().trim();
      // 'not_required' or label variations = false (no licensing needed)
      if (normalized === 'not_required' ||
          normalized === 'no licensing required' ||
          normalized === 'not applicable' ||
          normalized === 'n/a' ||
          normalized === 'none' ||
          normalized === 'no' ||
          normalized === 'false') {
        templateData.hmo_license_required = false;
      }
      // Any other non-empty string value = true (licensing required)
      else if (normalized === 'hmo_mandatory' ||
               normalized === 'hmo_additional' ||
               normalized === 'selective' ||
               normalized === 'required' ||
               normalized === 'yes' ||
               normalized === 'true') {
        templateData.hmo_license_required = true;
      }
      // Unknown string - coerce normally
      else {
        templateData.hmo_license_required = coerceBoolean(rawLicensingRequired);
      }
    } else {
      // Boolean or other type - coerce normally
      templateData.hmo_license_required = coerceBoolean(rawLicensingRequired);
    }
  } else {
    templateData.hmo_license_required = null;
  }

  templateData.hmo_license_valid = coerceBoolean(
    getFirstValue(wizard, [
      'hmo_license_valid',
      'property_licensed',
      // Nested section21.* paths
      'section21.hmo_license_valid',
      'section21.property_licensed',
      // Nested compliance.* paths
      'compliance.hmo_license_valid',
      'compliance.property_licensed',
    ])
  );

  // Additional licensing aliases for templates
  templateData.licensing_required = templateData.hmo_license_required;
  templateData.property_licensed = templateData.hmo_license_valid;

  // =============================================================================
  // RETALIATORY EVICTION CHECK
  // FIX: Map wizard answers to template fields for retaliatory eviction status
  // CRITICAL: The wizard field is `no_retaliatory_notice` (from Section21ComplianceSection)
  // Question: "Is this notice being served more than 6 months after any repair complaint?"
  // If answer is TRUE → no retaliatory eviction concerns → COMPLIANT
  // =============================================================================

  // Check if there was a repair complaint within 6 months
  // If explicitly false → means NO complaint → set no_repair_complaint = true
  const repairComplaintWithin6Months = coerceBoolean(
    getFirstValue(wizard, [
      'repair_complaint_within_6_months',
      'section21.repair_complaint_within_6_months',
      'compliance.repair_complaint_within_6_months',
    ])
  );

  // Check for explicit "retaliatory eviction clear" confirmation
  // CRITICAL: `no_retaliatory_notice` is the PRIMARY wizard field from Section21ComplianceSection
  // The question is: "Is this notice being served more than 6 months after any repair complaint?"
  // If TRUE → means > 6 months since complaint → retaliatory eviction defense won't apply → COMPLIANT
  const retaliatoryEvictionClear = coerceBoolean(
    getFirstValue(wizard, [
      'no_retaliatory_notice',           // PRIMARY: Section21ComplianceSection wizard field
      'retaliatory_eviction_clear',
      'no_retaliatory_eviction',
      'no_repair_complaint',
      // Nested section21.* paths
      'section21.no_retaliatory_notice', // Nested variant of primary field
      'section21.retaliatory_eviction_clear',
      'section21.no_retaliatory_eviction',
      'section21.no_repair_complaint',
      // Nested compliance.* paths
      'compliance.no_retaliatory_notice',
      'compliance.retaliatory_eviction_clear',
      'compliance.no_repair_complaint',
    ])
  );

  // Check if repair complaints have been addressed
  const repairComplaintAddressed = coerceBoolean(
    getFirstValue(wizard, [
      'repair_complaint_addressed',
      'repairs_addressed',
      'section21.repair_complaint_addressed',
      'section21.repairs_addressed',
      'compliance.repair_complaint_addressed',
    ])
  );

  // Logic: if repair_complaint_within_6_months is explicitly FALSE, it means no complaint
  // If retaliatoryEvictionClear is TRUE, it means user confirmed no concerns
  if (repairComplaintWithin6Months === false || retaliatoryEvictionClear === true) {
    templateData.no_repair_complaint = true;
    templateData.retaliatory_eviction_clear = true;
  } else {
    templateData.no_repair_complaint = retaliatoryEvictionClear ?? false;
    templateData.retaliatory_eviction_clear = retaliatoryEvictionClear ?? false;
  }

  templateData.repair_complaint_addressed = repairComplaintAddressed ?? false;

  // =============================================================================
  // WALES-SPECIFIC COMPLIANCE
  // =============================================================================
  templateData.wales_contract_category = extractString(
    getWizardValue(wizard, 'wales_contract_category')
  );

  templateData.rent_smart_wales_registered = coerceBoolean(
    getWizardValue(wizard, 'rent_smart_wales_registered')
  );

  // =============================================================================
  // WALES-SPECIFIC COMPLIANCE FIELDS
  // =============================================================================
  // These are required for Wales compliance checklist templates
  templateData.rent_smart_wales_number = extractString(
    getFirstValue(wizard, ['rent_smart_wales_number', 'rsw_number', 'rsw_registration_number'])
  );

  templateData.written_statement_provided = coerceBoolean(
    getFirstValue(wizard, ['written_statement_provided', 'written_statement_given', 'occupation_contract_provided'])
  );

  templateData.written_statement_date = extractString(
    getFirstValue(wizard, ['written_statement_date', 'written_statement_provided_date', 'occupation_contract_date'])
  );

  templateData.electrical_cert_provided = coerceBoolean(
    getFirstValue(wizard, [
      'electrical_cert_provided',
      'eicr_provided',
      'eicr_certificate_provided',
      'electrical_safety_cert_provided',
      'compliance.eicr_provided',
    ])
  );

  // =============================================================================
  // WALES COMPLIANCE SCHEMA FIELDS (pre-service checklist)
  // These map directly from WizardFacts as stored by WalesComplianceSection
  // =============================================================================

  // Prescribed info - template uses prescribed_info_served, wizard may use either
  templateData.prescribed_info_served = coerceBoolean(
    getFirstValue(wizard, [
      'prescribed_info_served',
      'prescribed_info_given',
      'prescribed_info_provided',
      'compliance.prescribed_info_served',
    ])
  );

  // Gas supply and safety
  templateData.gas_supply_present = coerceBoolean(
    getFirstValue(wizard, [
      'gas_supply_present',
      'has_gas_supply',
      'gas_supply',
      'property_has_gas',
    ])
  );

  templateData.gas_safety_certificate_valid = coerceBoolean(
    getFirstValue(wizard, [
      'gas_safety_certificate_valid',
      'gas_safety_cert_valid',
      'gas_safety_cert_provided',
      'gas_cert_provided',
      'gas_safety_cert_served',
      'compliance.gas_safety_cert_provided',
    ])
  );

  // EICR - template uses eicr_valid
  templateData.eicr_valid = coerceBoolean(
    getFirstValue(wizard, [
      'eicr_valid',
      'eicr_provided',
      'eicr_certificate_valid',
      'electrical_cert_provided',
      'electrical_safety_cert_provided',
      'compliance.eicr_provided',
    ])
  );

  // EPC
  templateData.epc_available = coerceBoolean(
    getFirstValue(wizard, [
      'epc_available',
      'epc_provided',
      'epc_valid',
      'compliance.epc_provided',
    ])
  );

  // Smoke alarms - schema uses smoke_alarms_working
  templateData.smoke_alarms_working = coerceBoolean(
    getFirstValue(wizard, [
      'smoke_alarms_working',
      'smoke_alarms_installed',
      'smoke_alarms_tested',
      'smoke_alarm_installed',
      'compliance.smoke_alarms_working',
    ])
  );
  // Aliases for template compatibility
  templateData.smoke_alarms_installed = templateData.smoke_alarms_working;
  templateData.smoke_alarms_tested = templateData.smoke_alarms_working;

  // Solid fuel appliance and CO alarms
  templateData.solid_fuel_appliance_present = coerceBoolean(
    getFirstValue(wizard, [
      'solid_fuel_appliance_present',
      'has_solid_fuel_appliance',
      'co_alarm_required',
    ])
  );
  // Alias for template compatibility
  templateData.co_alarm_required = templateData.solid_fuel_appliance_present;

  templateData.co_alarms_working = coerceBoolean(
    getFirstValue(wizard, [
      'co_alarms_working',
      'co_alarm_installed',
      'co_alarm_working',
      'co_detector_installed',
      'compliance.co_alarms_working',
    ])
  );
  // Alias for template compatibility
  templateData.co_alarm_installed = templateData.co_alarms_working;

  // Fitness for habitation
  templateData.property_fit_for_habitation = coerceBoolean(
    getFirstValue(wizard, [
      'property_fit_for_habitation',
      'property_fitness_confirmed',
      'dwelling_fit_for_habitation',
      'fitness_for_habitation',
    ])
  );

  // Eviction safeguards
  templateData.retaliatory_eviction_complaint = coerceBoolean(
    getFirstValue(wizard, [
      'retaliatory_eviction_complaint',
      'repair_complaint_within_6_months',
      'recent_repair_complaint',
    ])
  );

  templateData.local_authority_investigation = coerceBoolean(
    getFirstValue(wizard, [
      'local_authority_investigation',
      'la_investigation_ongoing',
      'council_investigation',
    ])
  );

  // Wales fault grounds and evidence
  const walesFaultGrounds = getWizardValue(wizard, 'wales_fault_grounds');
  if (Array.isArray(walesFaultGrounds)) {
    templateData.wales_fault_grounds = walesFaultGrounds;
    // Build display string for template
    if (walesFaultGrounds.length > 0) {
      templateData.selected_grounds_display = walesFaultGrounds
        .map((g: string) => {
          // Convert ground value to human-readable label
          const labels: Record<string, string> = {
            'rent_arrears_serious': 'Section 157 - Serious Rent Arrears',
            'rent_arrears_other': 'Section 159 - Rent Arrears (Other)',
            'breach_of_contract': 'Section 159 - Breach of Occupation Contract',
            'anti_social_behaviour': 'Section 161 - Anti-Social Behaviour',
            'domestic_abuse': 'Section 159 - Domestic Abuse Perpetrator',
            'false_statement': 'Section 159 - False Statement',
            'estate_management': 'Section 160 - Estate Management',
          };
          return labels[g] || g;
        })
        .join(', ');
    }
  } else if (walesFaultGrounds && typeof walesFaultGrounds === 'string') {
    templateData.wales_fault_grounds = [walesFaultGrounds];
    templateData.selected_grounds_display = walesFaultGrounds;
  }

  templateData.evidence_exists = coerceBoolean(
    getFirstValue(wizard, [
      'evidence_exists',
      'evidence_available',
      'has_evidence',
      'evidence_confirmed',
    ])
  );

  // User declaration
  templateData.user_declaration = coerceBoolean(
    getFirstValue(wizard, [
      'user_declaration',
      'declaration_confirmed',
      'compliance_declaration',
    ])
  );

  // =============================================================================
  // ROUTE & GROUNDS
  // =============================================================================
  templateData.selected_notice_route = extractString(
    getFirstValue(wizard, ['selected_notice_route', 'eviction_route', 'route_intent'])
  );

  // Preserve raw particulars map for downstream templates
  templateData.ground_particulars = getWizardValue(wizard, 'ground_particulars');

  // Section 8 grounds
  const section8Grounds = getWizardValue(wizard, 'section8_grounds');
  if (Array.isArray(section8Grounds)) {
    templateData.section8_grounds = section8Grounds;
  } else if (section8Grounds && typeof section8Grounds === 'string') {
    templateData.section8_grounds = [section8Grounds];
  }

  // Wales fault-based section
  templateData.wales_fault_based_section = extractString(
    getWizardValue(wizard, 'wales_fault_based_section')
  );

  // =============================================================================
  // ARREARS DATA
  // =============================================================================
  const sharedArrearsAmount = extractSharedArrearsAmount(wizard);
  const totalArrearsRaw = getFirstValue(wizard, ['total_arrears', 'rent_arrears_amount']);
  const parsedTotalArrears = parseCurrencyAmount(totalArrearsRaw);
  const normalizedTotalArrears = parsedTotalArrears ?? sharedArrearsAmount;
  templateData.total_arrears = normalizedTotalArrears !== null ? normalizedTotalArrears : null;

  const arrearsAtNoticeDate = getWizardValue(wizard, 'arrears_at_notice_date');
  const parsedArrearsAtNotice = parseCurrencyAmount(arrearsAtNoticeDate);
  templateData.arrears_at_notice_date =
    parsedArrearsAtNotice ?? normalizedTotalArrears ?? null;

  const arrearsDurationMonths = getWizardValue(wizard, 'arrears_duration_months');
  templateData.arrears_duration_months = arrearsDurationMonths !== null ? Number(arrearsDurationMonths) || null : null;

  templateData.last_payment_date = extractString(
    getWizardValue(wizard, 'last_payment_date')
  );

  const lastPaymentAmount = getWizardValue(wizard, 'last_payment_amount');
  templateData.last_payment_amount = lastPaymentAmount !== null ? Number(lastPaymentAmount) || null : null;

  // =============================================================================
  // ASB & BREACH DETAILS
  // =============================================================================
  templateData.asb_description = extractString(
    getFirstValue(wizard, ['asb_description', 'section8_other_grounds_narrative'])
  );

  templateData.breach_description = extractString(
    getFirstValue(wizard, ['breach_description', 'breach_details', 'section8_other_grounds_narrative'])
  );

  templateData.section8_grounds_narrative = extractString(
    getWizardValue(wizard, 'section8_other_grounds_narrative')
  );

  // =============================================================================
  // HELP INFORMATION
  // =============================================================================
  templateData.council_phone = extractString(
    getWizardValue(wizard, 'council_phone')
  );

  // =============================================================================
  // METADATA
  // =============================================================================
  templateData.jurisdiction = extractString(
    getFirstValue(wizard, ['jurisdiction', '__meta.jurisdiction'])
  );

  templateData.product = extractString(
    getFirstValue(wizard, ['product', '__meta.product'])
  );

  // =============================================================================
  // GROUNDS ARRAY (for Section 8 and Scotland)
  // =============================================================================
  templateData.grounds = buildGroundsArray(wizard, templateData);

  // =============================================================================
  // DATES: Ensure notice_date, service_date, earliest_possession_date are always set
  // IMPORTANT: Only default to today if user has not entered a service date.
  // The canonical resolvers above have already checked all possible paths.
  // =============================================================================
  if (!templateData.notice_date && !templateData.service_date) {
    // No user-entered date found - default to today as a fallback
    // This ensures templates always have a date to work with
    const todayISO = new Date().toISOString().split('T')[0];
    templateData.notice_date = todayISO;
    templateData.service_date = todayISO;
  }

  // =============================================================================
  // SECTION 21 EXPIRY DATE CALCULATION
  // =============================================================================
  // For Section 21 (no-fault eviction), we use the dedicated calculator which
  // implements: 2-month minimum notice, 4-month bar, fixed term constraints,
  // break clause handling, and rent period alignment for periodic tenancies.
  // This is different from Section 8 which uses ground-based notice periods.
  // =============================================================================
  const isSection21Route = templateData.selected_notice_route === 'section_21';

  if (isSection21Route && !templateData.expiry_date && templateData.service_date && templateData.tenancy_start_date) {
    try {
      const s21Params = {
        service_date: templateData.service_date,
        tenancy_start_date: templateData.tenancy_start_date,
        fixed_term: templateData.fixed_term === true,
        fixed_term_end_date: templateData.fixed_term_end_date || undefined,
        has_break_clause: templateData.has_break_clause === true,
        break_clause_date: templateData.break_clause_date || undefined,
        rent_period: (templateData.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly',
        periodic_tenancy_start: templateData.periodic_tenancy_start || undefined,
      };

      const s21ExpiryResult = calculateSection21ExpiryDate(s21Params);

      // Set the calculated expiry date
      templateData.expiry_date = s21ExpiryResult.earliest_valid_date;
      templateData.earliest_possession_date = s21ExpiryResult.earliest_valid_date;
      templateData.notice_period_days = s21ExpiryResult.notice_period_days;
      templateData.notice_period_months = 2; // S21 always 2 months minimum
      templateData.notice_period_description = '2 months';
      templateData.s21_expiry_explanation = s21ExpiryResult.explanation;
      templateData.s21_expiry_warnings = s21ExpiryResult.warnings;

      console.log(`[mapNoticeOnlyFacts] Section 21 expiry calculated: ${s21ExpiryResult.earliest_valid_date} (${s21ExpiryResult.notice_period_days} days)`);
      console.log(`[mapNoticeOnlyFacts] Section 21 explanation: ${s21ExpiryResult.explanation}`);
    } catch (error) {
      // Log but don't fail - allow fallback to manual entry or default
      console.warn('[mapNoticeOnlyFacts] Section 21 expiry calculation failed:', error);
    }
  }

  // Calculate earliest_possession_date if not provided (SECTION 8 FALLBACK)
  // IMPORTANT: Notice period depends on selected grounds!
  // Most grounds require 2 weeks (14 days); some require 2 months (60 days)
  // NOTE: This block only runs if Section 21 calculation above didn't set earliest_possession_date
  if (!templateData.earliest_possession_date && templateData.service_date) {
    // Get selected grounds to calculate required notice period
    const selectedGrounds = getFirstValue(wizard, [
      'case_facts.issues.section8_grounds.selected_grounds',
      'section8_grounds',
      'section8_grounds_selection',
      'selected_grounds',
    ]);

    const groundsList = Array.isArray(selectedGrounds) ? selectedGrounds : (selectedGrounds ? [selectedGrounds] : []);

    // Calculate notice period based on grounds (use max of all selected grounds)
    const calculatedNoticePeriod = calculateRequiredNoticePeriod(groundsList);

    // Use explicitly provided notice_period_days if available, otherwise use calculated
    const noticePeriodDays = templateData.notice_period_days || calculatedNoticePeriod;

    // Store the calculated notice period for templates and validation
    templateData.notice_period_days = noticePeriodDays;
    templateData.notice_period_weeks = Math.ceil(noticePeriodDays / 7);
    templateData.notice_period_months = noticePeriodDays >= 60 ? 2 : 0;
    templateData.notice_period_description = noticePeriodDays >= 60 ? '2 months' : '2 weeks';

    const serviceDate = new Date(templateData.service_date);
    const earliestDate = new Date(serviceDate.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);
    templateData.earliest_possession_date = earliestDate.toISOString().split('T')[0];

    console.log(`[mapNoticeOnlyFacts] Notice period calculated: ${noticePeriodDays} days (${templateData.notice_period_description}) based on grounds: ${groundsList.join(', ')}`);
  }

  // =============================================================================
  // ADD NESTED OBJECTS FOR TEMPLATE COMPATIBILITY
  // =============================================================================
  // Templates expect nested property object
  templateData.property = {
    address_line1: propertyAddressLine1,
    address_line2: propertyAddressLine2,
    address_town: propertyCity,
    city: propertyCity,
    postcode: propertyPostcode,
    address: templateData.property_address,
    // full_address alias for Wales compliance_checklist.hbs
    full_address: templateData.property_address,
  };

  // Templates expect nested landlord object (Wales compliance checklist uses landlord.full_name)
  templateData.landlord = {
    full_name: templateData.landlord_full_name,
    name_2: templateData.landlord_2_name,
    address: templateData.landlord_address,
    phone: templateData.landlord_phone,
    email: templateData.landlord_email,
  };

  // Templates expect nested tenant object
  templateData.tenant = {
    full_name: templateData.tenant_full_name,
    name_2: templateData.tenant_2_name,
  };

  // Templates expect nested tenancy object
  templateData.tenancy = {
    start_date: templateData.tenancy_start_date,
    end_date: templateData.fixed_term_end_date,
  };

  // Templates expect nested deposit object
  templateData.deposit = {
    taken: templateData.deposit_taken,
    protected: templateData.deposit_protected,
    amount: templateData.deposit_amount,
    scheme: templateData.deposit_scheme,
    scheme_name: templateData.deposit_scheme,
    reference: templateData.deposit_reference,
    protection_date: templateData.deposit_protection_date,
    prescribed_info_given: templateData.prescribed_info_given,
  };

  // Templates expect nested compliance object
  templateData.compliance = {
    // Common compliance fields
    gas_cert_provided: templateData.gas_certificate_provided || templateData.gas_safety_cert_provided,
    gas_cert_expiry: null, // Can be added if we have this data
    epc_provided: templateData.epc_provided,
    epc_rating: templateData.epc_rating,
    how_to_rent_given: templateData.how_to_rent_given || templateData.how_to_rent_provided,
    hmo_license_required: templateData.hmo_license_required,
    hmo_license_valid: templateData.hmo_license_valid,
    // Wales-specific compliance fields (Renting Homes (Wales) Act 2016)
    rent_smart_wales_registered: templateData.rent_smart_wales_registered,
    rent_smart_wales_number: templateData.rent_smart_wales_number,
    written_statement_provided: templateData.written_statement_provided,
    written_statement_date: templateData.written_statement_date,
    electrical_cert_provided: templateData.electrical_cert_provided,
  };

  // Templates expect nested notice object (for Wales compliance_checklist.hbs route conditionals)
  templateData.notice = {
    route: templateData.selected_notice_route,
    date: templateData.notice_date,
    expiry_date: templateData.notice_expiry_date || templateData.earliest_possession_date,
  };

  // Templates expect notice_service_date and notice_expiry_date (in addition to service_date and expiry_date)
  templateData.notice_service_date = templateData.service_date || templateData.notice_date;
  templateData.notice_expiry_date = templateData.expiry_date || templateData.earliest_possession_date;

  // Additional date aliases for template compatibility (COMPLIANCE-CRITICAL)
  // Templates may use different variable names for the same date
  templateData.intended_service_date = templateData.service_date || templateData.notice_date;
  templateData.date_of_service = templateData.service_date || templateData.notice_date;
  templateData.served_on = templateData.service_date || templateData.notice_date;

  // =============================================================================
  // FORMATTED DATES FOR PDF TEMPLATES (UK Legal Format: "15 January 2026")
  // =============================================================================
  // Service Instructions and Checklist templates expect *_formatted fields
  templateData.service_date_formatted = formatUkLegalDate(templateData.service_date);
  templateData.notice_date_formatted = formatUkLegalDate(templateData.notice_date);
  templateData.earliest_possession_date_formatted = formatUkLegalDate(templateData.earliest_possession_date);
  templateData.tenancy_start_date_formatted = formatUkLegalDate(templateData.tenancy_start_date);
  templateData.notice_expiry_date_formatted = formatUkLegalDate(templateData.notice_expiry_date || templateData.earliest_possession_date);
  templateData.fixed_term_end_date_formatted = formatUkLegalDate(templateData.fixed_term_end_date);

  // =============================================================================
  // SECTION 21 SPECIFIC DATE ALIASES
  // =============================================================================
  // S21 Service Instructions and Validity Checklist templates use display_possession_date_formatted
  // This is the "possession date" that appears in the notice and tells tenant when to leave
  // For S21 this is typically notice_expiry_date or earliest_possession_date
  templateData.display_possession_date_formatted =
    templateData.notice_expiry_date_formatted ||
    templateData.earliest_possession_date_formatted ||
    null;

  // Also provide raw display_possession_date for templates that use format_date helper
  templateData.display_possession_date =
    templateData.notice_expiry_date ||
    templateData.earliest_possession_date ||
    null;

  // =============================================================================
  // GROUND DESCRIPTIONS FOR CHECKLISTS
  // =============================================================================
  // Checklist template expects ground_descriptions as a readable string
  templateData.ground_descriptions = buildGroundDescriptions(templateData.grounds);
  // Also provide has_mandatory_ground flag for conditional rendering
  templateData.has_mandatory_ground = Array.isArray(templateData.grounds) && templateData.grounds.some((g: any) => g.mandatory);

  // Templates expect metadata.generated_at for generation timestamp
  const now = new Date();

  // Convert jurisdiction code to display name
  const getJurisdictionDisplay = (jurisdiction: string | null): string => {
    if (!jurisdiction) return '';
    const jur = jurisdiction.toLowerCase().trim();
    if (jur === 'england' || jur === 'eng') return 'England';
    if (jur === 'wales' || jur === 'cym') return 'Wales';
    if (jur === 'scotland' || jur === 'sco') return 'Scotland';
    if (jur === 'northern-ireland' || jur === 'ni') return 'Northern Ireland';
    // No aliasing: all runtime jurisdictions must be canonical
    return jurisdiction;
  };

  templateData.jurisdiction_display = getJurisdictionDisplay(templateData.jurisdiction);

  templateData.metadata = {
    generated_at: now.toISOString(),
    generated_date: now.toISOString().split('T')[0],
    jurisdiction: templateData.jurisdiction,
    jurisdiction_display: templateData.jurisdiction_display,
    product: templateData.product,
  };

  // Also provide flat generation fields for backward compatibility
  templateData.generation_timestamp = now.toISOString();
  templateData.generation_date = now.toISOString().split('T')[0];
  // Templates also use generated_date (without underscore prefix) - add as alias
  templateData.generated_date = formatUkLegalDate(templateData.generation_date);

  console.log('[mapNoticeOnlyFacts] Mapped Notice Only template data');
  console.log('[mapNoticeOnlyFacts] Landlord:', templateData.landlord_full_name);
  console.log('[mapNoticeOnlyFacts] Landlord address:', templateData.landlord_address ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Tenant:', templateData.tenant_full_name);
  console.log('[mapNoticeOnlyFacts] Property address:', templateData.property_address ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Property object:', templateData.property ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Tenant object:', templateData.tenant ? 'SET' : 'MISSING');
  console.log('[mapNoticeOnlyFacts] Grounds:', templateData.grounds.length);
  console.log('[mapNoticeOnlyFacts] Dates - notice:', templateData.notice_date, 'service:', templateData.service_date, 'earliest:', templateData.earliest_possession_date);
  console.log('[mapNoticeOnlyFacts] Deposit - amount:', templateData.deposit_amount, 'protected:', templateData.deposit_protected, 'scheme:', templateData.deposit_scheme);
  console.log('[mapNoticeOnlyFacts] Serving capacity:', templateData.serving_capacity, '- landlord:', templateData.is_landlord_serving, 'joint:', templateData.is_joint_landlords_serving, 'agent:', templateData.is_agent_serving);

  // PACK DOCUMENT DEBUG - Log what pack templates will receive
  console.log('[mapNoticeOnlyFacts] === PACK DOCUMENT DATA ===');
  console.log('[mapNoticeOnlyFacts] property.address_line1:', templateData.property?.address_line1);
  console.log('[mapNoticeOnlyFacts] property.address_town:', templateData.property?.address_town);
  console.log('[mapNoticeOnlyFacts] property.postcode:', templateData.property?.postcode);
  console.log('[mapNoticeOnlyFacts] tenant.full_name:', templateData.tenant?.full_name);
  console.log('[mapNoticeOnlyFacts] tenancy.start_date:', templateData.tenancy?.start_date);
  console.log('[mapNoticeOnlyFacts] notice_service_date:', templateData.notice_service_date);
  console.log('[mapNoticeOnlyFacts] notice_expiry_date:', templateData.notice_expiry_date);
  console.log('[mapNoticeOnlyFacts] jurisdiction_display:', templateData.jurisdiction_display);
  // Formatted date fields (for Service Instructions and Checklist PDFs)
  console.log('[mapNoticeOnlyFacts] service_date_formatted:', templateData.service_date_formatted);
  console.log('[mapNoticeOnlyFacts] earliest_possession_date_formatted:', templateData.earliest_possession_date_formatted);
  console.log('[mapNoticeOnlyFacts] tenancy_start_date_formatted:', templateData.tenancy_start_date_formatted);
  console.log('[mapNoticeOnlyFacts] ground_descriptions:', templateData.ground_descriptions);
  console.log('[mapNoticeOnlyFacts] has_mandatory_ground:', templateData.has_mandatory_ground);
  console.log('[mapNoticeOnlyFacts] ===========================');

  return templateData;
}
