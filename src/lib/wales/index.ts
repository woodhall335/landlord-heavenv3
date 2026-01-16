/**
 * Wales-specific legal modules
 *
 * This module exports Wales-specific utilities for:
 * - Section 157 serious rent arrears threshold calculation
 * - Wales-specific arrears narrative generation
 *
 * All exports use Wales terminology and the Renting Homes (Wales) Act 2016.
 * NEVER reference Housing Act 1988, Section 8, or Ground 8.
 */

export {
  computeWalesSection157Threshold,
  isWalesSection157ThresholdMet,
  calculateWalesArrearsInMonths,
  calculateWalesArrearsInWeeks,
  type WalesThresholdResult,
  type WalesThresholdParams,
} from './seriousArrearsThreshold';

export {
  buildWalesSection157ArrearsNarrative,
  buildWalesArrearsNarrativeFromSchedule,
  generateWalesArrearsSummary,
  type WalesArrearsNarrativeParams,
  type WalesArrearsNarrativeResult,
} from './arrearsNarrative';
