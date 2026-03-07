/**
 * Phase 13 Message Catalog Loader
 *
 * Provides enhanced user-facing content for Phase 13 validation rules including:
 * - Standardized titles and descriptions
 * - Step-by-step resolution guidance
 * - Legal references and help links
 * - Support escalation tags
 *
 * Part of Phase 16: UX Messaging + Help Content + Support Readiness
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// ============================================================================
// TYPES
// ============================================================================

export interface Phase13Message {
  title: string;
  description: string;
  howToFix: string[];
  legalRef: string;
  helpLink: string;
  supportTags: string[];
}

interface MessageCatalogSection {
  [ruleId: string]: Phase13Message;
}

interface SupportCategory {
  rules: string[];
  escalation_priority: 'low' | 'medium' | 'high';
  typical_resolution: string;
}

interface HelpConfig {
  base_url: string;
  support_email: string;
  support_phone: string;
}

interface MessageCatalog {
  version: string;
  last_updated: string;
  england_s21: MessageCatalogSection;
  england_s8: MessageCatalogSection;
  wales_s173: MessageCatalogSection;
  scotland_ntl: MessageCatalogSection;
  help_config: HelpConfig;
  support_categories: Record<string, SupportCategory>;
}

export interface EnhancedValidationMessage {
  ruleId: string;
  title: string;
  description: string;
  howToFix: string[];
  legalRef: string;
  helpUrl: string;
  supportTags: string[];
}

// ============================================================================
// CATALOG LOADING
// ============================================================================

let cachedCatalog: MessageCatalog | null = null;

/**
 * Phase 17: Pre-built flat index for O(1) message lookup
 * Maps ruleId directly to Phase13Message
 */
let flatMessageIndex: Map<string, Phase13Message> | null = null;

/**
 * Phase 17: Pre-built support category index for O(1) lookup
 * Maps ruleId to category info
 */
let supportCategoryIndex: Map<string, { category: string; priority: 'low' | 'medium' | 'high'; typicalResolution: string }> | null = null;

/**
 * Load the Phase 13 message catalog from YAML
 */
function loadMessageCatalog(): MessageCatalog {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const catalogPath = path.join(
    process.cwd(),
    'config/validation/phase13-messages.yaml'
  );

  try {
    const content = fs.readFileSync(catalogPath, 'utf8');
    cachedCatalog = yaml.load(content) as MessageCatalog;

    // Phase 17: Build flat indexes on load for O(1) lookup
    buildFlatIndexes(cachedCatalog);

    return cachedCatalog;
  } catch (error) {
    // Return minimal default if catalog cannot be loaded
    console.warn('Phase 13 message catalog not found, using defaults');
    return {
      version: '1.0',
      last_updated: new Date().toISOString().split('T')[0],
      england_s21: {},
      england_s8: {},
      wales_s173: {},
      scotland_ntl: {},
      help_config: {
        base_url: '',
        support_email: '',
        support_phone: '',
      },
      support_categories: {},
    };
  }
}

/**
 * Phase 17: Build flat indexes from catalog for O(1) lookups
 */
function buildFlatIndexes(catalog: MessageCatalog): void {
  // Build message index
  flatMessageIndex = new Map<string, Phase13Message>();

  const sections = [
    catalog.england_s21,
    catalog.england_s8,
    catalog.wales_s173,
    catalog.scotland_ntl,
  ];

  for (const section of sections) {
    if (section) {
      for (const [ruleId, message] of Object.entries(section)) {
        flatMessageIndex.set(ruleId, message);
      }
    }
  }

  // Build support category index
  supportCategoryIndex = new Map();

  if (catalog.support_categories) {
    for (const [categoryName, category] of Object.entries(catalog.support_categories)) {
      for (const ruleId of category.rules) {
        supportCategoryIndex.set(ruleId, {
          category: categoryName,
          priority: category.escalation_priority,
          typicalResolution: category.typical_resolution,
        });
      }
    }
  }
}

/**
 * Clear the cached catalog (for testing)
 */
export function clearMessageCatalogCache(): void {
  cachedCatalog = null;
  flatMessageIndex = null;
  supportCategoryIndex = null;
}

// ============================================================================
// MESSAGE RETRIEVAL
// ============================================================================

/**
 * Get the section for a rule ID based on its prefix
 * @deprecated Phase 17: Use flatMessageIndex for O(1) lookup instead
 */
function getSectionForRule(ruleId: string, catalog: MessageCatalog): MessageCatalogSection | null {
  if (ruleId.startsWith('s21_')) {
    return catalog.england_s21;
  }
  if (ruleId.startsWith('s8_')) {
    return catalog.england_s8;
  }
  if (ruleId.startsWith('s173_')) {
    return catalog.wales_s173;
  }
  if (ruleId.startsWith('ntl_')) {
    return catalog.scotland_ntl;
  }
  return null;
}

