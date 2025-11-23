/**
 * Decision Engine - Core Logic
 *
 * Analyzes case facts and recommends eviction grounds, compliance checks, and timelines
 */

import {
  CaseFacts,
  DecisionResult,
  GroundRecommendation,
  Section21Recommendation,
  ComplianceCheck,
  RedFlag,
  TimelineEstimate,
  CostEstimate,
  SuccessProbability,
  Severity,
} from './types';
import {
  loadDecisionEngine,
  getGroundDefinitions,
  getSection21Requirements,
  getSection21RedFlags,
  getTypicalTimelines,
  getCostEstimates,
} from './config-loader';

// ============================================================================
// MAIN ENGINE
// ============================================================================

/**
 * Analyze a case and return comprehensive recommendations
 */
export async function analyzeCase(facts: CaseFacts): Promise<DecisionResult> {
  const jurisdiction = normalizeJurisdiction(facts.jurisdiction);

  if (jurisdiction === 'northern-ireland') {
    throw new Error('Decision engine does not support Northern Ireland eviction or money claim analysis');
  }

  // Load configuration
  const engineRules = loadDecisionEngine(jurisdiction);
  const groundDefs = getGroundDefinitions(jurisdiction);

  // Match rules to find applicable grounds
  const matchedRules = matchRules(facts, engineRules.rules);

  // Build ground recommendations
  const primaryGrounds: GroundRecommendation[] = [];
  const backupGrounds: GroundRecommendation[] = [];

  matchedRules.forEach((rule) => {
    if (rule.recommended_grounds?.primary) {
      rule.recommended_grounds.primary.forEach((groundNum) => {
        const def = groundDefs.get(groundNum);
        if (def) {
          primaryGrounds.push(buildGroundRecommendation(groundNum, def, facts, rule));
        }
      });
    }

    if (rule.recommended_grounds?.backup) {
      rule.recommended_grounds.backup.forEach((groundNum) => {
        const def = groundDefs.get(groundNum);
        if (def && !primaryGrounds.find((g) => g.ground_number === groundNum)) {
          backupGrounds.push(buildGroundRecommendation(groundNum, def, facts, rule));
        }
      });
    }
  });

  // Check Section 21 eligibility
  const section21 = checkSection21Eligibility(facts, jurisdiction);

  // Detect red flags
  const redFlags = detectRedFlags(facts, jurisdiction);

  // Run compliance checks
  const complianceChecks = runComplianceChecks(facts, jurisdiction);

  // Determine recommended route
  const recommendedRoute = determineRecommendedRoute(
    primaryGrounds,
    section21,
    redFlags,
    facts
  );

  // Calculate risk level
  const overallRiskLevel = calculateRiskLevel(redFlags, complianceChecks);

  // Estimate timeline
  const timeline = estimateTimeline(recommendedRoute, primaryGrounds, section21, jurisdiction);

  // Estimate costs
  const costs = estimateCosts(facts, jurisdiction);

  // Generate summary and next steps
  const summary = generateSummary(recommendedRoute, primaryGrounds, section21, facts);
  const nextSteps = generateNextSteps(recommendedRoute, primaryGrounds, section21, redFlags, facts);
  const warnings = generateWarnings(redFlags, complianceChecks);

  return {
    recommended_route: recommendedRoute,
    primary_grounds: primaryGrounds,
    backup_grounds: backupGrounds,
    section_21: section21,
    compliance_checks: complianceChecks,
    red_flags: redFlags,
    overall_risk_level: overallRiskLevel,
    timeline,
    costs,
    summary,
    next_steps: nextSteps,
    warnings,
  };
}

// ============================================================================
// RULE MATCHING
// ============================================================================

/**
 * Match case facts against decision rules
 */
