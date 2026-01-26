/**
 * Shadow Mode Adapter
 *
 * Runs the new YAML-based eviction rules engine in parallel with the existing
 * TypeScript validators and reports any discrepancies.
 *
 * DESIGN:
 * - Does NOT modify production behavior
 * - Only used in tests and CI audit scripts
 * - Compares blocker IDs, warning IDs, and severity levels
 * - Returns a structured report for analysis
 *
 * USAGE:
 * - In tests: Assert report.discrepancies is empty
 * - In CI: Fail build if discrepancy rate exceeds threshold
 */

import { runRuleBasedChecks } from './pre-generation-check';
import type { ConsistencyIssue } from './pre-generation-check';
import { evaluateNoticeCompliance, type ComplianceResult } from '../notices/evaluate-notice-compliance';
import {
  evaluateEvictionRules,
  type ValidationEngineResult,
  type Jurisdiction,
  type Product,
  type EvictionRoute,
  type EvictionFacts,
} from './eviction-rules-engine';

// ============================================================================
// TYPES
// ============================================================================

export type DiscrepancyType =
  | 'missing_in_yaml'      // TS found it, YAML didn't
  | 'extra_in_yaml'        // YAML found it, TS didn't
  | 'severity_mismatch'    // Both found it but different severity
  | 'message_mismatch';    // Both found it but different message (informational)

export interface Discrepancy {
  type: DiscrepancyType;
  ruleId: string;
  tsValue?: {
    severity?: string;
    message?: string;
    code?: string;
  };
  yamlValue?: {
    severity?: string;
    message?: string;
    id?: string;
  };
}

export interface ShadowModeReport {
  timestamp: string;
  jurisdiction: Jurisdiction;
  product: Product;
  route: EvictionRoute;
  ts: {
    blockers: number;
    warnings: number;
    blockerIds: string[];
    warningIds: string[];
  };
  yaml: {
    blockers: number;
    warnings: number;
    blockerIds: string[];
    warningIds: string[];
  };
  discrepancies: Discrepancy[];
  parity: boolean;
  parityPercent: number;
  durationMs: number;
}

// ============================================================================
// ID NORMALIZATION
// ============================================================================

/**
 * Normalize rule IDs for comparison.
 * TS validators use codes like 'S21_DEPOSIT_NOT_PROTECTED'
 * YAML uses IDs like 's21_deposit_not_protected'
 */
function normalizeId(id: string): string {
  return id.toLowerCase().replace(/-/g, '_');
}

/**
 * Map known TS validator codes to YAML rule IDs.
 * Phase 1: YAML rules now use TS-compatible IDs for England S21.
 * This mapping handles remaining legacy codes and other jurisdictions.
 */
