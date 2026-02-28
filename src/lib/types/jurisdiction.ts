/**
 * Canonical Jurisdiction Types
 *
 * IMPORTANT: These are the ONLY valid jurisdiction values in the system.
 * - england: England (Housing Act 1988, Section 21/8)
 * - wales: Wales (Renting Homes (Wales) Act 2016, Section 173/fault-based)
 * - scotland: Scotland (Private Housing (Tenancies) (Scotland) Act 2016)
 * - northern-ireland: Northern Ireland (limited support - tenancy agreements only)
 *
 * DO NOT use "england-wales" anywhere - it has been deprecated and removed.
 */

/**
 * Canonical jurisdiction values - the single source of truth
 */
export type CanonicalJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

/**
 * Legacy jurisdiction values (DEPRECATED - for migration only)
 */
export type LegacyJurisdiction = 'england-wales' | 'england & wales';

/**
 * Combined type for backward compatibility during migration
 */
export type AnyJurisdiction = CanonicalJurisdiction | LegacyJurisdiction;

/**
 * Normalize a raw jurisdiction value to the canonical key.
 * - FAIL CLOSED: Legacy "england-wales" returns undefined (caller must handle)
 * - Returns undefined for invalid or missing values
 */
export function normalizeJurisdiction(
  raw: string | null | undefined
): CanonicalJurisdiction | undefined {
  if (!raw || typeof raw !== 'string') return undefined;

  const normalized = raw.toLowerCase().trim();

  if (normalized === 'england' || normalized === 'wales' || normalized === 'scotland') {
    return normalized as CanonicalJurisdiction;
  }

  if (normalized === 'northern-ireland') return 'northern-ireland';

  // FAIL CLOSED: Legacy england-wales requires migration via migrateToCanonicalJurisdiction with property_location
  if (
    normalized === 'england-wales' ||
    normalized === 'england & wales' ||
    normalized === 'england and wales'
  ) {
    console.error(
      `[JURISDICTION] Legacy jurisdiction "${raw}" detected. Use migrateToCanonicalJurisdiction with property_location.`
    );
    return undefined;
  }

  return undefined;
}

/**
 * Render a jurisdiction key for template selection.
 * Only allows individual canonical countries (no combined keys).
 */
export function renderingJurisdictionKey(
  jurisdiction: Exclude<CanonicalJurisdiction, 'northern-ireland'>
): 'england' | 'wales' | 'scotland' {
  return jurisdiction;
}

/**
 * Migrate legacy jurisdiction to canonical value
 * If england-wales is provided without property_location context, defaults to 'england'
 */
export function migrateToCanonicalJurisdiction(
  jurisdiction: string | null | undefined,
  propertyLocation?: 'england' | 'wales' | null
): CanonicalJurisdiction | null {
  if (!jurisdiction) return null;

  const normalized = jurisdiction.toLowerCase().trim();

  // Already canonical
  if (
    normalized === 'england' ||
    normalized === 'wales' ||
    normalized === 'scotland' ||
    normalized === 'northern-ireland'
  ) {
    return normalized as CanonicalJurisdiction;
  }

  // Legacy values - migrate to canonical
  if (normalized === 'england-wales' || normalized === 'england & wales' || normalized === 'england and wales') {
    // If property_location is known, use it
    if (propertyLocation === 'wales') return 'wales';
    if (propertyLocation === 'england') return 'england';

    // FAIL CLOSED: Cannot resolve without property location
    // Do NOT default to england - this could apply wrong legal framework
    const errorMessage =
      `[MIGRATION] Cannot migrate legacy jurisdiction "${jurisdiction}" without property_location hint. ` +
      `Legacy england-wales cases must provide explicit property_location.`;

    console.error(errorMessage);

    // Development-only: Throw error to catch bugs early
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.error(
        `⚠️  GUARDRAIL VIOLATION: Attempted to use legacy "england-wales" jurisdiction without property_location. ` +
        `This will fail in production. Add property_location to your request.`
      );
    }

    return null;
  }

  // Unrecognized value
  console.error(`[JURISDICTION] Invalid jurisdiction value: "${jurisdiction}"`);
  return null;
}

/**
 * Derive a canonical jurisdiction using any available hints from stored facts.
 *
 * - Accepts legacy inputs ("england-wales", "england & wales", etc.) but
 *   always returns a canonical key.
 * - Prefers explicit property location hints when present (wizard facts or
 *   nested case facts may expose `property_location` or `property.country`).
 */
export function deriveCanonicalJurisdiction(
  jurisdiction: string | null | undefined,
  facts?: Record<string, any> | null
): CanonicalJurisdiction | null {
  const propertyLocation =
    (facts as any)?.property_location ||
    (facts as any)?.property?.country ||
    (facts as any)?.property?.jurisdiction ||
    null;

  return migrateToCanonicalJurisdiction(
    jurisdiction,
    propertyLocation === 'wales' || propertyLocation === 'england'
      ? propertyLocation
      : null,
  );
}

/**
 * Get human-readable jurisdiction name
 */
export function getJurisdictionName(jurisdiction: CanonicalJurisdiction | null): string {
  switch (jurisdiction) {
    case 'england':
      return 'England';
    case 'wales':
      return 'Wales';
    case 'scotland':
      return 'Scotland';
    case 'northern-ireland':
      return 'Northern Ireland';
    default:
      return 'Unknown';
  }
}

/**
 * Get legal framework description
 */
export function getLegalFramework(jurisdiction: CanonicalJurisdiction): string {
  switch (jurisdiction) {
    case 'england':
      return 'Housing Act 1988';
    case 'wales':
      return 'Renting Homes (Wales) Act 2016';
    case 'scotland':
      return 'Private Housing (Tenancies) (Scotland) Act 2016';
    case 'northern-ireland':
      return 'Private Tenancies (Northern Ireland) Order 2006';
  }
}

/**
 * Check if Section 21 (no-fault eviction) is allowed
 * Only valid in England (Wales abolished it via Renting Homes Act 2016)
 */
export function isSection21Allowed(jurisdiction: CanonicalJurisdiction): boolean {
  return jurisdiction === 'england';
}

/**
 * Check if a product is supported for this jurisdiction
 */
export function isProductSupported(
  jurisdiction: CanonicalJurisdiction,
  product: 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement'
): boolean {
  // Northern Ireland only supports tenancy agreements (V1)
  if (jurisdiction === 'northern-ireland') {
    return product === 'tenancy_agreement';
  }

  // All other products supported in England, Wales, Scotland
  return true;
}

/**
 * Get template base path for jurisdiction
 */
export function getTemplateBasePath(jurisdiction: CanonicalJurisdiction): string {
  return `config/jurisdictions/uk/${jurisdiction}/templates`;
}

/**
 * Validate jurisdiction for notice route
 * Section 21 is England-only
 */
export function validateNoticeRoute(
  jurisdiction: CanonicalJurisdiction,
  noticeRoute: string
): { valid: boolean; error?: string } {
  if (noticeRoute === 'section_21' && jurisdiction !== 'england') {
    return {
      valid: false,
      error: `Section 21 (no-fault eviction) is only available in England. ${
        jurisdiction === 'wales'
          ? 'Wales uses Section 173 notices under the Renting Homes (Wales) Act 2016.'
          : jurisdiction === 'scotland'
          ? 'Scotland uses Notice to Leave under the Private Housing (Tenancies) (Scotland) Act 2016.'
          : 'This route is not available in Northern Ireland.'
      }`,
    };
  }

  return { valid: true };
}
