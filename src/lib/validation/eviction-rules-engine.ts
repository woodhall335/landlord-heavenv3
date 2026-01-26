/**
 * Eviction Rules Engine
 *
 * Loads validation rules from YAML config and evaluates them against case facts.
 * Returns tiered results: blockers, warnings, suggestions.
 *
 * Design principles:
 * - Rules are deterministic and testable
 * - Rule definitions live in /config for easy maintenance
 * - Engine is pure TypeScript with no side effects
 * - Supports jurisdiction and route-specific rule filtering
 * - SECURITY: Condition strings are validated against an allowlist before evaluation
 *
 * @see money-claim-rules-engine.ts for the pattern this follows
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { validateEvictionCondition } from './eviction-rules-allowlist';
import {
  evaluateConditionOptimized,
  validateRuleCount,
  validateConditionCount,
  startTiming,
  endTiming,
  getOptimizerConfig,
  precompileConditions,
  type TimingHook,
} from './eviction-rules-optimizer';

// ============================================================================
// TYPES
// ============================================================================

export type RuleSeverity = 'blocker' | 'warning' | 'suggestion';

export type Jurisdiction = 'england' | 'wales' | 'scotland';

export type Product = 'notice_only' | 'complete_pack';

export type EnglandRoute = 'section_21' | 'section_8';
export type WalesRoute = 'section_173' | 'fault_based';
export type ScotlandRoute = 'notice_to_leave';
export type EvictionRoute = EnglandRoute | WalesRoute | ScotlandRoute;

export interface ValidationRule {
  id: string;
  severity: RuleSeverity;
  applies_to: (EvictionRoute | 'all')[];
  applies_when: Array<{ condition: string }>;
  message: string;
  rationale: string;
  field?: string | null;
  /** Feature flag requirement - rule only evaluated when feature is enabled */
  requires_feature?: string;
}

export interface SummarySection {
  id: string;
  label: string;
  rules: string[];
}

export interface SummaryConfig {
  blocker_prevents_generation: boolean;
  warning_shown_in_review: boolean;
  suggestion_shown_as_tips: boolean;
  group_by_section: boolean;
  sections: SummarySection[];
}

export interface RulesConfig {
  version: string;
  jurisdiction: Jurisdiction;
  product: Product;
  last_updated: string;
  metadata?: {
    effective_from?: string;
    source?: string[];
    notes?: string;
  };
  routes?: string[];
  // Route-specific rule lists
  section_21_rules?: ValidationRule[];
  section_8_rules?: ValidationRule[];
  section_173_rules?: ValidationRule[];
  fault_based_rules?: ValidationRule[];
  notice_to_leave_rules?: ValidationRule[];
  common_rules?: ValidationRule[];
  summary?: SummaryConfig;
}

export interface RuleEvaluationResult {
  id: string;
  severity: RuleSeverity;
  message: string;
  rationale: string;
  field: string | null;
  section?: string;
}

export interface ValidationEngineResult {
  blockers: RuleEvaluationResult[];
  warnings: RuleEvaluationResult[];
  suggestions: RuleEvaluationResult[];
  isValid: boolean;
  ruleCount: number;
  jurisdiction: Jurisdiction;
  product: Product;
  route: EvictionRoute;
}

// ============================================================================
// PHASE 18: EXPLAINABILITY MODE TYPES
// ============================================================================

export interface ConditionExplanation {
  condition: string;
  result: boolean;
  /** Simplified explanation of what the condition checks */
  explanation: string;
}

export interface RuleExplanation {
  ruleId: string;
  severity: RuleSeverity;
  message: string;
  /** Whether this rule was evaluated (might be skipped due to feature flags or route) */
  evaluated: boolean;
  /** Why the rule was skipped (if evaluated=false) */
  skipReason?: 'feature_flag_disabled' | 'route_mismatch' | 'condition_count_exceeded';
  /** Whether the rule fired (triggered an issue) */
  fired: boolean;
  /** Detailed condition evaluation results */
  conditions: ConditionExplanation[];
  /** The condition that caused the rule to fire (if any) */
  firingCondition?: string;
}

export interface ExplainableResult extends ValidationEngineResult {
  /** Detailed explanations of all rule evaluations */
  explanations: RuleExplanation[];
  /** Computed context values used in evaluation */
  computedContext: Record<string, unknown>;
  /** Timing information */
  timing: {
    totalMs: number;
    rulesEvaluated: number;
    conditionsEvaluated: number;
  };
}

export interface EvictionFacts {
  // Jurisdiction
  jurisdiction?: string;

  // Party information
  landlord_full_name?: string;
  landlord_name?: string;
  tenant_full_name?: string;
  tenant_name?: string;
  contract_holder_name?: string;
  property_address_line1?: string;
  property_address_postcode?: string;

  // Tenancy/Contract dates
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  contract_start_date?: string;
  fixed_term_end_date?: string;
  is_fixed_term?: boolean;

  // Notice service
  notice_service_date?: string;
  notice_served_date?: string;
  notice_date?: string;
  notice_expiry_date?: string;
  notice_expiry?: string;
  selected_notice_route?: string;
  eviction_route?: string;

  // Deposit (England/Wales)
  deposit_taken?: boolean;
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_protection_date?: string;
  deposit_scheme_name?: string;
  deposit_reduced_to_legal_cap_confirmed?: string | boolean;
  prescribed_info_given?: boolean;
  prescribed_info_provided?: boolean;
  prescribed_info_served?: boolean;
  deposit_protected_wales?: boolean;

