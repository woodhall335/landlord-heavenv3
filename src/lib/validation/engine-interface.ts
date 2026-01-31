/**
 * Validation Engine Interface
 *
 * Phase 18B: Abstract Engine for Product Expansion
 *
 * Provides generic interfaces for validation engines that can be
 * implemented for different product surfaces:
 * - Eviction notices (current)
 * - Money claims
 * - Tenancy agreements
 * - Compliance checks
 *
 * Design principles:
 * - Product-agnostic interfaces
 * - Consistent validation result structure
 * - Plugin-style rule loading
 * - Shared optimization infrastructure
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Severity levels for validation issues.
 */
export type Severity = 'blocker' | 'warning' | 'suggestion';

/**
 * Generic validation issue.
 */
export interface ValidationIssue {
  /** Unique rule identifier */
  id: string;
  /** Issue severity */
  severity: Severity;
  /** User-facing message */
  message: string;
  /** Technical explanation */
  rationale: string;
  /** Associated form field (if any) */
  field: string | null;
  /** Section/category for grouping */
  section?: string;
}

/**
 * Generic validation result.
 */
export interface ValidationResult {
  /** Blocking issues (prevent proceeding) */
  blockers: ValidationIssue[];
  /** Warning issues (caution but can proceed) */
  warnings: ValidationIssue[];
  /** Suggestions (informational) */
  suggestions: ValidationIssue[];
  /** Overall validity (true if no blockers) */
  isValid: boolean;
  /** Number of rules evaluated */
  ruleCount: number;
}

/**
 * Generic rule definition.
 */
export interface ValidationRule<TFacts = Record<string, unknown>> {
  /** Unique rule identifier */
  id: string;
  /** Rule severity when triggered */
  severity: Severity;
  /** Context keys where rule applies (e.g., routes, products) */
  applies_to: string[];
  /** Conditions that trigger the rule (OR logic) */
  applies_when: Array<{ condition: string }>;
  /** User-facing message */
  message: string;
  /** Technical rationale */
  rationale: string;
  /** Associated form field */
  field?: string | null;
  /** Feature flag requirement */
  requires_feature?: string;
}

/**
 * Rule configuration container.
 */
export interface RulesConfig<TRule = ValidationRule> {
  /** Config version */
  version: string;
  /** Last updated date */
  last_updated: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Rules organized by category */
  rules: Record<string, TRule[]>;
}

// ============================================================================
// ENGINE INTERFACE
// ============================================================================

/**
 * Generic validation engine interface.
 * Implement this for each product surface.
 */
export interface IValidationEngine<
  TFacts = Record<string, unknown>,
  TContext extends string = string,
  TResult extends ValidationResult = ValidationResult
> {
  /** Engine identifier */
  readonly engineId: string;

  /** Supported contexts (e.g., routes, modes) */
  readonly supportedContexts: readonly TContext[];

  /**
   * Evaluate rules against facts.
   */
  evaluate(facts: TFacts, context: TContext): TResult;

  /**
   * Get all rule IDs.
   */
  getAllRuleIds(): string[];

  /**
   * Validate rules configuration.
   */
  validateConfig(): { valid: boolean; errors: string[] };

  /**
   * Warm caches for optimal performance.
   */
  warmCache(): { rulesLoaded: number; conditionsCompiled: number };
}

/**
 * Engine with explainability support.
 */
export interface IExplainableEngine<
  TFacts = Record<string, unknown>,
  TContext extends string = string,
  TResult extends ValidationResult = ValidationResult
> extends IValidationEngine<TFacts, TContext, TResult> {
  /**
   * Evaluate with full explanation output.
   */
  evaluateExplained(facts: TFacts, context: TContext): TResult & {
    explanations: Array<{
      ruleId: string;
      evaluated: boolean;
      fired: boolean;
      conditions: Array<{
        condition: string;
        result: boolean;
        explanation: string;
      }>;
    }>;
    timing: {
      totalMs: number;
      rulesEvaluated: number;
      conditionsEvaluated: number;
    };
  };

  /**
   * Get summary of validation result.
   */
  getSummary(result: TResult): string;
}

// ============================================================================
// FACTORY INTERFACE
// ============================================================================

/**
 * Engine factory for creating product-specific engines.
 */
export interface IEngineFactory {
  /**
   * Create an engine for a specific product.
   */
  createEngine<TFacts, TContext extends string>(
    productId: string,
    options?: EngineOptions
  ): IValidationEngine<TFacts, TContext>;

  /**
   * Get available product IDs.
   */
  getAvailableProducts(): string[];

  /**
   * Check if product is supported.
   */
  isProductSupported(productId: string): boolean;
}

/**
 * Engine creation options.
 */
export interface EngineOptions {
  /** Enable timing hooks */
  enableTiming?: boolean;
  /** Enable explainability */
  enableExplainability?: boolean;
  /** Custom config path */
  configPath?: string;
  /** Feature flags */
  features?: string[];
}

// ============================================================================
// PLUGIN INTERFACE
// ============================================================================

/**
 * Rule plugin interface for extensibility.
 */
export interface IRulePlugin {
  /** Plugin identifier */
  readonly pluginId: string;

  /** Plugin version */
  readonly version: string;

  /**
   * Get additional rules to merge.
   */
  getRules(): ValidationRule[];

