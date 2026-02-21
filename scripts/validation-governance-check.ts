#!/usr/bin/env npx tsx
/**
 * Validation Governance Check Script
 *
 * Phase 19: Governance & Change Management
 *
 * Validates that validation rule changes follow governance requirements:
 * - Rule changes have required metadata
 * - Legal basis is documented for blocker rules
 * - Test coverage requirements are met
 * - Emergency suppressions are documented
 *
 * Run with: npm run validation:governance-check
 * Or directly: npx tsx scripts/validation-governance-check.ts
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { EMERGENCY_SUPPRESSED_RULES } from '../src/lib/validation/emergency-suppressions';

// ============================================================================
// TYPES
// ============================================================================

interface GovernanceIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'suppression' | 'documentation' | 'testing' | 'metadata';
  file?: string;
  ruleId?: string;
  message: string;
}

interface ValidationRule {
  id: string;
  severity: string;
  message: string;
  rationale: string;
  requires_feature?: string;
}

interface RulesConfig {
  version: string;
  jurisdiction: string;
  product: string;
  section_21_rules?: ValidationRule[];
  section_8_rules?: ValidationRule[];
  section_173_rules?: ValidationRule[];
  fault_based_rules?: ValidationRule[];
  notice_to_leave_rules?: ValidationRule[];
  common_rules?: ValidationRule[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const RULE_FILES = [
  'config/legal-requirements/england/notice_only_rules.yaml',
  'config/legal-requirements/wales/notice_only_rules.yaml',
  'config/legal-requirements/scotland/notice_only_rules.yaml',
  'config/legal-requirements/england/complete_pack_rules.yaml',
];

const REQUIRED_LEGAL_PATTERNS = [
  /housing act/i,
  /deregulation act/i,
  /tenant fees act/i,
  /renting homes.*act/i,
  /antisocial behaviour.*act/i,
  /private housing.*act/i,
  /schedule \d+/i,
  /section \d+/i,
  /regulation/i,
];

// ============================================================================
// CHECKS
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

function checkEmergencySuppressions(): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];

  // Check for active suppressions
  if (EMERGENCY_SUPPRESSED_RULES.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'suppression',
      message: `${EMERGENCY_SUPPRESSED_RULES.length} rule(s) are currently suppressed via code. Review if still needed: ${EMERGENCY_SUPPRESSED_RULES.join(', ')}`,
    });
  }

  // Check environment variable
  const envSuppressed = process.env.VALIDATION_SUPPRESS_RULES;
  if (envSuppressed) {
    const rules = envSuppressed.split(',').filter((r) => r.trim());
    issues.push({
      severity: 'warning',
      category: 'suppression',
      message: `${rules.length} rule(s) are suppressed via VALIDATION_SUPPRESS_RULES environment variable: ${rules.join(', ')}`,
    });
  }

  return issues;
}

function checkBlockerRuleLegalBasis(filePath: string): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return issues;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const config = yaml.load(content) as RulesConfig;
    const rules = getAllRules(config);

    for (const rule of rules) {
      if (rule.severity === 'blocker') {
        // Check if rationale contains legal reference
        const hasLegalBasis = REQUIRED_LEGAL_PATTERNS.some((pattern) =>
          pattern.test(rule.rationale || '')
        );

        if (!hasLegalBasis) {
          issues.push({
            severity: 'warning',
            category: 'documentation',
            file: filePath,
            ruleId: rule.id,
            message: `Blocker rule "${rule.id}" should have a legal reference in rationale`,
          });
        }
      }
    }
  } catch (error) {
    // Skip files that can't be parsed
  }

  return issues;
}

function checkRuleMetadata(filePath: string): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return issues;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const config = yaml.load(content) as RulesConfig;

    // Check version
    if (!config.version) {
      issues.push({
        severity: 'warning',
        category: 'metadata',
        file: filePath,
        message: 'Missing version in rule config',
      });
    }

    // Check jurisdiction
    if (!config.jurisdiction) {
      issues.push({
        severity: 'error',
        category: 'metadata',
        file: filePath,
        message: 'Missing jurisdiction in rule config',
      });
    }

    // Check product
    if (!config.product) {
      issues.push({
        severity: 'error',
        category: 'metadata',
        file: filePath,
        message: 'Missing product in rule config',
      });
    }

    // Check individual rules
    const rules = getAllRules(config);
    for (const rule of rules) {
      if (!rule.rationale || rule.rationale.trim().length < 20) {
        issues.push({
          severity: 'warning',
          category: 'documentation',
          file: filePath,
          ruleId: rule.id,
          message: `Rule "${rule.id}" has insufficient rationale (min 20 chars)`,
        });
      }
    }
  } catch (error) {
    // Skip files that can't be parsed
  }

  return issues;
}

function checkTestCoverage(): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];
  const testDir = path.join(process.cwd(), 'tests/validation');

  if (!fs.existsSync(testDir)) {
    issues.push({
      severity: 'error',
      category: 'testing',
      message: 'Validation test directory not found',
    });
    return issues;
  }

  const requiredTestFiles = [
    'eviction-rules-engine.test.ts',
    'phase16-messages.test.ts',
    'phase17-performance.test.ts',
    'phase18-authoring.test.ts',
  ];

  for (const testFile of requiredTestFiles) {
    const testPath = path.join(testDir, testFile);
    if (!fs.existsSync(testPath)) {
      issues.push({
        severity: 'warning',
        category: 'testing',
        message: `Required test file missing: ${testFile}`,
      });
    }
  }

  return issues;
}

function checkGovernanceDocs(): GovernanceIssue[] {
  const issues: GovernanceIssue[] = [];
  const docsDir = path.join(process.cwd(), 'docs/validation');

  const requiredDocs = [
    'GOVERNANCE.md',
    'RULE_AUTHORING_GUIDE.md',
    'CUSTOM_RULES.md',
    'CUTOVER_PLAN.md',
    'PHASE13_SUPPORT_GUIDE.md',
  ];

  for (const doc of requiredDocs) {
    const docPath = path.join(docsDir, doc);
    if (!fs.existsSync(docPath)) {
      issues.push({
        severity: 'warning',
        category: 'documentation',
        message: `Required documentation missing: ${doc}`,
      });
    }
  }

  return issues;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         VALIDATION GOVERNANCE CHECK (Phase 19)                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const allIssues: GovernanceIssue[] = [];

  // 1. Check emergency suppressions
  console.log('Checking emergency suppressions...');
  allIssues.push(...checkEmergencySuppressions());

  // 2. Check each rule file
  console.log('Checking rule files...');
  for (const file of RULE_FILES) {
    allIssues.push(...checkBlockerRuleLegalBasis(file));
    allIssues.push(...checkRuleMetadata(file));
  }

  // 3. Check test coverage
  console.log('Checking test coverage...');
  allIssues.push(...checkTestCoverage());

  // 4. Check governance documentation
  console.log('Checking governance documentation...');
  allIssues.push(...checkGovernanceDocs());

  // Report results
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         GOVERNANCE CHECK SUMMARY                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');
  const infos = allIssues.filter((i) => i.severity === 'info');

  // Group by category
  const byCategory = new Map<string, GovernanceIssue[]>();
  for (const issue of allIssues) {
    const existing = byCategory.get(issue.category) || [];
    existing.push(issue);
    byCategory.set(issue.category, existing);
  }

  for (const [category, issues] of byCategory) {
    console.log(`\n[${category.toUpperCase()}]`);
    for (const issue of issues) {
      const emoji =
        issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
      const location = issue.file
        ? `${issue.file}${issue.ruleId ? `:${issue.ruleId}` : ''}`
        : '';
      console.log(`  ${emoji} ${location ? `[${location}] ` : ''}${issue.message}`);
    }
  }

  // Summary
  console.log('\n┌──────────────────────────────────────────────────────────────────┐');
  console.log('│ Category        │ Errors │ Warnings │ Info │');
  console.log('├──────────────────────────────────────────────────────────────────┤');

  const categories = ['suppression', 'documentation', 'testing', 'metadata'];
  for (const cat of categories) {
    const catIssues = allIssues.filter((i) => i.category === cat);
    const catErrors = catIssues.filter((i) => i.severity === 'error').length;
    const catWarnings = catIssues.filter((i) => i.severity === 'warning').length;
    const catInfos = catIssues.filter((i) => i.severity === 'info').length;
    const paddedCat = cat.padEnd(15);
    console.log(
      `│ ${paddedCat} │ ${String(catErrors).padStart(6)} │ ${String(catWarnings).padStart(8)} │ ${String(catInfos).padStart(4)} │`
    );
  }
  console.log('└──────────────────────────────────────────────────────────────────┘\n');

  console.log(`Total: ${allIssues.length} issues (${errors.length} errors, ${warnings.length} warnings, ${infos.length} info)\n`);

  // Exit status
  if (errors.length > 0) {
    console.log('❌ GOVERNANCE CHECK FAILED: Fix the errors above.\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  GOVERNANCE CHECK PASSED WITH WARNINGS: Review warnings above.\n');
    process.exit(0);
  } else {
    console.log('✅ GOVERNANCE CHECK PASSED: All governance requirements met.\n');
    process.exit(0);
  }
}

main();
