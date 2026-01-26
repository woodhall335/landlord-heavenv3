/**
 * Legal Impact Analyzer
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * Maps legal change events to impacted rule IDs, products, and routes.
 * Produces both machine-readable JSON and human-readable summaries.
 */

import {
  LegalChangeEvent,
  ImpactAssessment,
  ChangeSeverity,
  ConfidenceLevel,
  setImpactAssessment,
} from './legal-change-events';
import { LegalTopic, Jurisdiction } from './legal-source-registry';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rule impact mapping configuration.
 */
export interface RuleImpactMapping {
  ruleId: string;
  ruleName: string;
  jurisdiction: Jurisdiction;
  product: string;
  route: string;
  topics: LegalTopic[];
  keywords: string[];
  legalReferences: string[];
}

/**
 * Impact analysis result.
 */
export interface ImpactAnalysisResult {
  eventId: string;
  analyzedAt: string;

  // Matched rules
  impactedRules: ImpactedRule[];

  // Aggregated impacts
  impactedProducts: string[];
  impactedRoutes: string[];
  impactedJurisdictions: Jurisdiction[];

  // Severity assessment
  suggestedSeverity: ChangeSeverity;
  severityRationale: string;

  // Confidence
  overallConfidence: ConfidenceLevel;

  // Human-readable summary
  humanSummary: string;

  // Action recommendations
  recommendations: string[];
}

/**
 * Details of an impacted rule.
 */
export interface ImpactedRule {
  ruleId: string;
  ruleName: string;
  matchReason: string;
  matchScore: number; // 0-100
  matchedKeywords: string[];
  matchedLegalRefs: string[];
  potentialChange: 'condition' | 'message' | 'severity' | 'removal' | 'addition' | 'unknown';
}

// ============================================================================
// RULE IMPACT MAPPINGS
// ============================================================================

/**
 * Comprehensive mapping of rules to their legal topics and keywords.
 */
