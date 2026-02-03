/**
 * Ask Heaven Quality Gates
 *
 * Server-side quality checks that determine indexability.
 * These gates ensure only high-quality content gets indexed.
 *
 * CRITICAL: All questions are noindex by default.
 * Indexing requires passing ALL quality gates AND status === 'approved'.
 */

import type {
  AskHeavenQuestion,
  AskHeavenJurisdiction,
  DuplicateCheckResult,
} from './types';

/**
 * Minimum word count for indexable content.
 * Content below this threshold is considered "thin content".
 */
export const MIN_ANSWER_WORD_COUNT = 500;

/**
 * Required disclaimer text (or variations).
 * At least one must appear in the answer.
 */
export const REQUIRED_DISCLAIMER_PATTERNS = [
  'not legal advice',
  'not a substitute for legal advice',
  'consult a solicitor',
  'seek legal advice',
  'this is general information only',
];

/**
 * Similarity threshold for duplicate detection.
 * Questions with similarity >= this value require canonical_slug.
 */
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

/**
 * Products/flows unavailable in specific jurisdictions.
 * Used to prevent product CTAs in unsupported regions.
 */
export const JURISDICTION_PRODUCT_RESTRICTIONS: Record<
  AskHeavenJurisdiction,
  string[]
> = {
  england: [], // All products available
  wales: ['complete_pack', 'money_claim'], // Only notice_only + tenancy_agreement
  scotland: ['complete_pack', 'money_claim'], // Only notice_only + tenancy_agreement
  'northern-ireland': ['notice_only', 'complete_pack', 'money_claim'], // Only tenancy_agreement
  'uk-wide': [], // Depends on specific jurisdiction
};

/**
 * Result of quality gate validation.
 */
export interface QualityGateResult {
  /** Whether all gates passed */
  passed: boolean;

  /** Whether the page should be noindex (inverse of indexable) */
  forceNoindex: boolean;

  /** List of failed checks */
  failures: QualityGateFailure[];

  /** List of warnings (non-blocking) */
  warnings: string[];

  /** Word count of the answer */
  wordCount: number;
}

export interface QualityGateFailure {
  gate: string;
  reason: string;
  severity: 'error' | 'warning';
}

/**
 * Count words in a string.
 * Handles markdown formatting.
 */
