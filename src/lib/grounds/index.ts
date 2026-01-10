/**
 * Grounds Utilities Index
 *
 * Re-exports all ground-related utilities for Section 8 notices.
 */

export {
  SECTION8_GROUND_NOTICE_PERIODS,
  isArrearsGround,
  hasArrearsGround,
  normalizeGroundCode,
  getGroundNoticePeriod,
  calculateCombinedNoticePeriod,
  compareNoticePeriods,
  getGroundType,
  getGroundDescription,
} from './notice-period-utils';

export {
  getGroundAwareSuggestions,
  isArrearsEvidenceComplete,
  type EvidenceSuggestion,
} from './evidence-suggestions';
