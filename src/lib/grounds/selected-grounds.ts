/**
 * Selected grounds helper
 *
 * Normalizes how Section 8 grounds are read from wizard facts and case facts.
 * This keeps analyze, generate, and guidance documents consistent.
 */

import { normalizeGroundCode } from './notice-period-utils';

function normalizeToArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function getSelectedGrounds(
  wizardFacts: Record<string, any> = {},
  caseFacts?: Record<string, any>
): string[] {
  const candidates = [
    caseFacts?.issues?.section8_grounds?.selected_grounds,
    wizardFacts?.issues?.section8_grounds?.selected_grounds,
    wizardFacts?.section8_grounds,
    wizardFacts?.section8_grounds_selection,
    wizardFacts?.selected_grounds,
    wizardFacts?.ground_codes,
    wizardFacts?.eviction_grounds,
    wizardFacts?.['case_facts.issues.section8_grounds.selected_grounds'],
  ];

  const combined = candidates.flatMap((value) => normalizeToArray(value));

  return Array.from(new Set(combined)).filter(Boolean);
}

export function getNormalizedSelectedGrounds(
  wizardFacts: Record<string, any> = {},
  caseFacts?: Record<string, any>
): string[] {
  return getSelectedGrounds(wizardFacts, caseFacts).map((ground) => normalizeGroundCode(ground));
}