const TS_TO_YAML_ID_MAP: Record<string, string> = {
  // Pre-generation-check.ts codes -> YAML IDs
  'missing_landlord_name': 'landlord_name_required',
  'missing_tenant_name': 'tenant_name_required',
  'missing_property_address': 'property_address_required',
  'missing_tenancy_start_date': 'tenancy_start_date_required',
  'future_tenancy_start': 'tenancy_start_date_future',
  'missing_notice_service_date': 'notice_service_date_required',
  's21_retaliatory_eviction_risk': 's21_retaliatory_risk',
  's8_no_grounds': 's8_grounds_required',
  's8_arrears_ground_no_data': 's8_arrears_ground_no_data',
  'ground_8_threshold_not_met': 's8_ground8_threshold_not_met',
  's8_no_particulars': 's8_no_particulars',

  // England S21 - evaluate-notice-compliance.ts codes
  // Note: YAML rules now use same IDs as TS codes (after normalization)
  // These mappings are identity mappings for clarity
  's21_deposit_noncompliant': 's21_deposit_noncompliant',
  's21_epc': 's21_epc',
  's21_h2r': 's21_h2r',
  's21_gas_cert': 's21_gas_cert',
  's21_licensing': 's21_licensing',
  's21_four_month_bar': 's21_four_month_bar',
  's21_retaliatory_improvement_notice': 's21_retaliatory_improvement_notice',
  's21_retaliatory_emergency_action': 's21_retaliatory_emergency_action',
  's21_deposit_cap_exceeded': 's21_deposit_cap_exceeded',
  's21_date_too_soon': 's21_notice_period_short',
  's21_minimum_notice': 's21_notice_period_short',
  's21_prohibited_fees': 's21_prohibited_fees_charged',
  's21_prohibited_fees_unconfirmed': 's21_prohibited_fees_unconfirmed',

  // Legacy dash-separated versions (normalize to underscore)
  's21-deposit-noncompliant': 's21_deposit_noncompliant',
  's21-epc': 's21_epc',
  's21-h2r': 's21_h2r',
  's21-gas-cert': 's21_gas_cert',
  's21-licensing': 's21_licensing',
  's21-licensing-required': 's21_licensing',
  's21-licensing-confirm': 's21_licensing',
  's21-four-month-bar': 's21_four_month_bar',
  's21-retaliatory-improvement-notice': 's21_retaliatory_improvement_notice',
  's21-retaliatory-emergency-action': 's21_retaliatory_emergency_action',
  's21-deposit-cap-exceeded': 's21_deposit_cap_exceeded',
  's21-date-too-soon': 's21_notice_period_short',
  's21-prescribed-info-required': 's21_prescribed_info_unconfirmed',

  // England S8 - TS Codes: S8-GROUNDS-REQUIRED, S8-NOTICE-PERIOD
  's8-grounds-required': 's8_grounds_required',
  's8_grounds_required': 's8_grounds_required',
  's8-notice-period': 's8_notice_period',
  's8_notice_period': 's8_notice_period',
  // Legacy mappings (commented rules in YAML, kept for complete_pack)
  's8-ground8-threshold': 's8_ground8_threshold_not_met',
  's8_ground8_threshold': 's8_ground8_threshold_not_met',
  's8-particulars-incomplete': 's8_no_particulars',
  's8_particulars_incomplete': 's8_no_particulars',

  // Wales S173 codes - TS Codes: S173-LICENSING, S173-PERIOD-BAR, S173-NOTICE-PERIOD-UNDETERMINED
  // YAML now uses TS-compatible IDs for parity
  's173-licensing': 's173_licensing',
  's173_licensing': 's173_licensing',
  's173-period-bar': 's173_period_bar',
  's173_period_bar': 's173_period_bar',
  's173-notice-period-undetermined': 's173_notice_period_undetermined',
  's173_notice_period_undetermined': 's173_notice_period_undetermined',
  // Legacy mappings (commented rules in YAML, kept for complete_pack)
  's173-deposit': 's173_deposit_not_protected',
  's173-notice-period': 's173_notice_period_short',
  'wales_s173_notice_period_short': 's173_notice_period_short',
  'wales_deposit_not_protected': 's173_deposit_not_protected',
  'wales_written_statement_missing': 's173_written_statement_missing',
  // Wales fault-based
  'wales_fault_no_grounds': 'wales_fault_no_grounds',
  'wales_fault_notice_period_short': 'wales_fault_notice_period_short',

  // Scotland NTL codes - TS Codes: NTL-GROUND-REQUIRED, NTL-MIXED-GROUNDS, NTL-PRE-ACTION, NTL-NOTICE-PERIOD
  // YAML now uses TS-compatible IDs for parity
  'ntl-ground-required': 'ntl_ground_required',
  'ntl_ground_required': 'ntl_ground_required',
  'ntl-mixed-grounds': 'ntl_mixed_grounds',
  'ntl_mixed_grounds': 'ntl_mixed_grounds',
  'ntl-pre-action': 'ntl_pre_action',
  'ntl_pre_action': 'ntl_pre_action',
  'ntl-notice-period': 'ntl_notice_period',
  'ntl_notice_period': 'ntl_notice_period',
  // Legacy mappings (commented rules in YAML, kept for complete_pack)
  'scotland_no_grounds': 'ntl_ground_required',
  'scotland_landlord_not_registered': 'ntl_landlord_not_registered',
  'scotland_pre_action_not_completed': 'ntl_pre_action',
  'scotland_notice_period_short': 'ntl_notice_period',
};

function mapTsIdToYamlId(tsId: string): string {
  const normalized = normalizeId(tsId);
  return TS_TO_YAML_ID_MAP[normalized] || normalized;
}

// ============================================================================
// SHADOW MODE RUNNER
// ============================================================================

export interface ShadowValidationParams {
  facts: EvictionFacts;
  jurisdiction: Jurisdiction;
  product: Product;
  route: EvictionRoute;
}

/**
 * Runs shadow validation: compares existing TS validators with new YAML engine.
 *
 * @param params - The validation parameters
 * @returns A shadow mode report with discrepancies
 */