function matchRules(facts: CaseFacts, rules: any[]): any[] {
  return rules
    .filter((rule) => evaluateConditions(facts, rule.conditions))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Evaluate rule conditions against case facts
 */
function evaluateConditions(facts: CaseFacts, conditions: Record<string, any>): boolean {
  return Object.entries(conditions).every(([key, expectedValue]) => {
    const actualValue = facts[key];

    // Handle different condition formats
    if (typeof expectedValue === 'string') {
      // Range checks: ">= 2_months", "< 1_month"
      if (expectedValue.startsWith('>=')) {
        const threshold = parseValue(expectedValue.substring(2).trim());
        return parseValue(actualValue) >= threshold;
      }
      if (expectedValue.startsWith('>')) {
        const threshold = parseValue(expectedValue.substring(1).trim());
        return parseValue(actualValue) > threshold;
      }
      if (expectedValue.startsWith('<=')) {
        const threshold = parseValue(expectedValue.substring(2).trim());
        return parseValue(actualValue) <= threshold;
      }
      if (expectedValue.startsWith('<')) {
        const threshold = parseValue(expectedValue.substring(1).trim());
        return parseValue(actualValue) < threshold;
      }

      // Exact match
      return actualValue === expectedValue;
    }

    // Array contains
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(actualValue);
    }

    // Boolean
    if (typeof expectedValue === 'boolean') {
      return actualValue === expectedValue;
    }

    // Direct equality
    return actualValue === expectedValue;
  });
}

/**
 * Parse value from string (handles "2_months", "1_month", etc.)
 */
function parseValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  // Handle formats like "2_months", "8_weeks"
  const match = value.match(/(\d+)(?:_months?|_weeks?)?/);
  if (match) {
    return parseInt(match[1]);
  }

  return parseFloat(value) || 0;
}

// ============================================================================
// GROUND RECOMMENDATIONS
// ============================================================================

/**
 * Build a ground recommendation from definition and rule
 */
function buildGroundRecommendation(
  groundNumber: number,
  definition: any,
  facts: CaseFacts,
  rule: any
): GroundRecommendation {
  const successProb = mapSuccessProbability(rule.success_probability || definition.success_probability);

  return {
    ground_number: groundNumber,
    title: definition.title,
    type: definition.court_type,
    success_probability: successProb,
    notice_period_days: definition.notice_period_days,
    reasoning: rule.reasoning || `Based on case facts, Ground ${groundNumber} applies.`,
    required_evidence: getRequiredEvidence(groundNumber, facts),
    statute: definition.statute,
    red_flags: detectGroundSpecificRedFlags(groundNumber, facts),
  };
}

/**
 * Map success probability from string to enum
 */
function mapSuccessProbability(prob: string | number): SuccessProbability {
  if (typeof prob === 'number') {
    if (prob >= 90) return 'very_high';
    if (prob >= 75) return 'high';
    if (prob >= 50) return 'medium';
    return 'low';
  }

  const probLower = prob.toLowerCase();
  if (probLower.includes('very') || probLower.includes('high')) return 'very_high';
  if (probLower === 'high') return 'high';
  if (probLower === 'medium') return 'medium';
  if (probLower === 'low') return 'low';
  return 'none';
}

/**
 * Get required evidence for a ground
 */
function getRequiredEvidence(groundNumber: number, facts: CaseFacts): string[] {
  const evidence: string[] = [];

  switch (groundNumber) {
    case 8:
    case 10:
      evidence.push('Tenancy agreement');
      evidence.push('Rent payment records');
      evidence.push('Bank statements showing rent payments');
      evidence.push('Rent arrears statement');
      break;
    case 11:
      evidence.push('Rent payment history showing pattern of late payments');
      evidence.push('Dates and amounts of each late payment');
      break;
    case 12:
      evidence.push('Tenancy agreement showing clause breached');
      evidence.push('Evidence of the breach (photos, correspondence, etc.)');
      evidence.push('Warnings given to tenant');
      break;
    case 13:
      evidence.push('Inventory from start of tenancy');
      evidence.push('Photos showing current deterioration');
      evidence.push('Repair estimates');
      break;
    case 14:
      evidence.push('Witness statements from neighbors');
      evidence.push('Diary of incidents');
      evidence.push('Police reports or crime reference numbers');
      evidence.push('Council noise complaint records');
      break;
    default:
      evidence.push('Tenancy agreement');
      evidence.push('Supporting documentation');
  }

  return evidence;
}

/**
 * Detect ground-specific red flags
 */