  // Safety compliance (England S21)
  has_gas_appliances?: boolean;
  gas_certificate_provided?: boolean;
  gas_safety_cert_provided?: boolean;
  epc_provided?: boolean;
  epc_gas_cert_served?: boolean;
  how_to_rent_provided?: boolean;
  how_to_rent_served?: boolean;

  // Licensing (England)
  licensing_required?: string;
  has_valid_licence?: boolean;
  property_licensing_status?: string;

  // Retaliatory eviction (England)
  improvement_notice_served?: boolean;
  local_authority_improvement_notice?: boolean;
  emergency_remedial_action?: boolean;
  local_authority_emergency_action?: boolean;
  recent_repair_complaints?: boolean;
  no_retaliatory_notice?: boolean;

  // Prohibited fees (England)
  prohibited_fees_charged?: boolean;
  no_prohibited_fees_confirmed?: boolean;

  // Section 8 grounds (England)
  section8_grounds?: string[];
  section8_grounds_selection?: string[];
  section8_details?: string;
  ground_particulars?: string;
  ground14_severity?: string;

  // Arrears
  has_rent_arrears?: boolean;
  has_arrears?: boolean;
  total_arrears?: number;
  arrears_total?: number;
  arrears_at_notice_date?: number;
  arrears_items?: Array<{
    period_start?: string;
    period_end?: string;
    rent_due?: number;
    rent_paid?: number;
  }>;
  rent_amount?: number;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

  // ASB/Breach (England S8)
  has_asb?: boolean;
  has_breaches?: boolean;

  // Wales specific
  rent_smart_wales_registered?: boolean;
  written_statement_provided?: boolean;
  wales_breach_type?: string;
  wales_fault_grounds?: string[];
  wales_contract_category?: string;

  // Scotland specific
  scotland_ground_codes?: (string | number)[];
  scotland_grounds?: string[];
  notice_to_leave_grounds?: string[];
  prt_grounds?: string[];
  eviction_grounds?: string[];
  landlord_registration_number?: string;
  landlord_reg_number?: string;
  pre_action_completed?: boolean;
  pre_action_protocol_followed?: boolean;
  pre_action_contact?: string;
  pre_action_letter_sent?: boolean;
  pre_action_signposting?: boolean;

  // Nested structures
  issues?: {
    rent_arrears?: {
      pre_action_confirmed?: boolean;
      pre_action_letter_sent?: boolean;
      debt_advice_signposted?: boolean;
      arrears_items?: Array<{
        period_start?: string;
        period_end?: string;
        rent_due?: number;
        rent_paid?: number;
      }>;
      total_arrears?: number;
    };
  };

  tenancy?: {
    rent_amount?: number;
    rent_frequency?: string;
    deposit_amount?: number;
    prescribed_info_given?: boolean;
  };

  // Allow additional properties
  [key: string]: any;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Get Phase 13 rollout percentage from environment.
 * Phase 14: Allows gradual rollout of Phase 13 rules.
 *
 * Values:
 * - 0: Phase 13 disabled (default)
 * - 1-99: Percentage of requests where Phase 13 is enabled
 * - 100: Phase 13 fully enabled
 *
 * Set with: VALIDATION_PHASE13_ROLLOUT_PERCENT=N (0-100)
 */
export function getPhase13RolloutPercent(): number {
  // First check if Phase 13 is explicitly enabled (takes precedence)
  if (process.env.VALIDATION_PHASE13_ENABLED === 'true') {
    return 100;
  }

  const percentStr = process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT;
  if (!percentStr) return 0;

  const percent = parseInt(percentStr, 10);
  if (isNaN(percent) || percent < 0) return 0;
  if (percent > 100) return 100;
  return percent;
}

// Session-level Phase 13 decision cache
// Ensures consistent Phase 13 status within a single request
let phase13SessionDecision: boolean | null = null;

/**
 * Reset the Phase 13 session decision.
 * Call this at the start of each request for percentage-based rollout.
 */
export function resetPhase13SessionDecision(): void {
  phase13SessionDecision = null;
}

/**
 * Phase 13 feature flag for correctness improvements beyond legacy TS.
 * When enabled, additional validation rules are evaluated that were
 * intentionally excluded during the TS-to-YAML migration for parity.
 *
 * Enable with:
 * - VALIDATION_PHASE13_ENABLED=true (100% enablement)
 * - VALIDATION_PHASE13_ROLLOUT_PERCENT=N (percentage-based rollout)
 *
 * Phase 14: Supports percentage-based rollout for gradual rollout.
 */
export function isPhase13Enabled(): boolean {
  // Return cached decision if available (ensures consistency within request)
  if (phase13SessionDecision !== null) {
    return phase13SessionDecision;
  }

  const rolloutPercent = getPhase13RolloutPercent();

  // 0% = always disabled
  if (rolloutPercent === 0) {
    phase13SessionDecision = false;
    return false;
  }

  // 100% = always enabled
  if (rolloutPercent >= 100) {
    phase13SessionDecision = true;
    return true;
  }

  // Percentage-based rollout: random selection
  const randomValue = Math.random() * 100;
  phase13SessionDecision = randomValue < rolloutPercent;
  return phase13SessionDecision;
}

/**
 * Get list of enabled feature flags for rule filtering.
 */
export function getEnabledFeatures(): string[] {
  const features: string[] = [];
  if (isPhase13Enabled()) {
    features.push('phase13');
  }
  return features;
}

/**
 * Check if a rule should be evaluated based on its feature requirements.
 */
function ruleFeatureEnabled(rule: ValidationRule): boolean {
  if (!rule.requires_feature) {
    return true; // No feature requirement, always enabled
  }
  const enabledFeatures = getEnabledFeatures();
  return enabledFeatures.includes(rule.requires_feature);
}

// ============================================================================
// COMPUTED VALUES
// ============================================================================

interface ComputedContext {
  // Date-based checks
  within_four_month_bar: boolean;
  within_six_month_bar: boolean;
  tenancy_start_in_future: boolean;
  contract_start_in_future: boolean;
  notice_before_tenancy_start: boolean;
  notice_before_contract_start: boolean;
  expiry_before_service: boolean;

