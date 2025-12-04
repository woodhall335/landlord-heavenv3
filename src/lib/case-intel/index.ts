/**
 * Case Intelligence Module - Main Export
 *
 * Phase 2: AI Case Intelligence
 *
 * Integrates:
 * - Decision engine (YAML-based legal rules)
 * - Case strength scoring
 * - Consistency checking
 * - Evidence analysis
 * - AI narrative generation (Ask Heaven)
 *
 * CRITICAL: All legal rules come from decision engine YAML.
 * This module does NOT hard-code legal thresholds.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import { runDecisionEngine, type DecisionInput } from '@/lib/decision-engine';
import { calculateCaseStrength } from './scorer';
import { checkConsistency } from './consistency';
import { analyzeEvidence } from './evidence';
import { generateCaseNarrative } from './narrative';
import type { CaseIntelligence, AnalyzeCaseOptions } from './types';

export * from './types';
export { generateArrearsNarrative, generateASBNarrative } from './narrative';

/**
 * Main case intelligence analysis function
 *
 * Analyzes a case and returns comprehensive intelligence including:
 * - Case strength score (0-100)
 * - Consistency report
 * - Evidence analysis
 * - AI-generated narratives
 * - Decision engine output
 */
export async function analyzeCase(
  facts: CaseFacts,
  options: AnalyzeCaseOptions = {}
): Promise<CaseIntelligence> {
  // Set defaults
  const {
    include_narrative = true,
    include_evidence = true,
    narrative_options = {},
  } = options;

  // Validate inputs
  if (!facts) {
    throw new Error('CaseFacts is required for case analysis');
  }

  const jurisdiction = facts.meta.jurisdiction || 'england-wales';
  const product = facts.meta.product || 'notice_only';
  const case_type = 'eviction'; // Could be parameterized later

  // Step 1: Run decision engine (source of truth for legal rules)
  const decisionInput: DecisionInput = {
    jurisdiction: jurisdiction as 'england-wales' | 'scotland' | 'northern-ireland',
    product: product as 'notice_only' | 'complete_pack' | 'money_claim',
    case_type: case_type as 'eviction' | 'money_claim' | 'tenancy_agreement',
    facts,
  };

  const decision_engine_output = runDecisionEngine(decisionInput);

  // Step 2: Check consistency
  const inconsistencies = checkConsistency(facts, decision_engine_output);

  // Step 3: Analyze evidence (if requested)
  const evidence = include_evidence
    ? analyzeEvidence(facts, decision_engine_output)
    : {
        summary: {},
        missing_evidence: [],
        extracted_timeline: [],
        ground_links: {},
        completeness_score: 0,
      };

  // Step 4: Calculate case strength score
  const score_report = calculateCaseStrength(
    facts,
    decision_engine_output,
    inconsistencies,
    evidence
  );

  // Step 5: Generate narratives (if requested and API key available)
  let narrative = null;
  if (include_narrative && process.env.OPENAI_API_KEY) {
    try {
      narrative = await generateCaseNarrative(facts, decision_engine_output, narrative_options);
    } catch (error) {
      console.error('Narrative generation failed:', error);
      // Continue without narratives rather than failing
    }
  }

  // Fallback if narrative generation failed or was skipped
  if (!narrative) {
    narrative = {
      case_summary: 'Narrative generation not available (API key not configured or error occurred)',
      ground_narratives: {},
      generated_at: new Date().toISOString(),
    };
  }

  // Step 6: Return comprehensive intelligence
  return {
    score_report,
    narrative,
    evidence,
    inconsistencies,
    decision_engine_output,
    case_facts: facts,
    metadata: {
      jurisdiction,
      product,
      case_type,
      analyzed_at: new Date().toISOString(),
      engine_version: '2.0.0',
    },
  };
}

/**
 * Quick strength score only (no narratives or detailed evidence)
 */
export function quickScoreCase(facts: CaseFacts): {
  score: number;
  rating: string;
  key_issues: string[];
} {
  const jurisdiction = facts.meta.jurisdiction || 'england-wales';
  const product = facts.meta.product || 'notice_only';

  const decisionInput: DecisionInput = {
    jurisdiction: jurisdiction as 'england-wales' | 'scotland' | 'northern-ireland',
    product: product as 'notice_only' | 'complete_pack' | 'money_claim',
    case_type: 'eviction',
    facts,
  };

  const decision_engine_output = runDecisionEngine(decisionInput);
  const inconsistencies = checkConsistency(facts, decision_engine_output);
  const evidence = analyzeEvidence(facts, decision_engine_output);

  const score_report = calculateCaseStrength(
    facts,
    decision_engine_output,
    inconsistencies,
    evidence
  );

  // Determine rating
  let rating = 'Poor';
  if (score_report.score >= 80) rating = 'Excellent';
  else if (score_report.score >= 65) rating = 'Good';
  else if (score_report.score >= 50) rating = 'Fair';

  // Extract key issues
  const key_issues: string[] = [];
  if (score_report.components.legal_eligibility.issues) {
    key_issues.push(...score_report.components.legal_eligibility.issues.slice(0, 3));
  }
  if (score_report.components.evidence.issues) {
    key_issues.push(...score_report.components.evidence.issues.slice(0, 2));
  }

  return {
    score: score_report.score,
    rating,
    key_issues,
  };
}

/**
 * Check if case is ready for submission
 */
export function isCaseReadyForSubmission(facts: CaseFacts): {
  ready: boolean;
  blockers: string[];
  warnings: string[];
} {
  const jurisdiction = facts.meta.jurisdiction || 'england-wales';
  const product = facts.meta.product || 'notice_only';

  const decisionInput: DecisionInput = {
    jurisdiction: jurisdiction as 'england-wales' | 'scotland' | 'northern-ireland',
    product: product as 'notice_only' | 'complete_pack' | 'money_claim',
    case_type: 'eviction',
    facts,
  };

  const decision_engine_output = runDecisionEngine(decisionInput);
  const inconsistencies = checkConsistency(facts, decision_engine_output);

  const blockers: string[] = [];
  const warnings: string[] = [];

  // Check decision engine blocking issues
  const blockingIssues = decision_engine_output.blocking_issues.filter(
    (b) => b.severity === 'blocking'
  );
  for (const block of blockingIssues) {
    blockers.push(`${block.route.toUpperCase()}: ${block.description}`);
  }

  // Check critical inconsistencies
  const criticalInconsistencies = inconsistencies.inconsistencies.filter(
    (i) => i.severity === 'critical'
  );
  for (const issue of criticalInconsistencies) {
    blockers.push(`${issue.category}: ${issue.message}`);
  }

  // Check high-priority data gaps
  const highPriorityGaps = inconsistencies.data_gaps.filter((g) => g.priority === 'high');
  for (const gap of highPriorityGaps) {
    blockers.push(`Missing: ${gap.field} - ${gap.impact}`);
  }

  // Check decision engine warnings
  for (const warning of decision_engine_output.warnings) {
    warnings.push(warning);
  }

  // Check consistency warnings
  const warningInconsistencies = inconsistencies.inconsistencies.filter(
    (i) => i.severity === 'warning'
  );
  for (const issue of warningInconsistencies) {
    warnings.push(`${issue.category}: ${issue.message}`);
  }

  const ready = blockers.length === 0;

  return {
    ready,
    blockers,
    warnings,
  };
}