const RULE_IMPACT_MAPPINGS: RuleImpactMapping[] = [
  // -------------------------------------------------------------------------
  // ENGLAND S21 RULES
  // -------------------------------------------------------------------------
  {
    ruleId: 's21_deposit_not_protected',
    ruleName: 'Deposit Not Protected',
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_21',
    topics: ['deposit_protection', 'eviction'],
    keywords: ['deposit', 'protection', 'scheme', 'TDS', 'DPS', 'mydeposits', 'prescribed information'],
    legalReferences: ['Housing Act 2004', 'Section 213', 'Section 214', 'Section 215'],
  },
  {
    ruleId: 's21_deposit_cap_exceeded',
    ruleName: 'Deposit Cap Exceeded',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['deposit_protection', 'tenant_fees'],
    keywords: ['deposit cap', 'five weeks', 'six weeks', 'Tenant Fees Act', 'maximum deposit'],
    legalReferences: ['Tenant Fees Act 2019', 'Section 3'],
  },
  {
    ruleId: 's21_four_month_bar',
    ruleName: 'Four Month Bar',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['notice_requirements', 'eviction'],
    keywords: ['four month', '4 month', 'first four months', 'restriction'],
    legalReferences: ['Housing Act 1988', 'Section 21(4B)'],
  },
  {
    ruleId: 's21_notice_period_short',
    ruleName: 'Notice Period Too Short',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['notice_requirements', 'eviction'],
    keywords: ['two months', '2 months', 'notice period', 'expiry date'],
    legalReferences: ['Housing Act 1988', 'Section 21(1)', 'Section 21(4)'],
  },
  {
    ruleId: 's21_gas_cert_missing',
    ruleName: 'Gas Safety Certificate Missing',
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_21',
    topics: ['safety_certificates', 'eviction'],
    keywords: ['gas safety', 'gas certificate', 'CP12', 'Gas Safe', 'annual check'],
    legalReferences: ['Gas Safety Regulations 1998', 'Regulation 36'],
  },
  {
    ruleId: 's21_epc_missing',
    ruleName: 'EPC Missing',
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_21',
    topics: ['energy_performance', 'eviction'],
    keywords: ['EPC', 'energy performance', 'energy certificate', 'MEES'],
    legalReferences: ['Energy Performance of Buildings Regulations 2012'],
  },
  {
    ruleId: 's21_licensing_required_not_licensed',
    ruleName: 'Licensing Required But Not Licensed',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['licensing', 'eviction'],
    keywords: ['selective licensing', 'additional licensing', 'HMO', 'licence'],
    legalReferences: ['Housing Act 2004', 'Part 2', 'Part 3'],
  },
  {
    ruleId: 's21_retaliatory_improvement_notice',
    ruleName: 'Retaliatory Eviction - Improvement Notice',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['retaliatory_eviction', 'eviction'],
    keywords: ['improvement notice', 'retaliatory', 'relevant notice', 'complaint'],
    legalReferences: ['Deregulation Act 2015', 'Section 33'],
  },
  {
    ruleId: 's21_retaliatory_emergency_action',
    ruleName: 'Retaliatory Eviction - Emergency Action',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
    topics: ['retaliatory_eviction', 'eviction'],
    keywords: ['emergency remedial', 'emergency action', 'retaliatory', 'relevant notice'],
    legalReferences: ['Deregulation Act 2015', 'Section 33'],
  },

  // -------------------------------------------------------------------------
  // ENGLAND S8 RULES
  // -------------------------------------------------------------------------
  {
    ruleId: 's8_notice_period_short',
    ruleName: 'S8 Notice Period Too Short',
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_8',
    topics: ['notice_requirements', 'eviction'],
    keywords: ['notice period', 'Ground', 'two weeks', 'four weeks', 'two months'],
    legalReferences: ['Housing Act 1988', 'Section 8', 'Schedule 2'],
  },

  // -------------------------------------------------------------------------
  // WALES S173 RULES
  // -------------------------------------------------------------------------
  {
    ruleId: 's173_deposit_not_protected',
    ruleName: 'Deposit Not Protected (Wales)',
    jurisdiction: 'wales',
    product: 'notice_only',
    route: 'section_173',
    topics: ['deposit_protection', 'eviction'],
    keywords: ['deposit', 'protection', 'scheme', 'Wales'],
    legalReferences: ['Renting Homes (Wales) Act 2016', 'Section 45'],
  },
  {
    ruleId: 's173_notice_period_short',
    ruleName: 'Notice Period Too Short (Wales)',
    jurisdiction: 'wales',
    product: 'notice_only',
    route: 'section_173',
    topics: ['notice_requirements', 'eviction'],
    keywords: ['six months', '6 months', 'notice period', 'Wales'],
    legalReferences: ['Renting Homes (Wales) Act 2016', 'Section 173'],
  },
  {
    ruleId: 's173_written_statement_missing',
    ruleName: 'Written Statement Missing (Wales)',
    jurisdiction: 'wales',
    product: 'notice_only',
    route: 'section_173',
    topics: ['tenancy', 'eviction'],
    keywords: ['written statement', 'occupation contract', 'Wales'],
    legalReferences: ['Renting Homes (Wales) Act 2016', 'Section 31'],
  },

  // -------------------------------------------------------------------------
  // SCOTLAND NTL RULES
  // -------------------------------------------------------------------------
  {
    ruleId: 'ntl_landlord_not_registered',
    ruleName: 'Landlord Not Registered (Scotland)',
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
    topics: ['registration', 'eviction'],
    keywords: ['landlord registration', 'registered', 'Scotland', 'register'],
    legalReferences: ['Antisocial Behaviour etc (Scotland) Act 2004', 'Part 8'],
  },
  {
    ruleId: 'ntl_deposit_not_protected',
    ruleName: 'Deposit Not Protected (Scotland)',
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
    topics: ['deposit_protection', 'eviction'],
    keywords: ['deposit', 'protection', 'scheme', 'Scotland', 'tenancy deposit'],
    legalReferences: ['Tenancy Deposit Schemes (Scotland) Regulations 2011'],
  },
  {
    ruleId: 'ntl_pre_action_letter_not_sent',
    ruleName: 'Pre-Action Letter Not Sent',
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
    topics: ['pre_action_protocol', 'eviction'],
    keywords: ['pre-action', 'pre action', 'letter', 'Ground 1', 'arrears'],
    legalReferences: ['Pre-Action Requirements (Scotland) Act 2016'],
  },
  {
    ruleId: 'ntl_pre_action_signposting_missing',
    ruleName: 'Pre-Action Signposting Missing',
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
    topics: ['pre_action_protocol', 'eviction'],
    keywords: ['signposting', 'debt advice', 'housing support', 'pre-action'],
    legalReferences: ['Pre-Action Requirements (Scotland) Act 2016'],
  },
  {
    ruleId: 'ntl_ground_1_arrears_threshold',
    ruleName: 'Ground 1 Arrears Threshold',
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
    topics: ['rent', 'eviction'],
    keywords: ['arrears', 'three months', '3 months', 'Ground 1', 'rent arrears'],
    legalReferences: ['Private Housing (Tenancies) (Scotland) Act 2016', 'Schedule 3'],
  },
];