  // Deposit cap
  deposit_exceeds_cap: boolean;

  // Notice period checks
  notice_period_too_short: boolean;
  s8_notice_period_too_short: boolean;
  s173_notice_period_too_short: boolean;
  wales_fault_notice_period_too_short: boolean;
  ntl_notice_period_too_short: boolean;
  notice_period_calculation_error: boolean;
  s8_notice_period_calculation_error: boolean;
  ntl_notice_period_calculation_error: boolean;

  // Ground checks
  has_ground_8: boolean;
  has_ground_12: boolean;
  has_ground_14: boolean;
  has_arrears_ground: boolean;
  has_ground_1: boolean;
  ground_8_eligible: boolean;

  // Scotland
  mixed_grounds_allowed: boolean;
  arrears_months: number;

  // Dates
  service_date: string | undefined;
  expiry_date: string | undefined;
}

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function addMonths(base: Date, months: number): Date {
  const copy = new Date(base);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function buildComputedContext(facts: EvictionFacts, route: EvictionRoute): ComputedContext {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get service date
  const serviceDate = toDate(
    facts.notice_service_date ||
    facts.notice_served_date ||
    facts.notice_date
  );

  // Get tenancy/contract start date
  const tenancyStartDate = toDate(facts.tenancy_start_date || facts.contract_start_date);

  // Get expiry date
  const expiryDate = toDate(facts.notice_expiry_date || facts.notice_expiry);

  // Four-month bar (England S21)
  let within_four_month_bar = false;
  if (tenancyStartDate && serviceDate) {
    const fourMonthPoint = addMonths(tenancyStartDate, 4);
    within_four_month_bar = serviceDate < fourMonthPoint;
  }

  // Six-month bar (Wales S173)
  let within_six_month_bar = false;
  const contractStart = toDate(facts.contract_start_date || facts.tenancy_start_date);
  if (contractStart && serviceDate) {
    const sixMonthPoint = addMonths(contractStart, 6);
    within_six_month_bar = serviceDate < sixMonthPoint;
  }

  // Tenancy start in future
  const tenancy_start_in_future = tenancyStartDate ? tenancyStartDate > today : false;
  const contract_start_in_future = contractStart ? contractStart > today : false;

  // Notice before tenancy/contract
  const notice_before_tenancy_start = tenancyStartDate && serviceDate
    ? serviceDate < tenancyStartDate
    : false;
  const notice_before_contract_start = contractStart && serviceDate
    ? serviceDate < contractStart
    : false;

  // Expiry before service
  const expiry_before_service = serviceDate && expiryDate
    ? expiryDate <= serviceDate
    : false;

  // Deposit cap calculation (5 weeks rent, or 6 weeks if annual rent > £50k)
  let deposit_exceeds_cap = false;
  if (facts.deposit_taken && facts.deposit_amount && facts.rent_amount) {
    const rentAmount = facts.rent_amount;
    const freq = facts.rent_frequency || 'monthly';
    let annualRent = rentAmount * 12; // default monthly

    switch (freq) {
      case 'weekly':
        annualRent = rentAmount * 52;
        break;
      case 'fortnightly':
        annualRent = rentAmount * 26;
        break;
      case 'quarterly':
        annualRent = rentAmount * 4;
        break;
      case 'yearly':
        annualRent = rentAmount;
        break;
    }

    const weeklyRent = annualRent / 52;
    const maxWeeks = annualRent > 50000 ? 6 : 5;
    const maxDeposit = weeklyRent * maxWeeks;
    deposit_exceeds_cap = facts.deposit_amount > maxDeposit;
  }

  // Notice period checks
  let notice_period_too_short = false;
  let s8_notice_period_too_short = false;
  let s173_notice_period_too_short = false;
  let wales_fault_notice_period_too_short = false;
  let ntl_notice_period_too_short = false;
  let notice_period_calculation_error = false;
  let s8_notice_period_calculation_error = false;
  let ntl_notice_period_calculation_error = false;

  if (serviceDate && expiryDate) {
    const days = daysBetween(serviceDate, expiryDate);

    // S21: 2 months minimum
    if (route === 'section_21') {
      // Approximate: 2 months = 60 days minimum
      notice_period_too_short = days < 60;
    }

    // S173: 6 months minimum
    if (route === 'section_173') {
      s173_notice_period_too_short = days < 182; // ~6 months
    }

    // Wales fault-based: 56 days (8 weeks)
    if (route === 'fault_based') {
      wales_fault_notice_period_too_short = days < 56;
    }

    // Scotland NTL: 28 days minimum (varies by ground)
    if (route === 'notice_to_leave') {
      ntl_notice_period_too_short = days < 28;
    }

    // S8: varies by ground (2 weeks for mandatory, 2 months for discretionary)
    // Simplified: check minimum 14 days
    if (route === 'section_8') {
      s8_notice_period_too_short = days < 14;
    }
  } else if (route === 'section_21' || route === 'section_8') {
    if (!serviceDate || !expiryDate) {
      if (route === 'section_8') {
        s8_notice_period_calculation_error = true;
      } else {
        notice_period_calculation_error = true;
      }
    }
  } else if (route === 'notice_to_leave') {
    if (!serviceDate) {
      ntl_notice_period_calculation_error = true;
    }
  }

  // Ground checks (England S8)
  const grounds = facts.section8_grounds || facts.section8_grounds_selection || [];
  const groundsStr = Array.isArray(grounds) ? grounds.join(' ').toLowerCase() : '';

  const has_ground_8 = groundsStr.includes('8') || groundsStr.includes('ground_8');
  const has_ground_12 = groundsStr.includes('12') || groundsStr.includes('ground_12') || groundsStr.includes('breach');
  const has_ground_14 = groundsStr.includes('14') || groundsStr.includes('ground_14') || groundsStr.includes('nuisance') || groundsStr.includes('asb');
  const has_arrears_ground = has_ground_8 || groundsStr.includes('10') || groundsStr.includes('11') || groundsStr.includes('arrears');

  // Ground 8 eligibility (2+ months arrears)
  let ground_8_eligible = false;
  if (has_ground_8 && facts.rent_amount) {
    const totalArrears = facts.total_arrears || facts.arrears_total || 0;
    const monthlyRent = facts.rent_frequency === 'weekly'
      ? facts.rent_amount * 4.33
      : facts.rent_amount;
    ground_8_eligible = totalArrears >= monthlyRent * 2;
  }

  // Scotland Ground 1 check
  const scotlandGrounds = facts.scotland_ground_codes || facts.eviction_grounds || [];
  const scotlandGroundsNormalized = Array.isArray(scotlandGrounds)
    ? scotlandGrounds.map((g) => String(g).toLowerCase())
    : [];
  const has_ground_1 = scotlandGroundsNormalized.some(
    (g) => g === '1' || g === 'ground_1' || g === 'ground1' || g.includes('rent_arrears')
  );

  // Scotland mixed grounds
  const mixed_grounds_allowed = true; // Default to true, can be overridden

  // Arrears months calculation
  let arrears_months = 0;
  if (facts.rent_amount && (facts.total_arrears || facts.arrears_total)) {
    const totalArrears = facts.total_arrears || facts.arrears_total || 0;
    const monthlyRent = facts.rent_frequency === 'weekly'
      ? facts.rent_amount * 4.33
      : facts.rent_amount;
    if (monthlyRent > 0) {
      arrears_months = Math.floor(totalArrears / monthlyRent);
    }
  }

  return {
    within_four_month_bar,
    within_six_month_bar,
    tenancy_start_in_future,
    contract_start_in_future,
    notice_before_tenancy_start,
    notice_before_contract_start,
    expiry_before_service,
    deposit_exceeds_cap,
    notice_period_too_short,
    s8_notice_period_too_short,
    s173_notice_period_too_short,
    wales_fault_notice_period_too_short,
    ntl_notice_period_too_short,
    notice_period_calculation_error,
    s8_notice_period_calculation_error,
    ntl_notice_period_calculation_error,
    has_ground_8,
    has_ground_12,
    has_ground_14,
    has_arrears_ground,
    has_ground_1,
    ground_8_eligible,
    mixed_grounds_allowed,
    arrears_months,
    service_date: serviceDate?.toISOString().split('T')[0],
    expiry_date: expiryDate?.toISOString().split('T')[0],
  };
}

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

/**
 * Evaluate a single condition against the context.
 * Uses safe evaluation with explicit context variables.
 * SECURITY: Conditions are validated against an allowlist before evaluation.
 */
function evaluateCondition(
  condition: string,
  facts: EvictionFacts,
  computed: ComputedContext,
  route: EvictionRoute
): boolean {
  // SECURITY: Validate condition against allowlist before evaluation
  const validation = validateEvictionCondition(condition);
  if (!validation.valid) {
    console.error(`[SECURITY] Condition rejected: ${validation.reason}. Condition: "${condition}"`);
    return false;
  }

  try {
    // Use Function constructor for safe(r) evaluation
    // SECURITY: Combined with allowlist validation, this provides defense-in-depth
    const evalFn = new Function(
      'facts',
      'computed',
      'route',
      'Array',
      'String',
      'Number',
      'Boolean',
      'Math',
      'Date',
      'Object',
      'parseInt',
      'parseFloat',
      'isNaN',
      'isFinite',
      `return (${condition});`
    );

    return evalFn(
      facts,
      computed,
      route,
      Array,
      String,
      Number,
      Boolean,
      Math,
      Date,
      Object,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    );
  } catch (error) {
    // If condition evaluation fails, don't trigger the rule
    console.warn(`Rule condition evaluation failed: ${condition}`, error);
    return false;
  }
}

/**
 * Check if a rule applies to the current route.
 */
function ruleAppliesToRoute(rule: ValidationRule, route: EvictionRoute): boolean {
  if (rule.applies_to.includes('all')) {
    return true;
  }
  return rule.applies_to.includes(route as any);
}

/**
 * Map rule ID to section for grouping.
 */
function getRuleSection(ruleId: string, config: RulesConfig): string {
  // First check if rule is explicitly assigned to a section in summary
  if (config.summary?.sections) {
    for (const section of config.summary.sections) {
      if (section.rules.includes(ruleId)) {
        return section.id;
      }
    }
  }

  // Fallback to prefix-based inference
  if (ruleId.startsWith('s21_')) return 'section_21';
  if (ruleId.startsWith('s8_')) return 'section_8';
  if (ruleId.startsWith('s173_')) return 'section_173';
  if (ruleId.startsWith('wales_')) return 'wales';
  if (ruleId.startsWith('ntl_')) return 'notice_to_leave';
  if (ruleId.includes('deposit')) return 'deposit';
  if (ruleId.includes('landlord') || ruleId.includes('tenant') || ruleId.includes('property')) return 'parties';
  if (ruleId.includes('tenancy') || ruleId.includes('contract')) return 'tenancy';
  if (ruleId.includes('notice') || ruleId.includes('expiry') || ruleId.includes('service')) return 'notice_service';
  if (ruleId.includes('ground')) return 'grounds';
  if (ruleId.includes('arrears')) return 'arrears';

  return 'general';
}

// ============================================================================
// RULES LOADING
// ============================================================================

// Cache for loaded configs
const configCache: Map<string, RulesConfig> = new Map();

/**
 * Get the config file path for a jurisdiction and product.
 */
function getConfigPath(jurisdiction: Jurisdiction, product: Product): string {
  return path.join(
    process.cwd(),
    'config',
    'legal-requirements',
    jurisdiction,
    `${product}_rules.yaml`
  );
}

/**
 * Load rules from YAML config file.
 * Phase 17: Precompiles conditions on load for cache warming.
 */
export function loadRulesConfig(
  jurisdiction: Jurisdiction,
  product: Product,
  forceReload = false
): RulesConfig {
  const cacheKey = `${jurisdiction}:${product}`;

  if (!forceReload && configCache.has(cacheKey)) {
    return configCache.get(cacheKey)!;
  }

  const configPath = getConfigPath(jurisdiction, product);

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as RulesConfig;
    configCache.set(cacheKey, config);

    // Phase 17: Precompile all conditions to warm the cache
    const allRules = getAllRules(config);
    precompileConditions(allRules);

    return config;
  } catch (error) {
    console.error(`Failed to load rules config from ${configPath}:`, error);
    // Return empty config if file not found
    return {
      version: '1.0',
      jurisdiction,
      product,
      last_updated: new Date().toISOString().split('T')[0],
      common_rules: [],
    };
  }
}

/**
 * Warm the condition cache for all known configs.
 * Call at application startup for optimal performance.
 *
 * Phase 17: Pre-loads and compiles all rule conditions.
 */
export function warmConditionCache(): {
  configsLoaded: number;
  conditionsCompiled: number;
  compilationFailures: number;
} {
  const jurisdictions: Jurisdiction[] = ['england', 'wales', 'scotland'];
  const products: Product[] = ['notice_only', 'complete_pack'];

  let configsLoaded = 0;
  let conditionsCompiled = 0;
  let compilationFailures = 0;

  for (const jurisdiction of jurisdictions) {
    for (const product of products) {
      try {
        const config = loadRulesConfig(jurisdiction, product, true);
        const allRules = getAllRules(config);
        const result = precompileConditions(allRules);
        configsLoaded++;
        conditionsCompiled += result.compiled;
        compilationFailures += result.failed;
      } catch {
        // Config might not exist for all combinations
      }
    }
  }

  return { configsLoaded, conditionsCompiled, compilationFailures };
}

/**
 * Get all rules from config for a specific route.
 */
export function getAllRulesForRoute(config: RulesConfig, route: EvictionRoute): ValidationRule[] {
  const rules: ValidationRule[] = [];

  // Add common rules
  if (config.common_rules) {
    rules.push(...config.common_rules);
  }

  // Add route-specific rules
  switch (route) {
    case 'section_21':
      if (config.section_21_rules) rules.push(...config.section_21_rules);
      break;
    case 'section_8':
      if (config.section_8_rules) rules.push(...config.section_8_rules);
      break;
    case 'section_173':
      if (config.section_173_rules) rules.push(...config.section_173_rules);
      break;
    case 'fault_based':
      if (config.fault_based_rules) rules.push(...config.fault_based_rules);
      break;
    case 'notice_to_leave':
      if (config.notice_to_leave_rules) rules.push(...config.notice_to_leave_rules);
      break;
  }

  return rules;
}

/**
 * Get all rules from config, flattened.
 */
export function getAllRules(config: RulesConfig): ValidationRule[] {
  return [
    ...(config.common_rules || []),
    ...(config.section_21_rules || []),
    ...(config.section_8_rules || []),
    ...(config.section_173_rules || []),
    ...(config.fault_based_rules || []),
    ...(config.notice_to_leave_rules || []),
  ];
}

// ============================================================================
// MAIN EVALUATION FUNCTION
// ============================================================================

/**
 * Evaluate all rules against the provided facts.
 *
 * Phase 17: Uses optimized condition evaluation with caching and timing hooks.
 *
 * @param facts - The eviction case facts
 * @param jurisdiction - The jurisdiction (england, wales, scotland)
 * @param product - The product (notice_only, complete_pack)
 * @param route - The eviction route (section_21, section_8, etc.)
 * @param rulesConfig - Optional rules config (will load from file if not provided)
 * @returns Tiered validation results
 */
export function evaluateEvictionRules(
  facts: EvictionFacts,
  jurisdiction: Jurisdiction,
  product: Product,
  route: EvictionRoute,
  rulesConfig?: RulesConfig
): ValidationEngineResult {
  // Phase 17: Start timing if enabled
  const optimizerConfig = getOptimizerConfig();
  const timing = optimizerConfig.enableTimingHooks ? startTiming() : null;

  const config = rulesConfig || loadRulesConfig(jurisdiction, product);
  const allRules = getAllRulesForRoute(config, route);
  const computed = buildComputedContext(facts, route);

  // Phase 17: Validate rule count against safeguard limit
  validateRuleCount(allRules.length);

  // Pre-allocate result arrays with estimated capacity to reduce allocations
  const blockers: RuleEvaluationResult[] = [];
  const warnings: RuleEvaluationResult[] = [];
  const suggestions: RuleEvaluationResult[] = [];

  // Phase 17: Track condition evaluations for timing hooks
  let conditionCount = 0;
  let cacheHits = 0;

  for (const rule of allRules) {
    // Check if rule's feature requirement is met
    if (!ruleFeatureEnabled(rule)) {
      continue;
    }

    // Check if rule applies to current route
    if (!ruleAppliesToRoute(rule, route)) {
      continue;
    }

    // Phase 17: Validate condition count against safeguard limit
    validateConditionCount(rule.id, rule.applies_when.length);

    // Evaluate conditions (rule fires if ANY condition is true - OR logic)
    // Phase 17: Use optimized condition evaluation with caching
    let anyConditionMet = false;
    for (const cond of rule.applies_when) {
      conditionCount++;
      // Use optimized evaluation with compiled function caching
      const result = evaluateConditionOptimized(
        cond.condition,
        facts as Record<string, unknown>,
        computed as unknown as Record<string, unknown>,
        route
      );
      if (result) {
        anyConditionMet = true;
        break; // Early exit on first true condition (OR logic)
      }
    }

    if (anyConditionMet) {
      const result: RuleEvaluationResult = {
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        rationale: rule.rationale,
        field: rule.field || null,
        section: getRuleSection(rule.id, config),
      };

      // Direct assignment instead of switch for micro-optimization
      if (rule.severity === 'blocker') {
        blockers.push(result);
      } else if (rule.severity === 'warning') {
        warnings.push(result);
      } else {
        suggestions.push(result);
      }
    }
  }

  // Phase 17: Record timing data if hooks are enabled
  if (timing && optimizerConfig.enableTimingHooks) {
    endTiming(timing, {
      ruleCount: allRules.length,
      conditionCount,
      blockerCount: blockers.length,
      warningCount: warnings.length,
      cacheHits,
      cacheMisses: conditionCount - cacheHits,
    });
  }

  return {
    blockers,
    warnings,
    suggestions,
    isValid: blockers.length === 0,
    ruleCount: allRules.length,
    jurisdiction,
    product,
    route,
  };
}

/**
 * Convenience function to check if case can proceed to generation.
 */
export function canGenerateEvictionPack(
  facts: EvictionFacts,
  jurisdiction: Jurisdiction,
  product: Product,
  route: EvictionRoute
): { allowed: boolean; blockers: RuleEvaluationResult[] } {
  const result = evaluateEvictionRules(facts, jurisdiction, product, route);
  return {
    allowed: result.isValid,
    blockers: result.blockers,
  };
}

/**
 * Get validation for a specific section.
 */
export function getValidationBySection(
  facts: EvictionFacts,
  jurisdiction: Jurisdiction,
  product: Product,
  route: EvictionRoute,
  sectionId: string
): { blockers: RuleEvaluationResult[]; warnings: RuleEvaluationResult[]; suggestions: RuleEvaluationResult[] } {
  const result = evaluateEvictionRules(facts, jurisdiction, product, route);

  return {
    blockers: result.blockers.filter((r) => r.section === sectionId),
    warnings: result.warnings.filter((r) => r.section === sectionId),
    suggestions: result.suggestions.filter((r) => r.section === sectionId),
  };
}

/**
 * Get all rule IDs for testing/documentation.
 */
export function getAllRuleIds(jurisdiction: Jurisdiction, product: Product): string[] {
  const config = loadRulesConfig(jurisdiction, product);
  const rules = getAllRules(config);
  return rules.map((r) => r.id);
}

// ============================================================================
// YAML SCHEMA VALIDATION
// ============================================================================

export interface SchemaValidationError {
  type: 'duplicate_id' | 'missing_rule_reference' | 'invalid_condition' | 'missing_field';
  message: string;
  ruleId?: string;
  section?: string;
}

/**
 * Validates the YAML rules config for schema correctness.
 * Returns array of validation errors (empty if valid).
 */
export function validateRulesSchema(config: RulesConfig): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];
  const allRules = getAllRules(config);
  const ruleIds = new Set<string>();

  // 1. Check for duplicate rule IDs
  for (const rule of allRules) {
    if (ruleIds.has(rule.id)) {
      errors.push({
        type: 'duplicate_id',
        message: `Duplicate rule ID: "${rule.id}"`,
        ruleId: rule.id,
      });
    }
    ruleIds.add(rule.id);
  }

  // 2. Validate summary.sections rule references
  if (config.summary?.sections) {
    for (const section of config.summary.sections) {
      for (const ruleRef of section.rules) {
        if (!ruleIds.has(ruleRef)) {
          errors.push({
            type: 'missing_rule_reference',
            message: `Summary section "${section.id}" references non-existent rule: "${ruleRef}"`,
            ruleId: ruleRef,
            section: section.id,
          });
        }
      }
    }
  }

  // 3. Validate all condition strings against allowlist
  for (const rule of allRules) {
    for (const conditionObj of rule.applies_when) {
      const validation = validateEvictionCondition(conditionObj.condition);
      if (!validation.valid) {
        errors.push({
          type: 'invalid_condition',
          message: `Rule "${rule.id}" has invalid condition: ${validation.reason}`,
          ruleId: rule.id,
        });
      }
    }
  }

  return errors;
}

