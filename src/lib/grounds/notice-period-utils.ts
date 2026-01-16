/**
 * Notice Period Utilities for Section 8 Grounds
 *
 * Provides utilities for calculating notice periods when multiple grounds
 * are included in a Section 8 notice.
 *
 * Key rule: The notice period must be the MAXIMUM of all included grounds.
 */

/**
 * Canonical ground notice periods (in days) for Section 8 grounds.
 * This is the SINGLE SOURCE OF TRUTH used across the entire codebase.
 *
 * Source: Housing Act 1988, Schedule 2 (as amended)
 */
export const SECTION8_GROUND_NOTICE_PERIODS: Record<string, number> = {
  // Mandatory grounds
  '1': 60, // 2 months - landlord previously occupied
  '2': 60, // 2 months - mortgage lender requires possession
  '3': 14, // 2 weeks - holiday let
  '4': 14, // 2 weeks - educational institution let
  '5': 60, // 2 months - minister of religion
  '6': 60, // 2 months - demolition/reconstruction
  '7': 60, // 2 months - death of periodic tenant
  '7A': 14, // 2 weeks - abandonment (fixed term)
  '7B': 14, // 2 weeks - abandonment (periodic)
  '8': 14, // 2 weeks - serious rent arrears (8 weeks/2 months)

  // Discretionary grounds
  '9': 60, // 2 months - suitable alternative accommodation
  '10': 14, // 2 weeks - some rent arrears
  '11': 14, // 2 weeks - persistent delay in paying rent
  '12': 14, // 2 weeks - breach of tenancy obligation
  '13': 14, // 2 weeks - deterioration of dwelling
  '14': 14, // 2 weeks (default) - nuisance/annoyance
  '14ZA': 14, // 2 weeks - riot conviction
  '14A': 0, // Immediate - domestic violence
  '15': 14, // 2 weeks - deterioration of furniture
  '16': 60, // 2 months - former employee
  '17': 14, // 2 weeks - false statement
};

/**
 * Check if a ground is arrears-related (8, 10, or 11)
 */
export function isArrearsGround(groundCode: string | number): boolean {
  const code = normalizeGroundCode(groundCode);
  return code === '8' || code === '10' || code === '11';
}

/**
 * Check if any of the provided grounds are arrears-related
 */
export function hasArrearsGround(grounds: Array<string | number>): boolean {
  return grounds.some((g) => isArrearsGround(g));
}

/**
 * Normalize ground code to string format (handles "Ground 8", "8", 8)
 */
export function normalizeGroundCode(code: string | number): string {
  const codeStr = String(code).toUpperCase();
  // Remove "GROUND " prefix if present
  return codeStr.replace(/^GROUND\s*/i, '').trim();
}

/**
 * Get the notice period in days for a specific ground
 */
export function getGroundNoticePeriod(groundCode: string | number): number {
  const code = normalizeGroundCode(groundCode);
  return SECTION8_GROUND_NOTICE_PERIODS[code] ?? 14; // Default to 14 days for unknown grounds
}

/**
 * Calculate the required notice period when multiple grounds are included.
 * Uses the MAXIMUM notice period across all included grounds.
 *
 * @param grounds - Array of ground codes (e.g., ["8", "10", "Ground 11"])
 * @returns Object with minimum period and explanation
 */
export function calculateCombinedNoticePeriod(grounds: Array<string | number>): {
  noticePeriodDays: number;
  drivingGrounds: string[];
  explanation: string;
  groundPeriods: Array<{ code: string; days: number }>;
} {
  if (!grounds || grounds.length === 0) {
    return {
      noticePeriodDays: 14,
      drivingGrounds: [],
      explanation: 'No grounds specified. Default minimum period is 14 days.',
      groundPeriods: [],
    };
  }

  // Calculate period for each ground
  const groundPeriods = grounds.map((g) => {
    const code = normalizeGroundCode(g);
    const days = getGroundNoticePeriod(code);
    return { code, days };
  });

  // Find maximum period
  const maxPeriod = Math.max(...groundPeriods.map((g) => g.days));

  // Find all grounds that require the maximum period
  const drivingGrounds = groundPeriods
    .filter((g) => g.days === maxPeriod)
    .map((g) => `Ground ${g.code}`);

  // Build explanation
  let explanation: string;
  if (maxPeriod === 60) {
    const twoMonthGrounds = groundPeriods.filter((g) => g.days === 60);
    const twoMonthCodes = twoMonthGrounds.map((g) => `Ground ${g.code}`).join(', ');
    explanation = `${twoMonthCodes} require${twoMonthGrounds.length === 1 ? 's' : ''} 60 days (2 months) notice. This is the minimum notice period for your notice.`;
  } else if (maxPeriod === 14) {
    explanation = 'All selected grounds require 14 days minimum notice.';
  } else if (maxPeriod === 0) {
    explanation = 'Selected ground(s) allow immediate court proceedings.';
  } else {
    explanation = `Selected grounds require ${maxPeriod} days minimum notice.`;
  }

  return {
    noticePeriodDays: maxPeriod,
    drivingGrounds,
    explanation,
    groundPeriods,
  };
}