export async function runShadowValidation(
  params: ShadowValidationParams
): Promise<ShadowModeReport> {
  const { facts, jurisdiction, product, route } = params;
  const startTime = performance.now();

  // 1. Run existing TS validators
  let tsBlockerIds: string[] = [];
  let tsWarningIds: string[] = [];

  // For complete_pack, use runRuleBasedChecks
  if (product === 'complete_pack') {
    const tsResult = runRuleBasedChecks(facts as Record<string, any>, product);
    tsBlockerIds = tsResult
      .filter((i) => i.severity === 'blocker')
      .map((i) => normalizeId(i.code));
    tsWarningIds = tsResult
      .filter((i) => i.severity === 'warning')
      .map((i) => normalizeId(i.code));
  } else {
    // For notice_only, use evaluateNoticeCompliance
    try {
      const complianceResult = evaluateNoticeCompliance({
        jurisdiction,
        product: 'notice_only',
        selected_route: route,
        wizardFacts: facts,
        stage: 'generate',
      });

      tsBlockerIds = complianceResult.hardFailures.map((f) => normalizeId(f.code));
      tsWarningIds = complianceResult.warnings.map((w) => normalizeId(w.code));
    } catch (error) {
      console.warn('[ShadowMode] TS validator threw error:', error);
    }
  }

  // 2. Run new YAML engine
  const yamlResult = evaluateEvictionRules(facts, jurisdiction, product, route);
  const yamlBlockerIds = yamlResult.blockers.map((b) => normalizeId(b.id));
  const yamlWarningIds = yamlResult.warnings.map((w) => normalizeId(w.id));

  // 3. Compare results
  const discrepancies = detectDiscrepancies(
    { blockerIds: tsBlockerIds, warningIds: tsWarningIds },
    { blockerIds: yamlBlockerIds, warningIds: yamlWarningIds }
  );

  // 4. Calculate parity
  const totalTsRules = tsBlockerIds.length + tsWarningIds.length;
  const matchedRules = totalTsRules - discrepancies.filter(
    (d) => d.type === 'missing_in_yaml'
  ).length;
  const parityPercent = totalTsRules > 0
    ? Math.round((matchedRules / totalTsRules) * 100)
    : 100;

  const endTime = performance.now();

  return {
    timestamp: new Date().toISOString(),
    jurisdiction,
    product,
    route,
    ts: {
      blockers: tsBlockerIds.length,
      warnings: tsWarningIds.length,
      blockerIds: tsBlockerIds,
      warningIds: tsWarningIds,
    },
    yaml: {
      blockers: yamlResult.blockers.length,
      warnings: yamlResult.warnings.length,
      blockerIds: yamlBlockerIds,
      warningIds: yamlWarningIds,
    },
    discrepancies,
    parity: discrepancies.length === 0,
    parityPercent,
    durationMs: endTime - startTime,
  };
}

/**
 * Detects discrepancies between TS and YAML validation results.
 */
