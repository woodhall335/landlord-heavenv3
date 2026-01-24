/**
 * Money Claim Rules Engine
 *
 * Loads validation rules from YAML config and evaluates them against case facts.
 * Returns tiered results: blockers, warnings, suggestions.
 *
 * Design principles:
 * - Rules are deterministic and testable
 * - Rule definitions live in /config for easy maintenance
 * - Engine is pure TypeScript with no side effects
 * - Supports claim-type-specific rule filtering
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export type RuleSeverity = 'blocker' | 'warning' | 'suggestion';

export type ClaimType =
  | 'rent_arrears'
  | 'property_damage'
  | 'cleaning'
  | 'unpaid_utilities'
  | 'unpaid_council_tax'
  | 'other_tenant_debt';

export interface ValidationRule {
  id: string;
  severity: RuleSeverity;
  applies_to: (ClaimType | 'all')[];
  applies_when: Array<{ condition: string }>;
  message: string;
  rationale: string;
  evidence_hint: string | null;
  field?: string | null;
}

export interface RulesConfig {
  version: string;
  jurisdiction: string;
  product: string;
  common_rules: ValidationRule[];
  rent_arrears_rules: ValidationRule[];
  damages_rules: ValidationRule[];
  council_tax_rules: ValidationRule[];
  utilities_rules: ValidationRule[];
}

export interface RuleEvaluationResult {
  id: string;
  severity: RuleSeverity;
  message: string;
  rationale: string;
  evidence_hint: string | null;
  field: string | null;
  section?: string;
}

export interface ValidationEngineResult {
  blockers: RuleEvaluationResult[];
  warnings: RuleEvaluationResult[];
  suggestions: RuleEvaluationResult[];
  totalClaimAmount: number;
  claimTypes: ClaimType[];
  isValid: boolean;
}

export interface MoneyClaimFacts {
  // Landlord/claimant
  landlord_full_name?: string;
  landlord_address_line1?: string;
  landlord_address_postcode?: string;
  landlord_is_company?: boolean;
  company_name?: string;

  // Tenant/defendant
  tenant_full_name?: string;
  defendant_address_line1?: string;

  // Property
  property_address_line1?: string;
  property_address_postcode?: string;

  // Tenancy
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  rent_amount?: number;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

  // Claim flags
  claiming_rent_arrears?: boolean;
  claiming_damages?: boolean;
  claiming_other?: boolean;

  // Arrears data
  arrears_items?: Array<{
    period_start?: string | null;
    period_end?: string | null;
    rent_due?: number | null;
    rent_paid?: number | null;
  }>;
  total_arrears?: number;

  // Pre-action
  letter_before_claim_sent?: boolean;
  pap_letter_date?: string;
  pap_response_received?: boolean;

  // Evidence
  evidence_reviewed?: boolean;
  uploaded_documents?: Array<{ id: string; name: string; type?: string }>;

  // Reviews
  timeline_reviewed?: boolean;
  enforcement_reviewed?: boolean;
  enforcement_preference?: string;

  // Money claim nested
  money_claim?: {
    primary_issue?: string;
    other_amounts_types?: string[];
    damage_items?: Array<{
      id?: string;
      description?: string;
      amount?: number;
      category?: string;
    }>;
    tenant_still_in_property?: boolean;
    basis_of_claim?: string;
    charge_interest?: boolean;
    interest_rate?: number;
    interest_start_date?: string;
  };

  // Issues nested (legacy)
  issues?: {
    rent_arrears?: {
      arrears_items?: Array<{
        period_start?: string | null;
        period_end?: string | null;
        rent_due?: number | null;
        rent_paid?: number | null;
      }>;
      total_arrears?: number;
    };
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract claim types from facts
 */
export function getClaimTypesFromFacts(facts: MoneyClaimFacts): ClaimType[] {
  const types: ClaimType[] = [];

  if (facts.claiming_rent_arrears === true) {
    types.push('rent_arrears');
  }

  const otherTypes = facts.money_claim?.other_amounts_types || [];

  if (otherTypes.includes('property_damage') || facts.claiming_damages === true) {
    types.push('property_damage');
  }
  if (otherTypes.includes('cleaning')) {
    types.push('cleaning');
  }
  if (otherTypes.includes('unpaid_utilities')) {
    types.push('unpaid_utilities');
  }
  if (otherTypes.includes('unpaid_council_tax')) {
    types.push('unpaid_council_tax');
  }
  if (otherTypes.includes('other_charges') || facts.claiming_other === true) {
    types.push('other_tenant_debt');
  }

  return types;
}

/**
 * Calculate total arrears
 */
export function calculateArrearsTotal(facts: MoneyClaimFacts): number {
  const items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];

  if (items.length === 0) {
    return facts.total_arrears || facts.issues?.rent_arrears?.total_arrears || 0;
  }

  return items.reduce((total, item) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return total + (due - paid);
  }, 0);
}

/**
 * Calculate total damages
 */
export function calculateDamagesTotal(facts: MoneyClaimFacts): number {
  const items = facts.money_claim?.damage_items || [];
  return items.reduce((total, item) => total + (item.amount || 0), 0);
}

