/**
 * Route Normalization Helper
 *
 * Ensures canonical route values are used throughout the system.
 * Handles legacy human-readable route labels and normalizes to decision engine format.
 *
 * CANONICAL VALUES:
 * - England & Wales: 'section_8', 'section_21'
 * - Scotland: 'notice_to_leave'
 */

export type CanonicalRoute = 'section_8' | 'section_21' | 'notice_to_leave';

/**
 * Normalize a single route value to canonical format
 */
export function normalizeRoute(value: string | null | undefined): CanonicalRoute | null {
  if (!value || typeof value !== 'string') return null;

  const normalized = value.toLowerCase().trim();

  // Already canonical
  if (normalized === 'section_8') return 'section_8';
  if (normalized === 'section_21') return 'section_21';
  if (normalized === 'notice_to_leave') return 'notice_to_leave';

  // Legacy human-readable labels from old YAML (before canonical values)
  if (normalized.includes('section 8') || normalized.includes('section8')) {
    return 'section_8';
  }

  if (normalized.includes('section 21') || normalized.includes('section21')) {
    return 'section_21';
  }

  if (normalized.includes('notice to leave') || normalized.includes('ntl')) {
    return 'notice_to_leave';
  }

  // Unknown value - log warning and return null
  console.warn(`Unknown route value: "${value}" - returning null`);
  return null;
}

/**
 * Normalize an array of route values (for multi-select route intent)
 */
export function normalizeRoutes(values: unknown): CanonicalRoute[] {
  if (!Array.isArray(values)) {
    // Single value - wrap in array
    const normalized = normalizeRoute(values as string);
    return normalized ? [normalized] : [];
  }

  return values
    .map((v) => normalizeRoute(typeof v === 'string' ? v : String(v)))
    .filter((r): r is CanonicalRoute => r !== null);
}

/**
 * Get the primary route from a route intent array
 * Prioritizes section_8 if both are selected (landlord likely wants fault-based)
 */
export function getPrimaryRoute(routes: CanonicalRoute[]): CanonicalRoute | null {
  if (routes.length === 0) return null;
  if (routes.length === 1) return routes[0];

  // If both section_8 and section_21, prefer section_8 (fault-based is usually primary)
  if (routes.includes('section_8')) return 'section_8';

  return routes[0];
}

/**
 * Map canonical route to document type for generator
 */
export function routeToDocumentType(route: CanonicalRoute | null): string | null {
  if (!route) return null;

  const mapping: Record<CanonicalRoute, string> = {
    section_8: 'section8_notice',
    section_21: 'section21_notice',
    notice_to_leave: 'notice_to_leave',
  };

  return mapping[route] || null;
}

/**
 * Get user-friendly label for a canonical route
 */
export function getRouteLabel(route: CanonicalRoute | null): string {
  if (!route) return 'Unknown route';

  const labels: Record<CanonicalRoute, string> = {
    section_8: 'Section 8 - Fault-based eviction',
    section_21: 'Section 21 - No-fault notice',
    notice_to_leave: 'Notice to Leave (Scotland)',
  };

  return labels[route] || route;
}