function detectGroundSpecificRedFlags(groundNumber: number, facts: CaseFacts): RedFlag[] {
  const flags: RedFlag[] = [];

  // Ground 1 red flags
  if (groundNumber === 1 && !facts.notice_given_at_start) {
    flags.push({
      name: 'No Ground 1 notice given',
      severity: 'critical',
      description: 'Ground 1 requires written notice to have been given before/at start of tenancy',
      consequence: 'Ground 1 cannot be used unless court exercises discretion to dispense with notice requirement',
      action_required: 'Consider using different ground or apply for court to dispense with notice requirement',
    });
  }

  // Ground 8 red flags
  if (groundNumber === 8) {
    const monthlyRent = facts.rent_amount_monthly || 0;
    const threshold = monthlyRent * 2;
    const currentArrears = facts.current_arrears_amount || 0;

    if (currentArrears < threshold) {
      flags.push({
        name: 'Arrears below Ground 8 threshold',
        severity: 'critical',
        description: `Current arrears (£${currentArrears}) below 2 months rent (£${threshold})`,
        consequence: 'Ground 8 will fail if arrears drop below threshold before hearing',
        action_required: 'Ensure arrears remain above threshold, or use Ground 10 as backup',
      });
    }
  }

  return flags;
}

// ============================================================================
// SECTION 21 CHECKING
// ============================================================================

/**
 * Check Section 21 eligibility
 */
function checkSection21Eligibility(facts: CaseFacts, jurisdiction: string): Section21Recommendation {
  const requirements = getSection21Requirements(jurisdiction);
  const redFlagDefs = getSection21RedFlags(jurisdiction);

  const complianceChecks: ComplianceCheck[] = [];
  const redFlags: RedFlag[] = [];

  // Deposit protection
  complianceChecks.push({
    requirement: 'Deposit Protection',
    description: 'Deposit must be protected in government-approved scheme within 30 days',
    status: facts.deposit_protected ? 'pass' : 'fail',
    severity: facts.deposit_protected ? 'info' : 'critical',
    consequence: facts.deposit_protected
      ? undefined
      : 'Section 21 invalid. Tenant can claim 1-3x deposit.',
    action_required: facts.deposit_protected ? undefined : 'Protect deposit immediately',
  });

  // Prescribed information
  complianceChecks.push({
    requirement: 'Prescribed Information',
    description: 'Tenant must have been given prescribed information within 30 days',
    status: facts.prescribed_info_given ? 'pass' : 'fail',
    severity: facts.prescribed_info_given ? 'info' : 'critical',
    consequence: facts.prescribed_info_given ? undefined : 'Section 21 invalid',
    action_required: facts.prescribed_info_given ? undefined : 'Cannot use Section 21',
  });

  // Gas safety
  const hasGas = facts.gas_safety_provided !== undefined;
  if (hasGas) {
    complianceChecks.push({
      requirement: 'Gas Safety Certificate',
      description: 'Gas Safety Certificate must be provided at start of tenancy',
      status: facts.gas_safety_provided ? 'pass' : 'fail',
      severity: facts.gas_safety_provided ? 'info' : 'critical',
      consequence: facts.gas_safety_provided ? undefined : 'Section 21 invalid',
      action_required: facts.gas_safety_provided ? undefined : 'Cannot use Section 21',
    });
  }

  // EPC
  complianceChecks.push({
    requirement: 'Energy Performance Certificate (EPC)',
    description: 'EPC must be provided with minimum rating E',
    status: facts.epc_provided && (!facts.epc_rating || facts.epc_rating <= 'E') ? 'pass' : 'fail',
    severity: facts.epc_provided ? 'info' : 'critical',
    consequence: facts.epc_provided ? undefined : 'Section 21 invalid. Cannot legally let.',
    action_required: facts.epc_provided ? undefined : 'Obtain EPC before proceeding',
  });

  // How to Rent guide
  complianceChecks.push({
    requirement: 'How to Rent Guide',
    description: 'How to Rent guide must be provided at start of tenancy',
    status: facts.how_to_rent_provided ? 'pass' : 'fail',
    severity: facts.how_to_rent_provided ? 'info' : 'critical',
    consequence: facts.how_to_rent_provided ? undefined : 'Section 21 invalid',
    action_required: facts.how_to_rent_provided ? undefined : 'Cannot use Section 21',
  });

  // Licensing
  const properlyLicensed = facts.properly_licensed || facts.license_not_required;
  complianceChecks.push({
    requirement: 'Property Licensing',
    description: 'Property must be licensed if HMO or in selective licensing area',
    status: properlyLicensed ? 'pass' : 'fail',
    severity: properlyLicensed ? 'info' : 'critical',
    consequence: properlyLicensed
      ? undefined
      : 'Section 21 invalid. Criminal offence. Rent repayment order up to 12 months.',
    action_required: properlyLicensed ? undefined : 'Obtain license immediately',
  });

  // Prohibited fees
  complianceChecks.push({
    requirement: 'No Prohibited Fees',
    description: 'No prohibited fees charged (Tenant Fees Act 2019)',
    status: facts.no_prohibited_fees !== false ? 'pass' : 'fail',
    severity: facts.no_prohibited_fees !== false ? 'info' : 'warning',
    consequence: facts.no_prohibited_fees !== false ? undefined : 'Section 21 may be invalid',
  });

  // Retaliatory eviction
  const isRetaliatory = facts.complaint_made && facts.complaint_within_6_months;
  complianceChecks.push({
    requirement: 'Not Retaliatory Eviction',
    description: 'Not within 6 months of tenant repair complaint or LA notice',
    status: isRetaliatory ? 'fail' : 'pass',
    severity: isRetaliatory ? 'critical' : 'info',
    consequence: isRetaliatory ? 'Section 21 invalid for 6 months' : undefined,
    action_required: isRetaliatory ? 'Wait 6 months or use Section 8' : undefined,
  });

  // Check if all critical requirements pass
  const allPassed = complianceChecks.every((c) => c.status === 'pass' || c.severity !== 'critical');
  const hasWarnings = complianceChecks.some((c) => c.severity === 'warning');

  let successProbability: SuccessProbability = 'very_high';
  if (!allPassed) successProbability = 'none';
  else if (hasWarnings) successProbability = 'high';

  return {
    available: allPassed,
    success_probability: successProbability,
    notice_period_days: 60,
    reasoning: allPassed
      ? 'All Section 21 requirements met. This provides quickest route to possession.'
      : 'Section 21 unavailable due to compliance failures. Use Section 8 instead.',
    compliance_checks: complianceChecks,
    red_flags: redFlags,
    can_use_accelerated: allPassed && facts.tenancy_type === 'AST',
  };
}