  /**
   * Get additional computed values.
   */
  getComputedValues?(facts: Record<string, unknown>): Record<string, unknown>;

  /**
   * Validate plugin is compatible.
   */
  validateCompatibility(engineVersion: string): boolean;
}

// ============================================================================
// RESULT TRANSFORMERS
// ============================================================================

/**
 * Transform validation results.
 */
export type ResultTransformer<TIn extends ValidationResult, TOut = TIn> = (
  result: TIn,
  context?: Record<string, unknown>
) => TOut;

/**
 * Common transformers.
 */
export const ResultTransformers = {
  /**
   * Filter to only blockers.
   */
  blockersOnly: <T extends ValidationResult>(result: T): T => ({
    ...result,
    warnings: [],
    suggestions: [],
  }),

  /**
   * Filter to blockers and warnings.
   */
  noSuggestions: <T extends ValidationResult>(result: T): T => ({
    ...result,
    suggestions: [],
  }),

  /**
   * Sort by severity (blockers first).
   */
  sortBySeverity: <T extends ValidationResult>(result: T): T => result,

  /**
   * Limit number of issues.
   */
  limitIssues:
    (maxBlockers: number, maxWarnings: number, maxSuggestions: number) =>
    <T extends ValidationResult>(result: T): T => ({
      ...result,
      blockers: result.blockers.slice(0, maxBlockers),
      warnings: result.warnings.slice(0, maxWarnings),
      suggestions: result.suggestions.slice(0, maxSuggestions),
    }),
};

// ============================================================================
// PRODUCT REGISTRY
// ============================================================================

/**
 * Product configuration for the registry.
 */
export interface ProductConfig {
  /** Product identifier */
  productId: string;
  /** Human-readable name */
  name: string;
  /** Supported contexts/routes */
  contexts: string[];
  /** Path to rules configuration */
  rulesPath: string;
  /** Allowlist module path */
  allowlistPath?: string;
  /** Feature flags for this product */
  features?: string[];
}

/**
 * Product registry for managing available products.
 */
export class ProductRegistry {
  private products: Map<string, ProductConfig> = new Map();

  /**
   * Register a product.
   */
  register(config: ProductConfig): void {
    this.products.set(config.productId, config);
  }

  /**
   * Get product configuration.
   */
  get(productId: string): ProductConfig | undefined {
    return this.products.get(productId);
  }

  /**
   * Get all registered products.
   */
  getAll(): ProductConfig[] {
    return Array.from(this.products.values());
  }

  /**
   * Check if product exists.
   */
  has(productId: string): boolean {
    return this.products.has(productId);
  }

  /**
   * Unregister a product.
   */
  unregister(productId: string): boolean {
    return this.products.delete(productId);
  }
}

// Default registry instance
export const productRegistry = new ProductRegistry();

// ============================================================================
// PRE-REGISTERED PRODUCTS
// ============================================================================

// Register eviction notices product
productRegistry.register({
  productId: 'eviction-notices',
  name: 'Eviction Notices',
  contexts: ['section_21', 'section_8', 'section_173', 'fault_based', 'notice_to_leave'],
  rulesPath: 'config/legal-requirements',
  allowlistPath: 'src/lib/validation/eviction-rules-allowlist.ts',
  features: ['phase13', 'enhanced_messages'],
});

// Placeholder for future products
// productRegistry.register({
//   productId: 'money-claims',
//   name: 'Money Claims',
//   contexts: ['england_claim', 'scotland_claim'],
//   rulesPath: 'config/money-claims',
// });

// productRegistry.register({
//   productId: 'tenancy-agreements',
//   name: 'Tenancy Agreements',
//   contexts: ['ast', 'soc', 'prt'],
//   rulesPath: 'config/tenancy-agreements',
// });

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if result is valid.
 */
export function isValidResult(result: ValidationResult): boolean {
  return result.isValid;
}

/**
 * Check if result has blockers.
 */
export function hasBlockers(result: ValidationResult): boolean {
  return result.blockers.length > 0;
}

/**
 * Check if result has warnings.
 */
export function hasWarnings(result: ValidationResult): boolean {
  return result.warnings.length > 0;
}

/**
 * Check if result has any issues.
 */
export function hasAnyIssues(result: ValidationResult): boolean {
  return (
    result.blockers.length > 0 ||
    result.warnings.length > 0 ||
    result.suggestions.length > 0
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Merge multiple validation results.
 */
export function mergeResults(...results: ValidationResult[]): ValidationResult {
  return results.reduce(
    (merged, result) => ({
      blockers: [...merged.blockers, ...result.blockers],
      warnings: [...merged.warnings, ...result.warnings],
      suggestions: [...merged.suggestions, ...result.suggestions],
      isValid: merged.isValid && result.isValid,
      ruleCount: merged.ruleCount + result.ruleCount,
    }),
    {
      blockers: [],
      warnings: [],
      suggestions: [],
      isValid: true,
      ruleCount: 0,
    }
  );
}

/**
 * Create empty validation result.
 */
export function emptyResult(): ValidationResult {
  return {
    blockers: [],
    warnings: [],
    suggestions: [],
    isValid: true,
    ruleCount: 0,
  };
}

/**
 * Count total issues.
 */
export function countIssues(result: ValidationResult): number {
  return result.blockers.length + result.warnings.length + result.suggestions.length;
}
