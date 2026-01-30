/**
 * Flow Validation Orchestrator
 *
 * Unified validation pipeline used by all API endpoints.
 * Coordinates capability matrix, facts schema, requirements engine, and issue generation.
 */

import { assertFlowSupported, type FlowCapability, type Jurisdiction, type Product } from '../jurisdictions/capabilities/matrix';
import { getRequirements, type ValidationStage } from '../jurisdictions/requirements';
import { validateRequirements, type ValidationIssue, type ValidationOutput } from '../jurisdictions/requirementsValidator';
import { collectSchemaKeys } from '../jurisdictions/facts/referenceScanner';
import { runDecisionEngine, type DecisionInput } from '../decision-engine';
import { mapDecisionIssuesToValidationIssues } from '../decision-engine/issueMapper';
import { wizardFactsToCaseFacts } from '../case-facts/normalize';
import type { CanonicalJurisdiction } from '../types/jurisdiction';
import * as fs from 'fs';
import * as path from 'path';

export interface FlowValidationInput {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  stage: ValidationStage;
  facts: Record<string, unknown>;
  caseId?: string;
}

export interface FlowValidationResult {
  ok: boolean;
  status: 'ok' | 'invalid' | 'unsupported' | 'misconfigured';
  blocking_issues: ValidationIssue[];
  warnings: ValidationIssue[];
  code?: string;
  error?: string;
  user_message?: string;
}

/**
 * Deduplicate issues by (code + field + affected_question_id)
 */
