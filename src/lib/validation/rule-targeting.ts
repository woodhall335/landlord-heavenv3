/**
 * Rule Targeting & Override System
 *
 * Phase 18A: Multi-tenant Rule Targeting & Override Model
 *
 * Provides:
 * - Tenant context for rule targeting (white-label, enterprise customers)
 * - Rule override & exception model
 * - Audit logging for overrides
 *
 * Design principles:
 * - Overrides are explicit and audited
 * - Base rules are never modified, only extended or suppressed
 * - Tenant-specific rules layer on top of base rules
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tenant context for rule targeting.
 * Allows different rule sets for different customers/deployments.
 */
export interface TenantContext {
  /** Unique tenant identifier */
  tenantId: string;
  /** Human-readable tenant name */
  tenantName?: string;
  /** Tenant tier for feature gating */
  tier: 'free' | 'pro' | 'enterprise';
  /** Custom feature flags for this tenant */
  features?: string[];
  /** Tenant-specific rule overrides */
  ruleOverrides?: RuleOverride[];
  /** Tenant-specific custom rules */
  customRules?: TenantRule[];
}

/**
 * Rule override configuration.
 * Allows suppressing or modifying rules for specific tenants.
 */
export interface RuleOverride {
  /** Rule ID to override */
  ruleId: string;
  /** Override action */
  action: 'suppress' | 'downgrade' | 'upgrade' | 'modify';
  /** New severity (for downgrade/upgrade actions) */
  newSeverity?: 'blocker' | 'warning' | 'suggestion';
  /** New message (for modify action) */
  newMessage?: string;
  /** Reason for override (required for audit) */
  reason: string;
  /** Who approved the override */
  approvedBy?: string;
  /** When the override expires (ISO date string) */
  expiresAt?: string;
  /** Conditions when override applies */
  conditions?: {
    /** Only apply for specific jurisdictions */
    jurisdictions?: string[];
    /** Only apply for specific products */
    products?: string[];
    /** Only apply for specific routes */
    routes?: string[];
  };
}

/**
 * Tenant-specific custom rule.
 * Allows adding rules only for specific tenants.
 */
export interface TenantRule {
  /** Rule ID (must be unique and prefixed with tenant ID) */
  id: string;
  /** Rule severity */
  severity: 'blocker' | 'warning' | 'suggestion';
  /** Routes where rule applies */
  applies_to: string[];
  /** Conditions that trigger the rule */
  applies_when: Array<{ condition: string }>;
  /** User-facing message */
  message: string;
  /** Explanation for the rule */
  rationale: string;
  /** Associated form field */
  field?: string;
}

/**
 * Override audit log entry.
 */
export interface OverrideAuditEntry {
  timestamp: string;
  tenantId: string;
  ruleId: string;
  action: RuleOverride['action'];
  reason: string;
  approvedBy?: string;
  jurisdiction?: string;
  product?: string;
  route?: string;
}

// ============================================================================
// DEFAULT TENANT CONTEXT
// ============================================================================

const DEFAULT_TENANT: TenantContext = {
  tenantId: 'default',
  tenantName: 'Default',
  tier: 'free',
  features: [],
  ruleOverrides: [],
  customRules: [],
};

// ============================================================================
// TENANT CONTEXT MANAGEMENT
// ============================================================================

let currentTenantContext: TenantContext = { ...DEFAULT_TENANT };

/**
 * Set the current tenant context.
 * Call this at the start of request processing.
 */
export function setTenantContext(context: TenantContext): void {
  currentTenantContext = {
    ...DEFAULT_TENANT,
    ...context,
  };
}

/**
 * Get the current tenant context.
 */
export function getTenantContext(): TenantContext {
  return { ...currentTenantContext };
}

/**
 * Reset to default tenant context.
 */
export function resetTenantContext(): void {
  currentTenantContext = { ...DEFAULT_TENANT };
}

/**
 * Check if a feature is enabled for the current tenant.
 */
export function isTenantFeatureEnabled(feature: string): boolean {
  return currentTenantContext.features?.includes(feature) || false;
}

// ============================================================================
// RULE OVERRIDE PROCESSING
// ============================================================================

/**
 * Audit log for override applications.
 * In production, this would write to a persistent store.
 */
const overrideAuditLog: OverrideAuditEntry[] = [];

/**
 * Get the audit log (for testing/debugging).
 */
export function getOverrideAuditLog(): OverrideAuditEntry[] {
  return [...overrideAuditLog];
}

/**
 * Clear the audit log (for testing).
 */
export function clearOverrideAuditLog(): void {
  overrideAuditLog.length = 0;
}

/**
 * Find override for a rule in the current tenant context.
 */
export function findRuleOverride(
  ruleId: string,
  jurisdiction?: string,
  product?: string,
  route?: string
): RuleOverride | null {
  const overrides = currentTenantContext.ruleOverrides || [];

  for (const override of overrides) {
    if (override.ruleId !== ruleId) continue;

    // Check expiration
    if (override.expiresAt) {
      const expiryDate = new Date(override.expiresAt);
      if (expiryDate < new Date()) continue;
    }

    // Check conditions
    if (override.conditions) {
      if (
        override.conditions.jurisdictions &&
        jurisdiction &&
        !override.conditions.jurisdictions.includes(jurisdiction)
      ) {
        continue;
      }
      if (
        override.conditions.products &&
        product &&
        !override.conditions.products.includes(product)
      ) {
        continue;
      }
      if (
        override.conditions.routes &&
        route &&
        !override.conditions.routes.includes(route)
      ) {
        continue;
      }
    }

    return override;
  }

  return null;
}