// ============================================================================
// RED FLAG DETECTION
// ============================================================================

/**
 * Detect red flags across all aspects of the case
 */
function detectRedFlags(facts: CaseFacts, jurisdiction: string): RedFlag[] {
  const flags: RedFlag[] = [];

  // Unlicensed HMO
  if (facts.is_hmo && !facts.hmo_licensed) {
    flags.push({
      name: 'Unlicensed HMO',
      severity: 'critical',
      description: 'Property is an HMO but not properly licensed',
      consequence:
        'Cannot serve Section 21. Criminal offence. Rent Repayment Order up to 12 months. Unlimited fine.',
      blocks_section_21: true,
      action_required: 'Apply for HMO license immediately. Do not evict until licensed.',
    });
  }

  // Unprotected deposit
  if (!facts.deposit_protected && facts.tenancy_type === 'AST') {
    flags.push({
      name: 'Unprotected Deposit',
      severity: 'critical',
      description: 'Deposit not protected in government scheme',
      consequence: 'Section 21 invalid. Tenant can claim 1-3x deposit amount.',
      blocks_section_21: true,
      action_required: 'Protect deposit immediately (even if late)',
    });
  }

  // Disrepair
  if (facts.landlord_in_disrepair && facts.tenant_complained_disrepair) {
    flags.push({
      name: 'Property in Disrepair',
      severity: 'warning',
      description: 'Tenant has complained about disrepair which landlord has not addressed',
      consequence: 'Weakens landlord case. Tenant may have counterclaim.',
      action_required: 'Complete repairs before proceeding with eviction',
    });
  }

  return flags;
}

// ============================================================================
// COMPLIANCE CHECKS
// ============================================================================

/**
 * Run all compliance checks
 */