function detectDiscrepancies(
  ts: { blockerIds: string[]; warningIds: string[] },
  yaml: { blockerIds: string[]; warningIds: string[] }
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  // Create sets for efficient lookup
  const tsBlockerSet = new Set(ts.blockerIds.map(mapTsIdToYamlId));
  const tsWarningSet = new Set(ts.warningIds.map(mapTsIdToYamlId));
  const yamlBlockerSet = new Set(yaml.blockerIds);
  const yamlWarningSet = new Set(yaml.warningIds);

  // 1. Check for rules missing in YAML (TS found but YAML didn't)
  for (const tsId of ts.blockerIds) {
    const mappedId = mapTsIdToYamlId(tsId);
    if (!yamlBlockerSet.has(mappedId) && !yamlWarningSet.has(mappedId)) {
      discrepancies.push({
        type: 'missing_in_yaml',
        ruleId: tsId,
        tsValue: { severity: 'blocker', code: tsId },
      });
    }
  }

  for (const tsId of ts.warningIds) {
    const mappedId = mapTsIdToYamlId(tsId);
    if (!yamlBlockerSet.has(mappedId) && !yamlWarningSet.has(mappedId)) {
      discrepancies.push({
        type: 'missing_in_yaml',
        ruleId: tsId,
        tsValue: { severity: 'warning', code: tsId },
      });
    }
  }

  // 2. Check for extra rules in YAML (YAML found but TS didn't)
  for (const yamlId of yaml.blockerIds) {
    if (!tsBlockerSet.has(yamlId) && !tsWarningSet.has(yamlId)) {
      discrepancies.push({
        type: 'extra_in_yaml',
        ruleId: yamlId,
        yamlValue: { severity: 'blocker', id: yamlId },
      });
    }
  }

  for (const yamlId of yaml.warningIds) {
    if (!tsBlockerSet.has(yamlId) && !tsWarningSet.has(yamlId)) {
      discrepancies.push({
        type: 'extra_in_yaml',
        ruleId: yamlId,
        yamlValue: { severity: 'warning', id: yamlId },
      });
    }
  }

  // 3. Check for severity mismatches
  for (const tsId of ts.blockerIds) {
    const mappedId = mapTsIdToYamlId(tsId);
    if (yamlWarningSet.has(mappedId) && !yamlBlockerSet.has(mappedId)) {
      discrepancies.push({
        type: 'severity_mismatch',
        ruleId: tsId,
        tsValue: { severity: 'blocker', code: tsId },
        yamlValue: { severity: 'warning', id: mappedId },
      });
    }
  }

  for (const tsId of ts.warningIds) {
    const mappedId = mapTsIdToYamlId(tsId);
    if (yamlBlockerSet.has(mappedId) && !yamlWarningSet.has(mappedId)) {
      discrepancies.push({
        type: 'severity_mismatch',
        ruleId: tsId,
        tsValue: { severity: 'warning', code: tsId },
        yamlValue: { severity: 'blocker', id: mappedId },
      });
    }
  }

  return discrepancies;
}

/**
 * Run shadow validation for multiple test cases.
 */
export async function runShadowValidationBatch(
  testCases: ShadowValidationParams[]
): Promise<{
  reports: ShadowModeReport[];
  summary: {
    totalCases: number;
    parityCount: number;
    discrepancyCount: number;
    parityPercent: number;
    avgDurationMs: number;
  };
}> {
  const reports: ShadowModeReport[] = [];

  for (const testCase of testCases) {
    const report = await runShadowValidation(testCase);
    reports.push(report);
  }

  const parityCount = reports.filter((r) => r.parity).length;
  const totalDuration = reports.reduce((sum, r) => sum + r.durationMs, 0);

  return {
    reports,
    summary: {
      totalCases: testCases.length,
      parityCount,
      discrepancyCount: testCases.length - parityCount,
      parityPercent: Math.round((parityCount / testCases.length) * 100),
      avgDurationMs: Math.round(totalDuration / testCases.length),
    },
  };
}

/**
 * Format a shadow mode report for console output.
 */
export function formatShadowReport(report: ShadowModeReport): string {
  const lines: string[] = [
    `\n========================================`,
    `Shadow Mode Report`,
    `========================================`,
    `Timestamp: ${report.timestamp}`,
    `Jurisdiction: ${report.jurisdiction}`,
    `Product: ${report.product}`,
    `Route: ${report.route}`,
    `Duration: ${report.durationMs.toFixed(2)}ms`,
    ``,
    `TS Validator:`,
    `  Blockers: ${report.ts.blockers} [${report.ts.blockerIds.join(', ')}]`,
    `  Warnings: ${report.ts.warnings} [${report.ts.warningIds.join(', ')}]`,
    ``,
    `YAML Engine:`,
    `  Blockers: ${report.yaml.blockers} [${report.yaml.blockerIds.join(', ')}]`,
    `  Warnings: ${report.yaml.warnings} [${report.yaml.warningIds.join(', ')}]`,
    ``,
    `Parity: ${report.parity ? '✅ YES' : '❌ NO'} (${report.parityPercent}%)`,
  ];

  if (report.discrepancies.length > 0) {
    lines.push(``, `Discrepancies (${report.discrepancies.length}):`);
    for (const d of report.discrepancies) {
      lines.push(`  - [${d.type}] ${d.ruleId}`);
      if (d.tsValue) lines.push(`      TS: ${JSON.stringify(d.tsValue)}`);
      if (d.yamlValue) lines.push(`      YAML: ${JSON.stringify(d.yamlValue)}`);
    }
  }

  lines.push(`========================================\n`);
  return lines.join('\n');
}

/**
 * Check if shadow mode is enabled via environment variable.
 */
export function isShadowModeEnabled(): boolean {
  return process.env.EVICTION_SHADOW_MODE === 'true';
}
