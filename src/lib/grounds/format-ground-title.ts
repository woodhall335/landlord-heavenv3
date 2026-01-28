/**
 * Shared helper for formatting ground titles consistently
 * across the wizard UI (ground selection and ground particulars)
 */

export interface GroundMetadata {
  ground: string | number;
  name: string;
  type?: 'mandatory' | 'mandatory_with_conditions' | 'discretionary';
  short_description?: string;
  category?: string;
}

/**
 * Format a ground title with number, name, and mandatory/discretionary status
 * @param groundNumber - The ground number (e.g., "8", "11", "14A")
 * @param availableGrounds - Array of ground metadata from API
 * @returns Formatted title object with text and type, or null if ground not found
 */
export function formatGroundTitle(
  groundNumber: string | number,
  availableGrounds?: GroundMetadata[] | null
): {
  groundNum: string;
  name: string | null;
  type: 'mandatory' | 'discretionary' | null;
  fullTitle: string;
} {
  const groundNum = String(groundNumber).toUpperCase();

  // Find ground metadata
  const groundMeta = availableGrounds?.find(
    g => String(g.ground).toUpperCase() === groundNum
  );

  // Determine if mandatory or discretionary
  let type: 'mandatory' | 'discretionary' | null = null;
  if (groundMeta?.type === 'mandatory' || groundMeta?.type === 'mandatory_with_conditions') {
    type = 'mandatory';
  } else if (groundMeta?.type === 'discretionary') {
    type = 'discretionary';
  }

  // Build full title
  let fullTitle = `Ground ${groundNum}`;
  if (groundMeta?.name) {
    fullTitle += ` – ${groundMeta.name}`;
  }
  if (type) {
    fullTitle += ` (${type === 'mandatory' ? 'Mandatory' : 'Discretionary'})`;
  }

  return {
    groundNum,
    name: groundMeta?.name || null,
    type,
    fullTitle,
  };
}

/**
 * Get CSS classes for ground type badge
 * @param type - 'mandatory' or 'discretionary'
 * @returns Tailwind CSS classes for badge styling
 */
export function getGroundTypeBadgeClasses(type: 'mandatory' | 'discretionary'): string {
  return type === 'mandatory'
    ? 'bg-red-100 text-red-800'
    : 'bg-blue-100 text-blue-800';
}
