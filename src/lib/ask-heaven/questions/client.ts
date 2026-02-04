/**
 * Ask Heaven Questions Client Module
 *
 * Client-safe exports for components that run in the browser.
 * Avoids importing server-only modules like Next.js headers.
 */

export type {
  AskHeavenJurisdiction,
  AskHeavenQuestion,
  AskHeavenQuestionListItem,
  AskHeavenQuestionStatus,
  AskHeavenPrimaryTopic,
  DuplicateCheckResult,
} from './types';

export {
  MIN_ANSWER_WORD_COUNT,
  REQUIRED_DISCLAIMER_PATTERNS,
  DUPLICATE_SIMILARITY_THRESHOLD,
  JURISDICTION_PRODUCT_RESTRICTIONS,
  countWords,
  hasRequiredDisclaimer,
  isProductAllowedForJurisdiction,
  getAllowedProductsForJurisdiction,
  validateQualityGates,
  checkForDuplicates,
  canBeIndexed,
  getMetaRobots,
  getIndexabilityStatus,
} from './quality-gates';
export type { QualityGateFailure, QualityGateResult } from './quality-gates';