function runComplianceChecks(facts: CaseFacts, jurisdiction: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // Right to Rent
  checks.push({
    requirement: 'Right to Rent Check',
    description: 'Immigration checks required before granting tenancy',
    status: 'unknown',
    severity: 'warning',
    consequence: 'Civil penalty up to £3,000 per illegal occupant if not done',
  });

  // Electrical Safety
  checks.push({
    requirement: 'Electrical Safety (EICR)',
    description: 'Electrical Installation Condition Report required every 5 years',
    status: 'unknown',
    severity: 'warning',
    consequence: 'May be required for eviction proceedings',
  });

  return checks;
}

// ============================================================================
// ROUTE DETERMINATION
// ============================================================================

/**
 * Determine the recommended legal route
 */
function determineRecommendedRoute(
  primaryGrounds: GroundRecommendation[],
  section21: Section21Recommendation,
  redFlags: RedFlag[],
  facts: CaseFacts
): 'section_8' | 'section_21' | 'both' | 'none' {
  const hasSection8 = primaryGrounds.length > 0;
  const hasSection21 = section21.available;
  const hasMandatoryGround = primaryGrounds.some((g) => g.type === 'mandatory');

  // Critical red flags block everything
  const hasCriticalRedFlags = redFlags.some((f) => f.severity === 'critical');
  if (hasCriticalRedFlags && !hasSection8) return 'none';

  // Mandatory grounds are best
  if (hasMandatoryGround) return 'section_8';

  // Section 21 is faster if available
  if (hasSection21 && !hasSection8) return 'section_21';

  // Both available - recommend both for flexibility
  if (hasSection8 && hasSection21) return 'both';

  // Only Section 8 available
  if (hasSection8) return 'section_8';

  // Nothing available
  return 'none';
}

// ============================================================================
// RISK CALCULATION
// ============================================================================

/**
 * Calculate overall risk level
 */
function calculateRiskLevel(
  redFlags: RedFlag[],
  complianceChecks: ComplianceCheck[]
): 'low' | 'medium' | 'high' {
  const hasCritical = redFlags.some((f) => f.severity === 'critical');
  const criticalCompliance = complianceChecks.filter((c) => c.severity === 'critical' && c.status === 'fail');

  if (hasCritical || criticalCompliance.length > 0) return 'high';

  const hasWarnings = redFlags.some((f) => f.severity === 'warning');
  const warningCompliance = complianceChecks.filter((c) => c.severity === 'warning');

  if (hasWarnings || warningCompliance.length > 2) return 'medium';

  return 'low';
}

// ============================================================================
// TIMELINE ESTIMATION
// ============================================================================

/**
 * Estimate timeline for eviction
 */
function estimateTimeline(
  route: string,
  grounds: GroundRecommendation[],
  section21: Section21Recommendation,
  jurisdiction: string
): TimelineEstimate {
  const timelines = getTypicalTimelines(jurisdiction);

  if (route === 'section_8' && grounds.some((g) => g.ground_number === 8)) {
    return {
      route: 'Section 8 - Ground 8 (Mandatory)',
      notice_period_days: 14,
      court_proceedings_days: [120, 180],
      total_days: [134, 194],
      notes: 'Fastest route. Court must grant if arrears still at threshold.',
    };
  }

  if (route === 'section_21') {
    return {
      route: 'Section 21 - No Fault',
      notice_period_days: 60,
      court_proceedings_days: section21.can_use_accelerated ? [42, 84] : [120, 180],
      total_days: section21.can_use_accelerated ? [102, 144] : [180, 240],
      notes: section21.can_use_accelerated
        ? 'Accelerated procedure available - no hearing required if tenant doesn\'t respond'
        : 'Standard possession procedure',
    };
  }

  if (route === 'section_8') {
    return {
      route: 'Section 8 - Discretionary Grounds',
      notice_period_days: grounds[0]?.notice_period_days || 60,
      court_proceedings_days: [180, 300],
      total_days: [240, 360],
      notes: 'Court will consider reasonableness. Timeline depends on court backlog.',
    };
  }

  return {
    route: 'Unknown',
    notice_period_days: 0,
    court_proceedings_days: [0, 0],
    total_days: [0, 0],
    notes: 'No valid route available',
  };
}

// ============================================================================
// COST ESTIMATION
// ============================================================================

/**
 * Estimate costs for eviction
 */
