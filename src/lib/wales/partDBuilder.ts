/**
 * Wales RHW23 Part D Builder
 *
 * Generates Part D ("Notice of Possession Claim") text for Wales RHW23 notices
 * using the Wales ground definitions as the SINGLE SOURCE OF TRUTH.
 *
 * CRITICAL LEGAL REQUIREMENT:
 * This module must NEVER emit any of:
 * - "Housing Act 1988"
 * - "Section 8" (England Section 8)
 * - "Ground 8" (England Ground 8)
 * - "Form 6A"
 * - "Section 21"
 *
 * All output must use Wales terminology and the Renting Homes (Wales) Act 2016.
 */

import {
  getWalesFaultGroundDefinitions,
  getWalesFaultGroundByValue,
  type WalesFaultGroundDef,
} from './grounds';
import { buildWalesArrearsNarrativeFromSchedule, generateWalesArrearsSummary } from './arrearsNarrative';
import { isWalesSection157ThresholdMet, calculateWalesArrearsInMonths } from './seriousArrearsThreshold';
import { computeArrears } from '@/lib/arrears-engine';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface WalesPartDParams {
  /** Selected Wales fault grounds (UI keys like 'rent_arrears_serious') */
  wales_fault_grounds?: string[] | null;
  /** Whether the landlord is a community landlord (social landlord) */
  is_community_landlord?: boolean;
  /** Total arrears amount (for rent arrears grounds) */
  total_arrears?: number | null;
  /** Arrears items for schedule (for rent arrears grounds) */
  arrears_items?: ArrearsItem[] | null;
  /** Rent amount per period */
  rent_amount?: number | null;
  /** Rent frequency */
  rent_frequency?: TenancyFacts['rent_frequency'] | null;
  /** Date notice is being served */
  notice_service_date?: string | null;
  /** Breach description for non-arrears grounds (e.g., ASB details) */
  breach_description?: string | null;
  /** ASB incident description */
  asb_description?: string | null;
  /** ASB incident date */
  asb_incident_date?: string | null;
  /** ASB incident time */
  asb_incident_time?: string | null;
  /** False statement details (for Section 159 false statement ground) */
  false_statement_details?: string | null;
  /** Breach clause reference */
  breach_clause?: string | null;
}

export interface WalesPartDResult {
  /** The generated Part D text */
  text: string;
  /** List of grounds included in Part D */
  groundsIncluded: Array<{
    value: string;
    label: string;
    section: number;
  }>;
  /** Whether Part D text was successfully generated */
  success: boolean;
  /** Warning messages if any */
  warnings: string[];
}

// ============================================================================
// FORBIDDEN PATTERNS - England-specific strings that must NEVER appear
// ============================================================================

const FORBIDDEN_ENGLAND_PATTERNS = [
  'Housing Act 1988',
  /Section 8\b/i,
  /Ground 8\b/,
  'Form 6A',
  /Section 21\b/i,
];

/**
 * Validates that text does not contain any England-specific patterns.
 * Throws an error if any forbidden pattern is found.
 */
function assertNoEnglandReferences(text: string, context: string): void {
  for (const pattern of FORBIDDEN_ENGLAND_PATTERNS) {
    if (typeof pattern === 'string') {
      if (text.includes(pattern)) {
        throw new Error(
          `[Wales partDBuilder] LEGAL ERROR: England reference "${pattern}" found in ${context}. ` +
          `Wales documents must never reference England legislation.`
        );
      }
    } else {
      // RegExp pattern
      if (pattern.test(text)) {
        throw new Error(
          `[Wales partDBuilder] LEGAL ERROR: England reference pattern found in ${context}. ` +
          `Wales documents must never reference England legislation.`
        );
      }
    }
  }
}

/**
 * Sanitizes input text by removing any England-specific references.
 * Returns the sanitized text.
 */
function sanitizeInputText(text: string | null | undefined): string {
  if (!text) return '';

  let sanitized = text;

  // Remove England-specific references
  sanitized = sanitized.replace(/Housing Act 1988/gi, '[REFERENCE REMOVED]');
  sanitized = sanitized.replace(/Section 8\b/gi, '[REFERENCE REMOVED]');
  sanitized = sanitized.replace(/Ground 8\b/gi, '[REFERENCE REMOVED]');
  sanitized = sanitized.replace(/Form 6A/gi, '[REFERENCE REMOVED]');
  sanitized = sanitized.replace(/Section 21\b/gi, '[REFERENCE REMOVED]');

  return sanitized;
}

