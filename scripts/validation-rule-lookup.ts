#!/usr/bin/env npx tsx
/**
 * Validation Rule Lookup Tool
 *
 * Phase 20: Support & Ops Self-Service
 *
 * Allows non-engineers to look up rule details including:
 * - Rule meaning and description
 * - Legal basis
 * - How to fix steps
 * - Escalation path
 * - Phase 13+ status
 * - Tenant override status
 * - Emergency suppression status
 *
 * Run with: npm run validation:rule-lookup <rule_id>
 * Or directly: npx tsx scripts/validation-rule-lookup.ts <rule_id>
 *
 * Options:
 *   --json     Output as JSON
 *   --list     List all known rules
 *   --search   Search rules by keyword
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  getPhase13Message,
  getAllPhase13Messages,
  getSupportCategory,
  PHASE_13_RULE_IDS,
} from '../src/lib/validation/phase13-messages';
import { isRuleSuppressed, getSuppressedRules } from '../src/lib/validation/emergency-suppressions';
import { getTenantContext, findRuleOverride } from '../src/lib/validation/rule-targeting';

// ============================================================================
// TYPES
// ============================================================================

interface RuleInfo {
  rule_id: string;
  found: boolean;

  // Basic info (from YAML rules)
  severity?: string;
  message?: string;
  rationale?: string;
  field?: string;
  applies_to?: string[];
  requires_feature?: string;

  // Enhanced info (from Phase 13 messages)
  title?: string;
  description?: string;
  how_to_fix?: string[];
  legal_ref?: string;
  help_url?: string;
  support_tags?: string[];

  // Support info
  support_category?: string;
  escalation_priority?: string;
  typical_resolution?: string;

  // Status
  is_phase13: boolean;
  is_suppressed: boolean;
  suppression_source?: string;
  is_tenant_overridden: boolean;
  tenant_override_action?: string;

  // Source info
  source_file?: string;
  jurisdiction?: string;
  product?: string;
}

interface YamlRule {
  id: string;
  severity: string;
  message: string;
  rationale: string;
  field?: string;
  applies_to?: string[];
  requires_feature?: string;
  applies_when?: Array<{ condition: string }>;
}

interface RulesConfig {
  version?: string;
  jurisdiction?: string;
  product?: string;
  [key: string]: unknown;
}

// ============================================================================
// RULE DISCOVERY
// ============================================================================

const RULE_FILES = [
  { path: 'config/legal-requirements/england/notice_only_rules.yaml', jurisdiction: 'england', product: 'notice_only' },
  { path: 'config/legal-requirements/england/complete_pack_rules.yaml', jurisdiction: 'england', product: 'complete_pack' },
  { path: 'config/legal-requirements/wales/notice_only_rules.yaml', jurisdiction: 'wales', product: 'notice_only' },
  { path: 'config/legal-requirements/scotland/notice_only_rules.yaml', jurisdiction: 'scotland', product: 'notice_only' },
];

function loadAllRules(): Map<string, { rule: YamlRule; file: string; jurisdiction: string; product: string }> {
  const allRules = new Map<string, { rule: YamlRule; file: string; jurisdiction: string; product: string }>();

  for (const fileInfo of RULE_FILES) {
    const fullPath = path.join(process.cwd(), fileInfo.path);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const config = yaml.load(content) as RulesConfig;

      // Find all rule arrays in the config
      for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value) && key.endsWith('_rules')) {
          for (const rule of value as YamlRule[]) {
            if (rule && rule.id) {
              allRules.set(rule.id, {
                rule,
                file: fileInfo.path,
                jurisdiction: fileInfo.jurisdiction,
                product: fileInfo.product,
              });
            }
          }
        }
      }
    } catch {
      // Skip files that can't be parsed
    }
  }

  return allRules;
}

// ============================================================================
// RULE LOOKUP
// ============================================================================

function lookupRule(ruleId: string): RuleInfo {
  const allRules = loadAllRules();
  const ruleData = allRules.get(ruleId);
  const phase13Message = getPhase13Message(ruleId);
  const supportCategory = getSupportCategory(ruleId);
  const suppressed = isRuleSuppressed(ruleId);
  const suppressedRules = getSuppressedRules();
  const suppressionInfo = suppressedRules.find(r => r.ruleId === ruleId);
  const tenantContext = getTenantContext();
  const tenantOverride = findRuleOverride(ruleId);

  const isPhase13 = (PHASE_13_RULE_IDS as readonly string[]).includes(ruleId);

  const info: RuleInfo = {
    rule_id: ruleId,
    found: !!ruleData || !!phase13Message,
    is_phase13: isPhase13,
    is_suppressed: suppressed,
    is_tenant_overridden: !!tenantOverride,
  };

  // Add YAML rule info
  if (ruleData) {
    info.severity = ruleData.rule.severity;
    info.message = ruleData.rule.message;
    info.rationale = ruleData.rule.rationale;
    info.field = ruleData.rule.field;
    info.applies_to = ruleData.rule.applies_to;
    info.requires_feature = ruleData.rule.requires_feature;
    info.source_file = ruleData.file;
    info.jurisdiction = ruleData.jurisdiction;
    info.product = ruleData.product;
  }

  // Add Phase 13 message info
  if (phase13Message) {
    info.title = phase13Message.title;
    info.description = phase13Message.description;
    info.how_to_fix = phase13Message.howToFix;
    info.legal_ref = phase13Message.legalRef;
    info.help_url = phase13Message.helpUrl;
    info.support_tags = phase13Message.supportTags;
  }

  // Add support category info
  if (supportCategory) {
    info.support_category = supportCategory.category;
    info.escalation_priority = supportCategory.priority;
    info.typical_resolution = supportCategory.typicalResolution;
  }

  // Add suppression info
  if (suppressionInfo) {
    info.suppression_source = suppressionInfo.source;
  }

  // Add tenant override info
  if (tenantOverride) {
    info.tenant_override_action = tenantOverride.action;
  }

  return info;
}

function listAllRules(): Array<{ id: string; severity?: string; jurisdiction?: string; is_phase13: boolean }> {
  const allRules = loadAllRules();
  const phase13Set = new Set(PHASE_13_RULE_IDS);

  return Array.from(allRules.entries()).map(([id, data]) => ({
    id,
    severity: data.rule.severity,
    jurisdiction: data.jurisdiction,
    is_phase13: phase13Set.has(id),
  }));
}

function searchRules(keyword: string): Array<{ id: string; match_field: string; match_text: string }> {
  const allRules = loadAllRules();
  const results: Array<{ id: string; match_field: string; match_text: string }> = [];
  const lowerKeyword = keyword.toLowerCase();

  for (const [id, data] of allRules.entries()) {
    const rule = data.rule;

    // Search in ID
    if (id.toLowerCase().includes(lowerKeyword)) {
      results.push({ id, match_field: 'id', match_text: id });
      continue;
    }

    // Search in message
    if (rule.message && rule.message.toLowerCase().includes(lowerKeyword)) {
      results.push({ id, match_field: 'message', match_text: rule.message.slice(0, 80) });
      continue;
    }

    // Search in rationale
    if (rule.rationale && rule.rationale.toLowerCase().includes(lowerKeyword)) {
      results.push({ id, match_field: 'rationale', match_text: rule.rationale.slice(0, 80) });
      continue;
    }
  }

  // Also search Phase 13 messages
  const phase13Messages = getAllPhase13Messages();
  for (const msg of phase13Messages) {
    if (results.some(r => r.id === msg.ruleId)) continue;

    if (msg.title.toLowerCase().includes(lowerKeyword)) {
      results.push({ id: msg.ruleId, match_field: 'title', match_text: msg.title });
      continue;
    }

    if (msg.description.toLowerCase().includes(lowerKeyword)) {
      results.push({ id: msg.ruleId, match_field: 'description', match_text: msg.description.slice(0, 80) });
      continue;
    }
  }

  return results;
}

// ============================================================================
// FORMATTED OUTPUT
// ============================================================================

function printRuleInfo(info: RuleInfo): void {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        VALIDATION RULE LOOKUP                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  if (!info.found) {
    console.log(`❌ Rule not found: ${info.rule_id}`);
    console.log('');
    console.log('Try:');
    console.log('  --list     List all known rules');
    console.log('  --search   Search rules by keyword');
    console.log('');
    return;
  }

  // Status badges
  const badges: string[] = [];
  if (info.is_phase13) badges.push('🆕 Phase 13');
  if (info.is_suppressed) badges.push('🚫 SUPPRESSED');
  if (info.is_tenant_overridden) badges.push(`🔧 Override: ${info.tenant_override_action}`);

  console.log(`Rule ID: ${info.rule_id}`);
  if (badges.length > 0) {
    console.log(`Status: ${badges.join(' | ')}`);
  }
  console.log('');

  // Basic info
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ RULE DETAILS                                                                 │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');

  if (info.title) {
    console.log(`│ Title: ${info.title.slice(0, 60).padEnd(60)}│`);
  }
  if (info.severity) {
    const severityEmoji = info.severity === 'blocker' ? '🔴' : info.severity === 'warning' ? '🟡' : '🔵';
    console.log(`│ Severity: ${severityEmoji} ${info.severity.padEnd(52)}│`);
  }
  if (info.jurisdiction) {
    console.log(`│ Jurisdiction: ${info.jurisdiction.padEnd(52)}│`);
  }
  if (info.product) {
    console.log(`│ Product: ${info.product.padEnd(57)}│`);
  }
  if (info.requires_feature) {
    console.log(`│ Requires Feature: ${info.requires_feature.padEnd(48)}│`);
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Message
  if (info.message || info.description) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ MESSAGE                                                                      │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    const msg = info.description || info.message || '';
    const lines = wrapText(msg, 72);
    for (const line of lines) {
      console.log(`│ ${line.padEnd(72)}│`);
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // Legal basis
  if (info.legal_ref || info.rationale) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ LEGAL BASIS                                                                  │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    if (info.legal_ref) {
      console.log(`│ Reference: ${info.legal_ref.slice(0, 55).padEnd(55)}│`);
    }
    if (info.rationale) {
      const lines = wrapText(info.rationale, 72);
      for (const line of lines) {
        console.log(`│ ${line.padEnd(72)}│`);
      }
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // How to fix
  if (info.how_to_fix && info.how_to_fix.length > 0) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ HOW TO FIX                                                                   │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    for (let i = 0; i < info.how_to_fix.length; i++) {
      const step = `${i + 1}. ${info.how_to_fix[i]}`;
      const lines = wrapText(step, 72);
      for (const line of lines) {
        console.log(`│ ${line.padEnd(72)}│`);
      }
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // Support info
  if (info.support_category || info.escalation_priority) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ SUPPORT ESCALATION                                                           │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    if (info.support_category) {
      console.log(`│ Category: ${info.support_category.padEnd(56)}│`);
    }
    if (info.escalation_priority) {
      const priorityEmoji = info.escalation_priority === 'high' ? '🔴' : info.escalation_priority === 'medium' ? '🟡' : '🟢';
      console.log(`│ Priority: ${priorityEmoji} ${info.escalation_priority.padEnd(54)}│`);
    }
    if (info.typical_resolution) {
      const lines = wrapText(`Resolution: ${info.typical_resolution}`, 72);
      for (const line of lines) {
        console.log(`│ ${line.padEnd(72)}│`);
      }
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // Status details
  if (info.is_suppressed || info.is_tenant_overridden) {
    console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ ⚠️  SPECIAL STATUS                                                           │');
    console.log('├──────────────────────────────────────────────────────────────────────────────┤');
    if (info.is_suppressed) {
      console.log(`│ 🚫 SUPPRESSED via ${(info.suppression_source || 'unknown').padEnd(48)}│`);
      console.log('│    This rule will not be evaluated until suppression is removed.          │');
    }
    if (info.is_tenant_overridden) {
      console.log(`│ 🔧 TENANT OVERRIDE: ${(info.tenant_override_action || 'unknown').padEnd(46)}│`);
      console.log('│    This rule has been modified for the current tenant.                    │');
    }
    console.log('└──────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // Help link
  if (info.help_url) {
    console.log(`📚 More info: ${info.help_url}`);
    console.log('');
  }

  // Source file
  if (info.source_file) {
    console.log(`📁 Source: ${info.source_file}`);
    console.log('');
  }
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function printRuleList(rules: Array<{ id: string; severity?: string; jurisdiction?: string; is_phase13: boolean }>): void {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        ALL VALIDATION RULES                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Total: ${rules.length} rules\n`);
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Rule ID                              │ Severity │ Jurisdiction │ Phase 13   │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');

  for (const rule of rules.sort((a, b) => a.id.localeCompare(b.id))) {
    const p13 = rule.is_phase13 ? '🆕' : '  ';
    console.log(`│ ${rule.id.padEnd(36)} │ ${(rule.severity || '-').padEnd(8)} │ ${(rule.jurisdiction || '-').padEnd(12)} │ ${p13}         │`);
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
}

function printSearchResults(results: Array<{ id: string; match_field: string; match_text: string }>, keyword: string): void {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        RULE SEARCH RESULTS                                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Search: "${keyword}"`);
  console.log(`Found: ${results.length} rules\n`);

  if (results.length === 0) {
    console.log('No matching rules found.');
    console.log('');
    return;
  }

  for (const result of results) {
    console.log(`• ${result.id}`);
    console.log(`  Match in ${result.match_field}: "${result.match_text}..."`);
    console.log('');
  }

  console.log('Use: npx tsx scripts/validation-rule-lookup.ts <rule_id> for full details');
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const listMode = args.includes('--list');

  // Find search keyword
  const searchIndex = args.indexOf('--search');
  const searchKeyword = searchIndex !== -1 ? args[searchIndex + 1] : null;

  // Find rule ID (first arg that doesn't start with --)
  const ruleId = args.find(a => !a.startsWith('--') && a !== searchKeyword);

  // List mode
  if (listMode) {
    const rules = listAllRules();
    if (jsonOutput) {
      console.log(JSON.stringify(rules, null, 2));
    } else {
      printRuleList(rules);
    }
    return;
  }

  // Search mode
  if (searchKeyword) {
    const results = searchRules(searchKeyword);
    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printSearchResults(results, searchKeyword);
    }
    return;
  }

  // Lookup mode
  if (!ruleId) {
    console.log('Usage:');
    console.log('  npx tsx scripts/validation-rule-lookup.ts <rule_id>    Look up a specific rule');
    console.log('  npx tsx scripts/validation-rule-lookup.ts --list       List all rules');
    console.log('  npx tsx scripts/validation-rule-lookup.ts --search <keyword>  Search rules');
    console.log('');
    console.log('Options:');
    console.log('  --json    Output as JSON');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx scripts/validation-rule-lookup.ts s21_deposit_not_protected');
    console.log('  npx tsx scripts/validation-rule-lookup.ts --search deposit');
    console.log('  npx tsx scripts/validation-rule-lookup.ts --list --json');
    process.exit(0);
  }

  const info = lookupRule(ruleId);

  if (jsonOutput) {
    console.log(JSON.stringify(info, null, 2));
  } else {
    printRuleInfo(info);
  }
}

main();