/**
 * Get section config from summary for a given section ID.
 */
export function getSectionConfig(
  jurisdiction: Jurisdiction,
  product: Product,
  sectionId: string
): SummarySection | undefined {
  const config = loadRulesConfig(jurisdiction, product);
  return config.summary?.sections?.find((s) => s.id === sectionId);
}

/**
 * Get all section configs.
 */
export function getAllSectionConfigs(
  jurisdiction: Jurisdiction,
  product: Product
): SummarySection[] {
  const config = loadRulesConfig(jurisdiction, product);
  return config.summary?.sections || [];
}

/**
 * Group validation results by section using YAML summary config.
 */
export function groupResultsBySection(
  result: ValidationEngineResult
): Record<
  string,
  {
    label: string;
    blockers: RuleEvaluationResult[];
    warnings: RuleEvaluationResult[];
    suggestions: RuleEvaluationResult[];
  }
> {
  const config = loadRulesConfig(result.jurisdiction, result.product);
  const sections = config.summary?.sections || [];

  // Initialize sections from config
  const grouped: Record<
    string,
    {
      label: string;
      blockers: RuleEvaluationResult[];
      warnings: RuleEvaluationResult[];
      suggestions: RuleEvaluationResult[];
    }
  > = {};

  for (const section of sections) {
    grouped[section.id] = {
      label: section.label,
      blockers: [],
      warnings: [],
      suggestions: [],
    };
  }

  // Add "general" for unmatched rules
  grouped['general'] = {
    label: 'General',
    blockers: [],
    warnings: [],
    suggestions: [],
  };

  // Helper to find section for a rule
  const findSectionForRule = (ruleId: string): string => {
    for (const section of sections) {
      if (section.rules.includes(ruleId)) {
        return section.id;
      }
    }
    return 'general';
  };

  // Group results
  for (const blocker of result.blockers) {
    const sectionId = findSectionForRule(blocker.id);
    if (grouped[sectionId]) {
      grouped[sectionId].blockers.push(blocker);
    }
  }

  for (const warning of result.warnings) {
    const sectionId = findSectionForRule(warning.id);
    if (grouped[sectionId]) {
      grouped[sectionId].warnings.push(warning);
    }
  }

  for (const suggestion of result.suggestions) {
    const sectionId = findSectionForRule(suggestion.id);
    if (grouped[sectionId]) {
      grouped[sectionId].suggestions.push(suggestion);
    }
  }

  // Filter out empty sections
  return Object.fromEntries(
    Object.entries(grouped).filter(
      ([, s]) => s.blockers.length > 0 || s.warnings.length > 0 || s.suggestions.length > 0
    )
  );
}