function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  const deduped: ValidationIssue[] = [];

  for (const issue of issues) {
    const key = `${issue.code}:${issue.fields.join(',')}:${issue.affected_question_id || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(issue);
    }
  }

  return deduped;
}

/**
 * Validate facts against schema for a jurisdiction
 */
function validateFactsSchema(
  jurisdiction: Jurisdiction,
  facts: Record<string, unknown>
): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  try {
    const schemaPath = path.join(process.cwd(), 'config', 'jurisdictions', 'uk', jurisdiction, 'facts_schema.json');

    if (!fs.existsSync(schemaPath)) {
      return { valid: true, issues: [] }; // Schema not found, skip validation
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const schemaKeys = collectSchemaKeys(schema);

    // Check for unknown fact keys (facts not in schema)
    for (const factKey of Object.keys(facts)) {
      if (!schemaKeys.has(factKey)) {
        // This is informational, not blocking
        issues.push({
          code: 'UNKNOWN_FACT_KEY',
          severity: 'warning',
          fields: [factKey],
          user_fix_hint: `Fact key '${factKey}' is not defined in the schema for ${jurisdiction}`,
          internal_reason: `Unknown fact key: ${factKey}`,
        });
      }
    }
  } catch (error) {
    console.error('Facts schema validation error:', error);
    // Don't block on schema validation errors
  }

  return { valid: true, issues };
}

/**
 * Normalize grounds keys to canonical ground_codes
 * Bridges multiple ground key variants (section8_grounds, section_8_grounds, selected_grounds, etc.)
 * to the canonical ground_codes key expected by requirements and templates.
 */
function normalizeGroundsCodes(facts: Record<string, unknown>): Record<string, unknown> {
  // If ground_codes already exists, don't overwrite it
  if (facts.ground_codes) {
    return facts;
  }

  // List of known ground key variants used across flows
  const groundKeyVariants = [
    'section8_grounds',
    'section_8_grounds',
    'selected_grounds',
    'grounds',
    'eviction_grounds',
    'section8_grounds_selection',
  ];

  // Find first available ground key variant
  for (const key of groundKeyVariants) {
    const value = facts[key];
    if (value !== undefined && value !== null) {
      // Normalize to array if needed
      let normalizedValue: string[] = [];
      if (Array.isArray(value)) {
        normalizedValue = value;
      } else if (typeof value === 'string') {
        normalizedValue = value.split(',').map(v => v.trim()).filter(Boolean);
      }

      // Set canonical key
      return {
        ...facts,
        ground_codes: normalizedValue,
      };
    }
  }

  return facts;
}

/**
 * Normalize retaliatory eviction toggle to canonical recent_repair_complaints
 * Wizard question: "Is this notice being served more than 6 months after any repair complaint?"
 * - yes -> recent_repair_complaints = false
 * - no -> recent_repair_complaints = true
 */
function normalizeRetaliatoryNotice(facts: Record<string, unknown>): Record<string, unknown> {
  if (facts.recent_repair_complaints !== undefined) {
    return facts;
  }

  const raw = (facts as any).no_retaliatory_notice;
  if (raw === undefined || raw === null) {
    return facts;
  }

  const normalized = { ...facts } as Record<string, unknown>;

  if (raw === true) {
    normalized.recent_repair_complaints = false;
  } else if (raw === false) {
    normalized.recent_repair_complaints = true;
  } else if (typeof raw === 'string') {
    const value = raw.toLowerCase().trim();
    if (['true', 'yes', 'y', '1'].includes(value)) {
      normalized.recent_repair_complaints = false;
    } else if (['false', 'no', 'n', '0'].includes(value)) {
      normalized.recent_repair_complaints = true;
    }
  }

  return normalized;
}

/**
 * Normalize tenancy agreement wizard facts to legal document schema fields.
 *
 * Maps TenancySectionFlow wizard fact names to the canonical legal schema names
 * expected by the document generation validation.
 *
 * Wizard → Legal Schema:
 * - tenants[].full_name → tenant_full_name (joined with " and " if multiple)
 * - tenants[1].full_name → tenant_2_name
 * - rent_period → rent_frequency
 * - rent_due_day → payment_date
 * - is_fixed_term → tenancy_type ("ast" for fixed, "periodic" otherwise)
 * - tenancy_end_date → fixed_term_end_date (when is_fixed_term)
 * - landlord_service_address_* → landlord_address_* (if no separate landlord address)
 *
 * @param facts - Wizard facts from TenancySectionFlow
 * @returns Normalized facts with legal schema field names
 */
export function normalizeTenancyFacts(facts: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...facts } as Record<string, unknown>;

  // === tenant_full_name from tenants[] array ===
  if (!normalized.tenant_full_name) {
    const tenants = normalized.tenants as Array<{ full_name?: string }> | undefined;
    if (tenants && Array.isArray(tenants) && tenants.length > 0) {
      // Join all tenant names with " and "
      const tenantNames = tenants
        .map(t => t?.full_name)
        .filter((name): name is string => Boolean(name));

      if (tenantNames.length > 0) {
        normalized.tenant_full_name = tenantNames.join(' and ');
      }

      // Also extract tenant_2_name for joint tenant validation
      if (tenantNames.length > 1 && !normalized.tenant_2_name) {
        normalized.tenant_2_name = tenantNames[1];
      }

      // Set joint_tenants flag if not already set
      if (normalized.joint_tenants === undefined && tenantNames.length > 1) {
        normalized.joint_tenants = true;
      }
    }
  }

  // === rent_frequency from rent_period ===
  if (!normalized.rent_frequency && normalized.rent_period) {
    const rentPeriod = String(normalized.rent_period).toLowerCase();
    // Map wizard values to legal schema values
    if (rentPeriod.includes('month')) {
      normalized.rent_frequency = 'monthly';
    } else if (rentPeriod.includes('week')) {
      normalized.rent_frequency = 'weekly';
    } else if (rentPeriod.includes('quarter')) {
      normalized.rent_frequency = 'quarterly';
    } else if (rentPeriod.includes('year') || rentPeriod.includes('annual')) {
      normalized.rent_frequency = 'annually';
    } else {
      // Pass through as-is
      normalized.rent_frequency = normalized.rent_period;
    }
  }

  // === payment_date from rent_due_day ===
  if (!normalized.payment_date && normalized.rent_due_day) {
    const dueDay = normalized.rent_due_day;
    if (typeof dueDay === 'number') {
      normalized.payment_date = dueDay;
    } else if (typeof dueDay === 'string') {
      // Handle "1st", "2nd", "15th", "Last day of month" etc.
      const dayMatch = dueDay.match(/^(\d+)/);
      if (dayMatch) {
        normalized.payment_date = parseInt(dayMatch[1], 10);
      } else if (dueDay.toLowerCase().includes('last')) {
        // Last day of month - use 31 as convention
        normalized.payment_date = 31;
      }
    }
  }

  // === tenancy_type from is_fixed_term ===
  if (!normalized.tenancy_type) {
    if (normalized.is_fixed_term === true) {
      normalized.tenancy_type = 'ast'; // Assured Shorthold Tenancy (fixed term)
    } else if (normalized.is_fixed_term === false) {
      normalized.tenancy_type = 'periodic'; // Periodic tenancy
    }
  }

  // === fixed_term_end_date from tenancy_end_date (when fixed term) ===
  if (!normalized.fixed_term_end_date && normalized.is_fixed_term === true) {
    if (normalized.tenancy_end_date) {
      normalized.fixed_term_end_date = normalized.tenancy_end_date;
    }
  }

  // === fixed_term from is_fixed_term (alternate name) ===
  if (normalized.fixed_term === undefined && normalized.is_fixed_term !== undefined) {
    normalized.fixed_term = normalized.is_fixed_term;
  }

  // === landlord_address from landlord_service_address (fallback) ===
  // If landlord address is missing but service address exists, use service address
  if (!normalized.landlord_address_line1 && normalized.landlord_service_address_line1) {
    normalized.landlord_address_line1 = normalized.landlord_service_address_line1;
  }
  if (!normalized.landlord_address_town && normalized.landlord_service_address_town) {
    normalized.landlord_address_town = normalized.landlord_service_address_town;
  }
  if (!normalized.landlord_address_postcode && normalized.landlord_service_address_postcode) {
    normalized.landlord_address_postcode = normalized.landlord_service_address_postcode;
  }

  // === number_of_tenants for joint tenants detection ===
  if (normalized.number_of_tenants !== undefined) {
    const numTenants = parseInt(String(normalized.number_of_tenants), 10);
    if (!isNaN(numTenants) && numTenants > 1 && normalized.joint_tenants === undefined) {
      normalized.joint_tenants = true;
    }
  }

  return normalized;
}

/**
 * Unified flow validation orchestrator
 *
 * Steps:
 * 0. Normalize facts (canonicalize ground keys)
 * 1. Assert flow is supported via capability matrix
 * 2. Validate facts against schema
 * 3. Get requirements for stage
 * 4. Validate requirements and generate issues
 * 5. Run decision engine for compliance checks (eviction flows only)
 * 6. Merge decision engine issues with requirements issues
 * 7. Dedupe issues
 * 8. Return standardized result
 */
export function validateFlow(input: FlowValidationInput): FlowValidationResult {
  const { jurisdiction, product, route, stage } = input;

  // Step 0: Normalize facts (canonicalize grounds, retaliatory notice, and tenancy fields)
  const facts = normalizeTenancyFacts(
    normalizeRetaliatoryNotice(
      normalizeGroundsCodes(input.facts)
    )
  );

  // Step 1: Assert flow is supported
  let flow: FlowCapability;
  try {
    flow = assertFlowSupported(jurisdiction, product, route);
  } catch (error: any) {
    // Flow is unsupported or misconfigured
    if (error.statusCode === 422 && error.payload) {
      return {
        ok: false,
        status: 'unsupported',
        blocking_issues: error.payload.blocking_issues || [],
        warnings: error.payload.warnings || [],
        code: error.payload.code,
        error: error.payload.error,
        user_message: error.payload.user_message,
      };
    }

    // Unexpected error
    return {
      ok: false,
      status: 'unsupported',
      blocking_issues: [{
        code: 'FLOW_VALIDATION_ERROR',
        severity: 'blocking',
        fields: [],
        user_fix_hint: error.message || 'Flow validation failed',
      }],
      warnings: [],
      error: error.message,
    };
  }

  // Step 2: Validate facts against schema
  const schemaValidation = validateFactsSchema(jurisdiction, facts);

  // Step 3: Get requirements for this stage
  const ctx = { jurisdiction, product, route, stage, facts };
  const requirements = getRequirements(ctx);

  // Step 4: Validate requirements and generate issues
  const validation = validateRequirements(ctx);

  // Step 5: Run decision engine for compliance checks (eviction flows only)
  let decisionIssues: ValidationIssue[] = [];

  if (product === 'notice_only' || product === 'eviction_pack') {
    try {
      // Convert facts to CaseFacts for decision engine
      const caseFacts = wizardFactsToCaseFacts(facts);

      // Translate eviction_pack to complete_pack for decision engine compatibility
      const decisionProduct = product === 'eviction_pack' ? 'complete_pack' : product;

      const decisionInput: DecisionInput = {
        jurisdiction: jurisdiction as CanonicalJurisdiction,
        product: decisionProduct,
        case_type: 'eviction',
        facts: caseFacts,
        stage, // Pass stage for stage-aware compliance checks
      };

      const decisionOutput = runDecisionEngine(decisionInput);

      // Convert decision engine BlockingIssue to ValidationIssue
      let mappedIssues = mapDecisionIssuesToValidationIssues(
        decisionOutput.blocking_issues,
        { jurisdiction, product, route }
      );

      // Filter issues by route - only apply issues that match the current route
      // For example, deposit protection issues (route='section_21') should NOT block section_8
      mappedIssues = mappedIssues.map(issue => {
        const originalIssue = decisionOutput.blocking_issues.find(
          bi => bi.issue.toUpperCase() === issue.code
        );

        if (!originalIssue) {
          return issue;
        }

        // If the issue is for a different route, handle appropriately
        if (originalIssue.route !== route) {
          // Section 21-specific compliance issues should not block Section 8
          if (
            (route === 'section_8' || route === 'wales_fault_based') &&
            (originalIssue.issue === 'deposit_not_protected' ||
             originalIssue.issue === 'prescribed_info_not_given')
          ) {
            // Filter out entirely - these are not relevant for Section 8
            return null;
          }

          // For other route mismatches, downgrade to warning
          return {
            ...issue,
            severity: 'warning' as const,
            user_fix_hint: `Note: ${issue.user_fix_hint || originalIssue.description}`,
          };
        }

        return issue;
      }).filter((issue): issue is ValidationIssue => issue !== null);

      decisionIssues = mappedIssues;

      // Add decision engine warnings as well
      const decisionWarnings = decisionOutput.warnings.map(w => ({
        code: 'DECISION_ENGINE_WARNING',
        severity: 'warning' as const,
        fields: [],
        user_fix_hint: w,
      }));

      decisionIssues = [...decisionIssues, ...decisionWarnings];
    } catch (error) {
      console.error('Decision engine error:', error);
      // Don't block on decision engine errors - continue with requirements validation only
    }
  }

  // Step 6: Merge decision engine issues with requirements issues
  let allBlockingIssues = [
    ...validation.blocking_issues,
    ...decisionIssues.filter(i => i.severity === 'blocking'),
  ];

  let allWarnings = [
    ...validation.warnings,
    ...schemaValidation.issues,
    ...decisionIssues.filter(i => i.severity === 'warning'),
  ];

  // Step 7: Dedupe issues
  allBlockingIssues = dedupeIssues(allBlockingIssues);
  allWarnings = dedupeIssues(allWarnings);

  // Step 8: Filter out UNKNOWN_FACT_KEY warnings from user-facing output
  // These are useful for internal logging but should not be shown to users
  allWarnings = allWarnings.filter(w => w.code !== 'UNKNOWN_FACT_KEY');

  // Step 9: Return standardized result
  const hasBlockingIssues = allBlockingIssues.length > 0;

  if (hasBlockingIssues) {
    return {
      ok: false,
      status: 'invalid',
      blocking_issues: allBlockingIssues,
      warnings: allWarnings,
      code: 'LEGAL_BLOCK',
      error: 'LEGAL_BLOCK',
      user_message: 'Cannot proceed: required information is missing or invalid',
    };
  }

  return {
    ok: true,
    status: 'ok',
    blocking_issues: [],
    warnings: allWarnings,
  };
}

/**
 * Create standardized 422 payload from validation result
 */
export function create422Response(result: FlowValidationResult) {
  return {
    code: result.code || 'VALIDATION_FAILED',
    error: result.error || result.code || 'Validation failed',
    user_message: result.user_message || result.blocking_issues.map(i => i.user_fix_hint).join('; ') || 'Validation failed',
    blocking_issues: result.blocking_issues.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      alternate_question_ids: issue.alternate_question_ids,
      user_fix_hint: issue.user_fix_hint,
    })),
    warnings: result.warnings.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      user_fix_hint: issue.user_fix_hint,
    })),
  };
}
