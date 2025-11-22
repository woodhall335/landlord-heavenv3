/**
 * Decision Engine Config Loader
 *
 * Loads and parses decision rules from YAML configuration files
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { DecisionRule, GroundDefinition } from './types';

// ============================================================================
// TYPES FOR YAML STRUCTURE
// ============================================================================

interface DecisionRulesYAML {
  section_8_grounds: {
    mandatory: Record<string, any>;
    discretionary: Record<string, any>;
  };
  section_21: {
    eligibility_requirements: Record<string, any>;
    red_flags: Array<{ name: string; severity: string; consequence: string }>;
  };
  notice_periods: Record<string, any>;
  court_procedures: Record<string, any>;
  hmo_licensing: Record<string, any>;
  compliance: Record<string, any>;
  typical_timelines: Record<string, any>;
}

interface DecisionEngineYAML {
  rules: DecisionRule[];
  red_flags: Record<string, any>;
  success_factors: Record<string, any>;
  timelines: Record<string, any>;
  costs: Record<string, any>;
}

// ============================================================================
// CONFIG CACHE
// ============================================================================

const configCache = new Map<string, any>();

// ============================================================================
// LOADERS
// ============================================================================

/**
 * Load decision rules for a jurisdiction
 */
export function loadDecisionRules(jurisdiction: string): DecisionRulesYAML {
  const cacheKey = `decision_rules_${jurisdiction}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }

  const filePath = join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    jurisdiction,
    'decision_rules.yaml'
  );

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const parsed = yaml.load(fileContent) as DecisionRulesYAML;
    configCache.set(cacheKey, parsed);
    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to load decision rules for ${jurisdiction}: ${error.message}`);
  }
}

/**
 * Load decision engine rules for a jurisdiction
 */
export function loadDecisionEngine(jurisdiction: string): DecisionEngineYAML {
  const cacheKey = `decision_engine_${jurisdiction}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }

  const filePath = join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    jurisdiction,
    'rules',
    'decision_engine.yaml'
  );

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const parsed = yaml.load(fileContent) as DecisionEngineYAML;
    configCache.set(cacheKey, parsed);
    return parsed;
  } catch (error: any) {
    throw new Error(`Failed to load decision engine for ${jurisdiction}: ${error.message}`);
  }
}

/**
 * Get ground definitions from decision rules
 */
export function getGroundDefinitions(jurisdiction: string): Map<number, GroundDefinition> {
  const rules = loadDecisionRules(jurisdiction);
  const groundMap = new Map<number, GroundDefinition>();

  // Mandatory grounds
  if (rules.section_8_grounds?.mandatory) {
    Object.entries(rules.section_8_grounds.mandatory).forEach(([key, value]: [string, any]) => {
      const groundNumber = parseInt(key.replace('ground_', ''));
      if (!isNaN(groundNumber)) {
        groundMap.set(groundNumber, {
          title: value.title,
          notice_period_days: value.notice_period_days,
          court_type: 'mandatory',
          description: value.description,
          required_facts: value.required_facts || [],
          eligibility_rules: value.eligibility_rules || [],
          success_probability: value.success_probability || 90,
          statute: value.statute || `Housing Act 1988, Schedule 2, Ground ${groundNumber}`,
          notes: value.notes,
        });
      }
    });
  }

  // Discretionary grounds
  if (rules.section_8_grounds?.discretionary) {
    Object.entries(rules.section_8_grounds.discretionary).forEach(([key, value]: [string, any]) => {
      const groundNumber = parseInt(key.replace('ground_', ''));
      if (!isNaN(groundNumber)) {
        groundMap.set(groundNumber, {
          title: value.title,
          notice_period_days: value.notice_period_days,
          court_type: 'discretionary',
          description: value.description,
          required_facts: value.required_facts || [],
          eligibility_rules: value.eligibility_rules || [],
          success_probability: value.success_probability || 70,
          statute: value.statute || `Housing Act 1988, Schedule 2, Ground ${groundNumber}`,
          notes: value.notes,
        });
      }
    });
  }

  return groundMap;
}

/**
 * Get Section 21 requirements
 */
export function getSection21Requirements(jurisdiction: string) {
  const rules = loadDecisionRules(jurisdiction);
  return rules.section_21?.eligibility_requirements || {};
}

/**
 * Get Section 21 red flags
 */
export function getSection21RedFlags(jurisdiction: string) {
  const rules = loadDecisionRules(jurisdiction);
  return rules.section_21?.red_flags || [];
}

/**
 * Get typical timelines
 */
export function getTypicalTimelines(jurisdiction: string) {
  const rules = loadDecisionRules(jurisdiction);
  return rules.typical_timelines || {};
}

/**
 * Get cost estimates
 */
export function getCostEstimates(jurisdiction: string) {
  const engine = loadDecisionEngine(jurisdiction);
  return engine.costs || {};
}

/**
 * Clear config cache (useful for testing)
 */
export function clearConfigCache() {
  configCache.clear();
}