export function countWords(text: string): number {
  // Remove markdown formatting
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[#*_~]/g, '') // Remove markdown symbols
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (!cleanText) return 0;
  return cleanText.split(/\s+/).length;
}

/**
 * Check if the answer contains a required disclaimer.
 */
export function hasRequiredDisclaimer(answerMd: string): boolean {
  const lowerAnswer = answerMd.toLowerCase();
  return REQUIRED_DISCLAIMER_PATTERNS.some((pattern) =>
    lowerAnswer.includes(pattern.toLowerCase())
  );
}

/**
 * Check if a product CTA is allowed for a jurisdiction.
 */
export function isProductAllowedForJurisdiction(
  product: string,
  jurisdiction: AskHeavenJurisdiction
): boolean {
  const restrictions = JURISDICTION_PRODUCT_RESTRICTIONS[jurisdiction];
  return !restrictions.includes(product);
}

/**
 * Get allowed products for a jurisdiction.
 */
export function getAllowedProductsForJurisdiction(
  jurisdiction: AskHeavenJurisdiction
): string[] {
  const allProducts = ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'];
  const restrictions = JURISDICTION_PRODUCT_RESTRICTIONS[jurisdiction];
  return allProducts.filter((p) => !restrictions.includes(p));
}

/**
 * Validate a question against all quality gates.
 *
 * @param question - The question to validate
 * @returns QualityGateResult with pass/fail status and details
 */
export function validateQualityGates(
  question: AskHeavenQuestion
): QualityGateResult {
  const failures: QualityGateFailure[] = [];
  const warnings: string[] = [];

  // Gate 1: Status check
  if (question.status !== 'approved') {
    failures.push({
      gate: 'status',
      reason: `Question status is '${question.status}', must be 'approved' for indexing`,
      severity: 'error',
    });
  }

  // Gate 2: Word count check
  const wordCount = countWords(question.answer_md);
  if (wordCount < MIN_ANSWER_WORD_COUNT) {
    failures.push({
      gate: 'word_count',
      reason: `Answer has ${wordCount} words, minimum is ${MIN_ANSWER_WORD_COUNT}`,
      severity: 'error',
    });
  }

  // Gate 3: Disclaimer check
  if (!hasRequiredDisclaimer(question.answer_md)) {
    failures.push({
      gate: 'disclaimer',
      reason: 'Answer missing required legal disclaimer',
      severity: 'error',
    });
  }

  // Gate 4: Canonical check (if similarity detected)
  // This is checked separately via checkForDuplicates()

  // Gate 5: Summary check
  if (!question.summary || question.summary.length < 50) {
    failures.push({
      gate: 'summary',
      reason: 'Summary is missing or too short (minimum 50 characters)',
      severity: 'error',
    });
  }

  // Gate 6: Jurisdiction check
  if (question.jurisdictions.length === 0) {
    failures.push({
      gate: 'jurisdiction',
      reason: 'At least one jurisdiction must be specified',
      severity: 'error',
    });
  }

  // Warnings (non-blocking)
  if (!question.related_slugs || question.related_slugs.length === 0) {
    warnings.push('No related questions linked - consider adding for better internal linking');
  }

  if (question.reviewed_at === null && question.status === 'approved') {
    warnings.push('Question is approved but has no review timestamp');
  }

  const passed = failures.filter((f) => f.severity === 'error').length === 0;
  const forceNoindex = !passed;

  return {
    passed,
    forceNoindex,
    failures,
    warnings,
    wordCount,
  };
}

/**
 * Placeholder for semantic similarity check.
 *
 * TODO: Implement actual similarity detection using:
 * - Embeddings (OpenAI, Cohere, etc.)
 * - TF-IDF + cosine similarity
 * - Fuzzy string matching
 *
 * For now, returns a placeholder result.
 */
export async function checkForDuplicates(
  question: string,
  excludeSlug?: string
): Promise<DuplicateCheckResult> {
  // TODO: Implement actual similarity detection
  // This is a placeholder that always returns no duplicate
  //
  // Implementation options:
  // 1. Use OpenAI embeddings + vector database (Pinecone, Supabase pgvector)
  // 2. Use TF-IDF with existing questions
  // 3. Use fuzzy string matching (Levenshtein distance)
  //
  // For production:
  // - Store embeddings for all questions
  // - Query for similar questions before creating new ones
  // - Flag questions with similarity > DUPLICATE_SIMILARITY_THRESHOLD

  console.warn(
    '[Ask Heaven] checkForDuplicates is a placeholder - implement before scaling content'
  );

  return {
    isDuplicate: false,
    similarity: 0,
    matchedSlug: null,
    matchedQuestion: null,
  };
}

/**
 * Validate that a question can be safely indexed.
 * Combines quality gates with duplicate checking.
 *
 * @param question - The question to validate
 * @returns Object with indexability status and reasons
 */
export async function canBeIndexed(question: AskHeavenQuestion): Promise<{
  canIndex: boolean;
  reasons: string[];
  qualityResult: QualityGateResult;
  duplicateResult: DuplicateCheckResult;
}> {
  const qualityResult = validateQualityGates(question);
  const duplicateResult = await checkForDuplicates(question.question, question.slug);

  const reasons: string[] = [];

  // Check quality gates
  if (!qualityResult.passed) {
    reasons.push(
      ...qualityResult.failures
        .filter((f) => f.severity === 'error')
        .map((f) => f.reason)
    );
  }

  // Check for duplicates requiring canonical
  if (
    duplicateResult.isDuplicate &&
    duplicateResult.similarity >= DUPLICATE_SIMILARITY_THRESHOLD &&
    !question.canonical_slug
  ) {
    reasons.push(
      `High similarity (${(duplicateResult.similarity * 100).toFixed(1)}%) with "${duplicateResult.matchedSlug}" - requires canonical_slug`
    );
  }

  // Check canonical_slug points to a valid question
  if (question.canonical_slug) {
    reasons.push(
      `Has canonical_slug pointing to "${question.canonical_slug}" - this page will not be indexed`
    );
  }

  const canIndex = reasons.length === 0;

  return {
    canIndex,
    reasons,
    qualityResult,
    duplicateResult,
  };
}

/**
 * Generate meta robots value based on quality gates.
 *
 * @param question - The question to check
 * @returns 'index, follow' or 'noindex, follow'
 */
export function getMetaRobots(question: AskHeavenQuestion): string {
  const result = validateQualityGates(question);

  if (result.forceNoindex) {
    return 'noindex, follow';
  }

  // Additional check: canonical questions should not be indexed
  if (question.canonical_slug !== null) {
    return 'noindex, follow';
  }

  return 'index, follow';
}

/**
 * Get a human-readable indexability status for admin UI.
 */
export function getIndexabilityStatus(question: AskHeavenQuestion): {
  status: 'indexable' | 'noindex' | 'blocked';
  label: string;
  details: string[];
} {
  const result = validateQualityGates(question);

  if (question.status !== 'approved') {
    return {
      status: 'blocked',
      label: `Status: ${question.status}`,
      details: ['Question must be approved before indexing'],
    };
  }

  if (question.canonical_slug) {
    return {
      status: 'noindex',
      label: 'Canonical redirect',
      details: [`Canonicalizes to: ${question.canonical_slug}`],
    };
  }

  if (!result.passed) {
    return {
      status: 'noindex',
      label: 'Quality gates failed',
      details: result.failures.map((f) => f.reason),
    };
  }

  return {
    status: 'indexable',
    label: 'Ready for indexing',
    details: result.warnings,
  };
}