/**
 * Get enhanced message for a Phase 13 rule
 * Returns null if the rule is not a Phase 13 rule or message not found
 *
 * Phase 17: Uses O(1) flat index lookup for performance
 */
export function getPhase13Message(ruleId: string): EnhancedValidationMessage | null {
  // Ensure catalog is loaded and indexes are built
  const catalog = loadMessageCatalog();

  // Phase 17: O(1) lookup via flat index
  if (!flatMessageIndex) {
    return null;
  }

  const message = flatMessageIndex.get(ruleId);
  if (!message) {
    return null;
  }

  const baseUrl = catalog.help_config?.base_url || '';

  return {
    ruleId,
    title: message.title,
    description: message.description.trim(),
    howToFix: message.howToFix,
    legalRef: message.legalRef,
    helpUrl: baseUrl + message.helpLink,
    supportTags: message.supportTags,
  };
}

/**
 * Get all Phase 13 messages
 */
export function getAllPhase13Messages(): EnhancedValidationMessage[] {
  const catalog = loadMessageCatalog();
  const messages: EnhancedValidationMessage[] = [];

  const sections = [
    catalog.england_s21,
    catalog.england_s8,
    catalog.wales_s173,
    catalog.scotland_ntl,
  ];

  for (const section of sections) {
    for (const ruleId of Object.keys(section)) {
      const message = getPhase13Message(ruleId);
      if (message) {
        messages.push(message);
      }
    }
  }

  return messages;
}

/**
 * Get help configuration
 */
export function getHelpConfig(): HelpConfig {
  const catalog = loadMessageCatalog();
  return catalog.help_config;
}

/**
 * Get support category for a rule
 */
/**
 * Get support category for a rule
 *
 * Phase 17: Uses O(1) pre-built index lookup for performance
 */
export function getSupportCategory(ruleId: string): {
  category: string;
  priority: 'low' | 'medium' | 'high';
  typicalResolution: string;
} | null {
  // Ensure catalog is loaded and indexes are built
  loadMessageCatalog();

  // Phase 17: O(1) lookup via pre-built index
  if (!supportCategoryIndex) {
    return null;
  }

  return supportCategoryIndex.get(ruleId) || null;
}

// ============================================================================
// PHASE 13 RULE LIST
// ============================================================================

/**
 * List of all Phase 13 rule IDs
 * This is the canonical list - keep in sync with PHASE_13_RULE_IDS in shadow-mode-adapter.ts
 */
export const PHASE_13_RULE_IDS: readonly string[] = [
  // England S21
  's21_deposit_cap_exceeded',
  's21_four_month_bar',
  's21_notice_period_short',
  's21_licensing_required_not_licensed',
  's21_retaliatory_improvement_notice',
  's21_retaliatory_emergency_action',
  // England S8
  's8_notice_period_short',
  // Wales S173
  's173_notice_period_short',
  's173_deposit_not_protected',
  's173_written_statement_missing',
  // Scotland NTL
  'ntl_landlord_not_registered',
  'ntl_pre_action_letter_not_sent',
  'ntl_pre_action_signposting_missing',
  'ntl_ground_1_arrears_threshold',
  'ntl_deposit_not_protected',
] as const;

/**
 * Check if a rule is a Phase 13 rule
 */
export function isPhase13RuleId(ruleId: string): boolean {
  return (PHASE_13_RULE_IDS as readonly string[]).includes(ruleId);
}

// ============================================================================
// VALIDATION RESPONSE ENHANCEMENT
// ============================================================================

export interface ValidationIssueWithHelp {
  ruleId: string;
  severity: 'blocker' | 'warning' | 'suggestion';
  message: string;
  field?: string;
  // Enhanced fields from Phase 16
  title?: string;
  howToFix?: string[];
  legalRef?: string;
  helpUrl?: string;
}

/**
 * Enhance a validation issue with Phase 13 message details
 */
export function enhanceValidationIssue(issue: {
  ruleId: string;
  severity: 'blocker' | 'warning' | 'suggestion';
  message: string;
  field?: string;
}): ValidationIssueWithHelp {
  const phase13Message = getPhase13Message(issue.ruleId);

  if (!phase13Message) {
    return issue;
  }

  return {
    ...issue,
    title: phase13Message.title,
    howToFix: phase13Message.howToFix,
    legalRef: phase13Message.legalRef,
    helpUrl: phase13Message.helpUrl,
  };
}

/**
 * Enhance multiple validation issues
 */
export function enhanceValidationIssues(
  issues: Array<{
    ruleId: string;
    severity: 'blocker' | 'warning' | 'suggestion';
    message: string;
    field?: string;
  }>
): ValidationIssueWithHelp[] {
  return issues.map(enhanceValidationIssue);
}
