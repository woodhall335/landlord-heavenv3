#!/usr/bin/env npx tsx
/**
 * Eviction Rules Audit Script
 *
 * Validates all eviction YAML rule files for:
 * - Unique IDs across each file
 * - Valid summary section rule references
 * - All conditions pass allowlist validation
 * - No missing required keys
 *
 * Run with: npm run audit:eviction-rules
 * Or directly: npx tsx scripts/audit-eviction-rules.ts
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  validateEvictionCondition,
  EVICTION_ALLOWED_IDENTIFIERS,
} from '../src/lib/validation/eviction-rules-allowlist';

// ============================================================================
// TYPES
// ============================================================================

interface ValidationRule {
  id: string;
  severity: string;
  applies_to: string[];
  applies_when: Array<{ condition: string }>;
  message: string;
  rationale: string;
  field?: string | null;
}

interface SummarySection {
  id: string;
  label: string;
  rules: string[];
}

interface RulesConfig {
  version: string;
  jurisdiction: string;
  product: string;
  last_updated: string;
  metadata?: Record<string, unknown>;
  routes?: string[];
  section_21_rules?: ValidationRule[];
  section_8_rules?: ValidationRule[];
  section_173_rules?: ValidationRule[];
  fault_based_rules?: ValidationRule[];
  notice_to_leave_rules?: ValidationRule[];
  common_rules?: ValidationRule[];
  summary?: {
    blocker_prevents_generation?: boolean;
    warning_shown_in_review?: boolean;
    suggestion_shown_as_tips?: boolean;
    group_by_section?: boolean;
    sections?: SummarySection[];
  };
}

interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  file: string;
  ruleId?: string;
  message: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const RULE_FILES = [
  { path: 'config/legal-requirements/england/notice_only_rules.yaml', jurisdiction: 'england', product: 'notice_only' },
  { path: 'config/legal-requirements/wales/notice_only_rules.yaml', jurisdiction: 'wales', product: 'notice_only' },
  { path: 'config/legal-requirements/scotland/notice_only_rules.yaml', jurisdiction: 'scotland', product: 'notice_only' },
  { path: 'config/legal-requirements/england/complete_pack_rules.yaml', jurisdiction: 'england', product: 'complete_pack' },
];

const REQUIRED_RULE_FIELDS = ['id', 'severity', 'applies_to', 'applies_when', 'message', 'rationale'];
const VALID_SEVERITIES = ['blocker', 'warning', 'suggestion'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAllRules(config: RulesConfig): ValidationRule[] {
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
// AUDIT FUNCTIONS
// ============================================================================

function auditRuleFile(filePath: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const fullPath = path.join(process.cwd(), filePath);

  // Check file exists
  if (!fs.existsSync(fullPath)) {
    issues.push({
      severity: 'error',
      file: filePath,
      message: `File not found: ${filePath}`,
    });
    return issues;
  }

  // Load and parse YAML
  let config: RulesConfig;
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    config = yaml.load(content) as RulesConfig;
  } catch (error: any) {
    issues.push({
      severity: 'error',
      file: filePath,
      message: `YAML parse error: ${error.message}`,
    });
    return issues;
  }

  // Check required top-level fields
  if (!config.version) {
    issues.push({
      severity: 'warning',
      file: filePath,
      message: 'Missing "version" field',
    });
  }
  if (!config.jurisdiction) {
    issues.push({
      severity: 'error',
      file: filePath,
      message: 'Missing "jurisdiction" field',
    });
  }
  if (!config.product) {
    issues.push({
      severity: 'error',
      file: filePath,
      message: 'Missing "product" field',
    });
  }

  // Get all rules
  const allRules = getAllRules(config);
  const ruleIds = new Set<string>();

  // Check each rule
  for (const rule of allRules) {
    // Check required fields
    for (const field of REQUIRED_RULE_FIELDS) {
      if (!(field in rule) || rule[field as keyof ValidationRule] === undefined) {
        issues.push({
          severity: 'error',
          file: filePath,
          ruleId: rule.id || 'unknown',
          message: `Missing required field "${field}"`,
        });
      }
    }

    // Check for duplicate IDs
    if (rule.id) {
      if (ruleIds.has(rule.id)) {
        issues.push({
          severity: 'error',
          file: filePath,
          ruleId: rule.id,
          message: `Duplicate rule ID: "${rule.id}"`,
        });
      }
      ruleIds.add(rule.id);
    }

    // Check severity is valid
    if (rule.severity && !VALID_SEVERITIES.includes(rule.severity)) {
      issues.push({
        severity: 'error',
        file: filePath,
        ruleId: rule.id,
        message: `Invalid severity "${rule.severity}". Must be one of: ${VALID_SEVERITIES.join(', ')}`,
      });
    }

    // Check applies_to is array
    if (rule.applies_to && !Array.isArray(rule.applies_to)) {
      issues.push({
        severity: 'error',
        file: filePath,
        ruleId: rule.id,
        message: `"applies_to" must be an array`,
      });
    }

    // Check applies_when conditions pass allowlist
    if (rule.applies_when && Array.isArray(rule.applies_when)) {
      for (const condObj of rule.applies_when) {
        if (condObj.condition) {
          const validation = validateEvictionCondition(condObj.condition);
          if (!validation.valid) {
            issues.push({
              severity: 'error',
              file: filePath,
              ruleId: rule.id,
              message: `Invalid condition: ${validation.reason}. Condition: "${condObj.condition}"`,
            });
          }
        } else {
          issues.push({
            severity: 'error',
            file: filePath,
            ruleId: rule.id,
            message: `applies_when entry missing "condition" key`,
          });
        }
      }
    }
  }

  // Check summary section rule references
  if (config.summary?.sections) {
    for (const section of config.summary.sections) {
      if (!section.id) {
        issues.push({
          severity: 'warning',
          file: filePath,
          message: `Summary section missing "id" field`,
        });
      }
      if (!section.label) {
        issues.push({
          severity: 'warning',
          file: filePath,
          message: `Summary section "${section.id}" missing "label" field`,
        });
      }
      if (section.rules) {
        for (const ruleRef of section.rules) {
          if (!ruleIds.has(ruleRef)) {
            issues.push({
              severity: 'error',
              file: filePath,
              message: `Summary section "${section.id}" references non-existent rule: "${ruleRef}"`,
            });
          }
        }
      }
    }
  }

  return issues;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         EVICTION RULES YAML AUDIT                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  const fileResults: Array<{ file: string; rules: number; issues: number; errors: number }> = [];

  for (const { path: filePath, jurisdiction, product } of RULE_FILES) {
    console.log(`\n📄 Auditing: ${filePath}`);
    console.log(`   Jurisdiction: ${jurisdiction}, Product: ${product}`);

    const issues = auditRuleFile(filePath);

    // Count rules
    let ruleCount = 0;
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const config = yaml.load(content) as RulesConfig;
        ruleCount = getAllRules(config).length;
      }
    } catch {
      // Ignore
    }

    const fileErrors = issues.filter((i) => i.severity === 'error').length;
    const fileWarnings = issues.filter((i) => i.severity === 'warning').length;
    const fileInfo = issues.filter((i) => i.severity === 'info').length;

    fileResults.push({
      file: filePath,
      rules: ruleCount,
      issues: issues.length,
      errors: fileErrors,
    });

    if (issues.length === 0) {
      console.log(`   ✅ No issues found (${ruleCount} rules)`);
    } else {
      console.log(`   Found ${issues.length} issue(s) in ${ruleCount} rules:`);
      for (const issue of issues) {
        const emoji = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
        const ruleInfo = issue.ruleId ? ` [${issue.ruleId}]` : '';
        console.log(`      ${emoji}${ruleInfo} ${issue.message}`);
      }
    }

    totalIssues += issues.length;
    errorCount += fileErrors;
    warningCount += fileWarnings;
    infoCount += fileInfo;
  }

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         AUDIT SUMMARY                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  console.log('┌─────────────────────────────────────────────────────────────────────┐');
  console.log('│ File                                          │ Rules │ Issues │ Err │');
  console.log('├─────────────────────────────────────────────────────────────────────┤');
  for (const result of fileResults) {
    const fileName = result.file.split('/').pop() || result.file;
    const paddedFile = fileName.padEnd(45);
    const paddedRules = String(result.rules).padStart(5);
    const paddedIssues = String(result.issues).padStart(6);
    const paddedErrors = String(result.errors).padStart(3);
    console.log(`│ ${paddedFile} │ ${paddedRules} │ ${paddedIssues} │ ${paddedErrors} │`);
  }
  console.log('└─────────────────────────────────────────────────────────────────────┘\n');

  const totalRules = fileResults.reduce((sum, r) => sum + r.rules, 0);
  console.log(`Total rules audited: ${totalRules}`);
  console.log(`Total issues: ${totalIssues} (${errorCount} errors, ${warningCount} warnings, ${infoCount} info)\n`);

  if (errorCount > 0) {
    console.log('❌ AUDIT FAILED: Fix the errors above before proceeding.\n');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠️  AUDIT PASSED WITH WARNINGS: Consider fixing warnings above.\n');
    process.exit(0);
  } else {
    console.log('✅ AUDIT PASSED: All eviction rule files are valid.\n');
    process.exit(0);
  }
}

main();