function estimateCosts(facts: CaseFacts, jurisdiction: string): CostEstimate {
  const costs = getCostEstimates(jurisdiction);

  return {
    court_fee: costs.court_fee || 355,
    bailiff_fee: costs.bailiff_fee || 130,
    legal_costs_range: [
      parseInt(costs.legal_costs_simple?.split('-')[0]) || 800,
      parseInt(costs.legal_costs_complex?.split('-')[1]) || 5000,
    ],
    total_estimated_range: [1285, 5485],
    notes: 'Costs depend on complexity and whether legal representation is used',
  };
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate a summary of the analysis
 */
function generateSummary(
  route: string,
  grounds: GroundRecommendation[],
  section21: Section21Recommendation,
  facts: CaseFacts
): string {
  if (route === 'none') {
    return 'No valid eviction route available due to compliance issues. Address red flags before proceeding.';
  }

  if (route === 'section_8') {
    const mandatory = grounds.filter((g) => g.type === 'mandatory');
    if (mandatory.length > 0) {
      return `Strong case using Section 8 mandatory ground(s): ${mandatory.map((g) => `Ground ${g.ground_number}`).join(', ')}. Court must grant possession if grounds proven.`;
    }
    return `Section 8 eviction using discretionary ground(s): ${grounds.map((g) => `Ground ${g.ground_number}`).join(', ')}. Court will consider reasonableness.`;
  }

  if (route === 'section_21') {
    return 'Section 21 (no-fault) eviction available. All compliance requirements met. This is typically the fastest route.';
  }

  if (route === 'both') {
    return 'Both Section 8 and Section 21 available. Recommend serving both notices for maximum flexibility.';
  }

  return 'Analysis complete.';
}

/**
 * Generate next steps
 */
function generateNextSteps(
  route: string,
  grounds: GroundRecommendation[],
  section21: Section21Recommendation,
  redFlags: RedFlag[],
  facts: CaseFacts
): string[] {
  const steps: string[] = [];

  // Address red flags first
  if (redFlags.length > 0) {
    steps.push(`⚠️ Address ${redFlags.length} red flag(s) before proceeding`);
  }

  if (route === 'none') {
    steps.push('Cannot proceed with eviction until compliance issues resolved');
    steps.push('Seek legal advice on how to remedy the situation');
    return steps;
  }

  // Gather evidence
  if (grounds.length > 0) {
    steps.push(`Gather evidence for Ground(s) ${grounds.map((g) => g.ground_number).join(', ')}`);
  }

  // Serve notice
  if (route === 'section_8') {
    steps.push(`Serve Section 8 notice (${grounds[0]?.notice_period_days || 14} days notice period)`);
  } else if (route === 'section_21') {
    steps.push('Serve Section 21 notice (60 days notice period)');
  } else if (route === 'both') {
    steps.push('Consider serving both Section 8 and Section 21 notices');
  }

  // Wait for notice period
  steps.push('Wait for notice period to expire');

  // Court proceedings
  steps.push('If tenant does not leave, start court proceedings');

  // Bailiff
  steps.push('If possession order granted and tenant still does not leave, apply for bailiff warrant');

  return steps;
}

/**
 * Generate warnings
 */
function generateWarnings(redFlags: RedFlag[], complianceChecks: ComplianceCheck[]): string[] {
  const warnings: string[] = [];

  redFlags.forEach((flag) => {
    if (flag.severity === 'critical' || flag.severity === 'warning') {
      warnings.push(`${flag.name}: ${flag.consequence}`);
    }
  });

  complianceChecks.forEach((check) => {
    if (check.status === 'fail' && check.severity === 'critical') {
      warnings.push(`${check.requirement}: ${check.consequence}`);
    }
  });

  return warnings;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Normalize jurisdiction string
 */
function normalizeJurisdiction(jurisdiction: string): string {
  const normalized = jurisdiction.toLowerCase().replace(/[^a-z-]/g, '');

  if (normalized.includes('england') || normalized.includes('wales')) {
    return 'england-wales';
  }

  if (normalized.includes('scotland')) {
    return 'scotland';
  }

  if (normalized.includes('northern') && normalized.includes('ireland')) {
    return 'northern-ireland';
  }

  // Default to England & Wales
  return 'england-wales';
}
