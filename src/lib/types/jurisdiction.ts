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

    // Default to England (safest assumption for Section 21 compatibility)
    console.warn(
      `[MIGRATION] Converting legacy jurisdiction "${jurisdiction}" to "england". ` +
      `To target Wales, use jurisdiction="wales" explicitly.`
    );
    return 'england';
  }

  // Unrecognized value
  console.error(`[JURISDICTION] Invalid jurisdiction value: "${jurisdiction}"`);
  return null;
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