// ============================================================================
// IMPACT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze a legal change event for impact.
 */
export function analyzeImpact(event: LegalChangeEvent): ImpactAnalysisResult {
  const impactedRules: ImpactedRule[] = [];
  const impactedProductsSet = new Set<string>();
  const impactedRoutesSet = new Set<string>();
  const impactedJurisdictionsSet = new Set<Jurisdiction>();

  // Content to search
  const searchContent = [
    event.title,
    event.summary,
    event.diffSummary ?? '',
    event.extractedNotes ?? '',
  ]
    .join(' ')
    .toLowerCase();

  // Check each rule mapping
  for (const mapping of RULE_IMPACT_MAPPINGS) {
    // Check jurisdiction match
    if (!event.jurisdictions.some((j) => j === mapping.jurisdiction || j === 'uk_wide')) {
      continue;
    }

    // Check topic match
    const topicMatch = event.topics.some((t) => mapping.topics.includes(t));

    // Check keyword matches
    const matchedKeywords: string[] = [];
    for (const keyword of mapping.keywords) {
      if (searchContent.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    // Check legal reference matches
    const matchedLegalRefs: string[] = [];
    for (const ref of mapping.legalReferences) {
      if (searchContent.includes(ref.toLowerCase())) {
        matchedLegalRefs.push(ref);
      }
    }

    // Calculate match score
    const keywordScore = (matchedKeywords.length / mapping.keywords.length) * 40;
    const legalRefScore = (matchedLegalRefs.length / mapping.legalReferences.length) * 40;
    const topicScore = topicMatch ? 20 : 0;
    const matchScore = Math.round(keywordScore + legalRefScore + topicScore);

    // Include if score is above threshold
    if (matchScore >= 20) {
      const matchReasons: string[] = [];
      if (topicMatch) matchReasons.push('topic match');
      if (matchedKeywords.length > 0) matchReasons.push(`${matchedKeywords.length} keyword(s)`);
      if (matchedLegalRefs.length > 0) matchReasons.push(`${matchedLegalRefs.length} legal ref(s)`);

      impactedRules.push({
        ruleId: mapping.ruleId,
        ruleName: mapping.ruleName,
        matchReason: matchReasons.join(', '),
        matchScore,
        matchedKeywords,
        matchedLegalRefs,
        potentialChange: determinePotentialChange(searchContent, mapping),
      });

      impactedProductsSet.add(mapping.product);
      impactedRoutesSet.add(mapping.route);
      impactedJurisdictionsSet.add(mapping.jurisdiction);
    }
  }

  // Sort by match score descending
  impactedRules.sort((a, b) => b.matchScore - a.matchScore);

  // Determine severity
  const { severity, rationale } = determineSeverity(event, impactedRules);

  // Determine overall confidence
  const confidence = determineConfidence(event, impactedRules);

  // Generate human summary
  const humanSummary = generateHumanSummary(event, impactedRules, severity);

  // Generate recommendations
  const recommendations = generateRecommendations(event, impactedRules, severity);

  return {
    eventId: event.id,
    analyzedAt: new Date().toISOString(),
    impactedRules,
    impactedProducts: Array.from(impactedProductsSet),
    impactedRoutes: Array.from(impactedRoutesSet),
    impactedJurisdictions: Array.from(impactedJurisdictionsSet),
    suggestedSeverity: severity,
    severityRationale: rationale,
    overallConfidence: confidence,
    humanSummary,
    recommendations,
  };
}

/**
 * Determine what type of change might be needed.
 */
function determinePotentialChange(
  content: string,
  _mapping: RuleImpactMapping
): ImpactedRule['potentialChange'] {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('repeal') || lowerContent.includes('abolish') || lowerContent.includes('remove')) {
    return 'removal';
  }
  if (lowerContent.includes('new requirement') || lowerContent.includes('introduce') || lowerContent.includes('new rule')) {
    return 'addition';
  }
  if (lowerContent.includes('period') || lowerContent.includes('threshold') || lowerContent.includes('amount') || lowerContent.includes('days')) {
    return 'condition';
  }
  if (lowerContent.includes('clarif') || lowerContent.includes('guidance') || lowerContent.includes('interpret')) {
    return 'message';
  }
  if (lowerContent.includes('enforcement') || lowerContent.includes('penalty') || lowerContent.includes('sanction')) {
    return 'severity';
  }

  return 'unknown';
}

/**
 * Determine the severity of a change.
 */
function determineSeverity(
  event: LegalChangeEvent,
  impactedRules: ImpactedRule[]
): { severity: ChangeSeverity; rationale: string } {
  const content = [event.title, event.summary, event.diffSummary ?? ''].join(' ').toLowerCase();

  // Check for emergency indicators
  if (
    content.includes('immediate') ||
    content.includes('urgent') ||
    content.includes('emergency') ||
    content.includes('critical')
  ) {
    return {
      severity: 'emergency',
      rationale: 'Content indicates urgent/immediate action required',
    };
  }

  // Check for legal critical indicators
  const hasHighScoreRules = impactedRules.some((r) => r.matchScore >= 60);
  const hasConditionChange = impactedRules.some((r) => r.potentialChange === 'condition');
  const hasRemoval = impactedRules.some((r) => r.potentialChange === 'removal');
  const hasAddition = impactedRules.some((r) => r.potentialChange === 'addition');

  if (hasHighScoreRules && (hasConditionChange || hasRemoval || hasAddition)) {
    return {
      severity: 'legal_critical',
      rationale: `High-confidence match with ${hasConditionChange ? 'condition' : hasRemoval ? 'removal' : 'addition'} change type`,
    };
  }

  // Check for behavioral indicators
  if (impactedRules.length > 0 && impactedRules.some((r) => r.matchScore >= 40)) {
    return {
      severity: 'behavioral',
      rationale: 'Moderate-confidence match suggesting behavioral change',
    };
  }

  // Default to clarification
  return {
    severity: 'clarification',
    rationale: impactedRules.length > 0
      ? 'Low-confidence matches suggest clarification only'
      : 'No direct rule matches found',
  };
}

/**
 * Determine confidence level in the analysis.
 */
function determineConfidence(
  event: LegalChangeEvent,
  impactedRules: ImpactedRule[]
): ConfidenceLevel {
  // Trust level affects confidence
  let trustBonus = 0;
  switch (event.trustLevel) {
    case 'authoritative':
      trustBonus = 20;
      break;
    case 'official':
      trustBonus = 10;
      break;
    case 'secondary':
      trustBonus = 0;
      break;
    case 'informational':
      trustBonus = -10;
      break;
  }

  // Average match score
  const avgMatchScore =
    impactedRules.length > 0
      ? impactedRules.reduce((sum, r) => sum + r.matchScore, 0) / impactedRules.length
      : 0;

  const totalScore = avgMatchScore + trustBonus;

  if (totalScore >= 70) return 'high';
  if (totalScore >= 50) return 'medium';
  if (totalScore >= 30) return 'low';
  return 'unverified';
}

/**
 * Generate a human-readable summary.
 */
function generateHumanSummary(
  event: LegalChangeEvent,
  impactedRules: ImpactedRule[],
  severity: ChangeSeverity
): string {
  const lines: string[] = [];

  lines.push(`## Impact Analysis: ${event.title}`);
  lines.push('');
  lines.push(`**Source**: ${event.sourceName}`);
  lines.push(`**Jurisdictions**: ${event.jurisdictions.join(', ')}`);
  lines.push(`**Severity**: ${severity.toUpperCase().replace('_', ' ')}`);
  lines.push('');

  if (impactedRules.length === 0) {
    lines.push('### No Direct Rule Impacts Identified');
    lines.push('');
    lines.push('This change may not directly affect existing validation rules,');
    lines.push('but should be reviewed for indirect impacts.');
  } else {
    lines.push(`### ${impactedRules.length} Rule(s) Potentially Impacted`);
    lines.push('');

    for (const rule of impactedRules.slice(0, 5)) {
      lines.push(`- **${rule.ruleId}** (${rule.ruleName})`);
      lines.push(`  - Match score: ${rule.matchScore}%`);
      lines.push(`  - Reason: ${rule.matchReason}`);
      lines.push(`  - Potential change: ${rule.potentialChange}`);
    }

    if (impactedRules.length > 5) {
      lines.push(`- ... and ${impactedRules.length - 5} more rule(s)`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate action recommendations.
 */
function generateRecommendations(
  event: LegalChangeEvent,
  impactedRules: ImpactedRule[],
  severity: ChangeSeverity
): string[] {
  const recommendations: string[] = [];

  // Severity-based recommendations
  switch (severity) {
    case 'emergency':
      recommendations.push('URGENT: Review immediately and consider emergency suppression if needed');
      recommendations.push('Notify on-call engineer and product lead');
      break;
    case 'legal_critical':
      recommendations.push('Schedule legal review within 48 hours');
      recommendations.push('Create PR with rule updates for affected rules');
      recommendations.push('Update Phase 16 message catalog if needed');
      break;
    case 'behavioral':
      recommendations.push('Review affected rules for accuracy');
      recommendations.push('Consider updating help content and messages');
      break;
    case 'clarification':
      recommendations.push('Review for documentation updates');
      recommendations.push('No immediate rule changes likely needed');
      break;
  }

  // Rule-specific recommendations
  if (impactedRules.some((r) => r.potentialChange === 'condition')) {
    recommendations.push('Verify condition thresholds (dates, amounts, periods) match new requirements');
  }
  if (impactedRules.some((r) => r.potentialChange === 'removal')) {
    recommendations.push('Verify if rule should be deprecated or removed');
  }
  if (impactedRules.some((r) => r.potentialChange === 'addition')) {
    recommendations.push('Consider adding new validation rule');
  }

  // Trust-based recommendations
  if (event.trustLevel === 'informational') {
    recommendations.push('Verify with authoritative source before taking action');
  }

  return recommendations;
}

/**
 * Analyze and update event with impact assessment.
 */
export function analyzeAndAssess(
  event: LegalChangeEvent,
  assessedBy: string
): ImpactAssessment {
  const analysis = analyzeImpact(event);

  // Determine required reviewers based on severity and jurisdiction
  const reviewers: string[] = [];
  if (analysis.suggestedSeverity === 'legal_critical' || analysis.suggestedSeverity === 'emergency') {
    reviewers.push('@legal-team');
    reviewers.push('@validation-team');
  }
  if (analysis.suggestedSeverity === 'behavioral') {
    reviewers.push('@product-team');
    reviewers.push('@validation-team');
  }
  for (const jurisdiction of analysis.impactedJurisdictions) {
    reviewers.push(`@legal-${jurisdiction}`);
  }

  const assessment: ImpactAssessment = {
    assessedAt: new Date().toISOString(),
    assessedBy,
    severity: analysis.suggestedSeverity,
    severityRationale: analysis.severityRationale,
    impactedRuleIds: analysis.impactedRules.map((r) => r.ruleId),
    impactedProducts: analysis.impactedProducts,
    impactedRoutes: analysis.impactedRoutes,
    requiresRuleChange: analysis.impactedRules.some(
      (r) => r.potentialChange === 'condition' || r.potentialChange === 'removal'
    ),
    requiresMessageUpdate: analysis.impactedRules.some((r) => r.potentialChange === 'message'),
    requiresDocUpdate: true, // Always review docs
    requiresUrgentAction: analysis.suggestedSeverity === 'emergency',
    requiredReviewers: [...new Set(reviewers)],
    humanSummary: analysis.humanSummary,
    machineSummary: {
      ruleCount: analysis.impactedRules.length,
      productCount: analysis.impactedProducts.length,
      routeCount: analysis.impactedRoutes.length,
    },
  };

  // Update event with assessment
  setImpactAssessment(event.id, assessment);

  return assessment;
}

/**
 * Get all rule mappings (for testing/debugging).
 */
export function getRuleMappings(): RuleImpactMapping[] {
  return [...RULE_IMPACT_MAPPINGS];
}

/**
 * Find mappings for a specific rule ID.
 */
export function getMappingForRule(ruleId: string): RuleImpactMapping | undefined {
  return RULE_IMPACT_MAPPINGS.find((m) => m.ruleId === ruleId);
}

/**
 * Get all rules for a jurisdiction.
 */
export function getRulesForJurisdiction(jurisdiction: Jurisdiction): RuleImpactMapping[] {
  return RULE_IMPACT_MAPPINGS.filter((m) => m.jurisdiction === jurisdiction);
}

/**
 * Get all rules for a topic.
 */
export function getRulesForTopic(topic: LegalTopic): RuleImpactMapping[] {
  return RULE_IMPACT_MAPPINGS.filter((m) => m.topics.includes(topic));
}