/**
 * Build evaluation context with computed values
 */
function buildEvaluationContext(facts: MoneyClaimFacts) {
  const claim_types = getClaimTypesFromFacts(facts);
  const arrears_items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
  const damage_items = facts.money_claim?.damage_items || [];

  const arrears_total = calculateArrearsTotal(facts);
  const damages_total = calculateDamagesTotal(facts);
  const grand_total = arrears_total + damages_total;

  // Count incomplete arrears items
  const arrears_items_incomplete_count = arrears_items.filter(
    (item) =>
      !item.period_start ||
      !item.period_end ||
      item.rent_due === null ||
      item.rent_due === undefined
  ).length;

  // Count damage items without amounts/descriptions
  const damage_items_without_amount = damage_items.filter(
    (item) => item.amount === null || item.amount === undefined || item.amount <= 0
  ).length;
  const damage_items_without_description = damage_items.filter(
    (item) => !item.description
  ).length;

  // Check if any non-rent claim type is selected
  const has_damages_claim_type =
    claim_types.includes('property_damage') ||
    claim_types.includes('cleaning') ||
    claim_types.includes('unpaid_utilities') ||
    claim_types.includes('other_tenant_debt');

  // PAP timing
  let daysSincePapLetter = 0;
  if (facts.pap_letter_date) {
    const letterDate = new Date(facts.pap_letter_date);
    const today = new Date();
    daysSincePapLetter = Math.floor(
      (today.getTime() - letterDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    facts,
    claim_types,
    arrears_items,
    damage_items,
    totals: {
      arrears_total,
      damages_total,
      grand_total,
    },
    arrears_items_incomplete_count,
    damage_items_without_amount,
    damage_items_without_description,
    has_damages_claim_type,
    daysSincePapLetter,
  };
}

/**
 * Evaluate a single condition against the context
 * Uses safe evaluation with explicit context variables
 */
function evaluateCondition(condition: string, context: ReturnType<typeof buildEvaluationContext>): boolean {
  try {
    // Create a function that evaluates the condition with the context
    const {
      facts,
      claim_types,
      arrears_items,
      damage_items,
      totals,
      arrears_items_incomplete_count,
      damage_items_without_amount,
      damage_items_without_description,
      has_damages_claim_type,
      daysSincePapLetter,
    } = context;

    // Use Function constructor for safe(r) evaluation
    // This is deterministic and only uses provided context
    const evalFn = new Function(
      'facts',
      'claim_types',
      'arrears_items',
      'damage_items',
      'totals',
      'arrears_items_incomplete_count',
      'damage_items_without_amount',
      'damage_items_without_description',
      'has_damages_claim_type',
      'daysSincePapLetter',
      `return (${condition});`
    );

    return evalFn(
      facts,
      claim_types,
      arrears_items,
      damage_items,
      totals,
      arrears_items_incomplete_count,
      damage_items_without_amount,
      damage_items_without_description,
      has_damages_claim_type,
      daysSincePapLetter
    );
  } catch (error) {
    // If condition evaluation fails, don't trigger the rule
    console.warn(`Rule condition evaluation failed: ${condition}`, error);
    return false;
  }
}

/**
 * Check if a rule applies to the current claim types
 */
function ruleAppliesToClaimTypes(rule: ValidationRule, claimTypes: ClaimType[]): boolean {
  // 'all' means it applies regardless of claim types
  if (rule.applies_to.includes('all')) {
    return true;
  }

  // Check if any of the rule's claim types match
  return rule.applies_to.some((ruleType) =>
    claimTypes.includes(ruleType as ClaimType)
  );
}

/**
 * Interpolate message placeholders with context values
 */
function interpolateMessage(
  message: string,
  context: ReturnType<typeof buildEvaluationContext>
): string {
  return message
    .replace(/\{daysSincePapLetter\}/g, String(context.daysSincePapLetter))
    .replace(/\{arrears_items_incomplete_count\}/g, String(context.arrears_items_incomplete_count))
    .replace(/\{damage_items_without_amount\}/g, String(context.damage_items_without_amount))
    .replace(/\{damage_items_without_description\}/g, String(context.damage_items_without_description))
    .replace(
      /\{arrears_items_incomplete_count === 1 \? '([^']+)' : '([^']+)'\}/g,
      context.arrears_items_incomplete_count === 1 ? '$1' : '$2'
    )
    .replace(
      /\{damage_items_without_amount === 1 \? '([^']+)' : '([^']+)'\}/g,
      context.damage_items_without_amount === 1 ? '$1' : '$2'
    )
    .replace(
      /\{damage_items_without_description === 1 \? '([^']+)' : '([^']+)'\}/g,
      context.damage_items_without_description === 1 ? '$1' : '$2'
    );
}

/**
 * Map rule ID to section for grouping
 */
function getRuleSection(ruleId: string): string {
  if (ruleId.startsWith('claimant_')) return 'claimant';
  if (ruleId.startsWith('defendant_')) return 'defendant';
  if (ruleId.startsWith('tenancy_')) return 'tenancy';
  if (ruleId.startsWith('arrears_') || ruleId.startsWith('rent_')) return 'arrears';
  if (ruleId.startsWith('damage_') || ruleId.startsWith('property_') || ruleId.startsWith('cleaning_')) return 'damages';
  if (ruleId.startsWith('council_tax_')) return 'council_tax';
  if (ruleId.startsWith('utilities_')) return 'utilities';
  if (ruleId.startsWith('pap_')) return 'preaction';
  if (ruleId.includes('evidence')) return 'evidence';
  if (ruleId.includes('interest') || ruleId.includes('basis_of_claim') || ruleId.includes('claim_type')) return 'claim_details';
  if (ruleId.includes('enforcement') || ruleId.includes('timeline')) return 'next_steps';
  if (ruleId.includes('total') || ruleId.includes('principal')) return 'amounts';
  return 'general';
}

// ============================================================================
// RULES LOADING
// ============================================================================

let cachedRulesConfig: RulesConfig | null = null;

/**
 * Load rules from YAML config file
 */
export function loadRulesConfig(forceReload = false): RulesConfig {
  if (cachedRulesConfig && !forceReload) {
    return cachedRulesConfig;
  }

  const configPath = path.join(
    process.cwd(),
    'config',
    'legal-requirements',
    'england',
    'money_claim_rules.yaml'
  );

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as RulesConfig;
    cachedRulesConfig = config;
    return config;
  } catch (error) {
    console.error('Failed to load rules config:', error);
    // Return empty config if file not found (for client-side)
    return {
      version: '1.0',
      jurisdiction: 'england',
      product: 'money_claim',
      common_rules: [],
      rent_arrears_rules: [],
      damages_rules: [],
      council_tax_rules: [],
      utilities_rules: [],
    };
  }
}

/**
 * Get all rules from config, flattened
 */
export function getAllRules(config?: RulesConfig): ValidationRule[] {
  const rulesConfig = config || loadRulesConfig();

  return [
    ...(rulesConfig.common_rules || []),
    ...(rulesConfig.rent_arrears_rules || []),
    ...(rulesConfig.damages_rules || []),
    ...(rulesConfig.council_tax_rules || []),
    ...(rulesConfig.utilities_rules || []),
  ];
}

// ============================================================================
// MAIN EVALUATION FUNCTION
// ============================================================================

/**
 * Evaluate all rules against the provided facts
 *
 * @param facts - The money claim case facts
 * @param rulesConfig - Optional rules config (will load from file if not provided)
 * @returns Tiered validation results
 */
export function evaluateRules(
  facts: MoneyClaimFacts,
  rulesConfig?: RulesConfig
): ValidationEngineResult {
  const config = rulesConfig || loadRulesConfig();
  const allRules = getAllRules(config);
  const context = buildEvaluationContext(facts);

  const blockers: RuleEvaluationResult[] = [];
  const warnings: RuleEvaluationResult[] = [];
  const suggestions: RuleEvaluationResult[] = [];

  for (const rule of allRules) {
    // Check if rule applies to current claim types
    if (!ruleAppliesToClaimTypes(rule, context.claim_types)) {
      continue;
    }

    // Evaluate all conditions (all must be true for rule to trigger)
    const allConditionsMet = rule.applies_when.every((cond) =>
      evaluateCondition(cond.condition, context)
    );

    if (allConditionsMet) {
      const result: RuleEvaluationResult = {
        id: rule.id,
        severity: rule.severity,
        message: interpolateMessage(rule.message, context),
        rationale: rule.rationale,
        evidence_hint: rule.evidence_hint,
        field: rule.field || null,
        section: getRuleSection(rule.id),
      };

      switch (rule.severity) {
        case 'blocker':
          blockers.push(result);
          break;
        case 'warning':
          warnings.push(result);
          break;
        case 'suggestion':
          suggestions.push(result);
          break;
      }
    }
  }

  return {
    blockers,
    warnings,
    suggestions,
    totalClaimAmount: context.totals.grand_total,
    claimTypes: context.claim_types,
    isValid: blockers.length === 0,
  };
}

/**
 * Convenience function to check if case can proceed to generation
 */
export function canGeneratePack(facts: MoneyClaimFacts): {
  allowed: boolean;
  blockers: RuleEvaluationResult[];
} {
  const result = evaluateRules(facts);
  return {
    allowed: result.isValid,
    blockers: result.blockers,
  };
}

/**
 * Get validation for a specific section
 */
export function getValidationBySection(
  facts: MoneyClaimFacts,
  sectionId: string
): { blockers: RuleEvaluationResult[]; warnings: RuleEvaluationResult[]; suggestions: RuleEvaluationResult[] } {
  const result = evaluateRules(facts);

  return {
    blockers: result.blockers.filter((r) => r.section === sectionId),
    warnings: result.warnings.filter((r) => r.section === sectionId),
    suggestions: result.suggestions.filter((r) => r.section === sectionId),
  };
}

/**
 * Get all rule IDs for testing/documentation
 */
export function getAllRuleIds(): string[] {
  const rules = getAllRules();
  return rules.map((r) => r.id);
}
