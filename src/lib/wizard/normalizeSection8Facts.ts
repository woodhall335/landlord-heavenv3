/**
 * Section 8 Facts Normalization
 *
 * Backfills missing canonical fields from legacy/alternative field locations
 * to ensure validation and document generation succeeds for notice_only cases.
 *
 * This addresses a regression where wizard answers were stored under different
 * field names than what the gating validation expects:
 *
 * PROBLEM 1: Arrears fields
 * - Wizard stores: issues.rent_arrears.total_arrears, total_arrears
 * - Gating checks: arrears_total, arrears_amount
 * - FIX: Backfill arrears_total from available sources
 *
 * PROBLEM 2: Ground particulars for Ground 8
 * - Wizard stores: section8_details (string description of arrears)
 * - Gating checks: ground_particulars.ground_8.summary
 * - FIX: Backfill ground_particulars.ground_8.summary from section8_details
 *
 * This normalization runs BEFORE validation to ensure all required fields exist.
 */

import { resolveFactValue } from '@/lib/jurisdictions/validators';

/**
 * Extract ground codes from section8_grounds array
 * Handles formats like "Ground 8 - Serious rent arrears" or "ground_8"
 */
function extractGroundCodes(section8Grounds: any[]): number[] {
  if (!Array.isArray(section8Grounds)) return [];

  return section8Grounds
    .map((g: any) => {
      if (typeof g === 'number') return g;
      if (typeof g !== 'string') return null;

      // Try "Ground 8" format
      const match = g.match(/Ground\s+(\d+)/i);
      if (match) return parseInt(match[1], 10);

      // Try "ground_8" format
      const underscoreMatch = g.match(/ground[_\s](\d+)/i);
      if (underscoreMatch) return parseInt(underscoreMatch[1], 10);

      return null;
    })
    .filter((code): code is number => code !== null && !isNaN(code));
}

/**
 * Check if a ground code is an arrears ground (8, 10, or 11)
 */
function isArrearsGround(groundCode: number): boolean {
  return [8, 10, 11].includes(groundCode);
}

/**
 * Safely set a nested path on an object
 */