/**
 * Clear the config cache. Useful for testing.
 */
export function clearConfigCache(): void {
  configCache.clear();
}

// ============================================================================
// PHASE 18: EXPLAINABILITY MODE
// ============================================================================

/**
 * Generate a human-readable explanation for a condition.
 */
function explainCondition(condition: string): string {
  // Common patterns and their explanations
  const explanations: Array<{ pattern: RegExp; explanation: (match: RegExpMatchArray) => string }> = [
    { pattern: /facts\.(\w+)\s*===?\s*true/, explanation: (m) => `${formatFieldName(m[1])} is true` },
    { pattern: /facts\.(\w+)\s*===?\s*false/, explanation: (m) => `${formatFieldName(m[1])} is false` },
    { pattern: /facts\.(\w+)\s*!==?\s*true/, explanation: (m) => `${formatFieldName(m[1])} is not true` },
    { pattern: /facts\.(\w+)\s*!==?\s*false/, explanation: (m) => `${formatFieldName(m[1])} is not false` },
    { pattern: /!facts\.(\w+)/, explanation: (m) => `${formatFieldName(m[1])} is not set/falsy` },
    { pattern: /facts\.(\w+)\s*===?\s*null/, explanation: (m) => `${formatFieldName(m[1])} is null` },
    { pattern: /facts\.(\w+)\s*!==?\s*null/, explanation: (m) => `${formatFieldName(m[1])} is not null` },
    { pattern: /facts\.(\w+)\s*===?\s*undefined/, explanation: (m) => `${formatFieldName(m[1])} is undefined` },
    { pattern: /computed\.(\w+)\s*===?\s*true/, explanation: (m) => `Computed: ${formatFieldName(m[1])} is true` },
    { pattern: /computed\.(\w+)\s*===?\s*false/, explanation: (m) => `Computed: ${formatFieldName(m[1])} is false` },
    { pattern: /computed\.(\w+)/, explanation: (m) => `Computed value: ${formatFieldName(m[1])}` },
    { pattern: /facts\.(\w+)\s*>\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} > ${m[2]}` },
    { pattern: /facts\.(\w+)\s*<\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} < ${m[2]}` },
    { pattern: /facts\.(\w+)\s*>=\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} >= ${m[2]}` },
    { pattern: /facts\.(\w+)\s*<=\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} <= ${m[2]}` },
    { pattern: /facts\.(\w+)\.includes\(['"](\w+)['"]\)/, explanation: (m) => `${formatFieldName(m[1])} includes "${m[2]}"` },
    { pattern: /facts\.(\w+)\.length\s*===?\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} has ${m[2]} items` },
    { pattern: /facts\.(\w+)\.length\s*>\s*(\d+)/, explanation: (m) => `${formatFieldName(m[1])} has more than ${m[2]} items` },
  ];

  for (const { pattern, explanation } of explanations) {
    const match = condition.match(pattern);
    if (match) {
      return explanation(match);
    }
  }

  // Fallback: return sanitized condition
  return condition.replace(/facts\./g, '').replace(/computed\./g, '[computed] ');
}

/**
 * Format a field name for human readability.
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Evaluate all rules with full explainability output.
 *
 * Phase 18: Returns detailed information about why each rule did or didn't fire,
 * including per-condition evaluation results.
 *
 * @param facts - The eviction case facts
 * @param jurisdiction - The jurisdiction (england, wales, scotland)
 * @param product - The product (notice_only, complete_pack)
 * @param route - The eviction route (section_21, section_8, etc.)
 * @param rulesConfig - Optional rules config (will load from file if not provided)
 * @returns Explainable validation results with full rule evaluation details
 */
export function evaluateEvictionRulesExplained(
  facts: EvictionFacts,
  jurisdiction: Jurisdiction,
  product: Product,
  route: EvictionRoute,
  rulesConfig?: RulesConfig
): ExplainableResult {
  const startTime = performance.now();

  const config = rulesConfig || loadRulesConfig(jurisdiction, product);
  const allRules = getAllRulesForRoute(config, route);
  const computed = buildComputedContext(facts, route);

  // Pre-allocate result arrays
  const blockers: RuleEvaluationResult[] = [];
  const warnings: RuleEvaluationResult[] = [];
  const suggestions: RuleEvaluationResult[] = [];
  const explanations: RuleExplanation[] = [];

  // Track metrics
  let rulesEvaluated = 0;
  let conditionsEvaluated = 0;

  for (const rule of allRules) {
    const ruleExplanation: RuleExplanation = {
      ruleId: rule.id,
      severity: rule.severity,
      message: rule.message,
      evaluated: false,
      fired: false,
      conditions: [],
    };

    // Check feature requirement
    if (!ruleFeatureEnabled(rule)) {
      ruleExplanation.skipReason = 'feature_flag_disabled';
      explanations.push(ruleExplanation);
      continue;
    }

    // Check route applicability
    if (!ruleAppliesToRoute(rule, route)) {
      ruleExplanation.skipReason = 'route_mismatch';
      explanations.push(ruleExplanation);
      continue;
    }

    // Check condition count safeguard
    const optimizerConfig = getOptimizerConfig();
    if (rule.applies_when.length > optimizerConfig.maxConditionsPerRule) {
      ruleExplanation.skipReason = 'condition_count_exceeded';
      explanations.push(ruleExplanation);
      continue;
    }

    ruleExplanation.evaluated = true;
    rulesEvaluated++;

    // Evaluate all conditions and collect explanations
    let anyConditionMet = false;
    let firingCondition: string | undefined;

    for (const cond of rule.applies_when) {
      conditionsEvaluated++;

      const result = evaluateConditionOptimized(
        cond.condition,
        facts as Record<string, unknown>,
        computed as unknown as Record<string, unknown>,
        route
      );

      ruleExplanation.conditions.push({
        condition: cond.condition,
        result,
        explanation: explainCondition(cond.condition),
      });

      if (result && !anyConditionMet) {
        anyConditionMet = true;
        firingCondition = cond.condition;
        // Note: We continue evaluating all conditions for explainability
        // even though the rule has already fired
      }
    }

    if (anyConditionMet) {
      ruleExplanation.fired = true;
      ruleExplanation.firingCondition = firingCondition;

      const evalResult: RuleEvaluationResult = {
        id: rule.id,
        severity: rule.severity,
        message: rule.message,
        rationale: rule.rationale,
        field: rule.field || null,
        section: getRuleSection(rule.id, config),
      };

      if (rule.severity === 'blocker') {
        blockers.push(evalResult);
      } else if (rule.severity === 'warning') {
        warnings.push(evalResult);
      } else {
        suggestions.push(evalResult);
      }
    }

    explanations.push(ruleExplanation);
  }

  const totalMs = performance.now() - startTime;

  return {
    blockers,
    warnings,
    suggestions,
    isValid: blockers.length === 0,
    ruleCount: allRules.length,
    jurisdiction,
    product,
    route,
    explanations,
    computedContext: computed as unknown as Record<string, unknown>,
    timing: {
      totalMs,
      rulesEvaluated,
      conditionsEvaluated,
    },
  };
}

/**
 * Get a summary of why validation failed or passed.
 *
 * Phase 18: Provides a human-readable summary for debugging and support.
 */
export function getValidationSummary(result: ExplainableResult): string {
  const lines: string[] = [];

  lines.push(`=== Validation Summary ===`);
  lines.push(`Jurisdiction: ${result.jurisdiction}`);
  lines.push(`Product: ${result.product}`);
  lines.push(`Route: ${result.route}`);
  lines.push(`Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
  lines.push(``);
  lines.push(`Rules: ${result.ruleCount} total, ${result.timing.rulesEvaluated} evaluated`);
  lines.push(`Conditions: ${result.timing.conditionsEvaluated} evaluated`);
  lines.push(`Time: ${result.timing.totalMs.toFixed(2)}ms`);
  lines.push(``);

  if (result.blockers.length > 0) {
    lines.push(`BLOCKERS (${result.blockers.length}):`);
    for (const b of result.blockers) {
      lines.push(`  - [${b.id}] ${b.message}`);
    }
    lines.push(``);
  }

  if (result.warnings.length > 0) {
    lines.push(`WARNINGS (${result.warnings.length}):`);
    for (const w of result.warnings) {
      lines.push(`  - [${w.id}] ${w.message}`);
    }
    lines.push(``);
  }

  // Show skipped rules summary
  const skippedByFeature = result.explanations.filter(e => e.skipReason === 'feature_flag_disabled');
  const skippedByRoute = result.explanations.filter(e => e.skipReason === 'route_mismatch');

  if (skippedByFeature.length > 0 || skippedByRoute.length > 0) {
    lines.push(`SKIPPED RULES:`);
    if (skippedByFeature.length > 0) {
      lines.push(`  - ${skippedByFeature.length} skipped (feature flag disabled)`);
    }
    if (skippedByRoute.length > 0) {
      lines.push(`  - ${skippedByRoute.length} skipped (route mismatch)`);
    }
  }

  return lines.join('\n');
}

/**
 * Get detailed explanation for a specific rule.
 *
 * Phase 18: Returns why a specific rule did or didn't fire.
 */
export function explainRule(result: ExplainableResult, ruleId: string): RuleExplanation | null {
  return result.explanations.find(e => e.ruleId === ruleId) || null;
}