/**
 * Apply override to a rule result.
 * Returns null if rule should be suppressed.
 */
export function applyRuleOverride<T extends { id: string; severity: string; message: string }>(
  result: T,
  override: RuleOverride,
  jurisdiction?: string,
  product?: string,
  route?: string
): T | null {
  // Log the override application
  overrideAuditLog.push({
    timestamp: new Date().toISOString(),
    tenantId: currentTenantContext.tenantId,
    ruleId: result.id,
    action: override.action,
    reason: override.reason,
    approvedBy: override.approvedBy,
    jurisdiction,
    product,
    route,
  });

  switch (override.action) {
    case 'suppress':
      return null;

    case 'downgrade':
    case 'upgrade':
      if (!override.newSeverity) return result;
      return { ...result, severity: override.newSeverity };

    case 'modify':
      return {
        ...result,
        severity: override.newSeverity || result.severity,
        message: override.newMessage || result.message,
      };

    default:
      return result;
  }
}

/**
 * Process rule results through the override system.
 * Returns filtered and modified results.
 */
export function processRuleOverrides<T extends { id: string; severity: string; message: string }>(
  results: T[],
  jurisdiction?: string,
  product?: string,
  route?: string
): T[] {
  return results
    .map((result) => {
      const override = findRuleOverride(result.id, jurisdiction, product, route);
      if (!override) return result;
      return applyRuleOverride(result, override, jurisdiction, product, route);
    })
    .filter((result): result is T => result !== null);
}

// ============================================================================
// TENANT CUSTOM RULES
// ============================================================================

/**
 * Get custom rules for the current tenant.
 */
export function getTenantCustomRules(): TenantRule[] {
  return currentTenantContext.customRules || [];
}

/**
 * Get custom rules applicable to a specific route.
 */
export function getTenantRulesForRoute(route: string): TenantRule[] {
  const rules = getTenantCustomRules();
  return rules.filter(
    (rule) => rule.applies_to.includes('all') || rule.applies_to.includes(route)
  );
}

/**
 * Validate tenant rule structure.
 */
export function validateTenantRule(rule: TenantRule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!rule.id) errors.push('Rule missing id');
  if (!rule.severity) errors.push('Rule missing severity');
  if (!rule.applies_to || !Array.isArray(rule.applies_to)) {
    errors.push('Rule missing applies_to array');
  }
  if (!rule.applies_when || !Array.isArray(rule.applies_when)) {
    errors.push('Rule missing applies_when array');
  }
  if (!rule.message) errors.push('Rule missing message');
  if (!rule.rationale) errors.push('Rule missing rationale');

  // Validate severity
  if (rule.severity && !['blocker', 'warning', 'suggestion'].includes(rule.severity)) {
    errors.push(`Invalid severity: ${rule.severity}`);
  }

  // Validate ID prefix (must start with tenant ID)
  if (rule.id && !rule.id.startsWith(`${currentTenantContext.tenantId}_`)) {
    errors.push(`Rule ID must be prefixed with tenant ID: ${currentTenantContext.tenantId}_`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// TIER-BASED FEATURE GATING
// ============================================================================

/**
 * Check if feature is available for tenant tier.
 */
export function isFeatureAvailableForTier(feature: string): boolean {
  const tierFeatures: Record<string, string[]> = {
    free: ['basic_validation'],
    pro: ['basic_validation', 'enhanced_messages', 'explainability'],
    enterprise: ['basic_validation', 'enhanced_messages', 'explainability', 'custom_rules', 'rule_overrides'],
  };

  const availableFeatures = tierFeatures[currentTenantContext.tier] || [];
  return availableFeatures.includes(feature);
}

/**
 * Check if custom rules are allowed for current tenant.
 */
export function canUseCustomRules(): boolean {
  return isFeatureAvailableForTier('custom_rules');
}

/**
 * Check if rule overrides are allowed for current tenant.
 */
export function canUseRuleOverrides(): boolean {
  return isFeatureAvailableForTier('rule_overrides');
}

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

/**
 * Create a tenant context from configuration.
 */
export function createTenantContext(config: {
  tenantId: string;
  tenantName?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  features?: string[];
  overridesJson?: string;
  customRulesJson?: string;
}): TenantContext {
  let ruleOverrides: RuleOverride[] = [];
  let customRules: TenantRule[] = [];

  if (config.overridesJson) {
    try {
      ruleOverrides = JSON.parse(config.overridesJson);
    } catch {
      console.warn('Failed to parse rule overrides JSON');
    }
  }

  if (config.customRulesJson) {
    try {
      customRules = JSON.parse(config.customRulesJson);
    } catch {
      console.warn('Failed to parse custom rules JSON');
    }
  }

  return {
    tenantId: config.tenantId,
    tenantName: config.tenantName,
    tier: config.tier || 'free',
    features: config.features || [],
    ruleOverrides,
    customRules,
  };
}

/**
 * Serialize tenant context for storage.
 */
export function serializeTenantContext(context: TenantContext): string {
  return JSON.stringify(context);
}

/**
 * Deserialize tenant context from storage.
 */
export function deserializeTenantContext(json: string): TenantContext {
  try {
    return JSON.parse(json) as TenantContext;
  } catch {
    return { ...DEFAULT_TENANT };
  }
}
