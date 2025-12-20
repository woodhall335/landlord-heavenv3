/**
 * Flow Harness Test Infrastructure
 *
 * Provides utilities for E2E testing of all supported flows.
 * Driven by capability matrix to ensure complete coverage.
 */

import { getCapabilityMatrix, type Jurisdiction, type Product } from '../lib/jurisdictions/capabilities/matrix';
import type { ValidationIssue } from '../lib/jurisdictions/requirementsValidator';

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
 * Create minimal compliant facts for a flow
 * These are the bare minimum facts needed to pass validation
 */
export function getMinimalCompliantFacts(flow: FlowDefinition): Record<string, any> {
  const { jurisdiction, product, route } = flow;

  // Base facts required for all flows
  const baseFacts: Record<string, any> = {
    // Landlord details
    landlord_full_name: 'Test Landlord',
    landlord_address_line1: '123 Test Street',
    landlord_city: jurisdiction === 'scotland' ? 'Edinburgh' : jurisdiction === 'wales' ? 'Cardiff' : 'London',
    landlord_postcode: jurisdiction === 'scotland' ? 'EH1 1AA' : jurisdiction === 'wales' ? 'CF10 1AA' : 'SW1A 1AA',

    // Tenant details
    tenant_full_name: 'Test Tenant',

    // Property details
    property_address_line1: '456 Property Street',
    property_city: jurisdiction === 'scotland' ? 'Edinburgh' : jurisdiction === 'wales' ? 'Cardiff' : 'London',
    property_postcode: jurisdiction === 'scotland' ? 'EH2 2BB' : jurisdiction === 'wales' ? 'CF10 2BB' : 'SW1A 2BB',

    // Tenancy details
    tenancy_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',
  };

  // Product-specific facts
  if (product === 'notice_only' || product === 'eviction_pack') {
    baseFacts.notice_expiry_date = '2024-03-01';

    // Route-specific facts for eviction
    if (route === 'section_21') {
      baseFacts.is_fixed_term = false;
      baseFacts.deposit_taken = false; // No deposit to avoid compliance requirements
      baseFacts.has_gas_appliances = false; // No gas to avoid gas safety requirements
    } else if (route === 'section_8') {
      baseFacts.ground_codes = ['8']; // Rent arrears ground
      baseFacts.total_arrears = 3000; // 3 months arrears for Ground 8
    } else if (route === 'notice_to_leave') {
      baseFacts.ground_codes = ['Ground 1']; // Rent arrears for Scotland
      baseFacts.total_arrears = 3500;
      baseFacts.pre_action_confirmed = true; // Scotland requires pre-action for rent arrears
    } else if (route === 'wales_section_173') {
      baseFacts.wales_contract_category = 'standard';
      baseFacts.deposit_taken = false;
      baseFacts.rent_smart_wales_registered = true; // Wales compliance
    } else if (route === 'wales_fault_based') {
      baseFacts.wales_contract_category = 'standard';
      baseFacts.ground_codes = ['157']; // Wales rent arrears
      baseFacts.total_arrears = 2500;
    }
  } else if (product === 'money_claim') {
    baseFacts.claim_amount = 5000;
    baseFacts.claim_type = 'rent_arrears';
    baseFacts.total_arrears = 5000;
  } else if (product === 'tenancy_agreement') {
    baseFacts.product_tier = 'Premium AST';
    baseFacts.tenancy_type = 'ast';
  }

  return baseFacts;
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
  // This is a placeholder - in real tests this would call the actual API
  // For now, we'll import validateFlow directly
  const { validateFlow } = require('../lib/validation/validateFlow');

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
  const { validateFlow } = require('../lib/validation/validateFlow');

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
 * Remove one required fact to test validation failure
 */
export function removeOneFact(facts: Record<string, any>): { facts: Record<string, any>; removedKey: string } {
  const keys = Object.keys(facts);
  const keyToRemove = keys[Math.floor(keys.length / 2)]; // Remove a fact from the middle

  const modifiedFacts = { ...facts };
  delete modifiedFacts[keyToRemove];

  return {
    facts: modifiedFacts,
    removedKey: keyToRemove,
  };
}
