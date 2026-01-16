/**
 * Wales Fault-Based Ground Definitions
 *
 * SINGLE SOURCE OF TRUTH for Wales fault-based eviction grounds under
 * the Renting Homes (Wales) Act 2016.
 *
 * This module is used by:
 * - WalesNoticeSection.tsx (UI ground selection)
 * - validate/preview endpoints (deriving ground_codes from wales_fault_grounds)
 *
 * DO NOT duplicate this data elsewhere. Import from this module.
 */

/**
 * Wales fault-based ground definition.
 * Maps internal ground values to RH(W)A 2016 section numbers.
 */
export interface WalesFaultGroundDef {
  /** Internal value stored in facts.wales_fault_grounds */
  value: string;
  /** Display label for UI */
  label: string;
  /** Description for UI */
  description: string;
  /** RH(W)A 2016 section number (157, 159, 161) */
  section: number;
  /** Notice period in days */
  period: number;
  /** Whether this is a mandatory/absolute ground */
  mandatory: boolean;
  /** Whether this ground requires arrears schedule data */
  requiresArrearsSchedule: boolean;
  /**
   * Whether this ground is only available to community landlords (social landlords).
   * Estate management grounds (section 160, Schedule 8) are community landlord-only.
   * Private landlords should NOT see this ground.
   */
  communityLandlordOnly?: boolean;
}

/**
 * Wales fault-based grounds under Renting Homes (Wales) Act 2016.
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - UI ground selection in WalesNoticeSection.tsx
 * - ground_codes derivation in validate/preview endpoints
 *
 * Section mappings:
 * - Section 157: Serious rent arrears (8+ weeks / 2 months)
 * - Section 159: Discretionary grounds (breach, arrears < 2 months, false statement, etc.)
 * - Section 161: Anti-social behaviour
 */
export const WALES_FAULT_GROUNDS: WalesFaultGroundDef[] = [
  {
    value: 'rent_arrears_serious',
    label: 'Serious rent arrears (8+ weeks)',
    description: 'At least 2 months of rent unpaid',
    section: 157,
    period: 14,
    mandatory: true,
    requiresArrearsSchedule: true,
  },
  {
    value: 'rent_arrears_other',
    label: 'Some rent arrears',
    description: 'Less than 2 months of rent unpaid',
    section: 159,
    period: 56,
    mandatory: false,
    requiresArrearsSchedule: true,
  },
  {
    value: 'antisocial_behaviour',
    label: 'Anti-social behaviour',
    description: 'Serious anti-social behaviour or nuisance',
    section: 161,
    period: 14,
    mandatory: true,
    requiresArrearsSchedule: false,
  },
  {
    value: 'breach_of_contract',
    label: 'Breach of occupation contract',
    description: 'Breach of terms in the occupation contract',
    section: 159,
    period: 56,
    mandatory: false,
    requiresArrearsSchedule: false,
  },
  {
    value: 'false_statement',
    label: 'False statement',
    description: 'False statement made to obtain the contract',
    section: 159,
    period: 56,
    mandatory: true,
    requiresArrearsSchedule: false,
  },
  {
    value: 'domestic_abuse',
    label: 'Domestic abuse (perpetrator)',
    description: 'Perpetrator of domestic abuse towards another occupier',
    section: 159,
    period: 14,
    mandatory: true,
    requiresArrearsSchedule: false,
  },
  {
    value: 'estate_management',
    label: 'Estate management grounds',
    description: 'Estate management grounds (section 160 and Schedule 8) - community landlords only',
    section: 160,
    period: 60,
    mandatory: false,
    requiresArrearsSchedule: false,
    communityLandlordOnly: true,
  },
];

/**
 * Options for filtering Wales fault-based grounds.
 */
export interface WalesGroundsFilterOptions {
  /**
   * Whether the landlord is a community landlord (social landlord).
   * If false (default), community-landlord-only grounds like estate_management are excluded.
   */
  isCommunityLandlord?: boolean;
}

/**
 * Get all Wales fault-based ground definitions.
 *
 * Returns the ground list used by the UI. Use this function
 * instead of accessing WALES_FAULT_GROUNDS directly to ensure
 * filtering and transformation is applied consistently.
 *
 * By default, excludes community-landlord-only grounds (estate_management).
 * Pass { isCommunityLandlord: true } to include them.
 *
 * @param options - Filter options for ground selection
 * @returns Filtered array of ground definitions
 */
export function getWalesFaultGroundDefinitions(
  options?: WalesGroundsFilterOptions
): WalesFaultGroundDef[] {
  const isCommunityLandlord = options?.isCommunityLandlord ?? false;

  return WALES_FAULT_GROUNDS.filter((ground) => {
    // Exclude community-landlord-only grounds for private landlords
    if (ground.communityLandlordOnly && !isCommunityLandlord) {
      return false;
    }
    return true;
  });
}

/**
 * Get ALL Wales fault-based ground definitions without any filtering.
 * Use this only when you need the complete list (e.g., for validation of existing data).
 */
export function getAllWalesFaultGroundDefinitions(): WalesFaultGroundDef[] {
  return WALES_FAULT_GROUNDS;
}

