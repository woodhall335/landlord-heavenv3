/**
 * Ask Heaven Questions Module
 *
 * Provides the foundation for indexable Ask Heaven Q&A pages.
 *
 * Key exports:
 * - Types: Data models for questions
 * - Repository: Persistence abstraction
 * - Quality Gates: Indexability checks
 * - Linking: Internal linking utilities
 *
 * See /docs/ask-heaven-seo.md for usage guidelines.
 */

// Types
export type {
  AskHeavenJurisdiction,
  AskHeavenQuestionStatus,
  AskHeavenPrimaryTopic,
  AskHeavenQuestion,
  AskHeavenQuestionSitemapEntry,
  AskHeavenQuestionListItem,
  CreateAskHeavenQuestionInput,
  UpdateAskHeavenQuestionInput,
  DuplicateCheckResult,
} from './types';

// Repository
export type { AskHeavenQuestionRepository } from './repository';
export {
  InMemoryQuestionRepository,
  getQuestionRepository,
  setQuestionRepository,
} from './repository';

// Quality Gates
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
export type { QualityGateResult, QualityGateFailure } from './quality-gates';

// Linking utilities (will be added)
export {
  getRelatedQuestionsConfig,
  getRelatedToolsConfig,
  TOPIC_TO_PRODUCTS_MAP,
  TOPIC_TO_TOOLS_MAP,
} from './linking';
