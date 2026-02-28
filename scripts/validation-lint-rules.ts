#!/usr/bin/env npx tsx
/**
 * Validation Rules Linting CLI
 *
 * Phase 18: Comprehensive rule validation for CI/CD integration.
 *
 * Validates all eviction YAML rule files for:
 * - YAML schema + required fields
 * - Phase 17 safeguards (max rules, max conditions per rule)
 * - Valid requires_feature values
 * - Phase 16 message coverage (every rule has UX messaging)
 * - Allowlist validation for all conditions
 *
 * Exits with code 1 on any error (fails CI).
 *
 * Run with: npm run validation:lint-rules
 * Or directly: npx tsx scripts/validation-lint-rules.ts
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  validateEvictionCondition,
  EVICTION_ALLOWED_IDENTIFIERS,
} from '../src/lib/validation/eviction-rules-allowlist';
import { PHASE_13_RULE_IDS } from '../src/lib/validation/phase13-messages';

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
  requires_feature?: string;
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

interface MessageCatalogSection {
  [ruleId: string]: {
    title: string;
    description: string;
    howToFix: string[];
    legalRef: string;
    helpLink: string;
    supportTags: string[];
  };
}

interface MessageCatalog {
  version: string;
  last_updated: string;
  england_s21: MessageCatalogSection;
  england_s8: MessageCatalogSection;
  wales_s173: MessageCatalogSection;
  scotland_ntl: MessageCatalogSection;
  help_config: Record<string, string>;
  support_categories: Record<string, unknown>;
}

interface LintIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'schema' | 'safeguard' | 'feature' | 'message' | 'condition';
  file: string;
  ruleId?: string;
  message: string;
}

// ============================================================================
// PHASE 17 SAFEGUARD CONFIGURATION
// ============================================================================

const SAFEGUARDS = {
  maxRulesPerFile: 500,
  maxConditionsPerRule: 20,
  maxMessageLength: 500,
  maxRationaleLength: 1000,
};

// ============================================================================
// VALID FEATURE FLAGS
// ============================================================================

const VALID_FEATURE_FLAGS = [
  // Full environment variable names
  'VALIDATION_PHASE13_ENABLED',
  'VALIDATION_PHASE13_ROLLOUT_PERCENT',
  'VALIDATION_SMART_ENABLED',
  'VALIDATION_ENHANCED_MESSAGES',
  'VALIDATION_SHADOW_MODE',
  'VALIDATION_STRICT_MODE',
  'VALIDATION_DEBUG_MODE',
  // Shorthand identifiers used in YAML
  'phase13',
  'smart',
  'enhanced_messages',
  'shadow_mode',
  'strict_mode',
  'debug_mode',
];

// ============================================================================
// RULE FILES TO LINT
// ============================================================================

const RULE_FILES = [
  { path: 'config/legal-requirements/england/notice_only_rules.yaml', jurisdiction: 'england', product: 'notice_only' },
  { path: 'config/legal-requirements/wales/notice_only_rules.yaml', jurisdiction: 'wales', product: 'notice_only' },
  { path: 'config/legal-requirements/scotland/notice_only_rules.yaml', jurisdiction: 'scotland', product: 'notice_only' },
  { path: 'config/legal-requirements/england/complete_pack_rules.yaml', jurisdiction: 'england', product: 'complete_pack' },
];

const MESSAGE_CATALOG_PATH = 'config/validation/phase13-messages.yaml';

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

function loadMessageCatalog(): MessageCatalog | null {
  const fullPath = path.join(process.cwd(), MESSAGE_CATALOG_PATH);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    return yaml.load(content) as MessageCatalog;
  } catch {
    return null;
  }
}

function getAllMessageRuleIds(catalog: MessageCatalog): Set<string> {
  const ruleIds = new Set<string>();
  const sections = [
    catalog.england_s21,
    catalog.england_s8,
    catalog.wales_s173,
    catalog.scotland_ntl,
  ];
  for (const section of sections) {
    if (section) {
      for (const ruleId of Object.keys(section)) {
        ruleIds.add(ruleId);
      }
    }
  }
  return ruleIds;
}

// ============================================================================
// LINTING FUNCTIONS
// ============================================================================

function lintRuleFile(filePath: string, messageCatalogRuleIds: Set<string>): LintIssue[] {
  const issues: LintIssue[] = [];
  const fullPath = path.join(process.cwd(), filePath);

  // Check file exists
  if (!fs.existsSync(fullPath)) {
    issues.push({
      severity: 'error',
      category: 'schema',
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
      category: 'schema',
      file: filePath,
      message: `YAML parse error: ${error.message}`,
    });
    return issues;
  }

  // ========================================================================
  // SCHEMA VALIDATION
  // ========================================================================

  // Check required top-level fields
  if (!config.version) {
    issues.push({
      severity: 'warning',
      category: 'schema',
      file: filePath,
      message: 'Missing "version" field',
    });
  }
  if (!config.jurisdiction) {
    issues.push({
      severity: 'error',
      category: 'schema',
      file: filePath,
      message: 'Missing "jurisdiction" field',
    });
  }
  if (!config.product) {
    issues.push({
      severity: 'error',
      category: 'schema',
      file: filePath,
      message: 'Missing "product" field',
    });
  }

  // Get all rules
  const allRules = getAllRules(config);
  const ruleIds = new Set<string>();

  // ========================================================================
  // PHASE 17 SAFEGUARD: Max rules per file
  // ========================================================================

  if (allRules.length > SAFEGUARDS.maxRulesPerFile) {
    issues.push({
      severity: 'error',
      category: 'safeguard',
      file: filePath,
      message: `Rule count (${allRules.length}) exceeds maximum allowed (${SAFEGUARDS.maxRulesPerFile})`,
    });
  }

  // ========================================================================
  // PER-RULE VALIDATION
  // ========================================================================

  for (const rule of allRules) {
    // Check required fields
    for (const field of REQUIRED_RULE_FIELDS) {
      if (!(field in rule) || rule[field as keyof ValidationRule] === undefined) {
        issues.push({
          severity: 'error',
          category: 'schema',
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
          category: 'schema',
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
        category: 'schema',
        file: filePath,
        ruleId: rule.id,
        message: `Invalid severity "${rule.severity}". Must be one of: ${VALID_SEVERITIES.join(', ')}`,
      });
    }

    // Check applies_to is array
    if (rule.applies_to && !Array.isArray(rule.applies_to)) {
      issues.push({
        severity: 'error',
        category: 'schema',
        file: filePath,
        ruleId: rule.id,
        message: `"applies_to" must be an array`,
      });
    }

    // ========================================================================
    // PHASE 17 SAFEGUARD: Max conditions per rule
    // ========================================================================

    if (rule.applies_when && Array.isArray(rule.applies_when)) {
      if (rule.applies_when.length > SAFEGUARDS.maxConditionsPerRule) {
        issues.push({
          severity: 'error',
          category: 'safeguard',
          file: filePath,
          ruleId: rule.id,
          message: `Condition count (${rule.applies_when.length}) exceeds maximum allowed (${SAFEGUARDS.maxConditionsPerRule})`,
        });
      }

      // ========================================================================
      // CONDITION ALLOWLIST VALIDATION
      // ========================================================================

      for (let i = 0; i < rule.applies_when.length; i++) {
        const condObj = rule.applies_when[i];
        if (condObj.condition) {
          const validation = validateEvictionCondition(condObj.condition);
          if (!validation.valid) {
            issues.push({
              severity: 'error',
              category: 'condition',
              file: filePath,
              ruleId: rule.id,
              message: `Invalid condition [${i}]: ${validation.reason}`,
            });
          }
        } else {
          issues.push({
            severity: 'error',
            category: 'schema',
            file: filePath,
            ruleId: rule.id,
            message: `applies_when[${i}] missing "condition" key`,
          });
        }
      }
    }

    // ========================================================================
    // FEATURE FLAG VALIDATION
    // ========================================================================

    if (rule.requires_feature) {
      if (!VALID_FEATURE_FLAGS.includes(rule.requires_feature)) {
        issues.push({
          severity: 'error',
          category: 'feature',
          file: filePath,
          ruleId: rule.id,
          message: `Invalid requires_feature: "${rule.requires_feature}". Valid flags: ${VALID_FEATURE_FLAGS.join(', ')}`,
        });
      }
    }

    // ========================================================================
    // MESSAGE LENGTH SAFEGUARDS
    // ========================================================================

    if (rule.message && rule.message.length > SAFEGUARDS.maxMessageLength) {
      issues.push({
        severity: 'warning',
        category: 'safeguard',
        file: filePath,
        ruleId: rule.id,
        message: `Message length (${rule.message.length}) exceeds recommended maximum (${SAFEGUARDS.maxMessageLength})`,
      });
    }

    if (rule.rationale && rule.rationale.length > SAFEGUARDS.maxRationaleLength) {
      issues.push({
        severity: 'warning',
        category: 'safeguard',
        file: filePath,
        ruleId: rule.id,
        message: `Rationale length (${rule.rationale.length}) exceeds recommended maximum (${SAFEGUARDS.maxRationaleLength})`,
      });
    }

    // ========================================================================
    // PHASE 16 MESSAGE COVERAGE CHECK
    // ========================================================================

    // Check if Phase 13 rules have message coverage
    if (rule.id && PHASE_13_RULE_IDS.includes(rule.id)) {
      if (!messageCatalogRuleIds.has(rule.id)) {
        issues.push({
          severity: 'error',
          category: 'message',
          file: filePath,
          ruleId: rule.id,
          message: `Phase 13 rule missing UX message in phase13-messages.yaml`,
        });
      }
    }
  }

  // ========================================================================
  // SUMMARY SECTION VALIDATION
  // ========================================================================

  if (config.summary?.sections) {
    for (const section of config.summary.sections) {
      if (!section.id) {
        issues.push({
          severity: 'warning',
          category: 'schema',
          file: filePath,
          message: `Summary section missing "id" field`,
        });
      }
      if (!section.label) {
        issues.push({
          severity: 'warning',
          category: 'schema',
          file: filePath,
          message: `Summary section "${section.id}" missing "label" field`,
        });
      }
      if (section.rules) {
        for (const ruleRef of section.rules) {
          if (!ruleIds.has(ruleRef)) {
            issues.push({
              severity: 'error',
              category: 'schema',
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

function lintMessageCatalog(): LintIssue[] {
  const issues: LintIssue[] = [];
  const fullPath = path.join(process.cwd(), MESSAGE_CATALOG_PATH);

  if (!fs.existsSync(fullPath)) {
    issues.push({
      severity: 'warning',
      category: 'message',
      file: MESSAGE_CATALOG_PATH,
      message: 'Phase 13 message catalog not found',
    });
    return issues;
  }

  let catalog: MessageCatalog;
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    catalog = yaml.load(content) as MessageCatalog;
  } catch (error: any) {
    issues.push({
      severity: 'error',
      category: 'schema',
      file: MESSAGE_CATALOG_PATH,
      message: `YAML parse error: ${error.message}`,
    });
    return issues;
  }

  // Check required catalog fields
  if (!catalog.version) {
    issues.push({
      severity: 'warning',
      category: 'schema',
      file: MESSAGE_CATALOG_PATH,
      message: 'Missing "version" field in message catalog',
    });
  }

  // Validate each message entry
  const sections = [
    { name: 'england_s21', data: catalog.england_s21 },
    { name: 'england_s8', data: catalog.england_s8 },
    { name: 'wales_s173', data: catalog.wales_s173 },
    { name: 'scotland_ntl', data: catalog.scotland_ntl },
  ];

  for (const { name: sectionName, data: section } of sections) {
    if (!section) continue;

    for (const [ruleId, message] of Object.entries(section)) {
      const requiredFields = ['title', 'description', 'howToFix', 'legalRef', 'helpLink', 'supportTags'];
      for (const field of requiredFields) {
        if (!(field in message)) {
          issues.push({
            severity: 'error',
            category: 'message',
            file: MESSAGE_CATALOG_PATH,
            ruleId: ruleId,
            message: `Missing required field "${field}" in ${sectionName}.${ruleId}`,
          });
        }
      }

      // Check howToFix is an array
      if (message.howToFix && !Array.isArray(message.howToFix)) {
        issues.push({
          severity: 'error',
          category: 'schema',
          file: MESSAGE_CATALOG_PATH,
          ruleId: ruleId,
          message: `"howToFix" must be an array in ${sectionName}.${ruleId}`,
        });
      }

      // Check supportTags is an array
      if (message.supportTags && !Array.isArray(message.supportTags)) {
        issues.push({
          severity: 'error',
          category: 'schema',
          file: MESSAGE_CATALOG_PATH,
          ruleId: ruleId,
          message: `"supportTags" must be an array in ${sectionName}.${ruleId}`,
        });
      }
    }
  }

  return issues;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport(
  fileResults: Array<{
    file: string;
    rules: number;
    issues: LintIssue[];
  }>,
  catalogIssues: LintIssue[]
): void {
  const totalIssues = fileResults.reduce((sum, r) => sum + r.issues.length, 0) + catalogIssues.length;
  const errorCount =
    fileResults.reduce((sum, r) => sum + r.issues.filter((i) => i.severity === 'error').length, 0) +
    catalogIssues.filter((i) => i.severity === 'error').length;
  const warningCount =
    fileResults.reduce((sum, r) => sum + r.issues.filter((i) => i.severity === 'warning').length, 0) +
    catalogIssues.filter((i) => i.severity === 'warning').length;

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         VALIDATION RULES LINTER (Phase 18)                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Per-file results
  for (const result of fileResults) {
    const shortPath = result.file.split('/').pop() || result.file;
    const errors = result.issues.filter((i) => i.severity === 'error').length;
    const warnings = result.issues.filter((i) => i.severity === 'warning').length;

    if (result.issues.length === 0) {
      console.log(`✅ ${shortPath} (${result.rules} rules)`);
    } else {
      console.log(`\n📄 ${shortPath} (${result.rules} rules)`);
      console.log(`   ${errors} error(s), ${warnings} warning(s)\n`);

      // Group issues by category
      const byCategory = new Map<string, LintIssue[]>();
      for (const issue of result.issues) {
        const existing = byCategory.get(issue.category) || [];
        existing.push(issue);
        byCategory.set(issue.category, existing);
      }

      for (const [category, categoryIssues] of byCategory) {
        console.log(`   [${category.toUpperCase()}]`);
        for (const issue of categoryIssues) {
          const emoji = issue.severity === 'error' ? '❌' : '⚠️ ';
          const ruleInfo = issue.ruleId ? ` (${issue.ruleId})` : '';
          console.log(`      ${emoji}${ruleInfo} ${issue.message}`);
        }
      }
    }
  }

  // Message catalog results
  if (catalogIssues.length > 0) {
    console.log(`\n📄 ${MESSAGE_CATALOG_PATH}`);
    console.log(`   ${catalogIssues.filter((i) => i.severity === 'error').length} error(s), ${catalogIssues.filter((i) => i.severity === 'warning').length} warning(s)\n`);
    for (const issue of catalogIssues) {
      const emoji = issue.severity === 'error' ? '❌' : '⚠️ ';
      const ruleInfo = issue.ruleId ? ` (${issue.ruleId})` : '';
      console.log(`      ${emoji}${ruleInfo} ${issue.message}`);
    }
  } else {
    console.log(`✅ ${MESSAGE_CATALOG_PATH}`);
  }

  // Summary table
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         LINT SUMMARY                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│ Check                              │ Status                      │');
  console.log('├──────────────────────────────────────────────────────────────────┤');

  // Count issues by category
  const allIssues = [...fileResults.flatMap((r) => r.issues), ...catalogIssues];
  const schemaErrors = allIssues.filter((i) => i.category === 'schema' && i.severity === 'error').length;
  const safeguardErrors = allIssues.filter((i) => i.category === 'safeguard' && i.severity === 'error').length;
  const featureErrors = allIssues.filter((i) => i.category === 'feature' && i.severity === 'error').length;
  const messageErrors = allIssues.filter((i) => i.category === 'message' && i.severity === 'error').length;
  const conditionErrors = allIssues.filter((i) => i.category === 'condition' && i.severity === 'error').length;

  const checks = [
    { name: 'YAML Schema & Required Fields', errors: schemaErrors },
    { name: 'Phase 17 Safeguards', errors: safeguardErrors },
    { name: 'Feature Flag Validation', errors: featureErrors },
    { name: 'Phase 16 Message Coverage', errors: messageErrors },
    { name: 'Condition Allowlist', errors: conditionErrors },
  ];

  for (const check of checks) {
    const status = check.errors === 0 ? '✅ PASS' : `❌ ${check.errors} error(s)`;
    const paddedName = check.name.padEnd(35);
    const paddedStatus = status.padEnd(27);
    console.log(`│ ${paddedName} │ ${paddedStatus} │`);
  }

  console.log('└──────────────────────────────────────────────────────────────────┘\n');

  const totalRules = fileResults.reduce((sum, r) => sum + r.rules, 0);
  console.log(`Total rules linted: ${totalRules}`);
  console.log(`Total issues: ${totalIssues} (${errorCount} errors, ${warningCount} warnings)\n`);

  // Exit status
  if (errorCount > 0) {
    console.log('❌ LINT FAILED: Fix the errors above before proceeding.\n');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠️  LINT PASSED WITH WARNINGS\n');
    process.exit(0);
  } else {
    console.log('✅ LINT PASSED: All validation rules are valid.\n');
    process.exit(0);
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  // Load message catalog for coverage checking
  const messageCatalog = loadMessageCatalog();
  const messageCatalogRuleIds = messageCatalog ? getAllMessageRuleIds(messageCatalog) : new Set<string>();

  // Lint message catalog
  const catalogIssues = lintMessageCatalog();

  // Lint each rule file
  const fileResults: Array<{
    file: string;
    rules: number;
    issues: LintIssue[];
  }> = [];

  for (const { path: filePath } of RULE_FILES) {
    const issues = lintRuleFile(filePath, messageCatalogRuleIds);

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

    fileResults.push({
      file: filePath,
      rules: ruleCount,
      issues,
    });
  }

  // Generate report
  generateReport(fileResults, catalogIssues);
}

main();
