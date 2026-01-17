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

export {
  WALES_FAULT_GROUNDS,
  WALES_ARREARS_GROUND_VALUES,
  getWalesFaultGroundDefinitions,
  getAllWalesFaultGroundDefinitions,
  mapWalesFaultGroundsToGroundCodes,
  getWalesFaultGroundByValue,
  getWalesFaultGroundsBySection,
  calculateWalesMinNoticePeriod,
  hasWalesArrearsGroundSelected,
  hasWalesSection157Selected,
  type WalesFaultGroundDef,
  type WalesGroundsFilterOptions,
} from './grounds';

export {
  buildWalesPartDText,
  buildWalesPartDFromWizardFacts,
  type WalesPartDParams,
  type WalesPartDResult,
} from './partDBuilder';