// ============================================================================
// GROUND-SPECIFIC TEXT BUILDERS
// ============================================================================

/**
 * Build Part D text for Section 157 - Serious Rent Arrears.
 */
function buildSection157Text(params: WalesPartDParams, groundDef: WalesFaultGroundDef): string {
  const parts: string[] = [];

  // Ground heading
  parts.push(`Ground relied upon: ${groundDef.label} (section ${groundDef.section})`);
  parts.push('');

  // Build narrative
  const totalArrears = params.total_arrears ?? 0;
  const rentAmount = params.rent_amount ?? 0;
  const rentFrequency = params.rent_frequency ?? 'monthly';
  const arrearsItems = params.arrears_items ?? [];

  // Try to use the arrears narrative builder for detailed text
  // But fall back to basic text if arrears schedule doesn't yield meaningful totals
  let useDetailedNarrative = false;

  if (arrearsItems.length > 0 && rentAmount > 0) {
    try {
      // Use the arrears narrative builder for detailed text
      const narrativeResult = buildWalesArrearsNarrativeFromSchedule(
        arrearsItems,
        rentAmount,
        rentFrequency,
        params.notice_service_date || undefined,
        true, // isSerious = true for Section 157
        undefined // rentDueDay
      );

      // Check if the narrative has a meaningful arrears total
      // If computeArrears returned 0 but we have a total_arrears, use the fallback
      if (narrativeResult.narrative.includes('£0.00') && totalArrears > 0) {
        // Computed arrears is 0 but we have a known total - use fallback
        useDetailedNarrative = false;
      } else {
        parts.push(narrativeResult.narrative);
        useDetailedNarrative = true;
      }
    } catch {
      // If narrative builder fails, use fallback
      useDetailedNarrative = false;
    }
  }

  if (!useDetailedNarrative) {
    // Fallback to basic text
    const arrearsInMonths = rentAmount > 0 ? totalArrears / rentAmount : 0;

    // Check threshold
    let thresholdMet: boolean | undefined;
    if (totalArrears > 0 && rentAmount > 0) {
      const thresholdResult = isWalesSection157ThresholdMet(totalArrears, rentFrequency, rentAmount);
      thresholdMet = thresholdResult.met;
    }

    parts.push(
      `The contract-holder is in serious rent arrears within the meaning of section ${groundDef.section} ` +
      'of the Renting Homes (Wales) Act 2016.'
    );
    parts.push('');

    if (totalArrears > 0) {
      parts.push(`Total arrears: £${totalArrears.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      if (arrearsInMonths > 0) {
        parts.push(`This represents approximately ${arrearsInMonths.toFixed(1)} months of rent.`);
      }
    }

    if (thresholdMet === true) {
      parts.push('');
      parts.push(
        'The level of arrears meets the statutory threshold for serious rent arrears ' +
        'applicable to this occupation contract.'
      );
    }
  }

  parts.push('');
  parts.push('A schedule of arrears is attached setting out each rent period, the amount due, payments received (if any), and the amount outstanding.');

  return parts.join('\n');
}

/**
 * Build Part D text for Section 159 grounds (various discretionary grounds).
 */
function buildSection159Text(
  params: WalesPartDParams,
  groundDef: WalesFaultGroundDef,
  groundValue: string
): string {
  const parts: string[] = [];

  // Ground heading
  parts.push(`Ground relied upon: ${groundDef.label} (section ${groundDef.section})`);
  parts.push('');

  // Ground-specific text
  switch (groundValue) {
    case 'rent_arrears_other': {
      // Some rent arrears (less than 2 months)
      const totalArrears = params.total_arrears ?? 0;
      const rentAmount = params.rent_amount ?? 0;
      const arrearsInMonths = rentAmount > 0 ? totalArrears / rentAmount : 0;

      parts.push(
        `The contract-holder has rent arrears under section ${groundDef.section} ` +
        'of the Renting Homes (Wales) Act 2016.'
      );
      parts.push('');

      if (totalArrears > 0) {
        parts.push(`Total arrears: £${totalArrears.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        if (arrearsInMonths > 0) {
          parts.push(`This represents approximately ${arrearsInMonths.toFixed(1)} months of rent.`);
        }
      }

      parts.push('');
      parts.push('A schedule of arrears is attached setting out each rent period, the amount due, payments received (if any), and the amount outstanding.');
      break;
    }

    case 'breach_of_contract': {
      // Breach of occupation contract
      parts.push(
        `The contract-holder is in breach of the occupation contract under section ${groundDef.section} ` +
        'of the Renting Homes (Wales) Act 2016.'
      );
      parts.push('');

      // Sanitize breach description to remove any England references
      const sanitizedBreachDesc = sanitizeInputText(params.breach_description);

      if (params.breach_clause) {
        parts.push(`Clause breached: ${params.breach_clause}`);
        parts.push('');
      }

      if (sanitizedBreachDesc) {
        parts.push('Particulars of the breach:');
        parts.push(sanitizedBreachDesc);
      } else {
        parts.push('The particulars of the breach are set out below.');
      }
      break;
    }

    case 'false_statement': {
      // False statement
      parts.push(
        `The contract-holder obtained the occupation contract through a false statement under section ${groundDef.section} ` +
        'of the Renting Homes (Wales) Act 2016.'
      );
      parts.push('');

      const sanitizedFalseStatementDetails = sanitizeInputText(params.false_statement_details);

      if (sanitizedFalseStatementDetails) {
        parts.push('Details of the false statement:');
        parts.push(sanitizedFalseStatementDetails);
      } else {
        parts.push('The false statement made to obtain the occupation contract is set out below.');
      }
      break;
    }

    case 'domestic_abuse': {
      // Domestic abuse perpetrator
      parts.push(
        `The landlord seeks possession on the ground that the contract-holder is a perpetrator ` +
        `of domestic abuse towards another occupier, under section ${groundDef.section} ` +
        'of the Renting Homes (Wales) Act 2016.'
      );
      parts.push('');

      const sanitizedBreachDesc = sanitizeInputText(params.breach_description);
      if (sanitizedBreachDesc) {
        parts.push('Further particulars:');
        parts.push(sanitizedBreachDesc);
      }
      break;
    }

    default: {
      // Generic Section 159 ground
      parts.push(
        `The landlord relies on section ${groundDef.section} of the Renting Homes (Wales) Act 2016.`
      );
      parts.push('');

      const sanitizedBreachDesc = sanitizeInputText(params.breach_description);
      if (sanitizedBreachDesc) {
        parts.push('Particulars:');
        parts.push(sanitizedBreachDesc);
      }
      break;
    }
  }

  return parts.join('\n');
}

/**
 * Build Part D text for Section 160 - Estate Management grounds (community landlord only).
 */
function buildSection160Text(params: WalesPartDParams, groundDef: WalesFaultGroundDef): string {
  const parts: string[] = [];

  // Ground heading
  parts.push(`Ground relied upon: ${groundDef.label} (section ${groundDef.section} and Schedule 8)`);
  parts.push('');

  parts.push(
    `The landlord (a community landlord) seeks possession on estate management grounds ` +
    `under section ${groundDef.section} and Schedule 8 of the Renting Homes (Wales) Act 2016.`
  );
  parts.push('');

  const sanitizedBreachDesc = sanitizeInputText(params.breach_description);
  if (sanitizedBreachDesc) {
    parts.push('Estate management reasons:');
    parts.push(sanitizedBreachDesc);
  } else {
    parts.push('The estate management grounds relied upon are indicated on the form.');
  }

  return parts.join('\n');
}

/**
 * Build Part D text for Section 161 - Anti-Social Behaviour.
 */
function buildSection161Text(params: WalesPartDParams, groundDef: WalesFaultGroundDef): string {
  const parts: string[] = [];

  // Ground heading
  parts.push(`Ground relied upon: ${groundDef.label} (section ${groundDef.section})`);
  parts.push('');

  parts.push(
    `The contract-holder (or a person residing in or visiting the dwelling) has engaged in ` +
    `anti-social behaviour or other prohibited conduct as defined in section 55 of the ` +
    `Renting Homes (Wales) Act 2016.`
  );
  parts.push('');

  parts.push(
    `The landlord relies on section ${groundDef.section} of the Renting Homes (Wales) Act 2016.`
  );
  parts.push('');

  // ASB incident details
  const sanitizedAsbDesc = sanitizeInputText(params.asb_description || params.breach_description);

  if (params.asb_incident_date || params.asb_incident_time) {
    parts.push('Incident details:');
    if (params.asb_incident_date) {
      parts.push(`Date: ${params.asb_incident_date}`);
    }
    if (params.asb_incident_time) {
      parts.push(`Time: ${params.asb_incident_time}`);
    }
    parts.push('');
  }

  if (sanitizedAsbDesc) {
    parts.push('Description of the anti-social behaviour:');
    parts.push(sanitizedAsbDesc);
  } else {
    parts.push('The particulars of the anti-social behaviour are set out below.');
  }

  return parts.join('\n');
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

/**
 * Build Wales RHW23 Part D text based on selected grounds.
 *
 * Uses the Wales ground definitions (WALES_FAULT_GROUNDS) as the SINGLE SOURCE OF TRUTH
 * to derive ground labels, section numbers, and build appropriate narrative text.
 *
 * CRITICAL: This function NEVER emits England-specific references (Housing Act 1988,
 * Section 8, Ground 8, Form 6A, Section 21). Any input text containing these
 * references is sanitized.
 *
 * @param wizardFacts - The wizard facts object containing selected grounds and data
 * @returns Part D result with generated text and metadata
 */
export function buildWalesPartDText(wizardFacts: WalesPartDParams): WalesPartDResult {
  const warnings: string[] = [];
  const groundsIncluded: Array<{ value: string; label: string; section: number }> = [];

  // Extract selected grounds
  const selectedGrounds = wizardFacts.wales_fault_grounds ?? [];

  if (!Array.isArray(selectedGrounds) || selectedGrounds.length === 0) {
    return {
      text: '',
      groundsIncluded: [],
      success: false,
      warnings: ['No Wales fault grounds selected. Cannot generate Part D text.'],
    };
  }

  // Get ground definitions filtered by landlord type
  const isCommunityLandlord = wizardFacts.is_community_landlord ?? false;
  const availableDefs = getWalesFaultGroundDefinitions({ isCommunityLandlord });

  // Build lookup map from definitions
  const defsMap = new Map<string, WalesFaultGroundDef>();
  for (const def of availableDefs) {
    defsMap.set(def.value, def);
  }

  // Also get all definitions to handle community landlord grounds if selected
  const allDefs = getWalesFaultGroundDefinitions({ isCommunityLandlord: true });
  for (const def of allDefs) {
    if (!defsMap.has(def.value)) {
      defsMap.set(def.value, def);
    }
  }

  // Build Part D text for each selected ground
  const groundTexts: string[] = [];

  // Sort grounds by section number for stable output
  const sortedGrounds = [...selectedGrounds].sort((a, b) => {
    const defA = defsMap.get(a);
    const defB = defsMap.get(b);
    if (!defA || !defB) return 0;
    if (defA.section !== defB.section) return defA.section - defB.section;
    return defA.label.localeCompare(defB.label);
  });

  for (const groundValue of sortedGrounds) {
    const groundDef = defsMap.get(groundValue);

    if (!groundDef) {
      warnings.push(`Unknown Wales fault ground: "${groundValue}". Skipping.`);
      continue;
    }

    // Check if community landlord-only ground is selected by non-community landlord
    if (groundDef.communityLandlordOnly && !isCommunityLandlord) {
      warnings.push(
        `Ground "${groundDef.label}" is only available to community landlords. ` +
        `It has been included but may not be valid for a private landlord.`
      );
    }

    // Build ground-specific text based on section
    let groundText: string;

    switch (groundDef.section) {
      case 157:
        groundText = buildSection157Text(wizardFacts, groundDef);
        break;

      case 159:
        groundText = buildSection159Text(wizardFacts, groundDef, groundValue);
        break;

      case 160:
        groundText = buildSection160Text(wizardFacts, groundDef);
        break;

      case 161:
        groundText = buildSection161Text(wizardFacts, groundDef);
        break;

      default:
        // Fallback for unknown sections
        groundText = [
          `Ground relied upon: ${groundDef.label} (section ${groundDef.section})`,
          '',
          `The landlord relies on section ${groundDef.section} of the Renting Homes (Wales) Act 2016.`,
          '',
          sanitizeInputText(wizardFacts.breach_description) || '',
        ].filter(Boolean).join('\n');
        break;
    }

    groundTexts.push(groundText);
    groundsIncluded.push({
      value: groundValue,
      label: groundDef.label,
      section: groundDef.section,
    });
  }

  if (groundTexts.length === 0) {
    return {
      text: '',
      groundsIncluded: [],
      success: false,
      warnings: [
        'No valid Wales fault grounds found. Cannot generate Part D text.',
        ...warnings,
      ],
    };
  }

  // Combine ground texts with separator for multi-ground cases
  let finalText: string;
  if (groundTexts.length === 1) {
    finalText = groundTexts[0];
  } else {
    // Multi-ground: add a header and separate each ground with a line break
    finalText = groundTexts.join('\n\n---\n\n');
  }

  // CRITICAL: Verify no England references in final output
  try {
    assertNoEnglandReferences(finalText, 'Part D final output');
  } catch (error) {
    // This should never happen, but if it does, sanitize and warn
    console.error('[Wales partDBuilder] Critical error - England reference leaked:', error);
    finalText = sanitizeInputText(finalText);
    warnings.push(
      'CRITICAL: England reference was detected and removed from Part D output. ' +
      'Please review the generated notice for accuracy.'
    );
  }

  return {
    text: finalText,
    groundsIncluded,
    success: true,
    warnings,
  };
}

/**
 * Convenience function to build Part D text from raw wizard facts.
 *
 * Extracts relevant fields from a generic wizard facts object and
 * calls buildWalesPartDText with the appropriate parameters.
 *
 * @param wizardFacts - Raw wizard facts from the database
 * @returns Part D result with generated text and metadata
 */
export function buildWalesPartDFromWizardFacts(wizardFacts: any): WalesPartDResult {
  const params: WalesPartDParams = {
    wales_fault_grounds: wizardFacts?.wales_fault_grounds,
    is_community_landlord: wizardFacts?.is_community_landlord ?? false,
    total_arrears:
      wizardFacts?.total_arrears ??
      wizardFacts?.arrears_total ??
      wizardFacts?.rent_arrears_amount ??
      wizardFacts?.issues?.rent_arrears?.total_arrears ??
      null,
    // Read arrears_items from both canonical flat key and nested structure
    arrears_items:
      wizardFacts?.arrears_items ??
      wizardFacts?.issues?.rent_arrears?.arrears_items ??
      null,
    rent_amount: wizardFacts?.rent_amount ?? null,
    rent_frequency: wizardFacts?.rent_frequency ?? 'monthly',
    notice_service_date:
      wizardFacts?.notice_service_date ??
      wizardFacts?.service_date ??
      wizardFacts?.notice_date ??
      null,
    breach_description:
      wizardFacts?.breach_description ??
      wizardFacts?.breach_details ??
      null,
    // Read Wales-specific ASB keys (wales_asb_*) with fallback to generic keys
    asb_description:
      wizardFacts?.wales_asb_description ??
      wizardFacts?.asb_description ??
      null,
    asb_incident_date:
      wizardFacts?.wales_asb_incident_date ??
      wizardFacts?.asb_incident_date ??
      null,
    asb_incident_time:
      wizardFacts?.wales_asb_incident_time ??
      wizardFacts?.asb_incident_time ??
      null,
    // Read Wales-specific false statement key with fallback
    false_statement_details:
      wizardFacts?.wales_false_statement_summary ??
      wizardFacts?.false_statement_details ??
      null,
    // Read Wales-specific breach clause key with fallback
    breach_clause:
      wizardFacts?.wales_breach_clause ??
      wizardFacts?.breach_clause ??
      null,
  };

  return buildWalesPartDText(params);
}
