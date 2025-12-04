/**
 * Case Strength Scorer
 *
 * Calculates 0-100 case strength score based on:
 * - Legal eligibility (from decision engine)
 * - Evidence completeness
 * - Consistency
 * - Procedural validity
 *
 * CRITICAL: All legal rules come from decision engine YAML.
 * This module does NOT create new legal thresholds.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { DecisionOutput } from '@/lib/decision-engine';
import type { CaseStrengthScore, ComponentScore } from './types';
import type { ConsistencyReport } from './types';
import type { EvidenceAnalysis } from './types';

interface ScoringWeights {
  legal_eligibility: number;
  evidence: number;
  consistency: number;
  procedure: number;
}

/**
 * Default scoring weights (must sum to 1.0)
 */
const DEFAULT_WEIGHTS: ScoringWeights = {
  legal_eligibility: 0.4, // 40% - most important
  evidence: 0.3, // 30%
  consistency: 0.2, // 20%
  procedure: 0.1, // 10%
};

/**
 * Calculate overall case strength score
 */
export function calculateCaseStrength(
  facts: CaseFacts,
  _decisionOutput: DecisionOutput,
  consistencyReport: ConsistencyReport,
  evidenceAnalysis: EvidenceAnalysis,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): CaseStrengthScore {
  // Calculate each component
  const legal_eligibility = scoreLegalEligibility(facts, decisionOutput);
  const evidence = scoreEvidence(evidenceAnalysis, decisionOutput);
  const consistency = scoreConsistency(consistencyReport);
  const procedure = scoreProcedure(facts, decisionOutput);

  // Calculate weighted overall score
  const score = Math.round(
    legal_eligibility.score * weights.legal_eligibility +
      evidence.score * weights.evidence +
      consistency.score * weights.consistency +
      procedure.score * weights.procedure
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    components: {
      legal_eligibility,
      evidence,
      consistency,
      procedure,
    },
    jurisdiction: facts.meta.jurisdiction || 'unknown',
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Score legal eligibility based on decision engine output
 *
 * IMPORTANT: Uses ONLY decision engine outputs, no hard-coded rules
 */
function scoreLegalEligibility(facts: CaseFacts, _decisionOutput: DecisionOutput): ComponentScore {
  let score = 100;
  const notes: string[] = [];
  const issues: string[] = [];
  const strengths: string[] = [];

  // Check blocking issues (from decision engine)
  const blockingIssues = decisionOutput.blocking_issues.filter((b) => b.severity === 'blocking');
  const warningIssues = decisionOutput.blocking_issues.filter((b) => b.severity === 'warning');

  if (blockingIssues.length > 0) {
    score -= blockingIssues.length * 25; // Each blocking issue is severe
    for (const block of blockingIssues) {
      issues.push(`${block.route.toUpperCase()} BLOCKED: ${block.description}`);
    }
    notes.push(`${blockingIssues.length} route(s) blocked by compliance issues`);
  }

  if (warningIssues.length > 0) {
    score -= warningIssues.length * 10;
    for (const warning of warningIssues) {
      issues.push(`${warning.route.toUpperCase()} WARNING: ${warning.description}`);
    }
    notes.push(`${warningIssues.length} warning(s) that may affect case`);
  }

  // Check for mandatory grounds (from decision engine)
  const mandatoryGrounds = decisionOutput.recommended_grounds.filter(
    (g) => g.type === 'mandatory'
  );
  const discretionaryGrounds = decisionOutput.recommended_grounds.filter(
    (g) => g.type === 'discretionary'
  );

  if (mandatoryGrounds.length > 0) {
    strengths.push(
      `${mandatoryGrounds.length} MANDATORY ground(s): ${mandatoryGrounds.map((g) => g.code).join(', ')}`
    );
    notes.push('Mandatory grounds are strong if facts proven');
    score += 10; // Bonus for mandatory grounds
  }

  if (discretionaryGrounds.length > 0) {
    strengths.push(
      `${discretionaryGrounds.length} discretionary ground(s): ${discretionaryGrounds.map((g) => g.code).join(', ')}`
    );
    notes.push('Discretionary grounds depend on judge/tribunal discretion');
  }

  // Check recommended routes
  const recommendedRoutes = decisionOutput.recommended_routes || [];
  if (recommendedRoutes.length === 0 && blockingIssues.length > 0) {
    issues.push('No viable eviction routes currently available');
    score = Math.min(score, 40); // Cap at 40 if no routes available
  } else if (recommendedRoutes.length > 0) {
    strengths.push(`${recommendedRoutes.length} viable route(s): ${recommendedRoutes.join(', ')}`);
  }

  // Check ground success probabilities (from decision engine)
  const highProbabilityGrounds = decisionOutput.recommended_grounds.filter(
    (g) => (g.success_probability || 0) >= 0.8
  );
  if (highProbabilityGrounds.length > 0) {
    strengths.push(
      `${highProbabilityGrounds.length} ground(s) with high success probability (≥80%)`
    );
    score += 5; // Small bonus for high probability grounds
  }

  // Check pre-action requirements (Scotland specific, from decision engine)
  if (decisionOutput.pre_action_requirements && decisionOutput.pre_action_requirements.length > 0) {
    const unmetRequirements = decisionOutput.pre_action_requirements.filter(
      (req) => req.status === 'not_met'
    );
    if (unmetRequirements.length > 0) {
      issues.push(`${unmetRequirements.length} pre-action requirement(s) not met`);
      score -= unmetRequirements.length * 15;
    } else {
      strengths.push('All pre-action requirements met');
    }
  }

  // Final adjustments
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_WEIGHTS.legal_eligibility,
    notes,
    issues,
    strengths,
  };
}

/**
 * Score evidence completeness
 */
function scoreEvidence(
  evidenceAnalysis: EvidenceAnalysis,
  _decisionOutput: DecisionOutput
): ComponentScore {
  const score = evidenceAnalysis.completeness_score;
  const notes: string[] = [];
  const issues: string[] = [];
  const strengths: string[] = [];

  // Count evidence items by category
  const categoryCounts = Object.entries(evidenceAnalysis.summary).reduce(
    (acc, [category, items]) => {
      acc[category] = items.length;
      return acc;
    },
    {} as { [key: string]: number }
  );

  // Check for strong evidence
  const strongEvidence = Object.values(evidenceAnalysis.summary)
    .flat()
    .filter((item) => item.quality === 'strong');

  if (strongEvidence.length > 0) {
    strengths.push(`${strongEvidence.length} strong evidence item(s)`);
  }

  // Report evidence by category
  if (categoryCounts.arrears > 0) {
    strengths.push(`${categoryCounts.arrears} arrears evidence item(s)`);
  }
  if (categoryCounts.asb > 0) {
    strengths.push(`${categoryCounts.asb} ASB evidence item(s)`);
  }
  if (categoryCounts.compliance > 0) {
    strengths.push(`${categoryCounts.compliance} compliance evidence item(s)`);
  }

  // Check missing evidence
  const criticalMissing = evidenceAnalysis.missing_evidence.filter(
    (m) => m.priority === 'critical'
  );
  const recommendedMissing = evidenceAnalysis.missing_evidence.filter(
    (m) => m.priority === 'recommended'
  );

  if (criticalMissing.length > 0) {
    issues.push(`${criticalMissing.length} CRITICAL evidence item(s) missing`);
    for (const missing of criticalMissing.slice(0, 3)) {
      // Show first 3
      issues.push(`Missing: ${missing.item} (${missing.reason})`);
    }
  }

  if (recommendedMissing.length > 0) {
    notes.push(`${recommendedMissing.length} recommended evidence item(s) could strengthen case`);
  }

  // Check timeline completeness
  if (evidenceAnalysis.extracted_timeline.length > 0) {
    strengths.push(`${evidenceAnalysis.extracted_timeline.length} timeline events documented`);
  } else {
    issues.push('No timeline events extracted from evidence');
  }

  return {
    score,
    weight: DEFAULT_WEIGHTS.evidence,
    notes,
    issues,
    strengths,
  };
}

/**
 * Score consistency
 */
function scoreConsistency(consistencyReport: ConsistencyReport): ComponentScore {
  const score = consistencyReport.score;
  const notes: string[] = [];
  const issues: string[] = [];
  const strengths: string[] = [];

  notes.push(`Overall consistency: ${consistencyReport.rating}`);

  // Check critical inconsistencies
  const critical = consistencyReport.inconsistencies.filter((i) => i.severity === 'critical');
  const warnings = consistencyReport.inconsistencies.filter((i) => i.severity === 'warning');

  if (critical.length > 0) {
    issues.push(`${critical.length} CRITICAL inconsistency/inconsistencies found`);
    for (const issue of critical.slice(0, 3)) {
      issues.push(`${issue.category}: ${issue.message}`);
    }
  } else {
    strengths.push('No critical inconsistencies');
  }

  if (warnings.length > 0) {
    notes.push(`${warnings.length} warning(s) found`);
    for (const warning of warnings.slice(0, 2)) {
      notes.push(`${warning.category}: ${warning.message}`);
    }
  }

  // Check data gaps
  const highPriorityGaps = consistencyReport.data_gaps.filter((g) => g.priority === 'high');
  if (highPriorityGaps.length > 0) {
    issues.push(`${highPriorityGaps.length} high-priority data gap(s)`);
  }

  if (consistencyReport.inconsistencies.length === 0 && consistencyReport.data_gaps.length === 0) {
    strengths.push('All data is consistent and complete');
  }

  return {
    score,
    weight: DEFAULT_WEIGHTS.consistency,
    notes,
    issues,
    strengths,
  };
}

/**
 * Score procedural validity
 */
function scoreProcedure(facts: CaseFacts, _decisionOutput: DecisionOutput): ComponentScore {
  let score = 100;
  const notes: string[] = [];
  const issues: string[] = [];
  const strengths: string[] = [];

  // Check notice service details
  if (!facts.notice.service_date) {
    issues.push('Notice service date not recorded');
    score -= 20;
  } else {
    strengths.push('Notice service date recorded');
  }

  if (!facts.notice.service_method) {
    issues.push('Notice service method not recorded');
    score -= 10;
  } else {
    strengths.push(`Notice served by: ${facts.notice.service_method}`);
  }

  if (!facts.notice.expiry_date) {
    issues.push('Notice expiry date not recorded');
    score -= 15;
  } else {
    strengths.push('Notice expiry date recorded');

    // Check if notice has expired
    const now = new Date().toISOString().split('T')[0];
    if (facts.notice.expiry_date <= now) {
      strengths.push('Notice period has expired - can proceed to court/tribunal');
    } else {
      notes.push(`Notice expires on ${facts.notice.expiry_date} - wait before applying`);
      score -= 5;
    }
  }

  // Check notice period adequacy (from decision engine warnings)
  const noticePeriodWarnings = decisionOutput.warnings.filter((w) =>
    w.toLowerCase().includes('notice period')
  );
  if (noticePeriodWarnings.length > 0) {
    for (const warning of noticePeriodWarnings) {
      issues.push(warning);
    }
    score -= 15;
  }

  // Check service method validity
  const validServiceMethods = ['hand', 'post', 'email', 'courier', 'bailiff'];
  if (facts.notice.service_method && validServiceMethods.includes(facts.notice.service_method)) {
    strengths.push('Service method is recognized');
  } else if (facts.notice.service_method) {
    notes.push(`Non-standard service method: ${facts.notice.service_method}`);
  }

  // Check who served
  if (facts.notice.served_by) {
    strengths.push(`Notice served by: ${facts.notice.served_by}`);
  }

  // Check procedural warnings from decision engine
  const proceduralWarnings = decisionOutput.warnings.filter(
    (w) =>
      w.toLowerCase().includes('notice') ||
      w.toLowerCase().includes('service') ||
      w.toLowerCase().includes('procedure')
  );

  for (const warning of proceduralWarnings) {
    if (!noticePeriodWarnings.includes(warning)) {
      // Avoid duplicates
      notes.push(warning);
      score -= 5;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_WEIGHTS.procedure,
    notes,
    issues,
    strengths,
  };
}