/**
 * Compare notice periods when adding recommended grounds.
 * Returns information about how the period changes.
 */
export function compareNoticePeriods(
  selectedGrounds: Array<string | number>,
  recommendedGrounds: Array<string | number>
): {
  selectedPeriod: number;
  combinedPeriod: number;
  increasesNotice: boolean;
  increaseAmount: number;
  explanation: string;
} {
  const selectedResult = calculateCombinedNoticePeriod(selectedGrounds);
  const combinedGrounds = [...selectedGrounds, ...recommendedGrounds];
  const combinedResult = calculateCombinedNoticePeriod(combinedGrounds);

  const increasesNotice = combinedResult.noticePeriodDays > selectedResult.noticePeriodDays;
  const increaseAmount = combinedResult.noticePeriodDays - selectedResult.noticePeriodDays;

  let explanation: string;
  if (increasesNotice) {
    const newDrivingGrounds = combinedResult.drivingGrounds.filter(
      (g) => !selectedResult.drivingGrounds.includes(g)
    );
    explanation = `Adding recommended grounds will increase your notice period from ${selectedResult.noticePeriodDays} days to ${combinedResult.noticePeriodDays} days because ${newDrivingGrounds.join(', ')} require${newDrivingGrounds.length === 1 ? 's' : ''} ${combinedResult.noticePeriodDays} days notice.`;
  } else {
    explanation = `Notice period remains ${selectedResult.noticePeriodDays} days. The recommended grounds do not require a longer notice period.`;
  }

  return {
    selectedPeriod: selectedResult.noticePeriodDays,
    combinedPeriod: combinedResult.noticePeriodDays,
    increasesNotice,
    increaseAmount,
    explanation,
  };
}

/**
 * Get ground type (mandatory vs discretionary)
 */
export function getGroundType(groundCode: string | number): 'mandatory' | 'discretionary' {
  const code = normalizeGroundCode(groundCode);
  // Mandatory grounds: 1, 2, 3, 4, 5, 6, 7, 7A, 7B, 8
  const mandatoryGrounds = ['1', '2', '3', '4', '5', '6', '7', '7A', '7B', '8'];
  return mandatoryGrounds.includes(code) ? 'mandatory' : 'discretionary';
}

/**
 * Get a human-readable description of a ground
 */
export function getGroundDescription(groundCode: string | number): {
  code: string;
  title: string;
  type: 'mandatory' | 'discretionary';
  noticePeriodDays: number;
} {
  const code = normalizeGroundCode(groundCode);
  const type = getGroundType(code);
  const noticePeriodDays = getGroundNoticePeriod(code);

  const titles: Record<string, string> = {
    '1': 'Landlord previously occupied as only or principal home',
    '2': 'Mortgage lender requires possession',
    '3': 'Out of season holiday letting',
    '4': 'Out of season student letting',
    '5': 'Property required for minister of religion',
    '6': 'Intention to demolish or reconstruct',
    '7': 'Death of periodic tenant (within 12 months)',
    '7A': 'Abandonment (fixed term)',
    '7B': 'Abandonment (periodic)',
    '8': 'Serious rent arrears (2+ months)',
    '9': 'Suitable alternative accommodation',
    '10': 'Some rent arrears',
    '11': 'Persistent delay in paying rent',
    '12': 'Breach of tenancy obligation',
    '13': 'Deterioration of dwelling',
    '14': 'Nuisance or annoyance',
    '14ZA': 'Riot conviction',
    '14A': 'Domestic violence',
    '15': 'Deterioration of furniture',
    '16': 'Former employee',
    '17': 'False statement',
  };

  return {
    code,
    title: titles[code] || `Ground ${code}`,
    type,
    noticePeriodDays,
  };
}
