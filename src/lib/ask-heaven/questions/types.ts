/**
 * Ask Heaven Question Data Model
 *
 * Defines the persistence layer types for indexable Q&A pages.
 *
 * IMPORTANT: Questions are noindex by default until explicitly approved.
 * See /docs/ask-heaven-seo.md for the review workflow.
 */

/**
 * Supported jurisdictions for Ask Heaven questions.
 * 'uk-wide' indicates content applies across all jurisdictions.
 */
export type AskHeavenJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland'
  | 'uk-wide';

/**
 * Question review status.
 *
 * - draft: Initial state, not visible to users, noindex
 * - review: Pending editorial review, visible but noindex
 * - approved: Reviewed and approved for indexing
 */
export type AskHeavenQuestionStatus = 'draft' | 'review' | 'approved';

/**
 * Primary topic categories for Ask Heaven questions.
 * Used for internal linking and product recommendations.
 */
export type AskHeavenPrimaryTopic =
  | 'eviction'
  | 'arrears'
  | 'deposit'
  | 'tenancy'
  | 'compliance'
  | 'damage_claim'
  | 'notice_periods'
  | 'court_process'
  | 'tenant_rights'
  | 'landlord_obligations'
  | 'other';

/**
 * Core question data model for Ask Heaven Q&A pages.
 *
 * This model supports:
 * - Unique URLs via slug
 * - Canonical clustering to prevent duplicate content
 * - Editorial review workflow
 * - Multi-jurisdiction content
 * - Related content linking
 */
export interface AskHeavenQuestion {
  /** Unique identifier (UUID or similar) */
  id: string;

  /**
   * URL slug - must be unique.
   * Format: lowercase-kebab-case
   * Example: "how-to-serve-section-21-notice-england"
   */
  slug: string;

  /** The question text as it appears to users */
  question: string;

  /**
   * Full answer in Markdown format.
   * Must be >500 words for indexing eligibility.
   */
  answer_md: string;

  /**
   * TL;DR summary (1-3 sentences).
   * Displayed prominently at top of page.
   */
  summary: string;

  /** Primary topic category */
  primary_topic: AskHeavenPrimaryTopic;

  /**
   * Jurisdictions this question applies to.
   * Array allows multi-jurisdiction content.
   */
  jurisdictions: AskHeavenJurisdiction[];

  /** Review status - determines indexability */
  status: AskHeavenQuestionStatus;

  /**
   * Canonical slug for duplicate clustering.
   * If set, this question redirects/canonicalizes to another.
   * null = this is the canonical version.
   */
  canonical_slug: string | null;

  /**
   * Related question slugs for internal linking.
   * Populated manually or via similarity detection.
   */
  related_slugs: string[];

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;

  /**
   * Last editorial review timestamp (ISO 8601).
   * null = never reviewed.
   */
  reviewed_at: string | null;
}

/**
 * Minimal question data for sitemap generation.
 * Only includes fields needed for sitemap entries.
 */
export interface AskHeavenQuestionSitemapEntry {
  slug: string;
  updated_at: string;
  status: AskHeavenQuestionStatus;
  canonical_slug: string | null;
}

/**
 * Question data for listing/search results.
 * Excludes full answer for performance.
 */
export interface AskHeavenQuestionListItem {
  id: string;
  slug: string;
  question: string;
  summary: string;
  primary_topic: AskHeavenPrimaryTopic;
  jurisdictions: AskHeavenJurisdiction[];
  status: AskHeavenQuestionStatus;
  updated_at: string;
}

/**
 * Input for creating a new question.
 * Excludes auto-generated fields (id, timestamps, status).
 */
export interface CreateAskHeavenQuestionInput {
  slug: string;
  question: string;
  answer_md: string;
  summary: string;
  primary_topic: AskHeavenPrimaryTopic;
  jurisdictions: AskHeavenJurisdiction[];
  canonical_slug?: string | null;
  related_slugs?: string[];
}

/**
 * Input for updating an existing question.
 * All fields optional except id.
 */
export interface UpdateAskHeavenQuestionInput {
  id: string;
  slug?: string;
  question?: string;
  answer_md?: string;
  summary?: string;
  primary_topic?: AskHeavenPrimaryTopic;
  jurisdictions?: AskHeavenJurisdiction[];
  status?: AskHeavenQuestionStatus;
  canonical_slug?: string | null;
  related_slugs?: string[];
}

/**
 * Result of a duplicate/similarity check.
 */
export interface DuplicateCheckResult {
  /** Whether a potential duplicate was found */
  isDuplicate: boolean;
  /** Similarity score (0-1, where 1 = identical) */
  similarity: number;
  /** Slug of the most similar existing question */
  matchedSlug: string | null;
  /** The question text of the matched question */
  matchedQuestion: string | null;
}
