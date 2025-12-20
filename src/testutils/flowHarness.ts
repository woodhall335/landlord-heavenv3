/**
 * Flow Harness Test Infrastructure
 *
 * Provides utilities for E2E testing of all supported flows.
 * Driven by capability matrix to ensure complete coverage.
 */

import { getCapabilityMatrix, type Jurisdiction, type Product } from '../lib/jurisdictions/capabilities/matrix';
import type { ValidationIssue } from '../lib/jurisdictions/requirementsValidator';
import { getRequirements } from '../lib/jurisdictions/requirements';
import { validateFlow } from '../lib/validation/validateFlow';

/**
 * Flow definition from capability matrix
 */
export interface FlowDefinition {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  status: 'supported' | 'unsupported' | 'misconfigured';
}

/**
 * Get all supported flows from capability matrix
 */
export function getAllSupportedFlows(): FlowDefinition[] {
  const flows: FlowDefinition[] = [];
  const matrix = getCapabilityMatrix();

  for (const jurisdiction of Object.keys(matrix) as Jurisdiction[]) {
    const products = matrix[jurisdiction];
    for (const product of Object.keys(products) as Product[]) {
      const productConfig = products[product];
      if (productConfig.status !== 'supported') {
        continue; // Skip unsupported products
      }

      const routes = productConfig.routes;
      if (!routes || routes.length === 0) {
        continue; // Skip products without routes
      }

      for (const route of routes) {
        flows.push({
          jurisdiction,
          product,
          route,
          status: productConfig.status,
        });
      }
    }
  }

  return flows.filter(f => f.status === 'supported');
}

/**
 * Get all unsupported/misconfigured flows for negative testing
 */
export function getAllUnsupportedFlows(): FlowDefinition[] {
  const flows: FlowDefinition[] = [];
  const matrix = getCapabilityMatrix();

  for (const jurisdiction of Object.keys(matrix) as Jurisdiction[]) {
    const products = matrix[jurisdiction];
    for (const product of Object.keys(products) as Product[]) {
      const productConfig = products[product];
      // Product-level unsupported/misconfigured
      if (productConfig.status === 'unsupported' || productConfig.status === 'misconfigured') {
        flows.push({
          jurisdiction,
          product,
          route: 'default',
          status: productConfig.status,
        });
        // Note: In current implementation, status is at product level, not route level
        // So we don't iterate routes for unsupported products
      }
    }
  }

  return flows;
}

/**
 * Generate a sensible placeholder value for a fact key
 */
function generateFactValue(factKey: string, jurisdiction: Jurisdiction, product: Product, route: string): any {
  // Dates
  if (factKey.includes('_date') || factKey.includes('_start') || factKey.includes('_end')) {
    return '2024-01-01';
  }

  // Postcodes (jurisdiction-specific)
  if (factKey.includes('postcode')) {
    if (jurisdiction === 'scotland') return 'EH1 1AA';
    if (jurisdiction === 'wales') return 'CF10 1AA';
    if (jurisdiction === 'northern-ireland') return 'BT1 1AA';
    return 'SW1A 1AA'; // England default
  }

  // City/town (jurisdiction-specific)
  if (factKey.includes('city') || factKey.includes('town')) {
    if (jurisdiction === 'scotland') return 'Edinburgh';
    if (jurisdiction === 'wales') return 'Cardiff';
    if (jurisdiction === 'northern-ireland') return 'Belfast';
    return 'London';
  }

  // Amounts and numbers
  if (factKey.includes('amount') || factKey.includes('rent') || factKey.includes('claim') || factKey.includes('arrears')) {
    if (factKey.includes('deposit')) return 1500;
    return 1000;
  }

  // Email addresses
  if (factKey.includes('email')) {
    return 'test@example.com';
  }

  // Phone numbers
  if (factKey.includes('phone') || factKey.includes('tel')) {
    return '07700900000';
  }

  // Ground codes (route-specific)
  if (factKey === 'ground_codes' || factKey.includes('grounds')) {
    if (route === 'section_8') return ['8'];
    if (route === 'notice_to_leave') return ['1'];
    if (route.includes('wales')) return ['157'];
    return ['8'];
  }

  // Frequency
  if (factKey.includes('frequency')) {
    return 'monthly';
  }

  // Tenancy type
  if (factKey === 'tenancy_type') {
    if (jurisdiction === 'scotland') return 'prt';
    return 'ast';
  }

  // Product tier
  if (factKey === 'product_tier') {
    return 'Premium AST';
  }

  // Contract category (Wales)
  if (factKey.includes('contract_category')) {
    return 'standard';
  }

  // Claim type
  if (factKey === 'claim_type' || factKey === 'basis_of_claim') {
    return 'rent_arrears';
  }

  // Names (extract type from key)
  if (factKey.includes('name')) {
    if (factKey.includes('landlord')) return 'Test Landlord';
    if (factKey.includes('tenant')) return 'Test Tenant';
    if (factKey.includes('agent')) return 'Test Agent';
    return 'Test Name';
  }

  // Addresses
  if (factKey.includes('address')) {
    if (factKey.includes('line1')) return '123 Test Street';
    if (factKey.includes('line2')) return '';
    return '123 Test Street';
  }

  // Default: string
  return 'Test';
}