/**
 * Build a lookup map from ground value to section number.
 * Uses the WALES_FAULT_GROUNDS definitions as the single source of truth.
 */
function buildGroundToSectionMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const ground of WALES_FAULT_GROUNDS) {
    map.set(ground.value, ground.section);
  }
  return map;
}

// Cached lookup map (built once on module load)
const groundToSectionMap = buildGroundToSectionMap();

/**
 * Convert Wales fault grounds (UI values) to canonical ground_codes.
 *
 * The UI collects grounds like:
 *   ['rent_arrears_serious', 'antisocial_behaviour']
 *
 * The validator/requirements engine expects ground_codes like:
 *   ['section_157', 'section_161']
 *
 * This function derives ground_codes from the same WALES_FAULT_GROUNDS
 * definitions that power the UI, ensuring they can never drift.
 *
 * @param walesFaultGrounds - Array of ground values from facts.wales_fault_grounds
 * @returns Array of canonical ground_codes (e.g., ['section_157', 'section_161'])
 */
export function mapWalesFaultGroundsToGroundCodes(
  walesFaultGrounds: string[] | undefined | null
): string[] {
  if (!walesFaultGrounds || !Array.isArray(walesFaultGrounds)) {
    return [];
  }

  const groundCodes = new Set<string>();

  for (const groundValue of walesFaultGrounds) {
    const section = groundToSectionMap.get(groundValue);
    if (section !== undefined) {
      // Convert to canonical format: "section_157", "section_159", "section_161"
      groundCodes.add(`section_${section}`);
    } else {
      // Unknown ground value - log but don't fail
      // This allows new grounds to be added without breaking validation
      console.debug(
        `[wales/grounds] Unknown Wales fault ground: "${groundValue}". ` +
        `Known grounds: ${Array.from(groundToSectionMap.keys()).join(', ')}`
      );
    }
  }

  // Return deduplicated array
  return Array.from(groundCodes);
}

/**
 * Get a ground definition by its value.
 *
 * @param value - Ground value (e.g., 'rent_arrears_serious')
 * @returns Ground definition or undefined if not found
 */
export function getWalesFaultGroundByValue(
  value: string
): WalesFaultGroundDef | undefined {
  return WALES_FAULT_GROUNDS.find((g) => g.value === value);
}

/**
 * Get all ground definitions for a specific section.
 *
 * @param section - Section number (157, 159, or 161)
 * @returns Array of ground definitions for that section
 */
export function getWalesFaultGroundsBySection(
  section: number
): WalesFaultGroundDef[] {
  return WALES_FAULT_GROUNDS.filter((g) => g.section === section);
}

/**
 * Calculate minimum notice period for selected grounds.
 *
 * @param walesFaultGrounds - Array of ground values from facts.wales_fault_grounds
 * @returns Minimum notice period in days (defaults to 60 if no grounds)
 */
export function calculateWalesMinNoticePeriod(
  walesFaultGrounds: string[] | undefined | null
): number {
  if (!walesFaultGrounds || !Array.isArray(walesFaultGrounds) || walesFaultGrounds.length === 0) {
    return 60; // Default fallback
  }

  let minPeriod = 60;
  for (const groundValue of walesFaultGrounds) {
    const ground = getWalesFaultGroundByValue(groundValue);
    if (ground && ground.period < minPeriod) {
      minPeriod = ground.period;
    }
  }
  return minPeriod;
}

/**
 * Wales arrears ground values that require an arrears schedule.
 * Used for determining whether to include arrears schedule PDF in notice pack.
 */
export const WALES_ARREARS_GROUND_VALUES = WALES_FAULT_GROUNDS
  .filter((g) => g.requiresArrearsSchedule)
  .map((g) => g.value);

/**
 * Check if any selected Wales fault grounds require an arrears schedule.
 *
 * This function uses the SINGLE SOURCE OF TRUTH (WALES_FAULT_GROUNDS definitions)
 * to determine whether arrears schedule data should be included in the notice pack.
 *
 * @param walesFaultGrounds - Array of ground values from facts.wales_fault_grounds
 * @returns true if any selected ground requires arrears schedule
 */
export function hasWalesArrearsGroundSelected(
  walesFaultGrounds: string[] | undefined | null
): boolean {
  if (!walesFaultGrounds || !Array.isArray(walesFaultGrounds) || walesFaultGrounds.length === 0) {
    return false;
  }

  return walesFaultGrounds.some((groundValue) => {
    const ground = getWalesFaultGroundByValue(groundValue);
    return ground?.requiresArrearsSchedule === true;
  });
}

/**
 * Check if serious rent arrears (Section 157) is selected.
 * Used for determining threshold checking requirements.
 *
 * @param walesFaultGrounds - Array of ground values from facts.wales_fault_grounds
 * @returns true if serious rent arrears ground is selected
 */
export function hasWalesSection157Selected(
  walesFaultGrounds: string[] | undefined | null
): boolean {
  if (!walesFaultGrounds || !Array.isArray(walesFaultGrounds)) {
    return false;
  }
  return walesFaultGrounds.includes('rent_arrears_serious');
}
