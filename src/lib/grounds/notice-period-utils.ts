/**
 * England possession notice period utilities for the post-1 May 2026 regime.
 *
 * We retain the legacy export names used throughout the repo so the wider codebase
 * can move over without a flag-day refactor.
 */

import {
  calculateEnglandPossessionNoticePeriod,
  ENGLAND_POST_2026_GROUND_CATALOG,
  getEnglandGroundDefinition,
  getEnglandGroundNoticePeriodDays,
  hasEnglandRentArrearsGround,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

export const SECTION8_GROUND_NOTICE_PERIODS: Record<string, number> = Object.fromEntries(
  Object.values(ENGLAND_POST_2026_GROUND_CATALOG).map((ground) => [ground.code, ground.noticePeriodDays]),
);

export function normalizeGroundCode(code: string | number): string {
  return normalizeEnglandGroundCode(code) || String(code).toUpperCase().replace(/^GROUND[\s_]*/i, '').trim();
}

export function isArrearsGround(groundCode: string | number): boolean {
  return hasEnglandRentArrearsGround([groundCode]);
}

export function hasArrearsGround(grounds: Array<string | number>): boolean {
  return hasEnglandRentArrearsGround(grounds);
}

export function getGroundNoticePeriod(groundCode: string | number): number {
  return getEnglandGroundNoticePeriodDays(groundCode);
}

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

  const result = calculateEnglandPossessionNoticePeriod(grounds);
  const groundPeriods = grounds.map((ground) => ({
    code: normalizeGroundCode(ground),
    days: getGroundNoticePeriod(ground),
  }));

  let explanation = `Selected grounds require ${result.noticePeriodDays} days minimum notice.`;
  if (result.immediateApplicationAllowed && result.noticePeriodDays === 0) {
    explanation = 'Selected ground(s) allow immediate court proceedings.';
  } else if (result.noticePeriodDays >= 120) {
    explanation = `${result.drivingGrounds.map((ground) => `Ground ${ground}`).join(', ')} require 4 months notice.`;
  } else if (result.noticePeriodDays >= 61) {
    explanation = `${result.drivingGrounds.map((ground) => `Ground ${ground}`).join(', ')} require 2 months notice.`;
  } else if (result.noticePeriodDays === 28) {
    explanation = `${result.drivingGrounds.map((ground) => `Ground ${ground}`).join(', ')} require 4 weeks notice.`;
  } else if (result.noticePeriodDays === 14) {
    explanation = 'All selected grounds require 2 weeks minimum notice.';
  }

  return {
    noticePeriodDays: result.noticePeriodDays,
    drivingGrounds: result.drivingGrounds.map((ground) => `Ground ${ground}`),
    explanation,
    groundPeriods,
  };
}

export function compareNoticePeriods(
  selectedGrounds: Array<string | number>,
  recommendedGrounds: Array<string | number>,
): {
  selectedPeriod: number;
  combinedPeriod: number;
  increasesNotice: boolean;
  increaseAmount: number;
  explanation: string;
} {
  const selectedResult = calculateCombinedNoticePeriod(selectedGrounds);
  const combinedResult = calculateCombinedNoticePeriod([...selectedGrounds, ...recommendedGrounds]);
  const increasesNotice = combinedResult.noticePeriodDays > selectedResult.noticePeriodDays;
  const increaseAmount = combinedResult.noticePeriodDays - selectedResult.noticePeriodDays;

  return {
    selectedPeriod: selectedResult.noticePeriodDays,
    combinedPeriod: combinedResult.noticePeriodDays,
    increasesNotice,
    increaseAmount,
    explanation: increasesNotice
      ? `Adding the extra grounds increases the notice period from ${selectedResult.noticePeriodDays} days to ${combinedResult.noticePeriodDays} days.`
      : `Notice period remains ${selectedResult.noticePeriodDays} days.`,
  };
}

export function getGroundType(groundCode: string | number): 'mandatory' | 'discretionary' {
  return getEnglandGroundDefinition(groundCode)?.mandatory ? 'mandatory' : 'discretionary';
}

export function getGroundDescription(groundCode: string | number): {
  code: string;
  title: string;
  type: 'mandatory' | 'discretionary';
  noticePeriodDays: number;
} {
  const normalized = normalizeGroundCode(groundCode);
  const definition = getEnglandGroundDefinition(normalized);

  return {
    code: normalized,
    title: definition?.title || `Ground ${normalized}`,
    type: definition?.mandatory ? 'mandatory' : 'discretionary',
    noticePeriodDays: definition?.noticePeriodDays ?? 14,
  };
}

export function getEnglandPost2026GroundCodes(): EnglandGroundCode[] {
  return Object.keys(ENGLAND_POST_2026_GROUND_CATALOG) as EnglandGroundCode[];
}