function setNestedPath(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Generate a summary for Ground 8 from arrears data
 *
 * If section8_details exists, use that. Otherwise, generate from arrears_items.
 */
function generateGround8Summary(facts: Record<string, any>): string | null {
  // First try explicit section8_details
  const section8Details = resolveFactValue(facts, 'section8_details');
  if (section8Details && typeof section8Details === 'string' && section8Details.trim()) {
    return section8Details.trim();
  }

  // Try to build from arrears data
  const arrearsItems = resolveFactValue(facts, 'issues.rent_arrears.arrears_items') ||
                       resolveFactValue(facts, 'arrears_items') || [];

  const totalArrears = resolveFactValue(facts, 'arrears_total') ||
                       resolveFactValue(facts, 'total_arrears') ||
                       resolveFactValue(facts, 'issues.rent_arrears.total_arrears') ||
                       resolveFactValue(facts, 'arrears_amount') || 0;

  const rentAmount = resolveFactValue(facts, 'rent_amount') ||
                     resolveFactValue(facts, 'tenancy.rent_amount') || 0;

  const rentFrequency = resolveFactValue(facts, 'rent_frequency') ||
                        resolveFactValue(facts, 'tenancy.rent_frequency') || 'monthly';

  if (totalArrears > 0 || (Array.isArray(arrearsItems) && arrearsItems.length > 0)) {
    const parts: string[] = [];

    // Add total arrears
    if (totalArrears > 0) {
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(totalArrears);
      parts.push(`Total rent arrears: ${formattedAmount}`);
    }

    // Add rent info if available
    if (rentAmount > 0) {
      const formattedRent = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(rentAmount);
      parts.push(`Rent: ${formattedRent} ${rentFrequency}`);
    }

    // Add period info if available from arrears_items
    if (Array.isArray(arrearsItems) && arrearsItems.length > 0) {
      const sortedItems = [...arrearsItems].sort((a, b) => {
        const dateA = new Date(a.period_start || a.date || '');
        const dateB = new Date(b.period_start || b.date || '');
        return dateA.getTime() - dateB.getTime();
      });

      const firstDate = sortedItems[0]?.period_start || sortedItems[0]?.date;
      const lastDate = sortedItems[sortedItems.length - 1]?.period_end || sortedItems[sortedItems.length - 1]?.period_start;

      if (firstDate) {
        const formatDate = (dateStr: string) => {
          try {
            return new Date(dateStr).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          } catch {
            return dateStr;
          }
        };

        if (lastDate && lastDate !== firstDate) {
          parts.push(`Period: ${formatDate(firstDate)} to ${formatDate(lastDate)}`);
        } else {
          parts.push(`From: ${formatDate(firstDate)}`);
        }
      }

      parts.push(`${arrearsItems.length} unpaid rent period${arrearsItems.length > 1 ? 's' : ''}`);
    }

    if (parts.length > 0) {
      return parts.join('. ') + '.';
    }
  }

  return null;
}

/**
 * Normalize Section 8 facts to ensure all required fields exist for validation.
 *
 * This function mutates the input facts object in-place to add missing canonical
 * fields that gating and document generation expect.
 *
 * @param facts - The wizard facts object (mutated in-place)
 * @returns The same facts object with backfilled fields
 */
export function normalizeSection8Facts(facts: Record<string, any>): Record<string, any> {
  if (!facts || typeof facts !== 'object') {
    return facts;
  }

  // Determine if this is a Section 8 case
  const selectedRoute = resolveFactValue(facts, 'selected_notice_route') ||
                        resolveFactValue(facts, 'eviction_route') ||
                        resolveFactValue(facts, 'notice_type');

  const isSection8 = selectedRoute === 'section_8' ||
                     (typeof selectedRoute === 'string' && selectedRoute.toLowerCase().includes('section 8'));

  if (!isSection8) {
    return facts;
  }

  // Get selected grounds
  const section8Grounds = resolveFactValue(facts, 'section8_grounds') || [];
  const groundCodes = extractGroundCodes(section8Grounds);

  // ============================================================================
  // BACKFILL 1: arrears_total from alternative locations
  // ============================================================================
  const hasArrearsGround = groundCodes.some(isArrearsGround);

  if (hasArrearsGround) {
    // Check if arrears_total is already set at top level
    const existingArrearsTotal = facts.arrears_total;

    if (existingArrearsTotal === undefined || existingArrearsTotal === null) {
      // Try to find arrears from alternative locations
      const alternativeArrears =
        resolveFactValue(facts, 'issues.rent_arrears.total_arrears') ||
        resolveFactValue(facts, 'total_arrears') ||
        resolveFactValue(facts, 'arrears_amount') ||
        resolveFactValue(facts, 'issues.rent_arrears.arrears_at_notice_date');

      if (alternativeArrears !== undefined && alternativeArrears !== null) {
        const numericArrears = typeof alternativeArrears === 'number'
          ? alternativeArrears
          : parseFloat(String(alternativeArrears).replace(/[£,]/g, ''));

        if (!isNaN(numericArrears) && numericArrears > 0) {
          facts.arrears_total = numericArrears;
          // Also set arrears_amount for compatibility with some code paths
          if (facts.arrears_amount === undefined) {
            facts.arrears_amount = numericArrears;
          }
          console.log(`[normalizeSection8Facts] Backfilled arrears_total=${numericArrears} from alternative location`);
        }
      }
    }
  }

  // ============================================================================
  // BACKFILL 2: ground_particulars.ground_X.summary from section8_details
  // ============================================================================
  for (const groundCode of groundCodes) {
    // Check if particulars already exist for this ground
    const existingSummary = resolveFactValue(facts, `ground_particulars.ground_${groundCode}.summary`);
    const existingAltPath = resolveFactValue(facts, `section_8_particulars.ground_${groundCode}`);

    // Check flat ground_particulars for mention of the ground
    const flatParticulars = resolveFactValue(facts, 'ground_particulars');
    const hasFlatParticulars = flatParticulars &&
                               typeof flatParticulars === 'string' &&
                               new RegExp(`Ground\\s+${groundCode}\\b`, 'i').test(flatParticulars);

    if (!existingSummary && !existingAltPath && !hasFlatParticulars) {
      // Need to backfill particulars for this ground
      let summary: string | null = null;

      if (isArrearsGround(groundCode)) {
        // For arrears grounds (8, 10, 11), generate from arrears data
        summary = generateGround8Summary(facts);
      } else {
        // For other grounds, try section8_details
        const section8Details = resolveFactValue(facts, 'section8_details');
        if (section8Details && typeof section8Details === 'string' && section8Details.trim()) {
          summary = section8Details.trim();
        }
      }

      if (summary) {
        // Initialize ground_particulars object if needed
        if (!facts.ground_particulars || typeof facts.ground_particulars !== 'object') {
          facts.ground_particulars = {};
        }

        // Set the summary at the expected path
        if (!facts.ground_particulars[`ground_${groundCode}`]) {
          facts.ground_particulars[`ground_${groundCode}`] = {};
        }

        facts.ground_particulars[`ground_${groundCode}`].summary = summary;

        console.log(`[normalizeSection8Facts] Backfilled ground_particulars.ground_${groundCode}.summary from arrears data/section8_details`);
      }
    }
  }

  return facts;
}

/**
 * Validate that required Section 8 fields are present after normalization.
 *
 * This is a diagnostic function that logs warnings but does not block.
 * Use this after normalizeSection8Facts() to verify the backfill worked.
 *
 * @param facts - The normalized facts object
 * @returns Object with validation status and any missing fields
 */
export function validateSection8FactsPresent(facts: Record<string, any>): {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  const section8Grounds = resolveFactValue(facts, 'section8_grounds') || [];
  const groundCodes = extractGroundCodes(section8Grounds);

  // Check arrears data for arrears grounds
  const hasArrearsGround = groundCodes.some(isArrearsGround);

  if (hasArrearsGround) {
    const arrearsTotal = resolveFactValue(facts, 'arrears_total') ||
                         resolveFactValue(facts, 'arrears_amount') ||
                         resolveFactValue(facts, 'issues.rent_arrears.total_arrears') ||
                         resolveFactValue(facts, 'total_arrears');

    if (!arrearsTotal || arrearsTotal <= 0) {
      missingFields.push('arrears_total');
    }
  }

  // Check ground particulars for each selected ground
  for (const groundCode of groundCodes) {
    const summary = resolveFactValue(facts, `ground_particulars.ground_${groundCode}.summary`);
    const altPath = resolveFactValue(facts, `section_8_particulars.ground_${groundCode}`);
    const flatParticulars = resolveFactValue(facts, 'ground_particulars');
    const hasFlatParticulars = flatParticulars &&
                               typeof flatParticulars === 'string' &&
                               new RegExp(`Ground\\s+${groundCode}\\b`, 'i').test(flatParticulars);

    if (!summary && !altPath && !hasFlatParticulars) {
      missingFields.push(`ground_particulars.ground_${groundCode}.summary`);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

export default normalizeSection8Facts;