/**
 * Create minimal compliant facts for a flow
 * Derives required facts from requirements engine for stage='generate' (strictest)
 */
export function getMinimalCompliantFacts(flow: FlowDefinition): Record<string, any> {
  const { jurisdiction, product, route } = flow;

  // Start with minimizing toggles to reduce conditional requirements
  const facts: Record<string, any> = {
    // Minimize compliance requirements
    deposit_taken: false,
    has_gas_appliances: false,
    is_fixed_term: false,

    // Essential pre-action for Scotland if needed
    pre_action_confirmed: jurisdiction === 'scotland',

    // Wales compliance
    rent_smart_wales_registered: jurisdiction === 'wales',
  };

  // Get requirements for this flow at generate stage (strictest)
  const requirements = getRequirements({
    jurisdiction,
    product,
    route,
    stage: 'generate',
    facts: {},
  });

  // If flow is unsupported/misconfigured, return minimal facts
  if (requirements.status === 'unsupported' || requirements.status === 'misconfigured') {
    return facts;
  }

  // For each required fact, generate a sensible value
  for (const factKey of requirements.requiredNow) {
    // Skip if already set (e.g., minimizing toggles)
    if (facts[factKey] !== undefined) {
      continue;
    }

    // Skip derived facts (computed, not user-provided)
    if (requirements.derived.has(factKey)) {
      continue;
    }

    // Generate a sensible value for this fact
    facts[factKey] = generateFactValue(factKey, jurisdiction, product, route);
  }

  return facts;
}

/**
 * Validation result from API endpoints
 */
export interface ValidationResult {
  ok: boolean;
  status?: number;
  code?: string;
  blocking_issues?: ValidationIssue[];
  warnings?: ValidationIssue[];
  error?: string;
}

/**
 * Simulate calling the preview endpoint for a flow
 * This would normally make HTTP requests in a real test environment
 */
export function simulatePreviewValidation(
  flow: FlowDefinition,
  facts: Record<string, any>
): ValidationResult {
  try {
    const result = validateFlow({
      jurisdiction: flow.jurisdiction,
      product: flow.product,
      route: flow.route,
      stage: 'preview',
      facts,
    });

    return {
      ok: result.ok,
      status: result.ok ? 200 : 422,
      code: result.code,
      blocking_issues: result.blocking_issues,
      warnings: result.warnings,
      error: result.error,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      error: error.message,
    };
  }
}

/**
 * Simulate calling the generate endpoint for a flow
 */
export function simulateGenerateValidation(
  flow: FlowDefinition,
  facts: Record<string, any>
): ValidationResult {
  try {
    const result = validateFlow({
      jurisdiction: flow.jurisdiction,
      product: flow.product,
      route: flow.route,
      stage: 'generate',
      facts,
    });

    return {
      ok: result.ok,
      status: result.ok ? 200 : 422,
      code: result.code,
      blocking_issues: result.blocking_issues,
      warnings: result.warnings,
      error: result.error,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      error: error.message,
    };
  }
}

/**
 * Check if all blocking issues have affected_question_id
 */
export function allIssuesHaveQuestionId(issues: ValidationIssue[]): boolean {
  return issues.every(issue => {
    // affected_question_id should be present for all blocking issues
    // OR the issue should be about unsupported flows (which don't need question IDs)
    return issue.affected_question_id !== undefined ||
           issue.code === 'FLOW_UNSUPPORTED' ||
           issue.code === 'FLOW_MISCONFIGURED';
  });
}

/**
 * Remove one required fact deterministically to test validation failure
 * Picks the first key in sorted(requiredNow) that exists and is NOT derived
 */
export function removeOneRequiredFact(
  flow: FlowDefinition,
  stage: 'preview' | 'generate',
  facts: Record<string, any>
): { facts: Record<string, any>; removedKey: string } {
  // Get requirements for this flow and stage
  const requirements = getRequirements({
    jurisdiction: flow.jurisdiction,
    product: flow.product,
    route: flow.route,
    stage,
    facts,
  });

  // Find first required fact (sorted alphabetically) that exists and is not derived
  const sortedRequired = Array.from(requirements.requiredNow).sort();
  let keyToRemove = '';

  for (const key of sortedRequired) {
    if (facts[key] !== undefined && !requirements.derived.has(key)) {
      keyToRemove = key;
      break;
    }
  }

  // If no required fact found, fall back to first key
  if (!keyToRemove) {
    keyToRemove = Object.keys(facts)[0] || 'unknown';
  }

  const modifiedFacts = { ...facts };
  delete modifiedFacts[keyToRemove];

  return {
    facts: modifiedFacts,
    removedKey: keyToRemove,
  };
}
